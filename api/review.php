<?php
/**
 * Review API
 */
define('SB_INSTALL', true);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = (int)($_POST['product_id'] ?? 0);
    $customerName = trim($_POST['customer_name'] ?? '');
    $customerPhone = trim($_POST['customer_phone'] ?? '');
    $rating = (int)($_POST['rating'] ?? 5);
    $reviewText = trim($_POST['review_text'] ?? '');
    
    if (!$productId || empty($customerName)) {
        json_response(['success' => false, 'message' => 'Name and product are required'], 400);
    }
    
    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }
    
    $id = Database::insert('product_reviews', [
        'product_id' => $productId,
        'user_id' => auth_id(),
        'customer_name' => $customerName,
        'customer_phone' => $customerPhone,
        'rating' => $rating,
        'review_text' => $reviewText,
        'is_approved' => 0,
    ]);
    
    json_response([
        'success' => true, 
        'message' => 'Review submitted! It will be visible after approval.'
    ]);
}
