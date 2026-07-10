/* ============================================================
   KNT – ครูนิวตรอน · Dashboard Interactions
   ============================================================ */

"use strict";

/* ---------- Data: Service cards (13 ระบบจากเว็บนิวตรอน.com) ---------- */
const IMG = (file) => `<img src="images/${file}" alt="" class="sc-img" />`;
const ICON_EMBED = (svg) => svg;

const SERVICES = [
  {
    id: "subject-checkin",
    title: "เช็คชื่อเข้าเรียนรายวิชา",
    desc: "บันทึกเวลาเรียน ขาด ลา มาสาย รายคาบและรายห้องเรียน เช็คผ่านกล้องได้",
    cat: "การเข้าเรียน",
    badge: "📷 Live",
    badgeCool: false,
    href: "subject-checkin.html",
    icon: IMG("grad-cap.png"),
  },
  {
    id: "attendance",
    title: "เช็คชื่อ ม.6/1 เตรียมวิศวะ",
    desc: "บันทึกการมาเรียนรายวัน ดูประวัติย้อนหลัง สถิติรายบุคคล ส่ง LINE ได้",
    cat: "การเข้าเรียน",
    badge: "ม.6/1",
    badgeCool: true,
    href: "attendance.html",
    icon: IMG("gear.png"),
  },
  {
    id: "submit-work",
    title: "ระบบติดตามส่งงาน & ข้อสอบ",
    desc: "ติดตามสถานะการบ้าน คะแนนเก็บ สแกนเช็คชื่อส่งงานผ่าน QR",
    cat: "ติดตามผล",
    badge: "Track",
    badgeCool: false,
    href: "submit-work.html",
    icon: IMG("beaker.png"),
  },
  {
    id: "random",
    title: "สุ่มเลขที่นักเรียน",
    desc: "สุ่มเลขที่เรียกตอบคำถามหรือกิจกรรม สนุกด้วยแอนิเมชันแข่งวิ่ง 3D",
    cat: "เครื่องมือ",
    badge: "🎲 Random",
    badgeCool: true,
    href: "random.html",
    icon: IMG("dice.png"),
  },
  {
    id: "boardgame",
    title: "บอร์ดเกมคลับพัฒนาทักษะ",
    desc: "คลังบอร์ดเกมเล่นง่าย ฝึกตรรกะ: Werewolf, Connect4, Memory, Othello",
    cat: "กิจกรรม",
    badge: "🎮 Game",
    badgeCool: true,
    href: "boardgame.html",
    icon: IMG("dice.png"),
  },
  {
    id: "learning",
    title: "คลังคณิตศาสตร์เพิ่มเติม ม.4",
    desc: "ศูนย์รวมบทเรียนและทำโจทย์ออนไลน์ ครบตามหลักสูตร",
    cat: "การเรียนรู้",
    badge: "📐 Math",
    badgeCool: false,
    href: "learning.html",
    icon: IMG("atom.png"),
  },
  {
    id: "exam",
    title: "ระบบสอบเก็บคะแนนท้ายบท",
    desc: "สุ่มสลับข้อสอบ ตรวจประเมินอัตโนมัติ สร้างข้อสอบปรนัยหลายรูปแบบ",
    cat: "การสอบ",
    badge: "📝 Exam",
    badgeCool: false,
    href: "exam.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "plickers",
    title: "ระบบสแกนการ์ด Plickers",
    desc: "กิจกรรมสแกนตอบคำถามด้วยการ์ด ArUco ไม่ต้องใช้แอพ ผ่านกล้องเว็บ",
    cat: "กิจกรรม",
    badge: "📸 Scan",
    badgeCool: true,
    href: "plickers.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  },
  {
    id: "grades",
    title: "ระบบจัดการคะแนน & ตัดเกรด",
    desc: "กรอกคะแนน คำนวณตัดเกรด 8 ระดับ ค้นหาผลสอบสำหรับนักเรียน",
    cat: "การสอบ",
    badge: "📊 Grades",
    badgeCool: false,
    href: "grades.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  {
    id: "results",
    title: "ประกาศผลสอบ & ติดตามงานค้าง",
    desc: "ประกาศคะแนนสอบรายคน ตามเกรด 0 ร มส. และติดตามนักเรียนที่ต้องแก้",
    cat: "ติดตามผล",
    badge: "📢 Publish",
    badgeCool: false,
    href: "grades.html#results",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
  },
  {
    id: "class-fund",
    title: "บัญชีเงินห้องเรียน ม.6/1",
    desc: "รายงานยอดสะสมและประวัติรายรับ-รายจ่าย บันทึกสลิปโอนเงิน",
    cat: "การเงิน",
    badge: "💰 Finance",
    badgeCool: true,
    href: "class-fund.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    id: "qr-card",
    title: "พิมพ์การ์ดสแกนเช็คชื่อ",
    desc: "จัดพิมพ์การ์ด QR Code เช็คชื่อนักเรียนรายบุคคล ปรับแต่งได้",
    cat: "เครื่องมือ",
    badge: "🖨️ Print",
    badgeCool: false,
    href: "qr-card.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v3M14 21h7"/></svg>`,
  },
  {
    id: "qr-generator",
    title: "สร้าง QR Code อิสระ",
    desc: "เจนคิวอาร์โค้ดปรับแต่งได้อเนกประสงค์ ใช้กับงานเอกสารหรือกิจกรรม",
    cat: "เครื่องมือ",
    badge: "✨ QR",
    badgeCool: true,
    href: "qr-generator.html",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v3M14 21h7"/></svg>`,
  },
];

/* ---------- Data: Quick tools ---------- */
const TOOLS = [
  { name: "Google Classroom", desc: "จัดการชั้นเรียน & มอบหมายงาน", bg: "linear-gradient(135deg,#1a73e8,#0d47a1)", short: "GC", href: "https://classroom.google.com" },
  { name: "Google Drive", desc: "จัดเก็บไฟล์ & แชร์เอกสาร", bg: "linear-gradient(135deg,#1a73e8,#34a853)", short: "GD", href: "https://drive.google.com" },
  { name: "Canva", desc: "ออกแบบสื่อการสอน", bg: "linear-gradient(135deg,#7d2ae8,#00c4cc)", short: "Cv", href: "https://www.canva.com" },
  { name: "ChatGPT", desc: "ผู้ช่วยอัจฉริยะ", bg: "linear-gradient(135deg,#10a37f,#0e8c6d)", short: "AI", href: "https://chat.openai.com" },
  { name: "YouTube", desc: "วิดีโอประกอบการสอน", bg: "linear-gradient(135deg,#ff0000,#8b0000)", short: "YT", href: "https://www.youtube.com" },
];

/* ---------- Data: News ---------- */
const NEWS = [
  { tag: "สำคัญ", tone: "", title: "เปิดใช้งานระบบเช็คชื่อเรียลไทม์", excerpt: "ครูสามารถบันทึกการมาเรียนและดูสถิติได้ทันทีในหน้าแดชบอร์ด", date: "07 ก.ค. 68" },
  { tag: "AI", tone: "", title: "เครื่องมือ AI สร้างแบบฝึกหัดอัตโนมัติ", excerpt: "เพิ่มฟีเจอร์สร้างโจทย์จากหัวข้อบทเรียน พร้อมเฉลยในไม่กี่วินาที", date: "05 ก.ค. 68" },
  { tag: "ประกาศ", tone: "info", title: "กำหนดการส่งผลการเรียนเทอม 1", excerpt: "นักเรียนที่ได้ 0 ร มส. ต้องแก้ให้ครบก่อนวันที่ 25 กันยายน", date: "03 ก.ค. 68" },
  { tag: "อัปเดต", tone: "warn", title: "ปิดปรับปรุงระบบช่วงเที่ยงคืน", excerpt: "อาจมีการหยุดให้บริการบางช่วงเวลา 00:00–01:00 น. เพื่ออัปเดตระบบ", date: "01 ก.ค. 68" },
];

/* ---------- Render: Service cards ---------- */
function renderCards(list) {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  list.forEach((s, i) => {
    const card = document.createElement("article");
    card.className = "service-card reveal";
    card.style.animationDelay = `${i * 60}ms`;
    card.dataset.id = s.id;
    card.innerHTML = `
      <div class="sc-icon">${s.icon}</div>
      <h3 class="sc-title">${s.title}</h3>
      <p class="sc-desc">${s.desc}</p>
      <div class="sc-meta">
        <span class="sc-badge ${s.badgeCool ? "cool" : ""}">${s.badge}</span>
        <span class="sc-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>`;
    card.addEventListener("click", () => openService(s));
    grid.appendChild(card);
  });
  // reveal observer picks them up
  observeReveal();
}

/* ---------- Render: Quick tools ---------- */
function renderTools() {
  const row = document.getElementById("toolsRow");
  if (!row) return;
  row.innerHTML = "";
  TOOLS.forEach((t) => {
    const a = document.createElement("a");
    a.className = "tool-card reveal";
    a.href = t.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = `
      <div class="tool-logo" style="background:${t.bg}">${t.short}</div>
      <div class="tool-info">
        <span class="tool-name">${t.name}</span>
        <span class="tool-desc">${t.desc}</span>
      </div>`;
    row.appendChild(a);
  });
  observeReveal();
}

/* ---------- Render: News ---------- */
function renderNews() {
  const list = document.getElementById("newsList");
  if (!list) return;
  list.innerHTML = "";
  NEWS.forEach((n) => {
    const card = document.createElement("article");
    card.className = "news-card reveal";
    card.innerHTML = `
      <span class="news-tag ${n.tone}">${n.tag}</span>
      <div class="news-body">
        <h3 class="news-title">${n.title}</h3>
        <p class="news-excerpt">${n.excerpt}</p>
      </div>
      <span class="news-date">${n.date}</span>`;
    list.appendChild(card);
  });
  observeReveal();
}

/* ---------- Open service (route to real page) ---------- */
// Map service id → page. Each service object may also carry its own href.
const PAGE_MAP = {
  "subject-checkin":  "subject-checkin.html",
  "attendance":       "attendance.html",
  "submit-work":      "submit-work.html",
  "random":           "random.html",
  "boardgame":        "boardgame.html",
  "learning":         "learning.html",
  "exam":             "exam.html",
  "plickers":         "plickers.html",
  "grades":           "grades.html",
  "results":          "grades.html",
  "class-fund":       "class-fund.html",
  "qr-card":          "qr-card.html",
  "qr-generator":     "qr-generator.html",
};
function openService(s) {
  const href = s.href || PAGE_MAP[s.id];
  if (href && href !== "#") {
    window.location.href = href;
  } else {
    showToast(`กำลังเปิด: ${s.title}`);
  }
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  let t = document.getElementById("kntToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "kntToast";
    t.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(20px);
      background:var(--carbon-3); color:var(--text); padding:13px 22px;
      border:1px solid var(--red); border-radius:12px; font-size:0.9rem; font-weight:500;
      box-shadow:0 10px 40px rgba(0,0,0,0.5), 0 0 20px var(--red-glow);
      backdrop-filter:blur(12px); z-index:9999; opacity:0;
      transition:opacity .3s, transform .3s var(--ease); pointer-events:none;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(20px)";
  }, 2200);
}

