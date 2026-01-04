import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Order {
  Order_ID: string;
  Order_Name_Sci: string;
  Order_Path: string | null;
}

interface Suborder {
  SO_ID: string;
  SO_Name_Sci: string;
  SO_Path: string | null;
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

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Remove the /api/taxonomy-redirect prefix to get the original URL
  const originalPath = pathname.replace('/api/taxonomy-redirect', '');

  // If URL contains underscore, it's likely a species URL - redirect to species handler
  if (originalPath.includes('_')) {
    // Extract slug from species URL patterns
    let slug = '';

    // Pattern: /Order/Fotos_Slug.html
    const speciesPattern1 = originalPath.match(/^\/([^\/]+)\/Fotos_(.+)\.html$/);
    if (speciesPattern1) {
      slug = speciesPattern1[2];
    }

    // Pattern: /Order/Family/Fotos_Slug.html
    const speciesPattern2 = originalPath.match(/^\/([^\/]+)\/([^\/]+)\/Fotos_(.+)\.html$/);
    if (speciesPattern2) {
      slug = speciesPattern2[3];
    }

    if (slug) {
      return NextResponse.redirect(new URL(`/api/species-redirect-by-slug?slug=${encodeURIComponent(slug)}`, request.url));
    }
  }

  try {
    // Load taxonomy data
    const ordersPath = path.join(process.cwd(), 'src/data/taxonomy/orders.json');
    const subordersPath = path.join(process.cwd(), 'src/data/taxonomy/suborders.json');
    const familiesPath = path.join(process.cwd(), 'src/data/taxonomy/families.json');
    const subfamiliesPath = path.join(process.cwd(), 'src/data/taxonomy/subfamilies.json');

    const [ordersData, subordersData, familiesData, subfamiliesData] = await Promise.all([
      fs.promises.readFile(ordersPath, 'utf8'),
      fs.promises.readFile(subordersPath, 'utf8'),
      fs.promises.readFile(familiesPath, 'utf8'),
      fs.promises.readFile(subfamiliesPath, 'utf8')
    ]);

    const orders: { data: Order[] } = JSON.parse(ordersData);
    const suborders: { data: Suborder[] } = JSON.parse(subordersData);
    const families: { data: Family[] } = JSON.parse(familiesData);
    const subfamilies: { data: Subfamily[] } = JSON.parse(subfamiliesData);

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

  } catch (error) {
    console.error('Error in taxonomy redirect:', error);
    return NextResponse.redirect(new URL('/aves', request.url));
  }
}
