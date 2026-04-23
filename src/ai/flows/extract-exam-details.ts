
'use server';

/**
 * @fileOverview نظام استخراج بيانات الاختبارات باستخدام Genkit و Gemini.
 * تم تحسين معالجة الأخطاء وإعدادات الأمان لضمان قراءة كافة الأوراق.
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

export const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    const promptText = `أنت خبير في تحليل الوثائق الأكاديمية العربية. 
    قم بتحليل صورة ورقة الامتحان واستخرج منها بدقة:
    1. رقم القيد الجامعي (studentRegistrationId): الأرقام فقط كما تظهر في الورقة.
    2. اسم الطالب (studentName): الاسم الكامل المكتوب بخط اليد أو المطبوع.

    أجب بصيغة JSON فقط بهذا الهيكل:
    {
      "studentRegistrationId": "رقم فقط",
      "studentName": "الاسم الرباعي"
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
          ]
        }
      });

      const output = response.output;
      if (!output) {
        throw new Error('فشل المحرك في توليد بيانات صالحة');
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Flow Error:', error);
      throw new Error(`فشل التحليل الذكي: ${error.message || 'مشكلة في الاتصال بمزود الخدمة'}`);
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
