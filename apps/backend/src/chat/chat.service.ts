import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ChatLlmService } from '../ai/chat-llm.service.js';
import { RagService } from './rag.service.js';
import { conversations, messages } from '@studymate/db';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ChatService {
  constructor(
    private db: DatabaseService,
    private llm: ChatLlmService,
    private rag: RagService,
  ) {}

  async createConversation(title: string, userId: string, documentIds?: string[]) {
    const id = crypto.randomUUID();
    await this.db.db!.insert(conversations).values({
      id,
      userId,
      title,
      documentIds: documentIds ?? [],
    });
    return { id, title };
  }

  async listConversations(userId: string, limit = 20, offset = 0) {
    return this.db.db!.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: (c, { desc }) => [desc(c.lastMessageAt)],
      limit,
      offset,
    });
  }

  async getConversation(id: string, userId: string) {
    const conv = await this.db.db!.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException();

    const msgs = await this.db.db!.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    return { ...conv, messages: msgs };
  }

  async deleteConversation(id: string, userId: string) {
    const conv = await this.db.db!.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException();

    await this.db.db!.delete(conversations).where(eq(conversations.id, id));
    return { deleted: true };
  }

  async streamMessage(
    conversationId: string,
    content: string,
    userId: string,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const conv = await this.getConversation(conversationId, userId);
    const docIds = conv.documentIds as string[] | undefined;

    const contextChunks = await this.rag.search(content, docIds);

    const recentMessages = await this.db.db!.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
      limit: 20,
    });

    const history = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add current user message to history so the LLM actually sees it!
    history.push({ role: 'user', content });

    const sources = contextChunks.map((c) => ({
      chunkId: c.id,
      documentId: c.documentId,
      documentTitle: c.heading ?? 'Untitled',
      snippet: c.content.slice(0, 200),
    }));

    const fullResponse: string[] = [];

    for await (const token of this.llm.streamChat(
      history,
      contextChunks.map((c) => c.content),
      signal,
    )) {
      fullResponse.push(token);
      onToken(token);
    }

    if (signal?.aborted) return '';

    const responseText = fullResponse.join('');

    await this.db.db!.transaction(async (tx) => {
      await tx.insert(messages).values({
        id: crypto.randomUUID(),
        conversationId,
        role: 'user',
        content,
      });

      await tx.insert(messages).values({
        id: crypto.randomUUID(),
        conversationId,
        role: 'assistant',
        content: responseText,
        citations: sources,
      });

      await tx
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));
    });

    return responseText;
  }
}
