import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import LightboxScripts from './LightboxScripts';
import BackToTop from './BackToTop';

// Force dynamic rendering - data is read at runtime, not bundled at build time
export const dynamic = 'force-dynamic';

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

// Helper to load JSON data from public folder at runtime
// With dynamic = 'force-dynamic', this reads at request time, not build time
function loadJsonData<T>(relativePath: string): { data: T[] } | null {
  try {
    // Read from the public folder - this is available at runtime
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return null;
  }
}

// Get image path - check Subfamily first, then Family, then Order
function getImagePath(
  species: Species, 
  orders: Order[], 
  families: Family[],
  subfamilies: Subfamily[]
): string {
  const safeSubfamilies = subfamilies || [];
  const safeFamilies = families || [];
  const safeOrders = orders || [];
  
  if (species.Subfamily_Sci) {
    const subfamily = safeSubfamilies.find(sf => sf.Subfamily_Sci === species.Subfamily_Sci);
    if (subfamily?.SF_Path) {
      return subfamily.SF_Path;
    }
  }
  
  const family = safeFamilies.find(f => f.Family_Name_Sci === species.Family_Sci);
  if (family?.Family_Path) {
    return family.Family_Path;
  }
  
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
  const speciesData = loadJsonData<Species>('data/taxonomy/species.json');
  const species = speciesData?.data.find(sp => sp.Slug === slug);
  
  if (!species) {
    return { title: 'Species Not Found - Fotosaves' };
  }
  
  return {
    title: `${species.Species_Name_En} - ${species.Species_Name_Sp} | Fotosaves`,
    description: `Photos of ${species.Species_Name_En} (${species.Species_Name_Sci}) - Fotos de ${species.Species_Name_Sp}`,
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
    font-size: 0.75em;
    color: #666;
    line-height: 1.2;
  }

  .breadcrumb-cell .bc-bottom {
    font-weight: bold;
    font-size: 0.95em;
    line-height: 1.3;
  }

  .breadcrumb-cell .bc-es { color: #036118; text-decoration: underline; }
  .breadcrumb-cell .bc-en { color: #494242; text-decoration: underline; }

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
`;

// Main page component
export default async function SpeciesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // Load all taxonomy data from public folder (synchronous reads at runtime)
  const speciesData = loadJsonData<Species>('data/taxonomy/species.json');
  const ordersData = loadJsonData<Order>('data/taxonomy/orders.json');
  const subordersData = loadJsonData<Suborder>('data/taxonomy/suborders.json');
  const familiesData = loadJsonData<Family>('data/taxonomy/families.json');
  const subfamiliesData = loadJsonData<Subfamily>('data/taxonomy/subfamilies.json');
  
  if (!speciesData) {
    notFound();
  }
  
  // Find species by slug
  const species = speciesData.data.find(sp => sp.Slug === slug);
  if (!species) {
    notFound();
  }
  
  // Load species images
  const imagesData = loadJsonData<ImageData>(`data/species/${species.Species_ID}.json`);
  const images = imagesData?.data || [];
  
  // Get image path
  const imagePath = getImagePath(
    species, 
    ordersData?.data || [], 
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
      <div className="heading-container">
        <div className="site-header-banded">
          <div className="site-header-band site-header-band-dark">
            <div className="headline">
              fotos <span style={{ color: '#FF9966' }}>de animales silvestres</span>{' '}
              <span className="subheadline">de ARGENTINA</span>
            </div>
          </div>
          <div className="site-header-band site-header-band-light">
            <div className="site-title-row">
              <div className="site-title">
                www.fotosaves.com.ar - <a href="mailto:aearnshaw@sinectis.com.ar">by Alec Earnshaw</a>
              </div>
              <div className="copyright">
                © {new Date().getFullYear()} Alec Earnshaw
              </div>
            </div>
          </div>
          <div className="site-header-band site-header-band-dark">
            <div className="headline">
              photos <span style={{ color: '#FF9966' }}>of wild animals</span>{' '}
              <span className="subheadline">of ARGENTINA</span>
            </div>
          </div>
        </div>
      </div>

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
                  <div className="bc-top">Order / Orden</div>
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
                  <div className="bc-top">Suborder / Suborden</div>
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
                  <div className="bc-top">Family / Familia</div>
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
                  <div className="bc-top">Subfamily / Subfamilia</div>
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
          <a href="mailto:aearnshaw@sinectis.com.ar">aearnshaw@sinectis.com.ar</a>
        </p>
      </div>

      <BackToTop />
      <LightboxScripts />
    </>
  );
}
