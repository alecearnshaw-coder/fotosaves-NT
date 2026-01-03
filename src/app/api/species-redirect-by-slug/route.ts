import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Species {
  Species_ID: string;
  Slug: string | null;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.redirect(new URL('/aves', request.url));
  }

  try {
    // Load species data to find the species by slug
    const filePath = path.join(process.cwd(), 'src/data/taxonomy/species.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const speciesData = JSON.parse(fileContents);

    const species = speciesData.data.find((sp: Species) => sp.Slug === slug);

    if (species && species.Slug) {
      // Redirect to the new SSR species page
      return NextResponse.redirect(new URL(`/especie/${species.Slug}`, request.url));
    } else {
      // Species not found - redirect to aves page
      return NextResponse.redirect(new URL('/aves', request.url));
    }
  } catch (error) {
    console.error('Error loading species data:', error);
    return NextResponse.redirect(new URL('/aves', request.url));
  }
}
