import { NextRequest, NextResponse } from 'next/server';
import { generateRandomRecipes } from '@/ai/flows/generate-random-recipes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count, apiKey, model } = body;

    const result = await generateRandomRecipes({
      count,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate random recipes.' },
      { status: 500 }
    );
  }
}
