import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Species {
  Species_ID: string;
  Slug: string | null;
}

export async function GET(request: NextRequest) {
  const speciesId = request.nextUrl.searchParams.get('speciesId');
  
  if (!speciesId) {
    return NextResponse.redirect(new URL('/Aves.html', request.url));
  }

  try {
    // Load species data to find the slug
    const filePath = path.join(process.cwd(), 'public/data/taxonomy/species.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const speciesData = JSON.parse(fileContents);
    
    const species = speciesData.data.find((sp: Species) => sp.Species_ID === speciesId);
    
    if (species && species.Slug) {
      // Redirect to the new SSR page with slug
      return NextResponse.redirect(new URL(`/especie/${species.Slug}`, request.url));
    } else {
      // Species not found or has no slug - redirect to birds page
      return NextResponse.redirect(new URL('/Aves.html', request.url));
    }
  } catch (error) {
    console.error('Error loading species data:', error);
    return NextResponse.redirect(new URL('/Aves.html', request.url));
  }
}

