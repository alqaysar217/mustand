import { NextResponse } from 'next/server';
import { testApiFlow } from '@/ai/flows/test-api-flow';

export async function GET() {
  try {
    const result = await testApiFlow("");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
