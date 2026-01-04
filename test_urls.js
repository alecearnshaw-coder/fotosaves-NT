// Test URL mapping functionality
const testUrls = [
  // Regular species URLs with different patterns
  '/Rheiformes/FotosRheas_Choique.html',
  '/Tinamiformes/FotosPerdices_InambuComun.html',
  '/Anseriformes/Fotos_Chaja.html',
  '/Podicipediformes/FotosMacaPicoGrueso.html', // No underscore pattern
  '/Gruiformes/FotosGruiformes-GallaretaChica.html', // Dash pattern

  // Taxonomic change URLs
  '/Passeriformes/Emberizidae/FotosEmberizidae.html', // Should redirect to Passerellidae group
  '/Passeriformes/IncerteaSedis/FotosInsertisSedis.html', // Should redirect to Thraupidae group
  '/Passeriformes/Fringillidae/FotosFringillidae.html', // Should redirect to Fringillinae group

  // Group URLs
  '/Rheiformes/FotosRheiformes.html',
  '/Anseriformes/FotosAnseriformes.html',
  '/Charadriiformes/FotosCharadriiformesA.html', // Suborder
  '/Charadriiformes/FotosCharadriiformesB.html', // Suborder
  '/Passeriformes/Icteridae/FotosIcteridae.html', // Family
];

const baseUrl = 'http://localhost:3000';

async function testUrl(url) {
  try {
    const response = await fetch(`${baseUrl}/api/taxonomy-redirect${url}`, {
      method: 'HEAD',
      redirect: 'manual'
    });

    if (response.status === 307) { // Next.js uses 307 for redirects
      const location = response.headers.get('location');
      console.log(`✅ ${url} → ${location}`);
    } else if (response.status === 200) {
      console.log(`✅ ${url} → Direct response (200)`);
    } else {
      console.log(`❌ ${url} → Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${url} → Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing URL mappings...\n');

  for (const url of testUrls) {
    await testUrl(url);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

runTests();
