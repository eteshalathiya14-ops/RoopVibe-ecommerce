// src/Admin/FilterAdmin.jsx
// FIXED:
// 1. Save filters actually persists to DB and re-fetches to confirm
// 2. Navbar sections fetched dynamically from DB (not hardcoded)
// 3. Reset to Defaults works and re-fetches
// 4. No more 0 groups after save

import { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX,
  FiRefreshCw, FiChevronDown, FiChevronUp, FiInfo,
  FiEye, FiEyeOff,
} from "react-icons/fi";
import {
  FaShoppingBag,
} from "react-icons/fa";
import {
  fetchFiltersAdmin, saveFilters, resetFilters,
} from "../Api/Categoryfilterapi";
import { fetchAllNavbar } from "../Api/Navbarapi";
import {
  Btn, Modal, FormGroup, Input, Select, Toggle, Toast,
  PageHeader, Section, MetricCard,
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE, DANGER,
} from "./Adminshared";

// ── Default sections (fallback if navbar fetch fails) ──────────
const DEFAULT_SECTIONS = [
  { id: "WOMEN",  label: "Women" },
  { id: "MEN",    label: "Men" },
  { id: "KIDS",   label: "Kids" },
  { id: "HOME",   label: "Home" },
  { id: "OFFERS", label: "Offers"},
];

const FILTER_TYPES = [
  { value: "checkbox", label: "Checkbox",     desc: "Multiple selections allowed" },
  { value: "radio",    label: "Radio",        desc: "Single selection only" },
  { value: "color",    label: "Color Swatch", desc: "Visual color picker" },
];

const PRESET_COLORS = [
  { name: "Red",    hex: "#E53935" }, { name: "Pink",   hex: "#E91E8C" },
  { name: "Orange", hex: "#FB8C00" }, { name: "Yellow", hex: "#FDD835" },
  { name: "Green",  hex: "#43A047" }, { name: "Blue",   hex: "#1E88E5" },
  { name: "Purple", hex: "#8E24AA" }, { name: "Black",  hex: "#212121" },
  { name: "White",  hex: "#F5F5F5" }, { name: "Brown",  hex: "#795548" },
  { name: "Beige",  hex: "#F5DEB3" }, { name: "Gold",   hex: "#C9A96E" },
];

const EMPTY_GROUP = { label: "", key: "", type: "checkbox", options: [], active: true, order: 0 };

