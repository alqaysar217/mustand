
'use server';

/**
 * @fileOverview محرك استخراج البيانات المطور والمستقر تماماً.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string().describe("صورة ورقة الامتحان كـ Data URI (Base64)"),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج"),
  studentName: z.string().optional().describe("اسم الطالب المستخرج"),
});

export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

export const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    const promptText = `أنت خبير أرشفة أكاديمية. حلل صورة ورقة الامتحان واستخرج:
    1. studentRegistrationId: استخرج الأرقام فقط (مثلاً: 2021001).
    2. studentName: الاسم الكامل المكتوب بوضوح.

    أجب بصيغة JSON فقط:
    {
      "studentRegistrationId": "رقم القيد",
      "studentName": "الاسم الكامل"
    }`;

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash', // تأكد من استخدام هذا المسمى المستقر
        prompt: [
          { text: promptText },
          { media: { url: input.examImageDataUri } }
        ],
        config: {
          responseMimeType: 'application/json',
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
          ]
        }
      });

      const output = response.output;
      if (!output) {
        throw new Error('لم يتمكن المحرك من قراءة بيانات الورقة.');
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Flow Error:', error);
      throw new Error(`خطأ Gemini: ${error.message || 'مشكلة في الاتصال بالخدمة'}`);
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
