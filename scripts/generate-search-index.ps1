# Generate species search index from Species.json
# Only includes species with Image_Cnt > 0
# Uses taxonomy _Path fields to determine correct image paths

Write-Host "Generating species search index..." -ForegroundColor Cyan

$basePath = "$PSScriptRoot\.."
$speciesPath = "$basePath\src\data\taxonomy\species.json"
$ordersPath = "$basePath\src\data\taxonomy\orders.json"
$subordersPath = "$basePath\src\data\taxonomy\suborders.json"
$familiesPath = "$basePath\src\data\taxonomy\families.json"
$subfamiliesPath = "$basePath\src\data\taxonomy\subfamilies.json"
$outputPath = "$basePath\src\data\species_search.json"
$publicOutputPath = "$basePath\public\data\species_search.json"

# Read all data
$speciesData = Get-Content $speciesPath -Raw -Encoding UTF8 | ConvertFrom-Json
$ordersData = Get-Content $ordersPath -Raw -Encoding UTF8 | ConvertFrom-Json
$subordersData = Get-Content $subordersPath -Raw -Encoding UTF8 | ConvertFrom-Json
$familiesData = Get-Content $familiesPath -Raw -Encoding UTF8 | ConvertFrom-Json
$subfamiliesData = Get-Content $subfamiliesPath -Raw -Encoding UTF8 | ConvertFrom-Json

# Build lookup tables
$orders = @{}
foreach ($o in $ordersData.data) {
    $orders[$o.Order_Name_Sci] = $o
}

$suborders = @{}
foreach ($so in $subordersData.data) {
    $suborders[$so.SO_Name_Sci] = $so
}

$families = @{}
foreach ($f in $familiesData.data) {
    $families[$f.Family_Name_Sci] = $f
}

$subfamilies = @{}
foreach ($sf in $subfamiliesData.data) {
    $subfamilies[$sf.Subfamily_Sci] = $sf
}

# Function to determine correct path for a species
function Get-SpeciesPath {
    param($sp)
    
    # Priority: subfamily > family > suborder > order
    # Use the most specific level that has a _Path
    
    # 1. Check subfamily
    if ($sp.Subfamily_Sci -and $subfamilies.ContainsKey($sp.Subfamily_Sci)) {
        $sf = $subfamilies[$sp.Subfamily_Sci]
        if ($sf.SF_Path) {
            return $sf.SF_Path
        }
    }
    
    # 2. Check family
    if ($sp.Family_Sci -and $families.ContainsKey($sp.Family_Sci)) {
        $fam = $families[$sp.Family_Sci]
        if ($fam.Family_Path) {
            return $fam.Family_Path
        }
    }
    
    # 3. Check suborder
    if ($sp.Suborder_Sci -and $suborders.ContainsKey($sp.Suborder_Sci)) {
        $so = $suborders[$sp.Suborder_Sci]
        if ($so.SO_Path) {
            return $so.SO_Path
        }
    }
    
    # 4. Check order
    if ($sp.Order_Sci -and $orders.ContainsKey($sp.Order_Sci)) {
        $ord = $orders[$sp.Order_Sci]
        if ($ord.Order_Path) {
            return $ord.Order_Path
        }
    }
    
    # Fallback: construct from order (shouldn't happen if taxonomy is complete)
    return $sp.Order_Sci + "/"
}

# Filter and transform
$searchIndex = @()
foreach ($sp in $speciesData.data) {
    $imgCnt = [int]$sp.Image_Cnt
    if ($imgCnt -gt 0) {
        $path = Get-SpeciesPath $sp
        
        $entry = [PSCustomObject]@{
            id = $sp.Species_ID
            sci = $sp.Species_Name_Sci
            sp = $sp.Species_Name_Sp
            en = $sp.Species_Name_En
            path = $path
        }
        $searchIndex += $entry
    }
}

# Create output object
$output = [PSCustomObject]@{
    generated_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    count = $searchIndex.Count
    data = $searchIndex
}

# Write to both src and public with UTF-8 without BOM
$json = $output | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputPath, $json, $utf8NoBom)
[System.IO.File]::WriteAllText($publicOutputPath, $json, $utf8NoBom)

Write-Host "  Generated $($searchIndex.Count) searchable species" -ForegroundColor Green
Write-Host "  Output: $outputPath" -ForegroundColor Gray
Write-Host "  Output: $publicOutputPath" -ForegroundColor Gray
Write-Host "Done!" -ForegroundColor Cyan
