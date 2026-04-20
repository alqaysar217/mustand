
'use server';
/**
 * @fileOverview This flow extracts student registration ID and name from an uploaded exam image using AI-powered OCR.
 * Optimized for speed and precision.
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
    ],
  },
  prompt: `أنت خبير في قراءة بيانات أوراق الامتحانات الجامعية العربية.
استخرج البيانات التالية بدقة قصوى:

1. رقم القيد (Registration ID): ابحث عن خانة "رقم القيد" أو أي رقم تسلسلي يمثل هوية الطالب. استخرج الأرقام فقط (مثال: 2024001).
2. اسم الطالب الكامل (Student Name): استخرج الاسم الرباعي المكتوب في أعلى الورقة.

قواعد صارمة:
- أعد البيانات بصيغة JSON نظيفة.
- في خانة الرقم، احذف أي نصوص عربية، ضع الأرقام فقط.
- ركز على الترويسة (Header) الخاصة بالورقة.

Image: {{media url=examImageDataUri}}`,
});

const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await extractExamDetailsPrompt(input);
      
      // برمجياً: تنظيف رقم القيد من أي حروف غير رقمية
      const cleanRegId = output?.studentRegistrationId?.replace(/\D/g, '') || '';
      
      return {
        studentRegistrationId: cleanRegId,
        studentName: output?.studentName?.trim() || ''
      };
    } catch (error: any) {
      console.warn('OCR Analysis Failed:', error.message);
      throw new Error('AI_ANALYSIS_FAILED');
    }
  }
);

export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}
