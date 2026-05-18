"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const RELATIONSHIPS = ["Family", "Spouse", "Parent", "Sibling", "Friend", "Colleague", "Neighbor", "Other"];

const empty = () => ({ name: "", phone: "", email: "", relationship: "Family" });

export default function EmergencyContactsModal({ onClose }) {
  const [contacts, setContacts] = useState([empty()]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await axios.get(`${API}/api/sos/emergency-contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(data.length > 0 ? data : [empty()]);
      } catch {
        setContacts([empty()]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [token]);

  const update = (i, field, value) => {
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
    setError("");
    setSaved(false);
  };

  const addContact = () => {
    if (contacts.length >= 5) return;
    setContacts(prev => [...prev, empty()]);
  };

  const removeContact = (i) => {
    if (contacts.length === 1) return;
    setContacts(prev => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setError("");
    for (const c of contacts) {
      if (!c.name.trim())  { setError("Each contact must have a name.");  return; }
      if (!c.phone.trim()) { setError("Each contact must have a phone number."); return; }
      if (!/^03\d{9}$/.test(c.phone.trim())) {
        setError(`Invalid phone for "${c.name}". Use format: 03XXXXXXXXX`);
        return;
      }
    }
    setSaving(true);
    try {
      await axios.put(
        `${API}/api/sos/emergency-contacts`,
        { contacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save contacts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.headerIcon}>🆘</div>
            <div>
              <h2 style={S.title}>Emergency Contacts</h2>
              <p style={S.subtitle}>Notified instantly when you press SOS</p>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
              <div style={S.spinner} />
              <p>Loading contacts...</p>
            </div>
          ) : (
            <>
              <div style={S.infoBox}>
                <span style={{ fontSize: 16 }}>ℹ️</span>
                <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>
                  Add up to <strong>5 trusted contacts</strong>. They will receive an emergency email with your live location when you press SOS.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {contacts.map((c, i) => (
                  <div key={i} style={S.contactCard}>
                    <div style={S.cardHeader}>
                      <span style={{ fontWeight: 700, color: "#374151", fontSize: 13 }}>
                        Contact {i + 1}
                      </span>
                      {contacts.length > 1 && (
                        <button style={S.removeBtn} onClick={() => removeContact(i)}>
                          × Remove
                        </button>
                      )}
                    </div>

                    <div style={S.fieldGrid}>
                      <div style={S.field}>
                        <label style={S.label}>Full Name *</label>
                        <input
                          style={S.input}
                          placeholder="e.g. Sara Ahmed"
                          value={c.name}
                          onChange={e => update(i, "name", e.target.value)}
                        />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Relationship</label>
                        <select style={S.input} value={c.relationship} onChange={e => update(i, "relationship", e.target.value)}>
                          {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Phone Number * <span style={{ color: "#9ca3af" }}>(03XXXXXXXXX)</span></label>
                        <input
                          style={S.input}
                          placeholder="03001234567"
                          value={c.phone}
                          maxLength={11}
                          onChange={e => update(i, "phone", e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Email <span style={{ color: "#9ca3af" }}>(optional)</span></label>
                        <input
                          style={S.input}
                          type="email"
                          placeholder="sara@example.com"
                          value={c.email}
                          onChange={e => update(i, "email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {contacts.length < 5 && (
                <button style={S.addBtn} onClick={addContact}>
                  + Add Another Contact
                </button>
              )}

              {error && <p style={S.errorText}>{error}</p>}

              {saved && (
                <div style={S.successMsg}>
                  ✅ Emergency contacts saved successfully!
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div style={S.footer}>
            <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Contacts"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,.65)",
    backdropFilter: "blur(6px)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  },
  modal: {
    background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600,
    maxHeight: "90vh", display: "flex", flexDirection: "column",
    boxShadow: "0 30px 80px rgba(0,0,0,.3)", overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg,#7f1d1d,#dc2626)",
    padding: "20px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
  },
  headerIcon: {
    width: 44, height: 44, background: "rgba(255,255,255,.15)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
  },
  title:    { margin: 0, color: "#fff", fontSize: 17, fontWeight: 800 },
  subtitle: { margin: "2px 0 0", color: "rgba(255,255,255,.7)", fontSize: 12 },
  closeBtn: {
    background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
    width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 20, lineHeight: 1,
  },
  body: { overflowY: "auto", flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },
  infoBox: {
    background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
    padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
  },
  contactCard: {
    background: "#f9fafb", border: "1.5px solid #e5e7eb",
    borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12,
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  removeBtn: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#dc2626", fontSize: 12, fontWeight: 700,
    padding: "3px 10px", borderRadius: 6, cursor: "pointer",
  },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  field:  { display: "flex", flexDirection: "column", gap: 4 },
  label:  { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em" },
  input: {
    padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
    fontSize: 13, color: "#111827", outline: "none", background: "#fff",
    fontFamily: "inherit",
  },
  addBtn: {
    alignSelf: "flex-start", background: "transparent",
    border: "1.5px dashed #d1d5db", color: "#6b7280",
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  errorText:  { color: "#dc2626", fontSize: 13, fontWeight: 600, marginTop: 4 },
  successMsg: {
    background: "#f0fdf4", border: "1px solid #a7f3d0",
    borderRadius: 10, padding: "12px 16px", color: "#065f46",
    fontWeight: 700, fontSize: 13, textAlign: "center",
  },
  footer: {
    padding: "16px 24px", borderTop: "1px solid #e5e7eb",
    display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0,
  },
  cancelBtn: {
    padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
    background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 24px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg,#dc2626,#991b1b)",
    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  spinner: {
    width: 32, height: 32, border: "3px solid #dc2626",
    borderTopColor: "transparent", borderRadius: "50%",
    animation: "spin 1s linear infinite", margin: "0 auto 12px",
  },
};