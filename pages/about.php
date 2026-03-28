<?php
/**
 * About Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'About Us';
$language = $_COOKIE['language'] ?? 'en';
$siteInfo = get_settings('site_info', []);
$footerSettings = get_settings('footer_settings', []);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
        <!-- Hero -->
        <div class="text-center mb-16">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'; ?>
            </h1>
            <p class="text-gray-600 max-w-2xl mx-auto">
                <?php echo $language === 'bn' 
                    ? 'সেরা মানের পণ্য এবং সেবা প্রদান করতে আমরা প্রতিশ্রুতিবদ্ধ।' 
                    : 'We are committed to providing the best quality products and services.'; ?>
            </p>
        </div>
        
        <!-- Content -->
        <div class="grid md:grid-cols-2 gap-12 mb-16">
            <div>
                <img src="<?php echo !empty($siteInfo['cover_image']) ? escape($siteInfo['cover_image']) : 'https://placehold.co/600x400/213/fff?text=About+Us'; ?>" 
                     alt="About Us" class="rounded-2xl shadow-lg w-full">
            </div>
            <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    <?php echo $language === 'bn' ? 'আমাদের গল্প' : 'Our Story'; ?>
                </h2>
                <div class="space-y-4 text-gray-600">
                    <p>
                        <?php echo $language === 'bn' 
                            ? 'এসবি মোবাইল শপ বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন শপিং প্লাটফর্ম যা ২০২০ সালে প্রতিষ্ঠিত হয়েছিল। আমরা সেরা মানের মোবাইল ফোন এবং এক্সেসরিজ সাশ্রয়ী মূল্যে সরবরাহ করি।'
                            : 'SB Mobile Shop is one of the most trusted online shopping platforms in Bangladesh, established in 2020. We provide the best quality mobile phones and accessories at affordable prices.'; ?>
                    </p>
                    <p>
                        <?php echo $language === 'bn' 
                            ? 'আমাদের লক্ষ্য হলো গ্রাহকদের সেরা পণ্য এবং সেবা প্রদান করা যা তাদের চাহিদা পূরণ করে। আমরা প্রতিটি পণ্য সাবধানে বাছাই করি এবং নিশ্চিত করি যে এগুলো সর্বোচ্চ মানের।'
                            : 'Our goal is to provide customers with the best products and services that meet their needs. We carefully select each product and ensure they are of the highest quality.'; ?>
                    </p>
                    <p>
                        <?php echo $language === 'bn' 
                            ? 'আমরা শুধু পণ্য বিক্রি করি না, আমরা সম্প্রদায় গড়ে তুলি। আমাদের ফ্রি ওয়েব টুলস এবং কোর্সের মাধ্যমে আমরা শিক্ষার্থীদের এবং পেশাদারদের সাহায্য করি।'
                            : 'We not only sell products, we build a community. Through our free web tools and courses, we help students and professionals alike.'; ?>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Mission & Vision -->
        <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div class="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-white">
                <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <i class="fas fa-bullseye text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4"><?php echo $language === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'; ?></h3>
                <p class="opacity-90">
                    <?php echo $language === 'bn' 
                        ? 'গ্রাহকদের সেরা মানের পণ্য সেরা দামে প্রদান করা এবং অসাধারণ গ্রাহক সেবা নিশ্চিত করা।'
                        : 'To provide customers with the best quality products at the best prices and ensure exceptional customer service.'; ?>
                </p>
            </div>
            <div class="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
                <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <i class="fas fa-eye text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4"><?php echo $language === 'bn' ? 'আমাদের দৃষ্টি' : 'Our Vision'; ?></h3>
                <p class="opacity-90">
                    <?php echo $language === 'bn' 
                        ? 'বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্লাটফর্ম হওয়া যেখানে গ্রাহকরা নিশ্চিত থাকেন তারা সেরা পণ্য পাচ্ছেন।'
                        : 'To become Bangladesh\'s most trusted online shopping platform where customers can be confident they are getting the best products.'; ?>
                </p>
            </div>
        </div>
        
        <!-- Why Choose Us -->
        <div class="mb-16">
            <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">
                <?php echo $language === 'bn' ? 'কেন আমাদের বেছে নেবেন?' : 'Why Choose Us?'; ?>
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                        <i class="fas fa-truck text-white text-xl"></i>
                    </div>
                    <h4 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'; ?></h4>
                    <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'সারাদেশে দ্রুত পৌঁছে যাবে' : 'Quick delivery across the country'; ?></p>
                </div>
                <div class="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <h4 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure Payment'; ?></h4>
                    <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? '১০০% নিরাপদ লেনদেন' : '100% secure transactions'; ?></p>
                </div>
                <div class="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                        <i class="fas fa-headset text-white text-xl"></i>
                    </div>
                    <h4 class="font-semibold mb-2"><?php echo $language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'; ?></h4>
                    <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'সবসময় সাহায্যের জন্য' : 'Always here to help'; ?></p>
                </div>
                <div class="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                        <i class="fas fa-undo text-white text-xl"></i>
                    </div>
                    <h4 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'সহজ রিটার্ন' : 'Easy Returns'; ?></h4>
                    <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? '৭ দিনের মধ্যে রিটার্ন' : 'Return within 7 days'; ?></p>
                </div>
            </div>
        </div>
        
        <!-- CTA -->
        <div class="bg-gray-900 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">
                <?php echo $language === 'bn' ? 'আজই শপিং শুরু করুন!' : 'Start Shopping Today!'; ?>
            </h2>
            <p class="text-gray-300 mb-6">
                <?php echo $language === 'bn' 
                    ? 'সেরা পণ্য এবং অফার পেতে আমাদের সাথে যোগ দিন।'
                    : 'Join us to get the best products and offers.'; ?>
            </p>
            <a href="/pages/products.php" class="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
                <?php echo $language === 'bn' ? 'পণ্য দেখুন' : 'Browse Products'; ?>
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    </div>
</div>

<style>
.gradient-bg {
    background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%);
}
</style>

<?php include __DIR__ . '/../includes/footer.php'; ?>
