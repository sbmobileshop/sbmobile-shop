<?php
/**
 * Cart API
 */
define('SB_INSTALL', true);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$method = $_SERVER['REQUEST_METHOD'];
$sessionId = session_id_new();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'add':
            $productId = (int)($input['product_id'] ?? 0);
            $quantity = max(1, (int)($input['quantity'] ?? 1));
            
            // Check product exists and is in stock
            $product = Database::fetch("SELECT id, stock, stock_unlimited, in_stock, price FROM products WHERE id = ? AND status = 'active'", [$productId]);
            if (!$product) {
                json_response(['success' => false, 'message' => 'Product not found'], 404);
            }
            
            if (!$product['stock_unlimited'] && $product['stock'] < $quantity) {
                json_response(['success' => false, 'message' => 'Not enough stock'], 400);
            }
            
            // Check if already in cart
            $existing = Database::fetch("SELECT id, quantity FROM cart WHERE session_id = ? AND product_id = ?", [$sessionId, $productId]);
            
            if ($existing) {
                $newQty = $existing['quantity'] + $quantity;
                if (!$product['stock_unlimited'] && $product['stock'] < $newQty) {
                    json_response(['success' => false, 'message' => 'Not enough stock'], 400);
                }
                Database::update('cart', ['quantity' => $newQty], 'id = ?', [$existing['id']]);
            } else {
                Database::insert('cart', [
                    'session_id' => $sessionId,
                    'user_id' => auth_id(),
                    'product_id' => $productId,
                    'quantity' => $quantity
                ]);
            }
            
            $cartCount = get_cart_count();
            json_response(['success' => true, 'message' => 'Added to cart', 'cart_count' => $cartCount]);
            break;
            
        case 'update':
            $productId = (int)($input['product_id'] ?? 0);
            $quantity = (int)($input['quantity'] ?? 0);
            
            if ($quantity <= 0) {
                Database::delete('cart', 'session_id = ? AND product_id = ?', [$sessionId, $productId]);
            } else {
                Database::update('cart', ['quantity' => $quantity], 'session_id = ? AND product_id = ?', [$sessionId, $productId]);
            }
            
            $cartCount = get_cart_count();
            json_response(['success' => true, 'cart_count' => $cartCount]);
            break;
            
        case 'remove':
            $productId = (int)($input['product_id'] ?? 0);
            Database::delete('cart', 'session_id = ? AND product_id = ?', [$sessionId, $productId]);
            $cartCount = get_cart_count();
            json_response(['success' => true, 'cart_count' => $cartCount]);
            break;
            
        case 'clear':
            Database::delete('cart', 'session_id = ?', [$sessionId]);
            json_response(['success' => true, 'cart_count' => 0]);
            break;
            
        default:
            json_response(['success' => false, 'message' => 'Invalid action'], 400);
    }
}

if ($method === 'GET') {
    $cartItems = Database::fetchAll(
        "SELECT c.*, p.name, p.name_bn, p.price, p.image_url, p.stock, p.stock_unlimited, p.in_stock, p.product_type
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.session_id = ?",
        [$sessionId]
    );
    
    $total = 0;
    foreach ($cartItems as &$item) {
        $item['subtotal'] = $item['price'] * $item['quantity'];
        $total += $item['subtotal'];
    }
    
    json_response([
        'success' => true,
        'items' => $cartItems,
        'total' => $total,
        'count' => count($cartItems)
    ]);
}
