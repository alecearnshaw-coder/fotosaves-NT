import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fotosaves - Bird Groups',
};

export default function GrupoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* CSS stylesheets are loaded via link tags in head */}
      <link rel="stylesheet" href="/lightbox/css/lightbox.css" />
      <link rel="stylesheet" href="/styles/Species_Builder_styles.css" />
      <link rel="stylesheet" href="/styles/shared_header.css" />

      {/* Wrap content in grupo-page class for styling */}
      <div className="grupo-page">
        {children}
      </div>
    </>
  );
}


