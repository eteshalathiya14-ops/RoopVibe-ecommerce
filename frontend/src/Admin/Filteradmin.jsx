// src/Admin/FilterAdmin.jsx
// ─────────────────────────────────────────────────────────────
// Admin can manage category page filters per navbar section
// Add/edit/delete filter groups and their options
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiRefreshCw, FiToggleLeft, FiToggleRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  fetchFiltersAdmin, saveFilters, addFilterGroup,
  updateFilterGroup, deleteFilterGroup, resetFilters,
} from "../Api/Categoryfilterapi";
import {
  Btn, Modal, FormGroup, Input, Select, Toggle, Toast,
  PageHeader, Section, RowItem, Badge,
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE, DANGER,
} from "./Adminshared";

// Navbar sections available for filter management
const NAV_SECTIONS = ["WOMEN", "MEN", "KIDS", "HOME", "OFFERS"];

const FILTER_TYPES = [
  { value: "checkbox", label: "Checkbox (multi-select)" },
  { value: "radio",    label: "Radio (single-select)" },
  { value: "color",    label: "Color swatches" },
];

// ── Color picker for color-type filter options ────────────────
const PRESET_COLORS = [
  { name: "Red",    hex: "#E53935" },
  { name: "Blue",   hex: "#1E88E5" },
  { name: "Green",  hex: "#43A047" },
  { name: "Yellow", hex: "#FDD835" },
  { name: "Pink",   hex: "#E91E8C" },
  { name: "Orange", hex: "#FB8C00" },
  { name: "White",  hex: "#F5F5F5" },
  { name: "Black",  hex: "#212121" },
  { name: "Purple", hex: "#8E24AA" },
  { name: "Gold",   hex: "#C9A96E" },
  { name: "Brown",  hex: "#795548" },
  { name: "Beige",  hex: "#F5DEB3" },
];

// ── Option Editor for a filter group ─────────────────────────
function OptionEditor({ type, options, onChange }) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newHex,   setNewHex]   = useState("#C9A96E");
  const [newMin,   setNewMin]   = useState("");
  const [newMax,   setNewMax]   = useState("");

  const addOption = () => {
    if (!newLabel.trim()) return;

    const opt = { label: newLabel.trim(), value: newValue.trim() || newLabel.trim() };
    if (type === "color") opt.hex = newHex;
    if (type === "radio" && (newMin || newMax)) {
      if (newMin) opt.min = parseFloat(newMin);
      if (newMax) opt.max = parseFloat(newMax);
    }

    onChange([...options, opt]);
    setNewLabel(""); setNewValue(""); setNewMin(""); setNewMax("");
  };

  const removeOption = (idx) => onChange(options.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Existing options */}
      <div style={{ marginBottom: 10 }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
            background: SURFACE, borderRadius: 6, marginBottom: 6,
            border: `1px solid ${BORDER}`,
          }}>
            {type === "color" && (
              <div style={{ width: 20, height: 20, borderRadius: "50%",
                background: opt.hex, border: `1.5px solid ${BORDER}`, flexShrink: 0 }}/>
            )}
            <span style={{ flex: 1, fontSize: 12, color: CHARCOAL, fontWeight: 600 }}>
              {opt.label}
            </span>
            {opt.value !== opt.label && (
              <span style={{ fontSize: 10, color: MUTED }}>({opt.value})</span>
            )}
            {(opt.min !== undefined || opt.max !== undefined) && (
              <span style={{ fontSize: 10, color: MUTED }}>
                {opt.min ?? 0}–{opt.max ?? "∞"}
              </span>
            )}
            <button onClick={() => removeOption(idx)}
              style={{ border: "none", background: "none", cursor: "pointer",
                color: DANGER, display: "flex", padding: 0 }}>
              <FiX size={14}/>
            </button>
          </div>
        ))}
      </div>

      {/* Add new option */}
      <div style={{ background: "#fffdf8", border: `1px dashed ${BORDER}`,
        borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginBottom: 8 }}>
          + ADD OPTION
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 3 }}>Label *</label>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Cotton"
              style={{ width: "100%", padding: "6px 10px", borderRadius: 6,
                border: `1px solid ${BORDER}`, fontSize: 12, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box" }}/>
          </div>
          <div>
            <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 3 }}>
              Value (optional, defaults to label)
            </label>
            <input value={newValue} onChange={e => setNewValue(e.target.value)}
              placeholder="same as label"
              style={{ width: "100%", padding: "6px 10px", borderRadius: 6,
                border: `1px solid ${BORDER}`, fontSize: 12, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box" }}/>
          </div>
        </div>

        {/* Color picker for color type */}
        {type === "color" && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 6 }}>Color</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              {PRESET_COLORS.map(c => (
                <div key={c.hex} onClick={() => { setNewHex(c.hex); setNewLabel(c.name); setNewValue(c.name); }}
                  style={{
                    width: 24, height: 24, borderRadius: "50%", background: c.hex, cursor: "pointer",
                    border: newHex === c.hex ? `3px solid ${GOLD}` : `2px solid ${BORDER}`,
                    boxShadow: newHex === c.hex ? `0 0 0 2px ${GOLD_LIGHT}` : "none",
                    transition: "all 0.15s",
                  }} title={c.name}/>
              ))}
              <input type="color" value={newHex} onChange={e => setNewHex(e.target.value)}
                style={{ width: 24, height: 24, padding: 0, borderRadius: "50%",
                  border: `2px solid ${BORDER}`, cursor: "pointer" }}
                title="Custom color"/>
            </div>
          </div>
        )}

        {/* Min/Max for radio price/discount filters */}
        {type === "radio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 3 }}>Min value</label>
              <input value={newMin} onChange={e => setNewMin(e.target.value)} type="number" placeholder="0"
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6,
                  border: `1px solid ${BORDER}`, fontSize: 12, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 3 }}>Max value</label>
              <input value={newMax} onChange={e => setNewMax(e.target.value)} type="number" placeholder="∞"
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6,
                  border: `1px solid ${BORDER}`, fontSize: 12, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box" }}/>
            </div>
          </div>
        )}

        <button onClick={addOption}
          style={{ padding: "6px 16px", background: GOLD, color: "#fff", border: "none",
            borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          <FiPlus size={13}/> Add option
        </button>
      </div>
    </div>
  );
}

