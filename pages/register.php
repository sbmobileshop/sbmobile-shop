<?php
/**
 * Register Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

if (auth_check()) {
    redirect('/');
}

$pageTitle = 'Register';
$language = $_COOKIE['language'] ?? 'en';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    if (empty($name) || empty($email) || empty($phone) || empty($password)) {
        $error = $language === 'bn' ? 'সব ফিল্ড পূরণ করুন' : 'All fields are required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = $language === 'bn' ? 'সঠিক ইমেইল দিন' : 'Please enter a valid email';
    } elseif (strlen($password) < 6) {
        $error = $language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : 'Password must be at least 6 characters';
    } elseif ($password !== $confirmPassword) {
        $error = $language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match';
    } else {
        // Check if email exists
        $existing = Database::fetch("SELECT id FROM users WHERE email = ?", [$email]);
        if ($existing) {
            $error = $language === 'bn' ? 'এই ইমেইল ইতিমধ্যে ব্যবহৃত' : 'Email already exists';
        } else {
            $userId = Database::insert('users', [
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'role' => 'customer',
                'status' => 'active',
            ]);
            
            $_SESSION['user_id'] = $userId;
            log_activity('register', 'New user registered');
            
            flash('success', $language === 'bn' ? 'রেজিস্ট্রেশন সফল!' : 'Registration successful!');
            redirect('/');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="<?php echo $language === 'bn' ? 'bn' : 'en'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo escape($pageTitle); ?> - SB Mobile Shop</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex">
    <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
            <div class="text-center mb-8">
                <a href="/" class="inline-flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                        <i class="fas fa-store text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold text-gray-900">SB Mobile Shop</span>
                </a>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <?php echo $language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'; ?>
                </h1>
                <p class="text-gray-500">
                    <?php echo $language === 'bn' ? 'নতুন অ্যাকাউন্ট রেজিস্টার করুন' : 'Register a new account'; ?>
                </p>
            </div>
            
            <?php if ($error): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <?php echo escape($error); ?>
            </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'; ?> *
                    </label>
                    <div class="relative">
                        <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="name" value="<?php echo escape(old('name')); ?>" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                               placeholder="<?php echo $language === 'bn' ? 'আপনার নাম' : 'Your name'; ?>">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'ইমেইল' : 'Email Address'; ?> *
                    </label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="email" name="email" value="<?php echo escape(old('email')); ?>" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                               placeholder="your@email.com">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'; ?> *
                    </label>
                    <div class="relative">
                        <i class="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="tel" name="phone" value="<?php echo escape(old('phone')); ?>" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                               placeholder="01XXXXXXXXX">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'পাসওয়ার্ড' : 'Password'; ?> *
                    </label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="password" name="password" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                               placeholder="••••••••">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'; ?> *
                    </label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="password" name="confirm_password" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                               placeholder="••••••••">
                    </div>
                </div>
                
                <button type="submit" class="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <i class="fas fa-user-plus"></i>
                    <?php echo $language === 'bn' ? 'রেজিস্টার করুন' : 'Create Account'; ?>
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-gray-600">
                    <?php echo $language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'; ?>
                    <a href="/pages/login.php" class="text-accent font-semibold hover:underline">
                        <?php echo $language === 'bn' ? 'লগইন করুন' : 'Sign In'; ?>
                    </a>
                </p>
            </div>
        </div>
    </div>
    
    <div class="hidden lg:block lg:w-1/2 gradient-bg">
        <div class="h-full flex flex-col items-center justify-center p-12 text-white text-center">
            <i class="fas fa-user-plus text-8xl mb-8 opacity-80"></i>
            <h2 class="text-4xl font-bold mb-4">
                <?php echo $language === 'bn' ? 'যোগ দিন আমাদের সাথে!' : 'Join Us Today!'; ?>
            </h2>
            <p class="text-xl opacity-80 max-w-md">
                <?php echo $language === 'bn' 
                    ? 'রেজিস্টার করে সেরা পণ্য এবং অফার পান।' 
                    : 'Register to get the best products and exclusive offers.'; ?>
            </p>
        </div>
    </div>
</body>
</html>