function labelToKey(label) {
  return label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

// ── Option Editor ─────────────────────────────────────────────
function OptionEditor({ type, options, onChange }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [hex,   setHex]   = useState("#C9A96E");
  const [min,   setMin]   = useState("");
  const [max,   setMax]   = useState("");

  const addOpt = () => {
    const l = label.trim();
    if (!l) return;
    const opt = { label: l, value: value.trim() || l };
    if (type === "color") opt.hex = hex;
    if (type === "radio") {
      if (min !== "") opt.min = parseFloat(min);
      if (max !== "") opt.max = parseFloat(max);
    }
    onChange([...options, opt]);
    setLabel(""); setValue(""); setMin(""); setMax("");
  };

  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));

  const inputStyle = {
    width: "100%", padding: "7px 10px", borderRadius: 7,
    border: `1px solid ${BORDER}`, fontSize: 12,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Existing options */}
      {options.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", background: WHITE, borderRadius: 7,
              marginBottom: 5, border: `1px solid ${BORDER}`,
            }}>
              {type === "color" && (
                <div style={{ width: 18, height: 18, borderRadius: "50%",
                  background: opt.hex, border: `1.5px solid ${BORDER}`, flexShrink: 0 }}/>
              )}
              <span style={{ flex: 1, fontSize: 12, color: CHARCOAL, fontWeight: 600 }}>{opt.label}</span>
              {opt.value !== opt.label && (
                <code style={{ fontSize: 10, color: MUTED, background: SURFACE,
                  padding: "1px 5px", borderRadius: 4 }}>{opt.value}</code>
              )}
              {(opt.min !== undefined || opt.max !== undefined) && (
                <span style={{ fontSize: 10, color: MUTED }}>
                  {opt.min ?? 0} – {opt.max ?? "∞"}
                </span>
              )}
              <button onClick={() => remove(i)}
                style={{ border: "none", background: "none", cursor: "pointer",
                  color: DANGER, display: "flex", padding: 2 }}>
                <FiX size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      <div style={{ background: `${GOLD}08`, border: `1.5px dashed ${GOLD}66`,
        borderRadius: 10, padding: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: GOLD_DARK,
          letterSpacing: "0.7px", marginBottom: 10 }}>ADD NEW OPTION</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: MUTED, fontWeight: 700, display: "block", marginBottom: 3 }}>
              Label *
            </label>
            <input value={label} onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOpt()}
              placeholder="e.g. Cotton" style={inputStyle}/>
          </div>
          <div>
            <label style={{ fontSize: 10, color: MUTED, fontWeight: 700, display: "block", marginBottom: 3 }}>
              Value <span style={{ fontWeight: 400 }}>(defaults to label)</span>
            </label>
            <input value={value} onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOpt()}
              placeholder="same as label" style={inputStyle}/>
          </div>
        </div>

        {type === "color" && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: MUTED, fontWeight: 700, display: "block", marginBottom: 6 }}>
              Color
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {PRESET_COLORS.map(c => (
                <button key={c.hex} onClick={() => {
                  setHex(c.hex);
                  if (!label) { setLabel(c.name); setValue(c.name); }
                }}
                  title={c.name}
                  style={{
                    width: 26, height: 26, borderRadius: "50%", background: c.hex,
                    border: hex === c.hex ? `3px solid ${GOLD}` : `2px solid rgba(0,0,0,0.15)`,
                    boxShadow: hex === c.hex ? `0 0 0 2px ${GOLD_LIGHT}` : "none",
                    cursor: "pointer", padding: 0, transition: "all 0.15s",
                  }}/>
              ))}
              <input type="color" value={hex} onChange={e => setHex(e.target.value)}
                style={{ width: 26, height: 26, padding: 0, borderRadius: "50%",
                  border: `2px solid ${BORDER}`, cursor: "pointer" }} title="Custom"/>
            </div>
          </div>
        )}

        {type === "radio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: MUTED, fontWeight: 700, display: "block", marginBottom: 3 }}>
                Min value
              </label>
              <input value={min} onChange={e => setMin(e.target.value)} type="number"
                placeholder="0" style={inputStyle}/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: MUTED, fontWeight: 700, display: "block", marginBottom: 3 }}>
                Max value
              </label>
              <input value={max} onChange={e => setMax(e.target.value)} type="number"
                placeholder="blank = no limit" style={inputStyle}/>
            </div>
          </div>
        )}

        <button onClick={addOpt}
          style={{ padding: "7px 18px", background: GOLD, color: "#fff",
            border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "inherit" }}>
          <FiPlus size={13}/> Add Option
        </button>
      </div>
    </div>
  );
}

// ── Filter Group Card ─────────────────────────────────────────
function FilterGroupCard({ group, idx, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = FILTER_TYPES.find(t => t.value === group.type);

  return (
    <div style={{
      border: `1.5px solid ${group.active ? BORDER : "#f0e0e0"}`,
      borderRadius: 12, marginBottom: 10,
      background: group.active ? WHITE : "#fffafa",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10,
        borderBottom: expanded ? `1px solid ${BORDER}` : "none" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: group.active ? GOLD_LIGHT : "#f5e5e5",
          border: `1.5px solid ${group.active ? GOLD : "#e0c0c0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800,
          color: group.active ? GOLD_DARK : "#c0a0a0",
        }}>
          {(group.order ?? idx) + 1}
        </div>

        <button onClick={() => setExpanded(e => !e)}
          style={{ background: "none", border: "none", cursor: "pointer",
            display: "flex", color: MUTED, padding: 0, flexShrink: 0 }}>
          {expanded ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{group.label}</span>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px",
              borderRadius: 20, background: GOLD_LIGHT, color: GOLD_DARK }}>
              {(typeInfo?.label || group.type).toUpperCase()}
            </span>
            <span style={{ fontSize: 11, color: MUTED }}>{group.options?.length || 0} options</span>
            <code style={{ fontSize: 10, color: MUTED, background: SURFACE,
              padding: "1px 6px", borderRadius: 5 }}>
              {group.key}
            </code>
            {!group.active && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px",
                borderRadius: 20, background: "#FDECEA", color: DANGER }}>HIDDEN</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onToggle(group)} title={group.active ? "Hide" : "Show"}
            style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${BORDER}`,
              background: WHITE, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: group.active ? GOLD_DARK : MUTED }}>
            {group.active ? <FiEye size={14}/> : <FiEyeOff size={14}/>}
          </button>
          <Btn size="sm" onClick={() => onEdit(group)}><FiEdit2 size={12}/></Btn>
          <Btn size="sm" variant="danger" onClick={() => onDelete(group._id || group.key)}>
            <FiTrash2 size={12}/>
          </Btn>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "12px 16px", background: SURFACE }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.6px", marginBottom: 8 }}>
            OPTIONS PREVIEW
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(!group.options || group.options.length === 0) && (
              <span style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>No options yet</span>
            )}
            {group.type === "color"
              ? group.options?.map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: 20, background: WHITE,
                    border: `1px solid ${BORDER}`, fontSize: 11 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%",
                      background: opt.hex, border: "1px solid rgba(0,0,0,0.1)" }}/>
                    {opt.label}
                  </div>
                ))
              : group.options?.map((opt, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20,
                    background: WHITE, border: `1px solid ${BORDER}`, color: CHARCOAL }}>
                    {opt.label}
                    {(opt.min !== undefined || opt.max !== undefined) && (
                      <span style={{ color: MUTED, marginLeft: 4, fontSize: 10 }}>
                        ({opt.min ?? 0}–{opt.max ?? "∞"})
                      </span>
                    )}
                  </span>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add/Edit Modal ─────────────────────────────────────────────