/* ---------- Search ---------- */
const searchInput = document.getElementById("systemSearch");
const searchClear = document.getElementById("searchClear");
const searchResults = document.getElementById("searchResults");
const noResult = document.getElementById("noResult");
let activeIdx = -1;
let currentMatches = [];

function scoreMatch(service, q) {
  const text = `${service.title} ${service.desc} ${service.cat}`.toLowerCase();
  const qLow = q.toLowerCase();
  if (service.title.toLowerCase().includes(qLow)) return 3;
  if (service.cat.toLowerCase().includes(qLow)) return 2;
  if (text.includes(qLow)) return 1;
  return 0;
}

function doFilter(q) {
  q = q.trim();
  const query = q.toLowerCase();

  // clear button visibility
  if (searchClear) searchClear.hidden = !q;

  // filter cards
  let filtered = SERVICES;
  if (query) {
    filtered = SERVICES.map((s) => ({ s, score: scoreMatch(s, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
  }
  renderCards(filtered);
  if (noResult) noResult.hidden = filtered.length !== 0;

  // dropdown results
  if (!query || !searchResults) {
    if (searchResults) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
    }
    activeIdx = -1;
    return;
  }
  currentMatches = filtered.slice(0, 6);
  searchResults.innerHTML = "";
  currentMatches.forEach((s, i) => {
    const item = document.createElement("button");
    item.className = "sr-item";
    item.dataset.idx = i;
    item.innerHTML = `
      <span class="sc-icon" style="width:38px;height:38px">${s.icon}</span>
      <span class="sr-text">
        <span class="sr-title">${s.title}</span>
        <span class="sr-cat">${s.cat}</span>
      </span>`;
    item.addEventListener("click", () => {
      openService(s);
      closeResults();
      if (searchInput) { searchInput.value = ""; doFilter(""); }
    });
    item.addEventListener("mouseenter", () => setActive(i));
    searchResults.appendChild(item);
  });
  activeIdx = -1;
  searchResults.hidden = currentMatches.length === 0;
}

function setActive(i) {
  const items = searchResults.querySelectorAll(".sr-item");
  items.forEach((el, idx) => el.classList.toggle("active", idx === i));
  activeIdx = i;
}

function closeResults() {
  if (searchResults) { searchResults.hidden = true; searchResults.innerHTML = ""; }
  activeIdx = -1;
}

function initSearch() {
  if (!searchInput) return;
  searchInput.addEventListener("input", (e) => doFilter(e.target.value));

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      doFilter("");
      searchInput.focus();
    });
  }

  // suggestion chips
  document.querySelectorAll(".chip[data-suggest]").forEach((chip) => {
    chip.addEventListener("click", () => {
      searchInput.value = chip.dataset.suggest;
      doFilter(chip.dataset.suggest);
      searchInput.focus();
    });
  });

  // keyboard nav
  searchInput.addEventListener("keydown", (e) => {
    if (!searchResults || searchResults.hidden) return;
    const items = searchResults.querySelectorAll(".sr-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(activeIdx + 1, items.length - 1));
      items[activeIdx]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(activeIdx - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && currentMatches[activeIdx]) {
        openService(currentMatches[activeIdx]);
        closeResults();
        searchInput.value = "";
        doFilter("");
      }
    } else if (e.key === "Escape") {
      closeResults();
      searchInput.blur();
    }
  });

  // global ⌘K / Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // click outside closes
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) closeResults();
  });
}

