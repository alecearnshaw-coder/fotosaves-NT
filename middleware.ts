import { NextRequest, NextResponse } from 'next/server';

// Canonical list of bird orders (same source of truth as redirects)
const BIRD_ORDERS = new Set([
  'Rheiformes',
  'Tinamiformes',
  'Anseriformes',
  'Galliformes',
  'Phoenicopteriformes',
  'Podicipediformes',
  'Cuculiformes',
  'Columbiformes',
  'Gruiformes',
  'Charadriiformes',
  'Sphenisciformes',
  'Procellariiformes',
  'Ciconiformes',
  'Suliformes',
  'Pelecaniformes',
  'Caprimulgiformes',
  'Nyctibiiformes',
  'Strigiformes',
  'Apodiformes',
  'Trochiliformes',
  'Piciformes',
  'Cathartiformes',
  'Accipitriformes',
  'Trogoniformes',
  'Coraciformes',
  'Galbuliformes',
  'Cariamiformes',
  'Falconiformes',
  'Psittaciformes',
  'Passeriformes',
]);

export function middleware(request: NextRequest) {
  const nxtPstatic = request.nextUrl.searchParams.get('nxtPstatic');

  if (!nxtPstatic) {
    return NextResponse.next();
  }

  const decoded = decodeURIComponent(nxtPstatic);

  // Safety: must look like a file
  if (!decoded.includes('/')) {
    return NextResponse.next();
  }

  const [segment, ...rest] = decoded.split('/');

  let resolvedPath: string;

  if (BIRD_ORDERS.has(segment)) {
    // Bird images
    resolvedPath = `/images/Aves/${decoded}`;
  } else {
    // Legacy static images
    resolvedPath = `/${decoded}`;
  }

  return NextResponse.redirect(
    new URL(resolvedPath, request.url),
    301
  );
}
