<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

const FAVORITES_STORE = __DIR__ . '/data/google_favorites.json';

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function current_user(): ?array {
    return (!empty($_SESSION['google_user']) && is_array($_SESSION['google_user'])) ? $_SESSION['google_user'] : null;
}

function ensure_storage_dir(): void {
    $dir = dirname(FAVORITES_STORE);
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

function read_store(): array {
    ensure_storage_dir();
    if (!is_file(FAVORITES_STORE)) {
        return [];
    }
    $raw = file_get_contents(FAVORITES_STORE);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function write_store(array $data): void {
    ensure_storage_dir();
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new RuntimeException('Failed to encode favorites');
    }
    $tmp = FAVORITES_STORE . '.tmp';
    file_put_contents($tmp, $json, LOCK_EX);
    rename($tmp, FAVORITES_STORE);
}

function normalize_favorites($favorites): array {
    if (!is_array($favorites)) {
        return [];
    }
    $out = [];
    foreach ($favorites as $fav) {
        if (!is_array($fav)) {
            continue;
        }
        $id = isset($fav['idMeal']) ? trim((string) $fav['idMeal']) : '';
        $name = isset($fav['strMeal']) ? trim((string) $fav['strMeal']) : '';
        if ($id === '' || $name === '') {
            continue;
        }
        $out[] = [
            'idMeal' => $id,
            'strMeal' => $name,
            'strMealThumb' => isset($fav['strMealThumb']) ? (string) $fav['strMealThumb'] : '',
            'strCategory' => isset($fav['strCategory']) ? (string) $fav['strCategory'] : '',
            'strArea' => isset($fav['strArea']) ? (string) $fav['strArea'] : '',
        ];
    }

    $unique = [];
    $seen = [];
    foreach ($out as $fav) {
        if (isset($seen[$fav['idMeal']])) {
            continue;
        }
        $seen[$fav['idMeal']] = true;
        $unique[] = $fav;
    }
    return $unique;
}

$user = current_user();
if (!$user || empty($user['sub'])) {
    respond(['authenticated' => false, 'favorites' => []]);
}

$store = read_store();
$sub = (string) $user['sub'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond([
        'authenticated' => true,
        'favorites' => normalize_favorites($store[$sub] ?? []),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input') ?: '', true);
    $favorites = normalize_favorites($input['favorites'] ?? []);
    $store[$sub] = $favorites;
    write_store($store);
    respond([
        'authenticated' => true,
        'favorites' => $favorites,
    ]);
}

respond(['authenticated' => true, 'error' => 'Method not allowed'], 405);
