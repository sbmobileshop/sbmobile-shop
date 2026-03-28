<?php
/**
 * Product Detail Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$slug = $_GET['slug'] ?? '';
$language = $_COOKIE['language'] ?? 'en';

$product = Database::fetch(
    "SELECT p.*, c.name as category_name, c.name_bn as category_name_bn 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.slug = ? AND p.status = 'active'", 
    [$slug]
);

if (!$product) {
    header("HTTP/1.0 404 Not Found");
    $pageTitle = 'Product Not Found';
    include __DIR__ . '/../includes/header.php';
    ?>
    <div class="container mx-auto px-4 py-20 text-center">
        <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p class="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <a href="/pages/products.php" class="btn-primary">Browse Products</a>
    </div>
    <?php include __DIR__ . '/../includes/footer.php';
    exit;
}

$pageTitle = $product['name'];
$metaDescription = strip_tags($product['description'] ?? '');

// Gallery images
$gallery = json_decode($product['gallery'] ?? '[]', true);
if (!is_array($gallery)) $gallery = [];

// Specifications
$specifications = json_decode($product['specifications'] ?? '{}', true);
if (!is_array($specifications)) $specifications = [];

// Reviews
$reviews = Database::fetchAll(
    "SELECT * FROM product_reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC LIMIT 5",
    [$product['id']]
);

$avgRating = 0;
if (!empty($reviews)) {
    $totalRating = array_sum(array_column($reviews, 'rating'));
    $avgRating = round($totalRating / count($reviews), 1);
}

// Related products
$relatedProducts = Database::fetchAll(
    "SELECT * FROM products WHERE category_id = ? AND id != ? AND status = 'active' ORDER BY RAND() LIMIT 4",
    [$product['category_id'], $product['id']]
);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="text-sm mb-6">
        <a href="/" class="text-gray-500 hover:text-accent">Home</a>
        <span class="mx-2 text-gray-400">/</span>
        <a href="/pages/products.php" class="text-gray-500 hover:text-accent">Products</a>
        <span class="mx-2 text-gray-400">/</span>
        <?php if ($product['category_slug']): ?>
        <a href="/pages/products.php?category=<?php echo escape($product['category_slug']); ?>" class="text-gray-500 hover:text-accent">
            <?php echo escape($language === 'bn' ? ($product['category_name_bn'] ?? '') : ($product['category_name'] ?? '')); ?>
        </a>
        <span class="mx-2 text-gray-400">/</span>
        <?php endif; ?>
        <span class="text-gray-900"><?php echo escape($product['name']); ?></span>
    </nav>
    
    <div class="grid lg:grid-cols-2 gap-10">
        <!-- Product Images -->
        <div>
            <div class="bg-white rounded-xl overflow-hidden shadow-sm">
                <img id="mainImage" src="<?php echo escape($product['image_url'] ?: 'https://placehold.co/600x600/213/fff?text=Product'); ?>" 
                     alt="<?php echo escape($product['name']); ?>" 
                     class="w-full aspect-square object-cover">
            </div>
            
            <?php if (!empty($gallery) || $product['image_url']): ?>
            <div class="flex gap-3 mt-4 overflow-x-auto pb-2">
                <?php if ($product['image_url']): ?>
                <button onclick="changeImage('<?php echo escape($product['image_url']); ?>')" 
                        class="thumb-image w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition shrink-0">
                    <img src="<?php echo escape($product['image_url']); ?>" alt="" class="w-full h-full object-cover">
                </button>
                <?php endif; ?>
                <?php foreach ($gallery as $img): ?>
                <button onclick="changeImage('<?php echo escape($img); ?>')" 
                        class="thumb-image w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition shrink-0">
                    <img src="<?php echo escape($img); ?>" alt="" class="w-full h-full object-cover">
                </button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- Product Info -->
        <div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <!-- Badges -->
                <div class="flex flex-wrap gap-2 mb-4">
                    <?php if ($product['product_type'] === 'digital'): ?>
                    <span class="badge bg-purple-500 text-white">
                        <i class="fas fa-download mr-1"></i> Digital Product
                    </span>
                    <?php endif; ?>
                    <?php if ($product['featured']): ?>
                    <span class="badge badge-hot">Featured</span>
                    <?php endif; ?>
                    <?php if ($product['old_price'] && $product['old_price'] > $product['price']): ?>
                    <?php 
                    $discount = round((($product['old_price'] - $product['price']) / $product['old_price']) * 100);
                    ?>
                    <span class="badge badge-sale">-<?php echo $discount; ?>% OFF</span>
                    <?php endif; ?>
                </div>
                
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    <?php echo escape($language === 'bn' ? ($product['name_bn'] ?? $product['name']) : $product['name']); ?>
                </h1>
                
                <!-- Rating -->
                <div class="flex items-center gap-2 mb-4">
                    <div class="flex text-yellow-400">
                        <?php for ($i = 1; $i <= 5; $i++): ?>
                        <i class="fas fa-star <?php echo $i <= round($avgRating) ? '' : 'text-gray-300'; ?>"></i>
                        <?php endfor; ?>
                    </div>
                    <span class="text-gray-600">(<?php echo count($reviews); ?> <?php echo $language === 'bn' ? 'রিভিউ' : 'reviews'; ?>)</span>
                </div>
                
                <!-- Price -->
                <div class="mb-6">
                    <span class="text-3xl font-bold text-accent">৳<?php echo number_format($product['price'], 0); ?></span>
                    <?php if ($product['old_price']): ?>
                    <span class="text-lg text-gray-400 line-through ml-3">৳<?php echo number_format($product['old_price'], 0); ?></span>
                    <?php endif; ?>
                </div>
                
                <!-- Stock Status -->
                <div class="flex items-center gap-2 mb-6">
                    <?php if ($product['in_stock'] || $product['stock_unlimited']): ?>
                    <span class="flex items-center gap-2 text-green-600">
                        <i class="fas fa-check-circle"></i>
                        <?php echo $language === 'bn' ? 'স্টকে আছে' : 'In Stock'; ?>
                        <?php if (!$product['stock_unlimited']): ?>
                        (<?php echo $product['stock']; ?> <?php echo $language === 'bn' ? 'পিস' : 'pcs'; ?>)
                        <?php endif; ?>
                    </span>
                    <?php else: ?>
                    <span class="flex items-center gap-2 text-red-600">
                        <i class="fas fa-times-circle"></i>
                        <?php echo $language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'; ?>
                    </span>
                    <?php endif; ?>
                </div>
                
                <!-- SKU -->
                <?php if ($product['sku']): ?>
                <p class="text-sm text-gray-500 mb-4">
                    <i class="fas fa-barcode mr-1"></i> SKU: <?php echo escape($product['sku']); ?>
                </p>
                <?php endif; ?>
                
                <!-- Description -->
                <div class="mb-6">
                    <h3 class="font-semibold mb-2"><?php echo $language === 'bn' ? 'বিবরণ' : 'Description'; ?></h3>
                    <div class="text-gray-600 text-sm leading-relaxed">
                        <?php echo nl2br(escape($language === 'bn' ? ($product['description_bn'] ?? '') : ($product['description'] ?? ''))); ?>
                    </div>
                </div>
                
                <!-- Add to Cart -->
                <?php if ($product['in_stock'] || $product['stock_unlimited']): ?>
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                    <div class="flex items-center border rounded-lg">
                        <button onclick="updateQty(-1)" class="px-4 py-3 hover:bg-gray-100 transition">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="quantity" value="1" min="1" max="<?php echo $product['stock_unlimited'] ? 99 : $product['stock']; ?>" 
                               class="w-16 text-center border-x py-3 outline-none">
                        <button onclick="updateQty(1)" class="px-4 py-3 hover:bg-gray-100 transition">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <button onclick="addToCartWithQty(<?php echo $product['id']; ?>)" class="flex-1 btn-primary justify-center text-lg py-4">
                        <i class="fas fa-cart-plus"></i>
                        <?php echo $language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'; ?>
                    </button>
                    
                    <button onclick="buyNow(<?php echo $product['id']; ?>)" class="btn-secondary justify-center text-lg py-4">
                        <?php echo $language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'; ?>
                    </button>
                </div>
                <?php else: ?>
                <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <?php echo $language === 'bn' ? 'এই পণ্যটি স্টকে নেই' : 'This product is currently out of stock'; ?>
                </div>
                <?php endif; ?>
                
                <!-- Share -->
                <div class="flex items-center gap-4 pt-4 border-t">
                    <span class="text-gray-600 text-sm"><?php echo $language === 'bn' ? 'শেয়ার করুন:' : 'Share:'; ?></span>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode(SITE_URL . '/pages/product.php?slug=' . $product['slug']); ?>" 
                       target="_blank" class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://wa.me/?text=<?php echo urlencode($product['name'] . ' - ' . SITE_URL . '/pages/product.php?slug=' . $product['slug']); ?>" 
                       target="_blank" class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Specifications -->
    <?php if (!empty($specifications)): ?>
    <div class="mt-10">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
            <?php echo $language === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'; ?>
        </h2>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <?php foreach ($specifications as $key => $value): ?>
                <tr class="border-b last:border-0">
                    <td class="px-6 py-4 font-semibold text-gray-700 w-1/3"><?php echo escape($key); ?></td>
                    <td class="px-6 py-4 text-gray-600"><?php echo escape($value); ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
    </div>
    
    <!-- Reviews -->
    <div class="mt-10">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
            <?php echo $language === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews'; ?>
            <?php if ($avgRating > 0): ?>
            <span class="text-sm font-normal text-gray-500">(<?php echo $avgRating; ?> / 5)</span>
            <?php endif; ?>
        </h2>
        
        <?php if (!empty($reviews)): ?>
        <div class="space-y-4">
            <?php foreach ($reviews as $review): ?>
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-semibold"><?php echo escape($review['customer_name']); ?></h4>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="flex text-yellow-400 text-sm">
                                <?php for ($i = 1; $i <= 5; $i++): ?>
                                <i class="fas fa-star <?php echo $i <= $review['rating'] ? '' : 'text-gray-300'; ?>"></i>
                                <?php endfor; ?>
                            </div>
                            <span class="text-xs text-gray-500"><?php echo time_ago($review['created_at']); ?></span>
                        </div>
                    </div>
                </div>
                <?php if ($review['review_text']): ?>
                <p class="text-gray-600"><?php echo escape($review['review_text']); ?></p>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <div class="text-center py-10 bg-gray-50 rounded-xl">
            <i class="fas fa-comment-dots text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500"><?php echo $language === 'bn' ? 'এখনো কোনো রিভিউ নেই' : 'No reviews yet'; ?></p>
        </div>
        <?php endif; ?>
        
        <!-- Write Review -->
        <div class="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <h3 class="font-semibold mb-4"><?php echo $language === 'bn' ? 'রিভিউ লিখুন' : 'Write a Review'; ?></h3>
            <form action="/api/review.php" method="POST" id="reviewForm">
                <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <input type="text" name="customer_name" required placeholder="Your Name" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                    <input type="tel" name="customer_phone" placeholder="Phone (optional)" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div class="mb-4">
                    <label class="block mb-2 font-medium"><?php echo $language === 'bn' ? 'রেটিং' : 'Rating'; ?></label>
                    <div class="flex gap-2">
                        <?php for ($i = 1; $i <= 5; $i++): ?>
                        <button type="button" onclick="setRating(<?php echo $i; ?>)" 
                                class="rating-btn text-2xl text-gray-300 hover:text-yellow-400 transition">
                            <i class="fas fa-star"></i>
                        </button>
                        <?php endfor; ?>
                    </div>
                    <input type="hidden" name="rating" id="ratingInput" value="5">
                </div>
                <textarea name="review_text" rows="4" placeholder="Your review..." 
                          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent outline-none mb-4"></textarea>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-paper-plane mr-2"></i>
                    <?php echo $language === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review'; ?>
                </button>
            </form>
        </div>
    </div>
    <?php endif; ?>
    
    <!-- Related Products -->
    <?php if (!empty($relatedProducts)): ?>
    <div class="mt-10">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
            <?php echo $language === 'bn' ? 'সম্পর্কিত পণ্য' : 'Related Products'; ?>
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <?php foreach ($relatedProducts as $rel): ?>
            <div class="product-card group">
                <div class="relative overflow-hidden">
                    <img src="<?php echo escape($rel['image_url'] ?: 'https://placehold.co/400x400'); ?>" 
                         alt="<?php echo escape($rel['name']); ?>"
                         class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <a href="/pages/product.php?slug=<?php echo escape($rel['slug']); ?>" class="hover:text-accent">
                            <?php echo escape($rel['name']); ?>
                        </a>
                    </h3>
                    <span class="text-lg font-bold text-accent">৳<?php echo number_format($rel['price'], 0); ?></span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>
</div>

<script>
function changeImage(src) {
    document.getElementById('mainImage').src = src;
}

function updateQty(delta) {
    const input = document.getElementById('quantity');
    let val = parseInt(input.value) + delta;
    const max = parseInt(input.max);
    if (val < 1) val = 1;
    if (max && val > max) val = max;
    input.value = val;
}

function addToCartWithQty(productId) {
    const qty = parseInt(document.getElementById('quantity').value);
    addToCart(productId, qty);
}

function buyNow(productId) {
    const qty = parseInt(document.getElementById('quantity').value);
    fetch('/api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', product_id: productId, quantity: qty })
    }).then(() => window.location.href = '/pages/checkout.php');
}

function setRating(rating) {
    document.getElementById('ratingInput').value = rating;
    document.querySelectorAll('.rating-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i < rating);
        btn.classList.toggle('text-gray-300', i >= rating);
    });
}

// Handle review form
document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    try {
        const res = await fetch('/api/review.php', {
            method: 'POST',
            body: data
        });
        const result = await res.json();
        if (result.success) {
            showToast('Review submitted successfully!', 'success');
            form.reset();
            setRating(5);
        } else {
            showToast(result.message || 'Failed to submit review', 'error');
        }
    } catch (e) {
        showToast('Error submitting review', 'error');
    }
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
