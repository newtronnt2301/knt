# แผนการย้ายดีไซน์หน้าเว็บหลักเป็น Space Theme พรีเมียม (Orbis.Nft)

เอกสารนี้ระบุแผนการทำงานเพื่อแก้ไขปัญหาการย้อนกลับของหน้าแรก (index.html) กลับไปเป็นหน้าตาเก่า โดยทำการผสานรวม (Merge) รายการการ์ดและทางเข้าลิงก์ทั้งหมดจากระบบที่พึ่งอัปเดตล่าสุด เข้าสู่หน้าดีไซน์อวกาศสุดหรูที่มีโลโก้เป็นทางการ

## Proposed Changes

### [Portal Homepage Component]

ทำการแก้ไขหน้าหลักของเว็บไซต์ โดยนำโค้ดโครงสร้างและดีไซน์แบบพรีเมียมจากหน้า `space-portal.html` มาใช้ และเพิ่มลิงก์การ์ด/เมนูที่ขาดหายไป 4 รายการลงไปในหน้าดังกล่าวให้เสร็จสมบูรณ์ จากนั้นแทนที่ไฟล์ `index.html` ทั้งในโฟลเดอร์หลักและโฟลเดอร์สำหรับอัปโหลด

#### [MODIFY] [index.html](file:///Users/macbookair/Library/CloudStorage/GoogleDrive-damwat.new@gmail.com/ไดรฟ์ของฉัน/Drive%20NewTron/เว็บ%20นิวตรอน.com/สำหรับอัพโหลด_เว็บรวมหลัก/index.html)
*   เขียนทับเนื้อหาด้วยดีไซน์อวกาศสีเขียวนีออน และผสานการ์ดเมนูใหม่ทั้งหมด 12 การ์ด (เพิ่ม 4 การ์ดจากหน้า space-portal.html) ได้แก่:
    *   **ระบบจัดการคะแนน / ตัดเกรด (สำหรับคุณครู)** (`คะแนนเกรด/index-เกรด.html`)
    *   **ระบบประกาศผลสอบ & ติดตามเกรด 0 (สำหรับนักเรียน)** (`ประกาศผลสอบ/index.html`)
    *   **ระบบสแกนการ์ดตอบคำถาม (Plickers)** (`plickers/index.html`)
    *   **ระบบบัญชีเงินห้องเรียน ม.6/1 (ClassFund)** (`เก็บเงินเพื่อน/index.html`)
*   เพิ่มทางเลือกเมนูด้านซ้าย (Sidebar Drawer) ให้มีทางเชื่อมไปยังระบบใหม่ทั้งหมดเช่นเดียวกันเพื่อความครอบคลุมในการนำทาง

#### [MODIFY] [index.html](file:///Users/macbookair/Library/CloudStorage/GoogleDrive-damwat.new@gmail.com/ไดรฟ์ของฉัน/Drive%20NewTron/เว็บ%20นิวตรอน.com/index.html)
*   คัดลอกไฟล์ `index.html` หลังการแก้ไขในโฟลเดอร์อัปโหลด มาเขียนทับไฟล์ในโฟลเดอร์ทำงานหลัก เพื่อให้เนื้อหาตรงกันและป้องกันความสับสนในการทำงานภายหลัง

## Verification & Deployment Plan

### Manual Verification
1.  เปิดหน้าเว็บในเบราว์เซอร์โลคัลเพื่อตรวจสอบโครงสร้างความสวยงามและลิงก์ของปุ่มกดทั้งหมด
2.  ตรวจสอบปุ่ม Hamburger Menu (☰) ว่าดึง Sidebar Drawer ออกมาปกติ และมีลิงก์ทางลัดไปยังแอปพลิเคชันทั้งหมดครบ 12 รายการ

### Deployment
1.  รันสคริปต์ [deploy_github.py](file:///Users/macbookair/Library/CloudStorage/GoogleDrive-damwat.new@gmail.com/ไดรฟ์ของฉัน/Drive%20NewTron/เว็บ%20นิวตรอน.com/deploy_github.py)
2.  ป้อนค่า GitHub Credentials และ PAT เพื่อ Push ไฟล์ขึ้น Repository `krunewtron` บน GitHub
3.  ตรวจสอบการใช้งานบนลิงก์จริง `https://ครูนิวตรอน.com` หลังจากดีพลอย 1-2 นาที
