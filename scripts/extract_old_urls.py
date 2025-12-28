"""
Extract Old Site URLs Script
Scans the old FotosAves site and extracts all species page URLs.
Outputs a CSV file for comparison with the new species.json slugs.
"""

import os
import csv
import re
from pathlib import Path

# Configuration
OLD_SITE_PATH = r"L:\Mis Webs\FotosAves"
OUTPUT_CSV = r"L:\Mis Webs\fotosaves-nt\scripts\old_species_urls.csv"

# Bird order folders (to filter out non-bird content)
BIRD_ORDERS = {
    "Accipitriformes", "Anseriformes", "Apodiformes", "Caprimulgiformes",
    "Cariamiformes", "Cathartiformes", "Charadriiformes", "Ciconiiformes",
    "Columbiformes", "Coraciiformes", "Cuculiformes", "Falconiformes",
    "Galbuliformes", "Galliformes", "Gruiformes", "Passeriformes",
    "Pelecaniformes", "Phoenicopteriformes", "Piciformes", "Podicipediformes",
    "Procellariiformes", "Psittaciformes", "Rheiformes", "Sphenisciformes",
    "Strigiformes", "Suliformes", "Tinamiformes", "Trochiliformes", "Trogoniformes"
}

# Group page patterns to EXCLUDE (these are group pages, not species pages)
GROUP_PAGE_PATTERNS = [
    r'^Fotos[A-Z][a-z]+formes\.html$',  # FotosAccipitriformes.html, etc.
    r'^Fotos[A-Z][a-z]+idae\.html$',     # FotosTyrannidae.html, etc.
    r'^Fotos[A-Z][a-z]+inae\.html$',     # Subfamily pages
    r'^FotosCharadriiformes[ABC]\.html$', # FotosCharadriiformesA.html, etc.
]

def is_group_page(filename):
    """Check if a filename is a group page (not a species page)."""
    for pattern in GROUP_PAGE_PATTERNS:
        if re.match(pattern, filename):
            return True
    return False

def extract_slug_from_filename(filename):
    """
    Extract species slug from various filename patterns.
    Returns (slug, pattern_type) or (None, None) if not a species page.
    """
    # Skip group pages
    if is_group_page(filename):
        return None, None
    
    # Pattern 1: Fotos_SpeciesName.html (most common)
    match = re.match(r'^Fotos_([A-Za-z0-9]+)\.html$', filename)
    if match:
        return match.group(1), "Fotos_"
    
    # Pattern 2: FotosPerdices_SpeciesName.html (Tinamiformes)
    match = re.match(r'^FotosPerdices_([A-Za-z0-9]+)\.html$', filename)
    if match:
        return match.group(1), "FotosPerdices_"
    
    # Pattern 3: FotosPinguinos_SpeciesName.html (Sphenisciformes)
    match = re.match(r'^FotosPinguinos_([A-Za-z0-9]+)\.html$', filename)
    if match:
        return "Pinguino" + match.group(1), "FotosPinguinos_"
    
    # Pattern 4: FotosPinguinoRey.html -> PinguinoRey (specific case)
    match = re.match(r'^FotosPinguino([A-Za-z0-9]+)\.html$', filename)
    if match:
        return "Pinguino" + match.group(1), "FotosPinguino"
    
    # Pattern 5: FotosSpeciesName.html (no underscore - Suliformes, etc.)
    # But exclude group pages like FotosSuliformes.html
    match = re.match(r'^Fotos([A-Z][a-z]+(?:[A-Z][a-z]+)*)\.html$', filename)
    if match:
        slug = match.group(1)
        # Make sure it's not a taxonomic group name
        if not slug.endswith('formes') and not slug.endswith('idae') and not slug.endswith('inae'):
            return slug, "Fotos"
    
    # Pattern 6: FotosPlayerasA_SpeciesName.html (Charadriiformes ad-hoc groups)
    match = re.match(r'^FotosPlayeras[ABC]_([A-Za-z0-9]+)\.html$', filename)
    if match:
        return match.group(1), "FotosPlayerasX_"
    
    # Pattern 7: FotosRheas_SpeciesName.html (Rheiformes)
    match = re.match(r'^FotosRheas_([A-Za-z0-9]+)\.html$', filename)
    if match:
        return match.group(1), "FotosRheas_"
    
    # Pattern 8: FotosGruiformes-SpeciesName.html (Gruiformes - with hyphen)
    match = re.match(r'^FotosGruiformes-([A-Za-z0-9]+)\.html$', filename)
    if match:
        return match.group(1), "FotosGruiformes-"
    
    return None, None

def extract_species_urls():
    """Extract all species HTML files from bird order folders."""
    results = []
    
    for root, dirs, files in os.walk(OLD_SITE_PATH):
        for filename in files:
            # Only process HTML files
            if not filename.endswith(".html"):
                continue
            
            full_path = Path(root) / filename
            rel_path = full_path.relative_to(OLD_SITE_PATH)
            parts = rel_path.parts
            
            # Check if this is under a bird order folder
            if len(parts) < 1:
                continue
            
            order_folder = parts[0]
            if order_folder not in BIRD_ORDERS:
                continue  # Skip non-bird content (FotosReptiles, etc.)
            
            # Try to extract slug from filename
            slug, pattern_type = extract_slug_from_filename(filename)
            
            if slug is None:
                continue  # Not a species page
            
            # Determine folder structure
            if len(parts) == 2:
                # Direct under order: Accipitriformes/Fotos_AguilaMora.html
                family_folder = ""
                subfamily_folder = ""
            elif len(parts) == 3:
                # Under family: Passeriformes/Tyrannidae/Fotos_Benteveo.html
                family_folder = parts[1]
                subfamily_folder = ""
            elif len(parts) >= 4:
                # Under subfamily
                family_folder = parts[1]
                subfamily_folder = parts[2] if len(parts) > 3 else ""
            else:
                family_folder = ""
                subfamily_folder = ""
            
            # Build the old URL path (relative to site root)
            old_url = str(rel_path).replace("\\", "/")
            
            results.append({
                "old_url": old_url,
                "slug": slug,
                "order": order_folder,
                "family": family_folder,
                "subfamily": subfamily_folder,
                "filename": filename,
                "pattern": pattern_type
            })
    
    return results

def write_csv(results):
    """Write results to CSV file."""
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "old_url", "slug", "order", "family", "subfamily", "filename", "pattern"
        ])
        writer.writeheader()
        writer.writerows(results)
    
    print(f"Done! Wrote {len(results)} entries to {OUTPUT_CSV}")

def main():
    print(f"Scanning {OLD_SITE_PATH}...")
    results = extract_species_urls()
    
    # Sort by order, then family, then slug
    results.sort(key=lambda x: (x["order"], x["family"], x["slug"]))
    
    write_csv(results)
    
    # Print summary
    orders = set(r["order"] for r in results)
    print(f"\nSummary:")
    print(f"  Total species pages: {len(results)}")
    print(f"  Orders represented: {len(orders)}")
    
    # Show breakdown by order
    print(f"\nBreakdown by order:")
    for order in sorted(orders):
        count = len([r for r in results if r["order"] == order])
        print(f"  {order}: {count}")
    
    # Show breakdown by pattern type
    print(f"\nBreakdown by filename pattern:")
    patterns = set(r["pattern"] for r in results)
    for pattern in sorted(patterns):
        count = len([r for r in results if r["pattern"] == pattern])
        print(f"  {pattern}: {count}")

if __name__ == "__main__":
    main()
