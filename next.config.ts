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
      // Catch-all taxonomy redirects - send all .html files to API for processing
      {
        source: '/:path*',
        destination: '/api/taxonomy-redirect/:path*',
        permanent: true,
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/Sphenisciformes/FotosSphenisciformes.html',
        destination: '/grupo?path=Sphenisciformes/&groupType=order&groupId=Sphenisciformes',
        permanent: true,
      },
      {
        source: '/Phoenicopteriformes/FotosPhoenicopteriformes.html',
        destination: '/grupo?path=Phoenicopteriformes/&groupType=order&groupId=Phoenicopteriformes',
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
        source: '/Procellariiformes/FotosProcellariiformes.html',
        destination: '/grupo?path=Procellariiformes/&groupType=order&groupId=Procellariiformes',
        permanent: true,
      },
      {
        source: '/Accipitriformes/FotosAccipitriformes.html',
        destination: '/grupo?path=Accipitriformes/&groupType=order&groupId=Accipitriformes',
        permanent: true,
      },
      {
        source: '/Columbiformes/FotosColumbiformes.html',
        destination: '/grupo?path=Columbiformes/&groupType=order&groupId=Columbiformes',
        permanent: true,
      },
      {
        source: '/Cariamiformes/FotosCariamiformes.html',
        destination: '/grupo?path=Cariamiformes/&groupType=order&groupId=Cariamiformes',
        permanent: true,
      },
      // Additional major orders
      {
        source: '/Podicipediformes/FotosPodicipediformes.html',
        destination: '/grupo?path=Podicipediformes/&groupType=order&groupId=Podicipediformes',
        permanent: true,
      },
      {
        source: '/Cuculiformes/FotosCuculiformes.html',
        destination: '/grupo?path=Cuculiformes/&groupType=order&groupId=Cuculiformes',
        permanent: true,
      },
      {
        source: '/Gruiformes/FotosGruiformes.html',
        destination: '/grupo?path=Gruiformes/&groupType=order&groupId=Gruiformes',
        permanent: true,
      },
      {
        source: '/Ciconiiformes/FotosCiconiiformes.html',
        destination: '/grupo?path=Ciconiiformes/&groupType=order&groupId=Ciconiiformes',
        permanent: true,
      },
      {
        source: '/Suliformes/FotosSuliformes.html',
        destination: '/grupo?path=Suliformes/&groupType=order&groupId=Suliformes',
        permanent: true,
      },
      {
        source: '/Caprimulgiformes/FotosCaprimulgiformes.html',
        destination: '/grupo?path=Caprimulgiformes/&groupType=order&groupId=Caprimulgiformes',
        permanent: true,
      },
      {
        source: '/Apodiformes/FotosApodiformes.html',
        destination: '/grupo?path=Apodiformes/&groupType=order&groupId=Apodiformes',
        permanent: true,
      },
      {
        source: '/Strigiformes/FotosStrigiformes.html',
        destination: '/grupo?path=Strigiformes/&groupType=order&groupId=Strigiformes',
        permanent: true,
      },
      {
        source: '/Trogoniformes/FotosTrogoniformes.html',
        destination: '/grupo?path=Trogoniformes/&groupType=order&groupId=Trogoniformes',
        permanent: true,
      },
      {
        source: '/Piciformes/FotosPiciformes.html',
        destination: '/grupo?path=Piciformes/&groupType=order&groupId=Piciformes',
        permanent: true,
      },
      {
        source: '/Falconiformes/FotosFalconiformes.html',
        destination: '/grupo?path=Falconiformes/&groupType=order&groupId=Falconiformes',
        permanent: true,
      },
      {
        source: '/Psittaciformes/FotosPsittaciformes.html',
        destination: '/grupo?path=Psittaciformes/&groupType=order&groupId=Psittaciformes',
        permanent: true,
      },
      // Major Passerine families
      {
        source: '/Passeriformes/Tyrannidae/FotosTyrannidae.html',
        destination: '/grupo?path=Passeriformes/Tyrannidae/&groupType=family&groupId=Tyrannidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Thamnophilidae/FotosThamnophilidae.html',
        destination: '/grupo?path=Passeriformes/Thamnophilidae/&groupType=family&groupId=Thamnophilidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Turdidae/FotosTurdidae.html',
        destination: '/grupo?path=Passeriformes/Turdidae/&groupType=family&groupId=Turdidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Emberizidae/FotosEmberizidae.html',
        destination: '/grupo?path=Passeriformes/Emberizidae/&groupType=family&groupId=Emberizidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Fringillidae/FotosFringillidae.html',
        destination: '/grupo?path=Passeriformes/Fringillidae/&groupType=family&groupId=Fringillidae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Icteridae/FotosIcteridae.html',
        destination: '/grupo?path=Passeriformes/Icteridae/&groupType=family&groupId=Icteridae',
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