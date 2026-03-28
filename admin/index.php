<?php
/**
 * Admin Index Page - Main Layout
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

require_admin();

$currentPage = $_GET['page'] ?? 'dashboard';
$user = auth_user();
$siteInfo = get_settings('site_info', []);
$shopName = $siteInfo['shop_name_en'] ?? 'Admin Panel';

// Stats
$stats = [
    'products' => Database::count('products', "status = 'active'"),
    'orders' => Database::count('orders'),
    'customers' => Database::count('users', "role = 'customer'"),
    'pending_orders' => Database::count('orders', "order_status = 'pending'"),
];

// Recent Orders
$recentOrders = Database::fetchAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");

// Recent Products
$recentProducts = Database::fetchAll("SELECT * FROM products ORDER BY created_at DESC LIMIT 5");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - <?php echo escape($shopName); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: 'hsl(213 50% 23%)',
                        accent: 'hsl(142 70% 45%)',
                    }
                }
            }
        }
    </script>
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%); }
        .sidebar-link { transition: all 0.3s ease; }
        .sidebar-link:hover, .sidebar-link.active { background: hsl(142 70% 45%); color: white; }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-900 text-white shrink-0 fixed h-full">
            <div class="p-6 border-b border-gray-800">
                <div class="flex items-center gap-3">
                    <?php if (!empty($siteInfo['logo_url'])): ?>
                    <img src="<?php echo escape($siteInfo['logo_url']); ?>" alt="" class="h-10 w-auto rounded">
                    <?php else: ?>
                    <div class="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                        <i class="fas fa-store text-white"></i>
                    </div>
                    <?php endif; ?>
                    <div>
                        <h1 class="font-bold">Admin</h1>
                        <p class="text-xs text-gray-400 truncate"><?php echo escape($shopName); ?></p>
                    </div>
                </div>
            </div>
            
            <nav class="p-4 space-y-1">
                <a href="?page=dashboard" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'dashboard' ? 'active' : ''; ?>">
                    <i class="fas fa-home w-5"></i> Dashboard
                </a>
                <a href="?page=products" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'products' ? 'active' : ''; ?>">
                    <i class="fas fa-box w-5"></i> Products
                </a>
                <a href="?page=categories" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'categories' ? 'active' : ''; ?>">
                    <i class="fas fa-folder w-5"></i> Categories
                </a>
                <a href="?page=orders" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'orders' ? 'active' : ''; ?>">
                    <i class="fas fa-shopping-bag w-5"></i> Orders
                    <?php if ($stats['pending_orders'] > 0): ?>
                    <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"><?php echo $stats['pending_orders']; ?></span>
                    <?php endif; ?>
                </a>
                <a href="?page=customers" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'customers' ? 'active' : ''; ?>">
                    <i class="fas fa-users w-5"></i> Customers
                </a>
                <a href="?page=coupons" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'coupons' ? 'active' : ''; ?>">
                    <i class="fas fa-ticket-alt w-5"></i> Coupons
                </a>
                
                <div class="border-t border-gray-700 my-4"></div>
                
                <a href="?page=tools" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'tools' ? 'active' : ''; ?>">
                    <i class="fas fa-tools w-5"></i> Web Tools
                </a>
                <a href="?page=services" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'services' ? 'active' : ''; ?>">
                    <i class="fas fa-cogs w-5"></i> Services
                </a>
                <a href="?page=courses" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'courses' ? 'active' : ''; ?>">
                    <i class="fas fa-graduation-cap w-5"></i> Courses
                </a>
                <a href="?page=faq" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'faq' ? 'active' : ''; ?>">
                    <i class="fas fa-question-circle w-5"></i> FAQ
                </a>
                
                <div class="border-t border-gray-700 my-4"></div>
                
                <a href="?page=settings" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg <?php echo $currentPage === 'settings' ? 'active' : ''; ?>">
                    <i class="fas fa-cog w-5"></i> Settings
                </a>
                <a href="/" target="_blank" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg">
                    <i class="fas fa-external-link-alt w-5"></i> View Site
                </a>
                <a href="/pages/logout.php" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white">
                    <i class="fas fa-sign-out-alt w-5"></i> Logout
                </a>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
            <!-- Top Bar -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">
                        <?php 
                        $pageTitles = [
                            'dashboard' => 'Dashboard',
                            'products' => 'Products',
                            'categories' => 'Categories',
                            'orders' => 'Orders',
                            'customers' => 'Customers',
                            'coupons' => 'Coupons',
                            'tools' => 'Web Tools',
                            'services' => 'Services',
                            'courses' => 'Courses',
                            'faq' => 'FAQ',
                            'settings' => 'Settings',
                        ];
                        echo $pageTitles[$currentPage] ?? 'Dashboard';
                        ?>
                    </h1>
                    <p class="text-gray-500 text-sm">Welcome back, <?php echo escape($user['name'] ?? 'Admin'); ?></p>
                </div>
                <div class="flex items-center gap-4">
                    <a href="/" target="_blank" class="text-gray-500 hover:text-accent">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <div class="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                        <?php echo strtoupper(substr($user['name'] ?? 'A', 0, 1)); ?>
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <?php include __DIR__ . '/admin-content.php'; ?>
        </main>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
</html>
