
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route Handler للتحليل الذكي للاختبارات.
 * يستخدم fetch خام لضمان الشفافية الكاملة وتجنب مشاكل الـ SDK.
 */
export async function POST(req: NextRequest) {
  try {
    const { examImageDataUri } = await req.json();
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.error('--- [AI ERROR] API Key missing in environment ---');
      return NextResponse.json({ error: 'مفتاح الـ API غير معرف في النظام.' }, { status: 500 });
    }

    // استخراج بيانات Base64 ونوع الملف
    const [header, base64Data] = examImageDataUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    // إعداد الحمولة (Payload) حسب توثيق Google AI API v1
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `تحليل ورقة الامتحان المستخرجة.
              استخرج بدقة البيانات التالية باللغة العربية:
              1. رقم القيد (أرقام فقط).
              2. اسم الطالب (الاسم الرباعي).
              3. اسم المادة الدراسية.
              
              يجب أن تكون المخرجات بصيغة JSON صالحة فقط بهذا الهيكل:
              {
                "studentRegistrationId": "...",
                "studentName": "...",
                "subjectName": "..."
              }
              لا تضف أي نصوص توضيحية أو مارك داون.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log('--- [AI REQUEST START] ---');
    console.log('Payload Size:', Math.round(JSON.stringify(payload).length / 1024), 'KB');

    // استدعاء API مباشرة عبر fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // محاكاة طلب خادم نظيف لتجنب حظر الـ IP
          'User-Agent': 'Mustand-Archive-System/1.0 (NextJS-Server)'
        },
        body: JSON.stringify(payload)
      }
    );

    console.log('--- [AI RESPONSE HEADERS] ---');
    response.headers.forEach((v, k) => console.log(`${k}: ${v}`));
    console.log('Status:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('--- [AI RAW RESPONSE BODY] ---');
    console.log(rawText.substring(0, 1000)); // عرض أول 1000 حرف للتتبع

    if (!response.ok) {
      console.error('AI API Returned Error Status:', response.status);
      return new NextResponse(rawText, { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const data = JSON.parse(rawText);
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // تنظيف استجابة JSON من أي Markdown
    const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    console.log('--- [AI SUCCESSFUL PARSE] ---');
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('--- [AI ROUTE CRASH] ---');
    console.error(error);
    return NextResponse.json({ 
      error: 'فشل النظام في معالجة طلب التحليل.',
      details: error.message 
    }, { status: 500 });
  }
}
