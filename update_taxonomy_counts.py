import json
import os
import glob
from collections import defaultdict

def load_json_file(filepath, report_missing=False):
    """Load a JSON file, retrying with utf-8-sig if BOM is present.
    If report_missing is True, emit a message when the file does not exist.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # Retry with BOM-tolerant encoding
        try:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
                print(f"[WARNING] Detected UTF-8 BOM in {filepath}; handled automatically.")
                return data
        except json.JSONDecodeError as e2:
            print(f"[JSON ERROR] {filepath} - {e2}")
            return None
    except FileNotFoundError:
        # For WIP usage, normally ignore missing files, unless explicitly requested
        if report_missing:
            print(f"[FILE NOT FOUND] {filepath}")
        return None
    except PermissionError:
        print(f"[PERMISSION ERROR] {filepath}")
        return None
    except Exception as e:
        print(f"[UNEXPECTED ERROR] {filepath} - {e}")
        return None

def save_json_file(filepath, data):
    """Save data to a JSON file"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Error saving {filepath}: {e}")

    

def update_taxonomy_counts():
    """Update species and image counts across all taxonomic levels"""

    print("Loading taxonomy data...")

    # Load all taxonomy files
    species_data = load_json_file('Data/taxonomy/species.json', report_missing=True)
    families_data = load_json_file('Data/taxonomy/families.json')
    orders_data = load_json_file('Data/taxonomy/orders.json')
    subfamilies_data = load_json_file('Data/taxonomy/subfamilies.json')
    suborders_data = load_json_file('Data/taxonomy/suborders.json')

    if not species_data:
        print("Error: Could not load species taxonomy file")
        return

    # Reset Image_Cnt to 0 for all records so only SP files contribute
    for record in species_data.get('data', []):
        record['Image_Cnt'] = 0

    # Scan SP_*.json to populate Image_Cnt in species.json
    print("Scanning species files for image counts...")
    species_counts = {}
    sp_files = glob.glob('Data/species/SP_*.json')
    for sp_path in sp_files:
        sp_json = load_json_file(sp_path)
        if not sp_json:
            continue
        count = None
        if isinstance(sp_json, dict):
            metadata = sp_json.get('metadata', {})
            if isinstance(metadata, dict):
                count = metadata.get('total_rows')
            if count is None:
                count = len(sp_json.get('data', []))
        species_id = os.path.splitext(os.path.basename(sp_path))[0]
        try:
            species_counts[species_id] = int(count) if count is not None else 0
        except Exception:
            species_counts[species_id] = 0
    updated_species_records = 0
    for record in species_data.get('data', []):
        sid = record.get('Species_ID')
        if sid in species_counts:
            record['Image_Cnt'] = species_counts[sid]
            updated_species_records += 1
    print(f"Updated Image_Cnt for {updated_species_records} species from SP files")
    save_json_file('Data/taxonomy/species.json', species_data)

    # Initialize counters
    subfamily_counts = defaultdict(lambda: {'species': 0, 'images': 0})
    family_counts = defaultdict(lambda: {'species': 0, 'images': 0})
    suborder_counts = defaultdict(lambda: {'species': 0, 'images': 0})
    order_counts = defaultdict(lambda: {'species': 0, 'images': 0})

    # Process each species using Image_Cnt
    print("Processing species data using Image_Cnt values...")
    total_species_processed = 0
    species_with_images = 0

    for species in species_data.get('data', []):
        total_species_processed += 1
        species_id = species.get('Species_ID')

        # Use Image_Cnt updated above
        image_count = int(species.get('Image_Cnt', 0) or 0)

        # Only count species that have images (> 0)
        if image_count <= 0:
            continue

        species_with_images += 1
        species_count = 1  # Each species with images counts as 1

        # Get taxonomic hierarchy
        order_name = species.get('Order_Sci')
        suborder_name = species.get('Suborder_Sci')
        family_name = species.get('Family_Sci')
        subfamily_name = species.get('Subfamily_Sci')

        # Update subfamily counts (if subfamily exists)
        if subfamily_name:
            subfamily_counts[subfamily_name]['species'] += species_count
            subfamily_counts[subfamily_name]['images'] += image_count

        # Update family counts (subfamilies roll up to families)
        if family_name:
            family_counts[family_name]['species'] += species_count
            family_counts[family_name]['images'] += image_count

        # Update suborder counts (if suborder exists)
        if suborder_name:
            suborder_counts[suborder_name]['species'] += species_count
            suborder_counts[suborder_name]['images'] += image_count

        # Update order counts (suborders roll up to orders)
        if order_name:
            order_counts[order_name]['species'] += species_count
            order_counts[order_name]['images'] += image_count

    print(f"Total species in database: {total_species_processed}")
    print(f"Species with actual image files (>0 images): {species_with_images}")
    print(f"Species without images: {total_species_processed - species_with_images}")

    # Update subfamily JSON file
    print("Updating subfamily counts...")
    if subfamilies_data:
        print(f"Processing {len(subfamilies_data.get('data', []))} subfamilies")
        for subfamily in subfamilies_data.get('data', []):
            sf_name = subfamily.get('Subfamily_Sci')
            if sf_name in subfamily_counts:
                subfamily['Species_Cnt'] = subfamily_counts[sf_name]['species']
                subfamily['Image_Cnt'] = subfamily_counts[sf_name]['images']

        save_json_file('Data/taxonomy/subfamilies.json', subfamilies_data)
    else:
        print("Warning: subfamilies_data is None")

    # Update family JSON file
    print("Updating family counts...")
    if families_data:
        print(f"Processing {len(families_data.get('data', []))} families")
        for family in families_data.get('data', []):
            f_name = family.get('Family_Name_Sci')
            if f_name in family_counts:
                family['Species_Cnt'] = family_counts[f_name]['species']
                family['Image_Cnt'] = family_counts[f_name]['images']

        save_json_file('Data/taxonomy/families.json', families_data)
    else:
        print("Warning: families_data is None")

    # Update suborder JSON file
    print("Updating suborder counts...")
    if suborders_data:
        print(f"Processing {len(suborders_data.get('data', []))} suborders")
        for suborder in suborders_data.get('data', []):
            so_name = suborder.get('SO_Name_Sci')
            if so_name in suborder_counts:
                suborder['Species_Cnt'] = suborder_counts[so_name]['species']
                suborder['Image_Cnt'] = suborder_counts[so_name]['images']

        save_json_file('Data/taxonomy/suborders.json', suborders_data)
    else:
        print("Warning: suborders_data is None")

    # Update order JSON file
    print("Updating order counts...")
    if orders_data:
        for order in orders_data.get('data', []):
            o_name = order.get('Order_Name_Sci')
            if o_name in order_counts:
                order['Species_Cnt'] = order_counts[o_name]['species']
                order['Image_Cnt'] = order_counts[o_name]['images']

        save_json_file('Data/taxonomy/orders.json', orders_data)

    # Create SiteStats.json with totals
    print("Creating SiteStats.json...")
    total_species = sum(order_counts[order]['species'] for order in order_counts)
    total_images = sum(order_counts[order]['images'] for order in order_counts)

    site_stats = {
        "Birds_Total_Species_Count": total_species,
        "Birds_Total_Images_Count": total_images,
        "generated_at": "2025-01-27",  # Current date
        "description": "Total species and image counts from actual image files (top level sum only)"
    }

    save_json_file('Data/taxonomy/SiteStats.json', site_stats)

    # Print summary
    print("\n=== TAXONOMY COUNT SUMMARY ===")
    print(f"Total Species: {total_species}")
    print(f"Total Images: {total_images}")
    print(f"Orders Processed: {len(order_counts)}")
    print(f"Families Processed: {len(family_counts)}")
    print(f"Subfamilies Processed: {len(subfamily_counts)}")
    print(f"Suborders Processed: {len(suborder_counts)}")

    print("\nTop 5 orders by species count:")
    sorted_orders = sorted(order_counts.items(), key=lambda x: x[1]['species'], reverse=True)
    for i, (order_name, counts) in enumerate(sorted_orders[:5]):
        print(f"{i+1}. {order_name}: {counts['species']} species, {counts['images']} images")

if __name__ == "__main__":
    update_taxonomy_counts()
