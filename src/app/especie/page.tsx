// Next.js page to serve the Species Builder HTML
// This redirects to the static HTML file in the public folder

export default function EspeciePage() {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/especie.html' + window.location.search;`,
        }}
      />
      <p>Redirecting...</p>
    </div>
  );
}

