'use server';

/**
 * @fileOverview نظام استخراج بيانات الاختبارات باستخدام Genkit و Gemini.
 * يقوم بتحليل صورة ورقة الامتحان واستخراج (رقم القيد، اسم الطالب) بدقة.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string().describe("صورة ورقة الامتحان كـ Data URI (Base64)"),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج"),
  studentName: z.string().optional().describe("اسم الطالب المستخرج"),
  subjectName: z.string().optional().describe("اسم المادة الدراسية"),
});

export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

/**
 * تعريف الـ Flow الخاص باستخراج البيانات
 */
export const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    const prompt = `أنت خبير في أرشفة الوثائق الأكاديمية العربية. 
    قم بتحليل صورة ورقة الامتحان المرفقة واستخرج البيانات التالية بدقة شديدة:
    1. رقم القيد الجامعي (Registration ID): ابحث عن أي أرقام تعريفية أو أكاديمية للطالب.
    2. اسم الطالب (Student Name): استخرج الاسم الرباعي المكتوب بخط اليد أو المطبوع.
    3. اسم المادة (Subject Name): استخرج اسم المادة الدراسية المكتوبة في ترويسة الورقة.

    يجب أن تكون المخرجات بصيغة JSON فقط. إذا لم تجد بياناً، اترك الحقل فارغاً.`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: prompt },
        { media: { url: input.examImageDataUri } }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const output = response.output;
    if (!output) {
      throw new Error('لم يتمكن الذكاء الاصطناعي من توليد استجابة صحيحة.');
    }

    return output as ExtractExamDetailsOutput;
  }
);

/**
 * غلاف لاستدعاء الـ Flow من واجهات الـ Client أو الـ API
 */
export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  try {
    return await extractExamDetailsFlow(input);
  } catch (error: any) {
    console.error('--- [Genkit Flow Error] ---', error);
    throw new Error(error.message || 'فشل في تحليل الصورة عبر Genkit');
  }
}
