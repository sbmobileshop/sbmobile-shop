<?php
/**
 * Checkout Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Checkout';
$language = $_COOKIE['language'] ?? 'en';
$sessionId = session_id_new();
$paymentConfig = get_settings('payment_gateway', []);

$cartItems = Database::fetchAll(
    "SELECT c.*, p.name, p.name_bn, p.price, p.image_url, p.slug, p.product_type
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.session_id = ?",
    [$sessionId]
);

if (empty($cartItems)) {
    flash('error', 'Your cart is empty!');
    redirect('/pages/cart.php');
}

$subtotal = 0;
foreach ($cartItems as &$item) {
    $item['subtotal'] = $item['price'] * $item['quantity'];
    $subtotal += $item['subtotal'];
}

// Handle order submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $customerName = trim($_POST['customer_name'] ?? '');
    $customerEmail = trim($_POST['customer_email'] ?? '');
    $customerPhone = trim($_POST['customer_phone'] ?? '');
    $shippingAddress = trim($_POST['shipping_address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $postalCode = trim($_POST['postal_code'] ?? '');
    $paymentMethod = $_POST['payment_method'] ?? 'cod';
    $paymentNumber = trim($_POST['payment_number'] ?? '');
    $transactionId = trim($_POST['transaction_id'] ?? '');
    $notes = trim($_POST['notes'] ?? '');
    
    // Validation
    $errors = [];
    if (strlen($customerName) < 2) $errors[] = 'Name is required';
    if (strlen($customerPhone) < 11) $errors[] = 'Valid phone number required';
    if (empty($shippingAddress)) $errors[] = 'Shipping address required';
    
    if (empty($errors)) {
        $orderNumber = generate_order_number();
        
        // Calculate discount (placeholder)
        $discount = 0;
        $couponCode = null;
        
        $orderData = [
            'order_number' => $orderNumber,
            'user_id' => auth_id(),
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'customer_phone' => $customerPhone,
            'shipping_address' => $shippingAddress,
            'city' => $city,
            'postal_code' => $postalCode,
            'subtotal' => $subtotal,
            'shipping_cost' => 0,
            'discount' => $discount,
            'coupon_code' => $couponCode,
            'total' => $subtotal - $discount,
            'payment_method' => $paymentMethod,
            'payment_number' => $paymentNumber,
            'payment_transaction_id' => $transactionId,
            'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'pending',
            'order_status' => 'pending',
            'notes' => $notes,
        ];
        
        $orderId = Database::insert('orders', $orderData);
        
        // Insert order items
        foreach ($cartItems as $item) {
            Database::insert('order_items', [
                'order_id' => $orderId,
                'product_id' => $item['product_id'],
                'product_name' => $item['name'],
                'product_type' => $item['product_type'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['price'],
                'total' => $item['subtotal'],
            ]);
            
            // Update stock
            $product = Database::fetch("SELECT stock FROM products WHERE id = ?", [$item['product_id']]);
            if ($product && !$product['stock_unlimited']) {
                Database::update('products', ['stock' => $product['stock'] - $item['quantity']], 'id = ?', [$item['product_id']]);
            }
        }
        
        // Clear cart
        Database::delete('cart', 'session_id = ?', [$sessionId]);
        
        // Redirect to success page
        redirect('/pages/order-success.php?order=' . $orderNumber);
    }
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        <?php echo $language === 'bn' ? 'চেকআউট' : 'Checkout'; ?>
    </h1>
    
    <?php if (!empty($errors)): ?>
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        <ul class="list-disc list-inside">
            <?php foreach ($errors as $error): ?>
            <li><?php echo escape($error); ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php endif; ?>
    
    <form method="POST" class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
            <!-- Customer Info -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="font-bold text-lg mb-6 flex items-center gap-2">
                    <i class="fas fa-user text-accent"></i>
                    <?php echo $language === 'bn' ? 'কাস্টমার তথ্য' : 'Customer Information'; ?>
                </h2>
                
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'নাম *' : 'Full Name *'; ?></label>
                        <input type="text" name="customer_name" value="<?php echo escape(old('customer_name')); ?>" required
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                               placeholder="<?php echo $language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'; ?>">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'; ?></label>
                        <input type="tel" name="customer_phone" value="<?php echo escape(old('customer_phone')); ?>" required
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                               placeholder="01XXXXXXXXX">
                    </div>
                </div>
                
                <div class="mt-4">
                    <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'ইমেইল' : 'Email (Optional)'; ?></label>
                    <input type="email" name="customer_email" value="<?php echo escape(old('customer_email')); ?>"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                           placeholder="your@email.com">
                </div>
            </div>
            
            <!-- Shipping Address -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="font-bold text-lg mb-6 flex items-center gap-2">
                    <i class="fas fa-map-marker-alt text-accent"></i>
                    <?php echo $language === 'bn' ? 'শিপিং ঠিকানা' : 'Shipping Address'; ?>
                </h2>
                
                <div>
                    <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'সম্পূর্ণ ঠিকানা *' : 'Full Address *'; ?></label>
                    <textarea name="shipping_address" rows="3" required
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                              placeholder="<?php echo $language === 'bn' ? 'বাড়ি নং, রোড, এলাকা, থানা, জেলা' : 'House #, Road, Area, Thana, District'; ?>"><?php echo escape(old('shipping_address')); ?></textarea>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'শহর' : 'City'; ?></label>
                        <input type="text" name="city" value="<?php echo escape(old('city', 'Dhaka')); ?>"
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                               placeholder="Dhaka">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'পোস্টাল কোড' : 'Postal Code'; ?></label>
                        <input type="text" name="postal_code" value="<?php echo escape(old('postal_code')); ?>"
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                               placeholder="1000">
                    </div>
                </div>
            </div>
            
            <!-- Payment Method -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="font-bold text-lg mb-6 flex items-center gap-2">
                    <i class="fas fa-credit-card text-accent"></i>
                    <?php echo $language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'; ?>
                </h2>
                
                <div class="space-y-3">
                    <!-- bKash -->
                    <?php if ($paymentConfig['bkash']['enabled'] ?? false): ?>
                    <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-accent transition payment-option">
                        <input type="radio" name="payment_method" value="bkash" checked 
                               class="w-5 h-5 text-accent" onchange="togglePaymentFields()">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-12 h-12 bg-pink-500 text-white rounded-lg flex items-center justify-center">
                                <i class="fas fa-mobile-alt text-xl"></i>
                            </div>
                            <div>
                                <p class="font-semibold">bKash Payment</p>
                                <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'নম্বর:' : 'Number:'; ?> <?php echo escape($paymentConfig['bkash']['number'] ?? ''); ?></p>
                            </div>
                        </div>
                    </label>
                    <?php endif; ?>
                    
                    <!-- Nagad -->
                    <?php if ($paymentConfig['nagad']['enabled'] ?? false): ?>
                    <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-accent transition payment-option">
                        <input type="radio" name="payment_method" value="nagad" 
                               class="w-5 h-5 text-accent" onchange="togglePaymentFields()">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                                <i class="fas fa-mobile-alt text-xl"></i>
                            </div>
                            <div>
                                <p class="font-semibold">Nagad Payment</p>
                                <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'নম্বর:' : 'Number:'; ?> <?php echo escape($paymentConfig['nagad']['number'] ?? ''); ?></p>
                            </div>
                        </div>
                    </label>
                    <?php endif; ?>
                    
                    <!-- Rocket -->
                    <?php if ($paymentConfig['rocket']['enabled'] ?? false): ?>
                    <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-accent transition payment-option">
                        <input type="radio" name="payment_method" value="rocket" 
                               class="w-5 h-5 text-accent" onchange="togglePaymentFields()">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center">
                                <i class="fas fa-mobile-alt text-xl"></i>
                            </div>
                            <div>
                                <p class="font-semibold">Rocket Payment</p>
                                <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'নম্বর:' : 'Number:'; ?> <?php echo escape($paymentConfig['rocket']['number'] ?? ''); ?></p>
                            </div>
                        </div>
                    </label>
                    <?php endif; ?>
                    
                    <!-- Cash on Delivery -->
                    <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-accent transition payment-option">
                        <input type="radio" name="payment_method" value="cod" 
                               class="w-5 h-5 text-accent" onchange="togglePaymentFields()"
                               <?php echo (!$paymentConfig['bkash']['enabled'] && !$paymentConfig['nagad']['enabled'] && !$paymentConfig['rocket']['enabled']) ? 'checked' : ''; ?>>
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center">
                                <i class="fas fa-money-bill text-xl"></i>
                            </div>
                            <div>
                                <p class="font-semibold"><?php echo $language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'; ?></p>
                                <p class="text-sm text-gray-500"><?php echo $language === 'bn' ? 'পণ্য হাতে পেয়ে টাকা দিন' : 'Pay when you receive'; ?></p>
                            </div>
                        </div>
                    </label>
                </div>
                
                <!-- Payment Details -->
                <div id="paymentDetails" class="mt-4 hidden">
                    <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                        <p class="text-sm text-gray-600">
                            <?php echo $language === 'bn' ? 'অর্ডার কনফার্মেশনের জন্য পেমেন্ট করুন এবং নিচের ফর্মে ট্রানজেকশন আইডি দিন।' : 'Make payment and enter the transaction ID below to confirm your order.'; ?>
                        </p>
                        <div>
                            <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'পেমেন্ট নম্বর' : 'Payment Number (Send Money To)'; ?></label>
                            <input type="text" name="payment_number" id="paymentNumber"
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none font-mono">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2"><?php echo $language === 'bn' ? 'ট্রানজেকশন আইডি *' : 'Transaction ID *'; ?></label>
                            <input type="text" name="transaction_id" id="transactionId"
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none font-mono"
                                   placeholder="<?php echo $language === 'bn' ? 'আপনার ট্রানজেকশন আইডি' : 'Your transaction ID'; ?>">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Notes -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="font-bold text-lg mb-4"><?php echo $language === 'bn' ? 'অর্ডার নোট' : 'Order Notes (Optional)'; ?></h2>
                <textarea name="notes" rows="3" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                          placeholder="<?php echo $language === 'bn' ? 'অতিরিক্ত তথ্য...' : 'Any additional information...'; ?>"></textarea>
            </div>
        </div>
        
        <!-- Order Summary -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 class="font-bold text-lg mb-6"><?php echo $language === 'bn' ? 'আপনার অর্ডার' : 'Your Order'; ?></h2>
                
                <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    <?php foreach ($cartItems as $item): ?>
                    <div class="flex gap-3">
                        <img src="<?php echo escape($item['image_url'] ?: 'https://placehold.co/60'); ?>" 
                             alt="" class="w-14 h-14 object-cover rounded">
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-sm truncate"><?php echo escape($item['name']); ?></p>
                            <p class="text-xs text-gray-500"><?php echo $item['quantity']; ?> × ৳<?php echo number_format($item['price'], 0); ?></p>
                        </div>
                        <p class="font-semibold text-sm">৳<?php echo number_format($item['subtotal'], 0); ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
                
                <div class="border-t pt-4 space-y-2">
                    <div class="flex justify-between text-gray-600">
                        <span><?php echo $language === 'bn' ? 'সাবটোটাল' : 'Subtotal'; ?></span>
                        <span>৳<?php echo number_format($subtotal, 0); ?></span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <span><?php echo $language === 'bn' ? 'শিপিং' : 'Shipping'; ?></span>
                        <span><?php echo $language === 'bn' ? 'ডেলিভারি চার্জ আলাদা' : 'Charges apply'; ?></span>
                    </div>
                    <div class="border-t pt-3 flex justify-between text-xl font-bold">
                        <span><?php echo $language === 'bn' ? 'মোট' : 'Total'; ?></span>
                        <span class="text-accent">৳<?php echo number_format($subtotal, 0); ?></span>
                    </div>
                </div>
                
                <button type="submit" class="btn-primary w-full justify-center text-lg py-4 mt-6">
                    <i class="fas fa-check-circle mr-2"></i>
                    <?php echo $language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'; ?>
                </button>
                
                <p class="text-xs text-gray-500 text-center mt-4">
                    <?php echo $language === 'bn' ? 'অর্ডার করার মাধ্যমে আপনি আমাদের' : 'By placing order, you agree to our'; ?>
                    <a href="/pages/terms.php" class="text-accent hover:underline"><?php echo $language === 'bn' ? 'শর্তাবলী' : 'Terms of Service'; ?></a>
                    <?php echo $language === 'bn' ? 'এবং' : 'and'; ?>
                    <a href="/pages/privacy.php" class="text-accent hover:underline"><?php echo $language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'; ?></a>
                </p>
            </div>
        </div>
    </form>
</div>

<script>
const paymentConfig = <?php echo json_encode($paymentConfig); ?>;

function togglePaymentFields() {
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    const detailsDiv = document.getElementById('paymentDetails');
    const paymentNumber = document.getElementById('paymentNumber');
    
    if (method === 'cod') {
        detailsDiv.classList.add('hidden');
    } else {
        detailsDiv.classList.remove('hidden');
        
        if (method === 'bkash' && paymentConfig.bkash) {
            paymentNumber.value = paymentConfig.bkash.number || '';
        } else if (method === 'nagad' && paymentConfig.nagad) {
            paymentNumber.value = paymentConfig.nagad.number || '';
        } else if (method === 'rocket' && paymentConfig.rocket) {
            paymentNumber.value = paymentConfig.rocket.number || '';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', togglePaymentFields);
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
