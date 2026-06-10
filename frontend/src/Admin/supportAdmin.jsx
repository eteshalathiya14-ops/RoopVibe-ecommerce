// frontend/src/admin/SupportAdmin.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiHeadphones, FiSearch, FiX, FiCheck, FiAlertTriangle,
  FiTrash2, FiClock, FiLoader, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import {
  adminGetSupportMessages, adminGetSupportMetrics,
  adminUpdateSupport, adminDeleteSupport,
} from "../Api/Supportapi";

// ── Tokens ────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const WHITE      = "#FFFFFF";
const DANGER     = "#C0392B";
const SUCCESS    = "#27AE60";

const STATUS_CFG = {
  "Open":        { color: "#E65100", bg: "#FFF3E0" },
  "In Progress": { color: "#1565C0", bg: "#E3F2FD" },
  "Resolved":    { color: SUCCESS,   bg: "#E8F5E9" },
};

const TABS = [
  { id: "all",         label: "All"         },
  { id: "Open",        label: "Open"        },
  { id: "In Progress", label: "In Progress" },
  { id: "Resolved",    label: "Resolved"    },
];

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: MUTED, bg: SURFACE };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function Spinner({ size = 20, color = GOLD }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Message Detail Modal ───────────────────────────────────────
function MessageModal({ msg, onClose, onUpdate, onDelete }) {
  const [status,    setStatus]    = useState(msg.status);
  const [adminNote, setAdminNote] = useState(msg.adminNote || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirmDel,setConfirm]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateSupport(msg._id, { status, adminNote });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteSupport(msg._id);
      onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const sender = msg.user?.name || msg.name || "Anonymous";
  const email  = msg.user?.email || msg.email || "—";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: WHITE, borderRadius: 14, width: 520, maxWidth: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,0.14)" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, margin: 0 }}>Support Message</p>
            <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{fmtDate(msg.createdAt)}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={msg.status} />
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, lineHeight: 0 }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* Sender info */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 10, textTransform: "uppercase" }}>From</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: GOLD_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: GOLD_DARK, flexShrink: 0 }}>
                {sender.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, margin: 0 }}>{sender}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{email}</p>
              </div>
            </div>
          </div>

          {/* Topic */}
          {msg.topic && (
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 6, textTransform: "uppercase" }}>Topic</p>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: GOLD_LIGHT, color: GOLD_DARK, fontSize: 12, fontWeight: 700 }}>
                {msg.topic}
              </span>
            </div>
          )}

          {/* Message */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 10, textTransform: "uppercase" }}>Message</p>
            <p style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.7, whiteSpace: "pre-wrap", background: SURFACE, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}` }}>
              {msg.message}
            </p>
          </div>

          {/* Admin note */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 8, textTransform: "uppercase" }}>Admin Note (internal)</p>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Add internal note about this ticket…"
              style={{ width: "100%", minHeight: 80, padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", fontSize: 13, color: CHARCOAL, resize: "vertical", outline: "none", boxSizing: "border-box", background: SURFACE }}
            />
          </div>

          {/* Status + Save */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 10, textTransform: "uppercase" }}>Update Status</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {Object.keys(STATUS_CFG).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1.5px solid ${status === s ? STATUS_CFG[s].color : BORDER}`, background: status === s ? STATUS_CFG[s].bg : WHITE, color: status === s ? STATUS_CFG[s].color : MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: saved ? SUCCESS : `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Spinner size={14} color={WHITE} /> Saving…</> : saved ? <><FiCheck size={13} /> Saved!</> : "Save Changes"}
            </button>
          </div>

          {/* Delete */}
          <div style={{ padding: "14px 20px" }}>
            {!confirmDel ? (
              <button onClick={() => setConfirm(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px", color: DANGER, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                <FiTrash2 size={13} /> Delete Message
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: DANGER, color: WHITE, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
                <button onClick={() => setConfirm(false)}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function SupportAdmin() {
  const [messages,  setMessages]  = useState([]);
  const [metrics,   setMetrics]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selected,  setSelected]  = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeTab !== "all") params.status = activeTab;
      const data = await adminGetSupportMessages(params);
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await adminGetSupportMetrics();
      setMetrics(data);
    } catch {}
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { fetchMetrics();  }, [fetchMetrics]);

  const tabCounts = {
    all:          metrics?.total      ?? "",
    "Open":       metrics?.open       ?? "",
    "In Progress":metrics?.inProgress ?? "",
    "Resolved":   metrics?.resolved   ?? "",
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ animation: "fadeUp 0.25s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL, margin: 0 }}>Customer Support</h2>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>View and respond to customer messages</p>
        </div>

        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total",       value: metrics?.total      ?? "—", color: CHARCOAL    },
            { label: "Open",        value: metrics?.open       ?? "—", color: "#E65100"   },
            { label: "In Progress", value: metrics?.inProgress ?? "—", color: "#1565C0"   },
            { label: "Resolved",    value: metrics?.resolved   ?? "—", color: SUCCESS      },
          ].map(m => (
            <div key={m.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 6px" }}>{m.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              const count  = tabCounts[tab.id];
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? GOLD_DARK : MUTED, whiteSpace: "nowrap", borderBottom: `2.5px solid ${active ? GOLD : "transparent"}`, marginBottom: -1, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                  {tab.label}
                  {count !== "" && (
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, fontWeight: 700, background: active ? GOLD_LIGHT : SURFACE, color: active ? GOLD_DARK : MUTED }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "14px 20px", background: "#FFF3F3", color: DANGER, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <FiAlertTriangle size={14} /> {error}
              <button onClick={fetchMessages} style={{ marginLeft: "auto", fontSize: 12, color: GOLD_DARK, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: MUTED }}>
              <Spinner size={28} />
              <span style={{ fontSize: 13 }}>Loading messages…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && messages.length === 0 && (
            <div style={{ padding: 52, textAlign: "center", color: MUTED, fontSize: 13 }}>
              <FiHeadphones size={36} style={{ marginBottom: 10, opacity: 0.25, display: "block", margin: "0 auto 12px" }} />
              No support messages yet
            </div>
          )}

          {/* Messages list */}
          {!loading && messages.length > 0 && (
            <div>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 100px 80px", padding: "8px 16px", background: SURFACE, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", gap: 8 }}>
                <span>Message</span>
                <span>Topic</span>
                <span>Date</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Action</span>
              </div>

              {messages.map((msg, idx) => {
                const sender = msg.user?.name || msg.name || "Anonymous";
                const email  = msg.user?.email || msg.email || "";
                const preview = msg.message?.slice(0, 80) + (msg.message?.length > 80 ? "…" : "");

                return (
                  <div key={msg._id}
                    style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 100px 80px", padding: "12px 16px", gap: 8, alignItems: "center", borderBottom: idx < messages.length - 1 ? `1px solid ${BORDER}` : "none", background: msg.status === "Open" ? "#FFFDF8" : WHITE, transition: "background 0.15s" }}>

                    {/* Message preview */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: GOLD_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: GOLD_DARK, flexShrink: 0 }}>
                          {sender.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{sender}</span>
                        {email && <span style={{ fontSize: 11, color: MUTED }}>{email}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, margin: 0, paddingLeft: 34 }}>{preview}</p>
                    </div>

                    {/* Topic */}
                    <div>
                      {msg.topic
                        ? <span style={{ padding: "3px 8px", borderRadius: 20, background: GOLD_LIGHT, color: GOLD_DARK, fontSize: 11, fontWeight: 600 }}>{msg.topic}</span>
                        : <span style={{ fontSize: 11, color: MUTED }}>—</span>
                      }
                    </div>

                    {/* Date */}
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{fmtDate(msg.createdAt)}</p>

                    {/* Status */}
                    <StatusBadge status={msg.status} />

                    {/* View */}
                    <div style={{ textAlign: "right" }}>
                      <button onClick={() => setSelected(msg)}
                        style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: CHARCOAL, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "border 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.border = `1px solid ${GOLD}`}
                        onMouseLeave={e => e.currentTarget.style.border = `1px solid ${BORDER}`}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { fetchMessages(); fetchMetrics(); }}
          onDelete={() => { fetchMessages(); fetchMetrics(); }}
        />
      )}
    </>
  );
}