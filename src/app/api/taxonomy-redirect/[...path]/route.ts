import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface Order {
  Order_ID: string;
  Order_Name_Sci: string;
  Order_Path: string | null;
  Species_URL_Pattern: string;
}

interface Suborder {
  SO_ID: string;
  SO_Name_Sci: string;
  SO_Path: string | null;
  Species_URL_Pattern?: string;
}

interface Family {
  Family_ID: string;
  Family_Name_Sci: string;
  Family_Path: string | null;
}

interface Subfamily {
  SF_ID: string;
  Subfamily_Sci: string;
  SF_Path: string | null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // Reconstruct the original path from the catch-all parameters
  const resolvedParams = await params;
  const originalPath = '/' + resolvedParams.path.join('/');

  // Skip static sections that should be served directly
  const staticSections = ['FotosMamiferos', 'FotosReptiles', 'FotosInsectos', 'FotosAranias', 'Videos', 'Pinturas', 'Viajes'];
  if (staticSections.some(section => originalPath.includes(section))) {
    // This is a static section; send the browser to the original path so the Next.js static server handles it
    return NextResponse.redirect(new URL(originalPath, request.url), 307);
  }

  // Load taxonomy data to check for species URL patterns
  const ordersPath = path.join(process.cwd(), 'src/data/taxonomy/orders.json');
  const subordersPath = path.join(process.cwd(), 'src/data/taxonomy/suborders.json');
  const [ordersData, subordersData] = await Promise.all([
    fs.promises.readFile(ordersPath, 'utf8'),
    fs.promises.readFile(subordersPath, 'utf8')
  ]);
  const orders: { data: Order[] } = JSON.parse(ordersData);
  const suborders: { data: Suborder[] } = JSON.parse(subordersData);


