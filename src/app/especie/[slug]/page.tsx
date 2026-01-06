import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LightboxScripts from './LightboxScripts';
import BackToTop from './BackToTop';
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
}

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
  Subfamily_Sci: string;
  SF_Path: string | null;
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

// Gender/Age mapping
const genderMap: Record<string, { label: string; color: string }> = {
  'M': { label: '<span class="es">Macho</span><span class="en">Male</span>', color: '#a8d4f0' },
  'F': { label: '<span class="es">Hembra</span><span class="en">Female</span>', color: '#f0c8d8' },
  'J': { label: '<span class="es">Juvenil</span><span class="en">Juvenile</span>', color: '#d4f0a8' },
  'I': { label: '<span class="es">Inmaduro</span><span class="en">Immature</span>', color: '#f0e8a8' },
  'MJ': { label: '<span class="es">Macho Juvenil</span><span class="en">Juvenile Male</span>', color: '#a8d4c0' },
  'FJ': { label: '<span class="es">Hembra Juvenil</span><span class="en">Juvenile Female</span>', color: '#e8c0d0' },
  'MI': { label: '<span class="es">Macho Inmaduro</span><span class="en">Immature Male</span>', color: '#c0d4f0' },
  'FI': { label: '<span class="es">Hembra Inmadura</span><span class="en">Immature Female</span>', color: '#f0d0e0' },
  'MR': { label: '<span class="es">Macho Reproductivo</span><span class="en">Breeding Male</span>', color: '#80c0f0' },
  'FR': { label: '<span class="es">Hembra Reproductiva</span><span class="en">Breeding Female</span>', color: '#f0a0c0' },
  'MN': { label: '<span class="es">Macho No Reproductivo</span><span class="en">Non-breeding Male</span>', color: '#b0d8f0' },
  'FN': { label: '<span class="es">Hembra No Reproductiva</span><span class="en">Non-breeding Female</span>', color: '#f0d0e8' },
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

// Get image path - check Subfamily, then Family, then Suborder, then Order
function getImagePath(
  species: Species, 
  orders: Order[], 
  suborders: Suborder[],
  families: Family[],
  subfamilies: Subfamily[]
): string {
  const safeSubfamilies = subfamilies || [];
  const safeFamilies = families || [];
  const safeSuborders = suborders || [];
  const safeOrders = orders || [];
  
  // 1. Check Subfamily path first
  if (species.Subfamily_Sci) {
    const subfamily = safeSubfamilies.find(sf => sf.Subfamily_Sci === species.Subfamily_Sci);
    if (subfamily?.SF_Path) {
      return subfamily.SF_Path;
    }
  }
  
  // 2. Check Family path
  const family = safeFamilies.find(f => f.Family_Name_Sci === species.Family_Sci);
  if (family?.Family_Path) {
    return family.Family_Path;
  }
  
  // 3. Check Suborder path (for orders like Charadriiformes that are subdivided)
  if (species.Suborder_Sci) {
    const suborder = safeSuborders.find(so => so.SO_Name_Sci === species.Suborder_Sci);
    if (suborder?.SO_Path) {
      return suborder.SO_Path;
    }
  }
  
  // 4. Fall back to Order path
  const order = safeOrders.find(o => o.Order_Name_Sci === species.Order_Sci);
  return order?.Order_Path || '';
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

// Normalize threat level
function normalizeThreat(value: string | null): string {
  if (!value) return '';
  const key = String(value).toUpperCase().trim();
  return ['NT', 'VU', 'EN', 'CR'].includes(key) ? key : '';
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const speciesData = await fetchJsonData<Species>('/data/taxonomy/species.json');
  const species = speciesData?.data.find(sp => sp.Slug === slug);
  
  if (!species) {
    return { title: 'Species Not Found - Fotosaves' };
  }
  
  // Build comprehensive keywords including species names, family, and order
  const keywords = [
    'Aves', 'Birds', 'Argentina', 'Birds of Argentina', 'Aves de Argentina', 'Birdwatching', 'Bird watching',
    'fotografías de aves', 'fotos de aves', 'fotografías de aves de Argentina', 'fotos de aves de Argentina',
    'Bird photos of Argentina', 'Bird photography of Argentina', 'photos of Argentinian birds', 'photos of Argentine birds',
    'Argentina wildlife', 'Argentine birds', 'Wildlife photography', 'Ornithology',
    // Species names
    species.Species_Name_Sp, species.Species_Name_En, species.Species_Name_Sci,
    // Family and Order
    species.Family_Sci, species.Order_Sci
  ];

  // Add suborder for Charadriiformes if it exists
  if (species.Suborder_Sci && species.Order_Sci === 'Charadriiformes') {
    keywords.push(species.Suborder_Sci);
  }

  return {
    title: `${species.Species_Name_Sp} / ${species.Species_Name_En} - FotosAves.com.ar`,
    description: `Fotografías de ${species.Species_Name_Sp} (${species.Species_Name_Sci}) - ${species.Species_Name_En}. Imágenes originales tomadas en Argentina.`,
    keywords: keywords,
    openGraph: {
      title: `${species.Species_Name_Sp} / ${species.Species_Name_En}`,
      description: `Fotografías de ${species.Species_Name_Sp} (${species.Species_Name_Sci}) - ${species.Species_Name_En}. Imágenes originales tomadas en Argentina.`,
      url: `https://fotosaves.com.ar/especie/${species.Slug}`,
      siteName: 'FotosAves.com.ar',
      images: [
        {
          url: '/images/thumbnails/SBRH3.jpg',
          width: 1200,
          height: 630,
          alt: `Fotografía de ${species.Species_Name_Sp} - ${species.Species_Name_En}`,
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${species.Species_Name_Sp} / ${species.Species_Name_En}`,
      description: `Fotografías de ${species.Species_Name_Sp} (${species.Species_Name_Sci}) - ${species.Species_Name_En}.`,
      images: ['/images/thumbnails/SBRH3.jpg'],
    },
  };
}

// Inline styles for this page
const pageStyles = `
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
  }

  .breadcrumb-cell .bc-nolink {
    color: #494242;
    font-style: italic;
  }

  .breadcrumb-cell a {
    text-decoration: none;
  }

  .photo-group {
    margin-bottom: 24px !important;
  }

  .image-frame {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .slide-container {
    margin: 30px 0;
    padding: 8px;
    background-color: #b8c9b8;
    border: 2px solid #8a9a8a;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  }

  .slide-title {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.0em;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 3px;
    padding-bottom: 4px;
    border-bottom: 1px solid #999;
  }

  .slide-title-english {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.0em;
    font-weight: bold;
    color: #315523;
    text-align: center;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #999;
  }

  .slide-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .slide-row {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .slide-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 240px;
  }

  .slide-frame {
    background-image: url('/images/cr/ffn.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 230px;
    height: 230px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 30px;
    box-shadow: 3px 5px 7px rgba(0,0,0,0.5);
  }

  .slide-frame img {
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
    border: 1px solid #3a3a3a;
    box-shadow: 1px 2px 4px rgba(0,0,0,0.2);
  }

  .slide-frame a {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slide-info {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.75em;
    color: #666;
    text-align: center;
    line-height: 1.3;
    max-width: 230px;
    word-wrap: break-word;
    margin-top: 3px;
  }

  .slide-location {
    font-weight: bold;
    color: #444;
    margin-bottom: 2px;
  }

  .slide-date {
    font-weight: bold;
    color: #444;
    margin-top: 2px;
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

  /* Gender label styling */
  .gender-label {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    margin: 0;
    font-weight: bold;
    color: #333;
  }

  /* Gender text spans - single line format */
  .gender-box .es {
    color: #494242 !important;
    font-weight: bold !important;
    display: inline !important;
    white-space: nowrap !important;
  }

  .gender-box .es::after {
    content: " - ";
    color: #494242;
    font-weight: normal;
  }

  .gender-box .en {
    color: #036118 !important;
    display: inline !important;
    white-space: nowrap !important;
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

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .species-title {
      font-size: 0.9em;
    }
  }
`;

// Main page component
export default async function SpeciesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // Fetch all taxonomy data from public folder via HTTP
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
  
  // Find species by slug
  const species = speciesData.data.find(sp => sp.Slug === slug);
  if (!species) {
    notFound();
  }
  
  // Load species images
  const imagesData = await fetchJsonData<ImageData>(`/data/species/${species.Species_ID}.json`);
  const images = imagesData?.data || [];
  
  // Get image path
  const imagePath = getImagePath(
    species, 
    ordersData?.data || [], 
    subordersData?.data || [],
    familiesData?.data || [],
    subfamiliesData?.data || []
  );
  
  // Separate main images and slides
  const mainImages = images.filter(img => img.Slide !== 'Y');
  const slides = images.filter(img => String(img.Slide || '').toUpperCase() === 'Y');
  
  // Get threat level
  const threatKey = normalizeThreat(species.Endangered);
  
  // Build breadcrumb data
  const orders = ordersData?.data || [];
  const suborders = subordersData?.data || [];
  const families = familiesData?.data || [];
  const subfamilies = subfamiliesData?.data || [];
  
  const orderRow = orders.find(o => o.Order_Name_Sci === species.Order_Sci);
  const suborderRow = species.Suborder_Sci 
    ? suborders.find(so => so.SO_Name_Sci === species.Suborder_Sci) 
    : null;
  const familyRow = families.find(f => f.Family_Name_Sci === species.Family_Sci);
  const subfamilyRow = species.Subfamily_Sci 
    ? subfamilies.find(sf => sf.Subfamily_Sci === species.Subfamily_Sci) 
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      
      <a id="top"></a>
      
      {/* Site Header */}
      <SharedHeader showSearch={true} showQuickLinks={false} language="es" />

      {/* Breadcrumbs */}
      <div id="breadcrumbs">
        <table className="breadcrumb-table">
          <tbody>
            <tr>
              <td className="breadcrumb-cell">
                <div className="bc-bottom">
                  <a href="/index_sp.html"><span className="bc-es">Inicio</span></a><br />
                  <a href="/index_english.html"><span className="bc-en">Home</span></a>
                </div>
              </td>
              
              <td className="breadcrumb-cell">
                <div className="bc-bottom">
                  <a href="/Aves.html"><span className="bc-es">Aves</span></a><br />
                  <a href="/Birds.html"><span className="bc-en">Birds</span></a>
                </div>
              </td>
              
              {orderRow && (
                <td className="breadcrumb-cell">
                  <div className="bc-top"><span className="bc-tax-es">Orden</span><span className="bc-tax-en">Order</span></div>
                  <div className="bc-bottom">
                    {orderRow.Order_Path ? (
                      <a href={`/grupo?path=${orderRow.Order_Path}&groupType=order&groupId=${species.Order_Sci}`}>
                        <span className="bc-link">{species.Order_Sci}</span>
                      </a>
                    ) : (
                      <span className="bc-nolink">{species.Order_Sci}</span>
                    )}
                  </div>
                </td>
              )}
              
              {suborderRow && (
                <td className="breadcrumb-cell">
                  <div className="bc-top"><span className="bc-tax-es">Suborden</span><span className="bc-tax-en">Suborder</span></div>
                  <div className="bc-bottom">
                    {suborderRow.SO_Path ? (
                      <a href={`/grupo?path=${suborderRow.SO_Path}&groupType=suborder&groupId=${species.Suborder_Sci}`}>
                        <span className="bc-link">{species.Suborder_Sci}</span>
                      </a>
                    ) : (
                      <span className="bc-nolink">{species.Suborder_Sci}</span>
                    )}
                  </div>
                </td>
              )}
              
              {familyRow && (
                <td className="breadcrumb-cell">
                  <div className="bc-top"><span className="bc-tax-es">Familia</span><span className="bc-tax-en">Family</span></div>
                  <div className="bc-bottom">
                    {familyRow.Family_Path ? (
                      <a href={`/grupo?path=${familyRow.Family_Path}&groupType=family&groupId=${species.Family_Sci}`}>
                        <span className="bc-link">{species.Family_Sci}</span>
                      </a>
                    ) : (
                      <span className="bc-nolink">{species.Family_Sci}</span>
                    )}
                  </div>
                </td>
              )}
              
              {subfamilyRow && (
                <td className="breadcrumb-cell">
                  <div className="bc-top"><span className="bc-tax-es">Subfamilia</span><span className="bc-tax-en">Subfamily</span></div>
                  <div className="bc-bottom">
                    {subfamilyRow.SF_Path ? (
                      <a href={`/grupo?path=${subfamilyRow.SF_Path}&groupType=subfamily&groupId=${species.Subfamily_Sci}`}>
                        <span className="bc-link">{species.Subfamily_Sci}</span>
                      </a>
                    ) : (
                      <span className="bc-nolink">{species.Subfamily_Sci}</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Species Title */}
        <div id="species-title">
          <div className="species-section">
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
        </div>

        {/* Conservation Status */}
        {threatKey && (
          <div id="status-panel">
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
          </div>
        )}

        {/* Photo Groups */}
        <div id="images">
          {mainImages.map((item, index) => {
            const code = (item.Sex_Age_Code || item.Sex_Age || '').toString().trim().toUpperCase();
            const genderInfo = genderMap[code];
            const thumb = `/images/Aves/${imagePath}${item.Thumbnail_Filename}`;
            const large = `/images/Aves/${imagePath}${item.Large_Filename || ''}`;
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
                    <img src={thumb} alt={species.Species_Name_Sp} className="unpaired" loading="lazy" />
                  )}
                </div>

                <div className="info-section camera-info">{item.Equipment || ''}</div>
                <div className="info-section location-info">{locationDateStr}</div>
              </div>
            );
          })}
        </div>

        {/* Slides Section */}
        {slides.length > 0 && (
          <div className="slide-container">
            <div className="slide-title">Otras fotos: algunas más antiguas, algunas muy buenas.</div>
            <div className="slide-title-english">Other photos: some older, some very good.</div>
            <div className="slide-grid">
              <div className="slide-row">
                {slides.map((item, index) => {
                  const thumb = `/images/Aves/${imagePath}${item.Thumbnail_Filename}`;
                  const large = `/images/Aves/${imagePath}${item.Large_Filename || ''}`;
                  const hasLarge = !!item.Large_Filename && item.Large_Filename !== item.Thumbnail_Filename;
                  const locationDateStr = buildLocationDateString(item);
                  const slideCountry = (item.Country && item.Country.trim() && item.Country !== 'Argentina') 
                    ? `, ${item.Country.toUpperCase()}` 
                    : '';
                  const slideLocText = [item.Location, item.Province].filter(Boolean).join(', ') + slideCountry;

                  return (
                    <div key={index} className="slide-item">
                      <div className="slide-frame">
                        {hasLarge ? (
                          <a 
                            href={large}
                            rel={`lightbox[${species.Species_ID}-slides]`}
                            title={locationDateStr}
                          >
                            <img src={thumb} alt={species.Species_Name_Sp} loading="lazy" />
                          </a>
                        ) : (
                          <img src={thumb} alt={species.Species_Name_Sp} loading="lazy" />
                        )}
                      </div>
                      <div className="slide-info">
                        <div className="slide-location">{slideLocText.trim()}</div>
                        <div className="slide-date">
                          {item.Date ? item.Date.toString().slice(0, 10) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
    </>
  );
}
