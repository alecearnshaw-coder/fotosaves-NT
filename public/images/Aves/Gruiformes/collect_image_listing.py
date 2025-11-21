import os
import re
import sys
import glob
from typing import List, Dict, Optional, Tuple

import pandas as pd
from bs4 import BeautifulSoup, Tag


CATEGORY_LABELS = [
    "Near-threatened",
    "Vulnerable",
    "Endangered",
    "Critically Endangered",
]

# Keywords to detect sex/age/stage header tables; we store text as-is when found
STAGE_KEYWORDS = [
    # English
    "male", "female", "chicks", "juvenile", "immature", "immatures",
    "subadult", "sub-adult", "nest", "nymph", "egg", "eggs", "adult",
    # Spanish common counterparts
    "macho", "hembra", "pichon", "pichones", "juvenil", "inmaduro", "inmaduros",
    "subadulto", "nido", "ninfa", "huevo", "huevos", "adulto", "adultos",
]

# Add robust, case-insensitive variant patterns for each category, including common typos
THREAT_VARIANTS: Dict[str, List[re.Pattern]] = {
    # Near-threatened variations and typos (EN + ES)
    "Near-threatened": [
        re.compile(r"\bnear[\s\-]*threaten(?:ed|ned)\b", re.IGNORECASE),
        re.compile(r"\bnearth[\s\-]*threat(?:en(?:ed)?|ed|ned)\b", re.IGNORECASE),  # handles many 'Nearth-...' typos
        re.compile(r"\bnear[\s\-]*threated\b", re.IGNORECASE),  # misspelling
        re.compile(r"\bnear[\s\-]*threat\w*\b", re.IGNORECASE),  # very tolerant within the specific table
        re.compile(r"\bcasi[\s\-]*amenazad[ao]s?\b", re.IGNORECASE),  # Spanish: Casi amenazada/o(s)
    ],
    # Vulnerable (EN + ES)
    "Vulnerable": [
        re.compile(r"\bvulnerabl(?:e|e)\b", re.IGNORECASE),
        re.compile(r"\bvulnerable\b", re.IGNORECASE),
    ],
    # Endangered (EN + ES)
    "Endangered": [
        re.compile(r"\bendanger(?:ed|d)\b", re.IGNORECASE),
        re.compile(r"\bendangered\b", re.IGNORECASE),
        re.compile(r"\ben[\s\-]*peligro\b", re.IGNORECASE),  # Spanish: En peligro
    ],
    # Critically Endangered variations and typos (EN + ES)
    "Critically Endangered": [
        re.compile(r"\bcritical(?:ly)?[\s\-]*endanger(?:ed|d)\b", re.IGNORECASE),
        re.compile(r"\bcritically[\s\-]*endangered\b", re.IGNORECASE),
        re.compile(r"\bcirtical(?:ly)?[\s\-]*endager(?:ed|d)\b", re.IGNORECASE),  # handles 'Cirtically-endagered'
        re.compile(r"\bcirtically[\s\-]*endagered\b", re.IGNORECASE),
        re.compile(r"\ben[\s\-]*peligro[\s\-]*critico\b", re.IGNORECASE),  # Spanish: En peligro critico
    ],
}


