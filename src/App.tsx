import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import Index from "./pages/Index";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LandingPageView from "./pages/LandingPageView";
import FraudCheckerPage from "./pages/FraudCheckerPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminGuard from "./components/AdminGuard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPOS from "./pages/admin/AdminPOS";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminLandingPages from "./pages/admin/AdminLandingPages";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSpinWheel from "./pages/admin/AdminSpinWheel";
import AdminChat from "./pages/admin/AdminChat";
import AdminDeliveryZones from "./pages/admin/AdminDeliveryZones";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
            <SoundProvider>
            <WishlistProvider>
            <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/landing/:slug" element={<LandingPageView />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/fraud-checker" element={<FraudCheckerPage />} />

                {/* Admin routes — protected by AdminGuard */}
                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="pos" element={<AdminPOS />} />
                    <Route path="payment-settings" element={<AdminPaymentSettings />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="landing-pages" element={<AdminLandingPages />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="spin-wheel" element={<AdminSpinWheel />} />
                    <Route path="chat" element={<AdminChat />} />
                    <Route path="delivery-zones" element={<AdminDeliveryZones />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="admin-management" element={<AdminManagement />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
            </WishlistProvider>
            </SoundProvider>
      </LanguageProvider>
    </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
