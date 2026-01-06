import React from 'react';
import type { Metadata } from 'next';
import LightboxScripts from '@/components/LightboxScripts';
import BackToTop from '@/components/BackToTop';
import SharedHeader from '@/components/SharedHeader';
import ContactLink from '@/components/ContactLink';

export const metadata: Metadata = {
  title: 'Bird Photos of Argentina - Argentine Bird Photography',
  description: 'Complete taxonomy of Argentine birds with original field photography. Over 800 species of birds in Argentina with high-quality images taken in the wild.',
  keywords: [
    'Aves', 'Birds', 'Argentina', 'Birds of Argentina', 'Aves de Argentina', 'Birdwatching', 'Bird watching',
    'fotografías de aves', 'fotos de aves', 'fotografías de aves de Argentina', 'fotos de aves de Argentina',
    'Bird photos of Argentina', 'Bird photography of Argentina', 'photos of Argentinian birds', 'photos of Argentine birds',
    'Argentina wildlife', 'Argentine birds', 'Wildlife photography', 'Ornithology'
  ],
  openGraph: {
    title: 'Bird Photos of Argentina',
    description: 'Discover over 800 species of Argentine birds with original field photography taken in the wild.',
    url: 'https://fotosaves.com.ar/birds',
    siteName: 'FotosAves.com.ar',
    images: [
      {
        url: '/images/thumbnails/SBRH3.jpg',
        width: 1200,
        height: 630,
        alt: 'Bird photography of Argentina',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bird Photos of Argentina',
    description: 'Discover over 800 species of Argentine birds with original field photography.',
    images: ['/images/thumbnails/SBRH3.jpg'],
  },
};

// Force dynamic rendering to avoid prerendering large data
export const dynamic = 'force-dynamic';

function getOrigin(): string {
  // Use the same origin as the debug API - this is proven to work
  if (process.env.VERCEL) {
    return 'https://fotosaves-nt.vercel.app';
  }
  return 'http://localhost:3000';
}

async function fetchJsonData<T>(path: string): Promise<{ data: T[] } | null> {
  try {
    const origin = getOrigin();
    const url = `${origin}${path}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

interface Order {
  Order_ID: string;
  Order_Name_Sci: string;
  Order_Name_Sp: string;
  Order_Name_En: string;
  Order_Image: string;
  Order_Path: string;
  Species_Cnt: number;
  Known_Species_Cnt: number;
  Image_Cnt: number;
  Subdivide: string;
}

interface Suborder {
  SO_ID: string;
  SO_Name_Sci: string;
  SO_Name_Sp: string;
  SO_Name_En: string;
  SO_Image: string;
  SO_Path: string;
  Species_Cnt: number;
  Known_Species_Cnt: number;
  Image_Cnt: number;
  Parent_ID: string;
}

interface Family {
  Family_ID: string;
  Family_Name_Sci: string;
  Family_Name_Sp: string;
  Family_Name_En: string;
  Family_Image: string;
  Family_Path: string;
  Species_Cnt: number;
  Known_Species_Cnt: number;
  Image_Cnt: number;
  Parent_Order_ID: string;
  Suborder_ID?: string;
  SubFamilies: string;
}

interface Subfamily {
  SF_ID: string;
  Subfamily_Sci: string;
  Subfamily_Sp: string;
  Subfamily_En: string;
  Subfamily_Image: string;
  SF_Path: string;
  Species_Cnt: number;
  Known_Species_Cnt: number;
  Image_Cnt: number;
  Family_ID: string;
}

interface Species {
  Species_ID: string;
  Species_Name_Sci: string;
  Species_Name_Sp: string;
  Species_Name_En: string;
  Family_Sci: string;
  Subfamily_Sci?: string;
  Image_Cnt: number;
}

function createGroupUrl(imageFolderPath: string | null, groupType: string, groupId: string): string | null {
  if (!imageFolderPath) return null;

  const params = new URLSearchParams();
  params.set('path', imageFolderPath);
  params.set('groupType', groupType);
  params.set('groupId', groupId);
  return `/grupo?${params.toString()}`;
}

function renderOrderElement(order: Order, families: Family[], species: Species[], lang: 'es' | 'en' = 'es') {
  const imageFolderPath = order.Order_Path || null;
  const groupType = 'order';
  const groupId = order.Order_Name_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const speciesData = displaySpeciesForOrder(order.Order_ID, families, species, 'en');

  return (
    <div key={order.Order_ID} className="order-row">
      <div className="order-image">
        {url ? (
          <a href={url} style={{textDecoration: 'none'}}>
            <img
              src={`/images/thumbnails/${order.Order_Image || 'placeholder.jpg'}`}
              alt={order.Order_Name_Sci}
            />
          </a>
        ) : (
          <img
            src={`/images/thumbnails/${order.Order_Image || 'placeholder.jpg'}`}
            alt={order.Order_Name_Sci}
          />
        )}
      </div>
      <div className="order-content">
        <div className="order-title">
          {url ? (
            <a href={url} style={{textDecoration: 'none', color: 'inherit'}}>
              Order <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_En})</span>
            </a>
          ) : (
            <>Order <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_En})</span></>
          )}
        </div>
        {order.Species_Cnt > 0 && (
          <>
            <div className="species-count">
              SPECIES: {order.Species_Cnt} of the {order.Known_Species_Cnt} species present in Argentina
            </div>
            <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
              {order.Image_Cnt} photos: {speciesData}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function displaySpeciesForOrder(orderId: string, families: Family[], species: Species[], lang: 'es' | 'en' = 'es'): React.ReactElement | null {
  const orderFamilies = families.filter(family => family.Parent_Order_ID === orderId);

  if (orderFamilies.length === 0) return null;

  const familyElements: React.ReactElement[] = [];

  orderFamilies.forEach((family, index) => {
    const speciesList = species.filter(species =>
      species.Family_Sci === family.Family_Name_Sci && species.Image_Cnt > 0
    );

    if (speciesList.length > 0) {
      if (index > 0) {
        familyElements.push(<span key={`separator-${index}`}> - </span>);
      }

      familyElements.push(
        <span key={`family-${family.Family_ID}`} className="family-name">
          {family.Family_Name_Sci.toUpperCase()} ({speciesList.length})
        </span>
      );

      familyElements.push(<span key={`colon-${family.Family_ID}`}>: </span>);

      const speciesElements = speciesList.map((species, speciesIndex) => (
        <React.Fragment key={`species-${species.Species_ID}`}>
          <span className="family-list">{lang === 'en' ? species.Species_Name_En : species.Species_Name_Sp} ({species.Image_Cnt})</span>
          {speciesIndex < speciesList.length - 1 && <span>, </span>}
        </React.Fragment>
      ));

      familyElements.push(...speciesElements);
    }
  });

  return <>{familyElements}</>;
}

function renderOrderWithSuborders(order: Order, suborders: Suborder[], families: Family[], subfamilies: Subfamily[], species: Species[], lang: 'es' | 'en' = 'es') {
  const orderRow = (
    <div key={order.Order_ID} className="order-row">
      <div className="order-image">
        <img
          src={`/images/thumbnails/${order.Order_Image || 'placeholder.jpg'}`}
          alt={order.Order_Name_Sci}
        />
      </div>
      <div className="order-content">
        <div className="order-title">
          Order <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({lang === 'en' ? order.Order_Name_En : order.Order_Name_Sp})</span>
        </div>
        <div className="species-count">
          {lang === 'en' ? `SPECIES: ${order.Species_Cnt} of the ${order.Known_Species_Cnt} species present in Argentina` : `ESPECIES: ${order.Species_Cnt} de las ${order.Known_Species_Cnt} presentes en Argentina`}
        </div>
        <div className="subgroup">
          {suborders
            .filter(so => so.Parent_ID === order.Order_ID)
            .map(suborder => renderSuborderElement(order, suborder, families, species, lang))
          }
        </div>
      </div>
    </div>
  );

  return orderRow;
}

function renderSuborderElement(order: Order, suborder: Suborder, families: Family[], species: Species[], lang: 'es' | 'en' = 'es') {
  const imageFolderPath = suborder.SO_Path || null;
  const groupType = 'suborder';
  const groupId = suborder.SO_Name_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const breakdownText = generateSuborderPhotoBreakdown(suborder, families, species, 'en');

  return (
    <div key={suborder.SO_ID} className="subgroup-row">
      <div className="subgroup-image">
        {url ? (
          <a href={url} style={{textDecoration: 'none'}}>
            <img
              src={`/images/thumbnails/${suborder.SO_Image || 'placeholder.jpg'}`}
              alt={suborder.SO_Name_Sci}
            />
          </a>
        ) : (
          <img
            src={`/images/thumbnails/${suborder.SO_Image || 'placeholder.jpg'}`}
            alt={suborder.SO_Name_Sci}
          />
        )}
      </div>
      <div className="subgroup-content">
        <div className="order-title">
          {url ? (
            <a href={url} style={{textDecoration: 'none', color: 'inherit'}}>
              Suborder <span className="order-scientific">{suborder.SO_Name_Sci}</span> <span className="order-spanish">({suborder.SO_Name_En})</span>
            </a>
          ) : (
            <>Suborder <span className="order-scientific">{suborder.SO_Name_Sci}</span> <span className="order-spanish">({suborder.SO_Name_En})</span></>
          )}
        </div>
        <div className="species-count">
          SPECIES: {suborder.Species_Cnt} of the {suborder.Known_Species_Cnt} species present in Argentina
        </div>
        {breakdownText && (
          <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
            {suborder.Image_Cnt} photos: {breakdownText}
          </div>
        )}
      </div>
    </div>
  );
}

function generateSuborderPhotoBreakdown(suborder: Suborder, families: Family[], species: Species[], lang: 'es' | 'en' = 'es'): React.ReactElement | null {
  const suborderFamilyList = families.filter(family => family.Suborder_ID === suborder.SO_ID);

  if (suborderFamilyList.length === 0) return null;

  const familyElements: React.ReactElement[] = [];

  suborderFamilyList.forEach((family, index) => {
    const speciesList = species.filter(species =>
      species.Family_Sci === family.Family_Name_Sci && species.Image_Cnt > 0
    );

    if (speciesList.length > 0) {
      if (index > 0) {
        familyElements.push(<span key={`separator-${index}`}> - </span>);
      }

      familyElements.push(
        <span key={`family-${family.Family_ID}`} className="family-name">
          {family.Family_Name_Sci.toUpperCase()} ({speciesList.length})
        </span>
      );

      familyElements.push(<span key={`colon-${family.Family_ID}`}>: </span>);

      const speciesElements = speciesList.map((species, speciesIndex) => (
        <React.Fragment key={`species-${species.Species_ID}`}>
          <span className="family-list">{lang === 'en' ? species.Species_Name_En : species.Species_Name_Sp} ({species.Image_Cnt})</span>
          {speciesIndex < speciesList.length - 1 && <span>, </span>}
        </React.Fragment>
      ));

      familyElements.push(...speciesElements);
    }
  });

  return <>{familyElements}</>;
}

function renderOrderWithFamilies(order: Order, families: Family[], subfamilies: Subfamily[], species: Species[], lang: 'es' | 'en' = 'es') {
  const orderFamilies = families.filter(family => family.Parent_Order_ID === order.Order_ID);

  return (
    <div key={order.Order_ID} className="order-row">
      <div className="order-image">
        <img
          src={`/images/thumbnails/${order.Order_Image || 'placeholder.jpg'}`}
          alt={order.Order_Name_Sci}
        />
      </div>
      <div className="order-content">
        <div className="order-title">
          {lang === 'en' ? 'Order' : 'Orden'} <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({lang === 'en' ? order.Order_Name_En : order.Order_Name_Sp})</span>
        </div>
        <div className="subgroup">
          {orderFamilies.map(family => renderFamilyElement(family, families, subfamilies, species, 'O', lang))}
        </div>
      </div>
    </div>
  );
}

function renderFamilyElement(family: Family, families: Family[], subfamilies: Subfamily[], species: Species[], Family_Type: string, lang: 'es' | 'en' = 'es') {
  const imageFolderPath = family.Family_Path || null;
  const groupType = 'family';
  const groupId = family.Family_Name_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const isPasseriformesFamily = family.Parent_Order_ID === 'OR_029';
  const hasSubfamilies = family.SubFamilies === 'Y';

  const familySpeciesList = species.filter(species =>
    species.Family_Sci === family.Family_Name_Sci && species.Image_Cnt > 0
  );

  return (
    <div key={family.Family_ID} className="subgroup-row">
      <div className={isPasseriformesFamily ? 'order-image' : 'subgroup-image'}>
        {hasSubfamilies || !url ? (
          <img
            src={`/images/thumbnails/${family.Family_Image || 'placeholder.jpg'}`}
            alt={family.Family_Name_Sci}
          />
        ) : (
          <a href={url} style={{textDecoration: 'none'}}>
            <img
              src={`/images/thumbnails/${family.Family_Image || 'placeholder.jpg'}`}
              alt={family.Family_Name_Sci}
            />
          </a>
        )}
      </div>
      <div className={isPasseriformesFamily ? 'order-content' : 'subgroup-content'}>
        <div className="order-title">
          {hasSubfamilies || !url ? (
            <>{lang === 'en' ? 'Family' : 'Familia'} <span className="order-scientific">{family.Family_Name_Sci}</span> <span className="order-spanish">({lang === 'en' ? family.Family_Name_En : family.Family_Name_Sp})</span></>
          ) : (
            <a href={url} style={{textDecoration: 'none', color: 'inherit'}}>
              {lang === 'en' ? 'Family' : 'Familia'} <span className="order-scientific">{family.Family_Name_Sci}</span> <span className="order-spanish">({lang === 'en' ? family.Family_Name_En : family.Family_Name_Sp})</span>
            </a>
          )}
        </div>
        <div className="species-count">
          {lang === 'en'
            ? `SPECIES: ${family.Species_Cnt} of the ${family.Known_Species_Cnt} species present in Argentina`
            : `ESPECIES: ${family.Species_Cnt} de las ${family.Known_Species_Cnt} presentes en Argentina`
          }
        </div>

        {family.SubFamilies !== 'Y' && familySpeciesList.length > 0 && (
          <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
            {family.Image_Cnt} {lang === 'en' ? 'photos' : 'fotos'}: {familySpeciesList.map((species, index) => (
              <React.Fragment key={`species-${species.Species_ID}`}>
                <span className="family-list">{lang === 'en' ? species.Species_Name_En : species.Species_Name_Sp} ({species.Image_Cnt})</span>
                {index < familySpeciesList.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {family.SubFamilies === 'Y' && (
          <div className="subgroup">
            {subfamilies
              .filter(sf => sf.Family_ID === family.Family_ID)
              .map(subfamily => renderSubfamilyElement(subfamily, family, species, lang))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function renderSubfamilyElement(subfamily: Subfamily, parentFamily: Family, species: Species[], lang: 'es' | 'en' = 'es') {
  const imageFolderPath = subfamily.SF_Path || null;
  const groupType = 'subfamily';
  const groupId = subfamily.Subfamily_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const subfamilySpeciesList = species.filter(species =>
    species.Subfamily_Sci === subfamily.Subfamily_Sci && species.Image_Cnt > 0
  );

  return (
    <div key={subfamily.SF_ID} className="subgroup-row">
      <div className="subgroup-image">
        {url ? (
          <a href={url} style={{textDecoration: 'none'}}>
            <img
              src={`/images/thumbnails/${subfamily.Subfamily_Image || 'placeholder.jpg'}`}
              alt={subfamily.Subfamily_Sci}
            />
          </a>
        ) : (
          <img
            src={`/images/thumbnails/${subfamily.Subfamily_Image || 'placeholder.jpg'}`}
            alt={subfamily.Subfamily_Sci}
          />
        )}
      </div>
      <div className="subgroup-content">
        <div className="order-title">
          {url ? (
            <a href={url} style={{textDecoration: 'none', color: 'inherit'}}>
              Subfam. <span className="order-scientific">{subfamily.Subfamily_Sci}</span> <span className="order-spanish">({lang === 'en' ? subfamily.Subfamily_En : subfamily.Subfamily_Sp})</span>
            </a>
          ) : (
            <>Subfam. <span className="order-scientific">{subfamily.Subfamily_Sci}</span> <span className="order-spanish">({lang === 'en' ? subfamily.Subfamily_En : subfamily.Subfamily_Sp})</span></>
          )}
        </div>
        <div className="species-count">
          {lang === 'en'
            ? `SPECIES: ${subfamily.Species_Cnt} of the ${subfamily.Known_Species_Cnt} species present in Argentina`
            : `ESPECIES: ${subfamily.Species_Cnt} de las ${subfamily.Known_Species_Cnt} presentes en Argentina`
          }
        </div>
        <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
          {subfamily.Image_Cnt} {lang === 'en' ? 'photos' : 'fotos'}: {subfamilySpeciesList.map((species, index) => (
            <React.Fragment key={`species-${species.Species_ID}`}>
              <span className="family-list">{lang === 'en' ? species.Species_Name_En : species.Species_Name_Sp} ({species.Image_Cnt})</span>
              {index < subfamilySpeciesList.length - 1 && <span>, </span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderPasseriformesSection(families: Family[], subfamilies: Subfamily[], species: Species[], lang: 'es' | 'en' = 'es') {
  const passeriformesFamilies = families.filter(family =>
    family.Parent_Order_ID === 'OR_029' && family.Image_Cnt > 0
  );

  if (passeriformesFamilies.length === 0) return null;

  return (
    <>
      {/* Text box between non-passerine orders and Passeriformes */}
      <div className="order-row" style={{marginTop: '20px', marginBottom: '20px'}}>
        <div className="order-image" style={{visibility: 'hidden'}}></div>
        <div className="order-content">
          <div style={{
            width: '84%',
            minHeight: '80px',
            padding: '10px',
            border: '2px solid #663300',
            borderRadius: '8px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '14px',
            backgroundColor: '#F5F5DC',
            textAlign: 'center'
          }}>
            <div className="order-title" style={{textAlign: 'center', marginBottom: '10px'}}>
              Order <span className="order-scientific">Passeriformes</span> <span className="order-spanish">(Birds)</span>
            </div>
            <div className="placeholder" style={{textAlign: 'left', marginTop: '10px'}}>
              From here on, the birds of the Passeriformes order are shown. This group generally represents approximately 50% of bird species in most regions of the world. This is particularly true in Argentina.<br />
              Therefore, this large order is divided by families, and in some cases -when it makes sense- also by subfamilies.
            </div>
          </div>
        </div>
      </div>

      {/* Passeriformes families */}
      {passeriformesFamilies.map(family => renderFamilyElement(family, families, subfamilies, species, 'P', lang))}
    </>
  );
}

export default async function AvesPage() {
  // Load all taxonomy data
  const [ordersData, subordersData, familiesData, subfamiliesData, speciesData] = await Promise.all([
    fetchJsonData<Order>('/data/taxonomy/orders.json'),
    fetchJsonData<Suborder>('/data/taxonomy/suborders.json'),
    fetchJsonData<Family>('/data/taxonomy/families.json'),
    fetchJsonData<Subfamily>('/data/taxonomy/subfamilies.json'),
    fetchJsonData<Species>('/data/taxonomy/species.json'),
  ]);

  const orders = ordersData?.data || [];
  const suborders = subordersData?.data || [];
  const families = familiesData?.data || [];
  const subfamilies = subfamiliesData?.data || [];
  const species = speciesData?.data || [];


  // Process orders (excluding Passeriformes)
  const nonPasseriformesOrders = orders.filter(order => order.Order_ID !== 'OR_029');

  const orderElements = nonPasseriformesOrders.map(order => {
    try {
      if (order.Subdivide === 'SO') {
        return renderOrderWithSuborders(order, suborders, families, subfamilies, species, 'en');
      } else if (order.Subdivide === 'FA') {
        return renderOrderWithFamilies(order, families, subfamilies, species, 'en');
      } else {
        return renderOrderElement(order, families, species);
      }
    } catch (error) {
      console.error(`Error rendering order ${order.Order_ID}:`, error);
      return (
        <div key={order.Order_ID} className="order-row">
          <div>Error rendering order: {order.Order_Name_Sci}</div>
        </div>
      );
    }
  });

  const passeriformesSection = renderPasseriformesSection(families, subfamilies, species, 'en');

  const pageStyles = `
    body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #999973;
        color: #663300;
        margin: 0;
        padding: 10px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        background-color: #DCDBB8;
        border-radius: 8px;
        padding: 12px;
    }

    .header {
        text-align: center;
        margin-bottom: 20px;
    }

    .header h1 {
        font-size: 150%;
        color: #666666;
        font-weight: bold;
        margin: 0 0 10px 0;
    }

    .header p {
        font-size: 90%;
        color: #008080;
        margin: 0;
    }

    .order-row {
        display: flex;
        margin-bottom: 8px;
        align-items: flex-start;
        min-height: 60px;
    }

    .order-image {
        flex: 0 0 180px;
        margin-right: 15px;
    }

    .order-image img {
        width: 180px;
        height: 125px;
        object-fit: cover;
        border: 1px solid #663300;
        border-radius: 8px;
    }

    .order-content {
        flex: 1;
        font-size: 90%;
        line-height: 1.3;
    }

    .order-title {
        font-weight: bold;
        margin-bottom: 2px;
        font-size: 160%;
    }

    .order-title a {
        color: #7A2900;
        text-decoration: none;
    }

    .order-title a:hover {
        text-decoration: underline;
    }

    .order-scientific {
        font-style: italic;
    }

    .order-spanish {
        color: #666666;
    }

    .species-count {
        color: #008080;
        font-weight: bold;
        margin: 0px 0;
        font-size: 118%;
    }

    .photo-count {
        color: #443322;
        font-weight: bold;
        margin: 2px 0;
    }

    .family-list {
        font-size: 110%;
        color: #443322;
        margin-top: 2px;
        line-height: 1.2;
    }

    .family-name {
        color: #D55A00;
        font-weight: bold;
        font-size: 100%;
    }

    .subgroup {
        margin-left: 0px;
        margin-top: 5px;
        padding-left: 10px;
        border-left: 2px solid #CC6600;
    }

    .subgroup-row {
        display: flex;
        margin-bottom: 5px;
        align-items: flex-start;
    }

    .subgroup-image {
        flex: 0 0 180px;
        margin-right: 10px;
    }

    .subgroup-image img {
        width: 180px;
        height: 125px;
        object-fit: cover;
        border: 1px solid #663300;
        border-radius: 8px;
    }

    .subgroup-content {
        flex: 1;
        font-size: 85%;
        line-height: 1.2;
    }

    .placeholder {
        color: #333333;
        font-style: italic;
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <SharedHeader
        showQuickLinks={true}
        language="en"
        quickLinksContent={
          <div className="links-right">
            <span className="label-en">Links:</span>
            <a className="quick-link" href="/index_english.html" title="Site home page (English)">Home page</a>
            <a className="quick-link" href="/Navigation_En.html" title="Navigation tips">Navigation tips</a>
            <a className="quick-link" href="/About_En.html" title="About FotosAves">About</a>
          </div>
        }
      />
      <div style={{textAlign:'center', margin: '6px 0 8px 0'}}>
        <a className="quick-link" href="/aves" title="Ir a versión en español">Ir a versión en español</a>
      </div>
      <div className="container">
        <div id="orders-container">
          {orderElements}
          {passeriformesSection}
        </div>
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

      <LightboxScripts />
      <BackToTop />
    </>
  );
}