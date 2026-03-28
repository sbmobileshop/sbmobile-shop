<?php
/**
 * Order Success Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Order Confirmed';
$language = $_COOKIE['language'] ?? 'en';
$orderNumber = $_GET['order'] ?? '';

$order = Database::fetch("SELECT * FROM orders WHERE order_number = ?", [$orderNumber]);
$siteInfo = get_settings('site_info', []);

if (!$order) {
    redirect('/');
}
?>
<!DOCTYPE html>
<html lang="<?php echo $language === 'bn' ? 'bn' : 'en'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo escape($pageTitle); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { font-family: 'Inter', sans-serif; }
        @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
        }
        .checkmark { animation: checkmark 0.5s ease forwards; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Success Icon -->
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-16 h-16 text-green-500 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
            <?php echo $language === 'bn' ? 'অর্ডার সফল হয়েছে!' : 'Order Confirmed!'; ?>
        </h1>
        
        <p class="text-gray-600 mb-6">
            <?php echo $language === 'bn' 
                ? 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।' 
                : 'Your order has been successfully placed. We will contact you shortly.'; ?>
        </p>
        
        <!-- Order Details -->
        <div class="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <div class="flex justify-between items-center mb-4 pb-4 border-b">
                <span class="text-gray-500"><?php echo $language === 'bn' ? 'অর্ডার নম্বর' : 'Order Number'; ?></span>
                <span class="font-bold text-lg"><?php echo escape($order['order_number']); ?></span>
            </div>
            <div class="flex justify-between items-center mb-4">
                <span class="text-gray-500"><?php echo $language === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'; ?></span>
                <span class="font-bold text-xl text-accent">৳<?php echo number_format($order['total'], 0); ?></span>
            </div>
            <div class="flex justify-between items-center mb-4">
                <span class="text-gray-500"><?php echo $language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'; ?></span>
                <span class="font-medium"><?php echo escape(ucfirst($order['payment_method'])); ?></span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-500"><?php echo $language === 'bn' ? 'অর্ডার স্ট্যাটাস' : 'Order Status'; ?></span>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    <?php echo ucfirst($order['order_status']); ?>
                </span>
            </div>
        </div>
        
        <?php if ($order['payment_method'] !== 'cod'): ?>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p class="text-blue-700 text-sm">
                <i class="fas fa-info-circle mr-2"></i>
                <?php echo $language === 'bn' 
                    ? 'আপনার অর্ডার প্রসেসিং হবে পেমেন্ট ভেরিফাই হওয়ার পর। যদি ২৪ ঘন্টার মধ্যে আপনার অর্ডার প্রসেস না হয়, তাহলে আমাদের সাথে যোগাযোগ করুন।' 
                    : 'Your order will be processed after payment verification. If your order is not processed within 24 hours, please contact us.'; ?>
            </p>
        </div>
        <?php endif; ?>
        
        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
            <a href="/" class="flex-1 btn-primary justify-center py-3">
                <i class="fas fa-home mr-2"></i>
                <?php echo $language === 'bn' ? 'হোম পেজে যান' : 'Back to Home'; ?>
            </a>
            <?php if (!empty($siteInfo['whatsapp'])): ?>
            <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>?text=<?php echo urlencode('My order: ' . $order['order_number']); ?>" 
               target="_blank" 
               class="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                <i class="fab fa-whatsapp"></i>
                <?php echo $language === 'bn' ? 'WhatsApp এ মেসেজ' : 'Message on WhatsApp'; ?>
            </a>
            <?php endif; ?>
        </div>
    </div>
    
    <style>
        .btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary:hover { background: hsl(142 70% 40%); }
        .text-accent { color: hsl(142 70% 45%); }
    </style>
</body>
</html>
