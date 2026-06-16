# AI Services

## Overview

All AI interactions go through the `AiModule` which provides a centralized set of services wrapping the Google Gemini API.

## Module Structure

```
ai/
├── ai.module.ts                    # @Global() — exports all services
├── ai.service.ts                   # Gemini client factory
├── embeddings.service.ts           # text-embedding-004 wrapper
├── chat-llm.service.ts             # Gemini chat streaming
├── quiz-generator.service.ts       # MCQ generation prompt + parsing
└── pdf-processor.service.ts        # Text extraction + chunking
```

## Gemini Client Factory

```typescript
// ai/ai.service.ts
@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  getEmbeddingModel(): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
  }

  getChatModel(): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,     // Low temperature for factual answers
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }

  getQuizModel(): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,     // Higher temperature for creative question writing
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    });
  }
}
```

## Embeddings Service

```typescript
// ai/embeddings.service.ts
@Injectable()
export class EmbeddingsService {
  constructor(private ai: AiService) {}

  async embedText(text: string): Promise<number[]> {
    const model = this.ai.getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // Process in parallel with concurrency limit
    const concurrency = 5;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += concurrency) {
      const batch = texts.slice(i, i + concurrency);
      const embeddings = await Promise.all(
        batch.map(text => this.embedText(text))
      );
      results.push(...embeddings);
    }

    return results;
  }
}
```

**Model details:**
- Model: `text-embedding-004`
- Output dimension: 768
- Max input tokens per request: 2048
- Pricing: $0.0001 per 1K characters

## Chat LLM Service

```typescript
// ai/chat-llm.service.ts
@Injectable()
export class ChatLlmService {
  constructor(private ai: AiService) {}

  async streamChat(
    prompt: string,
    onToken: (token: string) => void,
    onCitation: (citation: Citation) => void,
  ): Promise<{ content: string; citations: Citation[] }> {
    const model = this.ai.getChatModel();
    const result = await model.generateContentStream(prompt);

    let content = '';
    const seenCitations = new Set<number>();

    for await (const chunk of result.stream) {
      const text = chunk.text();
      content += text;
      onToken(text);

      // Extract and emit citations as they appear
      const citations = this.extractCitations(content);
      for (const citation of citations) {
        if (!seenCitations.has(citation.index)) {
          seenCitations.add(citation.index);
          onCitation(citation);
        }
      }
    }

    return {
      content,
      citations: Array.from(seenCitations).map(i => ({
        index: i,
        pageNumber: mockPages[i], // mapped from context
        excerpt: mockExcerpts[i],
      })),
    };
  }

  private extractCitations(content: string): { index: number }[] {
    const regex = /\[citation:(\d+)\]/g;
    const citations: { index: number }[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      citations.push({ index: parseInt(match[1]) });
    }
    return citations;
  }
}
```

**System prompt template for RAG:**
```
You are a helpful AI tutor for students. Your role is to answer questions
based EXCLUSIVELY on the provided course material.

Rules:
1. Only answer using the context provided below.
2. If the context doesn't contain the answer, say:
   "I couldn't find this information in your course material."
3. Cite sources using [citation:INDEX] after each claim.
4. Use markdown formatting for clarity (bold, lists, code blocks).
5. If the question is unclear, ask for clarification.
6. Be concise but thorough. Explain concepts step by step.

Context:
[citation:0] (Page 42) [Chapter 3: Neural Networks]
The backpropagation algorithm uses the chain rule...

[citation:1] (Page 43) [3.1: Gradient Computation]
Each weight is updated proportionally to...

Question: {user_query}

Answer (with citations):
```

## Quiz Generator Service

```typescript
// ai/quiz-generator.service.ts
@Injectable()
export class QuizGeneratorService {
  constructor(private ai: AiService) {}

  async generateQuiz(
    chunks: { content: string; id: string }[],
    questionCount: number,
    difficulty: string,
  ): Promise<GeneratedQuestion[]> {
    const model = this.ai.getQuizModel();

    const prompt = this.buildQuizPrompt(chunks, questionCount, difficulty);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return this.parseQuizResponse(text, chunks);
  }

  private buildQuizPrompt(
    chunks: { content: string }[],
    count: number,
    difficulty: string,
  ): string {
    // Random sample chunks to ensure topic diversity
    const sampled = this.sampleChunks(chunks, Math.min(count * 3, chunks.length));

    const material = sampled
      .map((c, i) => `[Chunk ${i}]\n${c.content}`)
      .join('\n\n');

    return `
