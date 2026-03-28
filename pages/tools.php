<?php
/**
 * Tools Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Free Web Tools';
$language = $_COOKIE['language'] ?? 'en';
$tools = get_settings('tools_list', []);
$siteInfo = get_settings('site_info', []);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <?php echo $language === 'bn' ? 'ফ্রি ওয়েব টুলস' : 'Free Web Tools'; ?>
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
            <?php echo $language === 'bn' 
                ? 'স্টুডেন্ট ও কাস্টমারদের জন্য দরকারী ফ্রি অনলাইন টুলস। কোনো রেজিস্ট্রেশন ছাড়াই ব্যবহার করুন।' 
                : 'Useful free online tools for students and customers. Use without registration.'; ?>
        </p>
    </div>
    
    <?php if (empty($tools)): ?>
    <div class="text-center py-16">
        <i class="fas fa-tools text-6xl text-gray-300 mb-4"></i>
        <h2 class="text-xl font-semibold text-gray-600 mb-4"><?php echo $language === 'bn' ? 'কোনো টুলস পাওয়া যায়নি' : 'No tools available yet'; ?></h2>
        <p class="text-gray-500"><?php echo $language === 'bn' ? 'শীঘ্রই নতুন টুলস যোগ করা হবে' : 'New tools will be added soon'; ?></p>
    </div>
    <?php else: ?>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <?php foreach ($tools as $tool): ?>
        <div class="tool-card group cursor-pointer" onclick="window.open('<?php echo escape($tool['link']); ?>', '_blank')">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i class="fas fa-wrench text-white text-2xl"></i>
            </div>
            <h3 class="font-bold text-lg text-gray-900 mb-2">
                <?php echo escape($language === 'bn' ? ($tool['title_bn'] ?? '') : $tool['title']); ?>
            </h3>
            <p class="text-sm text-gray-500 mb-4 min-h-[40px]">
                <?php echo $language === 'bn' ? 'ফ্রি অনলাইন টুল' : 'Free Online Tool'; ?>
            </p>
            <div class="flex items-center justify-center gap-3">
                <a href="<?php echo escape($tool['link']); ?>" target="_blank" rel="noopener" 
                   class="btn-primary text-sm px-4 py-2"
                   onclick="event.stopPropagation()">
                    <?php echo escape($language === 'bn' ? ($tool['button_text_bn'] ?? 'খুলুন') : ($tool['button_text'] ?? 'Open')); ?>
                    <i class="fas fa-external-link-alt ml-1"></i>
                </a>
                <button onclick="shareTool('<?php echo escape(addslashes($tool['title'])); ?>', '<?php echo escape($tool['link']); ?>')" 
                        class="p-2 border rounded-lg hover:bg-gray-100 transition"
                        title="Share">
                    <i class="fas fa-share-alt text-gray-600"></i>
                </button>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
    
    <!-- Contact CTA -->
    <div class="mt-16 bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4">
            <?php echo $language === 'bn' ? 'একটি টুল যোগ করতে চান?' : 'Want to Add a Tool?'; ?>
        </h2>
        <p class="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            <?php echo $language === 'bn' 
                ? 'আপনার নিজের টুল যোগ করতে চাইলে আমাদের সাথে যোগাযোগ করুন।'
                : 'Contact us if you want to add your own tool to this list.'; ?>
        </p>
        <?php if (!empty($siteInfo['whatsapp'])): ?>
        <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>" target="_blank"
           class="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
            <i class="fab fa-whatsapp text-xl"></i>
            <?php echo $language === 'bn' ? 'WhatsApp এ মেসেজ করুন' : 'Message on WhatsApp'; ?>
        </a>
        <?php endif; ?>
    </div>
</div>

<script>
function shareTool(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Check out this free tool: ' + title,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url);
        showToast('Link copied!', 'success');
    }
}
</script>

<style>
.tool-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid #e5e7eb;
}
.tool-card:hover {
    border-color: hsl(142 70% 45%);
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
}
.gradient-bg {
    background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%);
}
.btn-primary {
    background: hsl(142 70% 45%);
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
}
.btn-primary:hover {
    background: hsl(142 70% 40%);
}
</style>

<?php include __DIR__ . '/../includes/footer.php'; ?>
