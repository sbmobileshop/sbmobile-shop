<?php
/**
 * Products Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

$pageTitle = 'Products';
$language = $_COOKIE['language'] ?? 'en';
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = ITEMS_PER_PAGE;
$offset = ($page - 1) * $perPage;

$categories = Database::fetchAll("SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order");
$selectedCategory = $_GET['category'] ?? '';
$searchQuery = $_GET['search'] ?? '';
$sortBy = $_GET['sort'] ?? 'newest';
$productType = $_GET['type'] ?? '';

$where = "p.status = 'active'";
$params = [];
$urlParams = [];

if ($selectedCategory) {
    $cat = Database::fetch("SELECT id FROM categories WHERE slug = ?", [$selectedCategory]);
    if ($cat) {
        $where .= " AND p.category_id = ?";
        $params[] = $cat['id'];
        $urlParams[] = 'category=' . $selectedCategory;
    }
}

if ($productType) {
    $where .= " AND p.product_type = ?";
    $params[] = $productType;
    $urlParams[] = 'type=' . $productType;
}

if ($searchQuery) {
    $search = '%' . $searchQuery . '%';
    $where .= " AND (p.name LIKE ? OR p.name_bn LIKE ?)";
    $params[] = $search;
    $params[] = $search;
    $urlParams[] = 'search=' . urlencode($searchQuery);
}

$orderBy = 'p.featured DESC, p.created_at DESC';
switch ($sortBy) {
    case 'price_asc':
        $orderBy = 'p.price ASC';
        break;
    case 'price_desc':
        $orderBy = 'p.price DESC';
        break;
    case 'name_asc':
        $orderBy = 'p.name ASC';
        break;
    case 'newest':
        $orderBy = 'p.created_at DESC';
        break;
}
$urlParams[] = 'sort=' . $sortBy;

$total = Database::count('products p', $where, $params);
$totalPages = ceil($total / $perPage);

$sql = "SELECT p.*, c.name as category_name, c.name_bn as category_name_bn 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE {$where} 
        ORDER BY {$orderBy} 
        LIMIT {$perPage} OFFSET {$offset}";

$products = Database::fetchAll($sql, $params);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="text-sm mb-6">
        <a href="/" class="text-gray-500 hover:text-accent">Home</a>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-900">Products</span>
        <?php if ($selectedCategory): ?>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-900"><?php echo escape($selectedCategory); ?></span>
        <?php endif; ?>
    </nav>
    
    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:w-64 shrink-0">
            <div class="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 class="font-bold text-lg mb-4">Filters</h3>
                
                <!-- Search -->
                <form method="GET" class="mb-6">
                    <?php if ($selectedCategory): ?>
                    <input type="hidden" name="category" value="<?php echo escape($selectedCategory); ?>">
                    <?php endif; ?>
                    <div class="relative">
                        <input type="text" name="search" value="<?php echo escape($searchQuery); ?>" 
                               placeholder="Search products..." 
                               class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button type="submit" class="hidden">Search</button>
                </form>
                
                <!-- Categories -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 flex items-center gap-2">
                        <i class="fas fa-folder text-accent"></i>
                        Categories
                    </h4>
                    <ul class="space-y-2">
                        <li>
                            <a href="/pages/products.php?<?php echo http_build_query(array_filter(['sort' => $sortBy, 'type' => $productType])); ?>" 
                               class="block px-3 py-2 rounded-lg <?php echo !$selectedCategory ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                                All Products
                            </a>
                        </li>
                        <?php foreach ($categories as $cat): ?>
                        <li>
                            <a href="/pages/products.php?category=<?php echo escape($cat['slug']); ?>&sort=<?php echo escape($sortBy); ?><?php echo $productType ? '&type=' . escape($productType) : ''; ?>" 
                               class="block px-3 py-2 rounded-lg <?php echo $selectedCategory === $cat['slug'] ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                                <?php echo escape($language === 'bn' ? ($cat['name_bn'] ?? $cat['name']) : $cat['name']); ?>
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                
                <!-- Product Type -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 flex items-center gap-2">
                        <i class="fas fa-box text-accent"></i>
                        Type
                    </h4>
                    <ul class="space-y-2">
                        <li>
                            <a href="/pages/products.php?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'sort' => $sortBy, 'search' => $searchQuery])); ?>" 
                               class="block px-3 py-2 rounded-lg <?php echo !$productType ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                                All Types
                            </a>
                        </li>
                        <li>
                            <a href="/pages/products.php?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'sort' => $sortBy, 'type' => 'physical', 'search' => $searchQuery])); ?>" 
                               class="block px-3 py-2 rounded-lg <?php echo $productType === 'physical' ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                                <i class="fas fa-box mr-2"></i> Physical
                            </a>
                        </li>
                        <li>
                            <a href="/pages/products.php?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'sort' => $sortBy, 'type' => 'digital', 'search' => $searchQuery])); ?>" 
                               class="block px-3 py-2 rounded-lg <?php echo $productType === 'digital' ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                                <i class="fas fa-download mr-2"></i> Digital
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- Clear Filters -->
                <?php if ($selectedCategory || $searchQuery || $productType): ?>
                <a href="/pages/products.php" class="text-red-500 text-sm hover:underline">
                    <i class="fas fa-times mr-1"></i> Clear Filters
                </a>
                <?php endif; ?>
            </div>
        </aside>
        
        <!-- Products Grid -->
        <div class="flex-1">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">
                        <?php 
                        if ($selectedCategory) {
                            $catData = Database::fetch("SELECT name, name_bn FROM categories WHERE slug = ?", [$selectedCategory]);
                            echo escape($language === 'bn' ? ($catData['name_bn'] ?? '') : ($catData['name'] ?? 'Products'));
                        } else {
                            echo $language === 'bn' ? 'সব পণ্যসমূহ' : 'All Products';
                        }
                        ?>
                    </h1>
                    <p class="text-gray-500 text-sm mt-1">
                        <?php echo $total; ?> <?php echo $language === 'bn' ? 'পণ্য পাওয়া গেছে' : 'products found'; ?>
                    </p>
                </div>
                
                <div class="flex items-center gap-4">
                    <!-- Sort -->
                    <select onchange="window.location.href=this.value" class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none">
                        <option value="?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'type' => $productType, 'search' => $searchQuery, 'sort' => 'newest'])); ?>" <?php echo $sortBy === 'newest' ? 'selected' : ''; ?>>Newest</option>
                        <option value="?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'type' => $productType, 'search' => $searchQuery, 'sort' => 'price_asc'])); ?>" <?php echo $sortBy === 'price_asc' ? 'selected' : ''; ?>>Price: Low to High</option>
                        <option value="?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'type' => $productType, 'search' => $searchQuery, 'sort' => 'price_desc'])); ?>" <?php echo $sortBy === 'price_desc' ? 'selected' : ''; ?>>Price: High to Low</option>
                        <option value="?<?php echo http_build_query(array_filter(['category' => $selectedCategory, 'type' => $productType, 'search' => $searchQuery, 'sort' => 'name_asc'])); ?>" <?php echo $sortBy === 'name_asc' ? 'selected' : ''; ?>>Name: A-Z</option>
                    </select>
                </div>
            </div>
            
            <?php if (empty($products)): ?>
            <div class="text-center py-16">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your filters or search query</p>
                <a href="/pages/products.php" class="btn-primary mt-4 inline-flex">
                    View All Products
                </a>
            </div>
            <?php else: ?>
            
            <!-- Products Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <?php foreach ($products as $product): ?>
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
                        
                        <?php if (!$product['in_stock']): ?>
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Out of Stock
                            </span>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="p-4">
                        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                            <a href="/pages/product.php?slug=<?php echo escape($product['slug']); ?>" class="hover:text-accent transition">
                                <?php echo escape($language === 'bn' ? ($product['name_bn'] ?? $product['name']) : $product['name']); ?>
                            </a>
                        </h3>
                        
                        <p class="text-xs text-gray-500 mb-2">
                            <?php echo escape($language === 'bn' ? ($product['category_name_bn'] ?? '') : ($product['category_name'] ?? '')); ?>
                        </p>
                        
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl font-bold text-accent">৳<?php echo number_format($product['price'], 0); ?></span>
                            <?php if ($product['old_price']): ?>
                            <span class="text-sm text-gray-400 line-through">৳<?php echo number_format($product['old_price'], 0); ?></span>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($product['in_stock'] || $product['stock_unlimited']): ?>
                        <button onclick="addToCart(<?php echo $product['id']; ?>)" 
                                class="w-full btn-primary text-sm py-2 justify-center">
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                        <?php else: ?>
                        <button disabled class="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed">
                            Out of Stock
                        </button>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Pagination -->
            <?php if ($totalPages > 1): ?>
            <div class="flex justify-center mt-10">
                <nav class="flex items-center gap-2">
                    <?php if ($page > 1): ?>
                    <a href="?page=<?php echo $page - 1; ?><?php echo $urlParams ? '&' . implode('&', $urlParams) : ''; ?>" 
                       class="px-4 py-2 border rounded-lg hover:bg-gray-100">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                    <?php endif; ?>
                    
                    <?php
                    $start = max(1, $page - 2);
                    $end = min($totalPages, $page + 2);
                    if ($start > 1) echo '<span class="px-2">...</span>';
                    for ($i = $start; $i <= $end; $i++):
                    ?>
                    <a href="?page=<?php echo $i; ?><?php echo $urlParams ? '&' . implode('&', $urlParams) : ''; ?>" 
                       class="px-4 py-2 border rounded-lg <?php echo $i === $page ? 'bg-accent text-white' : 'hover:bg-gray-100'; ?>">
                        <?php echo $i; ?>
                    </a>
                    <?php endfor; ?>
                    <?php if ($end < $totalPages) echo '<span class="px-2">...</span>'; ?>
                    
                    <?php if ($page < $totalPages): ?>
                    <a href="?page=<?php echo $page + 1; ?><?php echo $urlParams ? '&' . implode('&', $urlParams) : ''; ?>" 
                       class="px-4 py-2 border rounded-lg hover:bg-gray-100">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                    <?php endif; ?>
                </nav>
            </div>
            <?php endif; ?>
            
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
