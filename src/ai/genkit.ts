
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * تهيئة نظام Genkit مع إضافة دعم الذكاء الاصطناعي من Google.
 * تم التحديث لاستخدام الإعدادات الافتراضية لضمان التوافق مع Gemini 1.5 Flash.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
