/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Main pages (highest priority)
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
      // Legacy static entry points (redirect so relative assets resolve from subfolders)
      {
        source: '/FotosReptiles.html',
        destination: '/FotosReptiles/FotosReptiles.html',
        permanent: true,
      },
      {
        source: '/FotosInsectos.html',
        destination: '/FotosInsectos/Index_Insecta_En.html',
        permanent: true,
      },
      {
        source: '/FotosAranias.html',
        destination: '/FotosAranias/FotosAranias.html',
        permanent: true,
      },
      {
        source: '/FotosLibelulas.html',
        destination: '/FotosLibelulas/FotosLibelulas.html',
        permanent: true,
      },
      {
        source: '/FotosMariposas.html',
        destination: '/FotosMariposas/FotosMariposas.html',
        permanent: true,
      },
      {
        source: '/FotosOtrosInvertebrados.html',
        destination: '/FotosOtrosInvertebrados/FotosOtrosInvertebrados.html',
        permanent: true,
      },
      {
        source: '/Relatos.html',
        destination: '/Relatos/Relatos.html',
        permanent: true,
      },
      {
        source: '/TripReports.html',
        destination: '/Relatos/TripReports.html',
        permanent: true,
      },
      {
        source: '/Videos.html',
        destination: '/Videos/Videos.html',
        permanent: true,
      },
      {
        source: '/Paintings.html',
        destination: '/MyPaintings/Paintings.html',
        permanent: true,
      },
      // Specific working redirects (fallback for reliability)
      {
        source: '/Rheiformes/FotosRheiformes.html',
        destination: '/grupo?path=Rheiformes/&groupType=order&groupId=Rheiformes',
        permanent: true,
      },
      {
        source: '/Anseriformes/FotosAnseriformes.html',
        destination: '/grupo?path=Anseriformes/&groupType=order&groupId=Anseriformes',
        permanent: true,
      },
      {
        source: '/Galliformes/FotosGalliformes.html',
        destination: '/grupo?path=Galliformes/&groupType=order&groupId=Galliformes',
        permanent: true,
      },
      {
        source: '/Sphenisciformes/FotosSphenisciformes.html',
        destination: '/grupo?path=Sphenisciformes/&groupType=order&groupId=Sphenisciformes',
        permanent: true,
      },
      {
        source: '/Passeriformes/Icteridae/FotosIcteridae.html',
        destination: '/grupo?path=Passeriformes/Icteridae/&groupType=family&groupId=Icteridae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Cotingidae/FotosCotingidae.html',
        destination: '/grupo?path=Passeriformes/Cotingidae/&groupType=family&groupId=Cotingidae',
        permanent: true,
      },
      // Specific redirects for commonly tested groups (most reliable)
      {
        source: '/Podicipediformes/FotosPodicipediformes.html',
        destination: '/grupo?path=Podicipediformes/&groupType=order&groupId=Podicipediformes',
        permanent: true,
      },
      {
        source: '/Phoenicopteriformes/FotosPhoenicopteriformes.html',
        destination: '/grupo?path=Phoenicopteriformes/&groupType=order&groupId=Phoenicopteriformes',
        permanent: true,
      },
      {
        source: '/Phoenicopteriformes/FotosPhenicopteriformes.html',
        destination: '/grupo?path=Phoenicopteriformes/&groupType=order&groupId=Phoenicopteriformes',
        permanent: true,
      },
      {
        source: '/Procellariiformes/FotosProcellariiformes.html',
        destination: '/grupo?path=Procellariiformes/&groupType=order&groupId=Procellariiformes',
        permanent: true,
      },
      {
        source: '/Suliformes/FotosSuliformes.html',
        destination: '/grupo?path=Suliformes/&groupType=order&groupId=Suliformes',
        permanent: true,
      },
      {
        source: '/Pelecaniformes/FotosPelecaniformes.html',
        destination: '/grupo?path=Pelecaniformes/&groupType=order&groupId=Pelecaniformes',
        permanent: true,
      },
      {
        source: '/Cathartiformes/FotosCathartiformes.html',
        destination: '/grupo?path=Cathartiformes/&groupType=order&groupId=Cathartiformes',
        permanent: true,
      },
      {
        source: '/Falconiformes/FotosFalconiformes.html',
        destination: '/grupo?path=Falconiformes/&groupType=order&groupId=Falconiformes',
        permanent: true,
      },
      {
        source: '/Passeriformes/Troglodytidae/FotosTroglodytidae.html',
        destination: '/grupo?path=Passeriformes/Troglodytidae/&groupType=family&groupId=Troglodytidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Polioptilidae/FotosPolioptilidae.html',
        destination: '/grupo?path=Passeriformes/Polioptilidae/&groupType=family&groupId=Polioptilidae',
        permanent: true,
      },
      {
        source: '/Charadriiformes/Scolopacidae/FotosScolopacidae.html',
        destination: '/grupo?path=Charadriiformes/Scolopacidae/&groupType=family&groupId=Scolopacidae',
        permanent: true,
      },
      // Specific taxonomy redirects (only for bird orders/families)
      {
        source: '/Anseriformes/:filename.html',
        destination: '/api/taxonomy-redirect/Anseriformes/:filename.html',
        permanent: true,
      },
      {
        source: '/Apodiformes/:filename.html',
        destination: '/api/taxonomy-redirect/Apodiformes/:filename.html',
        permanent: true,
      },
      {
        source: '/Cathartiformes/:filename.html',
        destination: '/api/taxonomy-redirect/Cathartiformes/:filename.html',
        permanent: true,
      },
      {
        source: '/Falconiformes/:filename.html',
        destination: '/api/taxonomy-redirect/Falconiformes/:filename.html',
        permanent: true,
      },
      {
        source: '/Passeriformes/:segment/:filename.html',
        destination: '/api/taxonomy-redirect/Passeriformes/:segment/:filename.html',
        permanent: true,
      },
      {
        source: '/Charadriiformes/:segment/:filename.html',
        destination: '/api/taxonomy-redirect/Charadriiformes/:segment/:filename.html',
        permanent: true,
      }
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
      // Charadriiformes special format: FotosPlayerasA_{Slug}.html
      {
        source: '/Charadriiformes/FotosPlayerasA_:slug.html',
        destination: '/especie/:slug',
      },
      // Rheiformes special format: FotosRhea_{Slug}.html
      {
        source: '/Rheiformes/FotosRhea_:slug.html',
        destination: '/especie/:slug',
      },
      // Order/family directory fallbacks to grupo page
      {
        source: '/:order(Falconiformes|Accipitriformes|Anseriformes|Charadriiformes|Passeriformes|Piciformes|Tinamiformes|Rheiformes|Phoenicopteriformes|Procellariiformes|Suliformes|Pelecaniformes|Cathartiformes)/:family',
        destination: '/grupo?path=:order/:family/&groupType=family&groupId=:family',
      },
      {
        source: '/:order(Falconiformes|Accipitriformes|Anseriformes|Charadriiformes|Passeriformes|Piciformes|Tinamiformes|Rheiformes|Phoenicopteriformes|Procellariiformes|Suliformes|Pelecaniformes|Cathartiformes)',
        destination: '/grupo?path=:order/&groupType=order&groupId=:order',
      },
    ];
  },
};

export default nextConfig;