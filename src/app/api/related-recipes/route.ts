import { NextRequest, NextResponse } from 'next/server';
import { generateRelatedRecipes } from '@/ai/flows/generate-related-recipes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeName, apiKey, model } = body;

    const result = await generateRelatedRecipes({
      recipeName,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate related recipes.' },
      { status: 500 }
    );
  }
}
