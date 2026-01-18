const fs = require('fs');
const path = require('path');

// Base URL for the sitemap
const BASE_URL = 'https://www.fotosaves.com.ar';

// Read JSON files
function readJsonFile(filename) {
    const filePath = path.join(__dirname, 'public', 'data', 'taxonomy', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

// Get all HTML files in a directory (recursive)
function getHtmlFiles(dir) {
    const results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...getHtmlFiles(fullPath));
        } else if (item.endsWith('.html')) {
            // Convert absolute path to relative URL path
            const relativePath = path.relative(path.join(__dirname, 'public'), fullPath);
            results.push(relativePath.replace(/\\/g, '/'));
        }
    }

    return results;
}

// Generate sitemap XML
function generateSitemap() {
    const indexUrls = [
        `${BASE_URL}/`,
        `${BASE_URL}/index.html`,
        `${BASE_URL}/index_Sp.html`,
        `${BASE_URL}/index_english.html`,
        `${BASE_URL}/Navigation_Sp.html`,
        `${BASE_URL}/Navigation_En.html`,
        `${BASE_URL}/About_Sp.html`,
        `${BASE_URL}/About_En.html`
    ];

    const avesBirdsUrls = [
        `${BASE_URL}/aves`,
        `${BASE_URL}/birds`
    ];

    const groupUrls = [];
    const speciesUrls = [];
    const fotosUrls = [];
    const videoUrls = [];
    const paintingUrls = [];
    const relatosUrls = [];

    // Read taxonomy data
    const orders = readJsonFile('orders.json');
    const families = readJsonFile('families.json');
    const suborders = readJsonFile('suborders.json');
    const subfamilies = readJsonFile('subfamilies.json');
    const species = readJsonFile('species.json');

    // Create lookup maps
    const familiesById = new Map();
    families.data.forEach(family => {
        familiesById.set(family.Family_ID, family);
    });

    const subfamiliesByFamilyId = new Map();
    subfamilies.data.forEach(subfamily => {
        if (!subfamiliesByFamilyId.has(subfamily.Family_ID)) {
            subfamiliesByFamilyId.set(subfamily.Family_ID, []);
        }
        subfamiliesByFamilyId.get(subfamily.Family_ID).push(subfamily);
    });

    // Process orders for group pages
    orders.data.forEach(order => {
        if (order.Order_Name_Sci === 'Passeriformes') {
            // Special case: Passeriformes is entirely broken down by families
            // Show ALL families contained, EXCEPT Furnariidae and Fringillidae which only have subfamily pages
            families.data
                .filter(family => family.Parent_Order_ID === order.Order_ID)
                .forEach(family => {
                    if (family.Image_Cnt > 0) {
                        if (family.Family_Name_Sci === 'Furnariidae' || family.Family_Name_Sci === 'Fringillidae') {
                            // These families only have subfamily pages - add subfamilies instead
                            const familySubfamilies = subfamiliesByFamilyId.get(family.Family_ID) || [];
                            familySubfamilies.forEach(subfamily => {
                                groupUrls.push(`${BASE_URL}/grupo/${subfamily.Subfamily_Sci}`);
                            });
                        } else {
                            // Add family page
                            if (family.Family_Path) {
                                groupUrls.push(`${BASE_URL}/grupo/${family.Family_Name_Sci}`);
                            }
                        }
                    }
                });
        } else if (order.Subdivide === null) {
            // Order has its own page (not subdivided)
            if (order.Image_Cnt > 0) {
                groupUrls.push(`${BASE_URL}/grupo/${order.Order_Name_Sci}`);
            }
        } else if (order.Subdivide === 'SO') {
            // Order is subdivided by suborders - add all suborder pages
            suborders.data
                .filter(so => so.Parent_ID === order.Order_ID)
                .forEach(so => {
                    groupUrls.push(`${BASE_URL}/grupo/${so.SO_Name_Sci}`);
                });
        } else if (order.Subdivide === 'FA') {
            // Order is subdivided by families - add family pages where Image_Cnt > 0
            families.data
                .filter(family => family.Parent_Order_ID === order.Order_ID)
                .forEach(family => {
                    if (family.Image_Cnt > 0) {
                        if (family.SubFamilies === 'Y') {
                            // Family is further subdivided by subfamilies - add subfamily pages instead
                            const familySubfamilies = subfamiliesByFamilyId.get(family.Family_ID) || [];
                            familySubfamilies.forEach(subfamily => {
                                groupUrls.push(`${BASE_URL}/grupo/${subfamily.Subfamily_Sci}`);
                            });
                        } else {
                            // Add family page
                            if (family.Family_Path) {
                                groupUrls.push(`${BASE_URL}/grupo/${family.Family_Name_Sci}`);
                            }
                        }
                    }
                });
        }
    });

    // Add species pages where Has_Sp_Link = "Y"
    species.data.forEach(spec => {
        if (spec.Has_Sp_Link === 'Y') {
            speciesUrls.push(`${BASE_URL}/especie/${spec.Slug}`);
        }
    });

    // 3. Other animal groups (Fotos* folders)
    const fotosDirs = [
        'FotosMamiferos',
        'FotosReptiles',
        'FotosMariposas',
        'FotosInsectos',
        'FotosAranias',
        'FotosLibelulas',
        'FotosOtrosInvertebrados'
    ];

    fotosDirs.forEach(dir => {
        const htmlFiles = getHtmlFiles(path.join(__dirname, 'public', dir));
        htmlFiles.forEach(file => {
            fotosUrls.push(`${BASE_URL}/${file}`);
        });
    });

    // 4. Videos
    const videoFiles = getHtmlFiles(path.join(__dirname, 'public', 'Videos'));
    videoFiles.forEach(file => {
        videoUrls.push(`${BASE_URL}/${file}`);
    });

    // 5. Paintings
    const paintingFiles = getHtmlFiles(path.join(__dirname, 'public', 'MyPaintings'));
    paintingFiles.forEach(file => {
        paintingUrls.push(`${BASE_URL}/${file}`);
    });

    // 6. Trip Reports
    const relatosFiles = getHtmlFiles(path.join(__dirname, 'public', 'Relatos'));
    relatosFiles.forEach(file => {
        relatosUrls.push(`${BASE_URL}/${file}`);
    });

    // URLs are already separated into appropriate arrays

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. Index files
    xml += '  <!-- Index files -->\n';
    indexUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 2. Birds section
    xml += '  <!-- Birds section -->\n';
    avesBirdsUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 2.a. Group pages
    xml += '  <!-- Birds group pages (orders, families, suborders, subfamilies) -->\n';
    groupUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 2.b. Species pages
    xml += '  <!-- Birds species pages -->\n';
    speciesUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 3. Other animal groups
    xml += '  <!-- Other animal groups -->\n';
    fotosUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 4. Videos
    xml += '  <!-- Videos -->\n';
    videoUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 5. Paintings
    xml += '  <!-- Paintings -->\n';
    paintingUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    // 6. Trip Reports
    xml += '  <!-- Trip Reports -->\n';
    relatosUrls.forEach(url => {
        xml += `  <url><loc>${url}</loc></url>\n`;
    });

    xml += '</urlset>';

    return xml;
}

