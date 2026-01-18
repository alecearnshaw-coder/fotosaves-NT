import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GrupoPage from '../page';

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

// Helper to fetch JSON data from public folder
async function fetchJsonData<T>(path: string): Promise<{ data: T[] } | null> {
  try {
    const origin = process.env.VERCEL ? 'https://fotosaves-nt.vercel.app' : 'http://localhost:3000';
    const url = `${origin}${path}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Fetch failed: ${url} → ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${path}:`, error);
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
async function findGroupData(slug: string, groupType: string): Promise<{ groupId: string; path: string } | null> {
  switch (groupType) {
    case 'order': {
      const ordersData = await fetchJsonData<Order>('/data/taxonomy/orders.json');
      if (!ordersData) return null;

      const order = ordersData.data.find(o => o.Order_Name_Sci === slug);
      if (!order) return null;

      return {
        groupId: order.Order_Name_Sci,
        path: order.Order_Path || ''
      };
    }

    case 'suborder': {
      const subordersData = await fetchJsonData<Suborder>('/data/taxonomy/suborders.json');
      if (!subordersData) return null;

      const suborder = subordersData.data.find(so => so.SO_Name_Sci === slug);
      if (!suborder) return null;

      return {
        groupId: suborder.SO_Name_Sci,
        path: suborder.SO_Path || ''
      };
    }

    case 'family': {
      const familiesData = await fetchJsonData<Family>('/data/taxonomy/families.json');
      if (!familiesData) return null;

      const family = familiesData.data.find(f => f.Family_Name_Sci === slug);
      if (!family) return null;

      return {
        groupId: family.Family_Name_Sci,
        path: family.Family_Path || ''
      };
    }

    case 'subfamily': {
      const subfamiliesData = await fetchJsonData<Subfamily>('/data/taxonomy/subfamilies.json');
      if (!subfamiliesData) return null;

      const subfamily = subfamiliesData.data.find(sf => sf.Subfamily_Sci === slug);
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
  const groupData = await findGroupData(slug, groupType);
  if (!groupData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#999973', minHeight: '100vh', color: '#333' }}>
        <h1>Error: Group Not Found</h1>
        <p>The {groupType} "{slug}" was not found in the taxonomy database.</p>
      </div>
    );
  }

  // Create a mock searchParams object that the existing component expects
  // The existing component expects string values, not arrays
  const mockSearchParams = Promise.resolve({
    groupType: groupType,
    groupId: groupData.groupId,
    path: groupData.path
  });

  // Call the existing GrupoPage component with reconstructed parameters
  return GrupoPage({ searchParams: mockSearchParams });
}