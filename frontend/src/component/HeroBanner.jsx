/**
 * HeroBanner — FIXED
 * 
 * Two modes:
 *  1. FULL-WIDTH mode  → when banner has only img (admin upload, no title/cta)
 *     Image covers entire banner, optional subtle overlay with filename hidden
 *  2. SPLIT mode       → when banner has title + img (default banners)
 *     Left: text, Right: image (existing layout)
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAdminData } from "../Admin/context/Admindatacontext";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const GOLD      = "#C9A96E";
const GOLD_DARK = "#A07840";
const BORDER    = "#EDE8E0";
const SURFACE   = "#FAF7F2";

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

export default function HeroBanner() {
  const { banners } = useAdminData();
  const isMobile    = useIsMobile();
  const slides      = banners.filter(b => b.active).sort((a, b) => a.order - b.order);

  const [current, setCurrent] = useState(0);
  const [imgKey,  setImgKey]  = useState(0);
  const [txtKey,  setTxtKey]  = useState(0);
  const timerRef = useRef(null);
  const total    = slides.length;

  const goTo = idx => {
    const next = (idx + total) % total;
    setCurrent(next); setImgKey(k => k + 1); setTxtKey(k => k + 1);
  };
  const startTimer = () => {
    clearInterval(timerRef.current);
    if (total > 1)
      timerRef.current = setInterval(() => {
        setCurrent(c => { const n = (c + 1) % total; setImgKey(k => k + 1); setTxtKey(k => k + 1); return n; });
      }, 2000);
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [total]);

  const touchStartX = useRef(null);
  const onTouchStart = e => { touchStartX.current = e.touches?.[0]?.clientX ?? null; };
  const onTouchEnd   = e => {
    const ex = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current == null || ex == null) return;
    const dx = ex - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? goTo(current + 1) : goTo(current - 1);
    touchStartX.current = null;
  };

  if (!total) return null;
  const slide    = slides[current % total];
  const slideImg = resolveImg(slide.img);

  // ── Decide mode ──────────────────────────────────────────
  // Full-width when: no title OR title is just a filename (has extension like .jpg/.jpeg/.png/.webp)
  const hasRealTitle = slide.title && !/\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(slide.title.trim());
  const hasText      = hasRealTitle || slide.tag || slide.cta || slide.sub;
  const isFullWidth  = !hasText; // image-only banner from admin upload

  const H       = isMobile ? 200 : 320;
  const bannerW = isMobile ? "95%" : "72%";

  return (
    <div style={{ padding: isMobile ? "10px 0 8px" : "14px 0 10px", backgroundColor: SURFACE, display: "flex", justifyContent: "center" }}>
      <div
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={startTimer}
        style={{ position: "relative", width: bannerW, maxWidth: "960px", touchAction: "pan-y" }}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      >
        <div style={{
          position: "relative", height: H,
          borderRadius: isMobile ? 10 : 12, overflow: "hidden",
          boxShadow: "0 6px 32px rgba(201,169,110,0.18)",
          border: `1px solid ${GOLD}44`,
          background: slide.bg || "#2C1A0E",
        }}>

          {/* ── FULL-WIDTH mode: image fills entire banner ── */}
          {isFullWidth && slideImg && (
            <>
              <img
                 key={`i${imgKey}`}
                src={slideImg}
                alt="banner"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  display: "block",
                  animation: "imgIn 0.8s ease both, kenBurns 5s ease forwards",
                }}
                onError={e => e.target.style.opacity = "0"}
              />
              {/* Subtle dark gradient at bottom for counter readability */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
                background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
                pointerEvents: "none",
              }} />
            </>
          )}

          {/* ── SPLIT mode: left text + right image ── */}
          {!isFullWidth && (
            <>
              {/* Text side */}
              <div
                key={`t${txtKey}`}
                style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: isMobile ? "57%" : "55%",
                  padding: isMobile ? "12px 6px 12px 12px" : "28px 28px 28px 32px",
                  display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 2,
                }}
              >
                {slide.tag && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    backgroundColor: `${GOLD}20`, border: `1px solid ${GOLD}50`,
                    padding: isMobile ? "2px 8px" : "3px 12px", borderRadius: 20,
                    marginBottom: isMobile ? 8 : 12, width: "fit-content",
                    animation: "tagPop 0.5s ease both",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: GOLD, display: "inline-block" }} />
                    <span style={{ fontSize: isMobile ? "7px" : "9px", fontWeight: 800, letterSpacing: "1.5px", color: GOLD }}>
                      {slide.tag}
                    </span>
                  </div>
                )}

                {hasRealTitle && (
                  <h2 style={{
                    fontSize: isMobile ? "17px" : "28px", fontWeight: 800, color: "#fff",
                    lineHeight: 1.15, marginBottom: isMobile ? 6 : 10,
                    fontFamily: "'Playfair Display',Georgia,serif",
                    whiteSpace: "pre-line", textShadow: "0 2px 14px rgba(0,0,0,0.35)",
                    animation: "slideInL 0.6s 0.1s ease both",
                  }}>
                    {slide.title}
                  </h2>
                )}

                {slide.sub && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isMobile ? 10 : 18, animation: "slideInL 0.6s 0.2s ease both" }}>
                    <div style={{ height: "1.5px", width: 16, background: GOLD, opacity: 0.8, borderRadius: 1 }} />
                    <p style={{ fontSize: isMobile ? "9px" : "11px", color: GOLD, fontWeight: 700, letterSpacing: "1.2px" }}>{slide.sub}</p>
                  </div>
                )}

                {slide.cta && (
                  <Link to={slide.ctaLink || "/"} style={{ textDecoration: "none" }}>
                    <button style={{
                      backgroundColor: "transparent", border: `1.5px solid ${GOLD}`,
                      color: GOLD, padding: isMobile ? "5px 10px" : "8px 20px",
                      fontSize: isMobile ? "8px" : "10px", fontWeight: 800,
                      letterSpacing: "1px", borderRadius: 4, cursor: "pointer",
                      transition: "all 0.2s", display: "flex", alignItems: "center", gap: 4,
                      animation: "slideInL 0.6s 0.3s ease both",
                    }}>
                      {slide.cta} <FiArrowRight size={isMobile ? 10 : 12} />
                    </button>
                  </Link>
                )}
              </div>

              {/* Image side */}
              {slideImg && (
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: isMobile ? "41%" : "42%", overflow: "hidden" }}>
                  <img
                    key={`i${imgKey}`}
                    src={slideImg}
                    alt=""
                    style={{
                      width: "100%", height: "100%", objectFit: "cover", objectPosition: "top",
                      display: "block", animation: "imgIn 0.8s ease both, kenBurns 5s ease forwards",
                    }}
                    onError={e => e.target.style.opacity = "0"}
                  />
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: "45%",
                    background: "linear-gradient(to right,#2C1A0E,transparent)", pointerEvents: "none",
                  }} />
                </div>
              )}
            </>
          )}

          {/* Slide counter */}
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            backgroundColor: "rgba(26,20,8,0.55)", border: `1px solid ${GOLD}44`,
            padding: "2px 8px", borderRadius: 20, fontSize: 9, fontWeight: 700, color: GOLD, zIndex: 10,
          }}>
            {current + 1}/{total}
          </div>

          {/* Nav arrows (desktop) */}
          {!isMobile && total > 1 && [[-1, "left"], [1, "right"]].map(([d, p]) => (
            <button key={p} onClick={() => goTo(current + d)} style={{
              position: "absolute", top: "50%", [p]: 10, transform: "translateY(-50%)",
              width: 30, height: 30, borderRadius: "50%",
              backgroundColor: "rgba(26,20,8,0.55)", border: `1px solid ${GOLD}55`,
              color: GOLD, cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 10,
            }}>
              {d === -1 ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
            </button>
          ))}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}>
                <div style={{
                  width: i === current ? 18 : 6, height: 6, borderRadius: 4,
                  backgroundColor: i === current ? GOLD : BORDER, transition: "all 0.3s",
                }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}