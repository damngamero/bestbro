import { NextRequest, NextResponse } from 'next/server';
import { generateStepDescription } from '@/ai/flows/generate-step-description';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeName, instruction, apiKey, model } = body;

    const result = await generateStepDescription({
      recipeName,
      instruction,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate step description.' },
      { status: 500 }
    );
  }
}
