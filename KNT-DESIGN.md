# KNT OS · JARVIS Neural Interface — Design System

> **Version:** 2.0  
> **Theme:** Luxury Red Tech / JARVIS HUD  
> **Updated:** 8 กรกฎาคม 2569  
> **Files:** `index.html`, `login.html`, `styles.css`, `css/app.css`

---

## 🎨 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-0` | `#06060a` | พื้นหลังหลัก (deep near-black) |
| `--bg-1` | `#0c0c12` | Surface 1 |
| `--bg-2` | `#12121c` | Surface 2 / cards |
| `--bg-3` | `#1a1a28` | Surface 3 |
| `--red` | `#ff2040` | Primary accent (crimson) |
| `--red-bright` | `#ff3d5a` | Hover / active states |
| `--red-deep` | `#c80820` | Dark red / gradients |
| `--red-glow` | `rgba(255,32,64,0.5)` | Glow effects |
| `--red-soft` | `rgba(255,32,64,0.08)` | Subtle backgrounds |
| `--gold` | `#ffb800` | Secondary accent |
| `--text` | `#e8e8f0` | Primary text |
| `--text-dim` | `#8888a0` | Secondary text |
| `--text-mute` | `#555568` | Muted text |
| `--line` | `rgba(255,60,80,0.12)` | Border lines |
| `--line-bright` | `rgba(255,60,80,0.35)` | Active borders |

---

## 🔤 Typography

| Font | Role | Weight |
|---|---|---|
| **Orbitron** | HUD labels, numbers, brand, headings | 400–900 |
| **Kanit** | Thai body text, card content | 300–800 |
| **JetBrains Mono** | Technical labels, code, counters | 400, 600 |

```css
--font-thai: 'Kanit', sans-serif;
--font-hud: 'Orbitron', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## 🧩 Component Inventory

### Boot Sequence
- KNT mark rotating inside circle
- Text: "KNT CORE // BOOT SEQUENCE"
- Animated loading bar
- Auto-dismiss after 1.8s → fades to portal

### HUD Top Bar
- Sticky `56px` bar with glass backdrop
- **Left:** Menu button + KNT OS branding
- **Right:** System status dots + digital clock (red Orbitron)
- Bottom accent line: gradient red

### Hero Section
- **KNT Geometric Monogram:** Hex frame + concentric rings + "KNT" Orbitron text + corner dots
- Rotating dashed rings around logo (`8s` / `6s` animations)
- Floating animation (`logo-float 5s`)
- Title: gradient white→red
- Badges: NEURAL INTERFACE v2.0 (red), 13 MODULES ACTIVE (gold)

### Stats Bar
- 5-column horizontal bar
- MODULES / STATUS / UPTIME / SESSION / CORE TEMP
- Uptime counts from page load, Core Temp fluctuates randomly

### JARVIS Cards (12 modules)
- Dark gradient background + thin red border
- **Corner brackets** appear on hover (L-shape, top-left + bottom-right)
- **Scan line** sweeps down on hover
- Module number `001`–`012` top-right
- Icon box with hover glow
- Action: `INITIATE →` / `ENTER EXAM →`
- Status: `●ACTIVE` (green dot)
- Card 012 has dual buttons: พิมพ์การ์ด / สร้าง QR

### Sidebar Drawer
- KNT NEURAL header with logo
- Numbered module links (`01`–`13`)
- Left accent bar on hover
- Section labels: CORE SYSTEMS / QR UTILITIES
- Backdrop blur overlay

### Neural Notepad
- Auto-save to `localStorage` (key: `knt_neural_notepad`)
- Character counter
- Status: SAVING... → AUTO-SAVED

---

## 🌌 Background Layers

| Layer | Description |
|---|---|
| `bg-glow` | Radial red gradients (3 overlapping) |
| `bg-grid` | 48px grid with red tint |
| `bg-scan` | Repeating horizontal scanlines |
| `#particles` | Interactive particle network (repels mouse) |

---

## 📐 Design Rules

1. **No space/starfield/cosmic theme** — replaced with tech grid + particles
2. **No cat mascot** — replaced with KNT geometric monogram
3. **All logos use SVG** — no `logo.png` dependency
4. **Boot screen must say "KNT"** — branded loading
5. **Red primary only** — no blue/cyan/other accent colors
6. **Corner brackets + scan line** — on every card hover
7. **Orbitron for all HUD/tech text** — clock, labels, module numbers

---

## 📂 File Map

```
knt/
├── index.html          ← Portal utama (JARVIS)
├── login.html          ← Login page (JARVIS)
├── styles.css          ← Design tokens + components
├── css/app.css         ← Interior page components
├── images/             ← Icons (grad-cap, gear, beaker, dice, atom)
├── เช็คชื่อรายวิชา/    ← Sub-page (inherits theme)
├── ส่งงาน/             ← Sub-page (inherits theme)
├── สุ่มเลขที่/          ← Sub-page (inherits theme)
├── boardgame/          ← Sub-page (inherits theme)
├── learning/           ← Sub-page (inherits theme)
├── exam/               ← Sub-page (inherits theme)
├── plickers/           ← Sub-page (inherits theme)
├── คะแนนเกรด/          ← Sub-page (inherits theme)
├── ประกาศผลสอบ/        ← Sub-page (inherits theme)
├── เก็บเงินเพื่อน/      ← Sub-page (inherits theme)
```

---

## 🔧 CSS Cascade

```
index.html (inline <style>)
    └── overrides portal-specific elements only

styles.css
    └── Design tokens + shared components
    └── Loaded by: login.html, all sub-pages

css/app.css
    └── Extends styles.css with forms, tables, modals
    └── Loaded by: all interior sub-pages
```

**Rule:** Update tokens in `styles.css` → cascades to all pages automatically.

---

## 🚀 Quick Theme Switch

To change the primary accent color, update these in `:root`:

```css
--red: #ff2040;         /* Main */
--red-bright: #ff3d5a;  /* Hover */
--red-deep: #c80820;    /* Dark */
--red-glow: rgba(255,32,64,0.5);
--red-soft: rgba(255,32,64,0.08);
```

All component borders, glows, text, and icons will follow.
