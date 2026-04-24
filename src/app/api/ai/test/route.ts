
import { NextResponse } from 'next/server';

/**
 * مسار فحص الاتصال عبر OpenRouter لضمان عمل المفتاح.
 */
export async function GET() {
  const OPENROUTER_API_KEY = "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";
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: 'أجب بكلمة واحدة: متصل' }]
      })
    });

    const data = await response.json();
    
    if (response.ok && data.choices) {
      return NextResponse.json({ 
        success: true, 
        message: 'تم الاتصال بنجاح بمحرك OpenRouter! المفتاح يعمل والموديل Gemini 2.0 مستعد.' 
      });
    }
    
    throw new Error(data.error?.message || 'رد غير معروف من الخادم');
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'فشل الاتصال بالمحرك.',
      rawError: error.message
    }, { status: 500 });
  }
}
