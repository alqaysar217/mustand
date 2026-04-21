
'use server';
/**
 * @fileOverview نظام استخراج بيانات الامتحانات المطور.
 * تم تحسينه لاستقبال صور مصغرة (Thumbnails) لتجنب أخطاء Timeout و Payload Too Large.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z
    .string()
    .describe(
      "A photo of an exam paper as a data URI (Base64). Optimized small version for OCR."
    ),
});
export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().describe('رقم القيد المستخرج').optional(),
  studentName: z.string().describe('اسم الطالب الكامل').optional(),
  subjectName: z.string().describe('اسم المادة الدراسية').optional(),
  academicYear: z.string().describe('العام الجامعي (مثال: 2023 / 2024)').optional(),
  semester: z.string().describe('الفصل الدراسي').optional(),
  level: z.string().describe('المستوى الدراسي').optional(),
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
  prompt: `أنت خبير في تحليل الوثائق الأكاديمية العربية. 
قم بتحليل ترويسة (Header) ورقة الامتحان المرفقة واستخرج البيانات التالية بدقة عالية في قالب JSON:

1. رقم القيد (Registration ID): ابحث عنه تحت مسمى "رقم القيد" أو "رقم الجلوس" وعادة ما يتكون من أرقام فقط.
2. اسم الطالب (Student Name): الاسم الرباعي المكتوب بوضوح.
3. اسم المادة (Subject Name): المادة المخصصة لهذا الامتحان.
4. العام الجامعي (Academic Year): ابحث عن صيغة مثل 2023/2024.
5. الفصل الدراسي (Semester): الفصل الأول أو الثاني أو التكميلي.
6. المستوى (Level): المستوى الأول، الثاني، الثالث، أو الرابع.

إذا لم تجد حقلاً معيناً، اتركه فارغاً.

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
      
      if (!output) throw new Error('AI_RETURNED_NO_DATA');

      // تنظيف البيانات المستخرجة لضمان الجودة
      return {
        ...output,
        studentRegistrationId: output.studentRegistrationId?.replace(/\D/g, '') || '',
        studentName: output.studentName?.trim() || '',
        subjectName: output.subjectName?.trim() || ''
      };
    } catch (error: any) {
      console.error('OCR Flow Error:', error);
      throw new Error('فشل التحليل الذكي للوثيقة: ' + (error.message || 'Error'));
    }
  }
);

export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}
