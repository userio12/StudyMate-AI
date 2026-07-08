import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { CHAT_MODEL } from '@studymate/shared';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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

    const payloadMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    ];

    // Fallback logic implemented via AiService
    const stream = await this.ai.executeWithFallback(async (client, providerName) => {
      let modelToUse: string = CHAT_MODEL;
      if (providerName === 'OpenRouter') {
        modelToUse = CHAT_MODEL;
      } else if (providerName === 'Gemini') {
        modelToUse = 'gemini-2.5-flash'; // fallback specific model for gemini
      } else if (providerName === 'NVIDIA') {
        modelToUse = 'meta/llama-3.1-8b-instruct'; // fallback specific model for nvidia
      }

      console.log(`[ChatLlmService] Starting chat stream using provider: ${providerName}, model: ${modelToUse}`);

      return client.chat.completions.create(
        {
          model: modelToUse,
          messages: payloadMessages,
          stream: true,
        },
        { signal: combinedSignal }
      );
    }, 'Stream Chat', 'OpenRouter');

    let streamYielded = false;
    for await (const chunk of stream) {
      if (combinedSignal.aborted) return;
      try {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          if (!streamYielded) {
             console.log(`[ChatLlmService] Successfully receiving first chunk from stream`);
             streamYielded = true;
          }
          yield text;
        }
      } catch (error) {
        console.error('[ChatLlmService] Stream error:', error);
      }
    }
    console.log(`[ChatLlmService] Chat stream completed successfully.`);
  }
}
