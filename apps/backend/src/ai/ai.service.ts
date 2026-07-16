import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  
  public openRouterClient!: OpenAI;
  public geminiClient!: OpenAI;
  public nvidiaClient!: OpenAI;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    const nvidiaKey = this.configService.get<string>('NVIDIA_API_KEY');

    if (openRouterKey) {
      this.openRouterClient = new OpenAI({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        timeout: 20000,
      });
    }

    if (geminiKey) {
      this.geminiClient = new OpenAI({
        apiKey: geminiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        timeout: 20000,
      });
    }

    if (nvidiaKey) {
      this.nvidiaClient = new OpenAI({
        apiKey: nvidiaKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
        timeout: 20000,
      });
    }
  }

  /**
   * Executes an AI operation with fallback logic.
   * Order of precedence: OpenRouter -> Gemini -> NVIDIA.
   */
  async executeWithFallback<T>(
    operation: (client: OpenAI, provider: string) => Promise<T>,
    context: string = 'AI Operation',
    preferredProvider?: 'OpenRouter' | 'Gemini' | 'NVIDIA'
  ): Promise<T> {
    let providers = [
      { name: 'OpenRouter', client: this.openRouterClient },
      { name: 'Gemini', client: this.geminiClient },
      { name: 'NVIDIA', client: this.nvidiaClient },
    ].filter(p => p.client !== undefined);

    if (preferredProvider) {
      providers = providers.sort((a, b) => {
        if (a.name === preferredProvider) return -1;
        if (b.name === preferredProvider) return 1;
        return 0;
      });
    }

    if (providers.length === 0) {
      throw new Error('No AI providers configured. Please check your API keys.');
    }

    for (const provider of providers) {
      try {
        this.logger.debug(`[${context}] Attempting with ${provider.name}...`);
        const result = await operation(provider.client, provider.name);
        return result;
      } catch (error: any) {
        this.logger.warn(`[${context}] ${provider.name} failed: ${error.message}`);
      }
    }

    throw new Error(`[${context}] All AI providers failed.`);
  }
}
