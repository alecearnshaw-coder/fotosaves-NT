import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LightboxScripts from '../especie/[slug]/LightboxScripts';
import BackToTop from '../especie/[slug]/BackToTop';
import SharedHeader from '@/components/SharedHeader';
import ContactLink from '@/components/ContactLink';

// Incremental Static Regeneration - rebuild every 24 hours
export const revalidate = 86400; // 24 hours in seconds

// Types for taxonomy data
interface Species {
  Species_ID: string;
  Order_Sci: string;
  Suborder_Sci: string | null;
  Family_Sci: string;
  Subfamily_Sci: string | null;
  Species_Name_Sp: string;
  Species_Name_En: string;
  Species_Name_Sci: string;
  Slug: string | null;
  Endangered: string | null;
  Image_Cnt: number;
  Has_Sp_Link: string | null;
  Exotic?: string | null;
  Species_Anchor?: string;
}

interface Order {
  Order_ID: string;
  Display_Order: number;
  Order_Name_Sci: string;
  Order_Name_Sp: string;
  Order_Name_En: string;
  Order_Image: string | null;
  Known_Species_Cnt: number;
  Species_Cnt: number;
  Image_Cnt: number;
  Subdivide: string | null;
  Order_Path: string | null;
}

interface Suborder {
  SO_ID: string;
  Parent_Order_ID: string;
  Display_Order: number;
  SO_Name_Sci: string;
  SO_Name_Sp: string;
  SO_Name_En: string;
  SO_Image: string | null;
  SO_Path: string | null;
  Known_Species_Cnt: number;
  Species_Cnt: number;
  Image_Cnt: number;
}

interface Family {
  Family_ID: string;
  Parent_Order_ID: string;
  Suborder_ID: string | null;
  Display_Order: number;
  Family_Name_Sci: string;
  Family_Name_Sp: string;
  Family_Name_En: string;
  Family_Image: string | null;
  Family_Path: string | null;
  Known_Species_Cnt: number;
  Species_Cnt: number;
  Image_Cnt: number;
  SubFamilies: string | null;
}

interface Subfamily {
  Subfamily_ID: string;
  Family_ID: string;
  Display_Order: number;
  Subfamily_Sci: string;
  Subfamily_Sp: string;
  Subfamily_En: string;
  Subfamily_Image: string | null;
  SF_Path: string | null;
  Known_Species_Cnt: number;
  Species_Cnt: number;
  Image_Cnt: number;
}

interface ImageData {
  Species_ID: string;
  Thumbnail_Filename: string;
  Large_Filename: string | null;
  Equipment: string | null;
  Sex_Age: string | null;
  Sex_Age_Code?: string | null;
  Location: string | null;
  Province: string | null;
  Country: string | null;
  Date: string | null;
  Slide: string | null;
  Cover: string | null;
  Display_Order: number;
}

interface SpeciesImageData {
  species: Species;
  images: ImageData[];
}

// Gender/Age mapping
const genderMap: Record<string, { label: string; color: string }> = {
  'M': { label: '<span class="es">Macho</span><br><span class="en">Male</span>', color: '#a8d4f0' },
  'F': { label: '<span class="es">Hembra</span><br><span class="en">Female</span>', color: '#f0c8d8' },
  'J': { label: '<span class="es">Juvenil</span><br><span class="en">Juvenile</span>', color: '#d4f0a8' },
  'I': { label: '<span class="es">Inmaduro</span><br><span class="en">Immature</span>', color: '#f0e8a8' },
  'MJ': { label: '<span class="es">Macho Juvenil</span><br><span class="en">Juvenile Male</span>', color: '#a8d4c0' },
  'FJ': { label: '<span class="es">Hembra Juvenil</span><br><span class="en">Juvenile Female</span>', color: '#e8c0d0' },
  'MI': { label: '<span class="es">Macho Inmaduro</span><br><span class="en">Immature Male</span>', color: '#c0d4f0' },
  'FI': { label: '<span class="es">Hembra Inmadura</span><br><span class="en">Immature Female</span>', color: '#f0d0e0' },
  'MR': { label: '<span class="es">Macho Reproductivo</span><br><span class="en">Breeding Male</span>', color: '#80c0f0' },
  'FR': { label: '<span class="es">Hembra Reproductiva</span><br><span class="en">Breeding Female</span>', color: '#f0a0c0' },
  'MN': { label: '<span class="es">Macho No Reproductivo</span><br><span class="en">Non-breeding Male</span>', color: '#b0d8f0' },
  'FN': { label: '<span class="es">Hembra No Reproductiva</span><br><span class="en">Non-breeding Female</span>', color: '#f0d0e8' },
};

// Conservation status items
const STATUS_ITEMS = [
  { key: 'NT', className: 'nt', es: 'CASI AMENAZADA', en: 'NEAR THREATENED' },
  { key: 'VU', className: 'vu', es: 'VULNERABLE', en: 'VULNERABLE' },
  { key: 'EN', className: 'en', es: 'EN PELIGRO', en: 'ENDANGERED' },
  { key: 'CR', className: 'cr', es: 'EN PELIGRO CRÍTICO', en: 'CRITICALLY ENDANGERED' },
];

