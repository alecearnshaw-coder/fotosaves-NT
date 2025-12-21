# Generate species search index from Species.json
# Only includes species with Image_Cnt > 0

Write-Host "Generating species search index..." -ForegroundColor Cyan

$speciesPath = "$PSScriptRoot\..\src\data\taxonomy\species.json"
$outputPath = "$PSScriptRoot\..\src\data\species_search.json"
$publicOutputPath = "$PSScriptRoot\..\public\data\species_search.json"

# Read species data
$speciesData = Get-Content $speciesPath -Raw | ConvertFrom-Json

# Filter and transform
$searchIndex = @()
foreach ($sp in $speciesData.data) {
    $imgCnt = [int]$sp.Image_Cnt
    if ($imgCnt -gt 0) {
        # Build path from taxonomy
        $path = $sp.Order_Sci + "/"
        if ($sp.Subfamily_Sci) {
            $path += $sp.Family_Sci + "/" + $sp.Subfamily_Sci + "/"
        } elseif ($sp.Family_Sci) {
            $path += $sp.Family_Sci + "/"
        }
        
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

