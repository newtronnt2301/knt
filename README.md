# KNT – ครูนิวตรอน

> ศูนย์กลางการเรียนรู้และระบบจัดการห้องเรียนแบบ Premium Dashboard
> Dark Carbon + Deep Red · Minimal Luxury · Mobile First

เว็บไซต์สไตล์ศูนย์ควบคุม AI ระดับสูง สำหรับครูและนักเรียน เชื่อมต่อกับฐานข้อมูลผ่าน
**Google Apps Script Web App** ทั้งระบบทำงานผ่าน Frontend (HTML/CSS/JS) ล้วน — ไม่ต้องเซิร์ฟเวอร์

---

## 📑 สารบัญ

- [ภาพรวมโปรเจกต์](#-ภาพรวมโปรเจกต์)
- [โครงสร้างไฟล์](#-โครงสร้างไฟล์)
- [ระบบย่อยทั้งหมด](#-ระบบย่อยทั้งหมด)
- [API Endpoints](#-api-endpoints)
- [วิธีการเชื่อมต่อ API](#-วิธีการเชื่อมต่อ-api)
- [วิธีใช้งาน](#-วิธีใช้งาน)
- [การปรับแต่ง](#-การปรับแต่ง)
- [คำถามที่พบบ่อย](#-คำถามที่พบบ่อย)

---

## 🎯 ภาพรวมโปรเจกต์

KNT (ครูนิวตรอน) คือแพลตฟอร์มเว็บแอปสำหรับการจัดการห้องเรียนครบวงจร ประกอบด้วย:

- **พอร์ทัลหลัก** — แดชบอร์ดรวมทุกระบบ พร้อมระบบค้นหา
- **7 ระบบย่อย** — เช็คชื่อ ควิซ ข้อสอบ เกรด การส่งงาน เงินห้อง
- **ดีไซน์ Premium** — Dark Carbon โทนแดงเข้ม Glassmorphism รองรับ Mobile First
- **Dark / Light Mode** — สลับธีมได้ บันทึกค่าใน localStorage

### เทคโนโลยี

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES6+) |
| ฟอนต์ | IBM Plex Sans Thai, JetBrains Mono (Google Fonts) |
| ฐานข้อมูล | Google Sheets (ผ่าน Google Apps Script Web App) |
| ไอคอน | SVG inline (Outline style) |
| Dependency | **ไม่มี** — ทำงานได้ทันทีไม่ต้อง build |

---

## 📁 โครงสร้างไฟล์

```
เว็บ knt/
├── index.html              ← พอร์ทัลหลัก (แดชบอร์ด)
├── attendance.html         ← ระบบเช็คชื่อ ม.6/1
├── subject-checkin.html    ← ระบบเช็คชื่อรายวิชา ม.1-6
├── quiz.html               ← ระบบควิซออนไลน์ ม.4
├── exam.html               ← ระบบข้อสอบท้ายบท + แผงผู้สอน
├── grades.html             ← ระบบเกรด & ผลการเรียน
├── submit-work.html        ← ระบบติดตามการส่งงาน
├── class-fund.html         ← ระบบเงินห้อง ม.6/1
│
├── styles.css              ← ธีมหลักของพอร์ทัล (Dark Carbon)
├── css/
│   └── app.css             ← ดีไซน์ระบบหน้าใน (tables, forms, modals)
│
├── script.js               ← สคริปต์พอร์ทัลหลัก
└── js/
    ├── api.js              ← ชั้นเชื่อม API + fetch helpers
    └── app-shell.js        ← เชลล์กลาง (header/toast/modal/utils)
```

---

## 🧩 ระบบย่อยทั้งหมด

### 1. พอร์ทัลหลัก (`index.html`)
- โลโก้ KNT Monogram + แถบนำทาง
- ช่องค้นหาระบบขนาดใหญ่ (รองรับ `⌘ K`)
- การ์ดบริการ 10 รายการแบบ Glassmorphism
- เครื่องมือด่วน (Google Classroom, Drive, Canva, ChatGPT, YouTube)
- ส่วนข่าวสาร + ส่วน AI

### 2. เช็คชื่อ ม.6/1 (`attendance.html`)
- สถานะ 4 แบบ: มา / สาย / ลา / ขาด
- อัปโหลดรูปนักเรียน (มีการย่อขนาดด้วย canvas ก่อนส่ง)
- ตั้งสถานะทั้งหมดในคลิกเดียว
- สถิติเรียลไทม์

### 3. เช็คชื่อรายวิชา ม.1-6 (`subject-checkin.html`)
- เลือกระดับชั้น (ม.1 ถึง ม.6) + วิชา
- ใช้งานเหมือนเช็คชื่อ ม.6/1 แต่รองรับทุกห้อง

### 4. ควิซออนไลน์ ม.4 (`quiz.html`)
- ทำแบบทดสอบท้ายบท สุ่มข้อ + สับตัวเลือก
- จับเวลา + ตรวจคำตอบอัตโนมัติ
- รีวิวคำตอบหลังส่ง
- **Anti-cheat** — ตรวจจับการแท็บหลุด

### 5. ข้อสอบท้ายบท + แผงผู้สอน (`exam.html`)
- **โหมดนักเรียน**: ทำข้อสอบ + ส่งคะแนน (`exam_save`)
- **โหมดครู**: ดูคะแนนทั้งหมดแบบเรียลไทม์ (`exam_get`) + ส่งออก CSV
- ตรวจจับ "ตรวจพบทุจริต" เมื่อแท็บหลุดเกิน 3 ครั้ง

### 6. เกรด & ผลการเรียน (`grades.html`)
- **โหมดครู**: บันทึก/แก้ไขเกรด, คำนวณเกรด 4.0 อัตโนมัติ
- **โหมดนักเรียน**: ค้นหาผลการเรียนตามห้อง/ชื่อ/เลขที่

### 7. ติดตามการส่งงาน (`submit-work.html`)
- สร้างงานใหม่ + ติดตามสถานะรายคน
- สถานะ: ส่งแล้ว / ส่งช้า / ยังไม่ส่ง / ต้องแก้ไข
- กรองตามห้อง/สถานะ + ค้นหา

### 8. เงินห้อง ม.6/1 (`class-fund.html`)
- บัญชีรายรับ-รายจ่าย พร้อมยอดคงเหลือ
- บันทึกธุรกรรมใหม่ผ่าน modal
- กรองตามเดือน/ประเภท + ค้นหา

---

## 🔌 API Endpoints

ไฟล์ `js/api.js` เก็บค่าคงที่ทั้งหมด:

```javascript
const API = {
  ATTENDANCE:       "https://script.google.com/macros/s/AKfycbx1yUYxuSgF2xsOZF872ohwjIvD56NQwbZ4BXizSG-dm00Rypu6nVO_YwE-BZJ2F6X4/exec",
  EXAM:             "https://script.google.com/macros/s/AKfycbw3eNbBuhg-P-dLxBeZkYIggp0FW9GM1TdL1wVd1XeyxvwRTzw4BcMNiPBEyyWH1le-/exec",
  GRADES:           "https://script.google.com/macros/s/AKfycbyrdVll59hQVArQGjBTPPfovFBZ0eG5mjTWn93R2GJ_Xwl3wBTjMttgjrNW6Nr-ZfbF/exec",
  SUBMIT_WORK:      "https://script.google.com/macros/s/AKfycbyt0HfLY6ZvCc12rFdJI74KGim_wmLapTKNlvhe7U3O3LlNaaCq97iHkZQ-51mLLVKY/exec",
  SUBJECT_CHECKIN:  "https://script.google.com/macros/s/AKfycbxAyuZYgGo97MWZrWo53-HV1pHKqdjzGDMS7JjBatdloLavF1Txwtz13dlHybbBhMPkTw/exec",
  CLASS_FUND:       "https://script.google.com/macros/s/AKfycbz-F0PVMgQel2G7PIutsmvIW_D7UeSwXau39cGn4G8gnKHK2O_AXJnofNu5X5AMmdDafQ/exec",
};
```

---

## 🔧 วิธีการเชื่อมต่อ API

### หลักการสำคัญ (CORS-safe)

Google Apps Script Web App มีข้อจำกัด CORS ที่ต้องระวัง:

| Method | Content-Type | ทำงานข้าม Domain | หมายเหตุ |
|--------|--------------|------------------|----------|
| **GET** | — | ✅ ได้ทันที | ส่ง parameter ทาง query string |
| **POST** | `text/plain` | ✅ ได้ | หลีก preflight ที่ GAS ตอบไม่ได้ |
| POST | `application/json` | ❌ preflight fail | GAS ไม่ตอบ OPTIONS |

### Helper functions ใน `js/api.js`

```javascript
// GET request
await KNT_API.get(endpoint, { action: "save", room: "ม.6/1", ... });

// POST request (ใช้ text/plain อัตโนมัติ)
await KNT_API.post(endpoint, { action: "save" }, { key, data });

// แปลงไฟล์เป็น Base64 (สำหรับรูปภาพ)
const base64 = await KNT_API.fileToBase64(file);
```

### Domain helpers (ใช้งานง่ายในแต่ละหน้า)

```javascript
// เช็คชื่อ
await KNT.attendance.save(room, date, { "1": "มา", "2": "ขาด" });
await KNT.attendance.photoSave(studentId, base64);

// ข้อสอบ/ควิซ
await KNT.exam.quizSave({ room, no, name, lessonId, lessonTitle, score, total });
await KNT.exam.examSave({ room, no, name, subject, score, total });
await KNT.exam.examGet();

// เกรด
await KNT.grades.save("ม.6/1|ฟิสิกส์", { students: [...] });

// เงินห้อง
await KNT.classFund.getData();
await KNT.classFund.saveTransaction({ date, type, amount, ... });
```

### Action ทั้งหมดที่ใช้

| ระบบ | Action | Method | Parameter |
|------|--------|--------|-----------|
| เช็คชื่อ | `save` | GET | `room`, `date` (yyyy-MM-dd), `data` (JSON) |
| เช็คชื่อ | `photo_save` | GET | `studentId`, `data` (Base64) |
| ควิซ | `quiz_save` | GET | `room`, `no`, `name`, `lessonId`, `lessonTitle`, `score`, `total` |
| ข้อสอบ | `exam_save` | GET | `room`, `no`, `name`, `subject`, `score`, `total` |
| ข้อสอบ | `exam_get` | GET | — |
| เกรด | `save` | POST/GET | `key` ("ห้อง\|วิชา"), `data` |
| เงินห้อง | `get_data` | GET | — |
| เงินห้อง | `save_transaction` | POST/GET | object ธุรกรรม |

---

## 🚀 วิธีใช้งาน

### เปิดเว็บ
เปิดไฟล์ `index.html` ในเบราว์เซอร์ หรืออัปโหลดทั้งโฟลเดอร์ขึ้น hosting ใดก็ได้

### ตั้งค่า Google Apps Script

⚠️ **สำคัญมาก** — ฝั่ง GAS Web App ต้องตั้งค่าดังนี้ไม่งั้น fetch จะ CORS fail:

1. เปิด Apps Script Editor
2. คลิก **Deploy → New deployment**
3. เลือก type: **Web app**
4. ตั้งค่า:
   - **Execute as**: Me
   - **Who has access**: **Anyone** ← สำคัญ!
5. คลิก Deploy แล้วให้สิทธิ์
6. คัดลอก URL ที่ได้

### ทดสอบการเชื่อมต่อ

เปิด Console ในเบราว์เซอร์แล้วลอง:

```javascript
// ทดสอบดึงคะแนนสอบ
KNT.exam.examGet().then(console.log);

// ทดสอบบันทึกเกรด
KNT.grades.save("ม.6/1|ทดสอบ", { test: true }).then(console.log);
```

---

## 🎨 การปรับแต่ง

### เปลี่ยนสีธีม

แก้ใน `styles.css` บนสุด:

```css
:root {
  --red: #e0102f;        /* สีแดงหลัก */
  --red-bright: #ff2d4a; /* แดงสว่าง */
  --red-deep: #7a0c1c;   /* แดงเข้ม */
  --carbon-0: #0a0a0b;   /* พื้นหลัง */
}
```

### เพิ่มนักเรียนในระบบเช็คชื่อ

แก้ `DEFAULT_ROSTER` ใน `attendance.html`:

```javascript
const DEFAULT_ROSTER = [
  { no: 1, name: "นาย สมชาย ใจดี", photo: "" },
  { no: 2, name: "นาย สมหญิง รักเรียน", photo: "" },
  // ...
];
```

### เพิ่มข้อสอบในควิซ

แก้ `BANK` ใน `quiz.html` หรือ `exam.html`:

```javascript
{ q: "คำถาม?", o: ["ตัวเลือก 1","ตัวเลือก 2","ตัวเลือก 3","ตัวเลือก 4"], a: 0 }
//                                                                     ↑ index ของคำตอบที่ถูก
```

### เปลี่ยนลิงก์เครื่องมือด่วน

แก้ `TOOLS` array ใน `script.js`

---

## ❓ คำถามที่พบบ่อย

**Q: ทำไมบันทึกข้อมูลไม่เข้า?**
A: ตรวจสอบว่า GAS deploy เป็น "Anyone" แล้ว ลองเปิดลิงก์ API ในเบราว์เซอร์โดยตรงก่อน เพื่อดูว่าตอบกลับปกติ

**Q: รูปภาพอัปโหลดไม่ได้?**
A: ระบบจะย่อขนาดรูปเหลือ 240px ก่อนส่ง ถ้ายังใหญ่เกิน อาจต้องลด quality ในฟังก์ชัน `resizeBase64`

**Q: เปลี่ยนลิงก์ API ทีหลังได้ไหม?**
A: ได้ แก้ใน `js/api.js` บรรทัด `const API = { ... }`

**Q: ใช้กับห้องอื่นที่ไม่ใช่ ม.6/1 ได้ไหม?**
A: ได้ หน้า subject-checkin รองรับทุกห้อง ส่วน attendance และ class-fund ออกแบบไว้สำหรับ ม.6/1 โดยเฉพาะ (แก้ `ROOM` constant ในแต่ละหน้าได้)

**Q: รองรับมือถือไหม?**
A: รองรับเต็มที่ ออกแบบแบบ Mobile First ทุกหน้า

---

## 📄 License

© 2026 KNT · ครูนิวตรอน — สงวนลิขสิทธิ์

**เวอร์ชัน**: 1.0.0 · Premium Dashboard
**อัปเดตล่าสุด**: กรกฎาคม 2026
