
'use server';

/**
 * @fileOverview محرك استخراج البيانات المطور للعمل عبر OpenRouter.
 * تم ضبطه ليطابق الكود الناجح للمستخدم مع استخدام Gemini 2.0 Flash.
 */

import { z } from 'zod';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string().describe("صورة ورقة الامتحان كـ Data URI (Base64)"),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج"),
  studentName: z.string().optional().describe("اسم الطالب المستخرج"),
});

export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

// مفتاح OpenRouter الذي أثبت نجاحه مع المستخدم
const OPENROUTER_API_KEY = "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";

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mustand-archive.app', // معرف اختياري
        'X-Title': 'Mustand Smart Archive'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "أنت خبير أرشفة. استخرج 'studentRegistrationId' (رقم القيد) و 'studentName' (اسم الطالب الكامل) من هذه الصورة العربية. أجب فقط بصيغة JSON كالتالي: {\"studentRegistrationId\": \"الرقم\", \"studentName\": \"الاسم\"}. إذا لم تجد القيمة ضعها نصاً فارغاً."
              },
              {
                type: 'image_url',
                image_url: { url: input.examImageDataUri }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "فشل الاتصال بمحرك OpenRouter");
    }

    const content = JSON.parse(data.choices[0].message.content);
    
    return {
      studentRegistrationId: content.studentRegistrationId || "",
      studentName: content.studentName || ""
    };

  } catch (error: any) {
    console.error('AI Extraction Error:', error);
    throw new Error(`خطأ في التحليل الذكي: ${error.message}`);
  }
}
