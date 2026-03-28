<?php
/**
 * Admin Content - All Admin Pages
 */

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'save_product':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            $data = [
                'name' => trim($_POST['name'] ?? ''),
                'name_bn' => trim($_POST['name_bn'] ?? ''),
                'slug' => trim($_POST['slug'] ?? '') ?: slugify($_POST['name'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
                'description_bn' => trim($_POST['description_bn'] ?? ''),
                'price' => (float)($_POST['price'] ?? 0),
                'old_price' => !empty($_POST['old_price']) ? (float)$_POST['old_price'] : null,
                'product_type' => $_POST['product_type'] ?? 'physical',
                'category_id' => (int)($_POST['category_id'] ?? 0) ?: null,
                'brand' => trim($_POST['brand'] ?? ''),
                'sku' => trim($_POST['sku'] ?? ''),
                'stock' => (int)($_POST['stock'] ?? 0),
                'stock_unlimited' => isset($_POST['stock_unlimited']) ? 1 : 0,
                'in_stock' => isset($_POST['in_stock']) ? 1 : 0,
                'featured' => isset($_POST['featured']) ? 1 : 0,
                'image_url' => trim($_POST['image_url'] ?? ''),
                'gallery' => json_encode(array_filter(explode("\n", $_POST['gallery'] ?? ''))),
                'meta_title' => trim($_POST['meta_title'] ?? ''),
                'meta_description' => trim($_POST['meta_description'] ?? ''),
                'og_image' => trim($_POST['og_image'] ?? ''),
                'specifications' => json_encode(array_filter($_POST['spec_key'] ?? [])),
                'status' => $_POST['status'] ?? 'active',
            ];
            
            if ($id > 0) {
                $data['updated_at'] = date('Y-m-d H:i:s');
                Database::update('products', $data, 'id = ?', [$id]);
                flash('success', 'Product updated successfully!');
            } else {
                Database::insert('products', $data);
                flash('success', 'Product added successfully!');
            }
            redirect('/admin/?page=products');
            break;
            
        case 'delete_product':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                Database::update('products', ['status' => 'inactive'], 'id = ?', [$id]);
                flash('success', 'Product deleted!');
            }
            redirect('/admin/?page=products');
            break;
            
        case 'save_category':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            $data = [
                'name' => trim($_POST['name'] ?? ''),
                'name_bn' => trim($_POST['name_bn'] ?? ''),
                'slug' => trim($_POST['slug'] ?? '') ?: slugify($_POST['name'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
                'image' => trim($_POST['image'] ?? ''),
                'sort_order' => (int)($_POST['sort_order'] ?? 0),
                'status' => $_POST['status'] ?? 'active',
            ];
            
            if ($id > 0) {
                Database::update('categories', $data, 'id = ?', [$id]);
            } else {
                Database::insert('categories', $data);
            }
            flash('success', 'Category saved!');
            redirect('/admin/?page=categories');
            break;
            
        case 'save_coupon':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            $data = [
                'code' => strtoupper(trim($_POST['code'] ?? '')),
                'description' => trim($_POST['description'] ?? ''),
                'discount_type' => $_POST['discount_type'] ?? 'percentage',
                'discount_value' => (float)($_POST['discount_value'] ?? 0),
                'min_order_amount' => !empty($_POST['min_order_amount']) ? (float)$_POST['min_order_amount'] : null,
                'max_discount' => !empty($_POST['max_discount']) ? (float)$_POST['max_discount'] : null,
                'usage_limit' => !empty($_POST['usage_limit']) ? (int)$_POST['usage_limit'] : null,
                'start_date' => !empty($_POST['start_date']) ? $_POST['start_date'] : null,
                'end_date' => !empty($_POST['end_date']) ? $_POST['end_date'] : null,
                'is_active' => isset($_POST['is_active']) ? 1 : 0,
            ];
            
            if ($id > 0) {
                Database::update('coupons', $data, 'id = ?', [$id]);
            } else {
                Database::insert('coupons', $data);
            }
            flash('success', 'Coupon saved!');
            redirect('/admin/?page=coupons');
            break;
            
        case 'update_order_status':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            $status = $_POST['order_status'] ?? 'pending';
            Database::update('orders', [
                'order_status' => $status,
                'admin_notes' => trim($_POST['admin_notes'] ?? ''),
            ], 'id = ?', [$id]);
            flash('success', 'Order status updated!');
            redirect('/admin/?page=orders');
            break;
            
        case 'save_setting':
            require_admin();
            $key = trim($_POST['setting_key'] ?? '');
            $value = $_POST['setting_value'] ?? '';
            if (is_array($value)) {
                $value = json_encode($value);
            }
            if ($key) {
                update_setting($key, $value);
                flash('success', 'Setting saved!');
            }
            redirect('/admin/?page=settings');
            break;
            
        case 'save_tool':
            require_admin();
            $id = (int)($_POST['id'] ?? 0);
            $tools = get_settings('tools_list', []);
            $tool = [
                'title' => trim($_POST['title'] ?? ''),
                'title_bn' => trim($_POST['title_bn'] ?? ''),
                'link' => trim($_POST['link'] ?? ''),
                'icon' => $_POST['icon'] ?? 'Wrench',
                'button_text' => trim($_POST['button_text'] ?? 'Open'),
                'button_text_bn' => trim($_POST['button_text_bn'] ?? 'খুলুন'),
            ];
            
            if ($id > 0 && isset($tools[$id - 1])) {
                $tools[$id - 1] = $tool;
            } else {
                $tools[] = $tool;
            }
            update_setting('tools_list', $tools);
            flash('success', 'Tool saved!');
            redirect('/admin/?page=tools');
            break;
            
        case 'delete_tool':
            require_admin();
            $id = (int)($_GET['id'] ?? 0);
            $tools = get_settings('tools_list', []);
            if (isset($tools[$id - 1])) {
                array_splice($tools, $id - 1, 1);
                update_setting('tools_list', $tools);
            }
            redirect('/admin/?page=tools');
            break;
    }
}

switch ($currentPage):
    // ========================================
    // DASHBOARD
    // ========================================
    case 'dashboard':
?>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Total Products</p>
                <p class="text-3xl font-bold text-gray-900"><?php echo $stats['products']; ?></p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-box text-blue-600 text-xl"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Total Orders</p>
                <p class="text-3xl font-bold text-gray-900"><?php echo $stats['orders']; ?></p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-shopping-bag text-green-600 text-xl"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Customers</p>
                <p class="text-3xl font-bold text-gray-900"><?php echo $stats['customers']; ?></p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-purple-600 text-xl"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Pending Orders</p>
                <p class="text-3xl font-bold text-red-600"><?php echo $stats['pending_orders']; ?></p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i class="fas fa-clock text-red-600 text-xl"></i>
            </div>
        </div>
    </div>
</div>

<div class="grid lg:grid-cols-2 gap-8">
    <!-- Recent Orders -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6 border-b flex items-center justify-between">
            <h2 class="font-bold text-lg">Recent Orders</h2>
            <a href="?page=orders" class="text-accent text-sm hover:underline">View All</a>
        </div>
        <div class="divide-y">
            <?php if (empty($recentOrders)): ?>
            <div class="p-6 text-center text-gray-500">No orders yet</div>
            <?php else: ?>
            <?php foreach ($recentOrders as $order): ?>
            <div class="p-4 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-semibold"><?php echo escape($order['order_number']); ?></p>
                        <p class="text-sm text-gray-500"><?php echo escape($order['customer_name']); ?></p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-accent">৳<?php echo number_format($order['total'], 0); ?></p>
                        <span class="text-xs px-2 py-0.5 rounded-full <?php
                            echo match($order['order_status']) {
                                'pending' => 'bg-yellow-100 text-yellow-700',
                                'confirmed' => 'bg-blue-100 text-blue-700',
                                'processing' => 'bg-purple-100 text-purple-700',
                                'shipped' => 'bg-indigo-100 text-indigo-700',
                                'delivered' => 'bg-green-100 text-green-700',
                                'cancelled' => 'bg-red-100 text-red-700',
                                default => 'bg-gray-100 text-gray-700'
                            };
                        ?>"><?php echo ucfirst($order['order_status']); ?></span>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Recent Products -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6 border-b flex items-center justify-between">
            <h2 class="font-bold text-lg">Recent Products</h2>
            <a href="?page=products" class="text-accent text-sm hover:underline">View All</a>
        </div>
        <div class="divide-y">
            <?php if (empty($recentProducts)): ?>
            <div class="p-6 text-center text-gray-500">No products yet</div>
            <?php else: ?>
            <?php foreach ($recentProducts as $product): ?>
            <div class="p-4 hover:bg-gray-50 flex items-center gap-4">
                <img src="<?php echo escape($product['image_url'] ?: 'https://placehold.co/60'); ?>" 
                     alt="" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1">
                    <p class="font-semibold"><?php echo escape($product['name']); ?></p>
                    <p class="text-sm text-gray-500"><?php echo escape($product['category_name'] ?? 'Uncategorized'); ?></p>
                </div>
                <div class="text-right">
                    <p class="font-bold">৳<?php echo number_format($product['price'], 0); ?></p>
                    <span class="text-xs <?php echo $product['status'] === 'active' ? 'text-green-600' : 'text-red-600'; ?>">
                        <?php echo ucfirst($product['status']); ?>
                    </span>
                </div>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php
    break;
    
    // ========================================
    // PRODUCTS
    // ========================================
    case 'products':
    $products = Database::fetchAll("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC");
    $categories = Database::fetchAll("SELECT * FROM categories WHERE status = 'active' ORDER BY name");
    
    // Edit product
    $editProduct = null;
    if (isset($_GET['edit'])) {
        $editProduct = Database::fetch("SELECT * FROM products WHERE id = ?", [(int)$_GET['edit']]);
    }
?>
<div class="flex justify-between items-center mb-6">
    <div></div>
    <button onclick="document.getElementById('addProductModal').classList.remove('hidden')" 
            class="btn-primary">
        <i class="fas fa-plus mr-2"></i> Add Product
    </button>
</div>

<!-- Products Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                <?php foreach ($products as $p): ?>
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <img src="<?php echo escape($p['image_url'] ?: 'https://placehold.co/60'); ?>" 
                                 alt="" class="w-12 h-12 rounded-lg object-cover">
                            <div>
                                <p class="font-semibold"><?php echo escape($p['name']); ?></p>
                                <p class="text-xs text-gray-500"><?php echo escape($p['sku'] ?? ''); ?></p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm"><?php echo escape($p['category_name'] ?? '-'); ?></td>
                    <td class="px-6 py-4">
                        <span class="font-bold text-accent">৳<?php echo number_format($p['price'], 0); ?></span>
                        <?php if ($p['old_price']): ?>
                        <span class="text-xs text-gray-400 line-through ml-1">৳<?php echo number_format($p['old_price'], 0); ?></span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 text-sm">
                        <?php if ($p['stock_unlimited']): ?>
                        <span class="text-green-600"><i class="fas fa-infinity"></i> Unlimited</span>
                        <?php else: ?>
                        <?php echo $p['stock']; ?> pcs
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs rounded-full <?php echo $p['status'] === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                            <?php echo ucfirst($p['status']); ?>
                        </span>
                        <?php if ($p['featured']): ?>
                        <span class="ml-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Featured</span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <a href="?page=products&edit=<?php echo $p['id']; ?>" class="text-blue-600 hover:text-blue-800 mr-3">
                            <i class="fas fa-edit"></i>
                        </a>
                        <form method="POST" class="inline" onsubmit="return confirm('Delete this product?');">
                            <input type="hidden" name="action" value="delete_product">
                            <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                            <button type="submit" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Add/Edit Product Modal -->
<div id="addProductModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <h2 class="text-xl font-bold"><?php echo $editProduct ? 'Edit Product' : 'Add New Product'; ?></h2>
            <a href="?page=products" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-xl"></i>
            </a>
        </div>
        <form method="POST" class="p-6 space-y-6">
            <input type="hidden" name="action" value="save_product">
            <input type="hidden" name="id" value="<?php echo $editProduct['id'] ?? 0; ?>">
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Product Name (English) *</label>
                    <input type="text" name="name" value="<?php echo escape($editProduct['name'] ?? ''); ?>" required
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Product Name (Bangla)</label>
                    <input type="text" name="name_bn" value="<?php echo escape($editProduct['name_bn'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Slug (URL)</label>
                    <input type="text" name="slug" value="<?php echo escape($editProduct['slug'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">SKU</label>
                    <input type="text" name="sku" value="<?php echo escape($editProduct['sku'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Price (৳) *</label>
                    <input type="number" name="price" step="0.01" value="<?php echo $editProduct['price'] ?? '0'; ?>" required
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Old Price (৳)</label>
                    <input type="number" name="old_price" step="0.01" value="<?php echo $editProduct['old_price'] ?? ''; ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Category</label>
                    <select name="category_id" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                        <option value="">Select Category</option>
                        <?php foreach ($categories as $cat): ?>
                        <option value="<?php echo $cat['id']; ?>" <?php echo ($editProduct['category_id'] ?? '') == $cat['id'] ? 'selected' : ''; ?>>
                            <?php echo escape($cat['name']); ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Product Type</label>
                    <select name="product_type" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                        <option value="physical" <?php echo ($editProduct['product_type'] ?? '') === 'physical' ? 'selected' : ''; ?>>Physical</option>
                        <option value="digital" <?php echo ($editProduct['product_type'] ?? '') === 'digital' ? 'selected' : ''; ?>>Digital</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Brand</label>
                    <input type="text" name="brand" value="<?php echo escape($editProduct['brand'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Stock</label>
                    <input type="number" name="stock" value="<?php echo $editProduct['stock'] ?? '0'; ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div class="flex items-center gap-6 pt-6">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="stock_unlimited" value="1" <?php echo !empty($editProduct['stock_unlimited']) ? 'checked' : ''; ?>
                               class="w-4 h-4 text-accent rounded">
                        <span class="text-sm">Unlimited Stock</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="in_stock" value="1" <?php echo ($editProduct['in_stock'] ?? 1) ? 'checked' : ''; ?>
                               class="w-4 h-4 text-accent rounded">
                        <span class="text-sm">In Stock</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="featured" value="1" <?php echo !empty($editProduct['featured']) ? 'checked' : ''; ?>
                               class="w-4 h-4 text-accent rounded">
                        <span class="text-sm">Featured</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Image URL</label>
                <input type="url" name="image_url" value="<?php echo escape($editProduct['image_url'] ?? ''); ?>"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Description (English)</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"><?php echo escape($editProduct['description'] ?? ''); ?></textarea>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Description (Bangla)</label>
                <textarea name="description_bn" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"><?php echo escape($editProduct['description_bn'] ?? ''); ?></textarea>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Gallery (one URL per line)</label>
                <textarea name="gallery" rows="3" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none"><?php 
                $gallery = json_decode($editProduct['gallery'] ?? '[]', true);
                echo is_array($gallery) ? implode("\n", $gallery) : '';
                ?></textarea>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">Meta Title</label>
                    <input type="text" name="meta_title" value="<?php echo escape($editProduct['meta_title'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Meta Description</label>
                    <input type="text" name="meta_description" value="<?php echo escape($editProduct['meta_description'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium mb-2">OG Image URL</label>
                    <input type="url" name="og_image" value="<?php echo escape($editProduct['og_image'] ?? ''); ?>"
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Status</label>
                    <select name="status" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                        <option value="active" <?php echo ($editProduct['status'] ?? 'active') === 'active' ? 'selected' : ''; ?>>Active</option>
                        <option value="inactive" <?php echo ($editProduct['status'] ?? '') === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                        <option value="draft" <?php echo ($editProduct['status'] ?? '') === 'draft' ? 'selected' : ''; ?>>Draft</option>
                    </select>
                </div>
            </div>
            
            <div class="flex justify-end gap-4 pt-4 border-t">
                <a href="?page=products" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</a>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save mr-2"></i> Save Product
                </button>
            </div>
        </form>
    </div>
</div>

<?php if ($editProduct): ?>
<script>document.getElementById('addProductModal').classList.remove('hidden'); document.getElementById('addProductModal').classList.add('flex');</script>
<?php endif; ?>

<style>
.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; transition: all 0.3s ease; display: inline-flex; align-items: center; }
.btn-primary:hover { background: hsl(142 70% 40%); }
</style>
<?php
    break;
    
    // ========================================
    // CATEGORIES
    // ========================================
    case 'categories':
    $categories = Database::fetchAll("SELECT * FROM categories ORDER BY sort_order");
    $editCat = isset($_GET['edit']) ? Database::fetch("SELECT * FROM categories WHERE id = ?", [(int)$_GET['edit']]) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editCat ? 'Edit Category' : 'Add Category'; ?></h3>
            <form method="POST">
                <input type="hidden" name="action" value="save_category">
                <input type="hidden" name="id" value="<?php echo $editCat['id'] ?? 0; ?>">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Name (English) *</label>
                        <input type="text" name="name" value="<?php echo escape($editCat['name'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Name (Bangla)</label>
                        <input type="text" name="name_bn" value="<?php echo escape($editCat['name_bn'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Slug</label>
                        <input type="text" name="slug" value="<?php echo escape($editCat['slug'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Sort Order</label>
                        <input type="number" name="sort_order" value="<?php echo $editCat['sort_order'] ?? 0; ?>"
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Status</label>
                        <select name="status" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none">
                            <option value="active" <?php echo ($editCat['status'] ?? 'active') === 'active' ? 'selected' : ''; ?>>Active</option>
                            <option value="inactive" <?php echo ($editCat['status'] ?? '') === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save Category
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($categories as $cat): ?>
                    <?php $prodCount = Database::count('products', 'category_id = ?', [$cat['id']]); ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4"><?php echo $cat['sort_order']; ?></td>
                        <td class="px-6 py-4 font-semibold"><?php echo escape($cat['name']); ?></td>
                        <td class="px-6 py-4 text-sm text-gray-500"><?php echo escape($cat['slug']); ?></td>
                        <td class="px-6 py-4"><?php echo $prodCount; ?></td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 text-xs rounded-full <?php echo $cat['status'] === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                                <?php echo ucfirst($cat['status']); ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="?page=categories&edit=<?php echo $cat['id']; ?>" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    // ========================================
    // ORDERS
    // ========================================
    case 'orders':
    $orders = Database::fetchAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50");
