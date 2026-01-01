import React from 'react';
import type { Metadata } from 'next';
import LightboxScripts from '@/components/LightboxScripts';
import BackToTop from '@/components/BackToTop';
import SharedHeader from '@/components/SharedHeader';

export const metadata: Metadata = {
  title: 'Fotos de Aves - SSR VERSION DEPLOYED',
  description: 'Taxonomía completa de aves de Argentina con fotos - SERVER SIDE RENDERED',
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

function renderOrderElement(order: Order, families: Family[], species: Species[]) {
  const imageFolderPath = order.Order_Path || null;
  const groupType = 'order';
  const groupId = order.Order_Name_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const speciesData = displaySpeciesForOrder(order.Order_ID, families, species);

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
              Orden <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_Sp})</span>
            </a>
          ) : (
            <>Orden <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_Sp})</span></>
          )}
        </div>
        {order.Species_Cnt > 0 && (
          <>
            <div className="species-count">
              ESPECIES: {order.Species_Cnt} de las {order.Known_Species_Cnt} presentes en Argentina
            </div>
            <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
              {order.Image_Cnt} fotos: {speciesData}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function displaySpeciesForOrder(orderId: string, families: Family[], species: Species[]): React.ReactElement | null {
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

      familyElements.push(<span key={`colon-${family.Family_ID}`}>:</span>);

      const speciesElements = speciesList.map((species, speciesIndex) => (
        <React.Fragment key={`species-${species.Species_ID}`}>
          <span className="family-list">{species.Species_Name_Sp} ({species.Image_Cnt})</span>
          {speciesIndex < speciesList.length - 1 && <span>, </span>}
        </React.Fragment>
      ));

      familyElements.push(...speciesElements);
    }
  });

  return <>{familyElements}</>;
}

function renderOrderWithSuborders(order: Order, suborders: Suborder[], families: Family[], subfamilies: Subfamily[], species: Species[]) {
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
          Orden <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_Sp})</span>
        </div>
        <div className="species-count">
          ESPECIES: {order.Species_Cnt} de las {order.Known_Species_Cnt} presentes en Argentina
        </div>
        <div className="subgroup">
          {suborders
            .filter(so => so.Parent_ID === order.Order_ID)
            .map(suborder => renderSuborderElement(order, suborder, families, species))
          }
        </div>
      </div>
    </div>
  );

  return orderRow;
}

function renderSuborderElement(order: Order, suborder: Suborder, families: Family[], species: Species[]) {
  const imageFolderPath = suborder.SO_Path || null;
  const groupType = 'suborder';
  const groupId = suborder.SO_Name_Sci;
  const url = createGroupUrl(imageFolderPath, groupType, groupId);

  const breakdownText = generateSuborderPhotoBreakdown(suborder, families, species);

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
              Suborden <span className="order-scientific">{suborder.SO_Name_Sci}</span> <span className="order-spanish">({suborder.SO_Name_Sp})</span>
            </a>
          ) : (
            <>Suborden <span className="order-scientific">{suborder.SO_Name_Sci}</span> <span className="order-spanish">({suborder.SO_Name_Sp})</span></>
          )}
        </div>
        <div className="species-count">
          ESPECIES: {suborder.Species_Cnt} de las {suborder.Known_Species_Cnt} presentes en Argentina
        </div>
        {breakdownText && (
          <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
            {suborder.Image_Cnt} fotos: {breakdownText}
          </div>
        )}
      </div>
    </div>
  );
}

function generateSuborderPhotoBreakdown(suborder: Suborder, families: Family[], species: Species[]): React.ReactElement | null {
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

      familyElements.push(<span key={`colon-${family.Family_ID}`}>:</span>);

      const speciesElements = speciesList.map((species, speciesIndex) => (
        <React.Fragment key={`species-${species.Species_ID}`}>
          <span className="family-list">{species.Species_Name_Sp} ({species.Image_Cnt})</span>
          {speciesIndex < speciesList.length - 1 && <span>, </span>}
        </React.Fragment>
      ));

      familyElements.push(...speciesElements);
    }
  });

  return <>{familyElements}</>;
}

