import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fotosaves - Bird Photos',
};

export default function SpeciesLayout({
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
      
      {/* Wrap content in species-page class for styling */}
      <div className="species-page">
        {children}
      </div>
    </>
  );
}
