'use server';
/**
 * @fileOverview محرك استخراج البيانات المطور للتحقق الشامل من محتوى غلاف الامتحان.
 * تم تحديثه ليدعم المطابقة السياقية والتعامل مع الترجمة بين العربية والإنجليزية.
 * تم نقل مفتاح الربط إلى ملف البيئة .env للأمان.
 */

import { z } from 'zod';

const ExtractExamDetailsInputSchema = z.object({
  examImageDataUri: z.string().describe("صورة ورقة الامتحان كـ Data URI (Base64)"),
  selectedSubject: z.string().optional().describe("المادة التي اختارها الموظف حالياً"),
  selectedDept: z.string().optional().describe("التخصص الذي اختاره الموظف حالياً"),
  selectedLevel: z.string().optional().describe("المستوى المختار"),
  selectedTerm: z.string().optional().describe("الترم المختار"),
});

const ExtractExamDetailsOutputSchema = z.object({
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج (يجب أن يكون 11 رقم)"),
  studentName: z.string().optional().describe("اسم الطالب الكامل المستخرج"),
  subjectName: z.string().optional().describe("اسم المادة الدراسية المكتوب"),
  departmentName: z.string().optional().describe("اسم القسم أو التخصص المكتوب"),
  collegeName: z.string().optional().describe("اسم الكلية المكتوب"),
  level: z.string().optional().describe("المستوى الدراسي المكتوب"),
  term: z.string().optional().describe("الفصل الدراسي المكتوب"),
});

export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

// استدعاء المفتاح من ملف البيئة للأمان
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('لم يتم تكوين مفتاح OPENROUTER_API_KEY في ملف البيئة .env');
  } 

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mustand-archive.app',
        'X-Title': 'Mustand Smart Archive'
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `أنت خبير أرشفة أكاديمي محترف. حلل الصورة واستخرج البيانات بدقة متناهية مع مراعاة السياق التالي:
                
                السياق المختار في النظام للمطابقة:
                - المادة المختارة: ${input.selectedSubject}
                - القسم المختار: ${input.selectedDept}
                - المستوى المختار: ${input.selectedLevel}
                - الترم المختار: ${input.selectedTerm}

                قواعد الاستخراج الذهبية (هام جداً):
                1. رقم القيد (إلزامي 11 رقم): ابحث عن رقم القيد وتأكد أنه يتكون من 11 رقماً. إذا بدا لك أن هناك 10 أرقام فقط، دقق جيداً في البداية أو النهاية أو الحواف، غالباً ما يكون هناك رقم مفقود. يجب أن تعيد 11 رقماً في الناتج.
                2. المادة (ترجمة ذكية): إذا كانت المادة في الورقة مكتوبة بالإنجليزية مثل (Data Mining) وهي مطابقة للمادة المختارة "${input.selectedSubject}"، فاستخرج الاسم كما هو مكتوب.
                3. الفصل الدراسي والمستوى: استخرجهم بدقة كما هم مكتوبون. "الفصل الدراسي" في الورقة هو "الترم" في النظام.
                
                البيانات المطلوبة بصيغة JSON فقط:
                {
                  "studentRegistrationId": "رقم القيد المكون من 11 رقم",
                  "studentName": "الاسم الكامل",
                  "subjectName": "اسم المادة كما هو في الورقة",
                  "departmentName": "القسم كما هو في الورقة",
                  "collegeName": "الكلية",
                  "level": "المستوى الدراسي",
                  "term": "الفصل الدراسي"
                }

                ملاحظة: لا تضف أي نصوص توضيحية، أجب فقط بـ JSON.`
              },
              {
                type: 'image_url',
                image_url: { url: input.examImageDataUri }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "فشل الاتصال بمحرك الذكاء الاصطناعي");

    let contentRaw = data.choices[0].message.content;
    // تنظيف المخرجات من أي markdown محتمل
    const startIndex = contentRaw.indexOf('{');
    const endIndex = contentRaw.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      contentRaw = contentRaw.substring(startIndex, endIndex + 1);
    }
    
    const content = JSON.parse(contentRaw);
    
    return {
      studentRegistrationId: (content.studentRegistrationId || "").toString().replace(/[^\d]/g, ''),
      studentName: content.studentName || "",
      subjectName: content.subjectName || "",
      departmentName: content.departmentName || "",
      collegeName: content.collegeName || "",
      level: content.level || "",
      term: content.term || ""
    };

  } catch (error: any) {
    console.error('AI Extraction Error:', error);
    throw new Error(error.message || "حدث خطأ أثناء تحليل الصورة");
  }
}
