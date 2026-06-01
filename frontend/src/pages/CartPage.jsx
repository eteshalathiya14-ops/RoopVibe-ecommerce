import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import { FiMinus, FiPlus, FiX, FiShoppingBag } from 'react-icons/fi';

const GOLD = "#C9A96E";
const CHARCOAL = "#1A1A1A";
const MUTED = "#6B6560";
const BORDER = "#EDE8E0";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <FiShoppingBag size={80} color={BORDER} />
        <h2 style={{ marginTop: '24px', fontSize: '24px', color: CHARCOAL }}>Your cart is empty</h2>
        <p style={{ marginTop: '8px', color: MUTED }}>Add some items to your cart to see them here.</p>
        <Link to="/" style={{ marginTop: '24px', padding: '12px 32px', backgroundColor: GOLD, color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="rv-cart-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
      <h1 className="rv-cart-title" style={{ fontSize: '28px', color: CHARCOAL, marginBottom: '32px', fontFamily: 'Georgia, serif' }}>Your Shopping Bag ({cartCount})</h1>

      <div className="rv-cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
        {/* Items List */}
        <div className="rv-cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
              <img src={item.img} alt={item.title} style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '16px', color: CHARCOAL }}>{item.title}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FiX /> Remove
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: MUTED, marginTop: '4px' }}>By {item.by}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: '4px' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', display:'flex' }}><FiMinus /></button>
                    <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', display:'flex' }}><FiPlus /></button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                    {item.quantity > 1 && <p style={{ fontSize: '11px', color: MUTED }}>₹{item.price} each</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rv-cart-summary" style={{ position: 'sticky', top: '100px', height: 'fit-content', padding: '24px', backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: `1px solid ${BORDER}`, paddingBottom: '12px' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: MUTED }}>Total items</span>
            <span>{cartCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Total Amount</span>
            <span>₹{cartTotal}</span>
          </div>
          <button style={{ width: '100%', padding: '14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            Checkout Now
          </button>
          <p style={{ marginTop: '16px', fontSize: '12px', color: MUTED, textAlign: 'center' }}>
            Safe and Secure Payments. 100% Authentic products.
          </p>
        </div>
      </div>
      <div className="rv-cart-bottom-spacer" />
    </div>
  );
}
