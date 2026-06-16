import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CHAT_MODEL, DEFAULT_QUIZ_QUESTION_COUNT } from '@studymate/shared';
import { sql } from 'drizzle-orm';

interface GeneratedQuestion {
  question: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  sourceChunkId?: string;
}

@Injectable()
export class QuizGeneratorService {
  constructor(
    private ai: AiService,
    private db: DatabaseService,
  ) {}

  async generate(
    documentIds: string[],
    difficulty: string,
    questionCount = DEFAULT_QUIZ_QUESTION_COUNT as number,
  ): Promise<GeneratedQuestion[]> {
    const chunks = await this.db.db!.execute<{
      content: string;
      heading: string | null;
      id: string;
    }>(sql`
      SELECT content, heading, id FROM chunks
      WHERE document_id IN (${sql.join(documentIds.map((id) => sql`${id}`), sql`, `)})
      ORDER BY random()
      LIMIT 15
    `);

    if (chunks.length === 0) {
      throw new Error('No content available to generate quiz');
    }

    const context = chunks.map((c) => `[${c.heading ?? 'General'}] ${c.content}`).join('\n\n---\n\n');

    const prompt = `You are a quiz generator. Generate exactly ${questionCount} questions based on the provided study material.

Difficulty level: ${difficulty}

Rules:
- Questions must be answerable from the provided material
- Include a mix of multiple choice, true/false, and short answer questions
- Each question must have a clear correct answer
- Provide a brief explanation for each answer
- Mark which chunk each question refers to using its heading

Return valid JSON only with this structure:
{
  "questions": [
    {
      "question": "string",
      "questionType": "multiple_choice | true_false | short_answer",
      "options": ["string"] (only for multiple_choice),
      "correctAnswer": "string",
      "explanation": "string",
      "sourceHeading": "string"
    }
  ]
}

Study material:
${context}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }

      try {
        const result = await this.ai.client.models.generateContent({
          model: CHAT_MODEL,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const text = result.text;
        if (!text) {
          lastError = new Error('No response from Gemini');
          continue;
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          lastError = new Error('Failed to extract JSON from Gemini response');
          continue;
        }

        let parsed: { questions: Record<string, unknown>[] };
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          lastError = new Error('Gemini returned malformed JSON');
          continue;
        }

        if (!Array.isArray(parsed?.questions)) {
          lastError = new Error('Gemini response missing questions array');
          continue;
        }

        return parsed.questions.map((q: Record<string, unknown>) => ({
          question: q.question as string,
          questionType: q.questionType as string,
          options: q.options as string[] | undefined,
          correctAnswer: q.correctAnswer as string,
          explanation: q.explanation as string | undefined,
          sourceChunkId: undefined,
        }));
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error during quiz generation');
      }
    }

    throw lastError ?? new Error('Quiz generation failed after 3 attempts');
  }
}
