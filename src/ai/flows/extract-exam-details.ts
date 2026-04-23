
'use server';

/**
 * @fileOverview نظام استخراج بيانات الاختبارات باستخدام Genkit و Gemini.
 * تم تصحيح مسمى النموذج لضمان التوافق مع API v1.
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
    قم بتحليل صورة ورقة الامتحان واستخرج:
    1. رقم القيد الجامعي (studentRegistrationId): الأرقام فقط.
    2. اسم الطالب (studentName): الاسم الكامل.
    3. اسم المادة (subjectName): من ترويسة الورقة.

    أجب بصيغة JSON فقط:
    {
      "studentRegistrationId": "رقم فقط",
      "studentName": "الاسم الرباعي",
      "subjectName": "اسم المادة"
    }`;

    try {
      const response = await ai.generate({
        // استخدام المسمى المستقر للنموذج لحل مشكلة الـ 404
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
        return { studentRegistrationId: "", studentName: "", subjectName: "" };
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('AI Processing Error:', error);
      throw new Error('فشل النظام في الاتصال بمحرك التحليل. يرجى التحقق من جودة الصورة ومفتاح الـ API.');
    }
  }
);

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return await extractExamDetailsFlow(input);
}
