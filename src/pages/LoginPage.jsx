import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiTag, FiTruck, FiSmile, FiGlobe } from 'react-icons/fi';

const GOLD = '#C9A96E';
const GOLD_DARK = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL = '#1A1A1A';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: 'Demo User', email });
    navigate(from, { replace: true });
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const perks = [
    { icon: <FiTag size={14} />, text: 'Exclusive member deals' },
    { icon: <FiTruck size={14} />, text: 'Free delivery on ₹499+' },
    { icon: <FiShield size={14} />, text: 'Safe & secure payments' },
  ];

  const inputStyle = (name) => ({
    width: '100%',
    height: '44px',
    padding: '13px 13px 13px 44px',
    borderRadius: '10px',
    border: `1.5px solid ${focusedInput === name ? GOLD : '#E8E0D5'}`,
    outline: 'none',
    fontSize: '14px',
    color: CHARCOAL,
    backgroundColor: focusedInput === name ? '#FFFDF9' : '#FAFAF8',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: focusedInput === name ? `0 0 0 3px rgba(201,169,110,0.15)` : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .login-card { animation: fadeUp 0.4s ease forwards; }
        .perk-item { animation: fadeUp 0.4s ease forwards; }
        .perk-item:nth-child(2) { animation-delay: 0.08s; }
        .perk-item:nth-child(3) { animation-delay: 0.16s; }
        .tab-btn { transition: all 0.2s; }
        .social-btn:hover { background-color: #f5f5f5 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .submit-btn:hover { background-position: right center !important; transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(160,120,64,0.4) !important; }
        .otp-input:focus { border-color: #C9A96E !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.2) !important; background: #FFFDF9 !important; }
      `}</style>

      <div style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        backgroundColor: '#FAF7F2',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Left Panel — Brand/Perks ── */}
        <div className="rv-login-left" style={{
          width: '42%',
          background: `linear-gradient(145deg, ${CHARCOAL} 0%, #2C2416 60%, #3D2E10 100%)`,
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Brand */}
          <div>
            <div style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '3px',
              color: GOLD, marginBottom: '16px', opacity: 0.9,
            }}>
              ROOPVIBE
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '36px', fontWeight: '800', color: '#fff',
              lineHeight: 1.25, marginBottom: '20px',
            }}>
              Your Style,<br />
              <span style={{
                background: `linear-gradient(90deg, ${GOLD}, #E8C87A, ${GOLD})`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite',
              }}>
                Your Vibe.
              </span>
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '280px' }}>
              India's premium fashion destination. Discover trending styles curated just for you.
            </p>
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginBottom: '4px' }}>
              WHY JOIN US
            </p>
            {perks.map((p, i) => (
              <div key={i} className="perk-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(201,169,110,0.15)',
                  border: '1px solid rgba(201,169,110,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GOLD, flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
            © 2025 RoopVibe. All rights reserved.
          </div>
        </div>

        {/* ── Right Panel — Form ── */}
        <div className="rv-login-right" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}>
          <div className="login-card" style={{ width: '100%', maxWidth: '420px' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px', fontWeight: '800', color: CHARCOAL,
                marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                Welcome back <FiSmile style={{ color: GOLD }} />
              </h1>
              <p style={{ fontSize: '14px', color: '#888', fontWeight: '400' }}>
                Login to continue shopping
              </p>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F0EBE2',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '28px',
            }}>
              {[['login', 'Email Login'], ['otp', 'OTP Login']].map(([val, label]) => (
                <button key={val} className="tab-btn"
                  onClick={() => { setActiveTab(val); setOtpSent(false); }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: activeTab === val ? '#fff' : 'transparent',
                    color: activeTab === val ? GOLD_DARK : '#999',
                    boxShadow: activeTab === val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Email Login Form ── */}
            {activeTab === 'login' && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'email' ? GOLD : '#bbb', transition: 'color 0.2s' }} />
                  <input type="email" placeholder="Email address" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    style={inputStyle('email')} />
                </div>

                {/* Password */}
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'password' ? GOLD : '#bbb', transition: 'color 0.2s' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('password'), paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb',alignItems: 'center', display: 'flex' }}>
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Forgot */}
                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <span style={{ fontSize: '12px', color: GOLD_DARK, fontWeight: '600', cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                </div>

                {/* Submit */}
                <button type="submit" className="submit-btn"
                  style={{
                    width: '100%', padding: '14px',
                    background: `linear-gradient(to right, ${GOLD_DARK}, ${GOLD}, ${GOLD_DARK})`,
                    backgroundSize: '200% auto',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.3s ease', letterSpacing: '0.5px',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 14px rgba(160,120,64,0.3)',
                  }}>
                  LOGIN TO ROOPVIBE <FiArrowRight />
                </button>
              </form>
            )}

            {/* ── OTP Login Form ── */}
            {activeTab === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!otpSent ? (
                  <>
                    <div style={{ position: 'relative' }}>
                      {/* India flag + +91 */}
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none'}}>
                        <FiGlobe style={{ color: GOLD_DARK }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: CHARCOAL }}>+91</span>
                        <span style={{ color: '#ddd', marginLeft: '2px' }}>|</span>
                      </div>
                      <input type="tel" maxLength={10} placeholder="Mobile number" value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setFocusedInput('phone')}
                        onBlur={() => setFocusedInput(null)}
                        style={{ ...inputStyle('phone'),  paddingLeft: '110px',fontSize: '14px', }} />
                    </div>
                    <button onClick={() => phone.length === 10 && setOtpSent(true)} className="submit-btn"
                      style={{
                        width: '100%', padding: '14px',
                        background: phone.length === 10
                          ? `linear-gradient(to right, ${GOLD_DARK}, ${GOLD}, ${GOLD_DARK})`
                          : '#E8E0D5',
                        backgroundSize: '200% auto',
                        color: phone.length === 10 ? '#fff' : '#aaa',
                        border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                        cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
                        boxShadow: phone.length === 10 ? '0 4px 14px rgba(160,120,64,0.3)' : 'none',
                      }}>
                      SEND OTP
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: '#777', textAlign: 'center' }}>
                      OTP sent to <strong style={{ color: CHARCOAL }}>+91 {phone}</strong>
                      <span onClick={() => setOtpSent(false)}
                        style={{ color: GOLD_DARK, fontWeight: '600', cursor: 'pointer', marginLeft: '8px', fontSize: '12px' }}>
                        Change
                      </span>
                    </p>

                    {/* OTP boxes */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      {otp.map((digit, idx) => (
                        <input key={idx} id={`otp-${idx}`} className="otp-input"
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKey(e, idx)}
                          style={{
                            width: '46px', height: '52px', textAlign: 'center',
                            fontSize: '20px', fontWeight: '700', color: CHARCOAL,
                            border: `2px solid ${digit ? GOLD : '#E8E0D5'}`,
                            borderRadius: '10px', outline: 'none',
                            backgroundColor: digit ? GOLD_LIGHT : '#FAFAF8',
                            transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                          }} />
                      ))}
                    </div>

                    <button
                      onClick={() => { login({ name: 'OTP User', email: `${phone}@phone.com` }); navigate(from, { replace: true }); }}
                      className="submit-btn"
                      style={{
                        width: '100%', padding: '14px',
                        background: `linear-gradient(to right, ${GOLD_DARK}, ${GOLD}, ${GOLD_DARK})`,
                        backgroundSize: '200% auto',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                        transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
                        boxShadow: '0 4px 14px rgba(160,120,64,0.3)',
                      }}>
                      VERIFY & LOGIN
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
                      Didn't receive?{' '}
                      <span style={{ color: GOLD_DARK, fontWeight: '600', cursor: 'pointer' }}>Resend OTP</span>
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '14px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E0D5' }} />
              <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '600', letterSpacing: '1px' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E0D5' }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="social-btn"
                onClick={() => { login({ name: 'Google User', email: 'google@example.com' }); navigate(from, { replace: true }); }}
                style={{
                  flex: 1, padding: '12px', backgroundColor: '#fff', border: '1.5px solid #E8E0D5',
                  borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '600',
                  color: CHARCOAL, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="social-btn"
                style={{
                  flex: 1, padding: '12px', backgroundColor: '#fff', border: '1.5px solid #E8E0D5',
                  borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '600',
                  color: CHARCOAL, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            

            {/* Trust badges */}
            <div style={{
              marginTop: '28px', padding: '14px 16px',
              backgroundColor: '#F5F0E8', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <FiShield size={13} color={GOLD_DARK} />
              <span style={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>
                Your data is safe with 256-bit SSL encryption
              </span>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}