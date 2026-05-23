<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

const GOOGLE_CLIENT_ID = '312956501946-oudsbfrn21rkeib6gn3de36eca5dvuf6.apps.googleusercontent.com';

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function curl_json(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $body = curl_exec($ch);
    if ($body === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException($err ?: 'Request failed');
    }
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($body, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid JSON from tokeninfo');
    }
    return [$code, $data];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_SESSION['google_user']) && is_array($_SESSION['google_user'])) {
        respond([
            'authenticated' => true,
            'user' => $_SESSION['google_user'],
        ]);
    }
    respond(['authenticated' => false]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['authenticated' => false, 'error' => 'Method not allowed'], 405);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
$credential = $input['credential'] ?? '';

if (!is_string($credential) || trim($credential) === '') {
    respond(['authenticated' => false, 'error' => 'Missing credential'], 400);
}

try {
    [$status, $tokenInfo] = curl_json('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential));
} catch (Throwable $e) {
    respond(['authenticated' => false, 'error' => 'Unable to verify Google token'], 502);
}

if ($status !== 200) {
    respond(['authenticated' => false, 'error' => 'Invalid Google token'], 401);
}

$aud = $tokenInfo['aud'] ?? '';
$iss = $tokenInfo['iss'] ?? '';
$email = $tokenInfo['email'] ?? '';
$exp = isset($tokenInfo['exp']) ? (int) $tokenInfo['exp'] : 0;

if ($aud !== GOOGLE_CLIENT_ID || !in_array($iss, ['https://accounts.google.com', 'accounts.google.com'], true) || $exp < time()) {
    respond(['authenticated' => false, 'error' => 'Google token validation failed'], 401);
}

$user = [
    'sub' => $tokenInfo['sub'] ?? '',
    'email' => $email,
    'name' => $tokenInfo['name'] ?? ($email ?: 'Google User'),
    'picture' => $tokenInfo['picture'] ?? '',
];

$_SESSION['google_user'] = $user;
session_regenerate_id(true);

respond([
    'authenticated' => true,
    'user' => $user,
]);
