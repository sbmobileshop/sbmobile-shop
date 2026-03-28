<?php
/**
 * Main Index Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Home';
$heroSettings = get_settings('hero_settings', []);
$sectionVisibility = get_settings('section_visibility', []);
$siteInfo = get_settings('site_info', []);
$paymentConfig = get_settings('payment_gateway', []);
$deliverySettings = get_settings('delivery_settings', []);
$language = $_COOKIE['language'] ?? 'en';

// Featured Products
$featuredProducts = Database::fetchAll("SELECT * FROM products WHERE featured = 1 AND status = 'active' AND in_stock = 1 LIMIT 8");

// Categories
$categories = Database::fetchAll("SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order ASC LIMIT 8");

// Tools
$tools = get_settings('tools_list', []);

// Services
$services = get_settings('services_list', []);

// Courses
$courses = get_settings('courses_list', []);

// FAQs
$faqs = Database::fetchAll("SELECT * FROM faq WHERE status = 'active' ORDER BY sort_order ASC LIMIT 6");

// Why Us features
$whyUs = [
    ['icon' => 'fa-truck', 'title' => 'Fast Delivery', 'title_bn' => 'দ্রুত ডেলিভারি', 'desc' => 'Get your products delivered quickly', 'desc_bn' => 'আপনার পণ্য দ্রুত পৌঁছে যাবে'],
    ['icon' => 'fa-shield-alt', 'title' => 'Secure Payment', 'title_bn' => 'নিরাপদ পেমেন্ট', 'desc' => '100% secure payment methods', 'desc_bn' => '১০০% নিরাপদ পেমেন্ট পদ্ধতি'],
    ['icon' => 'fa-headset', 'title' => '24/7 Support', 'title_bn' => '২৪/৭ সাপোর্ট', 'desc' => 'We are always here to help', 'desc_bn' => 'আমরা সবসময় সাহায্যের জন্য এখানে'],
    ['icon' => 'fa-undo', 'title' => 'Easy Returns', 'title_bn' => 'সহজ রিটার্ন', 'desc' => '7-day easy return policy', 'desc_bn' => '৭ দিনের সহজ রিটার্ন নীতি'],
];
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<!-- Hero Section -->
<?php if ($sectionVisibility['show_hero'] ?? true): ?>
<section class="hero-section relative overflow-hidden">
    <div class="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div class="max-w-3xl mx-auto text-center text-white">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 fade-in">
                <?php echo escape($heroSettings['hero_title'] ?? 'Welcome to Our Shop'); ?>
            </h1>
            <p class="text-xl md:text-2xl mb-4 opacity-90 fade-in" style="animation-delay: 0.1s">
                <?php echo escape($language === 'bn' ? ($heroSettings['hero_subtitle_bn'] ?? '') : ($heroSettings['hero_subtitle_en'] ?? '')); ?>
            </p>
            <p class="text-lg mb-8 opacity-80 fade-in" style="animation-delay: 0.2s">
                <?php echo escape($language === 'bn' ? ($heroSettings['hero_tagline_bn'] ?? '') : ($heroSettings['hero_tagline_en'] ?? '')); ?>
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center fade-in" style="animation-delay: 0.3s">
                <a href="<?php echo escape($heroSettings['hero_cta_link'] ?? '/pages/products.php'); ?>" 
                   class="btn-primary text-lg px-8 py-4 bg-white !text-primary hover:bg-gray-100">
                    <?php echo escape($language === 'bn' ? ($heroSettings['hero_cta_text_bn'] ?? 'Shop Now') : ($heroSettings['hero_cta_text_en'] ?? 'Shop Now')); ?>
                    <i class="fas fa-arrow-right"></i>
                </a>
                <a href="/pages/tools.php" class="btn-secondary text-lg px-8 py-4">
                    <?php echo $language === 'bn' ? 'ফ্রি টুলস' : 'Free Tools'; ?>
                    <i class="fas fa-tools"></i>
                </a>
            </div>
        </div>
    </div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
</section>
<?php endif; ?>

<!-- Featured Products -->
<?php if (($sectionVisibility['show_products'] ?? true) && !empty($featuredProducts)): ?>
<section class="py-16 px-4">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'জনপ্রিয় পণ্যসমূহ' : 'Featured Products'; ?>
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
                <?php echo $language === 'bn' ? 'সেরা মানের পণ্য সেরা দামে' : 'Best quality products at the best prices'; ?>
            </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <?php foreach ($featuredProducts as $product): ?>
            <div class="product-card group">
                <?php if ($product['old_price'] && $product['old_price'] > $product['price']): ?>
                <?php 
                $discount = round((($product['old_price'] - $product['price']) / $product['old_price']) * 100);
                ?>
                <span class="badge badge-sale absolute top-3 left-3 z-10">-<?php echo $discount; ?>%</span>
                <?php endif; ?>
                
                <div class="relative overflow-hidden">
                    <img src="<?php echo escape($product['image_url'] ?: 'https://placehold.co/400x400/213/fff?text=Product'); ?>" 
                         alt="<?php echo escape($product['name']); ?>"
                         class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500">
                    
                    <?php if ($product['product_type'] === 'digital'): ?>
                    <span class="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        <i class="fas fa-download mr-1"></i> Digital
                    </span>
                    <?php endif; ?>
                </div>
                
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                        <a href="/pages/product.php?slug=<?php echo escape($product['slug']); ?>" class="hover:text-accent transition">
                            <?php echo escape($language === 'bn' ? ($product['name_bn'] ?? $product['name']) : $product['name']); ?>
                        </a>
                    </h3>
                    
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xl font-bold text-accent">৳<?php echo number_format($product['price'], 0); ?></span>
                        <?php if ($product['old_price']): ?>
                        <span class="text-sm text-gray-400 line-through">৳<?php echo number_format($product['old_price'], 0); ?></span>
                        <?php endif; ?>
                    </div>
                    
                    <button onclick="addToCart(<?php echo $product['id']; ?>)" 
                            class="w-full btn-primary text-sm py-2 justify-center">
                        <i class="fas fa-cart-plus"></i>
                        <?php echo $language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'; ?>
                    </button>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="text-center mt-10">
            <a href="/pages/products.php" class="btn-secondary px-8 py-3">
                <?php echo $language === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'; ?>
                <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Categories -->
<?php if ($sectionVisibility['show_categories'] ?? true): ?>
<section class="py-16 px-4 bg-gray-100">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'ক্যাটাগরিসমূহ' : 'Categories'; ?>
            </h2>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <?php foreach ($categories as $cat): ?>
            <a href="/pages/products.php?category=<?php echo escape($cat['slug']); ?>" 
               class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition group">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center group-hover:scale-110 transition">
                    <i class="fas fa-mobile-alt text-white text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900">
                    <?php echo escape($language === 'bn' ? ($cat['name_bn'] ?? $cat['name']) : $cat['name']); ?>
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                    <?php 
                    $count = Database::count('products', 'category_id = ? AND status = ?', [$cat['id'], 'active']);
                    echo $count . ' ' . ($language === 'bn' ? 'পণ্য' : 'products');
                    ?>
                </p>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Delivery Section -->
<?php if ($sectionVisibility['show_delivery'] ?? true): ?>
<section class="py-16 px-4">
    <div class="container mx-auto">
        <div class="bg-gradient-to-r from-primary to-accent rounded-2xl overflow-hidden">
            <div class="flex flex-col md:flex-row items-center">
                <?php if (!empty($deliverySettings['image_url'])): ?>
                <div class="md:w-1/3">
                    <img src="<?php echo escape($deliverySettings['image_url']); ?>" alt="Delivery" class="w-full h-full object-cover">
                </div>
                <?php endif; ?>
                <div class="flex-1 p-8 md:p-12 text-white">
                    <h2 class="text-3xl font-bold mb-4">
                        <?php echo escape($language === 'bn' ? ($deliverySettings['title_bn'] ?? '') : ($deliverySettings['title_en'] ?? 'Home Delivery')); ?>
                    </h2>
                    <p class="text-lg opacity-90 mb-6">
                        <?php echo escape($language === 'bn' ? ($deliverySettings['desc_bn'] ?? '') : ($deliverySettings['desc_en'] ?? '')); ?>
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <a href="tel:<?php echo escape($deliverySettings['phone_primary'] ?? ''); ?>" 
                           class="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                            <i class="fas fa-phone"></i>
                            <?php echo escape($deliverySettings['phone_primary'] ?? ''); ?>
                        </a>
                        <a href="https://wa.me/<?php echo escape($deliverySettings['phone_bkash'] ?? ''); ?>" 
                           class="bg-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition flex items-center gap-2">
                            <i class="fas fa-mobile-alt"></i>
                            bKash: <?php echo escape($deliverySettings['phone_bkash'] ?? ''); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Payment Methods -->
<?php if ($sectionVisibility['show_payment'] ?? true): ?>
<section class="py-12 px-4 bg-gray-900">
    <div class="container mx-auto">
        <h3 class="text-center text-white text-xl font-semibold mb-8">
            <?php echo $language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Methods'; ?>
        </h3>
        <div class="flex flex-wrap justify-center gap-6 text-4xl text-gray-400">
            <?php if (($paymentConfig['bkash']['enabled'] ?? false) || !isset($paymentConfig['bkash'])): ?>
            <div class="text-center">
                <div class="text-pink-500"><i class="fas fa-mobile-alt"></i></div>
                <span class="text-sm text-gray-500 mt-2 block">bKash</span>
            </div>
            <?php endif; ?>
            <?php if ($paymentConfig['nagad']['enabled'] ?? false): ?>
            <div class="text-center">
                <div class="text-orange-500"><i class="fas fa-mobile-alt"></i></div>
                <span class="text-sm text-gray-500 mt-2 block">Nagad</span>
            </div>
            <?php endif; ?>
            <?php if ($paymentConfig['rocket']['enabled'] ?? false): ?>
            <div class="text-center">
                <div class="text-purple-500"><i class="fas fa-mobile-alt"></i></div>
                <span class="text-sm text-gray-500 mt-2 block">Rocket</span>
            </div>
            <?php endif; ?>
            <?php if ($paymentConfig['binance']['enabled'] ?? false): ?>
            <div class="text-center">
                <div class="text-yellow-500"><i class="fab fa-bitcoin"></i></div>
                <span class="text-sm text-gray-500 mt-2 block">Binance</span>
            </div>
            <?php endif; ?>
            <div class="text-center">
                <div class="text-green-500"><i class="fas fa-money-bill-wave"></i></div>
                <span class="text-sm text-gray-500 mt-2 block">Cash on Delivery</span>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Web Tools Section -->
<?php if (($sectionVisibility['show_tools'] ?? true) && !empty($tools)): ?>
<section class="py-16 px-4">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'ফ্রি ওয়েব টুলস' : 'Free Web Tools'; ?>
            </h2>
            <p class="text-gray-600">
                <?php echo $language === 'bn' ? 'স্টুডেন্ট ও কাস্টমারদের জন্য দরকারী টুলস' : 'Useful tools for students and customers'; ?>
            </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <?php foreach (array_slice($tools, 0, 8) as $tool): ?>
            <div class="tool-card">
                <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <i class="fas fa-wrench text-accent text-xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">
                    <?php echo escape($language === 'bn' ? ($tool['title_bn'] ?? '') : $tool['title']); ?>
                </h3>
                <a href="<?php echo escape($tool['link']); ?>" target="_blank" rel="noopener" 
                   class="inline-flex items-center gap-2 text-accent font-medium hover:underline">
                    <?php echo escape($language === 'bn' ? ($tool['button_text_bn'] ?? 'খুলুন') : ($tool['button_text'] ?? 'Open')); ?>
                    <i class="fas fa-external-link-alt text-sm"></i>
                </a>
            </div>
            <?php endforeach; ?>
        </div>
        
        <?php if (count($tools) > 8): ?>
        <div class="text-center mt-8">
            <a href="/pages/tools.php" class="btn-secondary px-8 py-3">
                <?php echo $language === 'bn' ? 'সব টুলস দেখুন' : 'View All Tools'; ?>
                <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
        <?php endif; ?>
    </div>
</section>
<?php endif; ?>

<!-- Services Section -->
<?php if (($sectionVisibility['show_services'] ?? true) && !empty($services)): ?>
<section class="py-16 px-4 bg-gray-100">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Our Services'; ?>
            </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <?php foreach (array_slice($services, 0, 4) as $service): ?>
            <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
                <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <i class="fas fa-cog text-white text-xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">
                    <?php echo escape($language === 'bn' ? ($service['title_bn'] ?? '') : $service['title']); ?>
                </h3>
                <p class="text-sm text-gray-600">
                    <?php echo escape($language === 'bn' ? ($service['desc_bn'] ?? '') : ($service['desc'] ?? '')); ?>
                </p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Why Us Section -->
<?php if ($sectionVisibility['show_why_us'] ?? true): ?>
<section class="py-16 px-4">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'কেন আমাদের বেছে নেবেন?' : 'Why Choose Us?'; ?>
            </h2>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <?php foreach ($whyUs as $item): ?>
            <div class="text-center">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <i class="fas <?php echo $item['icon']; ?> text-white text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">
                    <?php echo escape($language === 'bn' ? $item['title_bn'] : $item['title']); ?>
                </h3>
                <p class="text-sm text-gray-600">
                    <?php echo escape($language === 'bn' ? $item['desc_bn'] : $item['desc']); ?>
                </p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- FAQ Section -->
<section class="py-16 px-4 bg-gray-100">
    <div class="container mx-auto max-w-3xl">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions'; ?>
            </h2>
        </div>
        
        <div class="space-y-4">
            <?php foreach ($faqs as $index => $faq): ?>
            <div class="bg-white rounded-xl overflow-hidden" x-data="{ open: <?php echo $index === 0 ? 'true' : 'false'; ?> }">
                <button @click="open = !open" 
                        class="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition">
                    <span><?php echo escape($language === 'bn' ? ($faq['question_bn'] ?? '') : $faq['question']); ?></span>
                    <i class="fas fa-chevron-down transition-transform" :class="{ 'rotate-180': open }"></i>
                </button>
                <div x-show="open" x-collapse class="border-t border-gray-100">
                    <p class="p-5 text-gray-600">
                        <?php echo escape($language === 'bn' ? ($faq['answer_bn'] ?? '') : $faq['answer']); ?>
                    </p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- About Section -->
<?php if ($sectionVisibility['show_about'] ?? true): ?>
<section class="py-16 px-4">
    <div class="container mx-auto">
        <div class="flex flex-col md:flex-row items-center gap-12">
            <div class="md:w-1/2">
                <img src="<?php echo !empty($siteInfo['cover_image']) ? escape($siteInfo['cover_image']) : 'https://placehold.co/600x400/213/fff?text=About+Us'; ?>" 
                     alt="About Us" class="rounded-2xl shadow-xl">
            </div>
            <div class="md:w-1/2">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    <?php echo $language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'; ?>
                </h2>
                <p class="text-gray-600 mb-4 leading-relaxed">
                    <?php echo $language === 'bn' ? 'এসবি মোবাইল শপ বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন শপিং প্লাটফর্ম। আমরা সেরা মানের মোবাইল ফোন এবং এক্সেসরিজ সাশ্রয়ী মূল্যে সরবরাহ করি।' : 'SB Mobile Shop is one of the most trusted online shopping platforms in Bangladesh. We provide the best quality mobile phones and accessories at affordable prices.'; ?>
                </p>
                <p class="text-gray-600 mb-6">
                    <?php echo $language === 'bn' ? 'আমাদের লক্ষ্য হলো গ্রাহকদের সেরা পণ্য এবং সেবা প্রদান করা যা তাদের চাহিদা পূরণ করে।' : 'Our goal is to provide customers with the best products and services that meet their needs.'; ?>
                </p>
                <a href="/pages/about.php" class="btn-secondary">
                    <?php echo $language === 'bn' ? 'আরও জানুন' : 'Learn More'; ?>
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Contact Section -->
<?php if ($sectionVisibility['show_contact'] ?? true): ?>
<section class="py-16 px-4 bg-gray-900 text-white">
    <div class="container mx-auto">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
                <?php echo $language === 'bn' ? 'যোগাযোগ করুন' : 'Get In Touch'; ?>
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto">
                <?php echo $language === 'bn' ? 'যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন' : 'Contact us for any questions or support'; ?>
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <?php if (!empty($siteInfo['phone'])): ?>
            <div class="text-center p-6 bg-gray-800 rounded-xl">
                <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <i class="fas fa-phone text-white text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'ফোন' : 'Phone'; ?></h3>
                <a href="tel:<?php echo escape($siteInfo['phone']); ?>" class="text-accent hover:underline">
                    <?php echo escape($siteInfo['phone']); ?>
                </a>
            </div>
            <?php endif; ?>
            
            <?php if (!empty($siteInfo['whatsapp'])): ?>
            <div class="text-center p-6 bg-gray-800 rounded-xl">
                <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <i class="fab fa-whatsapp text-white text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2">WhatsApp</h3>
                <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>" target="_blank" class="text-accent hover:underline">
                    <?php echo escape($siteInfo['whatsapp']); ?>
                </a>
            </div>
            <?php endif; ?>
            
            <?php if (!empty($siteInfo['email'])): ?>
            <div class="text-center p-6 bg-gray-800 rounded-xl">
                <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <i class="fas fa-envelope text-white text-xl"></i>
                </div>
                <h3 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'ইমেইল' : 'Email'; ?></h3>
                <a href="mailto:<?php echo escape($siteInfo['email']); ?>" class="text-accent hover:underline">
                    <?php echo escape($siteInfo['email']); ?>
                </a>
            </div>
            <?php endif; ?>
        </div>
        
        <div class="text-center mt-10">
            <a href="/pages/contact.php" class="btn-primary bg-white !text-primary hover:bg-gray-100 px-8 py-3">
                <?php echo $language === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'; ?>
                <i class="fas fa-paper-plane ml-2"></i>
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Alpine.js for FAQ accordion -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
