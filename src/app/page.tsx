// Home page - redirects to the main Spanish index
export default function Home() {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/index_sp.html';`,
        }}
      />
      <p>Redirecting to fotosaves.com.ar...</p>
    </div>
  );
}
