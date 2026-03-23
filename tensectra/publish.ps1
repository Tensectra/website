$src  = $PSScriptRoot
$dest = "$PSScriptRoot\_publish"

# Clean previous publish
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item $dest -ItemType Directory | Out-Null

# Folders to include
$folders = @("css", "js", "images", "pages", "forms")
foreach ($f in $folders) {
    if (Test-Path "$src\$f") {
        Copy-Item "$src\$f" "$dest\$f" -Recurse
    }
}

# Root files to include
$files = @("index.html", "robots.txt", "site.webmanifest")
foreach ($f in $files) {
    if (Test-Path "$src\$f") {
        Copy-Item "$src\$f" "$dest\$f"
    }
}

# Zip it
$zip = "$src\_publish.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$dest\*" -DestinationPath $zip

Write-Host "Done. Upload _publish.zip to Netlify." -ForegroundColor Cyan
