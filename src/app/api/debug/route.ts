import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const debug: Record<string, unknown> = {};
  
  // Get URL from request
  const url = new URL(request.url);
  debug.requestUrl = request.url;
  debug.host = url.host;
  
  // Use production domain instead of preview URL
  const origin = process.env.VERCEL 
    ? 'https://fotosaves-nt.vercel.app' 
    : 'http://localhost:3000';
  debug.origin = origin;
  debug.VERCEL = process.env.VERCEL || 'not set';
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  
  // Try to fetch species.json using production domain
  const fetchUrl = `${origin}/data/taxonomy/species.json`;
  debug.fetchUrl = fetchUrl;
  
  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' });
    debug.fetchStatus = response.status;
    debug.fetchOk = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      debug.speciesCount = data.data?.length || 0;
      debug.firstSlug = data.data?.[0]?.Slug || 'none';
    } else {
      const text = await response.text();
      debug.fetchErrorText = text.substring(0, 200) + '...';
    }
  } catch (e) {
    debug.fetchException = String(e);
  }
  
  return NextResponse.json(debug);
}
