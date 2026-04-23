
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @fileOverview تدفق محسّن لاختبار مفتاح الـ API وإرجاع تفاصيل الخطأ الحقيقية.
 */

export const testApiFlow = ai.defineFlow(
  {
    name: 'testApiFlow',
    inputSchema: z.string().optional(),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      rawError: z.string().optional(),
    }),
  },
  async () => {
    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: 'أجب بكلمة واحدة فقط: "متصل"',
      });

      if (response.text) {
        return { 
          success: true, 
          message: 'تم الاتصال بنجاح! المفتاح شغال والمحرك مستعد.' 
        };
      }
      throw new Error('لم يتم تلقي رد من المحرك');
    } catch (error: any) {
      console.error('Detailed Test API Error:', error);
      return { 
        success: false, 
        message: 'فشل الاتصال بالمحرك.',
        rawError: error.message || 'خطأ غير معروف'
      };
    }
  }
);
