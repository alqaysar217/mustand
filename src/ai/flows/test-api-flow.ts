'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @fileOverview تدفق بسيط لاختبار صلاحية مفتاح الـ API.
 */

export const testApiFlow = ai.defineFlow(
  {
    name: 'testApiFlow',
    inputSchema: z.string().optional(),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async () => {
    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: 'أجب بكلمة واحدة فقط: "متصل"',
      });

      if (response.text) {
        return { success: true, message: 'تم الاتصال بمحرك Gemini بنجاح! المفتاح يعمل.' };
      }
      throw new Error('لم يتم تلقي رد من المحرك');
    } catch (error: any) {
      console.error('Test API Error:', error);
      return { 
        success: false, 
        message: `فشل الاتصال: ${error.message || 'تأكد من صلاحية المفتاح في Google AI Studio'}` 
      };
    }
  }
);
