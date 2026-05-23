param(
  [string]$BaseUrl = 'http://localhost/Recipe_Browser_App'
)

$ErrorActionPreference = 'Stop'

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) {
    throw $Message
  }
}

function Get-Text([string]$Url) {
  return [string]::Join("`n", (curl.exe -s $Url))
}

Write-Host "Smoke testing $BaseUrl ..."

$page = Get-Text "$BaseUrl/"
Assert-True ($LASTEXITCODE -eq 0) 'Failed to fetch main page'
Assert-True ($page -match 'Fork&Find') 'Main page missing app title'
Assert-True ($page -match 'google-signin-btn') 'Main page missing Google sign-in slot'
Assert-True ($page -match 'recipes-grid') 'Main page missing recipes grid'

$css = Get-Text "$BaseUrl/assets/css/index.css"
Assert-True ($LASTEXITCODE -eq 0) 'Failed to fetch CSS'
Assert-True ($css -match 'nav-cta--ghost') 'CSS missing auth button styles'
Assert-True ($css -match 'recipe-microcopy') 'CSS missing metadata styles'

$js = Get-Text "$BaseUrl/assets/js/index.js"
Assert-True ($LASTEXITCODE -eq 0) 'Failed to fetch JS'
Assert-True ($js -match 'estimateRecipeMeta') 'JS missing metadata helper'
Assert-True ($js -match 'FAVORITES_API_URL') 'JS missing favorites API wiring'

try {
  $verify = Invoke-RestMethod -Uri "$BaseUrl/oauth_verify.php" -Method Get
  Assert-True ($null -ne $verify -and $verify.PSObject.Properties.Name -contains 'authenticated') 'Auth verify endpoint JSON check failed'
} catch {
  throw 'Failed to fetch auth verify endpoint as JSON'
}

try {
  $favorites = Invoke-RestMethod -Uri "$BaseUrl/favorites.php" -Method Get
  Assert-True ($null -ne $favorites -and $favorites.PSObject.Properties.Name -contains 'authenticated') 'Favorites endpoint JSON check failed'
} catch {
  throw 'Failed to fetch favorites endpoint as JSON'
}

Write-Host 'All smoke checks passed.'
