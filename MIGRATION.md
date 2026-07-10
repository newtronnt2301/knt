# เว็บ KNT — Premium Red Theme Migration

**วันที่:** 8 กรกฎาคม 2569  
**จาก:** `Drive NewTron/เว็บ นิวตรอน.com/สำหรับอัพโหลด_เว็บรวมหลัก/` (Space Theme)  
**ไปยัง:** `เว็บ knt/` (Premium Red Theme)

---

## สิ่งที่ทำ

ย้ายเว็บครูนิวตรอน.com ทั้งหมดมาไว้ใน `เว็บ knt/` โดยเปลี่ยนเฉพาะสี/ธีมจาก Space (น้ำเงิน-เขียวนีออน) → Premium Red (ดำ-แดง) เก็บฟังก์ชันและโครงสร้างทุกอย่างไว้เหมือนเดิม

### Theme Color Mapping

| Element | Space (เดิม) | Premium Red (ใหม่) |
|---------|-------------|-------------------|
| พื้นหลังหลัก | `#01061E` | `#0a0a0b` |
| ตัวหนังสือหลัก | `#EFF4FF` | `#f4f4f6` |
| สี accent หลัก | `#6FFF00` (neon green) | `#e0102f` (red) |
| สี accent สว่าง | `#00E5FF` (cyan) | `#ff2d4a` (bright red) |
| เงาเรืองแสง | cyan/blue/emerald | red ทั้งหมด |
| สีปุ่ม/ขอบ | blue-500, emerald-500, purple-500 | red-500 |
| ดาว starfield | `rgb(239, 244, 255)` | `rgb(255, 245, 245)` |
| หน้าสุ่มเลขที่ | ครีม/น้ำตาล/เขียว sage | ดำ/แดง |

---

## โครงสร้างไฟล์ (23 หน้า HTML)

```
เว็บ knt/
├── index.html                    ← Portal หลัก (13 ระบบ)
├── attendance.html               ← เช็คชื่อ ม.6/1 (Premium)
├── grades.html                   ← เกรด & ผลการเรียน (Premium)
├── exam.html                     ← ระบบสอบ (Premium)
├── class-fund.html               ← เงินห้อง (Premium)
├── submit-work.html              ← ติดตามส่งงาน (Premium)
├── subject-checkin.html          ← เช็คชื่อรายวิชา (Premium)
├── quiz.html                     ← ควิซ (Premium)
├── login.html                    ← เข้าสู่ระบบ (Premium)
├── เช็คชื่อ-เตรียมวิศวะ.html        ← เช็คชื่อ ม.4-6
├── boardgame/
│   ├── index.html                ← บอร์ดเกมคลับ (7 เกม)
│   ├── style.css
│   └── games/                    ← Werewolf, Connect4, Memory, Othello, Spy, TicTacToe, ForbiddenWord
├── learning/
│   └── index.html                ← คลังคณิตศาสตร์ ม.4
├── exam/
│   └── index.html                ← ระบบสอบเก็บคะแนนท้ายบท
├── plickers/
│   ├── index.html                ← สแกนการ์ด Plickers
│   └── print-cards.html
├── สุ่มเลขที่/
│   └── index.html                ← สุ่มเลขที่เป็ดแข่งวิ่ง 3D
├── คะแนนเกรด/
│   └── index-เกรด.html            ← จัดการคะแนน/ตัดเกรด
├── ประกาศผลสอบ/
│   └── index.html                ← ประกาศผลสอบ/ตามงานค้าง
├── ส่งงาน/
│   ├── index-ส่งงาน.html          ← ติดตามส่งงาน
│   ├── qr-card.html              ← พิมพ์การ์ด QR
│   ├── qr-generator.html         ← สร้าง QR Code
│   └── roster.json
├── เก็บเงินเพื่อน/
│   ├── index.html                ← บัญชีเงินห้อง ม.6/1
│   ├── app.js
│   ├── style.css
│   └── google-apps-script-เงินห้อง.gs
├── เช็คชื่อรายวิชา/
│   └── index.html                ← เช็คชื่อรายวิชา
├── images/                       ← รูปจากเว็บเดิม (logo, mascot, icons...)
├── js/
│   ├── api.js                    ← API connectors (GAS)
│   ├── app-shell.js              ← Shared UI shell
│   └── students.js               ← ข้อมูลนักเรียน
├── css/
│   └── app.css                   ← Shared app styles
├── styles.css                    ← Premium theme CSS
└── script.js                     ← Dashboard interactions
```

---

## ระบบทั้งหมด 13 ระบบ

1. เช็คชื่อเข้าเรียนรายวิชา
2. เช็คชื่อ ม.4-6 เตรียมวิศวะ
3. ระบบติดตามส่งงาน/ข้อสอบ
4. สุ่มเลขที่เป็ดแข่งวิ่ง 3D
5. บอร์ดเกมคลับพัฒนาทักษะ
6. คลังคณิตศาสตร์เพิ่มเติม ม.4
7. ระบบสอบเก็บคะแนนท้ายบท
8. ระบบสแกนการ์ด Plickers
9. ระบบจัดการคะแนน/ตัดเกรด
10. ประกาศผลสอบ/ตามงานค้าง
11. บัญชีเงินห้องเรียน ม.6/1
12. พิมพ์การ์ดสแกนเช็คชื่อ
13. สร้าง QR Code อิสระ

---

## หมายเหตุ

- ไฟล์ Premium pages (attendance.html, grades.html, exam.html, class-fund.html, submit-work.html, subject-checkin.html, quiz.html, login.html) — ถูกเก็บไว้ตามเดิม ไม่ได้ถูก overwrite
- Portal หลัก (index.html) — ใช้ของเดิมจากเว็บนิวตรอน.com เปลี่ยนแค่สี
- Sub-systems (boardgame, learning, exam, plickers, สุ่มเลขที่, etc.) — copy มาทั้งหมด + bulk color replace
- API endpoints ใน `js/api.js` — ยังคงเป็น Google Apps Script ตามเดิม
- Google Sheets ID — ไม่ได้เปลี่ยนแปลง