// Generate statistics
function generateStatistics() {
    const stats = {
        animalGroupsStaticFiles: 0,
        relatosStaticFiles: 0,
        groupPages: 0,
        speciesPages: 0
    };

    // Count HTML files in Fotos* directories
    const fotosDirs = [
        'FotosMamiferos',
        'FotosReptiles',
        'FotosMariposas',
        'FotosInsectos',
        'FotosAranias',
        'FotosLibelulas',
        'FotosOtrosInvertebrados'
    ];

    fotosDirs.forEach(dir => {
        const htmlFiles = getHtmlFiles(path.join(__dirname, 'public', dir));
        stats.animalGroupsStaticFiles += htmlFiles.length;
    });

    // Count HTML files in Relatos
    const relatosFiles = getHtmlFiles(path.join(__dirname, 'public', 'Relatos'));
    stats.relatosStaticFiles = relatosFiles.length;

    // Count group pages (from taxonomy processing)
    const orders = readJsonFile('orders.json');
    const families = readJsonFile('families.json');
    const suborders = readJsonFile('suborders.json');
    const subfamilies = readJsonFile('subfamilies.json');

    // Same logic as in sitemap generation for counting group pages
    orders.data.forEach(order => {
        if (order.Order_Name_Sci === 'Passeriformes') {
            // Special case: Passeriformes is entirely broken down by families
            families.data
                .filter(family => family.Parent_Order_ID === order.Order_ID)
                .forEach(family => {
                    if (family.Image_Cnt > 0) {
                        if (family.Family_Name_Sci === 'Furnariidae' || family.Family_Name_Sci === 'Fringillidae') {
                            // These families only have subfamily pages - count subfamilies instead
                            const familySubfamilies = subfamilies.data.filter(sf => sf.Family_ID === family.Family_ID);
                            stats.groupPages += familySubfamilies.length;
                        } else {
                            // Count family page
                            if (family.Family_Path) {
                                stats.groupPages++;
                            }
                        }
                    }
                });
        } else if (order.Subdivide === null) {
            if (order.Image_Cnt > 0) {
                stats.groupPages++;
            }
        } else if (order.Subdivide === 'SO') {
            suborders.data
                .filter(so => so.Parent_ID === order.Order_ID)
                .forEach(() => stats.groupPages++);
        } else if (order.Subdivide === 'FA') {
            families.data
                .filter(family => family.Parent_Order_ID === order.Order_ID)
                .forEach(family => {
                    if (family.Image_Cnt > 0) {
                        if (family.SubFamilies === 'Y') {
                            // Count subfamilies instead
                            const familySubfamilies = subfamilies.data.filter(sf => sf.Family_ID === family.Family_ID);
                            stats.groupPages += familySubfamilies.length;
                        } else {
                            stats.groupPages++;
                        }
                    }
                });
        }
    });

    // Count species pages
    const species = readJsonFile('species.json');
    species.data.forEach(spec => {
        if (spec.Has_Sp_Link === 'Y') {
            stats.speciesPages++;
        }
    });

    return stats;
}

