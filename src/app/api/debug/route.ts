import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const debug: Record<string, unknown> = {};
  
  // Get URL from request
  const url = new URL(request.url);
  debug.requestUrl = request.url;
  debug.host = url.host;
  debug.origin = url.origin;
  
  // Environment
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  debug.NODE_ENV = process.env.NODE_ENV || 'not set';
  
  // Try to fetch species.json
  const fetchUrl = `${url.origin}/data/taxonomy/species.json`;
  debug.fetchUrl = fetchUrl;
  
  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' });
    debug.fetchStatus = response.status;
    debug.fetchOk = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      debug.speciesCount = data.data?.length || 0;
      debug.sampleSlugs = data.data?.slice(0, 3).map((s: { Slug: string }) => s.Slug);
    }
  } catch (e) {
    debug.fetchError = String(e);
  }
  
  return NextResponse.json(debug);
}
