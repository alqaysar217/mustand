'use server';
/**
 * @fileOverview This flow extracts student registration ID and name from an uploaded exam image using AI-powered OCR.
 *
 * - extractExamDetails - A function that handles the extraction process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z
    .string()
    .describe('The extracted student registration ID (رقم القيد).'),
  studentName: z.string().describe('The extracted full name of the student (اسم الطالب).'),
});
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

/**
 * Defines the Genkit prompt for extracting student details from an exam image.
 * Updated with strict instructions to return only clean data.
 */
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
  prompt: `أنت خبير في قراءة وتحليل أوراق الامتحانات الجامعية العربية.
قم بتحليل الصورة المرفقة واستخرج البيانات التالية بدقة متناهية:

1. رقم القيد (Registration ID): ابحث عن خانة "رقم القيد" أو "رقم الجلوس". استخرج الأرقام فقط (مثلاً: 20210045). لا تضف أي نص عربي قبل أو بعد الرقم.
2. اسم الطالب الكامل (Student Name): استخرج الاسم الرباعي المكتوب في خانة الاسم.

قواعد صارمة:
- أعد البيانات بصيغة JSON نظيفة كما هو محدد في الـ Output Schema.
- إذا لم تجد رقم القيد، حاول البحث عن أي رقم تسلسلي في أعلى الورقة.
- ركز على الجزء العلوي (Header) من ورقة الامتحان.

Image: {{media url=examImageDataUri}}`,
});

/**
 * Defines the Genkit flow with robust error catching to prevent UI freezing.
 */
const extractExamDetailsFlow = ai.defineFlow(
  {
    name: 'extractExamDetailsFlow',
    inputSchema: ExtractExamDetailsInputSchema,
    outputSchema: ExtractExamDetailsOutputSchema,
  },
  async (input) => {
    try {
      if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error('API_KEY_MISSING');
      }

      const {output} = await extractExamDetailsPrompt(input);
      
      // Clean up the output before returning: Remove all non-digits from Registration ID
      const cleanRegId = output?.studentRegistrationId?.replace(/\D/g, '') || '';
      
      return {
        studentRegistrationId: cleanRegId,
        studentName: output?.studentName?.trim() || ''
      };
    } catch (error: any) {
      console.warn('OCR Extraction Error:', error.message);
      throw new Error('AI_ANALYSIS_FAILED');
    }
  }
);

export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}
