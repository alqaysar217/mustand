'use server';
/**
 * @fileOverview محرك استخراج البيانات المطور للتحقق الشامل من محتوى غلاف الامتحان.
 * تم تحسين البرومبت بناءً على القواعد التفصيلية لضمان دقة استخراج رقم القيد (11 رقم) والمطابقة الذكية للمواد.
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
  studentRegistrationId: z.string().optional().describe("رقم القيد الجامعي المستخرج"),
  studentName: z.string().optional().describe("اسم الطالب الكامل المستخرج"),
  subjectName: z.string().optional().describe("اسم المادة الدراسية المكتوب"),
  departmentName: z.string().optional().describe("اسم القسم أو التخصص المكتوب"),
  collegeName: z.string().optional().describe("اسم الكلية المكتوب"),
  level: z.string().optional().describe("المستوى الدراسي المكتوب"),
  term: z.string().optional().describe("الفصل الدراسي المكتوب"),
});

export type ExtractExamDetailsInput = z.infer<typeof ExtractExamDetailsInputSchema>;
export type ExtractExamDetailsOutput = z.infer<typeof ExtractExamDetailsOutputSchema>;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function extractExamDetails(input: ExtractExamDetailsInput): Promise<ExtractExamDetailsOutput> {
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('لم يتم العثور على OPENROUTER_API_KEY. يرجى إضافته في إعدادات Environment Variables في Vercel.');
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
                text: `أنت نظام أرشفة أكاديمي متخصص في تحليل أغلفة دفاتر الامتحانات الجامعية.
مهمتك هي استخراج البيانات الأكاديمية المكتوبة بخط اليد أو المطبوعة من الصورة بدقة عالية جداً، مع التركيز على تقليل أخطاء الأرشفة.

استخدم السياق التالي للمساعدة في المطابقة والتحقق (هذه البيانات هي ما اختاره الموظف في النظام):
- المادة الدراسية المختارة: ${input.selectedSubject || "غير محدد"}
- التخصص الدراسي المختار: ${input.selectedDept || "غير محدد"}
- المستوى الدراسي المختار: ${input.selectedLevel || "غير محدد"}
- الفصل الدراسي المختار: ${input.selectedTerm || "غير محدد"}

## قواعد إلزامية

### أولاً: رقم القيد (أعلى أولوية)
رقم القيد هو أهم حقل في العملية كلها.
* ابحث عنه في جميع أجزاء الصورة واستخرج 11 رقماً فقط.
* إذا وجدت 10 أرقام، دقق جيداً في الحواف أو البداية فغالباً هناك رقم مفقود. يجب أن تعيد 11 رقماً.
* استخرج الأرقام فقط وتجاهل أي مسافات أو رموز.
* حوّل الأرقام العربية (٠١٢٣٤٥٦٧٨٩) إلى إنجليزية (0123456789).
* ابحث عن كلمات: "رقم القيد"، "القيد"، "رقم الطالب"، "Student ID"، "Registration Number".
* لا تخمن رقم القيد أبداً، إذا لم تكن متأكداً بنسبة عالية فاتركه فارغاً.

### ثانياً: اسم الطالب
* استخرج الاسم الكامل كما هو مكتوب، وصحح الأخطاء الإملائية البسيطة والواضحة فقط.

### ثالثاً: المادة الدراسية
* استخرج المادة سواء كتبت بالعربية، الإنجليزية، باختصار، أو بخطأ إملائي.
* طابق المادة مع السياق المذكور ("${input.selectedSubject}"). 
* أمثلة التطبيع: "Eng", "English" -> "اللغة الإنجليزية". "Math" -> "الرياضيات". "Data Mining" -> "تنقيب البيانات".
* إذا كانت الكلمة قريبة جداً من مادة معروفة فقم بتصحيحها. لا تغير المادة إلى مادة مختلفة تماماً عن السياق.

### رابعاً: التخصص
* استخرج التخصص وقم بتطبيعه بناءً على السياق ("${input.selectedDept}").
* أمثلة: "IT" -> "تقنية المعلومات"، "CS" -> "علوم الحاسوب"، "MIS" -> "نظم المعلومات الإدارية"، "SE" -> "هندسة برمجيات".

### خامساً: الكلية
* استخرج اسم الكلية وقم بتوحيده إن أمكن (مثال: "كلية الحاسبات").

### سادساً: المستوى الدراسي (4 مستويات فقط)
* استخرج المستوى وحوله للمسمى الرسمي: 1 أو "الأول" -> "المستوى الأول"، 2 -> "المستوى الثاني"، 3 -> "المستوى الثالث"، 4 -> "المستوى الرابع".

### سابعاً: الفصل الدراسي (الترم)
* استخرج الفصل الدراسي: 1 أو "الاول" أو "First Semester" -> "الفصل الأول"، 2 -> "الفصل الثاني".

### قواعد المنطق
* ممنوع اختراع أو تخمين قيم غير موجودة.
* يجب أن تكون النتيجة بمنتهى الأمانة؛ إذا كانت المادة في الورقة مختلفة تماماً عن المادة المختارة في السياق، استخرج المادة الموجودة في الورقة فعلياً.
* يجب أن تكون النتيجة منطقية ومتسقة مع النص الموجود في الصورة.
* إذا كانت الثقة منخفضة جداً في حقل ما، أرجعه نصاً فارغاً "".

أجب فقط بصيغة JSON صحيحة بدون أي شرح إضافي.
{
  "studentRegistrationId": "",
  "studentName": "",
  "subjectName": "",
  "departmentName": "",
  "collegeName": "",
  "level": "",
  "term": ""
}`
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