// Get origin URL - use production domain on Vercel to avoid preview auth issues
function getOrigin(): string {
  // Use production domain to bypass preview deployment protection
  if (process.env.VERCEL) {
    return 'https://fotosaves-nt.vercel.app';
  }
  return 'http://localhost:3000';
}

// Helper to fetch JSON data from public folder
async function fetchJsonData<T>(path: string): Promise<{ data: T[] } | null> {
  try {
    const origin = getOrigin();
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

// Build location string
function buildLocation(item: ImageData): string {
  const parts = [
    item.Location || '',
    item.Province || '',
    (item.Country && item.Country !== 'Argentina') ? item.Country : ''
  ];
  return parts.filter(p => p && p !== 'null' && p !== 'undefined').join(', ');
}

// Build location + date string
function buildLocationDateString(item: ImageData): string {
  const location = buildLocation(item);
  const date = formatDate(item.Date);
  if (location && date) return `${location} - ${date}`;
  return location || date || '';
}

// Format date for display
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const s = String(dateStr);
  if (s.includes('T')) return formatDate(s.split('T')[0]);

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
      month: 'short', year: 'numeric'
    });
  }
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

// Normalize threat level
function normalizeThreat(value: string | null): string {
  if (!value) return '';
  const key = String(value).toUpperCase().trim();
  return ['NT', 'VU', 'EN', 'CR'].includes(key) ? key : '';
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const params = await searchParams;
  const groupType = params.groupType as string;
  const groupId = params.groupId as string;

  if (!groupType || !groupId) {
    return { title: 'Group Not Found - Fotosaves' };
  }

  return {
    title: `${groupId} - ${groupType} | FotosAves.com.ar`,
    description: `Fotografías de especies de aves en ${groupType} ${groupId}. Imágenes originales tomadas en Argentina.`,
    keywords: [
      'Aves', 'Birds', 'Argentina', 'Birds of Argentina', 'Aves de Argentina', 'Birdwatching', 'Bird watching',
      'fotografías de aves', 'fotos de aves', 'fotografías de aves de Argentina', 'fotos de aves de Argentina',
      'Bird photos of Argentina', 'Bird photography of Argentina', 'photos of Argentinian birds', 'photos of Argentine birds',
      'Argentina wildlife', 'Argentine birds', 'Wildlife photography', 'Ornithology',
      groupType, groupId
    ],
    openGraph: {
      title: `${groupId} - ${groupType}`,
      description: `Fotografías de especies de aves en ${groupType} ${groupId}. Imágenes originales tomadas en Argentina.`,
      url: `https://fotosaves.com.ar/grupo?groupType=${groupType}&groupId=${encodeURIComponent(groupId)}`,
      siteName: 'FotosAves.com.ar',
      images: [
        {
          url: '/images/thumbnails/SBRH3.jpg',
          width: 1200,
          height: 630,
          alt: `Fotografía de aves - ${groupType} ${groupId}`,
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${groupId} - ${groupType}`,
      description: `Fotografías de especies de aves en ${groupType} ${groupId}.`,
      images: ['/images/thumbnails/SBRH3.jpg'],
    },
  };
}

// Inline styles for this page
const pageStyles = `
  body {
    background-color: #999973;
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 8px 20px 20px 20px;
    line-height: 1.4;
  }

  #breadcrumbs {
    max-width: 800px;
    margin: 6px auto 20px auto;
    padding: 0;
    box-sizing: border-box;
  }

  .breadcrumb-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 4px 0;
    table-layout: auto;
  }

  .breadcrumb-cell {
    background: #c8dfc8;
    border: 1px solid #6a9678;
    border-radius: 6px;
    padding: 4px 10px;
    text-align: center;
    vertical-align: middle;
    min-height: 38px;
  }

  .breadcrumb-cell .bc-top {
    font-weight: bold;
    color: #494242;
    font-size: 0.85em;
  }

  .breadcrumb-cell .bc-tax-es {
    color: #494242;
    display: inline;
    white-space: nowrap;
  }

  .breadcrumb-cell .bc-tax-es::after {
    content: " - ";
    color: #494242;
  }

  .breadcrumb-cell .bc-tax-en {
    color: #036118;
    display: inline;
    white-space: nowrap;
  }
    font-size: 0.75em;
    color: #666;
    line-height: 1.2;
  }

  .breadcrumb-cell .bc-bottom {
    font-weight: bold;
    font-size: 0.95em;
    line-height: 1.3;
  }

  .breadcrumb-cell .bc-es { color: #494242; text-decoration: underline; }
  .breadcrumb-cell .bc-en { color: #036118; text-decoration: underline; }

  .breadcrumb-cell .bc-link {
    color: #0066cc;
    text-decoration: underline;
    font-weight: bold;
    font-style: italic;
  }

  .breadcrumb-cell .bc-nolink {
    color: #494242;
    font-style: italic;
    font-weight: bold;
  }

  .breadcrumb-cell a {
    text-decoration: none;
  }

  .heading-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    background-color: rgba(255, 255, 255, 0.1); /* same as toc-container */
    border: 2px solid #769e76;
    border-radius: 18px;
    padding: 4px 12px;
    margin: 5px auto;
    max-width: 800px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }

  #headingBox {
    border: 2px solid #6a9678;
    padding: 0px 12px;
    background: #b0dbaa;
    max-width: 800px;
    box-sizing: border-box;
    margin: 10px auto;
    text-align: center;
    border-radius: 15px;
  }

  h1 {
    font-weight: bold;
    font-style: italic;
    color: #685244;
    font-size: 2.2em;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .subHeadingBox {
    border: 2px solid #6a9678;
    padding: 6px 8px;
    background: #b0dbaa;
    max-width: 780px;
    margin: 6px auto 10px auto;
    text-align: center;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  h2 {
    font-weight: bold;
    font-style: italic;
    color: #685244;
    font-size: 1.4em;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .toc-container {
    margin: 10px auto;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 7px 12px 4px 12px;
    border-radius: 15px;
  }

  .heading-container.toc-container > div:first-child {
    margin: 0;
  }

  /* Spanish and English text colors */
  .Sp_Text {
    font-weight: bold;
    color: #494242;
  }
  .En_Text {
    font-weight: bold;
    color: #036118;
  }

  /* Conservation status font size fix for CRITICALLY ENDANGERED */
  .status-box.cr .label-es,
  .status-box.cr .label-en {
    font-size: 0.85em;
  }

  /* Fix anchor scrolling to account for fixed header and dynamic content */
  .species-section {
    scroll-margin-top: 15px; /* Reduced for better positioning */
  }

  /* Smooth scrolling for anchor navigation */
  html {
    scroll-behavior: smooth;
  }

  /* Species title styling */
  .species-title {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1em;
    font-weight: bold;
    margin: 0;
    line-height: 1.5;
    color: #333;
  }

  .scientific-name {
    font-style: italic;
    font-weight: normal;
  }

  .english-text {
    color: #006600;
  }

  /* Info sections */
  .info-section {
    background-color: #BEC8B9;
    padding: 3px;
    text-align: center;
    margin-bottom: 0;
    border: 1px solid #999;
    color: #333;
  }

  .info-section:last-child {
    border-radius: 0 0 12px 12px;
  }

  .camera-info {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    margin: 0;
    color: #333;
  }

  .location-info {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    margin: 0;
    color: #333;
  }

  /* Gender label styling */
  .gender-label {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    margin: 0;
    font-weight: bold;
    color: #333;
  }

  #speciesIndex {
    width: 99%;
    margin: 10px auto;
    font-family: Arial, sans-serif;
    border-collapse: collapse;
    text-align: left;
    background-color: #bbd3bb;
    box-shadow: 0 0 10px rgba(0,128,0,0.1);
    border-radius: 10px;
    overflow: hidden;
  }

  #speciesIndex td, #speciesIndex th {
    padding: 2px 20px;
    border-bottom: 1px solid #315f30;
  }

  #speciesIndex tr:nth-child(even) {
    background-color: #d6ecd3;
  }

  #speciesIndex a {
    color: #013b01;
    text-decoration: none;
  }

  #speciesIndex a:hover {
    font-weight: bold;
    color: #010801;
  }

  #speciesIndex b {
    color: #7c7151;
  }

  #speciesIndex tr.group-header {
    background-color: #e6f7bc;
    font-style: italic;
    font-size: 1.2em;
  }

  .photo-group {
    margin-bottom: 24px !important;
  }

  .image-frame {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .image-frame img {
    height: 400px !important; /* Fixed height to prevent layout shifts during image loading */
    object-fit: contain !important; /* Maintain aspect ratio and fit within container */
    border: 1px solid #663300;
    border-radius: 8px;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .image-frame img {
      height: auto !important; /* Allow natural height on mobile */
      max-height: 300px !important; /* Limit maximum height */
      width: 100% !important; /* Full width on mobile */
      object-fit: contain !important;
    }

    .image-frame {
      border: none !important; /* Remove border on mobile for cleaner look */
    }
  }

  .species-more-link {
    margin: -8px 0 2px 0;
    text-align: center;
  }

  .species-more-link .more-link {
    display: inline-block;
    padding: 3px 10px;
    background-color: rgba(255,255,255,0.8);
    border: 1px solid #769e76;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    line-height: 1.1;
    color: #013b01;
    transition: background-color 0.2s;
  }

  .species-more-link .more-link:hover {
    background-color: rgba(255,255,255,0.95);
    text-decoration: none;
  }

  .species-more-link .more-icon {
    font-size: 16px;
    margin: 0 3px;
    vertical-align: middle;
  }

  .species-more-link .more-text-es,
  .species-more-link .more-text-en {
    font-size: 14px;
    vertical-align: middle;
  }

  .species-more-link .more-text-en {
    color: #036118;
  }

  .site-footer {
    max-width: 800px;
    margin: 20px auto;
    padding: 15px;
    background: rgba(0,0,0,0.1);
    border-radius: 10px;
    text-align: center;
    font-size: 0.9em;
    color: #333;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .species-title {
      font-size: 0.9em;
    }
  }
