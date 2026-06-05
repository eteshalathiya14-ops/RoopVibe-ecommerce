import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  login as loginApi,
  register as registerApi,
  resendVerification,
  verifyEmail,
  verifyEmailCode,
  googleLogin as googleLoginApi,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../Api/Authapi';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiTag, FiTruck, FiSmile, FiGlobe, FiUser, FiCheckCircle } from 'react-icons/fi';

const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const STRONG_PASSWORD_MSG =
  'Password must be at least 8 characters with uppercase, lowercase, a number, and a special character.';

function isStrongPassword(password) {
  return STRONG_PASSWORD_RE.test(password);
}

function getPasswordChecks(password) {
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
    { label: 'One special character', ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
}

const GOLD = '#C9A96E';
const GOLD_DARK = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL = '#1A1A1A';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GRADIENT_BTN = (enabled) => ({
  backgroundImage: enabled
    ? `linear-gradient(to right, ${GOLD_DARK}, ${GOLD}, ${GOLD_DARK})`
    : 'none',
  backgroundColor: enabled ? 'transparent' : '#E8E0D5',
  backgroundSize: '200% auto',
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [displayedCode, setDisplayedCode] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDone, setVerifyDone] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = location.state?.from?.pathname || '/';

  const applyVerificationData = (data) => {
    if (data.verifyUrl) setVerifyUrl(data.verifyUrl);
    if (data.verificationCode) setDisplayedCode(data.verificationCode);
  };

  useEffect(() => {
    const token = searchParams.get('verifyToken');
    if (!token) return;

    let cancelled = false;
    setVerifyLoading(true);
    setSignupSuccess(true);

    verifyEmail(token)
      .then((data) => {
        if (cancelled) return;
        login({ token: data.token, user: data.user });
        setVerifyDone(true);
        setSearchParams({}, { replace: true });
        setTimeout(() => navigate(from, { replace: true }), 1500);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Verification link expired.');
        setSignupSuccess(true);
      })
      .finally(() => {
        if (!cancelled) setVerifyLoading(false);
      });

    return () => { cancelled = true; };
  }, [searchParams, login, navigate, from, setSearchParams]);

  const handleVerifyCode = async () => {
    const targetEmail = pendingEmail || email.trim().toLowerCase();
    if (!targetEmail || verifyCodeInput.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setVerifyLoading(true);
    setError('');
    try {
      const data = await verifyEmailCode(targetEmail, verifyCodeInput);
      login({ token: data.token, user: data.user });
      setVerifyDone(true);
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = pendingEmail || email.trim();
    if (!targetEmail) return;
    setResendLoading(true);
    setError('');
    try {
      const data = await resendVerification(targetEmail);
      applyVerificationData(data);
      setSignupSuccess(true);
      setPendingEmail(targetEmail);
      if (data.verificationCode) setVerifyCodeInput(data.verificationCode);
    } catch (err) {
      setError(err.message || 'Could not resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (emailMode === 'signup' && !isStrongPassword(password)) {
      setError(STRONG_PASSWORD_MSG);
      return;
    }

    setLoading(true);
    try {
      if (emailMode === 'signup') {
        const data = await registerApi(name.trim(), email.trim(), password);
        setPendingEmail(email.trim().toLowerCase());
        setSignupSuccess(true);
        applyVerificationData(data);
        if (data.verificationCode) setVerifyCodeInput(data.verificationCode);
        return;
      }

      const data = await loginApi(email.trim(), password);
      login({ token: data.token, user: data.user });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Something went wrong. Please try again.';
      if (err.needsVerification || err.data?.needsVerification) {
        setPendingEmail(email.trim().toLowerCase());
        setSignupSuccess(true);
        if (err.data?.verificationCode) {
          setDisplayedCode(err.data.verificationCode);
          setVerifyCodeInput(err.data.verificationCode);
        }
        setError('');
        return;
      }
      if (emailMode === 'login' && msg.toLowerCase().includes('invalid email')) {
        setError('No account found for this email. Create an account below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = emailMode === 'signup' ? getPasswordChecks(password) : [];

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in was cancelled.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await googleLoginApi(credentialResponse.credential);
      login({ token: data.token, user: data.user });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (phone.length !== 10) return;
    setPhoneLoading(true);
    setError('');
    setOtpError(false);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Could not send OTP via SMS.');
      setOtpSent(false);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the 6-digit OTP from your SMS.');
      setOtpError(true);
      return;
    }
    setPhoneLoading(true);
    setError('');
    setOtpError(false);
    try {
      const data = await verifyPhoneOtp(phone, code);
      login({ token: data.token, user: data.user });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Wrong OTP. Please try again.');
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    setOtpError(false);
    if (error && activeTab === 'otp') setError('');
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

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtpError(false);
    setError('');
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
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
                {emailMode === 'signup' ? 'Join RoopVibe' : 'Welcome back'}{' '}
                <FiSmile style={{ color: GOLD }} />
              </h1>
              <p style={{ fontSize: '14px', color: '#888', fontWeight: '400' }}>
                {emailMode === 'signup'
                  ? 'Create an account to start shopping'
                  : 'Login to continue shopping'}
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
                  onClick={() => { setActiveTab(val); setOtpSent(false); setError(''); setOtpError(false); }}
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

            {/* ── Signup success — verify email ── */}
            {signupSuccess && (
              <div style={{
                padding: '24px',
                borderRadius: '12px',
                backgroundColor: verifyDone ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${verifyDone ? '#BBF7D0' : '#FDE68A'}`,
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                {verifyDone ? (
                  <>
                    <FiCheckCircle size={40} color="#16A34A" style={{ marginBottom: '12px' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: CHARCOAL }}>Email verified!</h2>
                    <p style={{ fontSize: '14px', color: '#555', marginTop: '8px' }}>Redirecting...</p>
                  </>
                ) : (
                  <>
                    <FiMail size={36} color={GOLD_DARK} style={{ marginBottom: '12px' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: CHARCOAL, marginBottom: '8px' }}>
                      Verify your email
                    </h2>
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '12px' }}>
                      {displayedCode
                        ? <>Enter the code below for <strong>{pendingEmail}</strong></>
                        : <>We sent a code to <strong>{pendingEmail}</strong>. Check your inbox (and spam).</>}
                    </p>
                    {displayedCode && (
                      <div style={{
                        fontSize: '28px', fontWeight: '800', letterSpacing: '8px',
                        color: GOLD_DARK, marginBottom: '16px', fontFamily: 'monospace',
                      }}>
                        {displayedCode}
                      </div>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{
                        width: '100%', height: '48px', textAlign: 'center',
                        fontSize: '22px', letterSpacing: '8px', fontWeight: '700',
                        borderRadius: '10px', border: `1.5px solid ${GOLD}`,
                        marginBottom: '12px', fontFamily: 'monospace',
                      }}
                    />
                    <button type="button" disabled={verifyLoading || verifyCodeInput.length !== 6}
                      onClick={handleVerifyCode}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                        background: verifyCodeInput.length === 6 ? GOLD_DARK : '#E8E0D5',
                        color: '#fff', fontWeight: '700', fontSize: '14px',
                        cursor: verifyCodeInput.length === 6 ? 'pointer' : 'not-allowed',
                        fontFamily: "'DM Sans', sans-serif", marginBottom: '10px',
                      }}>
                      {verifyLoading ? 'Verifying...' : 'VERIFY EMAIL'}
                    </button>
                    {verifyUrl && (
                      <a href={verifyUrl} style={{
                        display: 'block', fontSize: '12px', color: GOLD_DARK,
                        marginBottom: '12px', wordBreak: 'break-all',
                      }}>
                        Or tap here to verify with link
                      </a>
                    )}
                    {error && (
                      <p style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '10px' }}>{error}</p>
                    )}
                    <button type="button" disabled={resendLoading} onClick={handleResendVerification}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px', border: `1.5px solid ${GOLD}`,
                        background: '#fff', color: GOLD_DARK, fontWeight: '600', fontSize: '13px',
                        cursor: resendLoading ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif", marginBottom: '8px',
                      }}>
                      {resendLoading ? 'Sending...' : 'Resend code / email'}
                    </button>
                    <button type="button" onClick={() => {
                      setSignupSuccess(false); setEmailMode('login'); setError('');
                      setVerifyCodeInput(''); setDisplayedCode('');
                    }}
                      style={{
                        background: 'none', border: 'none', color: GOLD_DARK, fontWeight: '600',
                        fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      }}>
                      Back to login
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Email Login Form ── */}
            {activeTab === 'login' && !signupSuccess && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#B91C1C',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}>
                    {error}
                  </div>
                )}
                {emailMode === 'signup' && (
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'name' ? GOLD : '#bbb', transition: 'color 0.2s' }} />
                    <input type="text" placeholder="Full name" required value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                      style={inputStyle('name')} />
                  </div>
                )}
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
                  <input type={showPassword ? 'text' : 'password'}
                    placeholder={emailMode === 'signup' ? 'Create a strong password' : 'Password'}
                    required minLength={emailMode === 'signup' ? 8 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('password'), paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb',alignItems: 'center', display: 'flex' }}>
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {emailMode === 'signup' && password && (
                  <ul style={{ margin: '-4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {passwordChecks.map((c) => (
                      <li key={c.label} style={{
                        fontSize: '12px',
                        color: c.ok ? '#16A34A' : '#999',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span style={{ fontSize: '10px' }}>{c.ok ? '✓' : '○'}</span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}

                {emailMode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                    <span style={{ fontSize: '12px', color: GOLD_DARK, fontWeight: '600', cursor: 'pointer' }}>
                      Forgot password?
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="submit-btn" disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    ...GRADIENT_BTN(!loading),
                    color: loading ? '#aaa' : '#fff', border: 'none', borderRadius: '10px',
                    fontWeight: '700', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.3s ease', letterSpacing: '0.5px',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(160,120,64,0.3)',
                  }}>
                  {loading
                    ? (emailMode === 'signup' ? 'CREATING ACCOUNT...' : 'LOGGING IN...')
                    : (emailMode === 'signup'
                      ? <>CREATE ACCOUNT <FiArrowRight /></>
                      : <>LOGIN TO ROOPVIBE <FiArrowRight /></>)}
                </button>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '4px' }}>
                  {emailMode === 'login' ? (
                    <>
                      New to RoopVibe?{' '}
                      <button type="button" onClick={() => { setEmailMode('signup'); setError(''); setSignupSuccess(false); }}
                        style={{ background: 'none', border: 'none', color: GOLD_DARK, fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', padding: 0 }}>
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button type="button" onClick={() => { setEmailMode('login'); setError(''); }}
                        style={{ background: 'none', border: 'none', color: GOLD_DARK, fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', padding: 0 }}>
                        Login
                      </button>
                    </>
                  )}
                </p>
              </form>
            )}

            {/* ── OTP Login Form ── */}
            {activeTab === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && activeTab === 'otp' && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px',
                    backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                    color: '#B91C1C', fontSize: '13px', fontWeight: '500',
                  }}>
                    {error}
                  </div>
                )}
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
                    <button type="button" onClick={handleSendPhoneOtp} disabled={phone.length !== 10 || phoneLoading} className="submit-btn"
                      style={{
                        width: '100%', padding: '14px',
                        ...GRADIENT_BTN(phone.length === 10 && !phoneLoading),
                        color: phone.length === 10 && !phoneLoading ? '#fff' : '#aaa',
                        border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                        cursor: phone.length === 10 && !phoneLoading ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
                        boxShadow: phone.length === 10 && !phoneLoading ? '0 4px 14px rgba(160,120,64,0.3)' : 'none',
                      }}>
                      {phoneLoading ? 'SENDING...' : 'SEND OTP'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: '#777', textAlign: 'center' }}>
                      Enter the 6-digit OTP sent via SMS to{' '}
                      <strong style={{ color: CHARCOAL }}>+91 {phone}</strong>
                      <span onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setOtpError(false); setError(''); }}
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
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          style={{
                            width: '46px', height: '52px', textAlign: 'center',
                            fontSize: '20px', fontWeight: '700', color: CHARCOAL,
                            border: `2px solid ${otpError ? '#DC2626' : digit ? GOLD : '#E8E0D5'}`,
                            borderRadius: '10px', outline: 'none',
                            backgroundColor: otpError ? '#FEF2F2' : digit ? GOLD_LIGHT : '#FAFAF8',
                            transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                          }} />
                      ))}
                    </div>

                    <button type="button" onClick={handleVerifyPhoneOtp} disabled={phoneLoading}
                      className="submit-btn"
                      style={{
                        width: '100%', padding: '14px',
                        ...GRADIENT_BTN(!phoneLoading),
                        color: '#fff', border: 'none', borderRadius: '10px',
                        fontWeight: '700', fontSize: '14px',
                        cursor: phoneLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
                        boxShadow: '0 4px 14px rgba(160,120,64,0.3)',
                      }}>
                      {phoneLoading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
                      Didn&apos;t receive?{' '}
                      <span onClick={handleSendPhoneOtp} style={{ color: GOLD_DARK, fontWeight: '600', cursor: 'pointer' }}>
                        Resend OTP
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}

            {!signupSuccess && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '14px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E0D5' }} />
                  <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '600', letterSpacing: '1px' }}>OR CONTINUE WITH</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E0D5' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  {GOOGLE_CLIENT_ID ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google sign-in failed. Try again.')}
                      theme="outline"
                      size="large"
                      width="380"
                      text="continue_with"
                      shape="rectangular"
                    />
                  ) : (
                    <button type="button" className="social-btn"
                      onClick={() => setError('Google login: add VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env')}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#fff', border: '1.5px solid #E8E0D5',
                        borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: '600',
                        color: CHARCOAL, fontFamily: "'DM Sans', sans-serif",
                      }}>
                      Google (not configured)
                    </button>
                  )}
                </div>
              </>
            )}

            

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