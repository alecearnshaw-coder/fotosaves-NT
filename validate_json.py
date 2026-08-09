import json
import sys

try:
    with open('public/data/taxonomy/species.json', encoding='utf-8') as f:
        data = json.load(f)
    print(f"OK - public/data/taxonomy/species.json is VALID JSON! ({len(data.get('data', []))} species)")
except json.JSONDecodeError as e:
    print(f"ERROR - JSON Error at line {e.lineno}, column {e.colno}: {e.msg}")
    sys.exit(1)

