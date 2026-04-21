'use server';

/**
 * @fileOverview نظام تشخيص واستخراج بيانات الامتحانات (Diagnostic v3.0).
 * مصمم لتتبع أخطاء الاتصال بالـ API وتجاوز مشاكل الـ Timeout و Regional Blocking.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    console.log(`Step 1: Checking API Configuration...`);
    console.log(`- API Key (Masked): ${maskedKey}`);
    console.log(`- Payload Size: ${Math.round(input.examImageDataUri.length / 1024)} KB`);

    // 1. التشخيص المبدئي: فحص الشبكة والمفتاح (Handshake)
    try {
      console.log('Step 2: Network Handshake (Pinging Google AI)...');
      const ping = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      console.log(`- Network Status: ${ping.status} ${ping.statusText}`);
      
      if (!ping.ok) {
        const errorDetails = await ping.json().catch(() => ({}));
        console.error('Handshake Failed. Google Response:', JSON.stringify(errorDetails));
        if (ping.status === 403) throw new Error('API_KEY_RESTRICTED_OR_REGIONAL_BLOCK');
      }
    } catch (e: any) {
      console.warn('Step 2 Warning: Handshake check failed, continuing anyway...');
    }

    // 2. محاولة التحليل عبر النماذج بالترتيب (Flash -> Pro)
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Step 3: Handshaking with Model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // تجهيز البيانات
        const base64Data = input.examImageDataUri.split(',')[1];
        const mimeType = input.examImageDataUri.split(',')[0].split(':')[1].split(';')[0];

        const prompt = `
          Analyze this exam paper header. 
          Return ONLY a JSON object (no markdown, no preamble) with: 
          {
            "studentRegistrationId": "string",
            "studentName": "string",
            "subjectName": "string",
            "academicYear": "string",
            "semester": "string",
            "level": "string"
          }
          Focus on Arabic text accuracy for student and subject names.
        `;

        console.log(`Step 4: Sending Data to ${modelName}...`);
        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log(`- Response received from ${modelName}.`);

        // تنظيف وتحويل الـ JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(cleanJson);

        console.log('--- [DIAGNOSTICS SUCCESS] ---');
        return {
          studentRegistrationId: parsed.studentRegistrationId?.toString().replace(/\D/g, '') || '',
          studentName: parsed.studentName?.trim() || '',
          subjectName: parsed.subjectName?.trim() || '',
          academicYear: parsed.academicYear?.trim() || '',
          semester: parsed.semester?.trim() || '',
          level: parsed.level?.trim() || ''
        };

      } catch (err: any) {
        console.error(`- Error with model ${modelName}:`, err.message);
        lastError = err;
        continue; // تجربة النموذج التالي
      }
    }

    console.error('--- [DIAGNOSTICS CRITICAL FAILURE] ---');
    console.error('Handshake failed on all models. Last Error:', lastError?.message);

    // الرد النهائي في حال فشل كافة المحاولات
    throw new Error(`تعذر الاتصال بخوادم الذكاء الاصطناعي. التشخيص: ${lastError?.message || 'مشكلة في الشبكة أو الـ API Key'}`);
  }
);