function renderOrderWithFamilies(order: Order, families: Family[], subfamilies: Subfamily[], species: Species[]) {
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
          Orden <span className="order-scientific">{order.Order_Name_Sci}</span> <span className="order-spanish">({order.Order_Name_Sp})</span>
        </div>
        <div className="subgroup">
          {orderFamilies.map(family => renderFamilyElement(family, families, subfamilies, species, 'O'))}
        </div>
      </div>
    </div>
  );
}

function renderFamilyElement(family: Family, families: Family[], subfamilies: Subfamily[], species: Species[], Family_Type: string) {
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
            <>Familia <span className="order-scientific">{family.Family_Name_Sci}</span> <span className="order-spanish">({family.Family_Name_Sp})</span></>
          ) : (
            <a href={url} style={{textDecoration: 'none', color: 'inherit'}}>
              Familia <span className="order-scientific">{family.Family_Name_Sci}</span> <span className="order-spanish">({family.Family_Name_Sp})</span>
            </a>
          )}
        </div>
        <div className="species-count">
          ESPECIES: {family.Species_Cnt} de las {family.Known_Species_Cnt} presentes en Argentina
        </div>

        {family.SubFamilies !== 'Y' && familySpeciesList.length > 0 && (
          <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
            {family.Image_Cnt} fotos: {familySpeciesList.map(species =>
              `<span class="family-list">${species.Species_Name_Sp} (${species.Image_Cnt})</span>`
            ).join(', ')}
          </div>
        )}

        {family.SubFamilies === 'Y' && (
          <div className="subgroup">
            {subfamilies
              .filter(sf => sf.Family_ID === family.Family_ID)
              .map(subfamily => renderSubfamilyElement(subfamily, family, species))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function renderSubfamilyElement(subfamily: Subfamily, parentFamily: Family, species: Species[]) {
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
              Subfam. <span className="order-scientific">{subfamily.Subfamily_Sci}</span> <span className="order-spanish">({subfamily.Subfamily_Sp})</span>
            </a>
          ) : (
            <>Subfam. <span className="order-scientific">{subfamily.Subfamily_Sci}</span> <span className="order-spanish">({subfamily.Subfamily_Sp})</span></>
          )}
        </div>
        <div className="species-count">
          ESPECIES: {subfamily.Species_Cnt} de las {subfamily.Known_Species_Cnt} presentes en Argentina
        </div>
        <div className="family-list" style={{marginTop: '2px', lineHeight: '1.2'}}>
          {subfamily.Image_Cnt} fotos: {subfamilySpeciesList.map(species =>
            `<span class="family-list">${species.Species_Name_Sp} (${species.Image_Cnt})</span>`
          ).join(', ')}
        </div>
      </div>
    </div>
  );
}

function renderPasseriformesSection(families: Family[], subfamilies: Subfamily[], species: Species[]) {
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
              Orden <span className="order-scientific">Passeriformes</span> <span className="order-spanish">(Pájaros)</span>
            </div>
            <div className="placeholder" style={{textAlign: 'left', marginTop: '10px'}}>
              De aquí en adelante se muestran las aves del orden de los Passeriformes. Este grupo generalmente representa aproximadamente el 50% de las especies de aves en la mayoría de las regiones del mundo. Esto es particularmente cierto en Argentina.<br />
              Por lo tanto, este gran orden se divide por familias, y en algunos casos -cuando tiene sentido- también por subfamilias.
            </div>
          </div>
        </div>
      </div>

      {/* Passeriformes families */}
      {passeriformesFamilies.map(family => renderFamilyElement(family, families, subfamilies, species, 'P'))}
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
        return renderOrderWithSuborders(order, suborders, families, subfamilies, species);
      } else if (order.Subdivide === 'FA') {
        return renderOrderWithFamilies(order, families, subfamilies, species);
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

  const passeriformesSection = renderPasseriformesSection(families, subfamilies, species);

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
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <SharedHeader showQuickLinks={true} />
      <div style={{textAlign:'center', margin: '6px 0 8px 0'}}>
        <a className="quick-link" href="/Birds.html" title="Go to English version">Go to English version</a>
      </div>
      <div className="container">
        <div id="orders-container">
          {orderElements}
          {passeriformesSection}
        </div>
      </div>
      <LightboxScripts />
      <BackToTop />
    </>
  );
}