import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/');
    const filePath = join(process.cwd(), 'public', 'FotosMamiferos', `${filename}.html`);

    // Read the HTML file
    const htmlContent = readFileSync(filePath, 'utf8');

    // Return the HTML content with proper content type
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    // If file doesn't exist, return 404
    return new NextResponse('File not found', { status: 404 });
  }
}
