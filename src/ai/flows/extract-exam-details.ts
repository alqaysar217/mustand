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
 *
 * @param input - The input containing the exam image data URI.
 * @returns The extracted student registration ID and name.
 */
export async function extractExamDetails(
  input: ExtractExamDetailsInput
): Promise<ExtractExamDetailsOutput> {
  return extractExamDetailsFlow(input);
}

/**
 * Defines the Genkit prompt for extracting student details from an exam image.
 */
const extractExamDetailsPrompt = ai.definePrompt({
  name: 'extractExamDetailsPrompt',
  input: {schema: ExtractExamDetailsInputSchema},
  output: {schema: ExtractExamDetailsOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `Analyze the provided exam image and extract the student's registration ID (رقم القيد) and the student's full name (اسم الطالب). Output the extracted information strictly in JSON format as defined by the output schema. If a field cannot be found, provide an empty string for that field.
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
    const {output} = await extractExamDetailsPrompt(input);
    if (!output) {
      throw new Error('Failed to extract exam details.');
    }
    return output;
  }
);
