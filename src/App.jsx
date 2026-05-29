import './App.css'
import './Style/Mobile.css'
import Navbar from './component/Navbar'
import AppRoutes from './routes/AppRoutes'
import MobileBottomNav from './component/Mobilebottomnav'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { WishlistProvider } from './context/WishlistContext'


export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <MobileBottomNav />
          </WishlistProvider>
        </CartProvider>

      </AuthProvider>
    </LanguageProvider>
  );
}