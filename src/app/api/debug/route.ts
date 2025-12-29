import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const debug: Record<string, unknown> = {};
  
  // Get URL from request
  const url = new URL(request.url);
  debug.requestUrl = request.url;
  debug.host = url.host;
  debug.origin = url.origin;
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  
  // Try to fetch species.json using the request's origin
  const fetchUrl = `${url.origin}/data/taxonomy/species.json`;
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
      debug.fetchErrorText = await response.text().catch(() => 'could not read');
    }
  } catch (e) {
    debug.fetchException = String(e);
  }
  
  return NextResponse.json(debug);
}
