# Sync script: copies data from src/ to public/ for client-side rendering
# Run this after editing JSON files in src/data/

Write-Host "Syncing data from src/ to public/..." -ForegroundColor Cyan

# Sync species data
Copy-Item -Path "$PSScriptRoot\..\src\data\species\*" -Destination "$PSScriptRoot\..\public\data\species\" -Force -Recurse
Write-Host "  ✓ Species data synced" -ForegroundColor Green

# Sync taxonomy data
Copy-Item -Path "$PSScriptRoot\..\src\data\taxonomy\*" -Destination "$PSScriptRoot\..\public\data\taxonomy\" -Force -Recurse
Write-Host "  ✓ Taxonomy data synced" -ForegroundColor Green

Write-Host "`nSync complete! Remember to commit both src/ and public/ changes." -ForegroundColor Yellow

