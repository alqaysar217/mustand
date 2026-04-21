'use server';
/**
 * @fileOverview نظام استخراج بيانات الامتحانات الثوري (v2.0).
 * تم التخلص من كافة الروابط الصلبة والاعتماد على استراتيجية الـ Fallback الديناميكي.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string(),
});
export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional(),
  studentName: z.string().optional(),
  subjectName: z.string().optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  level: z.string().optional(),
});
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

const SYSTEM_INSTRUCTION = `
<objective>
  Analyze the provided exam paper header image and extract academic metadata.
</objective>
<constraints>
  - RETURN ONLY A VALID JSON OBJECT.
  - DO NOT INCLUDE ANY MARKDOWN CODE BLOCKS OR PREAMBLES.
  - USE EMPTY STRINGS FOR MISSING FIELDS.
  - CONCENTRATE ON ARABIC TEXT EXTRACTION ACCURACY.
</constraints>
<schema>
  {
    "studentRegistrationId": "string (numeric only)",
    "studentName": "string",
    "subjectName": "string",
    "academicYear": "string (e.g. 2024/2025)",
    "semester": "string",
    "level": "string"
  }
</schema>
`;

/**
 * دالة تنظيف واستخراج الـ JSON من استجابة النموذج باستخدام Regex
 */
function cleanAndParseJSON(rawText: string): any {
  try {
    // محاولة استخراج الجزء المحصور بين { } في حال أضاف النموذج أي نصوص
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const targetText = jsonMatch ? jsonMatch[0] : rawText;
    return JSON.parse(targetText.trim());
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', rawText);
    throw new Error('FORMAT_ERROR');
  }
}

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}

const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    // قائمة النماذج المراد تجربتها بالترتيب في حال الفشل
    const modelsToTry = [
      'googleai/gemini-1.5-flash',
      'googleai/gemini-1.5-pro',
      'googleai/gemini-2.0-flash-exp'
    ];

    let lastError: any = null;

    for (const modelId of modelsToTry) {
      try {
        console.log(`Attempting extraction with model: ${modelId}`);
        
        const { text } = await ai.generate({
          model: modelId,
          system: SYSTEM_INSTRUCTION,
          prompt: [
            { text: "Extract details from this exam image:" },
            { media: { url: input.examImageDataUri } }
          ],
          config: {
            temperature: 0.1, // لضمان دقة واستقرار المخرجات
          }
        });

        if (!text) continue;

        const parsed = cleanAndParseJSON(text);
        
        return {
          studentRegistrationId: parsed.studentRegistrationId?.toString().replace(/\D/g, '') || '',
          studentName: parsed.studentName?.trim() || '',
          subjectName: parsed.subjectName?.trim() || '',
          academicYear: parsed.academicYear?.trim() || '',
          semester: parsed.semester?.trim() || '',
          level: parsed.level?.trim() || ''
        };

      } catch (error: any) {
        console.warn(`Model ${modelId} failed:`, error.message);
        lastError = error;
        // الاستمرار في الحلقة لتجربة النموذج التالي
        continue;
      }
    }

    // إذا وصلنا لهنا، فهذا يعني فشل كافة النماذج
    console.error('All AI models failed to process the document:', lastError);
    throw new Error('تعذر تحليل الوثيقة عبر كافة محركات الذكاء الاصطناعي. يرجى التأكد من جودة الصورة أو إدخال البيانات يدوياً.');
  }
);