Generate ${count} multiple-choice questions based on this course material.

DIFFICULTY: ${difficulty}
  - easy: basic recall questions
  - medium: comprehension and application
  - hard: analysis and synthesis

RULES:
1. Each question must have EXACTLY 4 options (A, B, C, D).
2. Only ONE option should be correct.
3. Provide a clear explanation for the correct answer.
4. Questions should cover different topics from the material.
5. Avoid trivial or "obvious" questions.

COURSE MATERIAL:
${material}

Respond with a JSON array only (no markdown, no explanation):
[
  {
    "question": "Question text here?",
    "options": [
      { "label": "A", "text": "Option A" },
      { "label": "B", "text": "Option B" },
      { "label": "C", "text": "Option C" },
      { "label": "D", "text": "Option D" }
    ],
    "correctAnswer": "A",
    "explanation": "Explanation text",
    "sourceChunkIndex": 0
  }
]`;
  }

  private parseQuizResponse(
    text: string,
    chunks: { id: string }[],
  ): GeneratedQuestion[] {
    // Extract JSON from response (handle markdown code fences)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz generation response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate each question
    for (const q of questions) {
      if (q.options.length !== 4) {
        throw new Error(`Question has ${q.options.length} options, expected 4`);
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        throw new Error(`Invalid correct answer: ${q.correctAnswer}`);
      }
    }

    // Map source chunk indices to actual chunk IDs
    return questions.map((q: any) => ({
      ...q,
      sourceChunkId: chunks[q.sourceChunkIndex]?.id || null,
    }));
  }

  private sampleChunks<T>(chunks: T[], count: number): T[] {
    const shuffled = [...chunks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
```

## PDF Processor Service

```typescript
// ai/pdf-processor.service.ts
@Injectable()
export class PdfProcessorService {
  async extractText(buffer: Buffer): Promise<Page[]> {
    const data = await pdfParse(buffer);
    return data.pages.map((page, i) => ({
      pageNumber: i + 1,
      text: page.text,
    }));
  }

  semanticChunk(pages: Page[]): RawChunk[] {
    const chunks: RawChunk[] = [];
    let buffer = '';
    let currentHeading = '';
    let startPage = 0;

    for (const page of pages) {
      const lines = page.text.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (this.isHeading(trimmed)) {
          // Flush previous buffer
          if (buffer.length > 50) {
            chunks.push({
              content: buffer,
              heading: currentHeading,
              pageNumber: startPage,
            });
          }
          currentHeading = trimmed;
          buffer = trimmed + '\n';
          startPage = page.pageNumber;
        } else {
          buffer += trimmed + '\n';
        }

        // Hard token limit with overlap
        if (this.tokenCount(buffer) > 512) {
          chunks.push({
            content: buffer,
            heading: currentHeading,
            pageNumber: startPage,
          });
          // Keep last 10% for overlap
          buffer = buffer.slice(-50);
        }
      }
    }

    // Final chunk
    if (buffer.length > 50) {
      chunks.push({
        content: buffer,
        heading: currentHeading,
        pageNumber: startPage,
      });
    }

    return chunks;
  }

  private isHeading(line: string): boolean {
    return /^(#|##|###|Chapter|Section|\d+\.\d+)/.test(line) ||
      (line.length < 100 && line === line.toUpperCase().trim()) ||
      (line.length < 100 && /^[A-Z][a-z]+ [A-Z][a-z]/.test(line));
  }

  private tokenCount(text: string): number {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
```

## Model Selection Guide

| Use Case | Model | Temperature | Why |
|---|---|---|---|
| **Embeddings** | `text-embedding-004` | N/A | 768-dim, fast, cheap |
| **RAG Chat** | `gemini-2.0-flash` | 0.3 | Low temp for factual accuracy, fast streaming |
| **Quiz Generation** | `gemini-2.0-flash` | 0.7 | Higher temp for creative question diversity |
| **Summarization** | `gemini-2.0-flash` | 0.3 | Factual, structured summaries |
| **Future: Vision** | `gemini-2.0-flash-vision` | 0.3 | For scanned PDF/image analysis |

## Error Handling & Retry

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

// Usage:
const embedding = await withRetry(() => this.embeddingsService.embedText(text));
```
