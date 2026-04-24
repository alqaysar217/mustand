
'use server';

/**
 * @fileOverview محرك استخراج البيانات المطور ليطابق نجاح اختبار curl.
 * تم ضبطه ليعمل بأقصى درجات الاستقرار مع Gemini 1.5 Flash.
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
      // استخدام الموديل gemini-1.5-flash المتوافق مع المفتاح المجاني
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
        throw new Error('لم يتمكن المحرك من استخراج بيانات الورقة. يرجى التأكد من وضوح الصورة ومطابقة المفتاح للمشروع.');
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Flow Technical Error:', error);
      throw new Error(`خطأ تقني: ${error.message || 'فشل الاتصال بمحرك Gemini'}`);
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
