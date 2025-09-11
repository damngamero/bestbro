import { NextRequest, NextResponse } from 'next/server';
import { identifyTimedSteps } from '@/ai/flows/identify-timed-steps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instructions, apiKey, model } = body;

    const result = await identifyTimedSteps({
      instructions,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to identify timed steps.' },
      { status: 500 }
    );
  }
}