// ── Single filter group card ───────────────────────────────────
function FilterGroupCard({ group, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: `1px solid ${group.active ? BORDER : "#f5e5e5"}`,
      borderRadius: 10, marginBottom: 10, background: group.active ? WHITE : "#fffafa",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 10 }}>
        <button onClick={() => setExpanded(e => !e)}
          style={{ background: "none", border: "none", cursor: "pointer",
            display: "flex", color: MUTED }}>
          {expanded ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>{group.label}</span>
            <Badge>{group.type.toUpperCase()}</Badge>
            <span style={{ fontSize: 11, color: MUTED }}>{group.options?.length || 0} options</span>
            <span style={{ fontSize: 11, color: MUTED }}>key: <code style={{ background: SURFACE,
              padding: "1px 5px", borderRadius: 4 }}>{group.key}</code></span>
            {!group.active && <Badge color="#FDECEA" text={DANGER}>HIDDEN</Badge>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Toggle value={group.active} onChange={() => onToggle(group)}/>
          <Btn size="sm" onClick={() => onEdit(group)}><FiEdit2 size={13}/></Btn>
          <Btn size="sm" variant="danger" onClick={() => onDelete(group._id)}>
            <FiTrash2 size={13}/>
          </Btn>
        </div>
      </div>

      {/* Expanded: show options preview */}
      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {group.type === "color"
              ? group.options?.map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4,
                    padding: "3px 10px", borderRadius: 20, background: SURFACE,
                    border: `1px solid ${BORDER}`, fontSize: 11 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%",
                      background: opt.hex, flexShrink: 0 }}/>
                    {opt.label}
                  </div>
                ))
              : group.options?.map((opt, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px",
                    borderRadius: 20, background: SURFACE, border: `1px solid ${BORDER}`,
                    color: CHARCOAL }}>
                    {opt.label}
                    {(opt.min !== undefined || opt.max !== undefined) && (
                      <span style={{ color: MUTED, marginLeft: 4 }}>
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

// ── MAIN COMPONENT ─────────────────────────────────────────────
const EMPTY_GROUP = { label: "", key: "", type: "checkbox", options: [], active: true, order: 0 };

export default function FilterAdmin() {
  const [selectedNav, setSelectedNav] = useState("WOMEN");
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [modal,    setModal]    = useState(null);  // null | "add" | groupObject
  const [form,     setForm]     = useState(EMPTY_GROUP);
  const [toast,    setToast]    = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load filters when navName changes
  useEffect(() => {
    setLoading(true);
    fetchFiltersAdmin(selectedNav)
      .then(({ filterGroups: groups, isDefault: def }) => {
        setFilterGroups(groups);
        setIsDefault(def);
      })
      .catch(() => setFilterGroups([]))
      .finally(() => setLoading(false));
  }, [selectedNav]);

  // Save entire filter config to DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await saveFilters(selectedNav, filterGroups);
      setIsDefault(false);
      setToast("Filters saved!");
    } catch (err) {
      setToast("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!window.confirm("Reset to default filters? This will overwrite current filters.")) return;
    setSaving(true);
    try {
      await resetFilters(selectedNav);
      const { filterGroups: groups } = await fetchFiltersAdmin(selectedNav);
      setFilterGroups(groups);
      setIsDefault(false);
      setToast("Reset to defaults!");
    } catch (err) {
      setToast("Reset failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle group active locally (will be saved on Save All)
  const handleToggle = (group) => {
    setFilterGroups(prev =>
      prev.map(g => (g._id || g.key) === (group._id || group.key)
        ? { ...g, active: !g.active }
        : g
      )
    );
  };

  // Open add modal
  const openAdd = () => {
    setForm({ ...EMPTY_GROUP, order: filterGroups.length });
    setModal("add");
  };

  // Open edit modal
  const openEdit = (group) => {
    setForm({ ...group });
    setModal(group);
  };

  // Delete a filter group
  const handleDelete = (groupId) => {
    if (!window.confirm("Delete this filter group?")) return;
    setFilterGroups(prev => prev.filter(g => (g._id || g.key) !== groupId));
    setToast("Group removed — click Save to apply");
  };

  // Save from modal (add or edit)
  const handleModalSave = () => {
    if (!form.label.trim() || !form.key.trim()) return alert("Label and Key are required!");

    if (modal === "add") {
      setFilterGroups(prev => [...prev, { ...form, _id: `tmp_${Date.now()}` }]);
    } else {
      setFilterGroups(prev => prev.map(g =>
        (g._id || g.key) === (modal._id || modal.key) ? { ...form } : g
      ));
    }

    setModal(null);
    setToast("Group updated — click Save to apply to DB");
  };

  const activeCount = filterGroups.filter(g => g.active).length;

  return (
    <div>
      <PageHeader
        title="Category Filters"
        sub="Manage filters shown on category pages — per navbar section"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          ["Total groups", filterGroups.length],
          ["Active",       activeCount],
          ["Hidden",       filterGroups.length - activeCount],
        ].map(([l, v]) => (
          <div key={l} style={{ background: WHITE, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Nav section tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {NAV_SECTIONS.map(nav => (
          <button key={nav} onClick={() => setSelectedNav(nav)}
            style={{ padding: "6px 18px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: selectedNav === nav ? GOLD : WHITE,
              color: selectedNav === nav ? WHITE : MUTED,
              border: `1px solid ${selectedNav === nav ? GOLD : BORDER}` }}>
            {nav}
          </button>
        ))}
      </div>

      {/* Default notice */}
      {isDefault && (
        <div style={{ padding: "10px 14px", background: "#FFF8E1", border: `1px solid #FFD54F`,
          borderRadius: 8, marginBottom: 14, fontSize: 12, color: "#795548",
          display: "flex", alignItems: "center", gap: 8 }}>
          ℹ️ Showing <strong>default filters</strong> — not yet saved to DB for this section.
          Click <strong>Save Filters</strong> to persist custom changes.
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <Btn variant="primary" onClick={openAdd}><FiPlus size={14}/> Add filter group</Btn>
        <Btn variant="primary" onClick={handleSaveAll} disabled={saving}>
          <FiSave size={14}/> {saving ? "Saving…" : "Save Filters"}
        </Btn>
        <Btn onClick={handleReset}>
          <FiRefreshCw size={14}/> Reset to defaults
        </Btn>
        <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>
          Drag to reorder (coming soon)
        </span>
      </div>

      {/* Filter groups list */}
      <Section title={`${selectedNav} — ${filterGroups.length} filter group(s)`}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>
            Loading filters…
          </div>
        ) : filterGroups.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>
            No filter groups. Click "Add filter group" to create one.
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            {[...filterGroups]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map(group => (
                <FilterGroupCard
                  key={group._id || group.key}
                  group={group}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))
            }
          </div>
        )}
      </Section>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <Modal
          title={modal === "add" ? "Add filter group" : `Edit: ${modal.label}`}
          onClose={() => setModal(null)}
          wide
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleModalSave}><FiSave size={14}/> Save group</Btn>
          </>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormGroup label="Label * (shown to users, e.g. FABRIC)">
              <Input value={form.label} onChange={v => set("label", v.toUpperCase())} placeholder="FABRIC"/>
            </FormGroup>
            <FormGroup label="Key * (field name in product, e.g. fabric)">
              <Input value={form.key} onChange={v => set("key", v.toLowerCase().replace(/\s+/g,"_"))}
                placeholder="fabric"/>
            </FormGroup>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormGroup label="Filter type">
              <Select
                value={form.type}
                onChange={v => set("type", v)}
                options={FILTER_TYPES.map(t => t.value)}
              />
              <div style={{ marginTop: 4, fontSize: 11, color: MUTED }}>
                {FILTER_TYPES.find(t => t.value === form.type)?.label}
              </div>
            </FormGroup>
            <FormGroup label="Order (position)">
              <Input value={form.order ?? 0} onChange={v => set("order", parseInt(v) || 0)} type="number"/>
            </FormGroup>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Toggle value={form.active} onChange={v => set("active", v)}/>
            <span style={{ fontSize: 13, color: CHARCOAL }}>Active (show this filter group)</span>
          </div>

          <FormGroup label={`Options (${form.options?.length || 0} added)`}>
            <OptionEditor
              type={form.type}
              options={form.options || []}
              onChange={v => set("options", v)}
            />
          </FormGroup>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)}/>}
    </div>
  );
}