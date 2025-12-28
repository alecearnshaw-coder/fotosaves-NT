export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Page Works!</h1>
      <p>If you see this, App Router pages are working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}

