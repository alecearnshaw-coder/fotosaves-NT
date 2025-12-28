import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test route works!',
    time: new Date().toISOString()
  });
}

