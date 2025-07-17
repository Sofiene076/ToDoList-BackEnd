import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GeminiResponse } from './entities/geminiResponse';
import { task } from './entities/task';

@Injectable()
export class GeminiService {
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly API_KEY = process.env.GEMINI_API_KEY;

  async generateToDoList(paragraph: string): Promise<task[]> {
    const prompt = `
Turn the following paragraph into a list of tasks.
Each task must be a JSON object with:
- "title": short description of the task
- "status": one of "todo", "in-progress", or "done"

Paragraph:
"""${paragraph}"""

Return ONLY a JSON array of task objects, no explanation or formatting.`;

    try {
      const response = await axios.post<GeminiResponse>(
        `${this.API_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      console.log('Raw Gemini output:', rawText);
      const cleanJson = this.extractJson(rawText);

      try {
        const tasks = JSON.parse(cleanJson) as task[];

        // const tasks = JSON.parse(rawText) as task[];
        return tasks;
      } catch (parseErr) {
        console.error('❌ Failed to parse Gemini output:', rawText, parseErr);
        throw new Error('Gemini returned invalid JSON');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Gemini API error:',
          error.response?.data || error.message,
        );
      } else {
        console.error('Unknown error:', error);
      }
      throw new Error('Failed to generate tasks');
    }
  }
  private extractJson(rawText: string): string {
    const match = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
    if (match) {
      return match[1].trim(); // returns just the inner JSON string
    }
    return rawText.trim(); // fallback if no ```json``` block exists
  }
}
