$files = Get-ChildItem -Path . -Recurse -Include *.html,*.js,*.md
foreach ($f in $files) {
    Write-Host "Processing $($f.FullName)"
    $content = Get-Content -Raw -Encoding UTF8 $f.FullName
    [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
}
