import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Order {
  Order_ID: string;
  Order_Name_Sci: string;
}

interface Suborder {
  SO_ID: string;
  SO_Name_Sci: string;
}

interface Family {
  Family_ID: string;
  Family_Name_Sci: string;
}

interface Subfamily {
  SF_ID: string;
  Subfamily_Sci: string;
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the taxonomy name from the URL
  // Expected format: /Fotos{TaxonomyName}.html
  const match = pathname.match(/^\/Fotos(.+)\.html$/);
  if (!match) {
    return NextResponse.redirect(new URL('/aves', request.url));
  }

  const taxonomyName = match[1];

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

    // Special cases for Charadriiformes suborders
    if (taxonomyName === 'CharadriiformesA') {
      return NextResponse.redirect(new URL('/grupo?groupType=suborder&groupId=Charadrii', request.url));
    }
    if (taxonomyName === 'CharadriiformesB') {
      return NextResponse.redirect(new URL('/grupo?groupType=suborder&groupId=Scolopaci', request.url));
    }
    if (taxonomyName === 'CharadriiformesC') {
      return NextResponse.redirect(new URL('/grupo?groupType=suborder&groupId=Lari', request.url));
    }

    // Check orders first
    const order = orders.data.find(o => o.Order_Name_Sci === taxonomyName);
    if (order) {
      return NextResponse.redirect(new URL(`/grupo?groupType=order&groupId=${order.Order_Name_Sci}`, request.url));
    }

    // Check families
    const family = families.data.find(f => f.Family_Name_Sci === taxonomyName);
    if (family) {
      return NextResponse.redirect(new URL(`/grupo?groupType=family&groupId=${family.Family_Name_Sci}`, request.url));
    }

    // Check subfamilies
    const subfamily = subfamilies.data.find(sf => sf.Subfamily_Sci === taxonomyName);
    if (subfamily) {
      return NextResponse.redirect(new URL(`/grupo?groupType=subfamily&groupId=${subfamily.Subfamily_Sci}`, request.url));
    }

    // Check suborders (for any remaining cases)
    const suborder = suborders.data.find(so => so.SO_Name_Sci === taxonomyName);
    if (suborder) {
      return NextResponse.redirect(new URL(`/grupo?groupType=suborder&groupId=${suborder.SO_Name_Sci}`, request.url));
    }

    // Not found - redirect to main aves page
    return NextResponse.redirect(new URL('/aves', request.url));

  } catch (error) {
    console.error('Error in taxonomy redirect:', error);
    return NextResponse.redirect(new URL('/aves', request.url));
  }
}
