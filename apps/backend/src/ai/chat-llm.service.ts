import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { CHAT_MODEL } from '@studymate/shared';

const DEFAULT_TIMEOUT = 60_000;

@Injectable()
export class ChatLlmService {
  constructor(private ai: AiService) {}

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    contextChunks: string[],
    signal?: AbortSignal,
  ) {
    const systemPrompt = `You are StudyMate AI, a helpful study assistant. 
Answer questions based on the provided context. 
When you use information from the context, cite the source.

Context:
${contextChunks.join('\n\n')}`;

    const timeoutSignal = AbortSignal.timeout(DEFAULT_TIMEOUT);
    const combinedSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    const result = await this.ai.client.models.generateContentStream({
      model: CHAT_MODEL,
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: systemPrompt,
        abortSignal: combinedSignal,
      },
    });

    for await (const chunk of result) {
      if (combinedSignal.aborted) return;
      const text = chunk.text;
      if (text) yield text;
    }
  }
}
