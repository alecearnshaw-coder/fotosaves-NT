import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const filePath = resolvedParams.path.join('/');

  // Security check - only allow access to known static sections
  const allowedSections = ['FotosMamiferos', 'FotosReptiles', 'FotosInsectos', 'FotosAranias', 'Videos', 'Pinturas', 'Viajes'];

  if (!allowedSections.some(section => filePath.startsWith(section))) {
    return new NextResponse('Access denied', { status: 403 });
  }

  const fullPath = join(process.cwd(), 'public', filePath);

  if (!existsSync(fullPath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  try {
    const fileContent = readFileSync(fullPath, 'utf8');

    // Set appropriate content type based on file extension
    const contentType = filePath.endsWith('.html') ? 'text/html; charset=utf-8' :
                       filePath.endsWith('.css') ? 'text/css' :
                       filePath.endsWith('.js') ? 'application/javascript' :
                       'text/plain';

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}


