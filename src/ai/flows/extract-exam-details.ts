
'use server';
/**
 * @fileOverview This flow extracts student registration ID and name from an uploaded exam image using AI-powered OCR.
 * Optimized for speed and precision using Gemini 1.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z
    .string()
    .describe(
      "A photo of an exam paper, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z
    .string()
    .describe('The extracted student registration ID (numbers only).'),
  studentName: z.string().describe('The extracted full name of the student (Arabic).'),
});
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

const extractExamDetailsPrompt = ai.definePrompt({
  name: 'extractExamDetailsPrompt',
  input: {schema: ExtractExamDetailsInputSchema},
  output: {schema: ExtractExamDetailsOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `أنت خبير في قراءة وتحليل ترويسة أوراق الامتحانات الجامعية العربية.
مهمتك هي استخراج بيانات الطالب من الصورة المرفقة بدقة عالية.

البيانات المطلوبة:
1. رقم القيد: ابحث عن حقل يسمى "رقم القيد" أو "رقم الجلوس" أو أي رقم تسلسلي فريد للطالب. استخرج الأرقام فقط (مثلاً: 221011506).
2. اسم الطالب: استخرج الاسم الكامل (غالباً رباعي) المكتوب بوضوح في أعلى الورقة.

قواعد الاستخراج:
- ركز على الجزء العلوي من الورقة (Header) حيث توجد البيانات الرسمية.
- إذا كان الخط يدوياً، حاول قراءته بأفضل شكل ممكن.
- أعد النتيجة بصيغة JSON مطابقة للمخطط المطلوب.
- إذا لم تجد رقم القيد، ابحث عن أي رقم يتكون من 7 إلى 10 خانات.

صورة الورقة: {{media url=examImageDataUri}}`,
});

const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    try {
      const response = await extractExamDetailsPrompt(input);
      const output = response.output;
      
      if (!output) {
        throw new Error('MODEL_RETURNED_EMPTY_OUTPUT');
      }

      // تنظيف رقم القيد برمجياً للتأكد من خلوه من الرموز
      const cleanRegId = output.studentRegistrationId?.replace(/\D/g, '') || '';
      
      return {
        studentRegistrationId: cleanRegId,
        studentName: output.studentName?.trim() || ''
      };
    } catch (error: any) {
      console.error('OCR AI Flow Error:', error);
      throw new Error('AI_ANALYSIS_FAILED');
    }
  }
);

export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}
