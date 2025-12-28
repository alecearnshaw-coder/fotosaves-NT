/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Group pages still use CSR for now
      {
        source: '/grupo/:path*',
        destination: '/grupo.html',
      },
      // Species pages with .html extension map to SSR route
      {
        source: '/especie/:slug.html',
        destination: '/especie/:slug',
      },
      
      // ============================================
      // OLD SITE URL FORMATS → New SSR route
      // ============================================
      
      // Standard: /{Order}/Fotos_{Slug}.html
      // Example: /Rheiformes/Fotos_Choique.html → /especie/Choique
      {
        source: '/:order/Fotos_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Passeriformes with Family: /{Order}/{Family}/Fotos_{Slug}.html
      // Example: /Passeriformes/Cotingidae/Fotos_Cortarramas.html → /especie/Cortarramas
      {
        source: '/:order/:family/Fotos_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Charadriiformes ad-hoc: FotosPlayerasA/B/C_{Slug}.html
      // Example: /Charadriiformes/FotosPlayerasA_ChorloPampa.html → /especie/ChorloPampa
      {
        source: '/Charadriiformes/FotosPlayerasA_:slug.html',
        destination: '/especie/:slug',
      },
      {
        source: '/Charadriiformes/FotosPlayerasB_:slug.html',
        destination: '/especie/:slug',
      },
      {
        source: '/Charadriiformes/FotosPlayerasC_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Tinamiformes: FotosPerdices_{Slug}.html
      {
        source: '/:order/FotosPerdices_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Sphenisciformes: FotosPinguinos_{Slug}.html or FotosPinguino_{Slug}.html
      {
        source: '/:order/FotosPinguinos_:slug.html',
        destination: '/especie/:slug',
      },
      {
        source: '/:order/FotosPinguino_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Rheiformes: FotosRheas_{Slug}.html
      {
        source: '/:order/FotosRheas_:slug.html',
        destination: '/especie/:slug',
      },
      
      // Gruiformes: FotosGruiformes-{Slug}.html (note the hyphen)
      {
        source: '/:order/FotosGruiformes-:slug.html',
        destination: '/especie/:slug',
      },
    ];
  },
};

export default nextConfig;