?>
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                <?php foreach ($orders as $order): ?>
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-semibold"><?php echo escape($order['order_number']); ?></td>
                    <td class="px-6 py-4">
                        <p class="font-medium"><?php echo escape($order['customer_name']); ?></p>
                        <p class="text-xs text-gray-500"><?php echo escape($order['customer_phone']); ?></p>
                    </td>
                    <td class="px-6 py-4 font-bold text-accent">৳<?php echo number_format($order['total'], 0); ?></td>
                    <td class="px-6 py-4 text-sm"><?php echo escape($order['payment_method'] ?? '-'); ?></td>
                    <td class="px-6 py-4">
                        <form method="POST" class="inline">
                            <input type="hidden" name="action" value="update_order_status">
                            <input type="hidden" name="id" value="<?php echo $order['id']; ?>">
                            <select name="order_status" onchange="this.form.submit()" 
                                    class="text-xs px-2 py-1 border rounded <?php
                                        echo match($order['order_status']) {
                                            'pending' => 'border-yellow-400 bg-yellow-50',
                                            'confirmed' => 'border-blue-400 bg-blue-50',
                                            'processing' => 'border-purple-400 bg-purple-50',
                                            'shipped' => 'border-indigo-400 bg-indigo-50',
                                            'delivered' => 'border-green-400 bg-green-50',
                                            'cancelled' => 'border-red-400 bg-red-50',
                                            default => ''
                                        };
                                    ?>">
                                <option value="pending" <?php echo $order['order_status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="confirmed" <?php echo $order['order_status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                <option value="processing" <?php echo $order['order_status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                                <option value="shipped" <?php echo $order['order_status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                                <option value="delivered" <?php echo $order['order_status'] === 'delivered' ? 'selected' : ''; ?>>Delivered</option>
                                <option value="cancelled" <?php echo $order['order_status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                            </select>
                        </form>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500"><?php echo format_date($order['created_at']); ?></td>
                    <td class="px-6 py-4 text-right">
                        <a href="?page=orders&view=<?php echo $order['id']; ?>" class="text-accent hover:underline">
                            <i class="fas fa-eye"></i> View
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Order Detail Modal -->
<?php if (isset($_GET['view'])): ?>
<?php 
$orderDetail = Database::fetch("SELECT * FROM orders WHERE id = ?", [(int)$_GET['view']]);
$orderItems = Database::fetchAll("SELECT * FROM order_items WHERE order_id = ?", [$orderDetail['id']]);
?>
<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex items-center justify-between">
            <h2 class="text-xl font-bold">Order <?php echo escape($orderDetail['order_number']); ?></h2>
            <a href="?page=orders" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></a>
        </div>
        <div class="p-6">
            <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="font-semibold mb-2">Customer Info</h3>
                    <p><strong>Name:</strong> <?php echo escape($orderDetail['customer_name']); ?></p>
                    <p><strong>Phone:</strong> <?php echo escape($orderDetail['customer_phone']); ?></p>
                    <p><strong>Email:</strong> <?php echo escape($orderDetail['customer_email'] ?? '-'); ?></p>
                    <p><strong>Address:</strong> <?php echo escape($orderDetail['shipping_address'] ?? '-'); ?></p>
                </div>
                <div>
                    <h3 class="font-semibold mb-2">Payment Info</h3>
                    <p><strong>Method:</strong> <?php echo escape($orderDetail['payment_method'] ?? '-'); ?></p>
                    <p><strong>Transaction:</strong> <?php echo escape($orderDetail['payment_transaction_id'] ?? '-'); ?></p>
                    <p><strong>Status:</strong> <?php echo ucfirst($orderDetail['payment_status']); ?></p>
                </div>
            </div>
            
            <h3 class="font-semibold mb-3">Items</h3>
            <table class="w-full mb-6">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-sm">Product</th>
                        <th class="px-4 py-2 text-center text-sm">Qty</th>
                        <th class="px-4 py-2 text-right text-sm">Price</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($orderItems as $item): ?>
                    <tr>
                        <td class="px-4 py-3"><?php echo escape($item['product_name']); ?></td>
                        <td class="px-4 py-3 text-center"><?php echo $item['quantity']; ?></td>
                        <td class="px-4 py-3 text-right">৳<?php echo number_format($item['total'], 0); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot class="bg-gray-50">
                    <tr>
                        <td colspan="2" class="px-4 py-2 text-right font-semibold">Total:</td>
                        <td class="px-4 py-2 text-right font-bold text-accent">৳<?php echo number_format($orderDetail['total'], 0); ?></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</div>
<?php endif; ?>
<?php
    break;
    
    // ========================================
    // SETTINGS
    // ========================================
    case 'settings':
    $siteInfo = get_settings('site_info', []);
    $heroSettings = get_settings('hero_settings', []);
    $bannerOffers = get_settings('banner_offers', []);
    $footerSettings = get_settings('footer_settings', []);
    $paymentConfig = get_settings('payment_gateway', []);
    $deliverySettings = get_settings('delivery_settings', []);
?>
<div class="space-y-6">
    <!-- Site Info -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-lg mb-4">Site Information</h3>
        <form method="POST" class="grid md:grid-cols-2 gap-4">
            <input type="hidden" name="action" value="save_setting">
            <input type="hidden" name="setting_key" value="site_info">
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1">Logo URL</label>
                <input type="url" name="setting_value[logo_url]" value="<?php echo escape($siteInfo['logo_url'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Shop Name (EN)</label>
                <input type="text" name="setting_value[shop_name_en]" value="<?php echo escape($siteInfo['shop_name_en'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Shop Name (BN)</label>
                <input type="text" name="setting_value[shop_name_bn]" value="<?php echo escape($siteInfo['shop_name_bn'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="setting_value[phone]" value="<?php echo escape($siteInfo['phone'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="setting_value[email]" value="<?php echo escape($siteInfo['email'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">WhatsApp</label>
                <input type="text" name="setting_value[whatsapp]" value="<?php echo escape($siteInfo['whatsapp'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1">Address</label>
                <input type="text" name="setting_value[address_en]" value="<?php echo escape($siteInfo['address_en'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="md:col-span-2">
                <button type="submit" class="btn-primary"><i class="fas fa-save mr-2"></i> Save Site Info</button>
            </div>
        </form>
    </div>
    
    <!-- Hero Settings -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-lg mb-4">Hero Banner</h3>
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="save_setting">
            <input type="hidden" name="setting_key" value="hero_settings">
            
            <div>
                <label class="block text-sm font-medium mb-1">Background Image URL</label>
                <input type="url" name="setting_value[hero_bg_url]" value="<?php echo escape($heroSettings['hero_bg_url'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Title</label>
                    <input type="text" name="setting_value[hero_title]" value="<?php echo escape($heroSettings['hero_title'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Subtitle (EN)</label>
                    <input type="text" name="setting_value[hero_subtitle_en]" value="<?php echo escape($heroSettings['hero_subtitle_en'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">CTA Text (EN)</label>
                    <input type="text" name="setting_value[hero_cta_text_en]" value="<?php echo escape($heroSettings['hero_cta_text_en'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">CTA Link</label>
                    <input type="text" name="setting_value[hero_cta_link]" value="<?php echo escape($heroSettings['hero_cta_link'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-save mr-2"></i> Save Hero Settings</button>
        </form>
    </div>
    
    <!-- Banner & Notice -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-lg mb-4">Banner & Notice</h3>
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="save_setting">
            <input type="hidden" name="setting_key" value="banner_offers">
            
            <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                    <input type="checkbox" name="setting_value[banner_enabled]" value="1" <?php echo !empty($bannerOffers['banner_enabled']) ? 'checked' : ''; ?>
                           class="w-4 h-4">
                    <span>Enable Top Banner</span>
                </label>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Banner Text (EN)</label>
                <input type="text" name="setting_value[banner_text_en]" value="<?php echo escape($bannerOffers['banner_text_en'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                    <input type="checkbox" name="setting_value[notice_enabled]" value="1" <?php echo !empty($bannerOffers['notice_enabled']) ? 'checked' : ''; ?>
                           class="w-4 h-4">
                    <span>Enable Notice Board</span>
                </label>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Notice Text (EN)</label>
                <input type="text" name="setting_value[notice_text_en]" value="<?php echo escape($bannerOffers['notice_text_en'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Facebook Page URL</label>
                <input type="url" name="setting_value[facebook_page]" value="<?php echo escape($bannerOffers['facebook_page'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-save mr-2"></i> Save Banner Settings</button>
        </form>
    </div>
    
    <!-- Payment Settings -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-lg mb-4">Payment Methods</h3>
        <form method="POST" class="grid md:grid-cols-2 gap-6">
            <input type="hidden" name="action" value="save_setting">
            <input type="hidden" name="setting_key" value="payment_gateway">
            
            <!-- bKash -->
            <div class="border rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3">
                    <input type="checkbox" name="setting_value[bkash][enabled]" value="1" <?php echo !empty($paymentConfig['bkash']['enabled']) ? 'checked' : ''; ?>
                           class="w-4 h-4">
                    <span class="font-semibold">bKash</span>
                </div>
                <input type="text" name="setting_value[bkash][number]" placeholder="bKash Number" 
                       value="<?php echo escape($paymentConfig['bkash']['number'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg mb-2">
                <select name="setting_value[bkash][type]" class="w-full px-3 py-2 border rounded-lg">
                    <option value="personal" <?php echo ($paymentConfig['bkash']['type'] ?? '') === 'personal' ? 'selected' : ''; ?>>Personal</option>
                    <option value="merchant" <?php echo ($paymentConfig['bkash']['type'] ?? '') === 'merchant' ? 'selected' : ''; ?>>Merchant</option>
                </select>
            </div>
            
            <!-- Nagad -->
            <div class="border rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3">
                    <input type="checkbox" name="setting_value[nagad][enabled]" value="1" <?php echo !empty($paymentConfig['nagad']['enabled']) ? 'checked' : ''; ?>
                           class="w-4 h-4">
                    <span class="font-semibold">Nagad</span>
                </div>
                <input type="text" name="setting_value[nagad][number]" placeholder="Nagad Number" 
                       value="<?php echo escape($paymentConfig['nagad']['number'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            
            <!-- Rocket -->
            <div class="border rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3">
                    <input type="checkbox" name="setting_value[rocket][enabled]" value="1" <?php echo !empty($paymentConfig['rocket']['enabled']) ? 'checked' : ''; ?>
                           class="w-4 h-4">
                    <span class="font-semibold">Rocket</span>
                </div>
                <input type="text" name="setting_value[rocket][number]" placeholder="Rocket Number" 
                       value="<?php echo escape($paymentConfig['rocket']['number'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            
            <div class="md:col-span-2">
                <button type="submit" class="btn-primary"><i class="fas fa-save mr-2"></i> Save Payment Settings</button>
            </div>
        </form>
    </div>
    
    <!-- Footer & Social -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-lg mb-4">Footer & Social Links</h3>
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="save_setting">
            <input type="hidden" name="setting_key" value="footer_settings">
            
            <div>
                <label class="block text-sm font-medium mb-1">About (EN)</label>
                <textarea name="setting_value[footer_about_en]" rows="3" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($footerSettings['footer_about_en'] ?? ''); ?></textarea>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Facebook URL</label>
                    <input type="url" name="setting_value[facebook_url]" value="<?php echo escape($footerSettings['facebook_url'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">YouTube URL</label>
                    <input type="url" name="setting_value[youtube_url]" value="<?php echo escape($footerSettings['youtube_url'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Instagram URL</label>
                    <input type="url" name="setting_value[instagram_url]" value="<?php echo escape($footerSettings['instagram_url'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">WhatsApp URL</label>
                    <input type="url" name="setting_value[whatsapp_url]" value="<?php echo escape($footerSettings['whatsapp_url'] ?? ''); ?>"
                           class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Copyright Text</label>
                <input type="text" name="setting_value[copyright_text]" value="<?php echo escape($footerSettings['copyright_text'] ?? ''); ?>"
                       class="w-full px-3 py-2 border rounded-lg">
            </div>
            <button type="submit" class="btn-primary"><i class="fas fa-save mr-2"></i> Save Footer Settings</button>
        </form>
    </div>
</div>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; }</style>
<?php
    break;
    
    // ========================================
    // TOOLS
    // ========================================
    case 'tools':
    $tools = get_settings('tools_list', []);
    $editTool = isset($_GET['edit']) ? ($tools[(int)$_GET['edit'] - 1] ?? null) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editTool ? 'Edit Tool' : 'Add New Tool'; ?></h3>
            <form method="POST">
                <input type="hidden" name="action" value="save_tool">
                <input type="hidden" name="id" value="<?php echo $_GET['edit'] ?? 0; ?>">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (EN) *</label>
                        <input type="text" name="title" value="<?php echo escape($editTool['title'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (BN)</label>
                        <input type="text" name="title_bn" value="<?php echo escape($editTool['title_bn'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">URL *</label>
                        <input type="url" name="link" value="<?php echo escape($editTool['link'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Button Text (EN)</label>
                            <input type="text" name="button_text" value="<?php echo escape($editTool['button_text'] ?? 'Open'); ?>"
                                   class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Button Text (BN)</label>
                            <input type="text" name="button_text_bn" value="<?php echo escape($editTool['button_text_bn'] ?? 'খুলুন'); ?>"
                                   class="w-full px-3 py-2 border rounded-lg">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save Tool
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($tools as $index => $tool): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4"><?php echo $index + 1; ?></td>
                        <td class="px-6 py-4 font-semibold"><?php echo escape($tool['title']); ?></td>
                        <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs"><?php echo escape($tool['link']); ?></td>
                        <td class="px-6 py-4 text-right">
                            <a href="?page=tools&edit=<?php echo $index + 1; ?>" class="text-blue-600 hover:text-blue-800 mr-3">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="?page=tools&delete=<?php echo $index + 1; ?>" onclick="return confirm('Delete this tool?')" 
                               class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    <?php if (empty($tools)): ?>
                    <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-gray-500">No tools added yet</td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    // ========================================
    // CUSTOMERS
    // ========================================
    case 'customers':
    $customers = Database::fetchAll("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC");
?>
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y">
            <?php foreach ($customers as $customer): ?>
            <?php $orderCount = Database::count('orders', 'user_id = ?', [$customer['id']]); ?>
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-semibold"><?php echo escape($customer['name'] ?? '-'); ?></td>
                <td class="px-6 py-4"><?php echo escape($customer['email']); ?></td>
                <td class="px-6 py-4"><?php echo escape($customer['phone'] ?? '-'); ?></td>
                <td class="px-6 py-4"><?php echo $orderCount; ?></td>
                <td class="px-6 py-4 text-sm text-gray-500"><?php echo format_date($customer['created_at']); ?></td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full <?php echo $customer['status'] === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                        <?php echo ucfirst($customer['status']); ?>
                    </span>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php
    break;
    
    // ========================================
    // COUPONS
    // ========================================
    case 'coupons':
    $coupons = Database::fetchAll("SELECT * FROM coupons ORDER BY created_at DESC");
    $editCoupon = isset($_GET['edit']) ? Database::fetch("SELECT * FROM coupons WHERE id = ?", [(int)$_GET['edit']]) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editCoupon ? 'Edit Coupon' : 'Add Coupon'; ?></h3>
            <form method="POST">
                <input type="hidden" name="action" value="save_coupon">
                <input type="hidden" name="id" value="<?php echo $editCoupon['id'] ?? 0; ?>">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Code *</label>
                        <input type="text" name="code" value="<?php echo escape($editCoupon['code'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg font-mono uppercase">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Discount Type</label>
                        <select name="discount_type" class="w-full px-3 py-2 border rounded-lg">
                            <option value="percentage" <?php echo ($editCoupon['discount_type'] ?? '') === 'percentage' ? 'selected' : ''; ?>>Percentage (%)</option>
                            <option value="fixed" <?php echo ($editCoupon['discount_type'] ?? '') === 'fixed' ? 'selected' : ''; ?>>Fixed Amount (৳)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Discount Value *</label>
                        <input type="number" step="0.01" name="discount_value" value="<?php echo $editCoupon['discount_value'] ?? ''; ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Min Order Amount</label>
                        <input type="number" step="0.01" name="min_order_amount" value="<?php echo $editCoupon['min_order_amount'] ?? ''; ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Start Date</label>
                            <input type="date" name="start_date" value="<?php echo $editCoupon['start_date'] ?? ''; ?>"
                                   class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">End Date</label>
                            <input type="date" name="end_date" value="<?php echo $editCoupon['end_date'] ?? ''; ?>"
                                   class="w-full px-3 py-2 border rounded-lg">
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" name="is_active" value="1" <?php echo ($editCoupon['is_active'] ?? 1) ? 'checked' : ''; ?>
                               class="w-4 h-4">
                        <span class="text-sm">Active</span>
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save Coupon
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($coupons as $coupon): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-mono font-bold"><?php echo escape($coupon['code']); ?></td>
                        <td class="px-6 py-4">
                            <?php echo $coupon['discount_type'] === 'percentage' ? $coupon['discount_value'] . '%' : '৳' . number_format($coupon['discount_value'], 0); ?>
                        </td>
                        <td class="px-6 py-4"><?php echo $coupon['used_count']; ?> / <?php echo $coupon['usage_limit'] ?? '∞'; ?></td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 text-xs rounded-full <?php echo $coupon['is_active'] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                                <?php echo $coupon['is_active'] ? 'Active' : 'Inactive'; ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="?page=coupons&edit=<?php echo $coupon['id']; ?>" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    // ========================================
    // SERVICES
    // ========================================
    case 'services':
    $services = get_settings('services_list', []);
    $editService = isset($_GET['edit']) ? ($services[(int)$_GET['edit'] - 1] ?? null) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editService ? 'Edit Service' : 'Add Service'; ?></h3>
            <form method="POST" onsubmit="return saveService(this)">
                <input type="hidden" name="action" value="save_service">
                <input type="hidden" name="setting_key" value="services_list">
                <input type="hidden" name="index" value="<?php echo $_GET['edit'] ?? -1; ?>">
                <input type="hidden" name="services_json" id="servicesJson">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (EN) *</label>
                        <input type="text" name="title" value="<?php echo escape($editService['title'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (BN)</label>
                        <input type="text" name="title_bn" value="<?php echo escape($editService['title_bn'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description (EN)</label>
                        <textarea name="desc" rows="3" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editService['desc'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description (BN)</label>
                        <textarea name="desc_bn" rows="3" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editService['desc_bn'] ?? ''); ?></textarea>
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save Service
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4">Current Services</h3>
            <?php if (empty($services)): ?>
            <p class="text-gray-500 text-center py-8">No services added yet</p>
            <?php else: ?>
            <div class="grid md:grid-cols-2 gap-4">
                <?php foreach ($services as $index => $s): ?>
                <div class="border rounded-lg p-4">
                    <h4 class="font-semibold"><?php echo escape($s['title']); ?></h4>
                    <p class="text-sm text-gray-500"><?php echo escape($s['desc'] ?? ''); ?></p>
                    <div class="mt-2">
                        <a href="?page=services&edit=<?php echo $index + 1; ?>" class="text-blue-600 text-sm mr-3">Edit</a>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<script>
function saveService(form) {
    const services = <?php echo json_encode($services); ?>;
    const index = parseInt(form.index.value);
    const newService = {
        title: form.title.value,
        title_bn: form.title_bn.value,
        desc: form.desc.value,
        desc_bn: form.desc_bn.value
    };
    
    if (index >= 0 && index < services.length) {
        services[index] = newService;
    } else {
        services.push(newService);
    }
    
    document.getElementById('servicesJson').value = JSON.stringify(services);
    return true;
}
</script>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    // ========================================
    // FAQ
    // ========================================
    case 'faq':
    $faqs = Database::fetchAll("SELECT * FROM faq ORDER BY sort_order");
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'save_faq') {
        require_admin();
        $id = (int)($_POST['id'] ?? 0);
        $data = [
            'question' => trim($_POST['question'] ?? ''),
            'question_bn' => trim($_POST['question_bn'] ?? ''),
            'answer' => trim($_POST['answer'] ?? ''),
            'answer_bn' => trim($_POST['answer_bn'] ?? ''),
            'sort_order' => (int)($_POST['sort_order'] ?? 0),
            'status' => $_POST['status'] ?? 'active',
        ];
        
        if ($id > 0) {
            Database::update('faq', $data, 'id = ?', [$id]);
        } else {
            Database::insert('faq', $data);
        }
        flash('success', 'FAQ saved!');
        redirect('/admin/?page=faq');
    }
    
    if (isset($_GET['delete'])) {
        Database::delete('faq', 'id = ?', [(int)$_GET['delete']]);
        flash('success', 'FAQ deleted!');
        redirect('/admin/?page=faq');
    }
    
    $editFaq = isset($_GET['edit']) ? Database::fetch("SELECT * FROM faq WHERE id = ?", [(int)$_GET['edit']]) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editFaq ? 'Edit FAQ' : 'Add FAQ'; ?></h3>
            <form method="POST">
                <input type="hidden" name="action" value="save_faq">
                <input type="hidden" name="id" value="<?php echo $editFaq['id'] ?? 0; ?>">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Question (EN) *</label>
                        <input type="text" name="question" value="<?php echo escape($editFaq['question'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Question (BN)</label>
                        <input type="text" name="question_bn" value="<?php echo escape($editFaq['question_bn'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Answer (EN) *</label>
                        <textarea name="answer" rows="4" required class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editFaq['answer'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Answer (BN)</label>
                        <textarea name="answer_bn" rows="4" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editFaq['answer_bn'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Sort Order</label>
                        <input type="number" name="sort_order" value="<?php echo $editFaq['sort_order'] ?? 0; ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save FAQ
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($faqs as $index => $faq): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4"><?php echo $index + 1; ?></td>
                        <td class="px-6 py-4"><?php echo escape($faq['question']); ?></td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 text-xs rounded-full <?php echo $faq['status'] === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                                <?php echo ucfirst($faq['status']); ?>
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="?page=faq&edit=<?php echo $faq['id']; ?>" class="text-blue-600 hover:text-blue-800 mr-3">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="?page=faq&delete=<?php echo $faq['id']; ?>" onclick="return confirm('Delete?')" 
                               class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    // ========================================
    // COURSES
    // ========================================
    case 'courses':
    $courses = get_settings('courses_list', []);
    $editCourse = isset($_GET['edit']) ? ($courses[(int)$_GET['edit'] - 1] ?? null) : null;
?>
<div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="font-bold text-lg mb-4"><?php echo $editCourse ? 'Edit Course' : 'Add Course'; ?></h3>
            <form method="POST" onsubmit="return saveCourse(this)">
                <input type="hidden" name="action" value="save_courses">
                <input type="hidden" name="setting_key" value="courses_list">
                <input type="hidden" name="index" value="<?php echo $_GET['edit'] ?? -1; ?>">
                <input type="hidden" name="courses_json" id="coursesJson">
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (EN) *</label>
                        <input type="text" name="title_en" value="<?php echo escape($editCourse['title_en'] ?? ''); ?>" required
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Title (BN)</label>
                        <input type="text" name="title_bn" value="<?php echo escape($editCourse['title_bn'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description (EN)</label>
                        <textarea name="desc_en" rows="3" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editCourse['desc_en'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description (BN)</label>
                        <textarea name="desc_bn" rows="3" class="w-full px-3 py-2 border rounded-lg"><?php echo escape($editCourse['desc_bn'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Video/Link URL</label>
                        <input type="url" name="link" value="<?php echo escape($editCourse['link'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Image URL</label>
                        <input type="url" name="image" value="<?php echo escape($editCourse['image'] ?? ''); ?>"
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <button type="submit" class="btn-primary w-full justify-center">
                        <i class="fas fa-save mr-2"></i> Save Course
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <?php foreach ($courses as $index => $c): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4"><?php echo $index + 1; ?></td>
                        <td class="px-6 py-4 font-semibold"><?php echo escape($c['title_en']); ?></td>
                        <td class="px-6 py-4 text-sm"><?php echo $c['link'] ? '<a href="' . escape($c['link']) . '" target="_blank" class="text-accent"><i class="fas fa-external-link-alt"></i></a>' : '-'; ?></td>
                        <td class="px-6 py-4 text-right">
                            <a href="?page=courses&edit=<?php echo $index + 1; ?>" class="text-blue-600 hover:text-blue-800 mr-3">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="?page=courses&delete=<?php echo $index + 1; ?>" onclick="return confirm('Delete?')" 
                               class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    <?php if (empty($courses)): ?>
                    <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-gray-500">No courses added yet</td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<script>
function saveCourse(form) {
    const courses = <?php echo json_encode($courses); ?>;
    const index = parseInt(form.index.value);
    const newCourse = {
        title_en: form.title_en.value,
        title_bn: form.title_bn.value,
        desc_en: form.desc_en.value,
        desc_bn: form.desc_bn.value,
        link: form.link.value,
        image: form.image.value
    };
    
    if (index >= 0 && index < courses.length) {
        courses[index] = newCourse;
    } else {
        courses.push(newCourse);
    }
    
    document.getElementById('coursesJson').value = JSON.stringify(courses);
    return true;
}
</script>
<style>.btn-primary { background: hsl(142 70% 45%); color: white; padding: 0.625rem 1.5rem; border-radius: 8px; font-weight: 600; }</style>
<?php
    break;
    
    default:
        include __DIR__ . '/admin-content.php';
    endswitch;
?>
