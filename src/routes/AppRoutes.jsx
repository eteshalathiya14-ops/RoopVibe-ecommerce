import { Routes, Route } from 'react-router-dom';
import HomePage from '../component/Homepage';
import CategoryPage from '../pages/Categorypage';
import SearchPage from '../pages/SearchPage';
import CartPage from '../pages/CartPage';
import { navLinks } from '../Data/Navdata.jsx';
import NotFoundPage from '../pages/NotFoundPage';
import ProductDetailPage from '../pages/ProductDetails.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import AddressPage from '../pages/AddressPage.jsx';
import OffersPage from '../pages/Offerspage.jsx';
import MobileCategoryIndex from '../pages/MobileCategoryIndex.jsx';
import WishlistPage from '../pages/WishlistPage.jsx';
import ProfilePage from '../pages/Profilepage.jsx';
import MyOrdersPage from '../pages/Myorder.jsx';
import ReturnReplacementPage from '../pages/Returnreplacementpage.jsx';
import CustomerSupportPage from '../pages/Customersupportpage.jsx';
import FAQPage from '../pages/Faqpage.jsx';
import PrivacyPolicyPage from '../pages/Privacypolicypage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                              element={<HomePage />} />

      <Route path="/category/:gender/:subcategory" element={<CategoryPage />} />
       <Route path="/categories" element={<MobileCategoryIndex />} />
      <Route path="/search"                        element={<SearchPage />} />
      <Route path="/cart"                          element={<CartPage />} />
      <Route path="/login"                         element={<LoginPage />} />
      <Route path="/profile"                       element={<ProfilePage />} />   
      <Route path="/orders"                        element={<MyOrdersPage />} />
      <Route path="/returns"  element={<ReturnReplacementPage />} />
      <Route path="/support"  element={<CustomerSupportPage />} />
      <Route path="/faq"      element={<FAQPage />} />
      <Route path="/privacy"  element={<PrivacyPolicyPage />} />
      <Route path="/checkout"                      element={<AddressPage />} />
      <Route path="/product/:id"                   element={<ProductDetailPage />} />
      <Route path="/offers"                        element={<OffersPage />} />
      <Route path="/wishlist"                      element={<WishlistPage />} />

      <Route path="*"                              element={<NotFoundPage navLinks={navLinks} />} />
    </Routes>
  );
}