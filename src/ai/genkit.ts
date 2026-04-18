import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(), // سيعتمد النظام تلقائياً على متغير البيئة GOOGLE_GENAI_API_KEY
  ],
});
