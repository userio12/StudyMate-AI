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
    searchProvider: 'duckduckgo' | 'tavily' | 'off' = 'duckduckgo',
    signal?: AbortSignal,
  ) {
    let webContext = '';
    try {
      const tavilyKey = process.env.TAVILY_API_KEY;
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      
      if (searchProvider !== 'off' && lastUserMsg && lastUserMsg.content.trim().length > 0) {
        if (searchProvider === 'tavily' && tavilyKey) {
          console.log(`[ChatLlmService] Performing Tavily search for: "${lastUserMsg.content}"`);
          const { tavily } = await import('@tavily/core');
          const tvly = tavily({ apiKey: tavilyKey });
          const response = await tvly.search(lastUserMsg.content, {
            searchDepth: 'basic',
            maxResults: 3,
          });
          
          if (response.results && response.results.length > 0) {
            webContext = '\n\nReal-time Web Search Results (Tavily):\n' + response.results.map(r => `[${r.title}](${r.url}): ${r.content}`).join('\n');
          }
        } else {
          console.log(`[ChatLlmService] Performing DuckDuckGo search for: "${lastUserMsg.content}"`);
          const { search, SafeSearchType } = await import('duck-duck-scrape');
          const searchResults = await search(lastUserMsg.content, {
            safeSearch: SafeSearchType.OFF,
          });
          
          if (searchResults.results && searchResults.results.length > 0) {
            const topResults = searchResults.results.slice(0, 3);
            webContext = '\n\nReal-time Web Search Results (DuckDuckGo):\n' + topResults.map(r => `[${r.title}](${r.url}): ${r.description}`).join('\n');
          }
        }
      }
    } catch (err) {
      console.error('[ChatLlmService] Web search error:', err);
    }

    const systemPrompt = `You are StudyMate AI, a highly intelligent and comprehensive study assistant.
Your goal is to provide deeply informative, step-by-step explanations formatted beautifully in Markdown.
Always use bullet points, bold text for key terms, and code blocks where appropriate. Do not give short, lazy answers. 
Answer the user's questions based on the provided document context and real-time web search results (if any).
When you use information from the document context, cite the source.

Document Context:
${contextChunks.join('\n\n')}${webContext}`;

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
