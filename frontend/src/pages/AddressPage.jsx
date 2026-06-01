import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  FiMapPin, FiPhone, FiUser, FiCreditCard, FiTruck,
  FiChevronRight, FiCheck, FiLock, FiTag, FiChevronDown, FiShield, FiSmartphone, FiDollarSign, FiHome, FiBriefcase, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

const GOLD = '#C9A96E';
const GOLD_DARK = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL = '#1A1A1A';
const SURFACE = '#F4F1EB';
const BORDER = '#E8E0D5';
const GREEN = '#2E7D32';
const GREEN_LIGHT = '#E8F5E9';

const STEPS = ['Cart', 'Address', 'Payment', 'Summary'];

// ── Mobile hook ──────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// ── StepBar ──────────────────────────────────────────
function StepBar({ current }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '0 12px' : '0 24px', overflowX: 'auto' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', height: isMobile ? 'auto' : '60px', padding: isMobile ? '10px 0' : '0', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '8px' : '0' }}>
        {/* Logo */}
        {!isMobile && (
          <div style={{ marginRight: '48px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: '800' }}>R</span>
            </div>
            <span style={{ fontWeight: '800', fontSize: '16px', color: CHARCOAL, fontFamily: "'Playfair Display', serif" }}>RoopVibe</span>
          </div>
        )}

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'nowrap', overflowX: isMobile ? 'auto' : 'visible' }}>
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>
                  <div style={{
                    width: isMobile ? '20px' : '24px',
                    height: isMobile ? '20px' : '24px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? '10px' : '11px', fontWeight: '800',
                    backgroundColor: done ? GREEN : active ? GOLD : '#E8E0D5',
                    color: done || active ? '#fff' : '#aaa', flexShrink: 0,
                  }}>
                    {done ? <FiCheck size={10} /> : i + 1}
                  </div>
                  <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: active ? '700' : '500', color: active ? CHARCOAL : done ? GREEN : '#aaa', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: isMobile ? '20px' : '40px', height: '1px', backgroundColor: i < current ? GREEN : BORDER, margin: isMobile ? '0 6px' : '0 10px', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Secure badge */}
        <div style={{ marginLeft: isMobile ? '0' : 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px' }}>
          <FiLock size={13} color={GREEN} />
          <span>100% Secure</span>
        </div>
      </div>
    </div>
  );
}

