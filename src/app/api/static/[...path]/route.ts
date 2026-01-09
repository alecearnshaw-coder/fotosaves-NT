import { NextResponse } from 'next/server';

// This route is intentionally disabled; static assets are served natively from /public.
export async function GET() {
  return new NextResponse('Not implemented', { status: 404 });
}


