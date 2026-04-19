import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * تهيئة نظام Genkit مع إضافة دعم الذكاء الاصطناعي من Google.
 * ملاحظة هامة: يجب إعداد مفتاح API في ملف .env تحت مسمى:
 * GOOGLE_GENAI_API_KEY
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});
