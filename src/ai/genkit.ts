import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * تهيئة نظام Genkit مع إضافة دعم الذكاء الاصطناعي من Google.
 * تم التحديث لاستخدام الإصدار المستقر v1 لتجنب أخطاء "Model Not Found" في v1beta.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: 'v1',
    }),
  ],
});