  // Special taxonomic changes for species URLs - handle before regular pattern matching
  // Taxonomic change 1: Passeriformes/IncerteaSedis species -> Passeriformes/Thraupidae species
  const incerteaSedisPattern = /^\/Passeriformes\/IncerteaSedis\/Fotos_(.+)\.html$/;
  const incerteaMatch = originalPath.match(incerteaSedisPattern);
  if (incerteaMatch) {
    const slug = incerteaMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  // Taxonomic change 2: Passeriformes/Emberizidae species -> Passeriformes/Passerellidae species
  const emberizidaePattern = /^\/Passeriformes\/Emberizidae\/Fotos_(.+)\.html$/;
  const emberizidaeMatch = originalPath.match(emberizidaePattern);
  if (emberizidaeMatch) {
    const slug = emberizidaeMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  // Taxonomic change 3: Trochiliformes species -> Apodiformes/Trochilidae species
  const trochiliformesPattern = /^\/Trochiliformes\/Fotos_(.+)\.html$/;
  const trochiliformesMatch = originalPath.match(trochiliformesPattern);
  if (trochiliformesMatch) {
    const slug = trochiliformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  // Legacy species URL exceptions by order
  const rheiformesPattern = /^\/Rheiformes\/FotosRheas_(.+)\.html$/;
  const rheiformesMatch = originalPath.match(rheiformesPattern);
  if (rheiformesMatch) {
    const slug = rheiformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const tinamiformesPattern = /^\/Tinamiformes\/FotosPerdices_(.+)\.html$/;
  const tinamiformesMatch = originalPath.match(tinamiformesPattern);
  if (tinamiformesMatch) {
    const slug = tinamiformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const podicipediformesPattern = /^\/Podicipediformes\/Fotos(.+)\.html$/;
  const podicipediformesMatch = originalPath.match(podicipediformesPattern);
  if (podicipediformesMatch) {
    const slug = podicipediformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const procellariiformesPattern = /^\/Procellariiformes\/Fotos(.+)\.html$/;
  const procellariiformesMatch = originalPath.match(procellariiformesPattern);
  if (procellariiformesMatch) {
    const slug = procellariiformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const suliformesPattern = /^\/Suliformes\/Fotos(.+)\.html$/;
  const suliformesMatch = originalPath.match(suliformesPattern);
  if (suliformesMatch) {
    const slug = suliformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const sphenisciformesPattern = /^\/Sphenisciformes\/Fotos(.+)\.html$/;
  const sphenisciformesMatch = originalPath.match(sphenisciformesPattern);
  if (sphenisciformesMatch) {
    const slug = sphenisciformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const spheniciformesPattern = /^\/Spheniciformes\/Fotos(.+)\.html$/;
  const spheniciformesMatch = originalPath.match(spheniciformesPattern);
  if (spheniciformesMatch) {
    const slug = spheniciformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  const gruiformesPattern = /^\/Gruiformes\/FotosGruiformes-(.+)\.html$/;
  const gruiformesMatch = originalPath.match(gruiformesPattern);
  if (gruiformesMatch) {
    const slug = gruiformesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  // Species name changes
  if (originalPath === '/Procellariiformes/FotosAlbatrosReal.html') {
    return NextResponse.redirect(new URL('/especie/AlbatrosRealMayor', request.url));
  }

  // Sphenisciformes penguin redirects (special naming)
  if (originalPath === '/Sphenisciformes/FotosPinguinos_Magallanes.html') {
    return NextResponse.redirect(new URL('/especie/PinguinoPatagonico', request.url));
  }
  if (originalPath === '/Sphenisciformes/FotosPinguinos_Vincha.html') {
    return NextResponse.redirect(new URL('/especie/PinguinoDeVincha', request.url));
  }
  if (originalPath === '/Sphenisciformes/FotosPinguinoRey.html') {
    return NextResponse.redirect(new URL('/especie/PinguinoRey', request.url));
  }

  // Charadriiformes species name change
  if (originalPath === '/Charadriiformes/FotosPlayerasC_GaviotinChico.html') {
    return NextResponse.redirect(new URL('/especie/GaviotinChicoFluvial', request.url));
  }

  // Check if URL matches any species URL pattern
  for (const order of orders.data) {
    const pattern = order.Species_URL_Pattern;
    // Pattern: /OrderName/PatternSlug.html
    const speciesPattern1 = new RegExp(`^/${order.Order_Name_Sci}/${pattern}(.+)\.html$`);
    const match1 = originalPath.match(speciesPattern1);
    if (match1) {
      const slug = match1[1];
      return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
    }

    // Pattern: /OrderName/FamilyName/PatternSlug.html
    const speciesPattern2 = new RegExp(`^/${order.Order_Name_Sci}/([^/]+)/${pattern}(.+)\.html$`);
    const match2 = originalPath.match(speciesPattern2);
    if (match2) {
      const slug = match2[2];
      return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
    }
  }

  // Check suborder species patterns (for Charadriiformes)
  for (const suborder of suborders.data) {
    if (suborder.Species_URL_Pattern) {
      const pattern = suborder.Species_URL_Pattern;

      // Pattern: /Charadriiformes/PatternSlug.html (suborder species)
      const suborderPattern = new RegExp(`^/Charadriiformes/${pattern}(.+)\.html$`);
      const match = originalPath.match(suborderPattern);
      if (match) {
        const slug = match[1];
        return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
      }
    }
  }

  // If not a species URL, check for group URLs (orders, families, etc.)
  let families: { data: Family[] } = { data: [] };
  let subfamilies: { data: Subfamily[] } = { data: [] };

  try {
    // Load taxonomy data (orders and suborders already loaded above)
    const familiesPath = path.join(process.cwd(), 'src/data/taxonomy/families.json');
    const subfamiliesPath = path.join(process.cwd(), 'src/data/taxonomy/subfamilies.json');

    const [familiesData, subfamiliesData] = await Promise.all([
      fs.promises.readFile(familiesPath, 'utf8'),
      fs.promises.readFile(subfamiliesPath, 'utf8')
    ]);

    families = JSON.parse(familiesData);
    subfamilies = JSON.parse(subfamiliesData);
  } catch (error) {
    console.error('Error loading taxonomy data:', error);
    return NextResponse.redirect(new URL('/aves', request.url));
  }

  // Handle group URLs (orders, families, subfamilies)

  // 1. Orders: /{OrderName}/Fotos{OrderName}.html
  for (const order of orders.data) {
    if (originalPath === `/${order.Order_Name_Sci}/Fotos${order.Order_Name_Sci}.html`) {
      return NextResponse.redirect(new URL(`/grupo?path=${order.Order_Path}&groupType=order&groupId=${order.Order_Name_Sci}`, request.url));
    }
  }

  // 2. Charadriiformes suborders: /Charadriiformes/FotosCharadriiformes{A,B,C}.html
  if (originalPath === '/Charadriiformes/FotosCharadriiformesA.html') {
    return NextResponse.redirect(new URL('/grupo?path=Charadriiformes/&groupType=suborder&groupId=Charadrii', request.url));
  }
  if (originalPath === '/Charadriiformes/FotosCharadriiformesB.html') {
    return NextResponse.redirect(new URL('/grupo?path=Charadriiformes/&groupType=suborder&groupId=Scolopaci', request.url));
  }
  if (originalPath === '/Charadriiformes/FotosCharadriiformesC.html') {
    return NextResponse.redirect(new URL('/grupo?path=Charadriiformes/&groupType=suborder&groupId=Lari', request.url));
  }

  // Special taxonomic changes - handle before regular family processing
  // 2a. Taxonomic change 1: Passeriformes/IncerteaSedis -> Passeriformes/Thraupidae
  if (originalPath === '/Passeriformes/IncerteaSedis/FotosInsertisSedis.html') {
    return NextResponse.redirect(new URL('/Passeriformes/Thraupidae/FotosThraupidae.html', request.url));
  }

  // 2a species in IncerteaSedis -> Thraupidae
  const incertaSpeciesPattern = /^\/Passeriformes\/IncerteaSedis\/Fotos_(.+)\.html$/;
  const incertaSpeciesMatch = originalPath.match(incertaSpeciesPattern);
  if (incertaSpeciesMatch) {
    const slug = incertaSpeciesMatch[1];
    return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
  }

  // 2b. Taxonomic change 2: Passeriformes/Emberizidae -> Passeriformes/Passerellidae
  if (originalPath === '/Passeriformes/Emberizidae/FotosEmberizidae.html') {
    return NextResponse.redirect(new URL('/Passeriformes/Passerellidae/FotosPasserellidae.html', request.url));
  }

  // 2c. Taxonomic change 3: Trochiliformes -> Apodiformes/Trochilidae
  if (originalPath === '/Trochiliformes/FotosTrochiliformes.html') {
    return NextResponse.redirect(new URL('/Apodiformes/Trochilidae/FotosTrochilidae.html', request.url));
  }

  // 2c. Fringillidae subfamily redirects
  if (originalPath === '/Passeriformes/Fringillidae/FotosFringillidae.html') {
    return NextResponse.redirect(new URL('/grupo?path=Passeriformes/Fringillidae-Frin/&groupType=subfamily&groupId=Fringillinae', request.url));
  }
  if (originalPath === '/Passeriformes/Fringillidae/FotosEuphoniinae.html') {
    return NextResponse.redirect(new URL('/grupo?path=Passeriformes/Fringillidae-Euph/&groupType=subfamily&groupId=Euphoniinae', request.url));
  }

  // 3. All families: /{OrderName}/{FamilyName}/Fotos{FamilyName}.html or /Passeriformes/{FamilyName}/Fotos{FamilyName}.html
  for (const family of families.data) {
    if (family.Family_Path) {
      // Extract order and family from path
      const pathParts = family.Family_Path.split('/');
      if (pathParts.length >= 2) {
        const orderName = pathParts[0];
        const familyName = pathParts[1];
        if (originalPath === `/${orderName}/${familyName}/Fotos${family.Family_Name_Sci}.html`) {
          return NextResponse.redirect(new URL(`/grupo?path=${family.Family_Path}&groupType=family&groupId=${family.Family_Name_Sci}`, request.url));
        }
      }
    }
  }

  // 4. Subfamilies: /Passeriformes/{FamilyName}/Fotos{SubfamilyName}.html
  for (const subfamily of subfamilies.data) {
    if (subfamily.SF_Path?.startsWith('Passeriformes/')) {
      const pathParts = subfamily.SF_Path.split('/');
      if (pathParts.length >= 2) {
        const familyName = pathParts[1];
        if (originalPath === `/Passeriformes/${familyName}/Fotos${subfamily.Subfamily_Sci}.html`) {
          return NextResponse.redirect(new URL(`/grupo?path=${subfamily.SF_Path}&groupType=subfamily&groupId=${subfamily.Subfamily_Sci}`, request.url));
        }
      }
    }
  }

  // Not found - redirect to main aves page
  return NextResponse.redirect(new URL('/aves', request.url));
}
