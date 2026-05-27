import './App.css'
import './Style/Mobile.css'
import Navbar from './component/Navbar'
import AppRoutes from './routes/AppRoutes'
import MobileBottomNav from './component/MobileBottomNav'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <AppRoutes />
          </main>
          <MobileBottomNav />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}