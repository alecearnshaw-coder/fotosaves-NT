// List of all bird orders used for catching IMAGE REWRITES. See below, in rewrites section.
const BIRD_ORDERS =
  'Rheiformes|Tinamiformes|Anseriformes|Galliformes|Phoenicopteriformes|' +
  'Podicipediformes|Cuculiformes|Columbiformes|Gruiformes|Charadriiformes|' +
  'Sphenisciformes|Procellariiformes|Ciconiiformes|Suliformes|Pelecaniformes|' +
  'Caprimulgiformes|Nyctibiiformes|Strigiformes|Apodiformes|' +                   // removed Trochiliformes as has special rule
  'Piciformes|Cathartiformes|Accipitriformes|Trogoniformes|Coraciiformes|' +
  'Galbuliformes|Cariamiformes|Falconiformes|Psittaciformes|Passeriformes';

/** @type {import('next').NextConfig} */
const nextConfig = {

  // Reduce server/prerender function size by excluding large static asset trees
  // from output file tracing. Images are served as static assets from /public.
  outputFileTracingExcludes: {
    // Apply globally to any server traces (cross-platform patterns)
    '/*': [
      'public/images/**/*',
    ],
  },

  // Some pages generate large static outputs; allow more time per page.
  staticPageGenerationTimeout: 300,

  /* // This is to prevent the images from being optimized by Next.js
  images: {
    unoptimized: true,
  }, */

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
      {
        source: '/FotosInsectos/FotosInsectos.html',
        destination: '/FotosInsectos/Index_Insecta_Sp.html',
        permanent: true,
      },
      
      //////////    BIRDS     SPECIES    LEVEL  //////////
 // Now redirect the SPECIES .html files
      // First catch all the exceptions to the general rule
      
      // Rheiformes special format: FotosRheas_{Slug}.html
      {
        source: '/Rheiformes/FotosRheas_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      // Tinamiformes special format: FotosPerdices_{Slug}.html
      {
        source: '/Tinamiformes/FotosPerdices_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      // Podicipediformes special format: Fotos{Slug}.html 
      // BUT because of the rule (no UNDERSCORE in the Species naming, we have to first process the GROUP lavel)
      {
        source: '/Podicipediformes/FotosPodicipediformes.html',
        destination: '/grupo/Podicipediformes',
        // destination: '/grupo?path=Podicipediformes/&groupType=order&groupId=Podicipediformes',
        permanent: true,
      },
      {
        source: '/Podicipediformes/Fotos:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
       // Gruiformes special format: FotosGruiformes-{Slug}.html
       {
        source: '/Gruiformes/FotosGruiformes-:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      // Procellariiformes special format: Fotos{Slug}.html
      // BUT because of the rule (no UNDERSCORE in the Species naming, we have to first process the GROUP lavel)
      {
        source: '/Procellariiformes/FotosProcellariiformes.html',
        destination: '/grupo/Procellariiformes',
        permanent: true,
      },
      {
        source: '/Procellariiformes/Fotos:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      // Suliformes special format: Fotos{Slug}.html
      // BUT because of the rule (no UNDERSCORE in the Species naming, we have to first process the GROUP lavel)
      {
        source: '/Suliformes/FotosSuliformes.html',
        destination: '/grupo/Suliformes',
        permanent: true,
      },
      {
        source: '/Suliformes/Fotos:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      // Gaviotin Chico to Gaviotin Chico Fluvial 
      {
        source: '/Charadriiformes/FotosPlayerasC_GaviotinChico.html',
        destination: '/especie/GaviotinChicoFluvial',
        permanent: true,
      },
       // Paloma Ala Manchada to Paloma Manchada 
       {
        source: '/Columbiformes/PalomaAlaManchada.html',
        destination: '/especie/PalomaManchada',
        permanent: true,
      },
      // GENERICS FOR Charadriiformes species
      {
        source: '/Charadriiformes/FotosPlayerasA_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosPlayerasB_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosPlayerasC_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },

      // Sphenisciformes special cases for each species
      {
        source: '/Sphenisciformes/FotosPinguinoRey.html',
        destination: '/especie/PinguinoRey',
        permanent: true,
      },
      {
        source: '/Sphenisciformes/FotosPinguinos_Vincha.html',
        destination: '/especie/PinguinoDeVincha',
        permanent: true,
      },
      {
        source: '/Sphenisciformes/FotosPinguinos_Magallanes.html',
        destination: '/especie/PinguinoPatagonico',
        permanent: true,
      },
      
      // Albatros Real to Albatros Real Mayor
      {
        source: '/Procellariiformes/FotosAlbatrosReal.html',
        destination: '/especie/AlbatrosRealMayor',
        permanent: true,
      },
      
      // GENERIC CASES FOR SPECIES LEVEL - ORDER LEVEL SPECIES
      {
        source: 
        '/:order(' +
           'Anseriformes|Galliformes|Phoenicopteriformes|Charadriiformes|' +
           'Cuculiformes|Columbiformes|Ciconiiformes|Suliformes|Pelecaniformes|' +
           'Caprimulgiformes|Nyctibiiformes|Strigiformes|Apodiformes|Trochiliformes|' +
           'Piciformes|Cathartiformes|Accipitriformes|Trogoniformes|Coraciformes|' +
           'Galbuliformes|Cariamiformes|Falconiformes|Psittaciformes)/Fotos_:slug.html',
        destination: '/especie/:slug',
        permanent: true,
      },     
      

      ////   GENERAL RULE FOR PASSERIFORMES   ////
      {
        source: '/Passeriformes/:family/Fotos_:slug([A-Za-z]+).html',
        destination: '/especie/:slug',
        permanent: true,
      },


  
      //////////    BIRDS     GROUP   LEVEL   //////////

      /// FIRST catch the GROUP .html file, so that it is not swallowed by the next rule, which catches SPECIES 
      // First catch the orders that have exceptions
          // Flamingos: FotosPhenicopteriformes is a missspelling (missing an 'o')
      {
        source: '/Phoenicopteriformes/FotosPhenicopteriformes.html',
        destination: '/grupo/Phoenicopteriformes',
        // destination: '/grupo?path=Phoenicopteriformes/&groupType=order&groupId=Phoenicopteriformes',
        permanent: true,
      },

      // Handle Charadriiformes from A, B  C into 3 suborders
      {
        source: '/Charadriiformes/FotosCharadriiformesA.html',
        // destination: '/grupo?path=Charadriiformes/&groupType=suborder&groupId=Charadrii',
        destination: '/grupo/Charadrii',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesB.html',
        // destination: '/grupo?path=Charadriiformes/&groupType=suborder&groupId=Scolopaci',
        destination: '/grupo/Scolopaci',
        permanent: true,
      },
      {
        source: '/Charadriiformes/FotosCharadriiformesC.html',
        // destination: '/grupo?path=Charadriiformes/&groupType=suborder&groupId=Lari',
        destination: '/grupo/Lari',
        permanent: true,
      },
      // Handle Swift now bwing sheon in Apodidae family within Apodiformes order
      {
        source: '/Apodiformes/FotosApodiformes.html',
        // destination: '/grupo?path=Apodiformes/Apodidae/&groupType=family&groupId=Apodidae',
        destination: '/grupo/Apodidae',
        permanent: true,
      },
      // Handle taxonomic change of Trochiliformes order demoted to Trochilidae family within Apodiformes order
      {
        source: '/Trochiliformes/FotosTrochiliformes.html',
        // destination: '/grupo?path=Apodiformes/Trochilidae/&groupType=family&groupId=Trochilidae',
        destination: '/grupo/Trochilidae',
        permanent: true,
      },
      // Partial handling of Piciformes will now be redirected to picidae family within Piciformes order
      {
        source: '/Piciformes/FotosPiciformes.html',
        // destination: '/grupo?path=Piciformes/Picidae/&groupType=family&groupId=Picidae',
        destination: '/grupo/Picidae',
        permanent: true,
      },
      
      // Next catch the orders that are "vanilla", ie, follow the general rule
         // single order model: source: '/Phoenicopteriformes/FotosPhenicopteriformes.html',
         // multi-order statement has 'order' accept any of the orders in the list.   
         // Note 3 orders are excluded: Podicipediformes, Procellariiformes, Suliformes because they have special rules (see above)
      {
        source: 
           '/:order(' +
           'Rheiformes|Tinamiformes|Anseriformes|Galliformes|Phoenicopteriformes|' +
           'Cuculiformes|Columbiformes|Gruiformes|' +
           'Sphenisciformes|Ciconiiformes|Pelecaniformes|' +
           'Caprimulgiformes|Nyctibiiformes|Strigiformes|Cathartiformes|Accipitriformes|' +
           'Trogoniformes|Coraciiformes|Galbuliformes|Cariamiformes|Falconiformes|Psittaciformes)/Fotos:order.html',
        // destination: '/grupo?path=:order/&groupType=order&groupId=:order',
        destination: '/grupo/:order',
        permanent: true,
      },

      ////  CONTINUE WITH GROUP LEVEL, NOW FOR PASSERIFORMES   ////

      // Exception for InsertisSedis now remit to Thraupidae family within Passeriformes order
      {
        source: '/Passeriformes/IncertaeSedis/FotosInsertisSedis.html',
        // destination: '/grupo?path=Passeriformes/Thraupidae/&groupType=family&groupId=Thraupidae',
        destination: '/grupo/Thraupidae',
        permanent: true,
      },
      // Exception for Emberizidae now remit to Passerellidae family within Passeriformes order
      {
        source: '/Passeriformes/Emberizidae/FotosEmberizidae.html',
        // destination: '/grupo?path=Passeriformes/Passerellidae/&groupType=family&groupId=Passerellidae',
        destination: '/grupo/Passerellidae',
        permanent: true,
      },

      // FURNARIIDAE SUBFAMILIES
      {
        source: '/Passeriformes/Furnariidae-1Scleru/FotosSclerurinae.html',
        // destination: '/grupo?path=Passeriformes/Furnariidae-1Scleru/&groupType=subfamily&groupId=Sclerurinae',
        destination: '/grupo/Sclerurinae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Furnariidae-Dendro/FotosDendrocolaptinae.html',
        // destination: '/grupo?path=Passeriformes/Furnariidae-Dendro/&groupType=subfamily&groupId=Dendrocolaptinae',
        destination: '/grupo/Dendrocolaptinae',
        permanent: true,  
      },
      {
        source: '/Passeriformes/Furnariidae-Phyl/FotosPhilydorinae.html',
        // destination: '/grupo?path=Passeriformes/Furnariidae-Phyl/&groupType=subfamily&groupId=Philydorinae',
        destination: '/grupo/Philydorinae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Furnariidae-Furn/FotosFurnariinae.html',
        // destination: '/grupo?path=Passeriformes/Furnariidae-Furn/&groupType=subfamily&groupId=Furnariinae',
        destination: '/grupo/Furnariinae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Furnariidae-Sina/FotosSynallaxinae.html',
        // destination: '/grupo?path=Passeriformes/Furnariidae-Sina/&groupType=subfamily&groupId=Sinallaxinae',
        destination: '/grupo/Synallaxinae',
        permanent: true,
      },

      /// FRINGILIDAE SUBFAMILIES
      {
        source: '/Passeriformes/Fringillidae/FotosFringillidae.html',
        // destination: '/grupo?path=Passeriformes/Fringillidae-Frin/&groupType=subfamily&groupId=Fringillinae',
        destination: '/grupo/Fringillinae',
        permanent: true,
      },
      {
        source: '/Passeriformes/Fringillidae/FotosEuphoniinae.html',
        // destination: '/grupo?path=Passeriformes/Fringillidae-Euph/&groupType=subfamily&groupId=Euphoniinae',
        destination: '/grupo/Euphoniinae',
        permanent: true,
      },

      
      ////   GENERAL RULE FOR PASSERIFORMES   ////
       // The code ([^_]) is a regular expression to match any character except an underscore
       // Therefore it prohibits to process the file Fotos:segment_XXX.html
      {
        source: '/Passeriformes/:segment([^_]+)/Fotos:segment([A-Za-z]+).html',
        // destination: '/grupo?path=Passeriformes/:segment/&groupType=family&groupId=:segment',
        destination: '/grupo/:segment',
        permanent: true,
      },
      ///////        END OF GROUP LEVEL       ///////
      

      //////        REDIRECTS FOR ALL TRIP REPORTS moving them into the Relatos folder      //////
      {
        source: '/Argentina/:path*.htm',
        destination: '/Relatos/Argentina/:path*.htm',
        permanent: true,
      },
      {
        source: '/Asia/:path*.htm',
        destination: '/Relatos/Asia/:path*.htm',
        permanent: true,
      },
      {
        source: '/Europe/:path*.htm',
        destination: '/Relatos/Europe/:path*.htm',
        permanent: true,
      },
      {
        source: '/NorthAmerica/:path*.htm',
        destination: '/Relatos/NorthAmerica/:path*.htm',
        permanent: true,
      },
      {
        source: '/SouthAmerica/:path*.htm',
        destination: '/Relatos/SouthAmerica/:path*.htm',
        permanent: true,
      },
      {
        source: '/CentralAmerica/:path*.htm',
        destination: '/Relatos/CentralAmerica/:path*.htm',
        permanent: true,
      },
      {
        source: '/Viajes/:path*.htm',
        destination: '/Relatos/Viajes/:path*.htm',
        permanent: true,
      },
      {
        source: '/Viajes/:path*.html',
        destination: '/Relatos/Viajes/:path*.html',
        permanent: true,
      },
      ///////        END OF TRIP REPORTS       ///////
    ];
  },



   /////         PHOTO LEVEL REWRITES       /////    
   // This is the section that catches incoming requests for photo files and rewrites them to the new format.
   // It is a module.exports because it is used in the next.config.ts file.
      
  async rewrites() {
    return {
      beforeFiles: [

        // Point to the correct folder for Trochiliformes and Apodiformes images
        {
          source: '/Trochiliformes/:path*.jpg',
          destination: '/Apodiformes/Trochilidae/:path*.jpg', // Point to the correct folder for Trochiliformes
        },
        {
          source: '/Apodiformes/:path*.jpg',
          destination: '/Apodiformes/Apodidae/:path*.jpg',   // Point to the correct folder for Apodiformes
        },

        // Point to the correct folder for Piciformes - unfortunately not possible to split for Tucan and Arasari because of the wildcard in the source path
        /* {
          source: '/Piciformes/:path*((?:[^/]*)(A_Tucan|Tucan|A_Arasari)[^/]*)\\.jpg',
          destination: '/Piciformes/Ramphastidae/$1.jpg',
        },
        {
          source: '/Piciformes/((?:[^/]*)(A_Carpin|A_Crimson|Car|Magellanic)[^/]*)\\.jpg',
          destination: '/Piciformes/Picidae/$1.jpg',
        },  
        */
       // Direct all Piciformes images to the Picidae folder, even if some will be for toucans. Tough luck
        {
          source: '/Piciformes/:path*.jpg',
          destination: '/Piciformes/Picidae/:path*.jpg',
        },  


        // Point to the correct folder for Fringillidae images  (Euphoniinae) in the Fringillidae-Euph subfamily
        /* {
          source: '/Passeriformes/Fringillidae/:path*((?:[^/]*)(A_Tangara|Tangara)[^/]*)\\.jpg',
          destination: '/Passeriformes/Fringillidae-Euph/:path*$1:rest*.jpg',
        },
        {
          source: '/Passeriformes/Fringillidae/:path*((?:[^/]*)(A_Cabecita|A_Goldfinch|A_Greenfinch|A_Negrillo|A_Picaflor|CabAustral|Cabecita|Yellow-rumped)[^/]*)\\.jpg',
          destination: '/Passeriformes/Fringillidae-Frin/:path*$1:rest*.jpg',
        }, */
        {
          source: '/Passeriformes/Fringillidae/:path*.jpg',
          destination: '/Passeriformes/Fringillidae-Frin/:path*.jpg',
        }, 

        // Point to the correct folder for Emberizidae images in the Emberizidae subfamily
        {
          source: '/Passeriformes/Emberizidae/:path*.jpg',
          destination: '/Passeriformes/Passerellidae/:path*.jpg',
        },
        
        // Point to the correct folder for Emberizidae images in the Emberizidae subfamily
        {
          source: '/Passeriformes/IncertaeSedis/:path*.jpg',
          destination: '/Passeriformes/Thraupidae/:path*.jpg',
        },

        // Potoo taxonomy change
        {
          source: '/Caprimulgiformes/(A_Urutau[^/]*)\\.jpg',
          destination: '/Nyctibiiformes/$1.jpg',
        },
        


        // 1️⃣ Bird images (ORDER is first segment)
        {
          source: `/:order(${BIRD_ORDERS})/:path*.:ext((?:jpg|jpeg|png|webp))`,
          destination: '/images/Aves/:order/:path*.:ext',
        },

        // 2️⃣ All other legacy images (static content)
        {
          source: '/:path*.:ext((?:jpg|jpeg|png|webp))',
          destination: '/:path*.:ext',
        },
      
      ],
    };
  },
};
module.exports = nextConfig; // Export the config for use in the next.config.ts file.
