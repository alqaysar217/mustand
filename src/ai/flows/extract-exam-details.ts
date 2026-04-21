'use server';

/**
 * @fileOverview نظام تشخيص واستخراج بيانات الامتحانات (Diagnostic v4.0).
 * يعتمد على الـ SDK الرسمي مع طبقة تشخيصية ومحرك OCR بديل (Tesseract).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Tesseract from 'tesseract.js';

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
  diagnostics: z.string().optional(),
});
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

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
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || '';
    const maskedKey = apiKey.slice(0, 4) + '...' + apiKey.slice(-4);
    
    console.log('--- [START AI DIAGNOSTICS] ---');
    console.log(`Step 1: Environment Check...`);
    console.log(`- API Key (Masked): ${maskedKey}`);
    console.log(`- Image Payload Size: ${Math.round(input.examImageDataUri.length / 1024)} KB`);

    // 1. Network Handshake Diagnostic
    try {
      console.log('Step 2: Network Ping (Google AI Services)...');
      const ping = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      console.log(`- Status: ${ping.status} ${ping.statusText}`);
      
      if (!ping.ok) {
        const errJson = await ping.json().catch(() => ({}));
        console.error('Network Handshake Failed:', JSON.stringify(errJson));
        if (ping.status === 403) {
          console.warn('CRITICAL: API Key is likely restricted to certain IPs or Regions.');
        }
      } else {
        console.log('Handshake OK: Network connection to Google AI is active.');
      }
    } catch (e) {
      console.warn('Handshake Alert: Network check timed out or blocked, proceeding with SDK attempt.');
    }

    // 2. Pure SDK Implementation (Primary Strategy)
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Step 3: Attempting Analysis with Model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const base64Data = input.examImageDataUri.split(',')[1];
        const mimeType = input.examImageDataUri.split(',')[0].split(':')[1].split(';')[0];

        const prompt = `
          Analyze this exam paper image.
          Return ONLY a JSON object with:
          {
            "studentRegistrationId": "numeric digits",
            "studentName": "Arabic name",
            "subjectName": "Arabic subject name"
          }
          Be extremely accurate with Arabic text. No markdown, just JSON.
        `;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log(`- Received response from ${modelName}`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(cleanJson);

        console.log('--- [SUCCESS: AI STRATEGY] ---');
        return {
          studentRegistrationId: parsed.studentRegistrationId?.toString().replace(/\D/g, '') || '',
          studentName: parsed.studentName?.trim() || '',
          subjectName: parsed.subjectName?.trim() || '',
        };

      } catch (err: any) {
        console.error(`- Error with ${modelName}:`, err.message);
        lastError = err;
        // Continue to next model
      }
    }

    // 3. Plan B: Emergency Fallback (Local OCR via Tesseract.js)
    console.warn('Step 4: AI Failed. Executing Plan B (Local OCR Fallback)...');
    try {
      const buffer = Buffer.from(input.examImageDataUri.split(',')[1], 'base64');
      const ocrResult = await Tesseract.recognize(buffer, 'ara', {
        logger: m => console.log(`- OCR Progress: ${Math.round(m.progress * 100)}%`)
      });
      
      const fullText = ocrResult.data.text;
      console.log('- Raw OCR Text:', fullText);

      // Simple Regex attempt
      const idMatch = fullText.match(/\d{5,10}/);
      const nameMatch = fullText.match(/اسم الطالب[:\s]+([^\n\d]+)/);
      
      console.log('--- [SUCCESS: PLAN B STRATEGY] ---');
      return {
        studentRegistrationId: idMatch ? idMatch[0] : '',
        studentName: nameMatch ? nameMatch[1].trim() : '',
        diagnostics: 'Extracted via Plan B (Local OCR) due to AI timeout.'
      };
    } catch (ocrErr: any) {
      console.error('Plan B Failed:', ocrErr.message);
      throw new Error(`تعذر الاتصال بالذكاء الاصطناعي وفشل المحرك البديل. التشخيص: ${lastError?.message || 'مشكلة في الشبكة'}`);
    }
  }
);
