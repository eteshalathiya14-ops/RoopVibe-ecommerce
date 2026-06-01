/**
 * AdminShared.jsx
 * Reusable components used across all admin pages:
 *   Toggle, Badge, Btn, Modal, FormGroup, Input, TextArea, Toast, Section, PageHeader
 */
import { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";

export const GOLD       = "#C9A96E";
export const GOLD_DARK  = "#A07840";
export const GOLD_LIGHT = "#F5EDD9";
export const CHARCOAL   = "#1A1A1A";
export const MUTED      = "#6B6560";
export const SURFACE    = "#FAF7F2";
export const BORDER     = "#EDE8E0";
export const WHITE      = "#FFFFFF";
export const DANGER     = "#C0392B";
export const SUCCESS    = "#27AE60";

// ─── Toggle switch ────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width:40, height:22, borderRadius:11, border:"none", cursor:"pointer",
        background: value ? GOLD : BORDER, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <span style={{ position:"absolute", top:3, left: value ? 20 : 3, width:16, height:16,
        borderRadius:"50%", background:WHITE, transition:"left 0.2s" }} />
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, color=GOLD_LIGHT, text=GOLD_DARK }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, background:color, color:text,
      padding:"2px 7px", borderRadius:20, letterSpacing:"0.4px" }}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────
export function Btn({ children, onClick, variant="default", size="md", style:sx={}, disabled=false }) {
  const [hov, setHov] = useState(false);
  const base = { display:"inline-flex", alignItems:"center", gap:6, borderRadius:8,
    cursor: disabled ? "not-allowed" : "pointer", fontFamily:"inherit",
    fontWeight:500, transition:"all 0.15s", opacity: disabled ? 0.5 : 1 };
  const sizes = { sm:{ padding:"4px 10px", fontSize:12 }, md:{ padding:"8px 16px", fontSize:13 } };
  const variants = {
    default: { background: hov ? SURFACE : WHITE,  color:CHARCOAL, border:`1px solid ${BORDER}` },
    primary: { background: hov ? GOLD_DARK : GOLD,  color:WHITE,    border:`1px solid ${hov ? GOLD_DARK : GOLD}` },
    danger:  { background: hov ? "#FDECEA" : "transparent", color:DANGER, border:`1px solid #F5C6C6` },
    ghost:   { background:"transparent", color:MUTED, border:"none" },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, wide=false }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:WHITE, borderRadius:12, width: wide ? 680 : 460, maxWidth:"100%",
        border:`1px solid ${BORDER}`, boxShadow:"0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "calc(100vh - 32px)", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:CHARCOAL }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED }}><FiX size={20}/></button>
        </div>
        <div style={{ padding:20, overflowY:"auto" }}>{children}</div>
        {footer && (
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end",
            padding:"14px 20px", borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FormGroup ────────────────────────────────────────────────
export function FormGroup({ label, hint, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, color:MUTED, marginBottom:5, fontWeight:500 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:MUTED, marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, style:sx={}, type="text" }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      type={type}
      style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:13, color:CHARCOAL, fontFamily:"inherit", outline:"none",
        background:WHITE, boxSizing:"border-box", ...sx }}
      onFocus={e => e.target.style.borderColor = GOLD}
      onBlur={e  => e.target.style.borderColor = BORDER} />
  );
}

// ─── TextArea ─────────────────────────────────────────────────
export function TextArea({ value, onChange, placeholder, rows=3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:13, color:CHARCOAL, fontFamily:"inherit", outline:"none",
        background:WHITE, boxSizing:"border-box", resize:"vertical" }}
      onFocus={e => e.target.style.borderColor = GOLD}
      onBlur={e  => e.target.style.borderColor = BORDER} />
  );
}

// ─── Select ──────────────────────────────────────────────────
export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:13, color:CHARCOAL, fontFamily:"inherit", outline:"none",
        background:WHITE, boxSizing:"border-box" }}>
      {options.map(o => (
        typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Toast ───────────────────────────────────────────────────
export function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:2000,
      background:WHITE, border:`1px solid ${BORDER}`, borderLeft:`3px solid ${GOLD}`,
      borderRadius:8, padding:"10px 16px", fontSize:13, color:CHARCOAL,
      boxShadow:"0 4px 20px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:8 }}>
      <FiCheck size={14} color={SUCCESS}/> {message}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────
export function Section({ title, action, children }) {
  return (
    <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:CHARCOAL }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────
export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>{sub}</p>}
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────
export function MetricCard({ label, value }) {
  return (
    <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 18px" }}>
      <div style={{ fontSize:12, color:MUTED, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color:CHARCOAL }}>{value}</div>
    </div>
  );
}

// ─── ImageURLInput (with preview) ─────────────────────────────
export function ImageURLInput({ value, onChange, placeholder="https://..." }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
      <div style={{ flex:1 }}>
        <Input value={value} onChange={onChange} placeholder={placeholder} />
      </div>
      {value && (
        <img src={value} alt="" style={{ width:48, height:56, objectFit:"cover",
          borderRadius:6, border:`1px solid ${BORDER}`, flexShrink:0 }}
          onError={e => e.target.style.display = "none"} />
      )}
    </div>
  );
}

// ─── Row item (table-like row) ────────────────────────────────
export function RowItem({ left, right, last=false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"11px 20px", borderBottom: last ? "none" : `1px solid ${BORDER}` }}>
      {left}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>{right}</div>
    </div>
  );
}