// Main execution
console.log('Generating sitemap.xml...');
const sitemap = generateSitemap();
fs.writeFileSync('public/sitemap.xml', sitemap);
console.log('sitemap.xml generated successfully!');

// Generate statistics
console.log('Generating statistics...');
const stats = generateStatistics();
const currentDate = new Date().toISOString().split('T')[0];

// Check if statistics file exists, if not create it
const statsFile = 'Sitemap Statistics.xlsx';
let statsContent = '';

if (fs.existsSync(statsFile)) {
    // For now, we'll just log the statistics since we can't easily modify Excel files
    console.log('Statistics (to be added to Sitemap Statistics.xlsx):');
} else {
    console.log('Creating statistics file...');
    statsContent = `Date,Animal Groups Static Files,Relatos Static Files,Group Pages,Species Pages\n`;
}

statsContent += `${currentDate},${stats.animalGroupsStaticFiles},${stats.relatosStaticFiles},${stats.groupPages},${stats.speciesPages}\n\n`;

console.log(`Date: ${currentDate}`);
console.log(`Global count number of all the STATIC files in the animal groups: ${stats.animalGroupsStaticFiles}`);
console.log(`Global count number of all the STATIC files in Relatos: ${stats.relatosStaticFiles}`);
console.log(`Count of GROUP-level pages (Orders, Families, etc.): ${stats.groupPages}`);
console.log(`Count of all the SPECIES-level pages: ${stats.speciesPages}`);

// Write statistics to a CSV file for now (since we can't modify Excel directly)
fs.writeFileSync('sitemap_statistics.csv', statsContent);
console.log('Statistics saved to sitemap_statistics.csv');