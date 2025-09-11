import { NextRequest, NextResponse } from 'next/server';
import { troubleshootStep } from '@/ai/flows/troubleshoot-step';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeName, instruction, problem, apiKey, model } = body;

    const result = await troubleshootStep({
      recipeName,
      instruction,
      problem,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to get troubleshooting advice.' },
      { status: 500 }
    );
  }
}
