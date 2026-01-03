/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/grupo/:path*',
        destination: '/grupo.html',
      },
      // OLD TAXONOMY URL FORMATS - complex directory structure
      // Orders: /{OrderName}/Fotos{OrderName}.html
      {
        source: '/:orderName/Fotos:orderName\\.html',
        destination: '/api/taxonomy-redirect/order/:orderName',
      },
      // Charadriiformes suborders: /Charadriiformes/FotosCharadriiformes{A,B,C}.html
      {
        source: '/Charadriiformes/FotosCharadriiformesA.html',
        destination: '/api/taxonomy-redirect/suborder/Charadrii',
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesB.html',
        destination: '/api/taxonomy-redirect/suborder/Scolopaci',
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesC.html',
        destination: '/api/taxonomy-redirect/suborder/Lari',
      },
      // Passeriformes families: /Passeriformes/{FamilyName}/Fotos{FamilyName}.html
      {
        source: '/Passeriformes/:familyName/Fotos:familyName\\.html',
        destination: '/api/taxonomy-redirect/family/:familyName',
      },
      // Subfamilies: /Passeriformes/{FamilyName}/Fotos{SubfamilyName}.html
      {
        source: '/Passeriformes/:familyName/Fotos:subfamilyName\\.html',
        destination: '/api/taxonomy-redirect/subfamily/:subfamilyName',
      },
      // Non-Passeriformes families: /{OrderName}/{FamilyName}/Fotos{FamilyName}.html
      {
        source: '/:orderName/:familyName/Fotos:familyName\\.html',
        destination: '/api/taxonomy-redirect/family/:familyName',
      },
      // Root-level species pages (old format) - redirect by slug
      {
        source: '/:slug.html',
        destination: '/api/species-redirect-by-slug?slug=:slug',
      },
      // Main pages
      {
        source: '/Aves.html',
        destination: '/aves',
      },
      {
        source: '/Birds.html',
        destination: '/birds',
      },
      // OLD URL FORMATS - rewrite to new SSR species pages
      // Format: /{Order}/Fotos_{Slug}.html → /especie/{Slug}
      {
        source: '/:order/Fotos_:slug.html',
        destination: '/especie/:slug',
      },
      // Format: /{Order}/{Family}/Fotos_{Slug}.html → /especie/{Slug}
      {
        source: '/:order/:family/Fotos_:slug.html',
        destination: '/especie/:slug',
      },
      // Tinamiformes special format: FotosPerdices_{Slug}.html
      {
        source: '/Tinamiformes/FotosPerdices_:slug.html',
        destination: '/especie/:slug',
      },
      // Sphenisciformes special format: FotosPinguinos_{Slug}.html
      {
        source: '/Sphenisciformes/FotosPinguinos_:slug.html',
        destination: '/especie/:slug',
      },
      {
        source: '/Sphenisciformes/FotosPinguino_:slug.html',
        destination: '/especie/:slug',
      },
      // Gruiformes special format: FotosGruiformes-{Slug}.html
      {
        source: '/Gruiformes/FotosGruiformes-:slug.html',
        destination: '/especie/:slug',
      },
      // Rheiformes special format: FotosRheas_{Slug}.html
      {
        source: '/Rheiformes/FotosRheas_:slug.html',
        destination: '/especie/:slug',
      },
      // Charadriiformes special format: FotosPlayerasX_{Slug}.html
      {
        source: '/Charadriiformes/FotosPlayerasX_:slug.html',
        destination: '/especie/:slug',
      },
    ];
  },
};

export default nextConfig;