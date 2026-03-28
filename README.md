# SB Mobile Shop - PHP/MySQL E-Commerce Platform

A complete e-commerce solution with digital products, physical products, web tools sharing, and full admin control. Ready for cPanel hosting.

## Features

### E-Commerce Features
- **Products**: Physical and Digital products support
- **Categories**: Unlimited categories with images
- **Cart**: Session-based shopping cart
- **Checkout**: Multiple payment methods (bKash, Nagad, Rocket, Cash on Delivery)
- **Orders**: Full order management with status tracking
- **Coupons**: Discount codes with usage limits
- **Reviews**: Product rating and reviews system

### Web Tools
- **Free Tools Section**: Share web tools with share buttons
- **Services**: Display services you offer
- **Courses**: Digital courses section

### Admin Panel
- **Dashboard**: Sales overview, recent orders, stats
- **Products Management**: Full CRUD with image upload
- **Categories Management**: Organized categories
- **Orders Management**: Status updates, order details
- **Customers**: View registered customers
- **Coupons**: Create discount codes
- **Settings**: Full site control

### Settings Control (Admin Uploadable)
- **Favicon**: Upload site favicon
- **OG Image**: Upload Open Graph image
- **Cover Image**: Upload site cover image
- **Hero Section**: Background image, title, subtitle, CTA
- **Notice Board**: Promotional banner and notice text
- **Payment Methods**: bKash, Nagad, Rocket, Binance numbers
- **Footer**: About text, social links
- **Theme**: Color customization
- **SEO**: Meta title, description, keywords

### Bilingual Support
- English and Bangla language support
- Toggle between languages

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- PDO PHP Extension
- GD PHP Extension (for image processing)
- mbstring PHP Extension

## Installation on cPanel

### Method 1: Auto Installer (Recommended)

1. **Upload Files**
   - Log in to your cPanel
   - Go to File Manager
   - Navigate to `public_html` or your domain folder
   - Upload all files from this package

2. **Create Database**
   - Go to MySQL Databases in cPanel
   - Create a new database (e.g., `sb_mobile_shop`)
   - Create a new user and assign to the database

3. **Run Installer**
   - Visit your domain: `https://yourdomain.com/install.php`
   - Follow the step-by-step installation wizard
   - Enter your database credentials
   - Create admin account

4. **Login to Admin**
   - Go to `https://yourdomain.com/admin/`
   - Use your admin credentials

### Method 2: Manual Installation

1. **Upload Files** to `public_html`

2. **Create Database** in cPanel

3. **Import Database**
   - Go to phpMyAdmin
   - Select your database
   - Import `database/schema.sql`

4. **Configure**
   - Copy `includes/config.example.php` to `includes/config.php`
   - Edit with your database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_db_name');
   define('DB_USER', 'your_db_user');
   define('DB_PASS', 'your_db_password');
   define('SITE_URL', 'https://yourdomain.com');
   ```

5. **Create Admin User**
   - Insert manually in phpMyAdmin:
   ```sql
   INSERT INTO users (email, password, name, role) 
   VALUES ('admin@yourdomain.com', '$2y$10$YOUR_HASHED_PASSWORD', 'Admin', 'admin');
   ```
   - Generate password hash with: `echo password_hash('yourpassword', PASSWORD_DEFAULT);`

6. **Secure Files**
   - Delete `install.php` after installation
   - Ensure `.htaccess` is in place

## Default Admin Credentials

After installation via installer:
- **Email**: The email you provided
- **Password**: The password you set

## File Structure

```
sb-mobile-shop/
├── admin/              # Admin panel
│   ├── index.php       # Admin layout
│   └── admin-content.php
├── api/                # API endpoints
│   ├── cart.php
│   ├── products.php
│   ├── review.php
│   └── search.php
├── assets/
│   └── uploads/        # Uploaded files
├── database/
│   └── schema.sql      # Database structure
├── includes/
│   ├── config.example.php
│   ├── database.class.php
│   ├── functions.php
│   ├── header.php
│   ├── footer.php
│   └── session.php
├── pages/
│   ├── index.php       # Homepage
│   ├── products.php
│   ├── product.php
│   ├── cart.php
│   ├── checkout.php
│   ├── order-success.php
│   ├── login.php
│   ├── register.php
│   └── logout.php
├── install.php         # Installation wizard
├── .htaccess           # Apache configuration
└── README.md
```

## Admin Panel Features

### Dashboard
- Total products, orders, customers count
- Pending orders alert
- Recent orders list
- Recent products list

### Products Management
- Add/Edit/Delete products
- Upload product images
- Set product type (Physical/Digital)
- Set prices, stock, SKU
- Featured products flag
- SEO meta fields (title, description, keywords, OG image)
- Specifications (key-value pairs)

### Categories Management
- Add/Edit categories
- Category images
- Sort order
- Active/Inactive status

### Orders Management
- View all orders
- Update order status (Pending → Confirmed → Processing → Shipped → Delivered)
- Add admin notes
- View order items

### Coupons
- Create discount codes
- Percentage or Fixed amount
- Min order amount
- Usage limits
- Validity dates

### Settings
- **Site Info**: Shop name, logo, phone, email, WhatsApp
- **Hero Banner**: Background image, title, subtitle, CTA button
- **Banner/Notice**: Top banner text, notice board
- **Payment Methods**: bKash, Nagad, Rocket numbers
- **Footer**: About text, social media links

### Web Tools Management
- Add unlimited tools
- Custom titles (EN/BN)
- Links to external tools
- Custom button text

### Services & Courses
- Manage services section
- Manage digital courses
- Add links and descriptions

## Payment Integration

The script supports:
- **bKash** - Personal/Merchant
- **Nagad**
- **Rocket**
- **Binance** - Wallet ID
- **Cash on Delivery**

Transaction ID verification included in checkout.

## Security Features

- Password hashing (bcrypt)
- Session security
- CSRF protection ready
- SQL injection prevention (PDO prepared statements)
- XSS prevention (output escaping)
- File upload validation
- .htaccess protection

## Customization

### Change Theme Colors

In admin panel → Settings → Theme:
- Primary color
- Accent color
- Background colors

Or edit `tailwind.config.js`:
```javascript
colors: {
    primary: 'hsl(213 50% 23%)',
    accent: 'hsl(142 70% 45%)',
}
```

### Add Payment Gateway

Edit `includes/functions.php` → `get_payment_config()`

### Modify Email Templates

Update order confirmation emails in `pages/checkout.php`

## Troubleshooting

### Database Connection Error
- Verify credentials in `config.php`
- Check if MySQL user has proper permissions

### Blank Page
- Enable error reporting in `config.php`:
  ```php
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  ```

### Images Not Uploading
- Check `assets/uploads/` permissions (755)
- Verify PHP `upload_max_filesize`

### 500 Internal Server Error
- Check `.htaccess` is present
- Verify mod_rewrite is enabled

## Support

For issues or questions:
- Create an issue on the repository
- Email: support@sbmobile.shop

## License

This script is free to use for personal and commercial projects.

---

**Made with ❤️ for Bangladesh**
