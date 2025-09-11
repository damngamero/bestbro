// File: src/app/api/recipe-details/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateRecipeDetails } from '@/ai/flows/generate-recipe-details';

export async function POST(request: NextRequest) {
  try {
    // Get the data from the request sent by the frontend
    const body = await request.json();
    const { recipeName, halalMode, allergens, apiKey, model } = body;

    // Call your original AI flow function securely on the server
    const result = await generateRecipeDetails({
      recipeName,
      halalMode,
      allergens,
      apiKey,
      model,
    });

    // Send the result back to the frontend
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    // Send a detailed error response back to the frontend
    return NextResponse.json(
      { error: 'Failed to generate recipe details on the server.' },
      { status: 500 }
    );
  }
}
