-- ================================================
-- SB Mobile Shop - Database Schema
-- MySQL Database for cPanel Hosting
-- ================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ================================================
-- Database Creation
-- ================================================
CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `{DB_NAME}`;

-- ================================================
-- Table: users (Admin & Customers)
-- ================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` enum('admin','moderator','customer') DEFAULT 'customer',
  `avatar` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','blocked') DEFAULT 'active',
  `email_verified_at` datetime DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role` (`role`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: site_settings (All configurable settings)
-- ================================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` longtext,
  `setting_type` enum('string','json','boolean','number') DEFAULT 'string',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: categories
-- ================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: products (Digital & Physical)
-- ================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `old_price` decimal(10,2) DEFAULT NULL,
  `product_type` enum('physical','digital') DEFAULT 'physical',
  `category_id` int(11) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `stock_unlimited` tinyint(1) DEFAULT 0,
  `in_stock` tinyint(1) DEFAULT 1,
  `featured` tinyint(1) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `gallery` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `download_file` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  KEY `status` (`status`),
  KEY `featured` (`featured`),
  KEY `product_type` (`product_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: orders
-- ================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL UNIQUE,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `shipping_address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_number` varchar(50) DEFAULT NULL,
  `payment_transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `order_status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `payment_status` (`payment_status`),
  KEY `order_status` (`order_status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: order_items
-- ================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_type` enum('physical','digital') DEFAULT 'physical',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `download_token` varchar(100) DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: coupons
-- ================================================
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `user_limit` int(11) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: cart (Session-based)
-- ================================================
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: wishlist
-- ================================================
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: product_reviews
-- ================================================
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `rating` int(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `is_approved` (`is_approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: tools (Web Tools Sharing)
-- ================================================
CREATE TABLE IF NOT EXISTS `tools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_bn` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `link` varchar(500) NOT NULL,
  `icon` varchar(50) DEFAULT 'Wrench',
  `button_text` varchar(100) DEFAULT 'Open',
  `button_text_bn` varchar(100) DEFAULT 'খুলুন',
  `target` enum('_self','_blank') DEFAULT '_blank',
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: services
-- ================================================
CREATE TABLE IF NOT EXISTS `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_bn` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'Settings',
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: courses (Digital Courses)
-- ================================================
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `title_bn` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `instructor` varchar(255) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `lessons_count` int(11) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: faq
-- ================================================
CREATE TABLE IF NOT EXISTS `faq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(500) NOT NULL,
  `question_bn` varchar(500) DEFAULT NULL,
  `answer` text NOT NULL,
  `answer_bn` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: payment_settings
-- ================================================
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gateway` varchar(50) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gateway_setting` (`gateway`,`setting_key`),
  KEY `gateway` (`gateway`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: notifications
-- ================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(500) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: activity_log
-- ================================================
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Table: uploads (File Manager)
-- ================================================
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Insert Default Admin User (Password: admin123)
-- ================================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`) VALUES
('admin@sbmobile.shop', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', 'active');

-- ================================================
-- Insert Default Site Settings
-- ================================================
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`) VALUES
('site_info', '{"shop_name_en":"SB Mobile Shop","shop_name_bn":"এসবি মোবাইল শপ","phone":"01712345678","phone2":"","email":"info@sbmobile.shop","whatsapp":"8801712345678","address_en":"Dhaka, Bangladesh","address_bn":"ঢাকা, বাংলাদেশ","logo_url":"","favicon":"","og_image":"","cover_image":""}', 'json'),
('hero_settings', '{"hero_bg_url":"","hero_video_url":"","hero_title":"Welcome to Our Shop","hero_subtitle_en":"Best Quality Products","hero_subtitle_bn":"সেরা মানের পণ্য","hero_tagline_en":"Your trusted online store","hero_tagline_bn":"আপনার বিশ্বস্ত অনলাইন স্টোর","hero_cta_text_en":"Shop Now","hero_cta_text_bn":"এখনই কিনুন","hero_cta_link":"/products"}', 'json'),
('banner_offers', '{"banner_enabled":true,"banner_text_en":"🎉 New Arrivals! Check our latest products","banner_text_bn":"🎉 নতুন পণ্য এসেছে! সর্বশেষ পণ্যগুলি দেখুন","notice_enabled":true,"notice_text_en":"Welcome to SB Mobile Shop - Your trusted online store","notice_text_bn":"এসবি মোবাইল শপে স্বাগতম - আপনার বিশ্বস্ত অনলাইন স্টোর","facebook_page":"","meta_pixel_id":""}', 'json'),
('footer_settings', '{"footer_about_en":"We provide best quality mobile phones and accessories at affordable prices.","footer_about_bn":"আমরা সাশ্রয়ী মূল্যে সেরা মানের মোবাইল ফোন এবং এক্সেসরিজ সরবরাহ করি।","facebook_url":"","messenger_url":"","whatsapp_url":"","youtube_url":"","instagram_url":"","google_maps_url":"","copyright_text":"© 2024 SB Mobile Shop. All rights reserved."}', 'json'),
('section_visibility', '{"show_hero":true,"show_delivery":true,"show_products":true,"show_categories":true,"show_services":true,"show_payment":true,"show_courses":true,"show_tools":true,"show_why_us":true,"show_about":true,"show_contact":true,"show_pwa_prompt":false}', 'json'),
('theme_settings', '{"active_theme":"default","custom_colors":{"primary":"213 50% 23%","accent":"142 70% 45%","background":"0 0% 100%","foreground":"222 47% 11%","card":"0 0% 100%","muted":"220 14% 96%","border":"220 13% 91%","sidebar_bg":"220 20% 10%","gradient_from":"213 50% 23%","gradient_to":"233 71% 46%"}}', 'json'),
('delivery_settings', '{"image_url":"","title_en":"Home Delivery","title_bn":"হোম ডেলিভারি","desc_en":"Get your products delivered to your doorstep","desc_bn":"আপনার পণ্য আপনার দরজায় পৌঁছে দেওয়া হবে","phone_primary":"01712345678","phone_bkash":"01712345678","cta_text_en":"Order Now","cta_text_bn":"অর্ডার করুন","cta_link":"/products"}', 'json'),
('tools_list', '[]', 'json'),
('services_list', '[]', 'json'),
('courses_list', '[]', 'json'),
('payment_gateway', '{"bkash":{"enabled":true,"number":"01712345678","type":"personal"},"nagad":{"enabled":false,"number":""},"rocket":{"enabled":false,"number":""},"binance":{"enabled":false,"wallet_id":""}}', 'json');

-- ================================================
-- Insert Default Categories
-- ================================================
INSERT INTO `categories` (`name`, `name_bn`, `slug`, `sort_order`, `status`) VALUES
('Smartphones', 'স্মার্টফোন', 'smartphones', 1, 'active'),
('Feature Phones', 'ফিচার ফোন', 'feature-phones', 2, 'active'),
('Accessories', 'এক্সেসরিজ', 'accessories', 3, 'active'),
('Gadgets', 'গ্যাজেট', 'gadgets', 4, 'active'),
('Earbuds', 'ইয়ারবাড', 'earbuds', 5, 'active'),
('Chargers', 'চার্জার', 'chargers', 6, 'active'),
('Covers', 'কভার', 'covers', 7, 'active'),
('Digital Products', 'ডিজিটাল প্রোডাক্ট', 'digital-products', 8, 'active');

-- ================================================
-- Insert Sample Products
-- ================================================
INSERT INTO `products` (`name`, `name_bn`, `slug`, `description`, `description_bn`, `price`, `old_price`, `product_type`, `category_id`, `brand`, `sku`, `stock`, `in_stock`, `featured`, `image_url`, `status`) VALUES
('Sample Smartphone', 'স্যাম্পল স্মার্টফোন', 'sample-smartphone', 'A great smartphone with amazing features', 'অসাধারণ ফিচার সহ একটি দুর্দান্ত স্মার্টফোন', 12999.00, 14999.00, 'physical', 1, 'Sample Brand', 'SKU001', 50, 1, 1, 'https://placehold.co/400x400/213/fff?text=Phone', 'active'),
('Premium Earbuds', 'প্রিমিয়াম ইয়ারবাড', 'premium-earbuds', 'High quality wireless earbuds', 'উচ্চ মানের ওয়্যারলেস ইয়ারবাড', 2499.00, 2999.00, 'physical', 5, 'AudioPro', 'SKU002', 100, 1, 1, 'https://placehold.co/400x400/142/fff?text=Earbuds', 'active'),
('Digital Course - Web Development', 'ডিজিটাল কোর্স - ওয়েব ডেভেলপমেন্ট', 'web-dev-course', 'Complete web development course with certificate', 'সার্টিফিকেট সহ সম্পূর্ণ ওয়েব ডেভেলপমেন্ট কোর্স', 2999.00, NULL, 'digital', 8, 'SB Academy', 'SKU003', 999, 1, 1, 'https://placehold.co/400x400/233/fff?text=Web+Course', 'active');

-- ================================================
-- Insert Sample FAQ
-- ================================================
INSERT INTO `faq` (`question`, `question_bn`, `answer`, `answer_bn`, `sort_order`, `status`) VALUES
('How to order?', 'কিভাবে অর্ডার করব?', 'Simply browse our products, add to cart, and checkout. We accept bKash, Nagad, and Rocket payments.', 'আমাদের পণ্যগুলি ব্রাউজ করুন, কার্টে যোগ করুন এবং চেকআউট করুন। আমরা বিকাশ, নগদ এবং রকেট পেমেন্ট গ্রহণ করি।', 1, 'active'),
('What is the delivery time?', 'ডেলিভারি টাইম কত?', 'Delivery takes 2-5 business days inside Dhaka and 3-7 days outside Dhaka.', 'ঢাকার ভিতরে ডেলিভারি ২-৫ কার্যদিবস এবং ঢাকার বাইরে ৩-৭ কার্যদিবস সময় লাগে।', 2, 'active'),
('How to contact support?', 'সাপোর্ট কিভাবে যোগাযোগ করব?', 'You can contact us via WhatsApp, phone, or email.', 'আপনি WhatsApp, ফোন বা ইমেইলের মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারেন।', 3, 'active');
