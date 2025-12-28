import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: Record<string, unknown> = {};
  
  // Check environment variables
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  debug.NODE_ENV = process.env.NODE_ENV || 'not set';
  debug.cwd = process.cwd();
  
  // Check what directories exist
  const checkPaths = [
    'public',
    'public/data',
    'public/data/taxonomy',
    '.next',
    '.next/server',
  ];
  
  debug.pathsExist = {};
  for (const p of checkPaths) {
    const fullPath = path.join(process.cwd(), p);
    try {
      const exists = fs.existsSync(fullPath);
      (debug.pathsExist as Record<string, boolean>)[p] = exists;
      if (exists && fs.statSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath).slice(0, 10);
        (debug.pathsExist as Record<string, unknown>)[p + '_files'] = files;
      }
    } catch (e) {
      (debug.pathsExist as Record<string, string>)[p] = `error: ${e}`;
    }
  }
  
  // Try to fetch species.json
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  debug.baseUrl = baseUrl;
  
  try {
    const response = await fetch(`${baseUrl}/data/taxonomy/species.json`, {
      cache: 'no-store'
    });
    debug.fetchStatus = response.status;
    debug.fetchOk = response.ok;
    if (response.ok) {
      const data = await response.json();
      debug.speciesCount = data.data?.length || 0;
      debug.firstSlug = data.data?.[0]?.Slug || 'none';
    }
  } catch (e) {
    debug.fetchError = String(e);
  }
  
  return NextResponse.json(debug, { status: 200 });
}

