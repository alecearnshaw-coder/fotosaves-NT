// Home page - redirects to the main Spanish page
export default function Home() {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/aves';`,
        }}
      />
      <p>Redirecting to fotosaves.com.ar...</p>
    </div>
  );
}
