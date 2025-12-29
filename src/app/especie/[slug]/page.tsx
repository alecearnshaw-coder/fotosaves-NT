import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Minimal test - just show the slug
export default async function SpeciesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Species Page Works!</h1>
      <p>Slug: <strong>{slug}</strong></p>
      <p>Time: {new Date().toISOString()}</p>
      <p>VERCEL_URL: {process.env.VERCEL_URL || 'not set'}</p>
    </div>
  );
}
