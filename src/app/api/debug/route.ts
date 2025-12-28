import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: Record<string, unknown> = {};
  
  // Check environment
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  debug.NODE_ENV = process.env.NODE_ENV || 'not set';
  
  // Get origin from headers
  const headersList = await headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const origin = host ? `${proto}://${host}` : 'unknown';
  
  debug.host = host;
  debug.proto = proto;
  debug.origin = origin;
  
  // Try to fetch species.json from public folder
  try {
    const url = `${origin}/data/taxonomy/species.json`;
    debug.fetchUrl = url;
    
    const response = await fetch(url, { cache: 'no-store' });
    debug.fetchStatus = response.status;
    debug.fetchOk = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      debug.speciesCount = data.data?.length || 0;
      debug.sampleSlugs = data.data?.slice(0, 3).map((s: { Slug: string }) => s.Slug);
    } else {
      debug.fetchError = await response.text();
    }
  } catch (e) {
    debug.fetchException = String(e);
  }
  
  return NextResponse.json(debug, { status: 200 });
}
