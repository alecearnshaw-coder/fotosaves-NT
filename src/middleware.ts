import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles legacy URL redirects
// Old format: /especie?speciesId=SP_0001&imagesPath=Rheiformes/
// New format: /especie/Choique (using slug)

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle old species page URLs with query parameters
  if (pathname === '/especie' || pathname === '/especie.html') {
    const speciesId = searchParams.get('speciesId');
    
    if (speciesId) {
      // We need to look up the slug for this species ID
      // Since middleware runs on the edge, we'll redirect to a handler
      // that can do the lookup, or we use a static mapping
      
      // For now, redirect to a special handler that will do the lookup
      const url = request.nextUrl.clone();
      url.pathname = '/api/species-redirect';
      url.searchParams.set('speciesId', speciesId);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/especie', '/especie.html'],
};

