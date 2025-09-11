import { NextRequest, NextResponse } from 'next/server';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, apiKey, model } = body;

    const result = await suggestRecipes({
      query,
      apiKey,
      model,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to suggest recipes.' },
      { status: 500 }
    );
  }
}