// ── Order Summary Panel (outside main component to avoid static-components error) ──
function OrderSummaryPanel({ coupon, setCoupon, setCouponError, couponApplied, couponError, applyCoupon, discount, cartTotal, cartItems, paymentMethod, finalTotal, isMobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Coupon */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '16px 20px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiTag size={13} color={GOLD_DARK} /> COUPON CODE
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${couponApplied ? GREEN : couponError ? '#e53935' : BORDER}`, outline: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', fontFamily: 'inherit', color: CHARCOAL, height: isMobile ? '44px' : 'auto' }}
            placeholder="Try ROOP10" />
          <button onClick={applyCoupon}
            style={{ padding: '10px 16px', backgroundColor: couponApplied ? GREEN_LIGHT : GOLD_LIGHT, border: `1.5px solid ${couponApplied ? GREEN : GOLD}`, borderRadius: '8px', fontWeight: '700', fontSize: '12px', color: couponApplied ? GREEN : GOLD_DARK, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {couponApplied ? '✓ Applied' : 'Apply'}
          </button>
        </div>
        {couponApplied && <p style={{ fontSize: '12px', color: GREEN, fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheckCircle size={14} color={GREEN} /> Saving ₹{discount}!</p>}
        {couponError && <p style={{ fontSize: '12px', color: '#e53935', marginTop: '6px' }}>{couponError}</p>}
      </div>

      {/* Price Breakdown */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: CHARCOAL, marginBottom: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Price Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: `Price (${cartItems.length} items)`, value: `₹${cartTotal}`, color: '#555' },
            { label: 'Delivery Charges', value: 'FREE', color: GREEN },
            { label: 'Platform Fee', value: '₹0', color: GREEN },
            ...(couponApplied ? [{ label: 'Coupon (ROOP10)', value: `-₹${discount}`, color: GREEN }] : []),
            ...(paymentMethod === 'cod' ? [{ label: 'COD Fee', value: '₹40', color: '#e53935' }] : []),
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>{row.label}</span>
              <span style={{ fontWeight: '600', color: row.color }}>{row.value}</span>
            </div>
          ))}
          <div style={{ height: '1px', backgroundColor: BORDER, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: CHARCOAL }}>Total Amount</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: GOLD_DARK }}>₹{paymentMethod === 'cod' ? finalTotal + 40 : finalTotal}</span>
          </div>
        </div>
        {couponApplied && (
          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: GREEN_LIGHT, borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: GREEN, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FiCheckCircle size={14} color={GREEN} /> You're saving ₹{discount}!
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '16px 20px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '12px' }}>
          ORDER ITEMS ({cartItems.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cartItems.slice(0, 3).map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <img src={item.img || item.images?.[0]} alt={item.title} style={{ width: '48px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${BORDER}`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: CHARCOAL, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontSize: '11px', color: '#aaa' }}>Qty: {item.quantity}</p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '800', color: GOLD_DARK, flexShrink: 0 }}>₹{item.price}</p>
            </div>
          ))}
          {cartItems.length > 3 && (
            <p style={{ fontSize: '12px', color: GOLD_DARK, fontWeight: '700', textAlign: 'center' }}>
              + {cartItems.length - 3} more items
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────
export default function AddressPage() {
  const { cartItems, cartTotal } = useCart();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Generate order ID once — lazy useState initializer runs only on mount, not on re-render
  const [orderId] = useState(() => Math.floor(Math.random() * 900000 + 100000));

  const [step, setStep] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savedAddress, setSavedAddress] = useState(null);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ── Load saved address from localStorage (autofill) ──
  const getSavedForm = () => {
    try {
      const saved = localStorage.getItem('rv_saved_address');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    return null;
  };

  const [formData, setFormData] = useState(() => {
    const saved = getSavedForm();
    return saved || {
      name: user?.name || '',
      phone: '',
      pincode: '',
      address: '',
      city: '',
      state: '',
      type: 'home',
    };
  });

  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal = cartTotal - discount;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'ROOP10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: '12px',
    paddingLeft: '40px',
    borderRadius: '10px',
    border: `1.5px solid ${focusedField === name ? GOLD : BORDER}`,
    outline: 'none',
    fontSize: '14px',
    color: CHARCOAL,
    backgroundColor: focusedField === name ? '#FFFDF9' : '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    boxShadow: focusedField === name ? `0 0 0 3px rgba(201,169,110,0.12)` : 'none',
    fontFamily: 'inherit',
    height: '48px',
  });

  const plainInput = (name) => ({
    ...inputStyle(name),
    paddingLeft: '12px',
  });

  const payMethods = [
    { id: 'card', icon: <FiCreditCard size={18} />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay' },
    { id: 'upi', icon: <FiSmartphone size={18} />, label: 'UPI', sub: 'GPay, PhonePe, Paytm' },
    { id: 'netbanking', icon: <FiDollarSign size={18} />, label: 'Net Banking', sub: 'All major banks' },
    { id: 'cod', icon: <FiTruck size={18} />, label: 'Cash on Delivery', sub: 'Pay on arrival' },
    { id: 'emi', icon: <FiTag size={18} />, label: 'EMI', sub: 'No cost EMI' },
  ];

  const banks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB', 'Bank of Baroda', 'Yes Bank'];

  // Shared props for OrderSummaryPanel
  const summaryProps = {
    coupon, setCoupon, setCouponError, couponApplied, couponError, applyCoupon,
    discount, cartTotal, cartItems, paymentMethod, finalTotal, isMobile,
  };

  // ── Order Placed ─────────────────────────────────
  if (orderPlaced) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} } @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
        <StepBar current={3} />
        <div style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: SURFACE, fontFamily: "'DM Sans', sans-serif", padding: isMobile ? '24px 16px' : '0' }}>
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: GREEN_LIGHT, border: `3px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'popIn 0.5s ease' }}>
              <FiCheck size={40} color={GREEN} strokeWidth={3} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: CHARCOAL, marginBottom: '8px' }}>Order Placed!</h2>
            <p style={{ fontSize: '15px', color: '#777', marginBottom: '6px' }}>Thank you for shopping with RoopVibe <FiCheckCircle size={16} color={GOLD} style={{ verticalAlign: 'middle' }} /></p>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '32px' }}>Order confirmation sent to your email</p>
            <div style={{ backgroundColor: '#fff', padding: '20px 32px', borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'inline-block', marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>ORDER ID</p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: CHARCOAL }}>#RV{orderId}</p>
            </div>
            <div>
              <button onClick={() => window.location.href = '/'} style={{ padding: '14px 40px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0} to{opacity:1} }
        .section-card { animation: fadeUp 0.2s ease; }
        .pay-option:hover { border-color: ${GOLD} !important; background-color: #FFFDF9 !important; }
        .proceed-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(160,120,64,0.4) !important; }
        .addr-type-btn:hover { border-color: ${GOLD} !important; }
        textarea { font-family: 'DM Sans', sans-serif; }
        .pay-methods-mobile { display: flex; overflow-x: auto; gap: 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .pay-methods-mobile::-webkit-scrollbar { display: none; }
        .rv-addr-input {
          height: 48px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          padding-right: 12px !important;
          padding-left: 40px !important;
          font-size: 14px !important;
          box-sizing: border-box !important;
        }
        .rv-addr-plain {
          height: 48px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          padding-right: 12px !important;
          padding-left: 12px !important;
          font-size: 14px !important;
          box-sizing: border-box !important;
        }
      `}</style>

      <StepBar current={step} />

      <div style={{ backgroundColor: SURFACE, minHeight: 'calc(100vh - 128px)', padding: isMobile ? '16px 12px 100px' : '28px 20px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1fr',
          gap: isMobile ? '16px' : '28px',
          alignItems: 'start',
        }}>

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── STEP 1: ADDRESS ── */}
            {step === 1 && (
              <div className="section-card" style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                {/* Header */}
                <div style={{ padding: isMobile ? '16px 20px' : '20px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>1</span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: CHARCOAL }}>Delivery Address</h2>
                    <p style={{ fontSize: '12px', color: '#888' }}>Where should we deliver?</p>
                  </div>
                </div>

                <div style={{ padding: isMobile ? '20px 16px' : '28px' }}>
                  {/* Address type */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '10px' }}>ADDRESS TYPE</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {['home', 'work', 'other'].map(type => (
                        <button key={type} className="addr-type-btn"
                          onClick={() => setFormData(p => ({ ...p, type }))}
                          style={{
                            padding: '9px 18px', borderRadius: '20px', border: `1.5px solid ${formData.type === type ? GOLD : BORDER}`,
                            backgroundColor: formData.type === type ? GOLD_LIGHT : '#fff',
                            color: formData.type === type ? GOLD_DARK : '#777',
                            fontWeight: formData.type === type ? '700' : '500',
                            fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                            minHeight: '40px',
                          }}>
                          {type === 'home' ? <FiHome size={14} /> : type === 'work' ? <FiBriefcase size={14} /> : <FiMapPin size={14} />}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '18px' }}>
                    {/* Full Name */}
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>FULL NAME *</label>
                      <div style={{ position: 'relative' }}>
                        <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'name' ? GOLD : '#ccc', transition: 'color 0.2s', zIndex: 1 }} />
                        <input name="name" value={formData.name} onChange={handleInput}
                          onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                          className="rv-addr-input" style={inputStyle('name')} placeholder="Enter your full name" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>PHONE NUMBER *</label>
                      <div style={{ position: 'relative' }}>
                        <FiPhone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'phone' ? GOLD : '#ccc', zIndex: 1 }} />
                        <input name="phone" value={formData.phone} onChange={handleInput}
                          onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                          className="rv-addr-input" style={inputStyle('phone')} placeholder="+91 mobile number" maxLength={10} />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>PINCODE *</label>
                      <div style={{ position: 'relative' }}>
                        <FiMapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'pincode' ? GOLD : '#ccc', zIndex: 1 }} />
                        <input name="pincode" value={formData.pincode} onChange={handleInput}
                          onFocus={() => setFocusedField('pincode')} onBlur={() => setFocusedField(null)}
                          className="rv-addr-input" style={inputStyle('pincode')} placeholder="6-digit pincode" maxLength={6} />
                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>FULL ADDRESS *</label>
                      <textarea name="address" value={formData.address} onChange={handleInput}
                        onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1.5px solid ${focusedField === 'address' ? GOLD : BORDER}`, outline: 'none', minHeight: '90px', resize: 'none', fontSize: '14px', color: CHARCOAL, backgroundColor: focusedField === 'address' ? '#FFFDF9' : '#fff', transition: 'all 0.2s', boxShadow: focusedField === 'address' ? `0 0 0 3px rgba(201,169,110,0.12)` : 'none', boxSizing: 'border-box' }}
                        placeholder="House no, Building, Street, Area, Landmark" />
                    </div>

                    {/* City */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>CITY *</label>
                      <input name="city" value={formData.city} onChange={handleInput}
                        onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)}
                        className="rv-addr-plain" style={plainInput('city')} placeholder="City" />
                    </div>

                    {/* State */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>STATE *</label>
                      <div style={{ position: 'relative' }}>
                        <select name="state" value={formData.state} onChange={handleInput}
                          onFocus={() => setFocusedField('state')} onBlur={() => setFocusedField(null)}
                          className="rv-addr-plain" style={{ ...plainInput('state'), appearance: 'none', paddingRight: '32px', cursor: 'pointer', width: '100%' }}>
                          <option value="">Select State</option>
                          {['Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <FiChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div style={{ marginTop: '20px', padding: '14px 16px', backgroundColor: GREEN_LIGHT, borderRadius: '8px', border: `1px solid #C8E6C9`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiTruck size={18} color={GREEN} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: GREEN }}>Free Express Delivery</p>
                      <p style={{ fontSize: '12px', color: '#555' }}>Estimated delivery in 2-4 business days</p>
                    </div>
                  </div>

                  <button onClick={() => { try { localStorage.setItem("rv_saved_address", JSON.stringify(formData)); } catch { /* ignore */ } setSavedAddress(formData); setStep(2); }} className="proceed-btn"
                    style={{ marginTop: '24px', width: '100%', padding: '15px', background: `linear-gradient(to right, ${GOLD_DARK}, ${GOLD})`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', letterSpacing: '0.5px', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(160,120,64,0.3)', minHeight: '50px' }}>
                    CONTINUE TO PAYMENT <FiChevronRight />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <>
                {/* Saved Address Summary */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={16} color={GREEN} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: CHARCOAL }}>{savedAddress?.name} — {savedAddress?.type?.toUpperCase()}</p>
                      <p style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{savedAddress?.address}, {savedAddress?.city} — {savedAddress?.pincode}</p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: '12px', fontWeight: '700', color: GOLD_DARK, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', flexShrink: 0, marginLeft: '8px' }}>
                    Change
                  </button>
                </div>

                {/* Payment Card */}
                <div className="section-card" style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  {/* Header */}
                  <div style={{ padding: isMobile ? '16px' : '20px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>2</span>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: '800', color: CHARCOAL }}>Payment Method</h2>
                      <p style={{ fontSize: '12px', color: '#888' }}>Secure & encrypted</p>
                    </div>
                    {!isMobile && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        {['visa', 'mc', 'upi', 'gpay'].map(b => (
                          <div key={b} style={{ padding: '4px 8px', backgroundColor: '#F5F5F5', borderRadius: '4px', fontSize: '9px', fontWeight: '800', color: '#555', letterSpacing: '0.5px' }}>
                            {b.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── MOBILE: Horizontal scroll tabs + stacked panel ── */}
                  {isMobile ? (
                    <div>
                      {/* Scrollable method tabs */}
                      {/* FIX: duplicate borderBottom removed — only one border property now */}
                      <div className="pay-methods-mobile" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {payMethods.map(pm => (
                          <button key={pm.id}
                            onClick={() => setPaymentMethod(pm.id)}
                            style={{
                              flexShrink: 0, padding: '12px 14px',
                              border: 'none',
                              borderBottom: `3px solid ${paymentMethod === pm.id ? GOLD : 'transparent'}`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                              minWidth: '80px',
                              backgroundColor: paymentMethod === pm.id ? GOLD_LIGHT : '#fff',
                            }}>
                            <span style={{ color: paymentMethod === pm.id ? GOLD_DARK : '#888' }}>{pm.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: paymentMethod === pm.id ? '700' : '500', color: paymentMethod === pm.id ? CHARCOAL : '#777', whiteSpace: 'nowrap' }}>
                              {pm.label.split(' / ')[0].split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Detail panel */}
                      <div style={{ padding: '20px 16px' }}>
                        {renderPaymentPanel({ paymentMethod, cardData, setCardData, upiId, setUpiId, banks, finalTotal, focusedField, setFocusedField, plainInput, GOLD, GOLD_DARK, GOLD_LIGHT, GREEN, GREEN_LIGHT, BORDER, CHARCOAL, isMobile })}
                      </div>
                    </div>
                  ) : (
                    /* ── DESKTOP: Side panel layout ── */
                    <div style={{ display: 'flex', minHeight: '360px' }}>
                      <div style={{ width: '220px', borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>
                        {payMethods.map(pm => (
                          <div key={pm.id} className="pay-option"
                            onClick={() => setPaymentMethod(pm.id)}
                            style={{
                              padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s',
                              borderLeft: `3px solid ${paymentMethod === pm.id ? GOLD : 'transparent'}`,
                              backgroundColor: paymentMethod === pm.id ? GOLD_LIGHT : '#fff',
                              borderBottom: `1px solid ${BORDER}`,
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: paymentMethod === pm.id ? GOLD_DARK : '#888' }}>{pm.icon}</span>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: paymentMethod === pm.id ? '700' : '500', color: paymentMethod === pm.id ? CHARCOAL : '#555' }}>{pm.label}</p>
                                <p style={{ fontSize: '10px', color: '#aaa', marginTop: '1px' }}>{pm.sub}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ flex: 1, padding: '24px' }}>
                        {renderPaymentPanel({ paymentMethod, cardData, setCardData, upiId, setUpiId, banks, finalTotal, focusedField, setFocusedField, plainInput, GOLD, GOLD_DARK, GOLD_LIGHT, GREEN, GREEN_LIGHT, BORDER, CHARCOAL, isMobile })}
                      </div>
                    </div>
                  )}

                  {/* Pay button */}
                  <div style={{ padding: isMobile ? '16px' : '20px 28px', borderTop: `1px solid ${BORDER}` }}>
                    <button onClick={() => setOrderPlaced(true)} className="proceed-btn"
                      style={{ width: '100%', padding: '15px', background: `linear-gradient(to right, ${GOLD_DARK}, ${GOLD})`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', letterSpacing: '0.5px', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(160,120,64,0.3)', minHeight: '50px' }}>
                      <FiLock size={16} /> PAY ₹{paymentMethod === 'cod' ? finalTotal + 40 : finalTotal}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiShield size={12} color={GREEN} /> Secured by 256-bit SSL encryption
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* On mobile: show order summary BELOW the form */}
            {isMobile && (
              <div style={{ opacity: 1, transform: 'none' }}>
                <OrderSummaryPanel {...summaryProps} />
              </div>
            )}
          </div>

          {/* ═══════════ RIGHT COLUMN (desktop only) ═══════════ */}
          {!isMobile && (
            <div style={{ position: 'sticky', top: '88px' }}>
              <OrderSummaryPanel {...summaryProps} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Payment panel renderer (shared between mobile/desktop) ──
function renderPaymentPanel({ paymentMethod, cardData, setCardData, upiId, setUpiId, banks, finalTotal, setFocusedField, plainInput, GOLD, GOLD_DARK, GREEN, GREEN_LIGHT, BORDER, CHARCOAL, isMobile }) {
  if (paymentMethod === 'card') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>CARD NUMBER</label>
          <input value={cardData.number}
            onChange={e => setCardData(p => ({ ...p, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }))}
            style={{ ...plainInput('cardnum'), letterSpacing: '2px', fontSize: '15px', fontWeight: '600' }}
            onFocus={() => setFocusedField('cardnum')} onBlur={() => setFocusedField(null)}
            placeholder="0000 0000 0000 0000" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>NAME ON CARD</label>
          <input value={cardData.name} onChange={e => setCardData(p => ({ ...p, name: e.target.value }))}
            style={plainInput('cardname')} onFocus={() => setFocusedField('cardname')} onBlur={() => setFocusedField(null)}
            placeholder="As printed on card" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>EXPIRY</label>
            <input value={cardData.expiry} onChange={e => setCardData(p => ({ ...p, expiry: e.target.value }))}
              style={plainInput('expiry')} onFocus={() => setFocusedField('expiry')} onBlur={() => setFocusedField(null)}
              placeholder="MM / YY" maxLength={7} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.8px', marginBottom: '7px' }}>CVV</label>
            <input value={cardData.cvv} onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
              type="password" style={plainInput('cvv')} onFocus={() => setFocusedField('cvv')} onBlur={() => setFocusedField(null)}
              placeholder="3 digits" maxLength={3} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666', cursor: 'pointer' }}>
          <input type="checkbox" style={{ accentColor: GOLD }} />
          Save card for future payments
        </label>
      </div>
    );
  }

  if (paymentMethod === 'upi') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { name: 'GPay', color: '#1A73E8' },
            { name: 'PhonePe', color: '#5F259F' },
            { name: 'Paytm', color: '#00B9F1' },
            { name: 'BHIM', color: '#FF5722' },
          ].map(app => (
            <button key={app.name} style={{ padding: '14px', border: `1.5px solid ${BORDER}`, borderRadius: '10px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: CHARCOAL, fontFamily: 'inherit' }}>
              {app.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }} />
          <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '600' }}>OR ENTER UPI ID</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={upiId} onChange={e => setUpiId(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1.5px solid ${BORDER}`, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
            placeholder="yourname@upi" />
          <button style={{ padding: '12px 20px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Verify
          </button>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'netbanking') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.8px' }}>POPULAR BANKS</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: '10px' }}>
          {banks.map(bank => (
            <label key={bank} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: `1.5px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: CHARCOAL }}>
              <input type="radio" name="bank" style={{ accentColor: GOLD }} />
              {bank}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (paymentMethod === 'cod') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px 0' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiTruck size={30} color={GREEN} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: CHARCOAL, marginBottom: '6px' }}>Cash on Delivery</p>
          <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.6 }}>Pay ₹{finalTotal} in cash at delivery.</p>
        </div>
        <div style={{ padding: '10px 16px', backgroundColor: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', fontSize: '12px', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertTriangle size={14} /> Extra ₹40 COD convenience fee
        </div>
      </div>
    );
  }

  if (paymentMethod === 'emi') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.8px' }}>SELECT EMI PLAN</p>
        {[
          { months: 3, emi: Math.round(finalTotal / 3), bank: 'HDFC / ICICI / Axis', tag: 'No Cost' },
          { months: 6, emi: Math.round(finalTotal / 6), bank: 'All major cards', tag: 'No Cost' },
          { months: 9, emi: Math.round(finalTotal / 9 * 1.02), bank: 'All major cards', tag: '2% interest' },
          { months: 12, emi: Math.round(finalTotal / 12 * 1.04), bank: 'All major cards', tag: '4% interest' },
        ].map(plan => (
          <label key={plan.months} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `1.5px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="radio" name="emi" style={{ accentColor: GOLD }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: CHARCOAL }}>{plan.months} months</p>
                <p style={{ fontSize: '11px', color: '#aaa' }}>{plan.bank}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: GOLD_DARK }}>₹{plan.emi}/mo</p>
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', backgroundColor: plan.tag === 'No Cost' ? GREEN_LIGHT : '#FFF8E1', color: plan.tag === 'No Cost' ? GREEN : '#856404' }}>
                {plan.tag}
              </span>
            </div>
          </label>
        ))}
      </div>
    );
  }

  return null;
}