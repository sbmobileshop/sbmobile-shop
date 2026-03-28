<?php
/**
 * Contact Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Contact Us';
$language = $_COOKIE['language'] ?? 'en';
$siteInfo = get_settings('site_info', []);
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle contact form submission
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    if ($name && $email && $message) {
        // In production, you would send email or save to database
        $success = true;
    }
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                <?php echo $language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'; ?>
            </h1>
            <p class="text-gray-600 max-w-2xl mx-auto">
                <?php echo $language === 'bn' 
                    ? 'যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় আপনার সাহায্যে প্রস্তুত।'
                    : 'Contact us for any questions or support. We are always ready to help you.'; ?>
            </p>
        </div>
        
        <?php if ($success): ?>
        <div class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-8 text-center">
            <i class="fas fa-check-circle text-4xl mb-3"></i>
            <h3 class="text-xl font-bold mb-2"><?php echo $language === 'bn' ? 'মেসেজ পাঠানো হয়েছে!' : 'Message Sent!'; ?></h3>
            <p><?php echo $language === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' : 'We will contact you shortly.'; ?></p>
        </div>
        <?php endif; ?>
        
        <div class="grid md:grid-cols-3 gap-8 mb-12">
            <!-- Phone -->
            <?php if (!empty($siteInfo['phone'])): ?>
            <a href="tel:<?php echo escape($siteInfo['phone']); ?>" class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition group">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center group-hover:scale-110 transition">
                    <i class="fas fa-phone text-white text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2"><?php echo $language === 'bn' ? 'ফোন' : 'Phone'; ?></h3>
                <p class="text-accent"><?php echo escape($siteInfo['phone']); ?></p>
            </a>
            <?php endif; ?>
            
            <!-- WhatsApp -->
            <?php if (!empty($siteInfo['whatsapp'])): ?>
            <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>" target="_blank" 
               class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition group">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition">
                    <i class="fab fa-whatsapp text-white text-3xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <p class="text-green-600"><?php echo escape($siteInfo['whatsapp']); ?></p>
            </a>
            <?php endif; ?>
            
            <!-- Email -->
            <?php if (!empty($siteInfo['email'])): ?>
            <a href="mailto:<?php echo escape($siteInfo['email']); ?>" 
               class="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition group">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center group-hover:scale-110 transition">
                    <i class="fas fa-envelope text-white text-2xl"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2"><?php echo $language === 'bn' ? 'ইমেইল' : 'Email'; ?></h3>
                <p class="text-accent"><?php echo escape($siteInfo['email']); ?></p>
            </a>
            <?php endif; ?>
        </div>
        
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
                <?php echo $language === 'bn' ? 'মেসেজ পাঠান' : 'Send Us a Message'; ?>
            </h2>
            
            <form method="POST" class="space-y-6 max-w-2xl mx-auto">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <?php echo $language === 'bn' ? 'আপনার নাম *' : 'Your Name *'; ?>
                        </label>
                        <input type="text" name="name" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="<?php echo $language === 'bn' ? 'পূর্ণ নাম' : 'Full name'; ?>">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <?php echo $language === 'bn' ? 'ইমেইল *' : 'Email *'; ?>
                        </label>
                        <input type="email" name="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="your@email.com">
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <?php echo $language === 'bn' ? 'ফোন' : 'Phone'; ?>
                        </label>
                        <input type="tel" name="phone"
                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="01XXXXXXXXX">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <?php echo $language === 'bn' ? 'বিষয়' : 'Subject'; ?>
                        </label>
                        <input type="text" name="subject"
                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="<?php echo $language === 'bn' ? 'মেসেজের বিষয়' : 'Message subject'; ?>">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'আপনার মেসেজ *' : 'Your Message *'; ?>
                    </label>
                    <textarea name="message" rows="5" required
                              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"
                              placeholder="<?php echo $language === 'bn' ? 'আপনার মেসেজ এখানে লিখুন...' : 'Write your message here...'; ?>"></textarea>
                </div>
                
                <button type="submit" class="w-full gradient-bg text-white py-4 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <i class="fas fa-paper-plane"></i>
                    <?php echo $language === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'; ?>
                </button>
            </form>
        </div>
        
        <!-- Address -->
        <?php if (!empty($siteInfo['address_en'])): ?>
        <div class="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <i class="fas fa-map-marker-alt text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2"><?php echo $language === 'bn' ? 'আমাদের ঠিকানা' : 'Our Address'; ?></h3>
            <p class="text-gray-600">
                <?php echo escape($language === 'bn' ? ($siteInfo['address_bn'] ?? '') : $siteInfo['address_en']); ?>
            </p>
            <?php if (!empty($footerSettings['google_maps_url'])): ?>
            <a href="<?php echo escape($footerSettings['google_maps_url']); ?>" target="_blank"
               class="inline-flex items-center gap-2 text-accent font-semibold mt-4 hover:underline">
                <i class="fas fa-external-link-alt"></i>
                <?php echo $language === 'bn' ? 'ম্যাপে দেখুন' : 'View on Map'; ?>
            </a>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
</div>

<style>
.gradient-bg {
    background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%);
}
</style>

<?php include __DIR__ . '/../includes/footer.php'; ?>
