<?php
/**
 * SB Mobile Shop - Configuration File
 * 
 * Edit these settings according to your cPanel hosting
 */

// Prevent direct access
if (!defined('SB_INSTALL')) {
    die('Direct access not allowed');
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'sb_mobile_shop');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');
define('DB_CHARSET', 'utf8mb4');

// Site Configuration
define('SITE_NAME', 'SB Mobile Shop');
define('SITE_URL', 'https://yourdomain.com');
define('SITE_EMAIL', 'info@yourdomain.com');

// Paths
define('ROOT_PATH', dirname(__DIR__) . '/');
define('INCLUDE_PATH', ROOT_PATH . 'includes/');
define('UPLOAD_PATH', ROOT_PATH . 'assets/uploads/');
define('UPLOAD_URL', SITE_URL . '/assets/uploads/');

// Session
define('SESSION_NAME', 'sb_mobile_session');
define('SESSION_LIFETIME', 86400 * 7); // 7 days

// Pagination
define('ITEMS_PER_PAGE', 12);

// Currency
define('CURRENCY_SYMBOL', '৳');
define('CURRENCY_CODE', 'BDT');

// Timezone
date_default_timezone_set('Asia/Dhaka');

// Error Reporting (Disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Memory Limit
ini_set('memory_limit', '256M');

// Max Upload Size
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB

// Allowed File Types
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_FILE_TYPES', ['application/pdf', 'application/zip', 'application/x-rar-compressed']);

// Encryption Key (Generate your own using: openssl_random_pseudo_bytes(32))
define('ENCRYPTION_KEY', 'your-32-character-encryption-key-here');
define('ENCRYPTION_CIPHER', 'AES-256-CBC');

// API Configuration
define('API_ENABLED', true);
define('API_RATE_LIMIT', 100); // requests per minute