def read_html_file(path: str) -> Optional[str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(path, "r", encoding="latin-1") as f:
                return f.read()
        except Exception as e:
            print(f"Error reading {path}: {e}")
            return None
    except Exception as e:
        print(f"Error reading {path}: {e}")
        return None


def compact_text(text: str) -> str:
    if not text:
        return ""
    # Replace whitespace (including newlines) with single spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_current_folder_name() -> str:
    return os.path.basename(os.getcwd().rstrip(os.sep)) or "Image_Listing"


def endswith_jpg(value: Optional[str]) -> bool:
    return bool(value) and value.endswith(".jpg")


def _match_threat_in_text(text: str) -> str:
    """Return canonical threat label if any variant matches within the given text."""
    for canonical, patterns in THREAT_VARIANTS.items():
        for pat in patterns:
            if pat.search(text):
                return canonical
    return ""


def _find_status_in_table(table: Tag) -> str:
    """Try to detect the selected conservation status in a given table by locating a row
    where a dedicated cell has an 'x' or '×', then mapping that row's text to a known label."""
    if not isinstance(table, Tag) or table.name != "table":
        return ""
    for tr in table.find_all("tr"):
        tds = tr.find_all("td")
        if not tds:
            continue
        # Detect a cell that contains only an 'x' (or '×'), ignoring hyphens
        marker_found = False
        for td in tds:
            td_text = compact_text(td.get_text(" ", strip=True))
            if td_text.lower() in {"x", "×"}:
                marker_found = True
                break
        if not marker_found:
            continue
        # Prefer the rightmost cell's text (often English label). Fallback to full row text.
        right_text = compact_text(tds[-1].get_text(" ", strip=True))
        label = _match_threat_in_text(right_text)
        if label:
            return label
        row_text = compact_text(tr.get_text(" ", strip=True))
        label = _match_threat_in_text(row_text)
        if label:
            return label
    return ""


def _looks_like_stage_table(tbl: Tag) -> bool:
    if not isinstance(tbl, Tag) or tbl.name != "table":
        return False
    t = compact_text(tbl.get_text(" ", strip=True))
    t_lower = t.lower()
    # Must contain at least one stage keyword and contain no digits (to avoid location/date)
    if not any(kw in t_lower for kw in STAGE_KEYWORDS):
        return False
    if re.search(r"\d", t):
        return False
    # Heuristic: keep it relatively short to avoid long paragraphs
    if len(t) > 120:
        return False
    return True


def find_stage_tag_near_table(start_tbl: Tag, max_lookback_tables: int = 3) -> str:
    """Find a preceding header table indicating sex/age/stage and return its text as-is.
    Looks back among previous sibling tables up to a limit, stopping at the previous big image block."""
    count = 0
    for sib in start_tbl.previous_siblings:
        if not isinstance(sib, Tag) or sib.name != "table":
            continue
        # Stop if we hit a previous big image table: do not cross block boundaries
        try:
            if is_big_image_table(sib):
                break
        except Exception:
            pass
        count += 1
        if _looks_like_stage_table(sib):
            return compact_text(sib.get_text(" ", strip=True))
        if count >= max_lookback_tables:
            break
    return ""


def find_threat_status(soup: BeautifulSoup) -> str:
    # Search for table containing the phrase "Globally threatened species"
    target_phrase = "globally threatened species"
    header_tables: List[Tag] = []
    for table in soup.find_all("table"):
        table_text_original = table.get_text(" ", strip=True)
        table_text = compact_text(table_text_original).lower()
        if target_phrase in table_text:
            header_tables.append(table)
            # First, attempt to parse status directly within this table (unlikely but harmless)
            direct = _find_status_in_table(table)
            if direct:
                return direct
            # Then, try the next few sibling tables where the selection is typically shown
            sib_count = 0
            for sib in table.next_siblings:
                if not isinstance(sib, Tag) or sib.name != "table":
                    continue
                sib_count += 1
                status = _find_status_in_table(sib)
                if status:
                    return status
                if sib_count >= 4:
                    break
            # Fallback within header table for patterns like "LABEL : X"
            for canonical, patterns in THREAT_VARIANTS.items():
                for pat in patterns:
                    if re.search(pat.pattern + r"\s*[:\-]?\s*[xX×]", table_text_original, flags=re.IGNORECASE):
                        return canonical
    # Global fallback: scan all tables for an 'x' row and a known label
    for table in soup.find_all("table"):
        status = _find_status_in_table(table)
        if status:
            return status
    return ""


def is_big_image_table(tbl: Tag) -> bool:
    if not isinstance(tbl, Tag) or tbl.name != "table":
        return False
    width_attr = tbl.get("width")
    if width_attr != "800":
        return False
    # The main photo frame typically has a thick border (e.g., 9)
    try:
        border_val = int(tbl.get("border", "0"))
    except ValueError:
        border_val = 0
    if border_val < 6:
        return False
    # Must contain at least one <img src="...jpg">
    return tbl.find("img", src=lambda s: s and endswith_jpg(s)) is not None


def find_following_800_text_tables(start_tbl: Tag, max_tables: int = 2) -> List[str]:
    """From the table node, find the next two 800-wide tables (border=1) and return their compact text.
    Returns up to two strings: [camera_equipment, location_date]."""
    results: List[str] = []
    for sib in start_tbl.next_siblings:
        if not isinstance(sib, Tag):
            continue
        if sib.name != "table":
            continue
        if sib.get("width") == "800" and sib.get("border") == "1":
            results.append(compact_text(sib.get_text(" ", strip=True)))
            if len(results) >= max_tables:
                break
        # Stop if we encounter another big photo frame to avoid leaking into subsequent blocks
        try:
            if is_big_image_table(sib):
                break
        except Exception:
            pass
    return results


def extract_first_img_and_anchor(table: Tag) -> Tuple[Optional[str], Optional[str]]:
    """Return (thumbnail_src, large_href) from the first image region inside the table.
    If anchor is missing, large_href will be None."""
    # Prefer an anchor wrapping an image
    a_tag = table.find("a", href=True)
    if a_tag:
        img_tag = a_tag.find("img", src=True)
        if img_tag and endswith_jpg(img_tag.get("src")):
            thumb = img_tag.get("src")
            large = a_tag.get("href") if endswith_jpg(a_tag.get("href")) else None
            return thumb, large
    # Fallback: any image
    img_tag = table.find("img", src=True)
    if img_tag and endswith_jpg(img_tag.get("src")):
        return img_tag.get("src"), None
    return None, None


def parse_big_blocks(soup: BeautifulSoup) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    for tbl in soup.find_all("table"):
        if not is_big_image_table(tbl):
            continue
        thumb, large = extract_first_img_and_anchor(tbl)
        if not thumb:  # Enforce only .jpg thumbnails
            continue
        camera, location = "", ""
        follow_texts = find_following_800_text_tables(tbl, max_tables=2)
        if len(follow_texts) >= 1:
            camera = follow_texts[0]
        if len(follow_texts) >= 2:
            location = follow_texts[1]
        # Stage label must be immediately related to this block; do a strict lookup
        stage_label = find_stage_tag_near_table(tbl)
        rows.append({
            "Is_Small_ffn_gif": "",
            "Thumbnail_File": thumb,
            "Large_File": large or "",
            "Camera_Equipment": camera,
            "Location_Date": location,
            "Sex_Age": stage_label,
        })
    return rows


def parse_small_ffn_tables(soup: BeautifulSoup) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    # Find tables that contain any td with background including 'ffn.gif'
    for tbl in soup.find_all("table"):
        ffn_cells = tbl.find_all(lambda tag: isinstance(tag, Tag) and tag.name == "td" and tag.get("background") and "ffn.gif" in tag.get("background"))
        if not ffn_cells:
            continue
        # Keep track of the most recent per-column texts from the nearest previous text row(s)
        last_text_by_column: List[str] = []
        stage_label_for_table = find_stage_tag_near_table(tbl)
        for tr in tbl.find_all("tr"):
            # Determine if row has any ffn.gif cells
            tds = tr.find_all("td")
            has_ffn = any(td.get("background") and "ffn.gif" in td.get("background") for td in tds)

            # Build expanded per-column texts for this row based on colspan
            expanded_texts: List[str] = []
            for td in tds:
                colspan_val = td.get("colspan")
                try:
                    colspan = int(colspan_val) if colspan_val else 1
                except ValueError:
                    colspan = 1
                cell_text = compact_text(td.get_text(" ", strip=True))
                # Expand text across its spanned columns
                expanded_texts.extend([cell_text] * max(1, colspan))

            if not has_ffn:
                # If there's meaningful text, update the last_text_by_column; else, reset to avoid bleed-through
                if any(txt for txt in expanded_texts):
                    if last_text_by_column and len(last_text_by_column) == len(expanded_texts):
                        # Combine stacked text rows per column
                        combined: List[str] = []
                        for prev, cur in zip(last_text_by_column, expanded_texts):
                            if prev and cur:
                                combined.append(f"{prev} {cur}")
                            else:
                                combined.append(prev or cur)
                        last_text_by_column = combined
                    else:
                        last_text_by_column = expanded_texts
                else:
                    last_text_by_column = []
                continue

            # Row with ffn.gif image cells: assign per-image text using column alignment
            col_index_pointer = 0
            for td in tds:
                colspan_val = td.get("colspan")
                try:
                    colspan = int(colspan_val) if colspan_val else 1
                except ValueError:
                    colspan = 1

                bg = td.get("background", "")
                if "ffn.gif" in bg:
                    # Find anchor/img inside this cell
                    a_tag = td.find("a", href=True)
                    img_tag = td.find("img", src=True)
                    thumb: Optional[str] = None
                    large: Optional[str] = None
                    if img_tag and endswith_jpg(img_tag.get("src")):
                        thumb = img_tag.get("src")
                    if a_tag and endswith_jpg(a_tag.get("href")):
                        large = a_tag.get("href")
                    if thumb:
                        per_cell_text = last_text_by_column[col_index_pointer] if col_index_pointer < len(last_text_by_column) else ""
                        rows.append({
                            "Is_Small_ffn_gif": "Y",
                            "Thumbnail_File": thumb,
                            "Large_File": large or "",
                            "Camera_Equipment": "",
                            "Location_Date": per_cell_text,
                            "Sex_Age": stage_label_for_table,
                        })
                # Advance the column pointer by this cell's colspan
                col_index_pointer += max(1, colspan)
    return rows


def parse_file(path: str) -> List[Dict[str, str]]:
    html = read_html_file(path)
    if html is None:
        return []
    soup = BeautifulSoup(html, "lxml")

    # Threat status (one per file)
    threat = find_threat_status(soup)

    # Collect big 800-px blocks
    rows_big = parse_big_blocks(soup)

    # Collect small ffn.gif groups
    rows_small = parse_small_ffn_tables(soup)

    # Merge and attach threat status
    all_rows = rows_big + rows_small
    for r in all_rows:
        r["Threat_Status"] = threat
    return all_rows


def main() -> int:
    cwd = os.getcwd()
    folder_name = get_current_folder_name()
    pattern = os.path.join(cwd, "Fotos_*.html")
    files = [f for f in glob.glob(pattern) if os.path.isfile(f)]

    if not files:
        print("No matching HTML files (Fotos_*.html) found in current folder.")
        return 0

    print(f"Found {len(files)} file(s) to process.")

    records: List[Dict[str, str]] = []
    for path in sorted(files):
        filename = os.path.basename(path)
        base = os.path.splitext(filename)[0]
        # Must include underscore after Fotos
        if not base.startswith("Fotos_"):
            continue
        species = base.split("Fotos_", 1)[1]
        print(f"Processing {filename} (species: {species}) ...")
        rows = parse_file(path)
        for r in rows:
            # Only .jpg are kept by parsers; ensure again
            if not endswith_jpg(r.get("Thumbnail_File")):
                continue
            # Create record with new column structure
            r_out = {
                "Species_ID": "",  # Column B: EMPTY
                "Slug": species,  # Column C: Species_Name values
                "Subspecies_ID": "",  # Column D: EMPTY
                "Slide": r.get("Is_Small_ffn_gif", ""),  # Column E: Is_Small_ffn_gif values
                "Cover": "",  # Column F: EMPTY
                "Thumbnail_Filename": r.get("Thumbnail_File", ""),  # Column G: Thumbnail_File values
                "Large_Filename": r.get("Large_File", ""),  # Column H: Large_File values
                "Equipment": r.get("Camera_Equipment", ""),  # Column I: Camera_Equipment values
                "Sex_Age": r.get("Sex_Age", ""),  # Column J: Sex_Age values
                "Location": "",  # Column K: EMPTY
                "Province": "",  # Column L: EMPTY
                "Country": "",  # Column M: EMPTY
                "Date": "",  # Column N: EMPTY
                "Location_Date": r.get("Location_Date", ""),  # Column O: Location_Date values
                "Threat_Status": r.get("Threat_Status", ""),  # Column P: Threat_Status values
            }
            records.append(r_out)

    if not records:
        print("No image records found.")
        return 0

    # Create DataFrame with new column structure
    df = pd.DataFrame(records, columns=[
        "Species_ID",      # Column B
        "Slug",            # Column C
        "Subspecies_ID",   # Column D
        "Slide",           # Column E
        "Cover",           # Column F
        "Thumbnail_Filename",  # Column G
        "Large_Filename",      # Column H
        "Equipment",           # Column I
        "Sex_Age",             # Column J
        "Location",            # Column K
        "Province",            # Column L
        "Country",             # Column M
        "Date",                # Column N
        "Location_Date",       # Column O
        "Threat_Status",       # Column P
    ])

    out_name = f"{folder_name}_Image_Listing.xlsx"
    out_path = os.path.join(cwd, out_name)
    
    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        # Write data starting from row 3 (index 2), leaving row 1 empty and headers in row 2
        df.to_excel(writer, index=False, sheet_name="Images", startrow=0)
        
        # Get the workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets["Images"]

        # Insert empty column A
        worksheet.insert_cols(1) 
              
        # Insert empty row at the top (row 1)
        worksheet.insert_rows(1)

    print(f"Wrote {len(df)} rows to {out_path}")
    print("Excel structure: Row 1 (empty), Row 2 (headers), Row 3+ (data)")
    return 0


if __name__ == "__main__":
    sys.exit(main()) 