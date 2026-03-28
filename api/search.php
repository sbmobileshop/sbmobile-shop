<?php
/**
 * Search API
 */
define('SB_INSTALL', true);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$query = $_GET['q'] ?? '';

if (strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

$searchTerm = '%' . $query . '%';
$products = Database::fetchAll(
    "SELECT id, name, name_bn, slug, price, old_price, image_url FROM products 
     WHERE status = 'active' AND (name LIKE ? OR name_bn LIKE ?) 
     ORDER BY featured DESC, created_at DESC LIMIT 10",
    [$searchTerm, $searchTerm]
);

echo json_encode($products);