/* ---------- Theme toggle ---------- */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("knt-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  toggle?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("knt-theme", next);
  });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btn = document.getElementById("menuToggle");
  const drawer = document.getElementById("mobileNav");
  if (!btn || !drawer) return;
  btn.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
  });
  drawer.querySelectorAll(".m-nav-link").forEach((a) => {
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Header scroll state + progress bar ---------- */
function initScroll() {
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 10);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Live clock ---------- */
function initClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Active nav on scroll ---------- */
function initNavSpy() {
  const links = document.querySelectorAll(".nav-link");
  const sections = ["dashboard", "services", "tools", "news", "ai"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) => {
            const href = l.getAttribute("href");
            l.classList.toggle("active", href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- Reveal on scroll ---------- */
let revealObserver;
function observeReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => revealObserver.observe(el));
}

/* ---------- Search toggle (mobile header) ---------- */
function initSearchToggle() {
  const btn = document.getElementById("searchToggle");
  const input = document.getElementById("systemSearch");
  btn?.addEventListener("click", () => {
    input?.focus();
    input?.select();
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCards(SERVICES);
  renderTools();
  renderNews();
  initSearch();
  initTheme();
  initMobileMenu();
  initScroll();
  initClock();
  initNavSpy();
  initSearchToggle();
  observeReveal();
});
