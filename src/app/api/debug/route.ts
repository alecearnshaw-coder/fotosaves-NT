import { NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: Record<string, unknown> = {};
  
  // Check environment
  debug.VERCEL_URL = process.env.VERCEL_URL || 'not set';
  debug.NODE_ENV = process.env.NODE_ENV || 'not set';
  debug.cwd = process.cwd();
  
  // Check what directories exist
  const checkPaths = [
    'src/data',
    'src/data/taxonomy',
    'src/data/species',
  ];
  
  debug.pathsExist = {};
  for (const p of checkPaths) {
    const fullPath = join(process.cwd(), p);
    try {
      const exists = existsSync(fullPath);
      (debug.pathsExist as Record<string, boolean>)[p] = exists;
      if (exists) {
        const files = readdirSync(fullPath).slice(0, 5);
        (debug.pathsExist as Record<string, unknown>)[p + '_sample'] = files;
      }
    } catch (e) {
      (debug.pathsExist as Record<string, string>)[p] = `error: ${e}`;
    }
  }
  
  // Try to read species.json directly
  try {
    const speciesPath = join(process.cwd(), 'src/data/taxonomy/species.json');
    if (existsSync(speciesPath)) {
      const content = readFileSync(speciesPath, 'utf8');
      const data = JSON.parse(content);
      debug.speciesFileExists = true;
      debug.speciesCount = data.data?.length || 0;
      debug.firstSlug = data.data?.[0]?.Slug || 'none';
      debug.sampleSlugs = data.data?.slice(0, 3).map((s: { Slug: string }) => s.Slug);
    } else {
      debug.speciesFileExists = false;
    }
  } catch (e) {
    debug.speciesReadError = String(e);
  }
  
  return NextResponse.json(debug, { status: 200 });
}