function FilterGroupModal({ modal, form, setForm, onSave, onClose }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal
      title={modal === "add" ? "Add New Filter Group" : `Edit: ${typeof modal === "object" ? modal.label : ""}`}
      onClose={onClose}
      wide
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={onSave}><FiSave size={14}/> Save Group</Btn>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
        <FormGroup label="Filter Label * (shown to customers, e.g. FABRIC)">
          <Input value={form.label}
            onChange={v => {
              set("label", v.toUpperCase());
              if (!form.key || form.key === labelToKey(form.label)) {
                set("key", labelToKey(v));
              }
            }}
            placeholder="FABRIC"/>
        </FormGroup>
        <FormGroup label="Field Key * (must match product field exactly)">
          <Input value={form.key}
            onChange={v => set("key", v.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,""))}
            placeholder="fabric"/>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>
            Use: price, disc, sizes, colors, fabric, pattern, occasion
          </p>
        </FormGroup>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        padding: "12px 14px", background: SURFACE, borderRadius: 10,
        border: `1px solid ${BORDER}`, marginBottom: 14 }}>
        <FormGroup label="Filter Type">
          <Select value={form.type} onChange={v => set("type", v)}
            options={FILTER_TYPES.map(t => t.value)}/>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>
            {FILTER_TYPES.find(t => t.value === form.type)?.desc}
          </p>
        </FormGroup>
        <FormGroup label="Display Order">
          <Input value={form.order ?? 0} onChange={v => set("order", parseInt(v) || 0)} type="number"/>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>Lower = shown first</p>
        </FormGroup>
        <FormGroup label="Visibility">
          <div style={{ display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", background: WHITE, borderRadius: 8,
            border: `1px solid ${BORDER}`, height: 36, boxSizing: "border-box" }}>
            <Toggle value={form.active} onChange={v => set("active", v)}/>
            <span style={{ fontSize: 12, color: CHARCOAL, fontWeight: 600 }}>
              {form.active ? "Visible" : "Hidden"}
            </span>
          </div>
        </FormGroup>
      </div>

      <FormGroup label={`Options (${form.options?.length || 0} added)`}>
        <OptionEditor type={form.type} options={form.options || []}
          onChange={v => set("options", v)}/>
      </FormGroup>
    </Modal>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function FilterAdmin() {
  const [sections,       setSections]       = useState(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState("WOMEN");
  const [filterGroups,   setFilterGroups]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [isDefault,      setIsDefault]      = useState(false);
  const [hasUnsaved,     setHasUnsaved]     = useState(false);
  const [modal,          setModal]          = useState(null);
  const [form,           setForm]           = useState(EMPTY_GROUP);
  const [toast,          setToast]          = useState(null);

  // ── Fetch navbar sections dynamically ─────────────────────
  useEffect(() => {
    fetchAllNavbar()
      .then(items => {
        if (!items || !items.length) return;
const iconMap = {
          WOMEN: FaShoppingBag,
          MEN: FaShoppingBag,
          KIDS: FaShoppingBag,
          HOME: FaShoppingBag,
          OFFERS: FaShoppingBag,
        };
        const dynamic = items
          .filter(x => x.active)
          .sort((a,b) => a.order - b.order)
          .map(x => ({
            id: x.name,
            label: x.name.charAt(0) + x.name.slice(1).toLowerCase(),
            Icon: iconMap[x.name] || FaShoppingBag,
          }));
        if (dynamic.length) setSections(dynamic);
      })
      .catch(() => {/* keep defaults */});
  }, []);

  // ── Load filters when section changes ──────────────────────
  const loadFilters = async (navName) => {
    setLoading(true);
    setHasUnsaved(false);
    try {
      const { filterGroups: groups, isDefault: def } = await fetchFiltersAdmin(navName);
      setFilterGroups(groups || []);
      setIsDefault(def);
    } catch (err) {
      setFilterGroups([]);
      setToast("Failed to load filters: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters(selectedSection);
  }, [selectedSection]);

  // ── Save all — persists to DB then re-fetches to confirm ───
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await saveFilters(selectedSection, filterGroups);
      // Re-fetch to confirm saved state
      const { filterGroups: confirmed, isDefault: def } = await fetchFiltersAdmin(selectedSection);
      setFilterGroups(confirmed || []);
      setIsDefault(def);
      setHasUnsaved(false);
      setToast(`✓ Filters saved for ${selectedSection}!`);
    } catch (err) {
      setToast("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to defaults — saves defaults to DB ───────────────
  const handleReset = async () => {
    if (!window.confirm(`Reset ${selectedSection} filters to defaults?`)) return;
    setSaving(true);
    try {
      await resetFilters(selectedSection);
      // Re-fetch confirmed state
      const { filterGroups: groups, isDefault: def } = await fetchFiltersAdmin(selectedSection);
      setFilterGroups(groups || []);
      setIsDefault(def);
      setHasUnsaved(false);
      setToast("Reset to defaults!");
    } catch (err) {
      setToast("Reset failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (group) => {
    setFilterGroups(prev => prev.map(g =>
      (g._id || g.key) === (group._id || group.key) ? { ...g, active: !g.active } : g
    ));
    setHasUnsaved(true);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_GROUP, order: filterGroups.length });
    setModal("add");
  };

  const openEdit = (group) => {
    setForm({ ...group });
    setModal(group);
  };

  const handleDelete = (groupId) => {
    if (!window.confirm("Delete this filter group?")) return;
    setFilterGroups(prev => prev.filter(g => (g._id || g.key) !== groupId));
    setHasUnsaved(true);
    setToast("Removed — click Save to apply");
  };

  const handleModalSave = () => {
    if (!form.label.trim()) { alert("Label is required!"); return; }
    if (!form.key.trim())   { alert("Key is required!"); return; }

    if (modal === "add") {
      setFilterGroups(prev => [...prev, { ...form, _id: `tmp_${Date.now()}` }]);
    } else {
      const targetId = modal._id || modal.key;
      setFilterGroups(prev => prev.map(g =>
        (g._id || g.key) === targetId ? { ...g, ...form } : g
      ));
    }

    setHasUnsaved(true);
    setModal(null);
    setToast(modal === "add"
      ? "Group added — click Save Filters to persist"
      : "Group updated — click Save Filters to persist"
    );
  };

  const activeCount  = filterGroups.filter(g => g.active).length;
  const sortedGroups = [...filterGroups].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
  const selectedInfo = sections.find(s => s.id === selectedSection);

  return (
    <div>
      <PageHeader
        title="Category Filters"
        sub="Manage filters on category pages — select a section, add filter groups, then save"
      />

      {/* Section tabs — dynamic from DB */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: MUTED,
          letterSpacing: "1px", marginBottom: 12 }}>
          SELECT SECTION TO MANAGE FILTERS FOR:
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sections.map(sec => {
            const isActive = selectedSection === sec.id;
            const Icon = sec.Icon;
            return (
              <button key={sec.id} onClick={() => setSelectedSection(sec.id)}
                style={{
                  padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  transition: "all 0.18s",
                  background: isActive ? `linear-gradient(135deg,${GOLD_DARK},${GOLD})` : WHITE,
                  color: isActive ? "#fff" : MUTED,
                  border: `1.5px solid ${isActive ? GOLD : BORDER}`,
                  boxShadow: isActive ? `0 4px 14px ${GOLD}44` : "none",
                  transform: isActive ? "translateY(-1px)" : "none",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  {Icon ? <Icon size={18} /> : null}
                </span>
                {sec.label}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
          Editing filters for{" "}
          <strong style={{ color: GOLD_DARK }}>
            {selectedInfo?.Icon ? <selectedInfo.Icon size={16} /> : null} {selectedInfo?.label || selectedSection}
          </strong>
          {" "}— shown on all <strong>{selectedSection}</strong> category pages.
        </p>
      </div>


      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total Groups" value={filterGroups.length}/>
        <MetricCard label="Active"       value={activeCount}/>
        <MetricCard label="Hidden"       value={filterGroups.length - activeCount}/>
      </div>

      {/* Default notice */}
      {isDefault && (
        <div style={{ padding: "10px 14px", background: "#FFF8E1",
          border: `1px solid #FFD54F`, borderRadius: 8, marginBottom: 14,
          fontSize: 12, color: "#795548",
          display: "flex", alignItems: "flex-start", gap: 8 }}>
          <FiInfo size={14} style={{ marginTop: 1, flexShrink: 0 }}/>
          <span>
            Showing <strong>default filters</strong> — not yet saved for{" "}
            <strong>{selectedSection}</strong>.
            Click <strong>Reset to Defaults</strong> to save them, or add your own groups.
          </span>
        </div>
      )}

      {/* Unsaved banner */}
      {hasUnsaved && (
        <div style={{ padding: "10px 14px", background: "#E3F2FD",
          border: `1px solid #90CAF9`, borderRadius: 8, marginBottom: 14,
          fontSize: 12, color: "#1565C0",
          display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1 }}>
<FaExclamationTriangle size={14} style={{ marginRight: 6, marginTop: 2 }} /> <strong>Unsaved changes</strong> for <strong>{selectedSection}</strong>.
            Click <strong>Save Filters</strong> to persist them.
          </span>
          <button onClick={handleSaveAll} disabled={saving}
            style={{ padding: "5px 14px", background: "#1565C0", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700,
              cursor: "pointer" }}>
            {saving ? "Saving…" : "Save Now"}
          </button>
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Btn variant="primary" onClick={openAdd}>
          <FiPlus size={14}/> Add Filter Group
        </Btn>
        <Btn variant="primary" onClick={handleSaveAll} disabled={saving}>
          <FiSave size={14}/>
          {saving ? " Saving…" : ` Save Filters for ${selectedSection}`}
        </Btn>
        <Btn onClick={handleReset} disabled={saving}>
          <FiRefreshCw size={14}/> Reset to Defaults
        </Btn>
        <button onClick={() => loadFilters(selectedSection)}
          style={{ padding: "8px 14px", background: "none", border: `1px solid ${BORDER}`,
            borderRadius: 8, cursor: "pointer", fontSize: 12, color: MUTED,
            display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
          <FiRefreshCw size={12}/> Refresh
        </button>
      </div>

      {/* Filter groups list */}
<Section title={`${selectedInfo?.label || ""} ${selectedSection} — ${filterGroups.length} filter group(s)`}>
        {loading ? (
          <div style={{ padding: "20px 0" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ height: 56, background: SURFACE, borderRadius: 10,
                marginBottom: 10, border: `1px solid ${BORDER}`,
                animation: "pulse 1.4s ease infinite" }}/>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        ) : filterGroups.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
<div style={{ fontSize: 40, marginBottom: 12 }}>{selectedInfo?.Icon ? <selectedInfo.Icon size={40} /> : <FaShoppingBag size={40} />}</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 6 }}>
              No filter groups for {selectedSection}
            </p>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>
              Click "Add Filter Group" to create, or "Reset to Defaults" to load standard filters.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Btn variant="primary" onClick={openAdd}>
                <FiPlus size={14}/> Add Filter Group
              </Btn>
              <Btn onClick={handleReset}>
                <FiRefreshCw size={14}/> Load Defaults
              </Btn>
            </div>
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            <div style={{ margin: "0 0 12px", padding: "8px 12px",
              background: `${GOLD}08`, border: `1px solid ${GOLD}33`,
              borderRadius: 8, fontSize: 11, color: GOLD_DARK,
              display: "flex", alignItems: "center", gap: 8 }}>
              <FiInfo size={13}/>
              Edit groups below, then click <strong>Save Filters for {selectedSection}</strong> to apply.
            </div>
            {sortedGroups.map((group, idx) => (
              <FilterGroupCard
                key={group._id || group.key || idx}
                group={group} idx={idx}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Modal */}
      {modal !== null && (
        <FilterGroupModal
          modal={modal} form={form} setForm={setForm}
          onSave={handleModalSave} onClose={() => setModal(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)}/>}
    </div>
  );
}