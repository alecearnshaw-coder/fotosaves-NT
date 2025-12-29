import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API test2 route works!',
    time: new Date().toISOString()
  });
}

