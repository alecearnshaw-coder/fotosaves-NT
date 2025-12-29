import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Debug route works!',
    VERCEL_URL: process.env.VERCEL_URL || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    time: new Date().toISOString()
  });
}
