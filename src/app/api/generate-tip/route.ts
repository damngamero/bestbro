import { NextRequest, NextResponse } from 'next/server';
import { generateCookingTip } from '@/ai/flows/generate-cooking-tip';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { previousTips, context, apiKey, model } = body;

    const result = await generateCookingTip({
      previousTips,
      context,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate cooking tip.' },
      { status: 500 }
    );
  }
}
