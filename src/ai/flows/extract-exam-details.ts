'use server';
/**
 * @fileOverview This flow extracts student registration ID and name from an uploaded exam image using AI-powered OCR.
 *
 * - extractExamDetails - A function that handles the extraction process.
 * - ExtractExamDetailsInput - The input type for the extractExamDetails function.
 * - ExtractExamDetailsOutput - The return type for the extractExamDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema for the input of the extractExamDetails flow.
 */
const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z
    .string()
    .describe(
      "A data URI of the exam image that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;

/**
 * Schema for the output of the extractExamDetails flow.
 */
const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z
    .string()
    .describe('The extracted student registration ID (رقم القيد).'),
  studentName: z.string().describe('The extracted full name of the student (اسم الطالب).'),
});
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

/**
 * Wrapper function to call the Genkit flow for extracting exam details.
 */
export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}

/**
 * Defines the Genkit prompt for extracting student details from an exam image.
 * Explicitly using gemini-1.5-flash which is standard for v1.
 */
const extractExamDetailsPrompt = ai.definePrompt({
  name: 'extractExamDetailsPrompt',
  input: {schema: ExtractExamDetailsInputSchema},
  output: {schema: ExtractExamDetailsOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `أنت مساعد ذكي متخصص في قراءة أوراق الامتحانات.
قم بتحليل الصورة المرفقة واستخرج منها:
1. رقم القيد (Registration ID)
2. اسم الطالب الكامل (Student Name)
إذا لم تجد المعلومة، اترك الحقل فارغاً.
Image: {{media url=examImageDataUri}}`,
});

/**
 * Defines the Genkit flow for extracting student details from an exam image.
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

      // Call the prompt and return output
      const {output} = await extractExamDetailsPrompt(input);
      
      if (!output) {
        return { studentRegistrationId: '', studentName: '' };
      }
      
      return output;
    } catch (error: any) {
      console.error('OCR Flow Error:', error);
      
      // We throw a generic error to trigger the UI fallback to manual input
      throw new Error('FAILED_TO_ANALYZE');
    }
  }
);
