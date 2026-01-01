import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fotos de Aves - Nueva Versión',
};

export default function AvesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* CSS stylesheets are loaded via link tags in head */}
      <link rel="stylesheet" href="/styles/shared_header.css" />
      <link rel="stylesheet" href="/lightbox/css/lightbox.css" />
      <script src="/scripts/shared/copyright.js"></script>
      <script src="/scripts/shared/speciesSearch.js"></script>

      {/* Wrap content in aves-page class for styling */}
      <div className="aves-page">
        {children}
      </div>
    </>
  );
}