`;

// Main page component
export default async function GrupoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const path = params.path as string;
  const pageLevel = params.groupType as string;
  const groupID = params.groupId as string;

  if (!pageLevel || !groupID) {
    notFound();
  }

  // Load all taxonomy data from public folder via HTTP
  const [speciesData, ordersData, subordersData, familiesData, subfamiliesData] = await Promise.all([
    fetchJsonData<Species>('/data/taxonomy/species.json'),
    fetchJsonData<Order>('/data/taxonomy/orders.json'),
    fetchJsonData<Suborder>('/data/taxonomy/suborders.json'),
    fetchJsonData<Family>('/data/taxonomy/families.json'),
    fetchJsonData<Subfamily>('/data/taxonomy/subfamilies.json'),
  ]);

  if (!speciesData) {
    notFound();
  }

  const species = speciesData.data;
  const orders = ordersData?.data || [];
  const suborders = subordersData?.data || [];
  const families = familiesData?.data || [];
  const subfamilies = subfamiliesData?.data || [];

  // Determine which species need images loaded based on page level
  let speciesToLoad: Species[] = [];
  if (pageLevel === "order") {
    speciesToLoad = species.filter(sp => sp.Order_Sci === groupID && Number(sp.Image_Cnt || 0) > 0);
  } else if (pageLevel === "suborder") {
    speciesToLoad = species.filter(sp => sp.Suborder_Sci === groupID && Number(sp.Image_Cnt || 0) > 0);
  } else if (pageLevel === "family") {
    speciesToLoad = species.filter(sp => sp.Family_Sci === groupID && Number(sp.Image_Cnt || 0) > 0);
  } else if (pageLevel === "subfamily") {
    speciesToLoad = species.filter(sp => sp.Subfamily_Sci === groupID && Number(sp.Image_Cnt || 0) > 0);
  }

  // Load all species image data in parallel
  const speciesImagePromises = speciesToLoad.map(async (sp) => {
    try {
      const imageData = await fetchJsonData<ImageData>(`/data/species/${sp.Species_ID}.json`);
      return {
        species: sp,
        images: imageData?.data || []
      } as SpeciesImageData;
    } catch (error) {
      console.error(`Failed to load images for ${sp.Species_ID}:`, error);
      return {
        species: sp,
        images: []
      } as SpeciesImageData;
    }
  });

  const speciesImageData = await Promise.all(speciesImagePromises);

  // Create a map for quick lookup
  const speciesImageMap = new Map<string, ImageData[]>();
  speciesImageData.forEach(item => {
    speciesImageMap.set(item.species.Species_ID, item.images);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <a id="top"></a>

      {/* Site Header */}
      <SharedHeader showSearch={true} showQuickLinks={false} language="es" />

      {/* Breadcrumbs */}
      {renderBreadcrumbs(pageLevel, groupID, orders, suborders, families, subfamilies)}

      {/* Heading Box */}
      {renderHeadingBox(pageLevel, groupID, orders, suborders, families, subfamilies)}

      {/* Subfamily Quick Row (if applicable) */}
      {renderSubfamilyQuickRow(pageLevel, groupID, families, subfamilies, path)}

      {/* Table of Contents */}
      {renderTableOfContents(species, pageLevel, groupID)}

      {/* Images Section */}
      <div className="container">
        {renderImagesSection(pageLevel, groupID, species, orders, suborders, families, subfamilies, path, speciesImageMap)}
      </div>

      {/* Footer */}
      <div className="site-footer">
        <p>
          <span style={{ color: '#494242' }}>Todas las fotos © {new Date().getFullYear()} Alec Earnshaw</span>
          {' | '}
          <span style={{ color: '#036118' }}>All photos © {new Date().getFullYear()} Alec Earnshaw</span>
        </p>
        <p>
          <ContactLink />
        </p>
      </div>

      <BackToTop />
      <LightboxScripts />

      {/* Enhanced anchor scrolling for dynamic content */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Handle anchor links with delayed scrolling for dynamic content
              document.querySelectorAll('a[href^="#"]').forEach(function(link) {
                link.addEventListener('click', function(e) {
                  const targetId = this.getAttribute('href').substring(1);
                  const targetElement = document.getElementById(targetId);

                  if (targetElement) {
                    e.preventDefault();

                    // Small delay to ensure dynamic content has loaded
                    setTimeout(function() {
                      targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  }
                });
              });

              // Also handle direct URL anchor navigation (when page loads with #hash)
              if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                  // Delay to ensure all content has loaded
                  setTimeout(function() {
                    targetElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }, 500); // Longer delay for initial page load
                }
              }
            });
          `,
        }}
      />
    </>
  );
}

