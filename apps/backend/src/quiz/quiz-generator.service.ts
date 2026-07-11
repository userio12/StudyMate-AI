import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CHAT_MODEL, DEFAULT_QUIZ_QUESTION_COUNT } from '@studymate/shared';

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

@Injectable()
export class QuizGeneratorService {
  constructor(
    private ai: AiService,
    private db: DatabaseService,
  ) {}

  async generate(
    documentIds: string[],
    difficulty: string = 'intermediate',
    preferredModel: string = CHAT_MODEL,
    count: number = DEFAULT_QUIZ_QUESTION_COUNT,
    adaptiveContext?: string,
    customTopic?: string,
    quizModel?: string,
  ) {
    if (documentIds.length === 0) {
      throw new Error('At least one document ID is required to generate a quiz.');
    }

    const chunksResult = await this.db.db!.query.chunks.findMany({
      where: (chunks, { inArray }) => inArray(chunks.documentId, documentIds),
      limit: 20, 
    });

    if (chunksResult.length === 0) {
      throw new Error('No content found in the specified documents.');
    }

    const context = chunksResult.map((c) => c.content).join('\n\n');

    const prompt = `You are an expert tutor creating a quiz to test a student's comprehension.
Using ONLY the following context from the user's documents, generate ${count} multiple-choice questions.
The difficulty level should be: ${difficulty.toUpperCase()}.
${difficulty === 'advanced' ? 'CRITICAL: Since this is an ADVANCED quiz, questions must be highly challenging, focusing on deep synthesis, edge cases, and complex applications of the material. Do not ask simple definitional questions.' : ''}
${adaptiveContext ? `\nADAPTIVE INSTRUCTION based on user's past performance:\n${adaptiveContext}\n` : ''}
${customTopic ? `\nSPECIAL INSTRUCTION: Generate questions STRICTLY focusing on the following specific topic requested by the user: "${customTopic}". Ignore other concepts in the text unless they are directly related to this topic.\n` : ''}
Context:
${context}

Rules:
1. Questions must be strictly based on the provided context.
2. Each question must have exactly 4 options.
3. Only one option can be correct.
4. Provide a brief explanation for why the answer is correct based on the text.
5. STRICTLY NO REPETITION: Every single question MUST cover a completely different topic, concept, or section of the text. Do not ask about the same fact twice. If you cannot find ${count} unique topics, combine concepts.
6. You MUST return ONLY a valid JSON array of objects, with no markdown formatting, no code blocks, and no extra text.

Format:
{
  "topic": "Machine Learning Fundamentals",
  "questions": [
    {
      "question": "What is the main concept?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 1,
      "explanation": "Option B is correct because the text states..."
    }
  ]
}`;

    let retries = 2;

    while (retries >= 0) {
      try {
        const text = await this.ai.executeWithFallback(async (client, providerName) => {
          let modelToUse: string = CHAT_MODEL;
          if (providerName === 'OpenRouter') {
            modelToUse = quizModel || CHAT_MODEL;
          } else if (providerName === 'Gemini') {
            modelToUse = 'gemini-2.5-flash';
          } else if (providerName === 'NVIDIA') {
            modelToUse = 'meta/llama-3.1-8b-instruct';
          }

          console.log(`[QuizGeneratorService] Requesting quiz from ${providerName} using model ${modelToUse}`);
          const response = await client.chat.completions.create({
            model: modelToUse,
            messages: [{ role: 'user', content: prompt }],
          });
          return response.choices[0]?.message?.content;
        }, 'Generate Quiz', preferredModel as any || 'Gemini');

        if (!text) {
          throw new Error('No response from AI');
        }

        console.log(`[QuizGeneratorService] Received response from Gemini. Parsing JSON...`);
        const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText) as { topic: string; questions: GeneratedQuestion[] };
        
        if (!parsed.topic || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new Error('AI returned empty or invalid response');
        }

        for (const q of parsed.questions) {
          if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
              typeof q.correctOptionIndex !== 'number' || !q.explanation) {
            throw new Error('Invalid question format returned by AI');
          }
        }

        return { topic: parsed.topic, questions: parsed.questions.slice(0, count) };

      } catch (error: any) {
        retries--;
        if (retries < 0) {
          throw new Error(`Failed to generate valid quiz questions: ${error.message}`);
        }
      }
    }
    
    return { topic: 'Unknown Topic', questions: [] };
  }
}
