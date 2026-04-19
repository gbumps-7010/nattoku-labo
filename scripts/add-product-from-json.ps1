param(
    [Parameter(Mandatory = $true)]
    [string]$JsonPath
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

try {
    $root = Split-Path -Parent $PSScriptRoot
    $productsDir = Join-Path $root "products"
    $dataDir = Join-Path $productsDir "data"
    $templatePath = Join-Path $productsDir "template-unified.html"
    $productsDataPath = Join-Path $root "products-data.js"

    $resolvedJsonPath = Resolve-Path -Path $JsonPath | Select-Object -ExpandProperty Path
    if (-not (Test-Path $resolvedJsonPath)) {
        Fail "JSON file not found: $JsonPath"
    }

    $jsonRaw = Get-Content -Raw -Path $resolvedJsonPath -Encoding UTF8
    $data = $jsonRaw | ConvertFrom-Json

    $required = @(
        "productId", "productName", "manufacturer",
        "overallRating", "totalReviews", "price", "reliabilityScore"
    )
    $missing = @()
    foreach ($key in $required) {
        $value = $data.$key
        if ($null -eq $value -or "$value".Trim() -eq "") {
            $missing += $key
        }
    }
    if ($missing.Count -gt 0) {
        Fail ("Missing required fields: " + ($missing -join ", "))
    }

    $productId = "$($data.productId)".Trim()
    if ($productId -notmatch "^[a-z0-9-]+$") {
        Fail "productId must match ^[a-z0-9-]+$"
    }

    $moshimoFile = $data.moshimoAffiliateHtmlFile
    $moshimoHtml = $data.moshimoAffiliateHtml
    $moshimoEasyHtml = $data.moshimoAffiliateEasyLinkHtml
    $moshimoEasyFile = $data.moshimoAffiliateEasyLinkHtmlFile
    $moshimoObj = $data.moshimoAffiliateEasyLink
    $hasMoshimo = ((-not [string]::IsNullOrWhiteSpace("$moshimoFile")) -or (-not [string]::IsNullOrWhiteSpace("$moshimoHtml")) -or (-not [string]::IsNullOrWhiteSpace("$moshimoEasyHtml")) -or (-not [string]::IsNullOrWhiteSpace("$moshimoEasyFile")) -or ($null -ne $moshimoObj))

    $cta = $data.cta
    $amazonUrl = if ($null -ne $cta -and $null -ne $cta.amazon) { "$($cta.amazon)" } else { "" }
    $rakutenUrl = if ($null -ne $cta -and $null -ne $cta.rakuten) { "$($cta.rakuten)" } else { "" }
    $listFallback = "https://nattoku-labo.com/products/$productId.html"
    if ([string]::IsNullOrWhiteSpace($amazonUrl)) { $amazonUrl = if ($hasMoshimo) { $listFallback } else { "" } }
    if ([string]::IsNullOrWhiteSpace($rakutenUrl)) { $rakutenUrl = if ($hasMoshimo) { $listFallback } else { "" } }
    if ([string]::IsNullOrWhiteSpace($amazonUrl) -or [string]::IsNullOrWhiteSpace($rakutenUrl)) {
        Fail "CTA URLs or もしも (moshimoAffiliateHtmlFile / moshimoAffiliateEasyLinkHtml / moshimoAffiliateEasyLinkHtmlFile / moshimoAffiliateEasyLink / moshimoAffiliateHtml) が必要です"
    }

    $outputJsonPath = Join-Path $dataDir "$productId.json"
    $outputHtmlPath = Join-Path $productsDir "$productId.html"
    if (Test-Path $outputJsonPath) { Fail "Product JSON already exists: $outputJsonPath" }
    if (Test-Path $outputHtmlPath) { Fail "Product HTML already exists: $outputHtmlPath" }
    if (-not (Test-Path $templatePath)) { Fail "Template not found: $templatePath" }
    if (-not (Test-Path $productsDataPath)) { Fail "products-data.js not found: $productsDataPath" }

    # Save normalized JSON
    $normalizedJson = $data | ConvertTo-Json -Depth 100
    [System.IO.File]::WriteAllText($outputJsonPath, $normalizedJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

    # Copy HTML template
    Copy-Item -Path $templatePath -Destination $outputHtmlPath

    # Append entry to products-data.js
    $productsDataContent = Get-Content -Raw -Path $productsDataPath -Encoding UTF8
    if ($productsDataContent.Contains("id: '$productId'")) {
        Fail "products-data.js already has productId: $productId"
    }

    $endIndex = $productsDataContent.IndexOf("];")
    if ($endIndex -lt 0) {
        Fail "Could not find productsData array end in products-data.js"
    }

    function To-Score([object]$Value, [int]$Fallback) {
        if ($null -eq $Value) { return $Fallback }
        try {
            $v = [int][Math]::Round([double]$Value)
            if ($v -lt 0) { return 0 }
            if ($v -gt 100) { return 100 }
            return $v
        } catch {
            return $Fallback
        }
    }

    $suction = To-Score $data.performanceAnalysis.floorCleaning.score 80
    $mopping = To-Score $data.performanceAnalysis.carpetCleaning.score 75
    $noise = To-Score $data.performanceAnalysis.nightQuietness.score 75
    $obstacle = To-Score $data.performanceAnalysis.stepClimbing.score 70
    $app = To-Score $data.performanceAnalysis.appStability.score 80
    $maintenance = To-Score $data.performanceAnalysis.maintenance.score 80

    $badges = @()
    if ($data.badges) {
        foreach ($badge in $data.badges) {
            if (-not [string]::IsNullOrWhiteSpace("$badge")) {
                $badges += "$badge"
            }
            if ($badges.Count -ge 3) { break }
        }
    }
    if ($badges.Count -eq 0) {
        $badges = @("New", "Detailed Analysis", "Auto Added")
    }
    $badgesText = ($badges | ForEach-Object { "'" + ($_ -replace "'", "\\'") + "'" }) -join ", "

    $catalogImage = ""
    if ($null -ne $data.imageUrl) {
        $catalogImage = "$($data.imageUrl)".Trim()
    }
    $catalogImageEscaped = $catalogImage -replace "'", "\\'"

    $entry = @"
    {
        id: '$($productId -replace "'", "\\'")',
        name: '$("$($data.productName)" -replace "'", "\\'")',
        manufacturer: '$("$($data.manufacturer)" -replace "'", "\\'")',
        price: $([int]$data.price),
        rating: $([double]$data.overallRating),
        reviewCount: $([int]$data.totalReviews),
        totalReviewCount: $([int]$data.totalReviews),
        image: '$catalogImageEscaped',
        badges: [$badgesText],
        specs: {
            suction: $suction,
            mopping: $mopping,
            noise: $noise,
            obstacle: $obstacle,
            app: $app,
            maintenance: $maintenance
        },
        amazonUrl: '$($amazonUrl -replace "'", "\\'")',
        rakutenUrl: '$($rakutenUrl -replace "'", "\\'")'
    }
"@

    $before = $productsDataContent.Substring(0, $endIndex).TrimEnd()
    $after = $productsDataContent.Substring($endIndex)
    $updated = $before + "," + [Environment]::NewLine + $entry + [Environment]::NewLine + [Environment]::NewLine + $after
    [System.IO.File]::WriteAllText($productsDataPath, $updated, [System.Text.UTF8Encoding]::new($false))

    Write-Output "Product added successfully"
    Write-Output "- Source JSON: $resolvedJsonPath"
    Write-Output "- Data file: $outputJsonPath"
    Write-Output "- HTML file: $outputHtmlPath"
    Write-Output "- Updated: $productsDataPath"
    Write-Output "- Preview URL: products/$productId.html"
} catch {
    Fail $_.Exception.Message
}
