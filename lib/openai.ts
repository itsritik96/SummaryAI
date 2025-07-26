import { SUMMARY_SYSTEM_PROMPT } from '@/utils/prompts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummaryFromOpenAI(pdfText: string) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;

    } catch (error: any) {
      if (error?.status === 429) {
        if (attempt < maxRetries - 1) {
          const waitTime = 2000 * (attempt + 1);
          console.warn(`Rate limit hit. Retrying in ${waitTime / 1000}s...`);
          await new Promise(res => setTimeout(res, waitTime));
        } else {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
      } else {
        throw error;
      }
    }
  }
}

