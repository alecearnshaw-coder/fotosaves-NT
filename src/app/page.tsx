// Home page - redirects to the main index page
export default function Home() {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/index.html';`,
        }}
      />
      <p>Redirecting to fotosaves.com.ar...</p>
    </div>
  );
}
