/* ============================================================
   KNT · App Shell
   Shared layout injection (header/nav), plus reusable UI helpers
   used by every interior page: toast, modal, loader, format utils.
   Each page calls KNTShell.mount({ page }) to wire up the chrome.
   ============================================================ */
(function (global) {
  "use strict";

  /* ============================================================
     KNT_AUTH — Client-side authentication
     Password hash (SHA-256): "newtron05"
     ============================================================ */
  const AUTH = {
    _key: "knt-auth",
    _userKey: "knt-user",
    _hash: "a96caacc78434461b8664705cbad2a9b490aa2b61ffe78bbc87b5a3e9d607d22",

    isLoggedIn() {
      return sessionStorage.getItem(this._key) === "teacher";
    },

    getUser() {
      return sessionStorage.getItem(this._userKey) || "";
    },

    async login(password) {
      const msg = new TextEncoder().encode(password);
      const buf = await crypto.subtle.digest("SHA-256", msg);
      const hash = Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0")).join("");
      if (hash === this._hash) {
        sessionStorage.setItem(this._key, "teacher");
        sessionStorage.setItem(this._userKey, "ครูนิวตรอน");
        return true;
      }
      return false;
    },

    logout() {
      sessionStorage.removeItem(this._key);
      sessionStorage.removeItem(this._userKey);
    },

    // Redirect to login if not authenticated
    guard() {
      if (!this.isLoggedIn()) {
        const loginUrl = "login.html?return=" + encodeURIComponent(location.pathname.split("/").pop() || "index.html");
        window.location.replace(loginUrl);
        return false;
      }
      return true;
    },

    // Render auth-aware header button
    renderAuthButton() {
      if (this.isLoggedIn()) {
        return `<div class="auth-dropdown" id="authDropdown">
          <button class="auth-btn" id="authBtn" aria-label="บัญชีผู้ใช้">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
            <span class="auth-label">${this.getUser()}</span>
            <span class="auth-dot"></span>
          </button>
          <div class="auth-menu" id="authMenu" hidden>
            <div class="auth-menu-head">
              <span>${this.getUser()}</span>
              <span class="auth-role">ผู้ดูแลระบบ</span>
            </div>
            <button class="auth-menu-item" id="btnLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              ออกจากระบบ
            </button>
          </div>
        </div>`;
      }
      return `<a href="login.html" class="btn-ghost btn-signin">เข้าสู่ระบบ</a>`;
    },

    // Wire up dropdown events (call after header is in DOM)
    initDropdown() {
      const btn = document.getElementById("authBtn");
      const menu = document.getElementById("authMenu");
      if (!btn || !menu) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      });
      document.addEventListener("click", () => { menu.hidden = true; });
      document.getElementById("btnLogout")?.addEventListener("click", () => {
        this.logout();
        window.location.reload();
      });
    },
  };

  /* ---------- Navigation model ---------- */
  const NAV = [
    { id: "dashboard",      label: "แดชบอร์ด",   href: "index.html" },
    { id: "subject-checkin",label: "เช็คชื่อรายวิชา", href: "subject-checkin.html" },
    { id: "attendance",     label: "เช็คชื่อ ม.6/1", href: "attendance.html" },
    { id: "submit-work",    label: "ส่งงาน",      href: "submit-work.html" },
    { id: "random",         label: "สุ่มเลขที่",   href: "random.html" },
    { id: "exam",           label: "ข้อสอบ",      href: "exam.html" },
    { id: "grades",         label: "เกรด & ผล",   href: "grades.html" },
    { id: "class-fund",     label: "เงินห้อง",     href: "class-fund.html" },
    { id: "boardgame",      label: "บอร์ดเกม",    href: "boardgame.html" },
  ];

  const BRAND_SVG = `
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <rect x="2" y="2" width="44" height="44" rx="12" stroke="url(#kg2)" stroke-width="1.5"/>
        <path d="M16 14 V34 M16 14 L30 34 M30 14 V34" stroke="#e0102f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="30" cy="14" r="2.4" fill="#e0102f"/>
        <defs><linearGradient id="kg2" x1="0" y1="0" x2="48" y2="48"><stop offset="0" stop-color="#e0102f" stop-opacity="0.9"/><stop offset="1" stop-color="#7a0c1c" stop-opacity="0.2"/></linearGradient></defs>
      </svg>
    </span>`;

  /* ---------- Mount chrome ---------- */
  function mount(opts = {}) {
    const { page = "" } = opts;
    injectBackground();
    injectHeader(page);
    injectToast();
    initTheme();
    initReveal();
    initMobileDrawer();
    setBodyClass();
    initAuthDropdown();
    initMobileAuth();
    return { NAV };
  }

  function initAuthDropdown() {
    AUTH.initDropdown();
  }

  function initMobileAuth() {
    const el = document.getElementById("mBtnLogout");
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        AUTH.logout();
        window.location.reload();
      });
    }
  }

  function setBodyClass() {
    if (!document.querySelector(".app")) {
      const wrap = document.createElement("div");
      wrap.className = "app";
      // wrap existing main/footer if any
    }
  }

  function injectBackground() {
    if (document.querySelector(".bg-grid")) return;
    ["bg-grid", "bg-glow", "bg-noise"].forEach((cls) => {
      const d = document.createElement("div");
      d.className = cls;
      d.setAttribute("aria-hidden", "true");
      document.body.prepend(d);
    });
  }

  function injectHeader(page) {
    const existing = document.querySelector(".site-header");
    if (existing) return; // page defines its own
    const header = document.createElement("header");
    header.className = "site-header";
    header.id = "siteHeader";
    header.innerHTML = `
      <div class="container header-inner">
        <a href="index.html" class="brand" aria-label="KNT หน้าแรก">
          ${BRAND_SVG}
          <span class="brand-text">
            <span class="brand-name">KNT</span>
            <span class="brand-sub">ครูนิวตรอน</span>
          </span>
        </a>
        <nav class="main-nav" aria-label="เมนูหลัก">
          ${NAV.map(n => `<a href="${n.href}" class="nav-link${n.id === page ? " active" : ""}">${n.label}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" id="themeToggle" aria-label="สลับธีม">
            <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </button>
          ${AUTH.renderAuthButton()}
          <button class="icon-btn menu-toggle" id="menuToggle" aria-label="เมนู" aria-expanded="false">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav" aria-hidden="true">
        ${NAV.map(n => `<a href="${n.href}" class="m-nav-link${n.id === page ? " active" : ""}">${n.label}</a>`).join("")}
        ${AUTH.isLoggedIn()
          ? `<a href="#" class="m-nav-link" id="mBtnLogout">ออกจากระบบ</a>`
          : `<a href="login.html" class="m-nav-link btn-signin-m">เข้าสู่ระบบ</a>`}
      </div>`;
    document.body.prepend(header);

    // header scroll
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function injectToast() {
    if (document.getElementById("appToast")) return;
    const t = document.createElement("div");
    t.id = "appToast";
    document.body.appendChild(t);
  }

  /* ---------- Theme ---------- */
  function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("knt-theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    document.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") || "dark");
    toggle?.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("knt-theme", next);
    });
  }

  /* ---------- Mobile drawer ---------- */
  function initMobileDrawer() {
    const btn = document.getElementById("menuToggle");
    const drawer = document.getElementById("mobileNav");
    if (!btn || !drawer) return;
    btn.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver;
  function initReveal() {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    observeReveal();
  }
  function observeReveal() {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => revealObserver?.observe(el));
  }

  /* ============================================================
     UI Helpers — used by interior pages
     ============================================================ */

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message, type = "") {
    const t = document.getElementById("appToast");
    if (!t) return;
    t.className = "";
    t.classList.add("show");
    if (type) t.classList.add(type);
    const icon = type === "ok"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ee07c" stroke-width="2.2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>`
      : type === "err"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`
      : "";
    t.innerHTML = `${icon}<span>${message}</span>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Modal ---------- */
  function modal({ title = "", body = "", actions = [], size = "" }) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const m = document.createElement("div");
    m.className = "modal" + (size ? " modal-" + size : "");
    m.innerHTML = `
      <div class="modal-head">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="ปิด">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${actions.length ? `<div class="modal-foot">${actions.map((a, i) => `<button class="btn ${a.cls || "btn-ghost"}" data-i="${i}">${a.label}</button>`).join("")}</div>` : ""}`;
    backdrop.appendChild(m);
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add("open"));

    const close = () => {
      backdrop.classList.remove("open");
      setTimeout(() => backdrop.remove(), 250);
    };
    m.querySelector(".modal-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    actions.forEach((a, i) => {
      m.querySelector(`[data-i="${i}"]`).addEventListener("click", () => {
        if (a.onClick) {
          const stay = a.onClick(m, close);
          if (!stay) close();
        } else close();
      });
    });
    return { el: m, close };
  }

  /* ---------- Confirm ---------- */
  function confirmBox(message, { title = "ยืนยันการกระทำ", confirmLabel = "ยืนยัน", danger = true } = {}) {
    return new Promise((resolve) => {
      modal({
        title,
        body: `<p style="color:var(--text-dim);font-size:.95rem;line-height:1.5">${message}</p>`,
        actions: [
          { label: "ยกเลิก", cls: "btn-ghost", onClick: (_, c) => { c(); resolve(false); } },
          { label: confirmLabel, cls: danger ? "btn-danger" : "btn-primary", onClick: (_, c) => { c(); resolve(true); } },
        ],
      });
    });
  }

  /* ---------- Loader helpers ---------- */
  function loaderHTML(label = "กำลังโหลดข้อมูล…") {
    return `<div class="loader-wrap"><div class="loader"></div><div class="loader-text">${label}</div></div>`;
  }
  function skeletonRows(n = 6) {
    return Array.from({ length: n }).map(() => `<div class="skeleton skeleton-row"></div>`).join("");
  }
  function emptyHTML(title = "ยังไม่มีข้อมูล", sub = "ข้อมูลจะแสดงที่นี่เมื่อมีการบันทึก") {
    return `<div class="empty-state">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 11h8M8 15h5"/></svg>
      <div class="et">${title}</div><div class="es">${sub}</div></div>`;
  }

  /* ---------- Format utils ---------- */
  const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  function todayISO() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function thaiDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y) return iso;
    return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
  }
  function formatMoney(n) {
    const num = Number(n || 0);
    return num.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function debounce(fn, ms = 250) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ---------- Safe async run with loading + error UI ---------- */
  // Replaces the content of a target element with loader, runs async fn,
  // restores result or shows an error block.
  async function withLoading(target, fn, label) {
    if (!target) return fn();
    const prev = target.innerHTML;
    target.innerHTML = loaderHTML(label);
    try { return await fn(); }
    catch (e) {
      target.innerHTML = `<div class="alert alert-error">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        <div><strong>โหลดข้อมูลไม่สำเร็จ</strong><div class="hint" style="margin-top:2px">${escapeHTML(e.message || "เกิดข้อผิดพลาด")}</div></div></div>`;
      throw e;
    }
  }

  /* ---------- Export ---------- */
  global.KNT_AUTH = AUTH;
  global.KNTShell = {
    mount, NAV, observeReveal,
    toast, modal, confirmBox,
    loaderHTML, skeletonRows, emptyHTML,
    todayISO, thaiDate, formatMoney, escapeHTML, debounce, withLoading,
    icons: {
      back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>`,
      save: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>`,
      refresh: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>`,
      plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
      download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
      search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
      check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    },
  };
})(window);
