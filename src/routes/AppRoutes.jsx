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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:gender/:subcategory" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/checkout" element={<AddressPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="*" element={<NotFoundPage navLinks={navLinks} />} />
    </Routes>
  );
}

