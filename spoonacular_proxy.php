<?php
// Simple Spoonacular proxy to keep API key on the server for development
// Usage: GET /spoonacular_proxy.php?mode=search&query=chicken&diet=vegetarian&cuisine=Italian&number=10&addRecipeNutrition=1
// The proxy will read the API key from environment variable SPOONACULAR_API_KEY

header('Content-Type: application/json; charset=utf-8');
// allow same-origin requests from the app (no CORS required for local use)

// Load local config if present so dev-only keys can be stored outside the frontend.
$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) {
    require_once $localConfig;
}

// get key from environment or from a local config constant
$apiKey = getenv('SPOONACULAR_API_KEY') ?: (defined('SPOONACULAR_API_KEY') ? SPOONACULAR_API_KEY : '');
if (!$apiKey) {
    http_response_code(400);
    echo json_encode(['error' => 'SPOONACULAR_API_KEY not configured on server']);
    exit;
}

$mode = isset($_GET['mode']) ? $_GET['mode'] : 'search';
$allowedModes = ['search'];
if (!in_array($mode, $allowedModes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mode']);
    exit;
}

// build request to Spoonacular complexSearch endpoint
$base = 'https://api.spoonacular.com/recipes/complexSearch';
$qs = [];
// forward selected params
$forward = ['query' => 'query', 'q' => 'query', 'diet' => 'diet', 'cuisine' => 'cuisine', 'number' => 'number', 'addRecipeNutrition' => 'addRecipeNutrition'];
foreach ($forward as $src => $dst) {
    if (isset($_GET[$src]) && $_GET[$src] !== '') {
        $qs[$dst] = $_GET[$src];
    }
}

$qs['apiKey'] = $apiKey;

$url = $base . '?' . http_build_query($qs);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'ForkFind-Server-Proxy/1.0'
]);
$body = curl_exec($ch);
if ($body === false) {
    $err = curl_error($ch);
    curl_close($ch);
    http_response_code(502);
    echo json_encode(['error' => 'Upstream request failed', 'detail' => $err]);
    exit;
}
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($code);
echo $body;
exit;
