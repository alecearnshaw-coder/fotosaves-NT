export default async function TestDynamicPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Dynamic Route Works!</h1>
      <p>ID from URL: <strong>{id}</strong></p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}

