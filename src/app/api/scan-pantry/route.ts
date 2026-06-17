// File: src/app/api/scan-pantry/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { scanPantry } from '@/ai/flows/scan-pantry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoDataUris, apiKey, model } = body;

    if (!Array.isArray(photoDataUris) || photoDataUris.length === 0) {
      return NextResponse.json({ error: 'No photo provided.' }, { status: 400 });
    }

    const result = await scanPantry({ photoDataUris, apiKey, model });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in scan-pantry API route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to scan the pantry photo on the server.' },
      { status: 500 }
    );
  }
}
