// Simple Next.js page to serve the Group Builder HTML
// This redirects to the static HTML file in the public folder

export default function GrupoPage() {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/grupo.html' + window.location.search;`,
        }}
      />
      <p>Redirecting...</p>
    </div>
  );
}

