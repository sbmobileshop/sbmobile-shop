<?php
/**
 * Header Template
 */
$siteInfo = get_settings('site_info', []);
$heroSettings = get_settings('hero_settings', []);
$bannerOffers = get_settings('banner_offers', []);
$themeSettings = get_settings('theme_settings', []);
$primary = isset($themeSettings['custom_colors']['primary']) ? $themeSettings['custom_colors']['primary'] : '213 50% 23%';
$accent = isset($themeSettings['custom_colors']['accent']) ? $themeSettings['custom_colors']['accent'] : '142 70% 45%';
$shopName = $siteInfo['shop_name_en'] ?? 'SB Mobile Shop';
$shopNameBn = $siteInfo['shop_name_bn'] ?? 'এসবি মোবাইল শপ';
$phone = $siteInfo['phone'] ?? '';
$logoUrl = $siteInfo['logo_url'] ?? '';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
$language = $_COOKIE['language'] ?? 'en';
?>
<!DOCTYPE html>
<html lang="<?php echo $language === 'bn' ? 'bn' : 'en'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="SB Mobile Shop">
    
    <?php if (isset($pageTitle)): ?>
    <title><?php echo escape($pageTitle); ?> - <?php echo escape($shopName); ?></title>
    <?php else: ?>
    <title><?php echo escape($shopName); ?></title>
    <?php endif; ?>
    
    <?php if (isset($metaDescription)): ?>
    <meta name="description" content="<?php echo escape($metaDescription); ?>">
    <?php endif; ?>
    
    <?php if (isset($ogImage)): ?>
    <meta property="og:image" content="<?php echo escape($ogImage); ?>">
    <?php elseif (!empty($siteInfo['og_image'])): ?>
    <meta property="og:image" content="<?php echo escape($siteInfo['og_image']); ?>">
    <?php endif; ?>
    
    <meta property="og:title" content="<?php echo escape($shopName); ?>">
    <meta property="og:description" content="<?php echo escape($siteInfo['shop_name_bn'] ?? 'Your trusted online store'); ?>">
    <meta property="og:type" content="website">
    
    <link rel="icon" type="image/x-icon" href="<?php echo !empty($siteInfo['favicon']) ? escape($siteInfo['favicon']) : asset('favicon.ico'); ?>">
    <link rel="apple-touch-icon" href="<?php echo !empty($siteInfo['logo_url']) ? escape($siteInfo['logo_url']) : asset('logo.png'); ?>">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: 'hsl(<?php echo $primary; ?>)',
                        accent: 'hsl(<?php echo $accent; ?>)',
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        * { font-family: 'Inter', 'Hind Siliguri', sans-serif; }
        [lang="bn"] * { font-family: 'Hind Siliguri', sans-serif; }
        
        .gradient-bg {
            background: linear-gradient(135deg, hsl(<?php echo $primary; ?>) 0%, hsl(<?php echo $accent; ?>) 100%);
        }
        
        .hero-section {
            background: linear-gradient(135deg, hsl(<?php echo $primary; ?>/0.9) 0%, hsl(<?php echo $accent; ?>/0.8) 100%),
                        url('<?php echo $heroSettings['hero_bg_url'] ?? ''; ?>') center/cover;
        }
        
        .tool-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }
        
        .tool-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            border-color: hsl(<?php echo $accent; ?>);
        }
        
        .product-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
            background: hsl(<?php echo $accent; ?>);
            color: white;
            padding: 0.625rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary:hover {
            background: hsl(<?php echo $accent; ?> / 0.9);
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: hsl(<?php echo $primary; ?>);
            color: white;
            padding: 0.625rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-secondary:hover {
            background: hsl(<?php echo $primary; ?> / 0.9);
        }
        
        .nav-link {
            position: relative;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: hsl(<?php echo $accent; ?>);
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
            width: 80%;
        }
        
        .notice-board {
            background: hsl(<?php echo $accent; ?>);
            color: white;
            padding: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge-sale {
            background: #ef4444;
            color: white;
        }
        
        .badge-new {
            background: hsl(<?php echo $accent; ?>);
            color: white;
        }
        
        .badge-hot {
            background: #f59e0b;
            color: white;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
        
        .scroll-smooth {
            scroll-behavior: smooth;
        }
        
        .card-shadow {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .card-shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .mobile-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: white;
                z-index: 100;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            
            .mobile-menu.active {
                transform: translateX(0);
            }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">
    
    <?php if ($bannerOffers['banner_enabled'] ?? false): ?>
    <div class="notice-board">
        <i class="fas fa-bullhorn animate-pulse"></i>
        <span class="text-sm font-medium">
            <?php echo escape($language === 'bn' ? ($bannerOffers['banner_text_bn'] ?? '') : ($bannerOffers['banner_text_en'] ?? '')); ?>
        </span>
    </div>
    <?php endif; ?>
    
    <?php if ($bannerOffers['notice_enabled'] ?? false): ?>
    <div class="bg-yellow-500 text-white py-2 px-4 text-center text-sm">
        <i class="fas fa-info-circle mr-2"></i>
        <?php echo escape($language === 'bn' ? ($bannerOffers['notice_text_bn'] ?? '') : ($bannerOffers['notice_text_en'] ?? '')); ?>
    </div>
    <?php endif; ?>
    
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <!-- Top Bar -->
            <div class="hidden md:flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <div class="flex items-center gap-4 text-gray-600">
                    <a href="tel:<?php echo escape($phone); ?>" class="hover:text-accent">
                        <i class="fas fa-phone mr-1"></i> <?php echo escape($phone); ?>
                    </a>
                </div>
                <div class="flex items-center gap-4">
                    <a href="#" onclick="toggleLanguage()" class="hover:text-accent">
                        <i class="fas fa-globe mr-1"></i> 
                        <?php echo $language === 'bn' ? 'English' : 'বাংলা'; ?>
                    </a>
                </div>
            </div>
            
            <!-- Main Nav -->
            <nav class="flex items-center justify-between py-4">
                <a href="/" class="flex items-center gap-3">
                    <?php if (!empty($logoUrl)): ?>
                    <img src="<?php echo escape($logoUrl); ?>" alt="<?php echo escape($shopName); ?>" class="h-10 w-auto">
                    <?php else: ?>
                    <div class="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                        <i class="fas fa-store text-white text-lg"></i>
                    </div>
                    <?php endif; ?>
                    <div>
                        <h1 class="font-bold text-lg text-gray-900"><?php echo escape($shopName); ?></h1>
                        <?php if ($language === 'bn'): ?>
                        <p class="text-xs text-gray-500"><?php echo escape($shopNameBn); ?></p>
                        <?php endif; ?>
                    </div>
                </a>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-8">
                    <a href="/" class="nav-link <?php echo $currentPage === 'index' ? 'active text-accent' : 'text-gray-700'; ?>">
                        Home
                    </a>
                    <a href="/pages/products.php" class="nav-link <?php echo $currentPage === 'products' ? 'active text-accent' : 'text-gray-700'; ?>">
                        Products
                    </a>
                    <a href="/pages/tools.php" class="nav-link <?php echo $currentPage === 'tools' ? 'active text-accent' : 'text-gray-700'; ?>">
                        Tools
                    </a>
                    <a href="/pages/about.php" class="nav-link <?php echo $currentPage === 'about' ? 'active text-accent' : 'text-gray-700'; ?>">
                        About
                    </a>
                    <a href="/pages/contact.php" class="nav-link <?php echo $currentPage === 'contact' ? 'active text-accent' : 'text-gray-700'; ?>">
                        Contact
                    </a>
                </div>
                
                <div class="flex items-center gap-4">
                    <!-- Search -->
                    <button onclick="toggleSearch()" class="p-2 hover:bg-gray-100 rounded-full">
                        <i class="fas fa-search text-gray-600"></i>
                    </button>
                    
                    <!-- Cart -->
                    <a href="/pages/cart.php" class="p-2 hover:bg-gray-100 rounded-full relative">
                        <i class="fas fa-shopping-cart text-gray-600"></i>
                        <span id="cartCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            <?php echo get_cart_count(); ?>
                        </span>
                    </a>
                    
                    <!-- User -->
                    <?php if (auth_check()): ?>
                    <div class="relative group">
                        <button class="p-2 hover:bg-gray-100 rounded-full">
                            <i class="fas fa-user text-gray-600"></i>
                        </button>
                        <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div class="p-3 border-b">
                                <p class="font-semibold text-sm"><?php echo escape(auth_user()['name'] ?? ''); ?></p>
                                <p class="text-xs text-gray-500"><?php echo escape(auth_user()['email'] ?? ''); ?></p>
                            </div>
                            <a href="/pages/account.php" class="block px-4 py-2 text-sm hover:bg-gray-50">
                                <i class="fas fa-user-circle mr-2"></i> My Account
                            </a>
                            <a href="/pages/orders.php" class="block px-4 py-2 text-sm hover:bg-gray-50">
                                <i class="fas fa-box mr-2"></i> My Orders
                            </a>
                            <?php if (is_admin()): ?>
                            <a href="/admin" class="block px-4 py-2 text-sm hover:bg-gray-50 text-accent">
                                <i class="fas fa-cog mr-2"></i> Admin Panel
                            </a>
                            <?php endif; ?>
                            <a href="/pages/logout.php" class="block px-4 py-2 text-sm hover:bg-gray-50 text-red-500">
                                <i class="fas fa-sign-out-alt mr-2"></i> Logout
                            </a>
                        </div>
                    </div>
                    <?php else: ?>
                    <a href="/pages/login.php" class="btn-primary text-sm py-2">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <?php endif; ?>
                    
                    <!-- Mobile Menu Toggle -->
                    <button onclick="toggleMobileMenu()" class="md:hidden p-2 hover:bg-gray-100 rounded-full">
                        <i class="fas fa-bars text-gray-600"></i>
                    </button>
                </div>
            </nav>
        </div>
    </header>
    
    <!-- Mobile Menu -->
    <div id="mobileMenu" class="mobile-menu md:hidden">
        <div class="p-4 border-b flex items-center justify-between">
            <span class="font-bold text-lg">Menu</span>
            <button onclick="toggleMobileMenu()" class="p-2">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="p-4 space-y-2">
            <a href="/" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-home mr-3"></i> Home
            </a>
            <a href="/pages/products.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-shopping-bag mr-3"></i> Products
            </a>
            <a href="/pages/tools.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-tools mr-3"></i> Tools
            </a>
            <a href="/pages/about.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-info-circle mr-3"></i> About
            </a>
            <a href="/pages/contact.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-envelope mr-3"></i> Contact
            </a>
            <?php if (!auth_check()): ?>
            <a href="/pages/login.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-accent">
                <i class="fas fa-sign-in-alt mr-3"></i> Login
            </a>
            <a href="/pages/register.php" class="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium">
                <i class="fas fa-user-plus mr-3"></i> Register
            </a>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Search Modal -->
    <div id="searchModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-start pt-20 px-4">
        <div class="bg-white rounded-xl w-full max-w-2xl mx-auto p-4 fade-in">
            <div class="flex items-center gap-4">
                <i class="fas fa-search text-gray-400"></i>
                <input type="text" id="searchInput" placeholder="Search products..." 
                       class="flex-1 outline-none text-lg" onkeyup="handleSearch(event)">
                <button onclick="toggleSearch()" class="p-2 hover:bg-gray-100 rounded-full">
                    <i class="fas fa-times text-gray-400"></i>
                </button>
            </div>
            <div id="searchResults" class="mt-4 max-h-96 overflow-y-auto"></div>
        </div>
    </div>
    
    <main class="flex-1">
