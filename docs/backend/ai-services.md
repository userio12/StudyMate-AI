# AI Services

## Overview

All AI interactions go through the `AiModule` which provides a centralized set of services wrapping an OpenAI-compatible SDK shim that acts as a fallback orchestrator across multiple AI providers (OpenRouter, Gemini, NVIDIA).

## Module Structure

```text
ai/
├── ai.module.ts                    # @Global() — exports all services
├── ai.service.ts                   # OpenAI client orchestrator (fallback logic)
├── embeddings.service.ts           # text-embedding-004 wrapper (via Gemini compat endpoint)
├── chat-llm.service.ts             # Chat streaming w/ SSE & Citations
├── quiz-generator.service.ts       # MCQ generation w/ JSON mode
└── pdf-processor.service.ts        # Text extraction + chunking
```

## AI Service Orchestrator (Fallback Logic)

Instead of relying on a single provider, `AiService` initializes multiple `OpenAI` clients pointing to different base URLs to ensure high availability.

```typescript
// ai/ai.service.ts
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
      });
    }

    if (geminiKey) {
      this.geminiClient = new OpenAI({
        apiKey: geminiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
    }

    if (nvidiaKey) {
      this.nvidiaClient = new OpenAI({
        apiKey: nvidiaKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
    }
  }

  async executeWithFallback<T>(
    operation: (client: OpenAI, provider: string) => Promise<T>,
    context: string = 'AI Operation',
    preferredProvider?: 'OpenRouter' | 'Gemini' | 'NVIDIA'
  ): Promise<T> {
    // Logic to iterate over configured providers and fallback on errors
    // ...
  }
}
```

## Embeddings Service

Embeddings are specifically routed to Google Gemini's `text-embedding-004` model because of its cost-efficiency and performance.

```typescript
// ai/embeddings.service.ts
@Injectable()
export class EmbeddingsService {
  constructor(private ai: AiService) {}

  async embed(text: string): Promise<number[]> {
    if (!this.ai.geminiClient) throw new Error('GEMINI_API_KEY is missing.');

    const result = await this.ai.geminiClient.embeddings.create({
      model: 'text-embedding-004',
      input: text,
      dimensions: 768,
    });

    return result.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // Handles parallel processing in batches of 100
    // ...
  }
}
```

## Chat LLM Service (RAG & SSE)

```typescript
// ai/chat-llm.service.ts
@Injectable()
export class ChatLlmService {
  constructor(private ai: AiService) {}

  async *streamChat(
    messages: { role: string; content: string }[],
    contextChunks: { content: string; pageNumber: number }[],
    onCitation: (citation: Citation) => void,
  ): AsyncGenerator<string> {
    // Uses fallback orchestrator
    const stream = await this.ai.executeWithFallback(async (client) => {
      return client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: buildSystemPrompt(contextChunks) },
          ...messages
        ],
        stream: true,
        temperature: 0.3,
      });
    });

    // Processes stream, yields tokens, parses citations
    // ...
  }
}
```

## Quiz Generator Service

```typescript
// ai/quiz-generator.service.ts
@Injectable()
export class QuizGeneratorService {
  constructor(private ai: AiService) {}

  async generateQuiz(chunks: Chunk[], count: number, difficulty: string) {
    const response = await this.ai.executeWithFallback(async (client) => {
      return client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
    });
    
    // Parses and validates JSON response
    // ...
  }
}
```

## PDF Processor Service

Uses `pdf-parse` for text extraction, and processes lines incrementally to group them by semantic headings.

## Model Selection Guide

| Use Case | Model | Temperature | Why |
|---|---|---|---|
| **Embeddings** | `text-embedding-004` (Gemini) | N/A | 768-dim, fast, cheap |
| **RAG Chat** | `gemini-2.0-flash-001` | 0.3 | Low temp for factual accuracy, fast streaming |
| **Quiz Generation** | `gemini-2.0-flash-001` | 0.7 | Higher temp for creative question diversity |
| **Summarization** | `gemini-2.0-flash-001` | 0.3 | Factual, structured summaries |
