
'use server';

/**
 * @fileOverview نظام استخراج بيانات الاختبارات باستخدام Genkit و Gemini.
 * تم تحسين الـ Prompt لضمان دقة استخراج الأرقام والأسماء العربية.
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
 * تعريف الـ Flow الخاص باستخراج البيانات بـ Prompt محسن لدعم اللغة العربية والتعامل مع الخط اليدوي
 */
export const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    const promptText = `أنت خبير محترف في تحليل الأوراق الأكاديمية العربية. 
    قم بتحليل صورة ورقة الامتحان المرفقة بدقة شديدة واستخرج:
    1. رقم القيد الجامعي (studentRegistrationId): ابحث عن أي أرقام تعريفية (عادة تكون 8 أرقام أو أكثر).
    2. اسم الطالب (studentName): استخرج الاسم الكامل (الثلاثي أو الرباعي) سواء كان مكتوباً بخط اليد أو مطبوعاً.
    3. اسم المادة (subjectName): ابحث عن اسم المادة في ترويسة الورقة.

    يجب أن تكون المخرجات بصيغة JSON حصراً بهذا التنسيق:
    {
      "studentRegistrationId": "الأرقام فقط",
      "studentName": "الاسم الكامل",
      "subjectName": "اسم المادة"
    }
    ملاحظات هامة:
    - إذا وجدت رقم القيد مكتوباً، استخرجه كأرقام فقط بدون حروف.
    - إذا لم تجد بياناً معيناً، اترك الحقل فارغاً "".
    - لا تضف أي شرح أو نصوص خارج الـ JSON.`;

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
        return { studentRegistrationId: "", studentName: "", subjectName: "" };
      }

      return output as ExtractExamDetailsOutput;
    } catch (error: any) {
      console.error('Genkit Generate Error:', error);
      throw error;
    }
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
    throw new Error(error.message || 'فشل محرك الذكاء الاصطناعي في تحليل الورقة.');
  }
}
