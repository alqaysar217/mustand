'use server';
/**
 * @fileOverview نظام استخراج بيانات الامتحانات المطور.
 * تم تحسينه لمعالجة أخطاء 400 Bad Request عبر إزالة الاعتماد التلقائي على responseMimeType
 * وإضافة آلية تحليل JSON متينة (Robust Parsing) مع تنظيف المارك داون يدوياً.
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

/**
 * تعريف البرومبت بدون تحديد output schema في الإعدادات الأساسية
 * لتجنب قيام Genkit بإضافة "responseMimeType: application/json" تلقائياً،
 * وهو ما يسبب خطأ "Unknown name responseMimeType" في بعض إصدارات الـ API أو النماذج.
 */
const extractExamDetailsPrompt = ai.definePrompt({
  name: 'extractExamDetailsPrompt',
  input: {schema: ExtractExamDetailsInputSchema},
  // إزالة output schema من هنا لمنع إضافة responseMimeType في الـ config من قبل المكتبة
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
قم بتحليل ترويسة (Header) ورقة الامتحان المرفقة واستخرج البيانات التالية بدقة عالية.

يجب أن تعيد المخرجات بتنسيق JSON صالح فقط. لا تكتب أي نصوص تمهيدية أو ملاحظات ختامية.
تأكد من أن النتيجة تبدأ بـ { وتنتهي بـ }.

الهيكل المطلوب (JSON):
{
  "studentRegistrationId": "رقم القيد أو الجلوس",
  "studentName": "الاسم الكامل المكتوب",
  "subjectName": "اسم المادة الدراسية",
  "academicYear": "العام الجامعي (مثلاً 2024/2025)",
  "semester": "الفصل الدراسي",
  "level": "المستوى الدراسي"
}

إذا لم تجد حقلاً معيناً، اتركه كسلسلة فارغة "".

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
      // استدعاء الموديل والحصول على الاستجابة النصية الخام
      const response = await extractExamDetailsPrompt(input);
      let rawText = response.text;
      
      if (!rawText) throw new Error('AI_RETURNED_NO_TEXT');

      // 1. تنظيف مخرجات المارك داون (Markdown Stripping)
      // إزالة علامات ```json و ``` إذا وجدت في الاستجابة
      let cleanJson = rawText;
      const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
      const markdownMatch = markdownRegex.exec(rawText);
      
      if (markdownMatch && markdownMatch[1]) {
        cleanJson = markdownMatch[1];
      } else {
        // محاولة استخراج الجزء الذي يبدأ بـ { وينتهي بـ } في حال وجود نص خارج الـ JSON
        const fallbackMatch = rawText.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          cleanJson = fallbackMatch[0];
        }
      }

      // 2. تحليل الـ JSON بشكل آمن (Robust Parsing)
      let parsedOutput: any;
      try {
        parsedOutput = JSON.parse(cleanJson.trim());
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON. Text attempted:', cleanJson);
        throw new Error('تنسيق استجابة الذكاء الاصطناعي غير متوافق مع JSON');
      }

      // 3. تنظيف البيانات النهائية وضمان جودتها
      return {
        studentRegistrationId: parsedOutput.studentRegistrationId?.toString().replace(/\D/g, '') || '',
        studentName: parsedOutput.studentName?.trim() || '',
        subjectName: parsedOutput.subjectName?.trim() || '',
        academicYear: parsedOutput.academicYear?.trim() || '',
        semester: parsedOutput.semester?.trim() || '',
        level: parsedOutput.level?.trim() || ''
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
