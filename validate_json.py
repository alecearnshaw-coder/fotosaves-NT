import json
import sys

try:
    with open('src/data/taxonomy/species.json', encoding='utf-8') as f:
        data = json.load(f)
    print(f"OK - src/species.json is VALID JSON! ({len(data.get('data', []))} species)")
except json.JSONDecodeError as e:
    print(f"ERROR - JSON Error at line {e.lineno}, column {e.colno}: {e.msg}")
    sys.exit(1)

