import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { GrupoContent } from '../page';

export const dynamic = 'force-static';

// Types for taxonomy data (copied from parent page for now)
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
  Subfamily_ID: string;
  Subfamily_Sci: string;
  SF_Path: string | null;
}

function readJsonFile<T>(filePath: string): { data: T[] } | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const contents = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(contents);
  } catch {
    return null;
  }
}

// Infer group type from slug
function inferGroupType(slug: string): string | null {
  if (slug.endsWith('formes')) return 'order';
  if (slug.endsWith('dae')) return 'family';
  if (slug.endsWith('nae')) return 'subfamily';
  if (slug.endsWith('i')) return 'suborder';
  return null;
}

// Find group data and reconstruct parameters
function findGroupData(slug: string, groupType: string): { groupId: string; path: string } | null {
  switch (groupType) {
    case 'order': {
      const ordersData = readJsonFile<Order>('public/data/taxonomy/orders.json');
      const order = ordersData?.data.find(o => o.Order_Name_Sci === slug);
      if (!order) return null;

      return {
        groupId: order.Order_Name_Sci,
        path: order.Order_Path || ''
      };
    }

    case 'suborder': {
      const subordersData = readJsonFile<Suborder>('public/data/taxonomy/suborders.json');
      const suborder = subordersData?.data.find(so => so.SO_Name_Sci === slug);
      if (!suborder) return null;

      return {
        groupId: suborder.SO_Name_Sci,
        path: suborder.SO_Path || ''
      };
    }

    case 'family': {
      const familiesData = readJsonFile<Family>('public/data/taxonomy/families.json');
      const family = familiesData?.data.find(f => f.Family_Name_Sci === slug);
      if (!family) return null;

      return {
        groupId: family.Family_Name_Sci,
        path: family.Family_Path || ''
      };
    }

    case 'subfamily': {
      const subfamiliesData = readJsonFile<Subfamily>('public/data/taxonomy/subfamilies.json');
      const subfamily = subfamiliesData?.data.find(sf => sf.Subfamily_Sci === slug);
      if (!subfamily) return null;

      return {
        groupId: subfamily.Subfamily_Sci,
        path: subfamily.SF_Path || ''
      };
    }

    default:
      return null;
  }
}

export async function generateStaticParams() {
  const slugs = new Set<string>();

  const orders = readJsonFile<Order>('public/data/taxonomy/orders.json')?.data || [];
  const suborders = readJsonFile<Suborder>('public/data/taxonomy/suborders.json')?.data || [];
  const families = readJsonFile<Family>('public/data/taxonomy/families.json')?.data || [];
  const subfamilies = readJsonFile<Subfamily>('public/data/taxonomy/subfamilies.json')?.data || [];

  orders.forEach(o => o?.Order_Name_Sci && slugs.add(o.Order_Name_Sci));
  suborders.forEach(so => so?.SO_Name_Sci && slugs.add(so.SO_Name_Sci));
  families.forEach(f => f?.Family_Name_Sci && slugs.add(f.Family_Name_Sci));
  subfamilies.forEach(sf => sf?.Subfamily_Sci && slugs.add(sf.Subfamily_Sci));

  return Array.from(slugs).map((slug) => ({ slug }));
}

// Generate metadata for SEO (simplified for now)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const groupType = inferGroupType(slug);

  if (!groupType) {
    return { title: 'Invalid Group Name - Fotosaves' };
  }

  return {
    title: `${slug} - ${groupType} | FotosAves.com.ar`,
    description: `Fotografías de especies de aves en ${groupType} ${slug}. Imágenes originales tomadas en Argentina.`,
    alternates: {
      canonical: `https://www.fotosaves.com.ar/grupo/${slug}`,
    },
  };
}

// Main page component
export default async function GrupoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // Infer group type from slug
  const groupType = inferGroupType(slug);

  if (!groupType) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#999973', minHeight: '100vh', color: '#333' }}>
        <h1>Error: Invalid Group Name</h1>
        <p>The group name "{slug}" does not match any known taxonomic group.</p>
        <p>Group names should end with:</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
          <li><strong>...formes</strong> for orders (e.g., Rheiformes)</li>
          <li><strong>...dae</strong> for families (e.g., Picidae)</li>
          <li><strong>...nae</strong> for subfamilies (e.g., Sclerurinae)</li>
          <li><strong>...i</strong> for suborders (e.g., Charadrii)</li>
        </ul>
      </div>
    );
  }

  // Find group data
  const groupData = findGroupData(slug, groupType);
  if (!groupData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#999973', minHeight: '100vh', color: '#333' }}>
        <h1>Error: Group Not Found</h1>
        <p>The {groupType} "{slug}" was not found in the taxonomy database.</p>
      </div>
    );
  }

  return await GrupoContent({ pageLevel: groupType, groupID: groupData.groupId, path: groupData.path });
}