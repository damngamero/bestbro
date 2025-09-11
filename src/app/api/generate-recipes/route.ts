// File: src/app/api/generate-recipes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateRecipesFromIngredients } from '@/ai/flows/generate-recipes-from-ingredients';

export async function POST(request: NextRequest) {
  try {
    // Get the data from the request sent by the frontend
    const body = await request.json();
    const { ingredients, halalMode, allergens, maxCookTime, apiKey, model } = body;

    // Call your original AI flow function securely on the server
    const result = await generateRecipesFromIngredients({
      ingredients,
      halalMode,
      allergens,
      maxCookTime,
      apiKey,
      model,
    });

    // Send the result back to the frontend
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    // Send a detailed error response back to the frontend
    return NextResponse.json(
      { error: 'Failed to generate recipes on the server.' },
      { status: 500 }
    );
  }
}
