# KNT – บันทึกสถานะโปรเจกต์

> อัปเดตล่าสุด: 10 กรกฎาคม 2026

---

## 🔗 ลิงก์

| รายการ | URL |
|--------|-----|
| **เว็บหลัก** | https://newtronnt2301.github.io/knt/ |
| **GitHub Repo (source)** | https://github.com/kunewnew/krunewtron |
| **GitHub Repo (deploy)** | https://github.com/newtronnt2301/knt |

---

## 📄 หน้าระบบ — สถานะ

| หน้า | ฟีเจอร์ | สถานะ |
|------|---------|--------|
| `index.html` | แดชบอร์ด + ค้นหา + 🔐 ล็อคอิน | ✅ |
| `login.html` | หน้าล็อคอิน (รหัส `newtron05`) | ✅ |
| `attendance.html` | เช็คชื่อ ม.6/1 + 📅 ประวัติ + 📊 สถิติ + 📤 ส่ง LINE | ✅ |
| `subject-checkin.html` | เช็คชื่อรายวิชา ม.1-6 + 📅 บันทึกล่าสุด + 📤 ส่ง LINE | ✅ ⚠️ |
| `quiz.html` | ควิซออนไลน์ Anti-cheat | ✅ |
| `exam.html` | ข้อสอบท้ายบท + แผงผู้สอน | ✅ |
| `grades.html` | เกรด & ผลการเรียน | ✅ |
| `submit-work.html` | ติดตามส่งงาน | ✅ |
| `class-fund.html` | เงินห้อง ม.6/1 | ✅ |

---

## 🔐 ระบบล็อคอิน

- หน้า `login.html` — รหัสผ่าน `newtron05` (SHA-256)
- ใช้ `sessionStorage` — ปิดแท็บ = ออกจากระบบ
- `KNT_AUTH` module ใน `js/app-shell.js`
- `KNT_AUTH.guard()` ใช้ป้องกันหน้าที่ต้องการล็อคอิน

---

## 📊 ระบบประวัติ & สถิติ (attendance.html)

- **📅 ประวัติรายวัน** — ตารางทั้งเดือน → คลิกวันที่ดูรายชื่อทั้งหมด
- แยกกลุ่ม: ขาด / สาย / ลา / มา
- แต่ละคนแสดง **📊 สะสม** จากทุกวันที่เคยเช็คชื่อ
- **📤 ส่ง LINE** — สร้างรูป PNG รายชื่อ+สถิติสะสม ส่งผู้ปกครองได้

---

## ⚠️ ข้อจำกัด

### subject-checkin.html — API อ่านย้อนหลังไม่ได้
- GAS รองรับเฉพาะ `action=save` — ยังไม่มี `get_data`
- ต้องเพิ่ม read endpoint ใน Google Apps Script ถึงจะดึงประวัติได้
- ตอนนี้แสดงเฉพาะบันทึกใน session ปัจจุบัน (หายเมื่อปิดแท็บ)

---

## 🔧 วิธี Deploy

```bash
cd "เว็บ knt"
git add -A
git commit -m "อัปเดต: ..."
git push origin main
```

รอ ~1-2 นาที GitHub Pages อัปเดตอัตโนมัติ

---

## 📋 งานที่ยังค้าง

| งาน | ความสำคัญ |
|-----|-----------|
| สร้าง `random.html` (สุ่มเลขที่) | 🟡 |
| สร้าง `docs.html` (คลังเอกสาร) | 🟡 |
| เพิ่ม read endpoint ใน GAS ของ subject-checkin | 🔴 |
| เชื่อม `เครื่องมือ AI` | 🟢 |
| เชื่อม `ติดตามแก้ 0/ร/มส.` | 🟢 |
| แก้ dead links (footer, ดูทั้งหมด, ฯลฯ) | 🟢 |
| เปลี่ยนข้อมูล hardcoded → ดึงจาก API | 🟢 |

---

## 📝 บันทึกการแก้ไข

### 2026-07-10 — Fix ค้นหานักเรียน + เพิ่มความเร็ว
- **ค้นหานักเรียนหน้าเกรด**: เปลี่ยนจากค้นผ่าน API `loadAll()` → ใช้ `KNTStudents.search()` local registry (167KB) แสดงผลทันที แล้วค่อยโหลดเกรดพื้นหลัง
- **เพิ่ม defer บน students.js**: 4 หน้า (grades, exam, quiz, submit-work) ไม่งานบล็อก rendering — เร็วขึ้น
- **แก้ bug submit-work.html**: `els` เคยถูกใช้ก่อนประกาศ → dropdown ห้องไม่เคยโหลด (มีมานานแต่ไม่มีใครเจอ)
- Push 2 repos: `kunewnew/krunewtron` + `newtronnt2301/knt` (force push ครั้งแรกเพื่อ align history)

### 2026-07-10 — รีธีมเช็คชื่อรายวิชาเป็น JARVIS v2.0
- **เช็คชื่อรายวิชา/index.html**: รีธีมจาก Earth Tone (น้ำตาล/ครีม/เขียวเซจ) → JARVIS Dark Carbon + Crimson
- เชื่อม `../styles.css` + `../css/app.css` ใช้ design tokens ร่วมกับทั้งเว็บ
- ฟอนต์: Mali → Kanit (ไทย) + Orbitron (HUD) + JetBrains Mono (code)
- ปรับทุก component: header (glass), cards, buttons (แดง gradient), tabs, chips, inputs, modals, drawer, toast
- สีสถานะ: Present #2ee07c, Late #ffc84d, Leave #6bb6ff, Absent #ff3d5a
- Export รูป PNG — เปลี่ยนเป็น dark theme
- Scanner QR — ปรับสี log/alert ให้เข้า JARVIS
- **Fix**: ROOMS_DATA หายระหว่าง rewrite → ดึงกลับจาก git (29 ห้อง, 1,173 คน)
