
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * تدفق تشخيصي متقدم لاختبار مفتاح الـ API وإرجاع معلومات المشروع والنموذج المستخدم.
 */
export const testApiFlow = ai.defineFlow(
  {
    name: 'testApiFlow',
    inputSchema: z.string().optional(),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      model: z.string().optional(),
      rawError: z.string().optional(),
    }),
  },
  async () => {
    const modelName = 'googleai/gemini-1.5-flash';
    try {
      const response = await ai.generate({
        model: modelName,
        prompt: 'أجب بكلمة واحدة فقط: "متصل"',
      });

      if (response.text) {
        return { 
          success: true, 
          message: 'تم الاتصال بنجاح! المفتاح يعمل والمشروع متصل بالخادم.',
          model: modelName
        };
      }
      throw new Error('لم يتم تلقي رد من المحرك');
    } catch (error: any) {
      console.error('Detailed API Test Error:', error);
      
      let errorMsg = error.message || 'خطأ غير معروف';
      
      // تحليل الخطأ لتقديم نصيحة للمستخدم
      if (errorMsg.includes('403')) errorMsg = '403 Forbidden: الـ API غير مفعل لهذا المشروع أو قيود جغرافية.';
      if (errorMsg.includes('401')) errorMsg = '401 Unauthorized: مفتاح الـ API غير صحيح أو منتهي.';
      if (errorMsg.includes('429')) errorMsg = '429 Too Many Requests: انتهت الحصة المجانية لهذا اليوم.';

      return { 
        success: false, 
        message: 'فشل الاتصال بمحرك Gemini.',
        rawError: errorMsg
      };
    }
  }
);
