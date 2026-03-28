<?php
/**
 * Footer Template
 */
$siteInfo = get_settings('site_info', []);
$footerSettings = get_settings('footer_settings', []);
$shopName = $siteInfo['shop_name_en'] ?? 'SB Mobile Shop';
$language = $_COOKIE['language'] ?? 'en';
?>
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-900 text-white mt-16">
        <div class="container mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- About -->
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <?php if (!empty($siteInfo['logo_url'])): ?>
                        <img src="<?php echo escape($siteInfo['logo_url']); ?>" alt="<?php echo escape($shopName); ?>" class="h-10 w-auto">
                        <?php else: ?>
                        <div class="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                            <i class="fas fa-store text-white"></i>
                        </div>
                        <?php endif; ?>
                        <span class="font-bold text-lg"><?php echo escape($shopName); ?></span>
                    </div>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        <?php echo escape($language === 'bn' ? ($footerSettings['footer_about_bn'] ?? '') : ($footerSettings['footer_about_en'] ?? '')); ?>
                    </p>
                </div>
                
                <!-- Quick Links -->
                <div>
                    <h3 class="font-bold text-lg mb-4">Quick Links</h3>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="/" class="hover:text-white transition">Home</a></li>
                        <li><a href="/pages/products.php" class="hover:text-white transition">Products</a></li>
                        <li><a href="/pages/tools.php" class="hover:text-white transition">Free Tools</a></li>
                        <li><a href="/pages/about.php" class="hover:text-white transition">About Us</a></li>
                        <li><a href="/pages/contact.php" class="hover:text-white transition">Contact</a></li>
                    </ul>
                </div>
                
                <!-- Support -->
                <div>
                    <h3 class="font-bold text-lg mb-4">Support</h3>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="/pages/faq.php" class="hover:text-white transition">FAQ</a></li>
                        <li><a href="/pages/shipping.php" class="hover:text-white transition">Shipping Info</a></li>
                        <li><a href="/pages/returns.php" class="hover:text-white transition">Returns Policy</a></li>
                        <li><a href="/pages/privacy.php" class="hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="/pages/terms.php" class="hover:text-white transition">Terms of Service</a></li>
                    </ul>
                </div>
                
                <!-- Contact Info -->
                <div>
                    <h3 class="font-bold text-lg mb-4">Contact Us</h3>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <?php if (!empty($siteInfo['phone'])): ?>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-phone text-accent"></i>
                            <a href="tel:<?php echo escape($siteInfo['phone']); ?>" class="hover:text-white">
                                <?php echo escape($siteInfo['phone']); ?>
                            </a>
                        </li>
                        <?php endif; ?>
                        <?php if (!empty($siteInfo['whatsapp'])): ?>
                        <li class="flex items-center gap-2">
                            <i class="fab fa-whatsapp text-accent"></i>
                            <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>" target="_blank" class="hover:text-white">
                                WhatsApp
                            </a>
                        </li>
                        <?php endif; ?>
                        <?php if (!empty($siteInfo['email'])): ?>
                        <li class="flex items-center gap-2">
                            <i class="fas fa-envelope text-accent"></i>
                            <a href="mailto:<?php echo escape($siteInfo['email']); ?>" class="hover:text-white">
                                <?php echo escape($siteInfo['email']); ?>
                            </a>
                        </li>
                        <?php endif; ?>
                        <?php if (!empty($siteInfo['address_en'])): ?>
                        <li class="flex items-start gap-2">
                            <i class="fas fa-map-marker-alt text-accent mt-1"></i>
                            <span><?php echo escape($language === 'bn' ? ($siteInfo['address_bn'] ?? '') : $siteInfo['address_en']); ?></span>
                        </li>
                        <?php endif; ?>
                    </ul>
                    
                    <!-- Social Links -->
                    <div class="flex gap-3 mt-4">
                        <?php if (!empty($footerSettings['facebook_url'])): ?>
                        <a href="<?php echo escape($footerSettings['facebook_url']); ?>" target="_blank" 
                           class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <?php endif; ?>
                        <?php if (!empty($footerSettings['messenger_url'])): ?>
                        <a href="<?php echo escape($footerSettings['messenger_url']); ?>" target="_blank" 
                           class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                            <i class="fab fa-facebook-messenger"></i>
                        </a>
                        <?php endif; ?>
                        <?php if (!empty($footerSettings['youtube_url'])): ?>
                        <a href="<?php echo escape($footerSettings['youtube_url']); ?>" target="_blank" 
                           class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                            <i class="fab fa-youtube"></i>
                        </a>
                        <?php endif; ?>
                        <?php if (!empty($footerSettings['whatsapp_url'])): ?>
                        <a href="<?php echo escape($footerSettings['whatsapp_url']); ?>" target="_blank" 
                           class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <?php endif; ?>
                        <?php if (!empty($footerSettings['instagram_url'])): ?>
                        <a href="<?php echo escape($footerSettings['instagram_url']); ?>" target="_blank" 
                           class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Payment Methods -->
        <div class="border-t border-gray-800">
            <div class="container mx-auto px-4 py-6">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <span class="text-gray-400 text-sm">Payment Methods:</span>
                        <div class="flex gap-3 text-2xl text-gray-500">
                            <i class="fas fa-mobile-alt" title="bKash"></i>
                            <i class="fas fa-mobile-alt" title="Nagad"></i>
                            <i class="fas fa-mobile-alt" title="Rocket"></i>
                            <i class="fab fa-bitcoin" title="Crypto"></i>
                        </div>
                    </div>
                    <p class="text-gray-500 text-sm">
                        <?php echo escape($footerSettings['copyright_text'] ?? '© ' . date('Y') . ' ' . escape($shopName) . '. All rights reserved.'); ?>
                    </p>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- Floating Buttons -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <!-- WhatsApp Button -->
        <?php if (!empty($siteInfo['whatsapp'])): ?>
        <a href="https://wa.me/<?php echo escape($siteInfo['whatsapp']); ?>" target="_blank" 
           class="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition hover:scale-110">
            <i class="fab fa-whatsapp text-2xl"></i>
        </a>
        <?php endif; ?>
        
        <!-- Back to Top -->
        <button onclick="scrollToTop()" id="backToTop" 
                class="w-14 h-14 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition opacity-0 invisible">
            <i class="fas fa-arrow-up"></i>
        </button>
    </div>
    
    <script>
        // Mobile Menu Toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('active');
        }
        
        // Search Toggle
        function toggleSearch() {
            const modal = document.getElementById('searchModal');
            modal.classList.toggle('hidden');
            modal.classList.toggle('flex');
            if (!modal.classList.contains('hidden')) {
                document.getElementById('searchInput').focus();
            }
        }
        
        // Search Handler
        let searchTimeout;
        function handleSearch(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                document.getElementById('searchResults').innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                fetch(`/api/search.php?q=${encodeURIComponent(query)}`)
                    .then(r => r.json())
                    .then(data => {
                        displaySearchResults(data);
                    });
            }, 300);
        }
        
        function displaySearchResults(results) {
            const container = document.getElementById('searchResults');
            if (results.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-8">No products found</p>';
                return;
            }
            
            container.innerHTML = results.map(p => `
                <a href="/pages/product.php?slug=${p.slug}" class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                    <img src="${p.image_url || 'https://placehold.co/60'}" alt="${p.name}" class="w-14 h-14 object-cover rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-semibold">${p.name}</h4>
                        <p class="text-accent font-bold">৳${parseFloat(p.price).toLocaleString()}</p>
                    </div>
                </a>
            `).join('');
        }
        
        // Language Toggle
        function toggleLanguage() {
            const lang = document.cookie.includes('language=bn') ? 'en' : 'bn';
            document.cookie = `language=${lang}; path=/; max-age=${60*60*24*365}`;
            location.reload();
        }
        
        // Back to Top
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        window.addEventListener('scroll', () => {
            const btn = document.getElementById('backToTop');
            if (window.scrollY > 500) {
                btn.classList.remove('opacity-0', 'invisible');
                btn.classList.add('opacity-100', 'visible');
            } else {
                btn.classList.add('opacity-0', 'invisible');
                btn.classList.remove('opacity-100', 'visible');
            }
        });
        
        // Add to Cart
        async function addToCart(productId, quantity = 1) {
            try {
                const res = await fetch('/api/cart.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', product_id: productId, quantity })
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('cartCount').textContent = data.cart_count;
                    showToast('Added to cart!', 'success');
                } else {
                    showToast(data.message || 'Failed to add', 'error');
                }
            } catch (e) {
                showToast('Error adding to cart', 'error');
            }
        }
        
        // Toast Notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-24 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800'}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('searchModal')?.classList.add('hidden');
                document.getElementById('searchModal')?.classList.remove('flex');
            }
        });
        
        // Close modals on click outside
        document.getElementById('searchModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'searchModal') {
                toggleSearch();
            }
        });
    </script>
</body>
</html>
