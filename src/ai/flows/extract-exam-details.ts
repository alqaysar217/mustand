
'use server';

/**
 * @fileOverview غلاف للتحليل الذكي للاختبارات (Legacy Wrapper).
 * تم نقل المنطق الرئيسي إلى API Route لضمان استقرار Next.js 15.
 * هذا الملف متاح حالياً للتوافقية البرمجية فقط.
 */

import { ai } from '@/ai/genkit';
import { z } from 'kit';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string(),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional(),
  studentName: z.string().optional(),
  subjectName: z.string().optional(),
});

export async function extractExamDetails(input: z.infer<typeof ExtractExamDetailsInputSchema>) {
  // توجيه الطلب داخلياً لمسار الـ API لتوحيد منطق العمل
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ai/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل في استخراج البيانات عبر المسار السريع.');
  }

  return response.json();
}
