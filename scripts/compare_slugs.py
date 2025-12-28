"""
Compare Old URLs with New Species Data
Matches old site slugs with species.json entries and identifies mismatches.
"""

import json
import csv
import re
from pathlib import Path

# Configuration
OLD_URLS_CSV = r"L:\Mis Webs\fotosaves-nt\scripts\old_species_urls.csv"
SPECIES_JSON = r"L:\Mis Webs\fotosaves-nt\src\data\taxonomy\species.json"
OUTPUT_REPORT = r"L:\Mis Webs\fotosaves-nt\scripts\slug_comparison_report.csv"

def normalize_for_comparison(text):
    """
    Normalize a string for fuzzy matching:
    - Remove accents (a, e, i, o, u, n)
    - Lowercase
    - Remove spaces and special characters
    """
    if not text:
        return ""
    
    # Common accent replacements
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U'
    }
    
    result = text
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    # Remove spaces, hyphens, underscores and lowercase
    result = re.sub(r'[\s\-_]', '', result).lower()
    
    return result

def spanish_name_to_slug(spanish_name):
    """
    Convert Spanish species name to expected slug format.
    "Águila Mora" -> "AguilaMora"
    """
    if not spanish_name:
        return ""
    
    # Remove accents
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U'
    }
    
    result = spanish_name
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    # Remove spaces (keep capitalization for CamelCase)
    result = result.replace(' ', '').replace('-', '').replace("'", "")
    
    return result

def load_old_urls():
    """Load old URLs from CSV."""
    urls = []
    with open(OLD_URLS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['normalized_slug'] = normalize_for_comparison(row['slug'])
            urls.append(row)
    return urls

def load_species_json():
    """Load species from JSON."""
    with open(SPECIES_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    species_list = data.get('data', [])
    
    # Add normalized versions for matching
    for sp in species_list:
        sp['normalized_slug'] = normalize_for_comparison(sp.get('Slug', ''))
        sp['normalized_spanish'] = normalize_for_comparison(sp.get('Species_Name_Sp', ''))
        sp['derived_slug'] = spanish_name_to_slug(sp.get('Species_Name_Sp', ''))
        sp['normalized_derived'] = normalize_for_comparison(sp['derived_slug'])
    
    return species_list

def find_best_match(old_url, species_list):
    """
    Try to find the best matching species for an old URL.
    Returns (species_record, match_type) or (None, None)
    """
    old_slug = old_url['slug']
    old_normalized = old_url['normalized_slug']
    
    # 1. Exact slug match
    for sp in species_list:
        if sp.get('Slug') == old_slug:
            return sp, "EXACT_SLUG"
    
    # 2. Normalized slug match (ignore accents/case)
    for sp in species_list:
        if sp['normalized_slug'] == old_normalized:
            return sp, "NORMALIZED_SLUG"
    
    # 3. Match derived slug from Spanish name
    for sp in species_list:
        if sp['normalized_derived'] == old_normalized:
            return sp, "DERIVED_FROM_SPANISH"
    
    # 4. Partial match (old slug contained in Spanish name or vice versa)
    for sp in species_list:
        if old_normalized in sp['normalized_spanish'] or sp['normalized_spanish'] in old_normalized:
            if len(old_normalized) > 4 and len(sp['normalized_spanish']) > 4:  # Avoid false positives
                return sp, "PARTIAL_MATCH"
    
    return None, None

def main():
    print("Loading data...")
    old_urls = load_old_urls()
    species_list = load_species_json()
    
    print(f"  Old URLs: {len(old_urls)}")
    print(f"  Species in JSON: {len(species_list)}")
    
    # Build results
    results = []
    matched = 0
    unmatched = 0
    needs_update = 0
    
    for old_url in old_urls:
        match, match_type = find_best_match(old_url, species_list)
        
        if match:
            matched += 1
            current_slug = match.get('Slug', '')
            needs_slug_update = (current_slug != old_url['slug'])
            
            if needs_slug_update:
                needs_update += 1
                status = "NEEDS_UPDATE"
            else:
                status = "OK"
            
            results.append({
                'status': status,
                'match_type': match_type,
                'old_url': old_url['old_url'],
                'old_slug': old_url['slug'],
                'species_id': match.get('Species_ID', ''),
                'spanish_name': match.get('Species_Name_Sp', ''),
                'current_slug': current_slug,
                'suggested_slug': old_url['slug'] if needs_slug_update else '',
                'order': old_url['order'],
                'family': old_url['family']
            })
        else:
            unmatched += 1
            results.append({
                'status': 'NO_MATCH',
                'match_type': '',
                'old_url': old_url['old_url'],
                'old_slug': old_url['slug'],
                'species_id': '',
                'spanish_name': '',
                'current_slug': '',
                'suggested_slug': old_url['slug'],
                'order': old_url['order'],
                'family': old_url['family']
            })
    
    # Sort: NO_MATCH first, then NEEDS_UPDATE, then OK
    status_order = {'NO_MATCH': 0, 'NEEDS_UPDATE': 1, 'OK': 2}
    results.sort(key=lambda x: (status_order.get(x['status'], 3), x['order'], x['old_slug']))
    
    # Write report
    with open(OUTPUT_REPORT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'status', 'match_type', 'old_url', 'old_slug', 
            'species_id', 'spanish_name', 'current_slug', 'suggested_slug',
            'order', 'family'
        ])
        writer.writeheader()
        writer.writerows(results)
    
    # Print summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"  Total old URLs analyzed: {len(old_urls)}")
    print(f"  Matched to species.json: {matched}")
    print(f"  No match found:          {unmatched}")
    print(f"  Slug needs update:       {needs_update}")
    print(f"  Already correct:         {matched - needs_update}")
    print(f"\nReport saved to: {OUTPUT_REPORT}")
    
    # Show samples of each category
    no_match = [r for r in results if r['status'] == 'NO_MATCH']
    needs_upd = [r for r in results if r['status'] == 'NEEDS_UPDATE']
    
    if no_match:
        print(f"\n--- NO MATCH (first 10) ---")
        for r in no_match[:10]:
            print(f"  {r['old_slug']} ({r['order']})")
    
    if needs_upd:
        print(f"\n--- NEEDS UPDATE (first 10) ---")
        for r in needs_upd[:10]:
            print(f"  {r['spanish_name']}: '{r['current_slug']}' -> '{r['suggested_slug']}'")

if __name__ == "__main__":
    main()


