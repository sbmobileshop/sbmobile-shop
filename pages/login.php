<?php
/**
 * Login Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

if (auth_check()) {
    redirect('/');
}

$pageTitle = 'Login';
$language = $_COOKIE['language'] ?? 'en';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = $language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড দিন' : 'Email and password are required';
    } else {
        $user = Database::fetch("SELECT * FROM users WHERE email = ? AND status != 'blocked'", [$email]);
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            
            // Update last login
            Database::update('users', ['updated_at' => date('Y-m-d H:i:s')], 'id = ?', [$user['id']]);
            log_activity('login', 'User logged in');
            
            $redirect = flash('redirect_url') ?: ($user['role'] === 'admin' ? '/admin/' : '/');
            redirect($redirect);
        } else {
            $error = $language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল' : 'Invalid email or password';
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
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', 'Hind Siliguri', sans-serif; }
        [lang="bn"] * { font-family: 'Hind Siliguri', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, hsl(213 50% 23%) 0%, hsl(142 70% 45%) 100%); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex">
    <!-- Left Side - Form -->
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
                    <?php echo $language === 'bn' ? 'লগইন করুন' : 'Welcome Back'; ?>
                </h1>
                <p class="text-gray-500">
                    <?php echo $language === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Sign in to your account'; ?>
                </p>
            </div>
            
            <?php if ($error): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <i class="fas fa-exclamation-circle"></i>
                <?php echo escape($error); ?>
            </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'ইমেইল' : 'Email Address'; ?>
                    </label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="email" name="email" value="<?php echo escape(old('email')); ?>" required
                               class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="your@email.com">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <?php echo $language === 'bn' ? 'পাসওয়ার্ড' : 'Password'; ?>
                    </label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="password" name="password" required
                               class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                               placeholder="••••••••">
                        <button type="button" onclick="togglePassword()" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye" id="toggleIcon"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="remember" class="w-4 h-4 text-accent rounded">
                        <span class="text-sm text-gray-600"><?php echo $language === 'bn' ? 'মনে রাখুন' : 'Remember me'; ?></span>
                    </label>
                    <a href="/pages/forgot-password.php" class="text-sm text-accent hover:underline">
                        <?php echo $language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'; ?>
                    </a>
                </div>
                
                <button type="submit" class="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <i class="fas fa-sign-in-alt"></i>
                    <?php echo $language === 'bn' ? 'লগইন করুন' : 'Sign In'; ?>
                </button>
            </form>
            
            <div class="mt-8 text-center">
                <p class="text-gray-600">
                    <?php echo $language === 'bn' ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"; ?>
                    <a href="/pages/register.php" class="text-accent font-semibold hover:underline">
                        <?php echo $language === 'bn' ? 'রেজিস্টার করুন' : 'Register'; ?>
                    </a>
                </p>
            </div>
            
            <div class="mt-6 text-center">
                <a href="/" class="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2">
                    <i class="fas fa-arrow-left"></i>
                    <?php echo $language === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home'; ?>
                </a>
            </div>
        </div>
    </div>
    
    <!-- Right Side - Image -->
    <div class="hidden lg:block lg:w-1/2 gradient-bg">
        <div class="h-full flex flex-col items-center justify-center p-12 text-white text-center">
            <i class="fas fa-shopping-bag text-8xl mb-8 opacity-80"></i>
            <h2 class="text-4xl font-bold mb-4">
                <?php echo $language === 'bn' ? 'স্বাগতম!' : 'Welcome Back!'; ?>
            </h2>
            <p class="text-xl opacity-80 max-w-md">
                <?php echo $language === 'bn' 
                    ? 'আপনার প্রিয় পণ্য এবং সেবা সমূহ অ্যাক্সেস করতে লগইন করুন।' 
                    : 'Login to access your favorite products and services.'; ?>
            </p>
        </div>
    </div>
</body>
</html>

<script>
function togglePassword() {
    const input = document.querySelector('input[name="password"]');
    const icon = document.getElementById('toggleIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
</script>
