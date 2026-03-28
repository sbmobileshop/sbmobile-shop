<?php
/**
 * Products API
 */
define('SB_INSTALL', true);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = ITEMS_PER_PAGE;
$offset = ($page - 1) * $perPage;

$where = "p.status = 'active'";
$params = [];

if (!empty($_GET['category'])) {
    $cat = Database::fetch("SELECT id FROM categories WHERE slug = ?", [$_GET['category']]);
    if ($cat) {
        $where .= " AND p.category_id = ?";
        $params[] = $cat['id'];
    }
}

if (!empty($_GET['type'])) {
    $where .= " AND p.product_type = ?";
    $params[] = $_GET['type'];
}

if (!empty($_GET['search'])) {
    $search = '%' . $_GET['search'] . '%';
    $where .= " AND (p.name LIKE ? OR p.name_bn LIKE ?)";
    $params[] = $search;
    $params[] = $search;
}

if (!empty($_GET['featured'])) {
    $where .= " AND p.featured = 1";
}

if (!empty($_GET['min_price'])) {
    $where .= " AND p.price >= ?";
    $params[] = (float)$_GET['min_price'];
}

if (!empty($_GET['max_price'])) {
    $where .= " AND p.price <= ?";
    $params[] = (float)$_GET['max_price'];
}

$orderBy = 'p.featured DESC, p.created_at DESC';
if (!empty($_GET['sort'])) {
    switch ($_GET['sort']) {
        case 'price_asc':
            $orderBy = 'p.price ASC';
            break;
        case 'price_desc':
            $orderBy = 'p.price DESC';
            break;
        case 'name_asc':
            $orderBy = 'p.name ASC';
            break;
        case 'newest':
            $orderBy = 'p.created_at DESC';
            break;
    }
}

// Get total count
$total = Database::count('products p', $where, $params);
$totalPages = ceil($total / $perPage);

// Get products
$sql = "SELECT p.*, c.name as category_name, c.name_bn as category_name_bn 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE {$where} 
        ORDER BY {$orderBy} 
        LIMIT {$perPage} OFFSET {$offset}";

$products = Database::fetchAll($sql, $params);

echo json_encode([
    'success' => true,
    'products' => $products,
    'pagination' => [
        'current_page' => $page,
        'total_pages' => $totalPages,
        'total_items' => $total,
        'per_page' => $perPage
    ]
]);
