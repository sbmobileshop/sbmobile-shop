<?php
/**
 * Helper Functions
 */

function escape($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

function redirect($url) {
    header("Location: $url");
    exit;
}

function back() {
    redirect($_SERVER['HTTP_REFERER'] ?? '/');
}

function old($key, $default = '') {
    return $_POST[$key] ?? $_SESSION['old'][$key] ?? $default;
}

function flash($key, $message = null) {
    if ($message === null) {
        $msg = $_SESSION['flash'][$key] ?? null;
        unset($_SESSION['flash'][$key]);
        return $msg;
    }
    $_SESSION['flash'][$key] = $message;
}

function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function session_id_new() {
    return session_id();
}

function auth_check() {
    return isset($_SESSION['user_id']);
}

function auth_user() {
    if (!auth_check()) return null;
    static $user = null;
    if ($user === null) {
        $user = Database::fetch("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);
    }
    return $user;
}

function auth_id() {
    return $_SESSION['user_id'] ?? null;
}

function is_admin() {
    $user = auth_user();
    return $user && $user['role'] === 'admin';
}

function is_moderator() {
    $user = auth_user();
    return $user && in_array($user['role'], ['admin', 'moderator']);
}

function require_login() {
    if (!auth_check()) {
        flash('redirect_url', $_SERVER['REQUEST_URI']);
        redirect('/pages/login.php');
    }
}

function require_admin() {
    require_login();
    if (!is_admin()) {
        flash('error', 'Access denied. Admin privileges required.');
        redirect('/');
    }
}

function asset($path) {
    return SITE_URL . '/assets/' . ltrim($path, '/');
}

function upload($file, $folder = 'general') {
    $allowed = array_merge(ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES);
    if (!in_array($file['type'], $allowed)) {
        return ['error' => 'File type not allowed'];
    }

    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['error' => 'File too large'];
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $ext;
    $path = UPLOAD_PATH . $folder . '/' . $filename;
    
    if (!is_dir(UPLOAD_PATH . $folder)) {
        mkdir(UPLOAD_PATH . $folder, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $path)) {
        return ['success' => true, 'path' => UPLOAD_URL . $folder . '/' . $filename];
    }
    return ['error' => 'Upload failed'];
}

function slugify($text) {
    $text = preg_replace('/[^a-z0-9]+/i', '-', strtolower($text));
    return trim($text, '-');
}

function generate_order_number() {
    return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
}

function generate_download_token() {
    return bin2hex(random_bytes(32));
}

function format_price($price) {
    return CURRENCY_SYMBOL . number_format($price, 2);
}

function format_date($date, $format = 'd M Y') {
    return date($format, strtotime($date));
}

function time_ago($datetime) {
    $time = strtotime($datetime);
    $diff = time() - $time;
    
    if ($diff < 60) return 'Just now';
    if ($diff < 3600) return floor($diff / 60) . ' min ago';
    if ($diff < 86400) return floor($diff / 3600) . ' hours ago';
    if ($diff < 604800) return floor($diff / 86400) . ' days ago';
    return format_date($datetime);
}

function sanitize_filename($filename) {
    $filename = preg_replace('/[^a-z0-9._-]/i', '_', $filename);
    return strtolower($filename);
}

function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_client_ip() {
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    }
    return $ip;
}

function log_activity($action, $description = null) {
    Database::insert('activity_log', [
        'user_id' => auth_id(),
        'action' => $action,
        'description' => $description,
        'ip_address' => get_client_ip(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
}

function get_settings($key, $default = null) {
    static $cache = [];
    if (isset($cache[$key])) {
        return $cache[$key];
    }
    $row = Database::fetch("SELECT setting_value FROM site_settings WHERE setting_key = ?", [$key]);
    if ($row) {
        $value = json_decode($row['setting_value'], true);
        $cache[$key] = $value;
        return $value;
    }
    return $default;
}

function update_setting($key, $value) {
    $json = is_array($value) ? json_encode($value) : $value;
    $exists = Database::fetch("SELECT id FROM site_settings WHERE setting_key = ?", [$key]);
    if ($exists) {
        Database::update('site_settings', ['setting_value' => $json], 'setting_key = ?', [$key]);
    } else {
        Database::insert('site_settings', ['setting_key' => $key, 'setting_value' => $json]);
    }
    return true;
}

function get_payment_config() {
    $settings = get_settings('payment_gateway', []);
    return $settings;
}

function get_cart_count() {
    $session_id = session_id_new();
    return (int)Database::count('cart', 'session_id = ?', [$session_id]);
}

function is_mobile() {
    return preg_match('/mobile|android|iphone|ipad|phone/i', $_SERVER['HTTP_USER_AGENT'] ?? '');
}
