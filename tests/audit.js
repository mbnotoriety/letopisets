window.__audit = function (sel) {
  const root = sel ? document.querySelector(sel) : document.body; if (!root) return { none: true };
  const W = window.__W || innerWidth;
  const desc = el => { let s = el.tagName.toLowerCase(); if (el.id) s += "#" + el.id; if (el.classList.length) s += "." + [...el.classList].slice(0, 2).join("."); const t = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24); return s + (t ? ` "${t}"` : ""); };
  const vis = el => { const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < .05) return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(cs.overflowX)) { const r = a.getBoundingClientRect(); if (r.right <= W + 1 && r.left >= -1) return true; } } return false; };
  const clipR = (el, r) => { let L = r.left, T = r.top, Rr = r.right, B = r.bottom; for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { const q = a.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); Rr = Math.min(Rr, q.right); B = Math.min(B, q.bottom); } } T = Math.max(T, 0); B = Math.min(B, innerHeight); return (Rr - L > 2 && B - T > 2) ? { left: L, top: T, right: Rr, bottom: B, width: Rr - L, height: B - T } : null; };
  const out = { docOverflow: document.documentElement.scrollWidth - W, wide: [], overlaps: [], small: [] }; const leaves = [];
  root.querySelectorAll("*").forEach(el => { if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return; if (!vis(el)) return; const r = el.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !clipped(el)) out.wide.push(desc(el) + ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
    const cs = getComputedStyle(el); const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if ((txt && cs.display !== "inline") || el.matches("button,input,textarea,select,img")) { const c = clipR(el, r); if (c) leaves.push([el, c]); }
    if (el.matches("button, [role=button], a[href]") && (r.height < 24 || r.width < 24) && r.width > 2) out.small.push(desc(el) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) { const [a, ra] = leaves[i], [b, rb] = leaves[j]; if (a.contains(b) || b.contains(a)) continue;
    const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (w < 3 || h < 3) continue;
    const ar = w * h, sm = Math.min(ra.width * ra.height, rb.width * rb.height); if (ar > 24 && ar > .12 * sm) out.overlaps.push(desc(a) + " ⟷ " + desc(b)); }
  out.wide = out.wide.slice(0, 12); out.overlaps = out.overlaps.slice(0, 15); out.small = [...new Set(out.small)].slice(0, 10); return out;
};
