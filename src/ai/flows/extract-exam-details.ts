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
      "A data URI of the exam image that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
 * Using exactly 'gemini-1.5-flash' on the stable v1 API.
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
  prompt: `أنت مساعد ذكي متخصص في قراءة أوراق الامتحانات.
قم بتحليل الصورة المرفقة واستخرج منها:
1. رقم القيد (Registration ID)
2. اسم الطالب الكامل (Student Name)
إذا لم تجد المعلومة، اترك الحقل فارغاً.
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

      // Explicit call to the prompt using the stable model
      const {output} = await extractExamDetailsPrompt(input);
      
      return output || { studentRegistrationId: '', studentName: '' };
    } catch (error: any) {
      console.error('OCR Extraction Failed:', error.message);
      // We throw a controlled error string to be handled by the UI
      throw new Error('AI_ANALYSIS_FAILED');
    }
  }
);

export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}
