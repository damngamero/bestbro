import { NextRequest, NextResponse } from 'next/server';
import { generateRecipeVariation } from '@/ai/flows/generate-recipe-variation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await generateRecipeVariation(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe variation.' },
      { status: 500 }
    );
  }
}