// Helper functions

function renderBreadcrumbs(pageLevel: string, groupID: string, orders: Order[], suborders: Suborder[], families: Family[], subfamilies: Subfamily[]) {
  const cells = [];

  // 1. Inicio / Home cell
  cells.push({
    labelEs: 'Inicio',
    labelEn: 'Home',
    hrefEs: '/index_sp.html',
    hrefEn: '/index_english.html',
    isBilingual: true
  });

  // 2. Aves / Birds cell
  cells.push({
    labelEs: 'Aves',
    labelEn: 'Birds',
    hrefEs: '/aves',
    hrefEn: '/birds',
    isBilingual: true
  });

  // Find current group's row and parent hierarchy
  let orderRow: Order | undefined = undefined;
  let suborderRow: Suborder | undefined = undefined;
  let familyRow: Family | undefined = undefined;
  let subfamilyRow: Subfamily | undefined = undefined;

  switch(pageLevel) {
    case 'order':
      orderRow = orders.find(o => o.Order_Name_Sci === groupID);
      break;
    case 'suborder':
      suborderRow = suborders.find(so => so.SO_Name_Sci === groupID);
      if (suborderRow) {
        orderRow = orders.find(o => o.Order_ID === suborderRow!.Parent_Order_ID);
      }
      break;
    case 'family':
      familyRow = families.find(f => f.Family_Name_Sci === groupID);
      if (familyRow) {
        if (familyRow!.Suborder_ID) {
          suborderRow = suborders.find(so => so.SO_ID === familyRow!.Suborder_ID);
        }
        orderRow = orders.find(o => o.Order_ID === familyRow!.Parent_Order_ID);
      }
      break;
    case 'subfamily':
      subfamilyRow = subfamilies.find(sf => sf.Subfamily_Sci === groupID);
      if (subfamilyRow) {
        familyRow = families.find(f => f.Family_ID === subfamilyRow!.Family_ID);
        if (familyRow) {
          orderRow = orders.find(o => o.Order_ID === familyRow!.Parent_Order_ID);
        }
      }
      break;
  }

  // 3a. Order cell
  if (orderRow) {
    const hasLink = !!orderRow.Order_Path;
    const href = hasLink ? `/grupo?path=${orderRow.Order_Path}&groupType=order&groupId=${orderRow.Order_Name_Sci}` : null;
    cells.push({
      label: '<span class="bc-tax-es">Orden</span><span class="bc-tax-en">Order</span>',
      name: orderRow.Order_Name_Sci,
      href: href,
      isScientific: true,
      isCurrent: pageLevel === 'order'
    });
  }

  // 3b. Suborder cell
  if (suborderRow) {
    const hasLink = !!suborderRow.SO_Path;
    const href = hasLink ? `/grupo?path=${suborderRow.SO_Path}&groupType=suborder&groupId=${suborderRow.SO_Name_Sci}` : null;
    cells.push({
      label: '<span class="bc-tax-es">Suborden</span><span class="bc-tax-en">Suborder</span>',
      name: suborderRow.SO_Name_Sci,
      href: href,
      isScientific: true,
      isCurrent: pageLevel === 'suborder'
    });
  }

  // 3c. Family cell
  if (familyRow && pageLevel !== 'order') {
    const hasLink = !!familyRow.Family_Path;
    const href = hasLink ? `/grupo?path=${familyRow.Family_Path}&groupType=family&groupId=${familyRow.Family_Name_Sci}` : null;
    cells.push({
      label: '<span class="bc-tax-es">Familia</span><span class="bc-tax-en">Family</span>',
      name: familyRow.Family_Name_Sci,
      href: href,
      isScientific: true,
      isCurrent: pageLevel === 'family'
    });
  }

  // 3d. Subfamily cell
  if (subfamilyRow) {
    const hasLink = !!subfamilyRow.SF_Path;
    const href = hasLink ? `/grupo?path=${subfamilyRow.SF_Path}&groupType=subfamily&groupId=${subfamilyRow.Subfamily_Sci}` : null;
    cells.push({
      label: '<span class="bc-tax-es">Subfamilia</span><span class="bc-tax-en">Subfamily</span>',
      name: subfamilyRow.Subfamily_Sci,
      href: href,
      isScientific: true,
      isCurrent: pageLevel === 'subfamily'
    });
  }

  return (
    <div id="breadcrumbs">
      <table className="breadcrumb-table">
        <tbody>
          <tr>
            {cells.map((cell, index) => (
              <td key={index} className="breadcrumb-cell">
                {cell.isBilingual ? (
                  <div className="bc-bottom">
                    <a href={cell.hrefEs}><span className="bc-es">{cell.labelEs}</span></a><br />
                    <a href={cell.hrefEn}><span className="bc-en">{cell.labelEn}</span></a>
                  </div>
                ) : cell.isScientific ? (
                  <>
                    <div className="bc-top" dangerouslySetInnerHTML={{ __html: cell.label }} />
                    <div className="bc-bottom">
                      {cell.href && !cell.isCurrent ? (
                        <a href={cell.href}><span className="bc-link">{cell.name}</span></a>
                      ) : (
                        <span className="bc-nolink">{cell.name}</span>
                      )}
                    </div>
                  </>
                ) : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function renderHeadingBox(pageLevel: string, groupID: string, orders: Order[], suborders: Suborder[], families: Family[], subfamilies: Subfamily[]) {
  let Sp_Descr = "";
  let En_Descr = "";
  let Tax_Group_Sp = "";
  let Tax_Group_En = "";

  switch(pageLevel) {
    case "order":
      const Order_Row = orders.find(order => order.Order_Name_Sci === groupID);
      Sp_Descr = Order_Row ? Order_Row.Order_Name_Sp : '';
      En_Descr = Order_Row ? Order_Row.Order_Name_En : '';
      Tax_Group_Sp = "Orden";
      Tax_Group_En = "Order";
      break;
    case "suborder":
      const Suborder_Row = suborders.find(suborder => suborder.SO_Name_Sci === groupID);
      Sp_Descr = Suborder_Row ? Suborder_Row.SO_Name_Sp : '';
      En_Descr = Suborder_Row ? Suborder_Row.SO_Name_En : '';
      Tax_Group_Sp = "Suborden";
      Tax_Group_En = "Suborder";
      break;
    case "family":
      const Family_Row = families.find(family => family.Family_Name_Sci === groupID);
      Sp_Descr = Family_Row ? Family_Row.Family_Name_Sp : '';
      En_Descr = Family_Row ? Family_Row.Family_Name_En : '';
      Tax_Group_Sp = "Familia";
      Tax_Group_En = "Family";
      break;
    case "subfamily":
      const Subfamily_Row = subfamilies.find(subfamily => subfamily.Subfamily_Sci === groupID);
      Sp_Descr = Subfamily_Row ? Subfamily_Row.Subfamily_Sp : '';
      En_Descr = Subfamily_Row ? Subfamily_Row.Subfamily_En : '';
      Tax_Group_Sp = "Subfamilia";
      Tax_Group_En = "Subfamily";
      break;
  }

  return (
    <div id="headingBox">
      <table style={{ width: '100%', margin: 'auto' }}>
        <tbody>
          <tr className="data-row">
            <td style={{ textAlign: 'center' }}>
              <span className="Sp_Text">{Tax_Group_Sp}:</span><br />
              <span className="En_Text">{Tax_Group_En}:</span>
            </td>
            <td className="centerCell">
              <h1>{groupID}</h1>
            </td>
            <td style={{ textAlign: 'center' }}>
              <span className="Sp_Text">{Sp_Descr}</span><br />
              <span className="En_Text">{En_Descr}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function renderSubfamilyQuickRow(pageLevel: string, groupID: string, families: Family[], subfamilies: Subfamily[], path: string) {
  if (pageLevel !== 'family') return null;

  const famRow = families.find(f => f.Family_Name_Sci === groupID);
  if (!famRow) return null;

  const subfams = subfamilies.filter(sf => sf.Family_ID === famRow.Family_ID);
  if (!subfams.length) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '4px auto 0 auto', textAlign: 'center' }}>
      <div><span className="Sp_Text">Subfamilias</span> – <span className="En_Text">Subfamilies</span></div>
    <div>
        {subfams.map((sf, index) => (
          <span key={sf.Subfamily_Sci}>
            <a href={`/grupo?path=${sf.SF_Path || path || ''}&groupType=subfamily&groupId=${sf.Subfamily_Sci}`}>
              {sf.Subfamily_Sci}
            </a>
            {index < subfams.length - 1 && ' | '}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderTableOfContents(species: Species[], pageLevel: string, groupID: string) {
  let filtered: Species[] = [];
  if (pageLevel === "order") {
    filtered = species.filter(sp => sp.Order_Sci === groupID);
  } else if (pageLevel === "suborder") {
    filtered = species.filter(sp => sp.Suborder_Sci === groupID);
  } else if (pageLevel === "family") {
    filtered = species.filter(sp => sp.Family_Sci === groupID);
  } else if (pageLevel === "subfamily") {
    filtered = species.filter(sp => sp.Subfamily_Sci === groupID);
  }

  // Only include species with images
  filtered = filtered.filter(sp => Number(sp.Image_Cnt || 0) > 0);

  let lastGroup = "";
  const rows = [];

  for (const sp of filtered) {
    let groupKey = "";
    if (pageLevel === "order" || pageLevel === "suborder") {
      groupKey = sp.Family_Sci;
    } else if (pageLevel === "family") {
      groupKey = sp.Subfamily_Sci || "";
    }

    // Add group header if needed
    if (groupKey && groupKey !== lastGroup) {
      rows.push(
        <tr key={`header-${groupKey}`} className="group-header">
          <td colSpan={3}><b>{groupKey}</b></td>
        </tr>
      );
      lastGroup = groupKey;
    }

    // Add species row
    rows.push(
      <tr key={sp.Species_ID}>
        <td><a href={`#${sp.Species_ID}`}>{sp.Species_Name_Sp}</a></td>
        <td><a href={`#${sp.Species_ID}`}>{sp.Species_Name_En}</a></td>
        <td><a href={`#${sp.Species_ID}`}><i>{sp.Species_Name_Sci}</i></a></td>
      </tr>
    );
  }

  return (
    <div className="heading-container toc-container">
      <div style={{ textAlign: 'center' }}>
        <span className="Sp_Text">Tabla de contenido</span> - <span className="En_Text">Table of contents</span>
      </div>
      <table id="speciesIndex">
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

function renderImagesSection(
  pageLevel: string,
  groupID: string,
  species: Species[],
  orders: Order[],
  suborders: Suborder[],
  families: Family[],
  subfamilies: Subfamily[],
  path: string,
  speciesImageMap: Map<string, ImageData[]>
) {
  let filtered: Species[] = [];
  if (pageLevel === "order") {
    filtered = species.filter(sp => sp.Order_Sci === groupID);
  } else if (pageLevel === "suborder") {
    filtered = species.filter(sp => sp.Suborder_Sci === groupID);
  } else if (pageLevel === "family") {
    filtered = species.filter(sp => sp.Family_Sci === groupID);
  } else if (pageLevel === "subfamily") {
    filtered = species.filter(sp => sp.Subfamily_Sci === groupID);
  }

  // Only include species with images
  filtered = filtered.filter(sp => Number(sp.Image_Cnt || 0) > 0);

  const sections = [];

  // Subfamily page: no subheading needed
  if (pageLevel === 'subfamily') {
    for (const sp of filtered) {
      const section = renderSpeciesSection(sp, path, speciesImageMap);
      if (section) sections.push(section);
    }
    return sections;
  }

  // Family page: group by subfamily if subfamilies exist
  if (pageLevel === 'family') {
    const subfamilySet = new Set(filtered.map(sp => sp.Subfamily_Sci).filter(Boolean));
    if (subfamilySet.size > 0) {
      const subfamiliesWithImages = Array.from(subfamilySet).filter(sf =>
        filtered.some(sp => sp.Subfamily_Sci === sf && Number(sp.Image_Cnt || 0) > 0)
      );

      for (let sfIndex = 0; sfIndex < subfamiliesWithImages.length; sfIndex++) {
        const subfamilySci = subfamiliesWithImages[sfIndex];
        const isLastSubfamily = (sfIndex === subfamiliesWithImages.length - 1);
        const anySp = filtered.find(sp => sp.Subfamily_Sci === subfamilySci);
        const orderSci = anySp ? anySp.Order_Sci : '';
        const familySci = anySp ? anySp.Family_Sci : '';
        const speciesInSubfamily = filtered.filter(sp => sp.Subfamily_Sci === subfamilySci && Number(sp.Image_Cnt || 0) > 0);

        // Add subfamily heading
        sections.push(
          <div key={`heading-${subfamilySci}`} className="subHeadingBox">
            <table style={{ width: '100%', margin: 'auto' }}>
              <tbody>
                <tr className="data-row">
                  <td style={{ textAlign: 'center' }}>
                    <span className="Sp_Text">Subfamilia:</span><br />
                    <span className="En_Text">Subfamily:</span>
                  </td>
                  <td><h2>{subfamilySci}</h2></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="Sp_Text">{subfamilies.find(sf => sf.Subfamily_Sci === subfamilySci)?.Subfamily_Sp || ''}</span><br />
                    <span className="En_Text">{subfamilies.find(sf => sf.Subfamily_Sci === subfamilySci)?.Subfamily_En || ''}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

        // Add species in this subfamily
        for (const sp of speciesInSubfamily) {
          const section = renderSpeciesSection(sp, path, speciesImageMap);
          if (section) sections.push(section);
        }

        // Spacer after subfamily (except last)
        if (!isLastSubfamily) {
          sections.push(<div key={`spacer-${subfamilySci}`} style={{ height: '30px' }} />);
        }
      }
      return sections;
    }
  }

  // Default: iterate by family
  const familySet = new Set(filtered.map(sp => sp.Family_Sci).filter(Boolean));
  const familiesWithImages = Array.from(familySet).filter(fam =>
    filtered.some(sp => sp.Family_Sci === fam && Number(sp.Image_Cnt || 0) > 0)
  );

  for (let famIndex = 0; famIndex < familiesWithImages.length; famIndex++) {
    const familySci = familiesWithImages[famIndex];
    const isLastFamily = (famIndex === familiesWithImages.length - 1);
    const anySp = filtered.find(sp => sp.Family_Sci === familySci);
    const orderSci = anySp ? anySp.Order_Sci : '';
    const speciesInFamily = filtered.filter(sp => sp.Family_Sci === familySci && Number(sp.Image_Cnt || 0) > 0);

    // Add family heading (skip for order/suborder pages)
    if (pageLevel !== 'order' && pageLevel !== 'suborder') {
      sections.push(
        <div key={`heading-${familySci}`} className="subHeadingBox">
          <table style={{ width: '100%', margin: 'auto' }}>
            <tbody>
              <tr className="data-row">
                <td style={{ textAlign: 'center' }}>
                  <span className="Sp_Text">Familia:</span><br />
                  <span className="En_Text">Family:</span>
                </td>
                <td><h2>{familySci}</h2></td>
                <td style={{ textAlign: 'center' }}>
                  <span className="Sp_Text">{families.find(f => f.Family_Name_Sci === familySci)?.Family_Name_Sp || ''}</span><br />
                  <span className="En_Text">{families.find(f => f.Family_Name_Sci === familySci)?.Family_Name_En || ''}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Add species in this family
    for (const sp of speciesInFamily) {
      const section = renderSpeciesSection(sp, path, speciesImageMap);
      if (section) sections.push(section);
    }

    // Spacer between families (except last)
    if (!isLastFamily) {
      sections.push(<div key={`spacer-${familySci}`} style={{ height: '30px' }} />);
    }
  }

  return sections;
}

function renderSpeciesSection(species: Species, path: string, speciesImageMap: Map<string, ImageData[]>) {
  // Get pre-fetched species images
  const images = speciesImageMap.get(species.Species_ID) || [];
  const coverItems = images.filter((item: ImageData) => item.Slide !== 'Y' && item.Cover === 'Y');

  if (coverItems.length === 0) return null;

    const threatKey = normalizeThreat(species.Endangered);

  return (
    <div key={species.Species_ID} className="species-section" id={species.Species_ID}>
      {/* Species Title */}
      <div className="species-title-box">
        <div className="species-title">
          {species.Species_Name_Sp}<br />
          <span className="scientific-name">{species.Species_Name_Sci}</span><br />
          <span className="english-text">{species.Species_Name_En}</span>
          {species.Exotic && species.Exotic.trim() !== '' && (
            <>
              <br />
              <span className="exotic-species">
                <span className="exotic-spanish">Especie EXÓTICA proveniente de {species.Exotic}</span>
                {' - '}
                <span className="exotic-english">EXOTIC species from {species.Exotic}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Conservation Status */}
      {threatKey && (
        <div className="status-panel">
          <div className="status-heading">
            <div className="es">¡ESPECIE GLOBALMENTE AMENAZADA!</div>
            <div className="en">GLOBALLY THREATENED SPECIES!</div>
          </div>
          <div className="status-grid">
            {STATUS_ITEMS.map(item => (
              <div
                key={item.key}
                className={`status-box ${item.className} ${item.key === threatKey ? 'is-selected' : ''}`}
              >
                <span className="label-es">{item.es}</span>
                <span className="label-en">{item.en}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="species-photos">
        {coverItems.map((item: ImageData, index: number) => {
          const code = (item.Sex_Age_Code || item.Sex_Age || '').toString().trim().toUpperCase();
          const genderInfo = genderMap[code];
          const thumb = `/images/Aves/${path || ''}${item.Thumbnail_Filename}`;
          const large = `/images/Aves/${path || ''}${item.Large_Filename || ''}`;
          const hasLarge = !!item.Large_Filename && item.Large_Filename !== item.Thumbnail_Filename;
          const locationDateStr = buildLocationDateString(item);

          return (
            <div key={index} className="photo-group">
              {(genderInfo || (item.Sex_Age && item.Sex_Age.trim())) && (
                <div
                  className="gender-box"
                  style={genderInfo?.color ? { backgroundColor: genderInfo.color } : undefined}
        dangerouslySetInnerHTML={{
                    __html: genderInfo ? genderInfo.label : (item.Sex_Age || '')
                  }}
                />
              )}

              <div className="image-frame">
                {hasLarge ? (
                  <a
                    href={large}
                    rel={`lightbox[${species.Species_ID}]`}
                    title={locationDateStr}
                  >
                    <img src={thumb} alt={species.Species_Name_Sp} loading="lazy" />
                  </a>
                ) : (
                  <img src={thumb} alt={species.Species_Name_Sp} loading="lazy" />
                )}
              </div>

              <div className="info-section camera-info">{item.Equipment || ''}</div>
              <div className="info-section location-info">{locationDateStr}</div>
            </div>
          );
        })}
      </div>

      {/* More photos link */}
      {species.Has_Sp_Link === 'Y' && (
        <div className="species-more-link">
          <a
            className="more-link"
            href={`/especie?speciesId=${species.Species_ID}&imagesPath=${path || ''}`}
          >
            <span className="more-text-es">Más fotos...</span>
            <span className="more-icon" aria-hidden="true">📷</span>
            <span className="more-text-en">More photos...</span>
          </a>
        </div>
      )}
    </div>
  );
}

