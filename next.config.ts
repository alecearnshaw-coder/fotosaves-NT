/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Main pages
      {
        source: '/Aves.html',
        destination: '/aves',
        permanent: true,
      },
      {
        source: '/Birds.html',
        destination: '/birds',
        permanent: true,
      },
      // Specific order redirects (examples)
      {
        source: '/Rheiformes/FotosRheiformes.html',
        destination: '/grupo?path=Rheiformes/&groupType=order&groupId=Rheiformes',
        permanent: true,
      },
      {
        source: '/Tinamiformes/FotosTinamiformes.html',
        destination: '/grupo?path=Tinamiformes/&groupType=order&groupId=Tinamiformes',
        permanent: true,
      },
      {
        source: '/Anseriformes/FotosAnseriformes.html',
        destination: '/grupo?path=Anseriformes/&groupType=order&groupId=Anseriformes',
        permanent: true,
      },
      // Charadriiformes suborders
      {
        source: '/Charadriiformes/FotosCharadriiformesA.html',
        destination: '/grupo?groupType=suborder&groupId=Charadrii',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesB.html',
        destination: '/grupo?groupType=suborder&groupId=Scolopaci',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesC.html',
        destination: '/grupo?groupType=suborder&groupId=Lari',
        permanent: true,
      },
      // Specific family redirects (examples)
      {
        source: '/Passeriformes/Icteridae/FotosIcteridae.html',
        destination: '/grupo?path=Passeriformes/Icteridae/&groupType=family&groupId=Icteridae',
        permanent: true,
      },
      {
        source: '/Charadriiformes/Scolopacidae/FotosScolopacidae.html',
        destination: '/grupo?path=Charadriiformes/Scolopacidae/&groupType=family&groupId=Scolopacidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Cotingidae/FotosCotingidae.html',
        destination: '/grupo?path=Passeriformes/Cotingidae/&groupType=family&groupId=Cotingidae',
        permanent: true,
      },
      // Root-level species pages
      {
        source: '/:slug.html',
        destination: '/api/species-redirect-by-slug?slug=:slug',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/grupo/:path*',
        destination: '/grupo.html',
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