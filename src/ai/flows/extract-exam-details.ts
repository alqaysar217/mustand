
'use server';

/**
 * @fileOverview محرك استخراج البيانات المطور باستخدام Gemini 1.5 Flash.
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
    const promptText = `أنت خبير أرشفة أكاديمية متخصص في تحليل أوراق الامتحانات العربية.
    حلل الصورة واستخرج بدقة متناهية:
    1. studentRegistrationId: استخرج أرقام رقم القيد فقط (مثلاً: 2021100).
    2. studentName: اسم الطالب الكامل المكتوب بخط اليد أو المطبوع.

    أجب بصيغة JSON فقط:
    {
      "studentRegistrationId": "رقم القيد",
      "studentName": "الاسم الكامل"
    }`;

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash', 
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
        throw new Error('لم يتمكن المحرك من قراءة بيانات الورقة، يرجى التأكد من وضوح الصورة.');
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Flow Error:', error);
      throw new Error(`خطأ في التحليل: ${error.message || 'مشكلة في الاتصال بالذكاء الاصطناعي'}`);
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
