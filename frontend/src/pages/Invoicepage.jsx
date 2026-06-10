import { useEffect, useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";

const GOLD      = "#C9A96E";
const GOLD_DARK = "#A07840";
const CHARCOAL  = "#1A1A1A";
const MUTED     = "#6B6560";
const BORDER    = "#E8E0D5";
const GREEN     = "#2E7D32";

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

function InvoiceDocument({ order }) {
  const addr    = order.deliveryAddress || {};
  const pricing = order.pricing || {};
  const items   = order.items   || [];

  return (
    <div id="rv-invoice-doc" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: CHARCOAL, background: "#fff", maxWidth: 680, margin: "0 auto", padding: "40px 48px", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, paddingBottom: 24, borderBottom: `2px solid ${CHARCOAL}` }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", color: CHARCOAL }}>
            Roop<span style={{ color: GOLD_DARK }}>Vibe</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: "1.5px" }}>FASHION &amp; LIFESTYLE</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
            support@roopvibe.in<br />
            www.roopvibe.in
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: GOLD_DARK, letterSpacing: "1px" }}>TAX INVOICE</div>
          <div style={{ marginTop: 8, fontSize: 12, color: MUTED, lineHeight: 1.8 }}>
            <strong style={{ color: CHARCOAL }}>Invoice No:</strong> {order.orderId}<br />
            <strong style={{ color: CHARCOAL }}>Date:</strong> {fmtDate(order.createdAt)}<br />
            <strong style={{ color: CHARCOAL }}>Payment:</strong> {order.paymentLabel || order.paymentMethod}
          </div>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        {["Bill To", "Ship To"].map((label) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: MUTED, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>{addr.name}</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
              {addr.address}<br />
              {addr.city}, {addr.state} — {addr.pincode}<br />
              Phone: {addr.phone}
            </div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: CHARCOAL }}>
            {[
              { label: "#",     align: "left"   },
              { label: "ITEM",  align: "left"   },
              { label: "QTY",   align: "center" },
              { label: "PRICE", align: "right"  },
              { label: "TOTAL", align: "right"  },
            ].map((h) => (
              <th key={h.label} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: h.align, letterSpacing: "1px" }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF8" : "#fff", borderBottom: `1px solid ${BORDER}` }}>
              <td style={{ padding: "12px 14px", fontSize: 12, color: MUTED }}>{i + 1}</td>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{item.name}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                  {[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`].filter(Boolean).join("  ·  ")}
                </div>
              </td>
              <td style={{ padding: "12px 14px", fontSize: 13, color: CHARCOAL, textAlign: "center" }}>{item.quantity}</td>
              <td style={{ padding: "12px 14px", fontSize: 13, color: CHARCOAL, textAlign: "right" }}>{fmtMoney(item.price)}</td>
              <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: CHARCOAL, textAlign: "right" }}>{fmtMoney(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pricing Summary */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
        <div style={{ width: 260 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
            <span>Subtotal</span><span>{fmtMoney(pricing.subtotal)}</span>
          </div>
          {pricing.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: GREEN, borderBottom: `1px solid ${BORDER}` }}>
              <span>Discount</span><span>- {fmtMoney(pricing.discount)}</span>
            </div>
          )}
          {pricing.couponDiscount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: GREEN, borderBottom: `1px solid ${BORDER}` }}>
              <span>Coupon ({pricing.coupon})</span><span>- {fmtMoney(pricing.couponDiscount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
            <span>Delivery</span><span style={{ color: GREEN }}>FREE</span>
          </div>
          {pricing.codFee > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#C0392B", borderBottom: `1px solid ${BORDER}` }}>
              <span>COD Fee</span><span>+ {fmtMoney(pricing.codFee)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", fontSize: 16, fontWeight: 800, color: CHARCOAL, borderTop: `2px solid ${CHARCOAL}`, marginTop: 4 }}>
            <span>TOTAL PAID</span><span style={{ color: GOLD_DARK }}>{fmtMoney(pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ display: "inline-block", padding: "6px 20px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: order.status === "Delivered" ? "#E8F5E9" : "#FFF3E0", color: order.status === "Delivered" ? GREEN : "#E65100", border: `1px solid ${order.status === "Delivered" ? "#A5D6A7" : "#FFCC80"}` }}>
          Order Status: {order.status}
        </span>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `2px solid ${CHARCOAL}`, paddingTop: 20, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, marginBottom: 6 }}>Thank you for shopping with RoopVibe!</div>
        <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.7 }}>
          For any queries, contact us at support@roopvibe.in<br />
          Returns &amp; exchanges accepted within 7 days of delivery.
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: "#bbb", letterSpacing: "1px" }}>
          This is a computer-generated invoice. No signature required.
        </div>
      </div>
    </div>
  );
}

export default function InvoiceModal({ order, onClose }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownload = async () => {
    const printContent = document.getElementById("rv-invoice-doc");
    if (!printContent) return;
    setPdfLoading(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData    = canvas.toDataURL("image/png");
      const pdf        = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight  = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position   = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position   -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${order.orderId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 3000,
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: "fixed", inset: 0,
          zIndex: 3001,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "20px 16px",
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      >
        {/* Inner modal box */}
        <div
          style={{
            width: "100%",
            maxWidth: 740,
            maxHeight: "calc(100vh - 40px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            animation: "fadeUp 0.25s ease",
            pointerEvents: "all",
          }}
        >
          {/* Top action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: "#1A1A1A",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              Invoice — {order.orderId}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDownload}
                disabled={pdfLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: 8, border: "none",
                  background: pdfLoading ? "#555" : `linear-gradient(to right, ${GOLD_DARK}, ${GOLD})`,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: pdfLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "background 0.2s",
                }}
              >
                <FiDownload size={14} />
                {pdfLoading ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", border: "none",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#fff",
                }}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable invoice content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#F0EDE8",
              padding: "20px 16px 32px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 4,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              }}
            >
              <InvoiceDocument order={order} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}