
'use server';

/**
 * @fileOverview محرك استخراج البيانات المطور.
 * تم تحسين استقرار النموذج وتعطيل كافة فلاتر الحماية لضمان قراءة كافة المستندات الأكاديمية.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string().describe("صورة ورقة الامتحان كـ Data URI (Base64)"),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج"),
  studentName: z.string().optional().describe("اسم الطالب المستخرج كما هو مكتوب"),
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
    const promptText = `أنت خبير في أرشفة الوثائق الأكاديمية. 
    قم بتحليل صورة ورقة الامتحان واستخرج منها بدقة شديدة:
    1. رقم القيد الجامعي (studentRegistrationId): استخرج الأرقام فقط (مثلاً: 2021001).
    2. اسم الطالب (studentName): الاسم الكامل المكتوب في خانة الاسم.

    أجب بصيغة JSON فقط بهذا الهيكل:
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
        throw new Error('لم يتمكن المحرك من استخراج بيانات واضحة من الصورة');
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Extraction Error:', error);
      // إرسال تفاصيل الخطأ الحقيقية للمساعدة في التشخيص
      throw new Error(`فشل التحليل: ${error.message || 'مشكلة في الاتصال بمحرك Gemini'}`);
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
