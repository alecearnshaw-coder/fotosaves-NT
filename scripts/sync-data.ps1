# Sync script: copies builders from src/ to public/ for client-side rendering
# Run this after editing files in src/builders/
# Taxonomy/species JSON lives only in public/data/ (edit there directly).

Write-Host "Syncing builders from src/ to public/..." -ForegroundColor Cyan

# Sync builders (note the name mapping)
Copy-Item -Path "$PSScriptRoot\..\src\builders\Group_Builder.html" -Destination "$PSScriptRoot\..\public\grupo.html" -Force
Write-Host "  [OK] Group_Builder.html -> grupo.html" -ForegroundColor Green

Copy-Item -Path "$PSScriptRoot\..\src\builders\Species_Builder.html" -Destination "$PSScriptRoot\..\public\especie.html" -Force
Write-Host "  [OK] Species_Builder.html -> especie.html" -ForegroundColor Green

Copy-Item -Path "$PSScriptRoot\..\src\builders\Aves.html" -Destination "$PSScriptRoot\..\public\Aves.html" -Force
Write-Host "  [OK] Aves.html synced" -ForegroundColor Green

Copy-Item -Path "$PSScriptRoot\..\src\builders\Birds.html" -Destination "$PSScriptRoot\..\public\Birds.html" -Force
Write-Host "  [OK] Birds.html synced" -ForegroundColor Green

# Sync shared assets
Copy-Item -Path "$PSScriptRoot\..\src\builders\shared\*" -Destination "$PSScriptRoot\..\public\scripts\shared\" -Force -Recurse
Write-Host "  [OK] Shared scripts synced" -ForegroundColor Green

Copy-Item -Path "$PSScriptRoot\..\src\builders\*.css" -Destination "$PSScriptRoot\..\public\styles\" -Force
Write-Host "  [OK] Shared styles synced" -ForegroundColor Green

Write-Host "`nSync complete! Remember to commit and push public/ builder changes." -ForegroundColor Yellow
Write-Host "JSON data: edit public/data/ directly (no sync needed)." -ForegroundColor Yellow
