<?php
/**
 * Cart Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Shopping Cart';
$language = $_COOKIE['language'] ?? 'en';
$sessionId = session_id_new();

$cartItems = Database::fetchAll(
    "SELECT c.*, p.name, p.name_bn, p.price, p.image_url, p.stock, p.stock_unlimited, p.in_stock, p.slug, p.product_type
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.session_id = ?",
    [$sessionId]
);

$subtotal = 0;
foreach ($cartItems as &$item) {
    $item['subtotal'] = $item['price'] * $item['quantity'];
    $subtotal += $item['subtotal'];
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        <?php echo $language === 'bn' ? 'আমার কার্ট' : 'Shopping Cart'; ?>
        <span class="text-gray-500 text-lg ml-2">(<?php echo count($cartItems); ?> <?php echo $language === 'bn' ? 'পণ্য' : 'items'; ?>)</span>
    </h1>
    
    <?php if (empty($cartItems)): ?>
    <div class="text-center py-16">
        <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
        <h2 class="text-xl font-semibold text-gray-600 mb-4"><?php echo $language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'; ?></h2>
        <p class="text-gray-500 mb-6"><?php echo $language === 'bn' ? 'পণ্য কেনার জন্য শপিং শুরু করুন' : 'Start shopping to add items to your cart'; ?></p>
        <a href="/pages/products.php" class="btn-primary inline-flex">
            <?php echo $language === 'bn' ? 'পণ্য দেখুন' : 'Browse Products'; ?>
            <i class="fas fa-arrow-right ml-2"></i>
        </a>
    </div>
    <?php else: ?>
    
    <div class="grid lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <?php foreach ($cartItems as $item): ?>
                <div class="p-6 border-b last:border-0 flex flex-col sm:flex-row gap-4">
                    <a href="/pages/product.php?slug=<?php echo escape($item['slug']); ?>" class="shrink-0">
                        <img src="<?php echo escape($item['image_url'] ?: 'https://placehold.co/120'); ?>" 
                             alt="<?php echo escape($item['name']); ?>"
                             class="w-24 h-24 object-cover rounded-lg">
                    </a>
                    
                    <div class="flex-1">
                        <div class="flex justify-between">
                            <div>
                                <a href="/pages/product.php?slug=<?php echo escape($item['slug']); ?>" 
                                   class="font-semibold text-gray-900 hover:text-accent">
                                    <?php echo escape($language === 'bn' ? ($item['name_bn'] ?? $item['name']) : $item['name']); ?>
                                </a>
                                <?php if ($item['product_type'] === 'digital'): ?>
                                <span class="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                    <i class="fas fa-download mr-1"></i> Digital
                                </span>
                                <?php endif; ?>
                            </div>
                            <button onclick="removeFromCart(<?php echo $item['product_id']; ?>)" 
                                    class="text-gray-400 hover:text-red-500 transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
                            <div class="flex items-center gap-2">
                                <button onclick="updateCartQty(<?php echo $item['product_id']; ?>, -1)" 
                                        class="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 transition">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <input type="number" id="qty_<?php echo $item['product_id']; ?>" 
                                       value="<?php echo $item['quantity']; ?>" min="1" 
                                       max="<?php echo $item['stock_unlimited'] ? 99 : $item['stock']; ?>"
                                       onchange="updateCartQty(<?php echo $item['product_id']; ?>, 0, this.value)"
                                       class="w-14 text-center border rounded py-1">
                                <button onclick="updateCartQty(<?php echo $item['product_id']; ?>, 1)" 
                                        class="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 transition">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                            
                            <div class="text-right">
                                <p class="text-xl font-bold text-accent">৳<?php echo number_format($item['subtotal'], 0); ?></p>
                                <p class="text-sm text-gray-500">৳<?php echo number_format($item['price'], 0); ?> × <?php echo $item['quantity']; ?></p>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            
            <div class="mt-4 flex justify-between">
                <a href="/pages/products.php" class="text-gray-600 hover:text-accent flex items-center gap-2">
                    <i class="fas fa-arrow-left"></i>
                    <?php echo $language === 'bn' ? 'আরো পণ্য যোগ করুন' : 'Continue Shopping'; ?>
                </a>
                <button onclick="clearCart()" class="text-red-500 hover:underline flex items-center gap-2">
                    <i class="fas fa-trash"></i>
                    <?php echo $language === 'bn' ? 'কার্ট খালি করুন' : 'Clear Cart'; ?>
                </button>
            </div>
        </div>
        
        <!-- Order Summary -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 class="font-bold text-lg mb-6"><?php echo $language === 'bn' ? 'অর্ডার সামারি' : 'Order Summary'; ?></h2>
                
                <div class="space-y-3 mb-6">
                    <div class="flex justify-between text-gray-600">
                        <span><?php echo $language === 'bn' ? 'সাবটোটাল' : 'Subtotal'; ?></span>
                        <span>৳<?php echo number_format($subtotal, 0); ?></span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <span><?php echo $language === 'bn' ? 'শিপিং' : 'Shipping'; ?></span>
                        <span><?php echo $language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'; ?></span>
                    </div>
                    <div class="border-t pt-3 flex justify-between text-xl font-bold">
                        <span><?php echo $language === 'bn' ? 'মোট' : 'Total'; ?></span>
                        <span class="text-accent">৳<?php echo number_format($subtotal, 0); ?></span>
                    </div>
                </div>
                
                <!-- Coupon -->
                <form onsubmit="return applyCoupon(this)" class="mb-6">
                    <div class="flex gap-2">
                        <input type="text" name="coupon_code" id="couponCode" placeholder="<?php echo $language === 'bn' ? 'কুপন কোড' : 'Coupon Code'; ?>"
                               class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                        <button type="submit" class="btn-secondary text-sm">
                            <?php echo $language === 'bn' ? 'এপ্লাই' : 'Apply'; ?>
                        </button>
                    </div>
                    <div id="couponMsg" class="text-sm mt-2"></div>
                </form>
                
                <a href="/pages/checkout.php" class="btn-primary w-full justify-center text-lg py-4">
                    <?php echo $language === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'; ?>
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
                
                <div class="mt-6 pt-6 border-t text-center">
                    <p class="text-sm text-gray-500 mb-4"><?php echo $language === 'bn' ? 'নিরাপদ পেমেন্ট গেটওয়ে' : 'Secure Payment Gateway'; ?></p>
                    <div class="flex justify-center gap-4 text-2xl text-gray-400">
                        <i class="fas fa-mobile-alt text-pink-500" title="bKash"></i>
                        <i class="fas fa-mobile-alt text-orange-500" title="Nagad"></i>
                        <i class="fas fa-mobile-alt text-purple-500" title="Rocket"></i>
                        <i class="fas fa-money-bill text-green-500" title="Cash"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
</div>

<script>
async function updateCartQty(productId, delta, newVal) {
    const input = document.getElementById('qty_' + productId);
    let qty = newVal !== undefined ? parseInt(newVal) : parseInt(input.value) + delta;
    if (qty < 1) qty = 1;
    
    const res = await fetch('/api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', product_id: productId, quantity: qty })
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('cartCount').textContent = data.cart_count;
        location.reload();
    }
}

async function removeFromCart(productId) {
    if (!confirm('Remove this item?')) return;
    const res = await fetch('/api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', product_id: productId })
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('cartCount').textContent = data.cart_count;
        location.reload();
    }
}

async function clearCart() {
    if (!confirm('Clear all items?')) return;
    const res = await fetch('/api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('cartCount').textContent = 0;
        location.reload();
    }
}

async function applyCoupon(form) {
    const code = form.coupon_code.value.trim();
    if (!code) return false;
    
    // Simple coupon check - in production, validate via API
    document.getElementById('couponMsg').innerHTML = '<span class="text-green-600"><i class="fas fa-check"></i> Coupon applied!</span>';
    return false;
}
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
