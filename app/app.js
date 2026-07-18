const studentNavItems = [
  { id: 'home', label: 'หน้าแรก', icon: 'home' },
  { id: 'courses', label: 'เรียน', icon: 'book' },
  { id: 'exams', label: 'ข้อสอบ', icon: 'exam' },
  { id: 'tasks', label: 'งาน', icon: 'task' },
  { id: 'profile', label: 'โปรไฟล์', icon: 'user' }
];

const teacherNavItems = [
  { id: 'teacher-home', label: 'ภาพรวม', icon: 'home' },
  { id: 'attendance', label: 'เช็กชื่อ', icon: 'users' },
  { id: 'teacher-work', label: 'งาน/สแกน', icon: 'camera' },
  { id: 'scores', label: 'คะแนน', icon: 'chart' },
  { id: 'tools', label: 'เครื่องมือ', icon: 'grid' }
];

let currentRole = localStorage.getItem('knt-classroom-role') === 'teacher' ? 'teacher' : 'student';
let currentTool = null;

const courses = [
  { icon: '∑', tone: 'blue', title: 'คณิตศาสตร์', teacher: 'ครูนิวตรอน', progress: 72, lessons: '12 บทเรียน' },
  { icon: '⚛', tone: 'purple', title: 'วิทยาศาสตร์', teacher: 'ครูปรียา', progress: 58, lessons: '10 บทเรียน' },
  { icon: '文', tone: 'mint', title: 'ภาษาไทย', teacher: 'ครูวรรณา', progress: 84, lessons: '14 บทเรียน' },
  { icon: 'EN', tone: 'coral', title: 'ภาษาอังกฤษ', teacher: 'Teacher Ann', progress: 65, lessons: '11 บทเรียน' },
  { icon: '⌘', tone: 'blue', title: 'เทคโนโลยี', teacher: 'ครูอนุชา', progress: 46, lessons: '8 บทเรียน' },
  { icon: '♫', tone: 'purple', title: 'ศิลปะและดนตรี', teacher: 'ครูณัฐ', progress: 90, lessons: '9 บทเรียน' }
];

const exams = [
  { tone: 'coral', status: 'ใกล้ถึงกำหนด', title: 'แบบทดสอบสมการเชิงเส้น', subject: 'คณิตศาสตร์', date: 'วันนี้ 15:30 น.', duration: '30 นาที', questions: '20 ข้อ' },
  { tone: 'purple', status: 'กำลังจะมาถึง', title: 'ระบบสุริยะและดวงดาว', subject: 'วิทยาศาสตร์', date: '22 ก.ค. 2569', duration: '40 นาที', questions: '25 ข้อ' },
  { tone: 'mint', status: 'ทำแล้ว', title: 'คำราชาศัพท์', subject: 'ภาษาไทย', date: '16 ก.ค. 2569', duration: '25 นาที', questions: '15 ข้อ', score: '13/15' },
  { tone: 'mint', status: 'ทำแล้ว', title: 'Present Simple Tense', subject: 'ภาษาอังกฤษ', date: '14 ก.ค. 2569', duration: '30 นาที', questions: '20 ข้อ', score: '18/20' },
  { tone: 'blue', status: 'กำลังจะมาถึง', title: 'พื้นฐานการเขียนโปรแกรม', subject: 'เทคโนโลยี', date: '28 ก.ค. 2569', duration: '45 นาที', questions: '30 ข้อ' }
];

const tasks = [
  { id: 1, tone: 'coral', status: 'ส่งพรุ่งนี้', title: 'แบบฝึกหัดสมการ ข้อ 1–10', subject: 'คณิตศาสตร์', due: '19 ก.ค. 2569', type: 'ไฟล์ PDF' },
  { id: 2, tone: 'purple', status: 'เหลือ 3 วัน', title: 'สรุประบบสุริยะหนึ่งหน้ากระดาษ', subject: 'วิทยาศาสตร์', due: '21 ก.ค. 2569', type: 'รูปภาพหรือ PDF' },
  { id: 3, tone: 'blue', status: 'เหลือ 5 วัน', title: 'เขียนเรียงความเรื่องโรงเรียนของฉัน', subject: 'ภาษาไทย', due: '23 ก.ค. 2569', type: 'เอกสาร' },
  { id: 4, tone: 'mint', status: 'ส่งแล้ว', title: 'My Daily Routine', subject: 'ภาษาอังกฤษ', due: 'ส่งเมื่อ 16 ก.ค.', type: 'ไฟล์เสียง', done: true }
];

const teacherTools = [
  { id: 'subject-attendance', category: 'attendance', icon: 'users', tone: 'blue', title: 'เช็กชื่อเข้าเรียนรายวิชา', description: 'บันทึกเวลาเรียน ขาด ลา และมาสายรายคาบ', path: '../เช็คชื่อรายวิชา/index.html', badge: 'LIVE SCAN' },
  { id: 'engineering-attendance', category: 'attendance', icon: 'check', tone: 'purple', title: 'เช็กชื่อเตรียมวิศวะ ม.4–ม.6', description: 'เช็กชื่อห้องเรียนพิเศษเตรียมวิศวกรรมศาสตร์ 3 ห้อง', path: '../เช็คชื่อ-เตรียมวิศวะ.html', badge: '3 ห้องเรียน' },
  { id: 'submission-tracker', category: 'work', icon: 'qr', tone: 'mint', title: 'ติดตามส่งงาน/ข้อสอบ', description: 'บันทึกงาน ตรวจสถานะ และสแกน QR การ์ดนักเรียน', path: '../ส่งงาน/index-ส่งงาน.html', badge: 'SCAN & TRACK' },
  { id: 'random-student', category: 'activity', icon: 'users', tone: 'coral', title: 'สุ่มเลขที่เป็ดแข่งวิ่ง 3D', description: 'สุ่มนักเรียนผ่านกิจกรรมเป็ดแข่งวิ่งในชั้นเรียน', path: '../สุ่มเลขที่/index.html', badge: '3D RACE' },
  { id: 'board-games', category: 'activity', icon: 'grid', tone: 'purple', title: 'บอร์ดเกมพัฒนาทักษะ', description: 'Werewolf, Connect4, Othello และเกมฝึกทักษะ', path: '../boardgame/index.html', badge: 'GAME' },
  { id: 'learning', category: 'learning', icon: 'book', tone: 'blue', title: 'คลังคณิตศาสตร์เพิ่มเติม ม.4', description: 'บทเรียน โจทย์ออนไลน์ และระบบบันทึกคะแนน', path: '../learning/index.html', badge: 'LEARN' },
  { id: 'exam', category: 'scores', icon: 'exam', tone: 'coral', title: 'ระบบสอบเก็บคะแนนท้ายบท', description: 'ห้องสอบสุ่มข้อ พร้อมรายงานคะแนนสำหรับครู', path: '../exam/index.html', badge: 'EXAM' },
  { id: 'plickers', category: 'work', icon: 'camera', tone: 'purple', title: 'สแกนการ์ด Plickers', description: 'สแกนการ์ด ArUco และบันทึกคำตอบผ่านกล้องครู', path: '../plickers/index.html', badge: 'CAMERA' },
  { id: 'grades', category: 'scores', icon: 'chart', tone: 'mint', title: 'จัดการคะแนนและตัดเกรด', description: 'กรอกคะแนน คำนวณเกรด 8 ระดับ และสรุปรายงาน', path: '../คะแนนเกรด/index-เกรด.html', badge: 'GRADES' },
  { id: 'results', category: 'scores', icon: 'exam', tone: 'blue', title: 'ประกาศผลสอบและตามงานค้าง', description: 'ค้นหาคะแนนรายคนและติดตามนักเรียนที่มีงานค้าง', path: '../ประกาศผลสอบ/index.html', badge: 'PUBLISH' },
  { id: 'class-fund', category: 'utility', icon: 'money', tone: 'mint', title: 'บัญชีเงินห้องเรียน ม.6/1', description: 'รายรับ รายจ่าย ยอดสะสม และหลักฐานการโอน', path: '../เก็บเงินเพื่อน/index.html', badge: 'FUND' },
  { id: 'qr-cards', category: 'utility', icon: 'qr', tone: 'coral', title: 'พิมพ์การ์ด QR นักเรียน', description: 'สร้างและพิมพ์การ์ดเช็กชื่อรายบุคคล', path: '../ส่งงาน/qr-card.html', badge: 'PRINT' },
  { id: 'qr-generator', category: 'utility', icon: 'qr', tone: 'purple', title: 'สร้าง QR Code อิสระ', description: 'เครื่องมือสร้างคิวอาร์โค้ดอเนกประสงค์', path: '../ส่งงาน/qr-generator.html', badge: 'QR TOOL' }
];

// รายชื่อครูสำหรับระบบเช็กชื่อรวม — เก็บแยกจากระบบเตรียมวิศวะ
// ซึ่งใช้รายวิชาและกลุ่มห้องเฉพาะของตนเอง
const attendanceTeachers = ['ครูนิวตรอน', 'ครูปรียา', 'ครูวรรณา', 'Teacher Ann', 'ครูอนุชา', 'ครูณัฐ'];
const engineeringRooms = ['ม.4/1', 'ม.5/1', 'ม.6/1'];

const navMarkup = items => items.map(item => `
  <button class="nav-item" type="button" data-route="${item.id}" aria-label="${item.label}">
    <svg aria-hidden="true"><use href="#icon-${item.icon}"></use></svg>
    <span>${item.label}</span>
  </button>`).join('');

function renderNavigation() {
  const items = currentRole === 'teacher' ? teacherNavItems : studentNavItems;
  const markup = navMarkup(items);
  document.querySelector('.bottom-nav').innerHTML = markup;
  document.querySelector('.side-nav').innerHTML = markup;
  document.querySelector('.sidebar-note').innerHTML = currentRole === 'teacher'
    ? '<span class="sparkle">✦</span><b>ศูนย์จัดการชั้นเรียน</b><span>เครื่องมือครูครบในที่เดียว</span>'
    : '<span class="sparkle">✦</span><b>ตั้งใจเรียนวันนี้</b><span>เก่งขึ้นอีกนิดทุกวัน</span>';
}

renderNavigation();

const courseCard = course => `
  <article class="course-card card">
    <div class="course-top">
      <span class="subject-icon ${course.tone}">${course.icon}</span>
      <div><h3>${course.title}</h3><p>${course.teacher} · ${course.lessons}</p></div>
    </div>
    <div class="progress-row"><span>ความคืบหน้า</span><b>${course.progress}%</b></div>
    <div class="progress-track"><i style="width:${course.progress}%"></i></div>
  </article>`;

function homeView() {
  return `
    <div class="home-layout">
      <section class="hero">
        <span class="date">วันเสาร์ที่ 18 กรกฎาคม 2569</span>
        <h1>สวัสดี ธนกฤต 👋</h1>
        <p>พร้อมเรียนรู้สิ่งใหม่แล้วหรือยัง? วันนี้มี 3 คาบเรียน และงานที่ใกล้ถึงกำหนด 1 ชิ้น</p>
        <button class="primary-button" type="button" data-route="courses">เริ่มเรียนวันนี้ <svg><use href="#icon-arrow"></use></svg></button>
      </section>
      <section class="stats-grid" aria-label="สรุปการเรียน">
        <div class="stat-card card"><span class="stat-icon blue"><svg><use href="#icon-book"></use></svg></span><div><strong>6</strong><span>รายวิชา</span></div></div>
        <div class="stat-card card"><span class="stat-icon purple"><svg><use href="#icon-exam"></use></svg></span><div><strong>2</strong><span>ข้อสอบที่กำลังมา</span></div></div>
        <div class="stat-card card"><span class="stat-icon mint"><svg><use href="#icon-task"></use></svg></span><div><strong>3</strong><span>งานที่ต้องส่ง</span></div></div>
      </section>
      <section class="today-section">
        <div class="section-heading"><div><p class="eyebrow">ตารางของฉัน</p><h2>เรียนวันนี้</h2></div><button type="button" data-action="toast" data-message="ตารางเรียนฉบับเต็มจะพร้อมเมื่อเชื่อมระบบจริง">ดูทั้งหมด</button></div>
        <div class="today-list">
          <article class="schedule-card card"><i class="schedule-line"></i><div><h3>คณิตศาสตร์</h3><p>ห้อง 3/2 · ครูนิวตรอน</p></div><span class="schedule-time">09:00</span></article>
          <article class="schedule-card card"><i class="schedule-line purple"></i><div><h3>วิทยาศาสตร์</h3><p>ห้องปฏิบัติการ 1</p></div><span class="schedule-time">10:30</span></article>
          <article class="schedule-card card"><i class="schedule-line mint"></i><div><h3>ภาษาอังกฤษ</h3><p>ห้อง 3/2 · Teacher Ann</p></div><span class="schedule-time">13:00</span></article>
        </div>
      </section>
    </div>
    <section>
      <div class="section-heading"><div><p class="eyebrow">เรียนต่อกัน</p><h2>รายวิชาของฉัน</h2></div><button type="button" data-route="courses">ดูทั้งหมด</button></div>
      <div class="course-grid">${courses.slice(0, 3).map(courseCard).join('')}</div>
    </section>`;
}

function coursesView() {
  return `<header class="page-heading"><p class="eyebrow">ห้องเรียนของฉัน</p><h1>รายวิชาทั้งหมด</h1><p class="subtitle">เลือกวิชาเพื่อเริ่มเรียนหรือทบทวนบทเรียน</p></header>
    <div class="filter-pills"><button class="filter-pill active">ทั้งหมด 6</button><button class="filter-pill">กำลังเรียน</button><button class="filter-pill">เรียนล่าสุด</button></div>
    <section class="course-grid">${courses.map(courseCard).join('')}</section>`;
}

const examCard = exam => `
  <article class="exam-card card" data-state="${exam.score ? 'done' : 'upcoming'}">
    <div class="card-label-row"><div><span class="tag ${exam.tone}">${exam.status}</span><h3>${exam.title}</h3><span class="muted">${exam.subject}</span></div>${exam.score ? `<div class="score">${exam.score}</div>` : ''}</div>
    <div class="exam-meta"><span><svg><use href="#icon-clock"></use></svg>${exam.date}</span><span>${exam.duration}</span><span>${exam.questions}</span></div>
    <button class="soft-button" type="button" data-action="toast" data-message="${exam.score ? 'กำลังเปิดรายละเอียดผลสอบ' : 'ข้อสอบตัวอย่างยังไม่เชื่อมระบบจริง'}">${exam.score ? 'ดูผลสอบ' : 'ดูรายละเอียด'} <svg><use href="#icon-arrow"></use></svg></button>
  </article>`;

function examsView() {
  return `<header class="page-heading"><p class="eyebrow">ทดสอบความรู้</p><h1>ข้อสอบของฉัน</h1><p class="subtitle">ตรวจสอบกำหนดการและผลสอบได้ในที่เดียว</p></header>
    <div class="filter-pills" data-filter-group="exam"><button class="filter-pill active" data-filter="all">ทั้งหมด</button><button class="filter-pill" data-filter="upcoming">กำลังจะมาถึง</button><button class="filter-pill" data-filter="done">ทำแล้ว</button></div>
    <section class="exam-grid stack-list">${exams.map(examCard).join('')}</section>`;
}

const taskCard = task => `
  <article class="task-card card ${task.done ? 'completed' : ''}" data-state="${task.done ? 'done' : 'pending'}">
    <div class="task-main"><div><span class="tag ${task.tone}">${task.status}</span><h3>${task.title}</h3><span class="muted">${task.subject}</span></div><button class="task-check ${task.done ? 'done' : ''}" data-task="${task.id}" aria-label="${task.done ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}">${task.done ? '<svg><use href="#icon-check"></use></svg>' : ''}</button></div>
    <div class="task-meta"><span class="${task.done ? '' : 'due'}"><svg><use href="#icon-clock"></use></svg>${task.due}</span><span>${task.type}</span></div>
  </article>`;

function tasksView() {
  return `<header class="page-heading"><p class="eyebrow">อย่าลืมส่งนะ</p><h1>งานของฉัน</h1><p class="subtitle">ติดตามงานที่ต้องส่งและงานที่เสร็จแล้ว</p></header>
    <div class="filter-pills" data-filter-group="task"><button class="filter-pill active" data-filter="all">ทั้งหมด</button><button class="filter-pill" data-filter="pending">ต้องส่ง</button><button class="filter-pill" data-filter="done">ส่งแล้ว</button></div>
    <section class="task-grid stack-list">${tasks.map(taskCard).join('')}</section>`;
}

function profileView() {
  return `<header class="page-heading"><p class="eyebrow">บัญชีของฉัน</p><h1>โปรไฟล์และการตั้งค่า</h1></header>
    <div class="profile-layout">
      <section class="profile-banner card"><div class="profile-avatar">ธ</div><h2>ธนกฤต ใจดี</h2><p>นักเรียนชั้นมัธยมศึกษาปีที่ 3/2 · เลขที่ 12</p></section>
      <div>
        <div class="section-heading"><h2>การตั้งค่า</h2></div>
        <section class="setting-list card">
          <button class="setting-item" type="button" data-toggle><span class="setting-item-icon"><svg><use href="#icon-bell"></use></svg></span><span class="setting-text"><b>การแจ้งเตือน</b><span>แจ้งเตือนงานและข้อสอบ</span></span><i class="toggle on"></i></button>
          <button class="setting-item" type="button" data-action="toast" data-message="ข้อมูลบัญชีจะเชื่อมกับระบบจริงในระยะถัดไป"><span class="setting-item-icon purple"><svg><use href="#icon-user"></use></svg></span><span class="setting-text"><b>ข้อมูลส่วนตัว</b><span>ชื่อ ชั้นเรียน และข้อมูลบัญชี</span></span><svg><use href="#icon-arrow"></use></svg></button>
          <button class="setting-item" type="button" data-action="toast" data-message="ระบบนี้ใช้เฉพาะข้อมูลตัวอย่างในอุปกรณ์"><span class="setting-item-icon mint"><svg><use href="#icon-shield"></use></svg></span><span class="setting-text"><b>ความเป็นส่วนตัว</b><span>จัดการข้อมูลและความปลอดภัย</span></span><svg><use href="#icon-arrow"></use></svg></button>
          <button class="setting-item" type="button" data-action="toast" data-message="KNT Classroom เวอร์ชันต้นแบบ 1.0"><span class="setting-item-icon"><svg><use href="#icon-help"></use></svg></span><span class="setting-text"><b>ช่วยเหลือและเกี่ยวกับแอป</b><span>คำถามที่พบบ่อย · เวอร์ชัน 1.0</span></span><svg><use href="#icon-arrow"></use></svg></button>
        </section>
      </div>
    </div>`;
}

const toolCard = tool => `
  <article class="tool-card card">
    <div class="tool-card-top">
      <span class="tool-icon ${tool.tone}"><svg><use href="#icon-${tool.icon}"></use></svg></span>
      <span class="tool-badge">${tool.badge}</span>
    </div>
    <h3>${tool.title}</h3>
    <p>${tool.description}</p>
    <div class="tool-actions">
      <button class="soft-button" type="button" data-tool="${tool.id}">เปิดใช้งาน <svg><use href="#icon-arrow"></use></svg></button>
    </div>
  </article>`;

const toolSection = (title, subtitle, category) => {
  const selected = teacherTools.filter(tool => tool.category === category);
  return `<section><div class="section-heading"><div><p class="eyebrow">${subtitle}</p><h2>${title}</h2></div></div><div class="tool-grid">${selected.map(toolCard).join('')}</div></section>`;
};

function teacherHomeView() {
  const quickTools = ['subject-attendance', 'submission-tracker', 'grades', 'exam'].map(id => teacherTools.find(tool => tool.id === id));
  return `
    <div class="teacher-hero hero">
      <div><span class="date">ศูนย์ควบคุมสำหรับคุณครู</span><h1>สวัสดีครับ ครูนิวตรอน 👋</h1><p>วันนี้มี 4 คาบเรียน งานรอตรวจ 18 ชิ้น และนักเรียนที่ต้องติดตามการเข้าเรียน 3 คน</p></div>
      <div class="teacher-hero-orb"><strong>4</strong><span>คาบวันนี้</span></div>
    </div>
    <section class="teacher-stats stats-grid" aria-label="สรุปห้องเรียน">
      <div class="stat-card card"><span class="stat-icon blue"><svg><use href="#icon-users"></use></svg></span><div><strong>126</strong><span>นักเรียนทั้งหมด</span></div></div>
      <div class="stat-card card"><span class="stat-icon purple"><svg><use href="#icon-task"></use></svg></span><div><strong>18</strong><span>งานรอตรวจ</span></div></div>
      <div class="stat-card card"><span class="stat-icon mint"><svg><use href="#icon-chart"></use></svg></span><div><strong>82%</strong><span>การเข้าเรียนวันนี้</span></div></div>
    </section>
    <section>
      <div class="section-heading"><div><p class="eyebrow">เริ่มทำงานทันที</p><h2>ทางลัดสำหรับครู</h2></div><button type="button" data-route="tools">ดูทั้งหมด</button></div>
      <div class="quick-action-grid">
        <button type="button" data-tool="subject-attendance" class="quick-action blue"><svg><use href="#icon-users"></use></svg><span><b>เริ่มเช็กชื่อ</b><small>รายวิชาและรายคาบ</small></span></button>
        <button type="button" data-tool="submission-tracker" class="quick-action mint"><svg><use href="#icon-qr"></use></svg><span><b>สแกนงานนักเรียน</b><small>QR การ์ดรายบุคคล</small></span></button>
        <button type="button" data-tool="grades" class="quick-action purple"><svg><use href="#icon-chart"></use></svg><span><b>บันทึกคะแนน</b><small>คะแนนและตัดเกรด</small></span></button>
        <button type="button" data-tool="plickers" class="quick-action coral"><svg><use href="#icon-camera"></use></svg><span><b>เปิดกล้อง Plickers</b><small>สแกนคำตอบในห้อง</small></span></button>
      </div>
    </section>
    <div class="teacher-dashboard-grid">
      <section>
        <div class="section-heading"><div><p class="eyebrow">ตารางสอน</p><h2>คาบเรียนวันนี้</h2></div></div>
        <div class="stack-list">
          <article class="schedule-card card"><i class="schedule-line"></i><div><h3>คณิตศาสตร์เพิ่มเติม</h3><p>ม.4/1 · ห้อง 421</p></div><span class="schedule-time">08:30</span></article>
          <article class="schedule-card card"><i class="schedule-line purple"></i><div><h3>คณิตศาสตร์เพิ่มเติม</h3><p>ม.4/2 · ห้อง 422</p></div><span class="schedule-time">10:20</span></article>
          <article class="schedule-card card"><i class="schedule-line mint"></i><div><h3>เตรียมวิศวกรรมศาสตร์</h3><p>ม.5 · ห้องปฏิบัติการ</p></div><span class="schedule-time">13:00</span></article>
        </div>
      </section>
      <section>
        <div class="section-heading"><div><p class="eyebrow">ต้องดำเนินการ</p><h2>รายการที่ควรตรวจสอบ</h2></div></div>
        <div class="attention-card card">
          <button data-route="teacher-work"><span class="attention-dot coral"></span><span><b>งานรอตรวจ 18 ชิ้น</b><small>แบบฝึกหัดสมการเชิงเส้น</small></span><svg><use href="#icon-arrow"></use></svg></button>
          <button data-route="attendance"><span class="attention-dot purple"></span><span><b>นักเรียนขาดเรียนต่อเนื่อง 3 คน</b><small>ตรวจสอบและติดต่อผู้ปกครอง</small></span><svg><use href="#icon-arrow"></use></svg></button>
          <button data-route="scores"><span class="attention-dot mint"></span><span><b>คะแนนสอบชุดใหม่พร้อมแล้ว</b><small>แบบทดสอบก่อนกลางภาค 42 คน</small></span><svg><use href="#icon-arrow"></use></svg></button>
        </div>
      </section>
    </div>
    <section><div class="section-heading"><div><p class="eyebrow">ระบบเดิมที่เชื่อมแล้ว</p><h2>เครื่องมือที่ใช้บ่อย</h2></div></div><div class="tool-grid">${quickTools.map(toolCard).join('')}</div></section>`;
}

function attendanceView() {
  return `<header class="page-heading"><p class="eyebrow">จัดการเวลาเรียน</p><h1>เช็กชื่อและการเข้าเรียน</h1><p class="subtitle">เช็กชื่อ บันทึกสถานะ และใช้กล้องได้โดยไม่ออกจาก KNT Classroom</p></header>
    <section class="summary-strip card"><div><strong>4</strong><span>ห้องเรียนวันนี้</span></div><div><strong>103</strong><span>มาเรียน</span></div><div><strong>7</strong><span>ขาด/ลา/สาย</span></div></section>
    ${toolSection('ระบบเช็กชื่อ', 'พร้อมใช้งานจากเว็บเดิม', 'attendance')}
    <section><div class="section-heading"><div><p class="eyebrow">เตรียมการ์ดนักเรียน</p><h2>เครื่องมือ QR</h2></div></div><div class="tool-grid">${teacherTools.filter(tool => tool.id === 'qr-cards').map(toolCard).join('')}</div></section>`;
}

function teacherWorkView() {
  return `<header class="page-heading"><p class="eyebrow">ตรวจและติดตาม</p><h1>งานและการสแกน</h1><p class="subtitle">ติดตามงาน สแกน QR นักเรียน และสแกนคำตอบกิจกรรมในห้อง</p></header>
    <section class="summary-strip card"><div><strong>18</strong><span>รอตรวจ</span></div><div><strong>96</strong><span>ส่งแล้ว</span></div><div><strong>12</strong><span>ยังไม่ส่ง</span></div></section>
    ${toolSection('ระบบงานและการสแกน', 'เปิดใช้งานได้ทันที', 'work')}
    <section><div class="section-heading"><div><p class="eyebrow">งานล่าสุด</p><h2>ภาพรวมการส่งงาน</h2></div></div>
      <div class="teacher-list card">
        <div><span class="list-avatar blue">4/1</span><span><b>แบบฝึกหัดสมการเชิงเส้น</b><small>ส่งแล้ว 32/38 คน · รอตรวจ 8 ชิ้น</small></span><strong>84%</strong></div>
        <div><span class="list-avatar purple">4/2</span><span><b>ใบงานจำนวนจริง</b><small>ส่งแล้ว 35/40 คน · รอตรวจ 10 ชิ้น</small></span><strong>88%</strong></div>
        <div><span class="list-avatar mint">5</span><span><b>โครงงานสะพานจำลอง</b><small>ส่งแล้ว 24/28 กลุ่ม</small></span><strong>86%</strong></div>
      </div>
    </section>`;
}

function scoresView() {
  return `<header class="page-heading"><p class="eyebrow">ผลการเรียน</p><h1>คะแนน ข้อสอบ และรายงาน</h1><p class="subtitle">บันทึกคะแนน ดูผลสอบ ตัดเกรด และประกาศผลจากจุดเดียว</p></header>
    <section class="summary-strip card"><div><strong>4</strong><span>ชุดข้อสอบ</span></div><div><strong>42</strong><span>ผลสอบใหม่</span></div><div><strong>76.5</strong><span>คะแนนเฉลี่ย</span></div></section>
    ${toolSection('ระบบคะแนนทั้งหมด', 'เชื่อมหน้าจริงจากเว็บเดิม', 'scores')}
    <section><div class="section-heading"><div><p class="eyebrow">การเรียนรู้</p><h2>คลังบทเรียน</h2></div></div><div class="tool-grid">${teacherTools.filter(tool => tool.category === 'learning').map(toolCard).join('')}</div></section>`;
}

function toolsView() {
  return `<header class="page-heading"><p class="eyebrow">KNT TOOLBOX</p><h1>เครื่องมือทั้งหมด</h1><p class="subtitle">รวมทุกระบบจากเว็บไซต์เดิมไว้ในแอป KNT Classroom ครบทั้ง ${teacherTools.length} เครื่องมือ</p></header>
    <div class="filter-pills" data-tool-filters><button class="filter-pill active" data-tool-filter="all">ทั้งหมด</button><button class="filter-pill" data-tool-filter="attendance">เช็กชื่อ</button><button class="filter-pill" data-tool-filter="work">งาน/สแกน</button><button class="filter-pill" data-tool-filter="scores">คะแนน</button><button class="filter-pill" data-tool-filter="activity">กิจกรรม</button><button class="filter-pill" data-tool-filter="utility">อื่นๆ</button></div>
    <section class="tool-grid all-tools">${teacherTools.map(tool => `<div data-tool-category="${tool.category}">${toolCard(tool)}</div>`).join('')}</section>`;
}

function teacherProfileView() {
  return `<header class="page-heading"><p class="eyebrow">บัญชีครูผู้สอน</p><h1>โปรไฟล์และการตั้งค่า</h1></header>
    <div class="profile-layout"><section class="profile-banner card"><div class="profile-avatar teacher-avatar">ค</div><h2>ครูนิวตรอน</h2><p>ครูผู้สอนคณิตศาสตร์ · ห้องเรียนที่ดูแล 4 ห้อง</p></section>
      <div><div class="section-heading"><h2>การตั้งค่า</h2></div><section class="setting-list card">
        <button class="setting-item" type="button" data-toggle><span class="setting-item-icon"><svg><use href="#icon-bell"></use></svg></span><span class="setting-text"><b>การแจ้งเตือนครู</b><span>งานใหม่ ผลสอบ และการเข้าเรียน</span></span><i class="toggle on"></i></button>
        <button class="setting-item" type="button" data-role="student"><span class="setting-item-icon purple"><svg><use href="#icon-switch"></use></svg></span><span class="setting-text"><b>ดูในโหมดนักเรียน</b><span>สลับไปตรวจประสบการณ์ของนักเรียน</span></span><svg><use href="#icon-arrow"></use></svg></button>
        <button class="setting-item" type="button" data-route="tools"><span class="setting-item-icon mint"><svg><use href="#icon-grid"></use></svg></span><span class="setting-text"><b>เครื่องมือทั้งหมด</b><span>ระบบเดิมที่เชื่อมไว้ ${teacherTools.length} รายการ</span></span><svg><use href="#icon-arrow"></use></svg></button>
      </section></div></div>`;
}

function nativeToolBody(tool) {
  if (['subject-attendance', 'engineering-attendance'].includes(tool.id)) return `
    <section class="native-panel card">
      <div class="native-panel-heading"><div><p class="eyebrow">เช็กชื่อประจำวัน</p><h2>เลือกห้องและสถานะนักเรียน</h2></div><div class="native-heading-actions"><button class="outline-button" type="button" data-native-action="show-attendance-history">ประวัติ</button><span class="connection-pill" id="nativeConnection">กำลังเชื่อมข้อมูล…</span></div></div>
      <div class="native-form-grid attendance-controls">
        ${tool.id === 'subject-attendance' ? `<label><span>ครูผู้สอน</span><select id="nativeTeacher"><option value="">เลือกครูผู้สอน</option>${attendanceTeachers.map(teacher => `<option value="${teacher}">${teacher}</option>`).join('')}</select></label>` : ''}
        <label><span>รายวิชา</span><select id="nativeSubject"><option value="">กำลังโหลดวิชา…</option></select></label>
        <label><span>ห้องเรียน</span><select id="nativeRoom"><option value="">กำลังโหลดรายชื่อ…</option></select></label>
        <label><span>วันที่</span><input id="nativeDate" type="date"></label>
        <label class="native-password"><span>รหัสบันทึกของครู</span><input id="nativePassword" type="password" inputmode="numeric" placeholder="ใส่เมื่อต้องการบันทึกจริง"></label>
      </div>
      <div class="attendance-summary" id="attendanceSummary"></div>
      <div class="student-attendance-list" id="nativeRoster"><div class="native-empty">เลือกห้องเพื่อแสดงรายชื่อนักเรียน</div></div>
      <div class="native-sticky-actions"><button class="outline-button" type="button" data-native-action="mark-all-present"><svg><use href="#icon-check"></use></svg>มาครบทุกคน</button><button class="soft-button" type="button" data-native-action="save-attendance"><svg><use href="#icon-download"></use></svg>บันทึกการเช็กชื่อ</button></div>
      <section class="attendance-history card" id="attendanceHistory" hidden></section>
    </section>`;

  if (tool.id === 'submission-tracker') return `
    <section class="native-panel card work-tracker-panel">
      <div class="native-panel-heading"><div><p class="eyebrow">ติดตามงานในแอป</p><h2>ห้องเรียน งาน ข้อสอบ และ QR</h2></div><div class="native-heading-actions"><button class="outline-button" data-native-action="new-work-set">+ สร้างห้อง/วิชา</button><button class="outline-button" data-native-action="refresh-work"><svg><use href="#icon-download"></use></svg>โหลดจากคลาวด์</button></div></div>
      <div class="work-cloud-bar"><span class="connection-pill" id="workCloudStatus">กำลังเชื่อมข้อมูล…</span><label><span>รหัสบันทึก</span><input id="workCloudPassword" type="password" inputmode="numeric" autocomplete="current-password" placeholder="รหัสครู"></label><button class="soft-button" data-native-action="save-work-cloud"><svg><use href="#icon-download"></use></svg>บันทึกขึ้น Google Sheets</button></div>
      <div id="nativeWorkData" class="native-data-area"><div class="native-loader">กำลังโหลดข้อมูลส่งงานจาก Google Sheets…</div></div>
      <input id="workImportFile" type="file" accept=".xlsx,.xls,.csv,.json" hidden>
    </section>`;

  if (tool.id === 'plickers') return `
    <section class="camera-panel card"><div class="camera-stage"><video id="nativeCamera" playsinline muted></video><div class="camera-placeholder" id="cameraPlaceholder"><svg><use href="#icon-camera"></use></svg><b>กล้องสแกนในแอป</b><span>กดเริ่มกล้องเพื่อสแกนการ์ดนักเรียน</span></div><div class="scan-frame"></div></div><div class="camera-controls"><button class="soft-button" data-native-action="start-camera"><svg><use href="#icon-camera"></use></svg>เริ่มกล้อง</button><button class="outline-button" data-native-action="stop-camera">หยุดกล้อง</button></div><div class="scan-results"><h2>ผลการสแกน</h2><div id="nativeScanResults" class="native-empty">ยังไม่พบการ์ด</div></div></section>`;

  if (tool.id === 'grades') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">คะแนนจาก Google Sheets</p><h2>ชุดคะแนนทั้งหมด</h2></div><button class="outline-button" data-native-action="refresh-grades"><svg><use href="#icon-download"></use></svg>โหลดใหม่</button></div><div id="nativeGradeData" class="native-data-area"><div class="native-loader">กำลังโหลดชุดคะแนนจริง…</div></div></section>`;

  if (['exam', 'results'].includes(tool.id)) return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">รายงานออนไลน์</p><h2>${tool.id === 'exam' ? 'ผลสอบล่าสุดของนักเรียน' : 'ค้นหาคะแนนและงานค้าง'}</h2></div><button class="outline-button" data-native-action="refresh-exams"><svg><use href="#icon-download"></use></svg>โหลดใหม่</button></div><div class="native-search"><svg><use href="#icon-user"></use></svg><input id="nativeScoreSearch" type="search" placeholder="ค้นหาชื่อ ห้อง เลขที่ หรือชื่อข้อสอบ"></div><div id="nativeExamData" class="native-data-area"><div class="native-loader">กำลังโหลดคะแนนสอบจริง…</div></div></section>`;

  if (tool.id === 'class-fund') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">บัญชีห้องเรียน</p><h2>รายรับ รายจ่าย และยอดสะสม</h2></div><button class="outline-button" data-native-action="refresh-fund"><svg><use href="#icon-download"></use></svg>โหลดใหม่</button></div><div id="nativeFundData" class="native-data-area"><div class="native-loader">กำลังโหลดบัญชีห้องเรียน…</div></div></section>`;

  if (tool.id === 'qr-generator') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">สร้างภายในแอป</p><h2>QR Code อเนกประสงค์</h2></div></div><div class="qr-workspace"><div class="native-form-grid"><label><span>ข้อความหรือลิงก์</span><textarea id="nativeQrText" rows="5" placeholder="พิมพ์ข้อความหรือลิงก์ที่ต้องการ"></textarea></label><button class="soft-button" data-native-action="generate-qr">สร้าง QR Code</button></div><div class="qr-preview" id="nativeQrPreview"><svg><use href="#icon-qr"></use></svg><span>ตัวอย่าง QR จะแสดงตรงนี้</span></div></div></section>`;

  if (tool.id === 'qr-cards') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">รายชื่อนักเรียนจริง</p><h2>เตรียมการ์ด QR รายบุคคล</h2></div><button class="outline-button" data-native-action="print-cards">พิมพ์การ์ดที่เลือก</button></div><div class="native-form-grid"><label><span>ห้องเรียน</span><select id="nativeRoom"><option value="">กำลังโหลดรายชื่อ…</option></select></label></div><div id="nativeRoster" class="student-attendance-list"><div class="native-empty">เลือกห้องเพื่อแสดงรายชื่อ</div></div></section>`;

  if (tool.id === 'random-student') return `
    <section class="native-panel card random-panel"><div class="native-form-grid"><label><span>ห้องเรียน</span><select id="nativeRoom"><option value="">กำลังโหลดรายชื่อ…</option></select></label></div><div class="random-result" id="randomResult"><span>พร้อมสุ่ม</span><strong>?</strong><p>เลือกห้องแล้วกดปุ่มด้านล่าง</p></div><button class="soft-button big-native-button" data-native-action="random-student">สุ่มนักเรียน</button></section>`;

  if (tool.id === 'board-games') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">กิจกรรมในชั้นเรียน</p><h2>เลือกบอร์ดเกม</h2></div></div><div class="native-game-grid"><button data-native-action="select-game" data-game="สายลับ"><span>🕵️</span><b>สายลับ</b><small>สืบหาผู้แฝงตัว</small></button><button data-native-action="select-game" data-game="Werewolf"><span>🐺</span><b>Werewolf</b><small>เกมวิเคราะห์บทบาท</small></button><button data-native-action="select-game" data-game="Othello"><span>⚫</span><b>Othello</b><small>วางแผนพลิกกระดาน</small></button><button data-native-action="select-game" data-game="Connect 4"><span>🔴</span><b>Connect 4</b><small>เรียงสี่ให้ชนะ</small></button></div><div id="nativeGameStage" class="native-empty">เลือกเกมเพื่อเตรียมห้องกิจกรรม</div></section>`;

  if (tool.id === 'learning') return `
    <section class="native-panel card"><div class="native-panel-heading"><div><p class="eyebrow">คลังคณิตศาสตร์ ม.4</p><h2>บทเรียนและแบบฝึกหัด</h2></div></div><div class="native-learning-grid"><button data-native-action="open-lesson" data-lesson="เซต"><span>01</span><b>เซต</b><small>เนื้อหาและแบบฝึกหัด</small></button><button data-native-action="open-lesson" data-lesson="ตรรกศาสตร์"><span>02</span><b>ตรรกศาสตร์</b><small>ประพจน์และค่าความจริง</small></button><button data-native-action="open-lesson" data-lesson="จำนวนจริง"><span>03</span><b>จำนวนจริง</b><small>สมบัติและการคำนวณ</small></button><button data-native-action="open-lesson" data-lesson="พหุนาม"><span>04</span><b>พหุนาม</b><small>การดำเนินการและสมการ</small></button></div><div id="nativeLessonStage" class="native-empty">เลือกบทเรียนเพื่อดูรายละเอียด</div></section>`;

  return `<section class="native-panel card"><div class="native-empty"><span>✦</span><h2>${tool.title}</h2><p>เครื่องมือนี้ถูกนำเข้ามาเป็นโมดูลของ KNT Classroom แล้ว</p></div></section>`;
}

function toolView() {
  if (!currentTool) return toolsView();
  const backRoute = currentTool.category === 'attendance' ? 'attendance' : currentTool.category === 'work' ? 'teacher-work' : currentTool.category === 'scores' ? 'scores' : 'tools';
  return `<div class="native-tool-shell" data-native-tool="${currentTool.id}">
    <header class="native-tool-header card"><button class="icon-button" type="button" data-route="${backRoute}" aria-label="ย้อนกลับ"><svg style="transform:rotate(180deg)"><use href="#icon-arrow"></use></svg></button><span class="tool-icon ${currentTool.tone}"><svg><use href="#icon-${currentTool.icon}"></use></svg></span><div><p class="eyebrow">เครื่องมือใน KNT Classroom</p><h1>${currentTool.title}</h1><p>${currentTool.description}</p></div></header>
    ${nativeToolBody(currentTool)}
  </div>`;
}

const views = {
  home: homeView, courses: coursesView, exams: examsView, tasks: tasksView, profile: profileView,
  'teacher-home': teacherHomeView, attendance: attendanceView, 'teacher-work': teacherWorkView,
  scores: scoresView, tools: toolsView, 'teacher-profile': teacherProfileView, tool: toolView
};

const API = {
  attendance: 'https://script.google.com/macros/s/AKfycbxAyuZYgGo97MWZrWo53-HV1pHKqdjzGDMS7JjBatdloLavF1Txwtz13dlHybbBhMPkTw/exec',
  engineering: 'https://script.google.com/macros/s/AKfycbyrdVll59hQVArQGjBTPPfovFBZ0eG5mjTWn93R2GJ_Xwl3wBTjMttgjrNW6Nr-ZfbF/exec',
  work: 'https://script.google.com/macros/s/AKfycbyt0HfLY6ZvCc12rFdJI74KGim_wmLapTKNlvhe7U3O3LlNaaCq97iHkZQ-51mLLVKY/exec',
  grades: 'https://script.google.com/macros/s/AKfycbyrdVll59hQVArQGjBTPPfovFBZ0eG5mjTWn93R2GJ_Xwl3wBTjMttgjrNW6Nr-ZfbF/exec',
  exams: 'https://script.google.com/macros/s/AKfycbw3eNbBuhg-P-dLxBeZkYIggp0FW9GM1TdL1wVd1XeyxvwRTzw4BcMNiPBEyyWH1le-/exec',
  fund: 'https://script.google.com/macros/s/AKfycbz-F0PVMgQel2G7PIutsmvIW_D7UeSwXau39cGn4G8gnKHK2O_AXJnofNu5X5AMmdDafQ/exec'
};

const nativeState = { roster: null, attendance: {}, subjects: [], examRows: [], gradeSets: {}, gradeIndex: [], workDB: {sets:{}}, workSets: {}, activeWorkKey: '', workDirty: false, workScanHistory: [], qrScanner: null, cameraStream: null, qrLibrary: null };

const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
const todayISO = () => new Date().toLocaleDateString('en-CA');

async function getJSON(url, params = {}) {
  const query = new URLSearchParams(params);
  const response = await fetch(query.size ? `${url}?${query}` : url);
  if (!response.ok) throw new Error(`เชื่อมต่อไม่สำเร็จ (${response.status})`);
  return response.json();
}

async function ensureRoster() {
  if (!nativeState.roster && window.KNT_ROSTER_DATA) nativeState.roster = window.KNT_ROSTER_DATA;
  if (!nativeState.roster) nativeState.roster = await fetch('../ส่งงาน/roster.json').then(response => response.json());
  return nativeState.roster;
}

function populateRoomSelect(roster, allowedRooms = null) {
  const select = document.getElementById('nativeRoom');
  if (!select) return;
  const rooms = (allowedRooms || Object.keys(roster)).filter(room => roster[room]);
  select.innerHTML = '<option value="">เลือกห้องเรียน</option>' + rooms.map(room => `<option value="${escapeText(room)}">${escapeText(room)} · ${roster[room].length} คน</option>`).join('');
}

function renderAttendanceRoster() {
  const select = document.getElementById('nativeRoom');
  const container = document.getElementById('nativeRoster');
  if (!select || !container || !nativeState.roster) return;
  const room = select.value;
  const students = nativeState.roster[room] || [];
  if (!students.length) { container.innerHTML = '<div class="native-empty">เลือกห้องเพื่อแสดงรายชื่อนักเรียน</div>'; return; }
  if (currentTool?.id === 'qr-cards') {
    container.innerHTML = students.map(student => `<label class="native-student-row"><input type="checkbox" data-card-student="${escapeText(student.id || student.no)}" checked><span class="student-no">${student.no}</span><span><b>${escapeText(student.name)}</b><small>${escapeText(student.id || 'ไม่มีรหัสนักเรียน')}</small></span><span class="qr-mini"><svg><use href="#icon-qr"></use></svg></span></label>`).join('');
    return;
  }
  const roomState = nativeState.attendance[room] ||= {};
  students.forEach(student => { if (!roomState[student.no]) roomState[student.no] = 'มา'; });
  container.innerHTML = students.map(student => {
    const status = roomState[student.no];
    return `<div class="native-student-row"><span class="student-no">${student.no}</span><span><b>${escapeText(student.name)}</b><small>${escapeText(student.id || 'ไม่มีรหัสนักเรียน')}</small></span><div class="status-pills">${['มา','สาย','ลา','ขาด'].map(item => `<button type="button" class="${status === item ? `active ${item}` : ''}" data-attendance-no="${student.no}" data-status="${item}">${item}</button>`).join('')}</div></div>`;
  }).join('');
  renderAttendanceSummary();
}

function renderAttendanceSummary() {
  const room = document.getElementById('nativeRoom')?.value;
  const target = document.getElementById('attendanceSummary');
  if (!room || !target) return;
  const values = Object.values(nativeState.attendance[room] || {});
  target.innerHTML = ['มา','สาย','ลา','ขาด'].map(status => `<div><strong>${values.filter(value => value === status).length}</strong><span>${status}</span></div>`).join('');
}

async function initializeAttendance() {
  const connection = document.getElementById('nativeConnection');
  try {
    const [roster, setup] = await Promise.all([ensureRoster(), getJSON(API.attendance, {action:'listAll'}).catch(() => null)]);
    populateRoomSelect(roster, currentTool.id === 'engineering-attendance' ? engineeringRooms : null);
    const subjectSelect = document.getElementById('nativeSubject');
    if (currentTool.id === 'engineering-attendance') {
      subjectSelect.innerHTML = '<option value="engineering">เตรียมวิศวกรรมศาสตร์</option>';
    } else if (setup?.ok) {
      nativeState.subjects = setup.subjects || [];
      subjectSelect.innerHTML = '<option value="">เลือกช่องรายวิชา</option>' + nativeState.subjects.map(subject => `<option value="${escapeText(subject.id)}">${escapeText(subject.name)} · ${(subject.rooms || []).join(', ')}</option>`).join('');
    } else subjectSelect.innerHTML = '<option value="">ยังโหลดช่องรายวิชาไม่ได้</option>';
    document.getElementById('nativeDate').value = todayISO();
    connection.textContent = setup?.ok ? 'เชื่อม Google Sheets แล้ว' : 'ใช้รายชื่อในแอป';
    connection.classList.toggle('online', !!setup?.ok);
  } catch (error) {
    if (connection) connection.textContent = 'ออฟไลน์';
    showToast('โหลดรายชื่อนักเรียนไม่สำเร็จ');
  }
}

function dataCards(items, renderer) {
  if (!items.length) return '<div class="native-empty">ยังไม่พบข้อมูล</div>';
  return `<div class="native-record-grid">${items.map(renderer).join('')}</div>`;
}

async function loadWorkData() {
  const target = document.getElementById('nativeWorkData');
  if (!target) return;
  target.innerHTML = '<div class="native-loader">กำลังโหลดข้อมูลส่งงานจาก Google Sheets…</div>';
  try {
    const response = await getJSON(API.work);
    if (!response?.ok || !response.data) throw new Error(response?.error || 'รูปแบบข้อมูลไม่ถูกต้อง');
    nativeState.workDB = normalizeWorkDB(response.data);
    nativeState.workSets = nativeState.workDB.sets;
    nativeState.activeWorkKey = '';
    nativeState.workDirty = false;
    cacheWorkDraft();
    setWorkCloudStatus('โหลดจาก Google Sheets แล้ว', true);
    renderWorkSetList();
  } catch (error) {
    const cached = readWorkDraft();
    if (cached) {
      nativeState.workDB = normalizeWorkDB(cached);
      nativeState.workSets = nativeState.workDB.sets;
      setWorkCloudStatus('ออฟไลน · ใช้ร่างในเครื่อง');
      renderWorkSetList();
    } else target.innerHTML = `<div class="native-error">โหลดข้อมูลไม่ได้<br><small>${escapeText(error.message)}</small></div>`;
  }
}

const WORK_DRAFT_KEY = 'knt-classroom-work-draft';
const uid = prefix => `${prefix}${Math.random().toString(36).slice(2,9)}`;

function normalizeWorkDB(value) {
  const db = value && typeof value === 'object' ? structuredClone(value) : {sets:{}};
  if (!db.sets || typeof db.sets !== 'object') db.sets = {};
  Object.entries(db.sets).forEach(([key, set]) => {
    if (!set || typeof set !== 'object') { delete db.sets[key]; return; }
    set.students = Array.isArray(set.students) ? set.students : [];
    set.works = Array.isArray(set.works) ? set.works : [];
    set.data = set.data && typeof set.data === 'object' ? set.data : {};
  });
  return db;
}

function cacheWorkDraft() {
  try { localStorage.setItem(WORK_DRAFT_KEY, JSON.stringify(nativeState.workDB)); } catch {}
}

function readWorkDraft() {
  try { return JSON.parse(localStorage.getItem(WORK_DRAFT_KEY)); } catch { return null; }
}

function setWorkCloudStatus(message, online = false) {
  const target = document.getElementById('workCloudStatus');
  if (!target) return;
  target.textContent = message;
  target.classList.toggle('online', online);
}

function markWorkDirty(message = 'บันทึกร่างในเครื่องแล้ว') {
  nativeState.workDirty = true;
  cacheWorkDraft();
  setWorkCloudStatus(`${message} · ยังไม่ขึ้นคลาวด์`);
}

function activeWorkSet() {
  return nativeState.workSets[nativeState.activeWorkKey] || null;
}

function workValue(set, studentId, workId) {
  return set.data?.[studentId]?.[workId];
}

function setWorkValue(set, studentId, workId, value) {
  set.data[studentId] ||= {};
  set.data[studentId][workId] = value;
}

function renderWorkSetList() {
  const target = document.getElementById('nativeWorkData');
  if (!target) return;
  const entries = Object.entries(nativeState.workSets).filter(([,set]) => set?.room);
  target.innerHTML = entries.length ? `<div class="native-record-grid">${entries.map(([key,set]) => {
    const sendWorks = set.works.filter(work => work.type !== 'สอบ');
    const total = set.students.length * sendWorks.length;
    let sent = 0;
    set.students.forEach(student => sendWorks.forEach(work => { if (workValue(set, student.id, work.id) === true) sent++; }));
    const percent = total ? Math.round(sent / total * 100) : 0;
    return `<article class="work-set-card"><span class="tag mint">${escapeText(set.room)}</span><h3>${escapeText(set.subject)}</h3><p>${set.students.length} นักเรียน · ${set.works.length} งาน</p><div class="work-progress"><i style="width:${percent}%"></i></div><small>ส่งงานแล้ว ${percent}%</small><button class="outline-button" data-native-action="select-work-set" data-set-key="${escapeText(key)}">เปิดตาราง</button></article>`;
  }).join('')}</div>` : '<div class="native-empty"><span>✦</span><h2>ยังไม่มีห้อง/วิชา</h2><p>กด “สร้างห้อง/วิชา” เพื่อเริ่มต้น</p></div>';
}

function renderWorkEditor() {
  const set = activeWorkSet();
  const target = document.getElementById('nativeWorkData');
  if (!set || !target) return;
  const headers = set.works.map(work => `<th><span>${escapeText(work.name)}</span><small>${work.type === 'สอบ' ? `สอบ / ${Number(work.max || 0)}` : 'งานส่ง'}</small></th>`).join('');
  const rows = set.students.map((student, studentIndex) => {
    let pending = 0;
    const cells = set.works.map(work => {
      const value = workValue(set, student.id, work.id);
      if (work.type === 'สอบ') return `<td><input class="work-score-input" type="number" min="0" max="${Number(work.max || 999)}" value="${value ?? ''}" data-work-score data-student-id="${escapeText(student.id)}" data-work-id="${escapeText(work.id)}" aria-label="คะแนน ${escapeText(student.name)}"></td>`;
      if (value !== true) pending++;
      return `<td><button class="work-status-cell ${value === true ? 'sent' : 'missing'}" data-native-action="toggle-work-status" data-student-id="${escapeText(student.id)}" data-work-id="${escapeText(work.id)}">${value === true ? '✓ ส่ง' : '—'}</button></td>`;
    }).join('');
    return `<tr><td class="work-student-name"><b>${escapeText(student.name || 'ยังไม่มีชื่อ')}</b><small>เลขที่ ${escapeText(student.no || '-')}</small><span class="row-edit-actions"><button data-native-action="edit-work-student" data-student-index="${studentIndex}" aria-label="แก้ไขนักเรียน">✎</button><button data-native-action="delete-work-student" data-student-index="${studentIndex}" aria-label="ลบนักเรียน">×</button></span></td>${cells}<td class="pending-count ${pending ? 'has-pending' : ''}">${pending}</td></tr>`;
  }).join('');
  target.innerHTML = `
    <div class="native-detail-bar work-detail-bar"><button class="outline-button" data-native-action="back-work-sets">← ห้องทั้งหมด</button><div><b>${escapeText(set.room)} · ${escapeText(set.subject)}</b><span>${set.students.length} นักเรียน · ${set.works.length} งาน</span></div><div class="native-heading-actions"><button class="outline-button" data-native-action="edit-work-set">แก้ชื่อ</button><button class="outline-button" data-native-action="show-work-report">รายงานงานค้าง</button><button class="outline-button" data-native-action="open-work-scanner"><svg><use href="#icon-qr"></use></svg>สแกน QR</button><button class="outline-button" data-native-action="export-work-excel">ส่งออก Excel</button><button class="danger-button" data-native-action="delete-work-set">ลบห้อง/วิชา</button></div></div>
    <div class="work-manager-grid">
      <section class="work-manager-box"><h3>จัดการงาน/ข้อสอบ</h3><div class="work-inline-form"><input id="newWorkName" placeholder="ชื่องานหรือข้อสอบ"><select id="newWorkType"><option value="ส่ง">งานส่ง</option><option value="สอบ">ข้อสอบ</option></select><input id="newWorkMax" type="number" min="0" value="10" title="คะแนนเต็ม"><button class="soft-button" data-native-action="add-work-item">+เพิ่ม</button></div><div class="work-chip-list">${set.works.map((work,index) => `<span>${escapeText(work.name)} <small>${work.type === 'สอบ' ? `/${work.max || 0}` : 'ส่ง'}</small><button data-native-action="edit-work-item" data-work-index="${index}" aria-label="แก้ไขงาน">✎</button><button data-native-action="delete-work-item" data-work-index="${index}" aria-label="ลบงาน">×</button></span>`).join('') || '<em>ยังไม่มีงาน</em>'}</div></section>
      <section class="work-manager-box"><h3>จัดการนักเรียน</h3><div class="work-inline-form"><input id="newStudentNo" inputmode="numeric" placeholder="เลขที่"><input id="newStudentName" placeholder="ชื่อ-สกุล"><button class="soft-button" data-native-action="add-work-student">+เพิ่ม</button></div><div class="native-heading-actions"><button class="outline-button" data-native-action="use-room-roster">ใช้ทะเบียน ${escapeText(set.room)}</button><button class="outline-button" data-native-action="import-work-students">นำเข้า Excel/CSV</button></div></section>
    </div>
    <section id="workPendingReport" class="work-pending-report" hidden></section>
    <div class="native-table-wrap work-table-wrap"><table class="native-table work-table"><thead><tr><th>นักเรียน</th>${headers}<th>ค้าง</th></tr></thead><tbody>${rows || `<tr><td colspan="${set.works.length + 2}"><div class="native-empty">ยังไม่มีนักเรียน</div></td></tr>`}</tbody></table></div>
    <section id="workScannerPanel" class="work-scanner-panel" hidden></section>`;
}

async function loadGradeData() {
  const target = document.getElementById('nativeGradeData');
  if (!target) return;
  target.innerHTML = '<div class="native-loader">กำลังโหลดชุดคะแนนจริง…</div>';
  try {
    const response = await getJSON(API.grades, {action:'grades_get'});
    nativeState.gradeIndex = response.list || [];
    target.innerHTML = dataCards(nativeState.gradeIndex, item => {
      const parts = String(item.key).split('_');
      return `<article><span class="tag blue">${escapeText(parts.slice(2).join('_') || 'ผลการเรียน')}</span><h3>ภาคเรียน ${escapeText(parts[1] || '-')} / ${escapeText(parts[0] || '-')}</h3><p>อัปเดตโดย ${escapeText(item.updatedBy || 'ครูผู้สอน')} · ${escapeText(item.lastUpdated || '')}</p><button class="outline-button" data-native-action="view-grade-set" data-grade-key="${escapeText(item.key)}">เปิดตารางผลการเรียน</button></article>`;
    });
  } catch (error) { target.innerHTML = `<div class="native-error">เชื่อมระบบคะแนนไม่ได้<br><small>${escapeText(error.message)}</small></div>`; }
}

function renderExamRows(rows) {
  const target = document.getElementById('nativeExamData');
  if (!target) return;
  target.innerHTML = rows.length ? `<div class="native-table-wrap"><table class="native-table"><thead><tr><th>นักเรียน</th><th>ห้อง</th><th>ข้อสอบ</th><th>คะแนน</th></tr></thead><tbody>${rows.slice(0,100).map(row => `<tr><td><b>${escapeText(row.name)}</b><small>เลขที่ ${escapeText(row.no)}</small></td><td>${escapeText(row.room)}</td><td>${escapeText(row.subject)}</td><td><strong>${escapeText(row.score)}/${escapeText(row.total)}</strong></td></tr>`).join('')}</tbody></table></div>` : '<div class="native-empty">ไม่พบผลสอบ</div>';
}

async function loadExamData() {
  const target = document.getElementById('nativeExamData');
  if (!target) return;
  target.innerHTML = '<div class="native-loader">กำลังโหลดคะแนนสอบจริง…</div>';
  try {
    const response = await getJSON(API.exams, {action:'exam_get'});
    nativeState.examRows = (response.list || []).reverse();
    renderExamRows(nativeState.examRows);
  } catch (error) { target.innerHTML = `<div class="native-error">เชื่อมระบบข้อสอบไม่ได้<br><small>${escapeText(error.message)}</small></div>`; }
}

async function loadFundData() {
  const target = document.getElementById('nativeFundData');
  if (!target) return;
  try {
    const response = await getJSON(API.fund, {action:'get_data'});
    const data = response.data || response;
    const transactions = data.transactions || data.expenses || [];
    target.innerHTML = `<div class="fund-summary"><div><span>ยอดคงเหลือ</span><strong>${Number(data.balance || 0).toLocaleString('th-TH')} บาท</strong></div><div><span>รายการทั้งหมด</span><strong>${transactions.length}</strong></div></div>${dataCards(transactions.slice(0,12), item => `<article><span class="tag ${Number(item.amount) < 0 ? 'coral' : 'mint'}">${Number(item.amount || 0).toLocaleString('th-TH')} บาท</span><h3>${escapeText(item.title || item.description || 'รายการบัญชี')}</h3><p>${escapeText(item.date || '')}</p></article>`)}`;
  } catch (error) { target.innerHTML = `<div class="native-error">โหลดบัญชีไม่ได้<br><small>${escapeText(error.message)}</small></div>`; }
}

async function initNativeTool() {
  if (!currentTool || !document.querySelector('.native-tool-shell')) return;
  if (['subject-attendance','engineering-attendance'].includes(currentTool.id)) await initializeAttendance();
  if (['qr-cards','random-student'].includes(currentTool.id)) { try { const roster = await ensureRoster(); populateRoomSelect(roster); } catch { showToast('โหลดรายชื่อไม่สำเร็จ'); } }
  if (currentTool.id === 'submission-tracker') { await ensureRoster().catch(() => null); await loadWorkData(); }
  if (currentTool.id === 'grades') await loadGradeData();
  if (['exam','results'].includes(currentTool.id)) await loadExamData();
  if (currentTool.id === 'class-fund') await loadFundData();
}

let toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function routeTo(route, updateHash = true) {
  if (location.hash === '#tool' && route !== 'tool') stopNativeCamera();
  const fallback = currentRole === 'teacher' ? 'teacher-home' : 'home';
  const safeRoute = views[route] ? route : fallback;
  const view = document.getElementById('view');
  view.style.animation = 'none';
  view.offsetHeight;
  view.innerHTML = views[safeRoute]();
  view.style.animation = '';
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.route === safeRoute));
  const allNavigation = [...studentNavItems, ...teacherNavItems];
  const pageLabel = allNavigation.find(item => item.id === safeRoute)?.label || currentTool?.title || 'KNT Classroom';
  document.title = `${pageLabel} · KNT Classroom`;
  if (updateHash && location.hash !== `#${safeRoute}`) history.pushState(null, '', `#${safeRoute}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (safeRoute === 'tool') initNativeTool();
}

function syncRoleUI() {
  const isTeacher = currentRole === 'teacher';
  document.body.dataset.role = currentRole;
  document.getElementById('roleLabel').textContent = isTeacher ? 'ครู' : 'นักเรียน';
  const avatar = document.querySelector('.mini-avatar');
  avatar.textContent = isTeacher ? 'ค' : 'ธ';
  avatar.dataset.route = isTeacher ? 'teacher-profile' : 'profile';
  avatar.setAttribute('aria-label', isTeacher ? 'เปิดโปรไฟล์ครู' : 'เปิดโปรไฟล์นักเรียน');
  document.querySelectorAll('.brand, .mobile-brand').forEach(brand => brand.dataset.route = isTeacher ? 'teacher-home' : 'home');
  document.querySelectorAll('[data-role]').forEach(option => option.classList.toggle('selected', option.dataset.role === currentRole));
}

function setRole(role) {
  currentRole = role === 'teacher' ? 'teacher' : 'student';
  localStorage.setItem('knt-classroom-role', currentRole);
  renderNavigation();
  syncRoleUI();
  const popover = document.getElementById('rolePopover');
  popover.hidden = true;
  document.getElementById('roleButton').setAttribute('aria-expanded', 'false');
  routeTo(currentRole === 'teacher' ? 'teacher-home' : 'home');
  showToast(currentRole === 'teacher' ? 'เข้าสู่โหมดครูแล้ว' : 'เข้าสู่โหมดนักเรียนแล้ว');
}

async function saveNativeAttendance() {
  const room = document.getElementById('nativeRoom')?.value;
  const date = document.getElementById('nativeDate')?.value;
  const password = document.getElementById('nativePassword')?.value;
  const subjectId = document.getElementById('nativeSubject')?.value;
  const teacher = document.getElementById('nativeTeacher')?.value || '';
  if (!room || !date) { showToast('กรุณาเลือกห้องและวันที่'); return; }
  if (currentTool.id === 'subject-attendance' && !teacher) { showToast('กรุณาเลือกครูผู้สอน'); return; }
  const data = nativeState.attendance[room] || {};
  localStorage.setItem(`knt-attendance-${currentTool.id}-${date}-${room}-${subjectId || 'general'}`, JSON.stringify({teacher, subjectId, room, date, data}));
  if (!password && currentTool.id === 'subject-attendance') { showToast('บันทึกร่างในเครื่องแล้ว · ใส่รหัสครูเพื่อส่งขึ้น Google Sheets'); return; }
  const button = document.querySelector('[data-native-action="save-attendance"]');
  button.disabled = true; button.textContent = 'กำลังบันทึก…';
  try {
    if (currentTool.id === 'subject-attendance') {
      if (!subjectId) throw new Error('กรุณาเลือกรายวิชา');
      const roomKey = room.replace('ม.','').replace('/','_');
      const response = await getJSON(API.attendance, {action:'save', id:subjectId, password, teacher, date, room:roomKey, data:JSON.stringify(data)});
      if (!response.ok) throw new Error(response.error || 'บันทึกไม่สำเร็จ');
    } else {
      if (!engineeringRooms.includes(room)) throw new Error('เช็กชื่อเตรียมวิศวะได้เฉพาะ ม.4/1, ม.5/1 และ ม.6/1');
      const roster = nativeState.roster?.[room] || [];
      const legacyStatus = { 'มา':'present', 'สาย':'late', 'ลา':'leave', 'ขาด':'absent' };
      const engineeringData = Object.fromEntries(roster.map((student, index) => [index, legacyStatus[data[student.no]] || 'present']));
      const roomKey = room.replace('ม.','').replace('/','_');
      const response = await getJSON(API.engineering, {action:'save', room:roomKey, date, data:encodeURIComponent(JSON.stringify(engineeringData))});
      if (!response.success) throw new Error(response.error || 'บันทึกไม่สำเร็จ');
    }
    showToast('บันทึกการเช็กชื่อขึ้น Google Sheets แล้ว');
  } catch (error) { showToast(error.message); }
  finally { button.disabled = false; button.innerHTML = '<svg><use href="#icon-download"></use></svg>บันทึกการเช็กชื่อ'; }
}

function attendanceRecordStats(data = {}) {
  return ['มา', 'สาย', 'ลา', 'ขาด'].map(status => ({ status, count: Object.values(data).filter(value => value === status).length }));
}

async function renderAttendanceHistory() {
  const target = document.getElementById('attendanceHistory');
  if (!target || !currentTool) return;
  const prefix = `knt-attendance-${currentTool.id}-`;
  const localRecords = Object.keys(localStorage).filter(key => key.startsWith(prefix)).map(key => {
    try { return { key, ...JSON.parse(localStorage.getItem(key)) }; } catch { return null; }
  }).filter(Boolean).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  let records = localRecords;
  let sourceNote = 'บันทึกในอุปกรณ์นี้';
  if (currentTool.id === 'engineering-attendance') {
    target.innerHTML = '<div class="native-loader">กำลังโหลดประวัติเตรียมวิศวะจาก Google Sheets…</div>';
    const thaiStatus = { present:'มา', late:'สาย', leave:'ลา', absent:'ขาด', 'มา':'มา', 'สาย':'สาย', 'ลา':'ลา', 'ขาด':'ขาด' };
    const cloudResults = await Promise.all(engineeringRooms.map(async room => {
      try {
        const roomKey = room.replace('ม.','').replace('/','_');
        const response = await getJSON(API.engineering, { action:'getAll', room:roomKey });
        return Object.entries(response?.data || {}).map(([date, data]) => ({
          key: `cloud-${room}-${date}`, room, date, subjectId:'engineering', source:'Google Sheets',
          data: Object.fromEntries(Object.entries(data || {}).map(([no, status]) => [no, thaiStatus[status] || status]))
        }));
      } catch { return []; }
    }));
    const merged = new Map();
    cloudResults.flat().forEach(record => merged.set(`${record.date}-${record.room}`, record));
    localRecords.forEach(record => merged.set(`${record.date}-${record.room}`, record));
    records = [...merged.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    sourceNote = 'Google Sheets และบันทึกในอุปกรณ์นี้';
  }
  if (!records.length) {
    target.innerHTML = '<div class="native-empty"><span>📅</span><h2>ยังไม่มีประวัติในอุปกรณ์นี้</h2><p>เมื่อบันทึกเช็กชื่อแล้ว รายการจะปรากฏที่นี่</p></div>';
    return;
  }
  target.innerHTML = `<div class="native-panel-heading"><div><p class="eyebrow">${sourceNote}</p><h2>ประวัติการเช็กชื่อ</h2></div><button class="outline-button" data-native-action="hide-attendance-history">ปิด</button></div><div class="attendance-history-list">${records.map(record => {
    const stats = attendanceRecordStats(record.data);
    const detail = currentTool.id === 'subject-attendance' ? `${escapeText(record.teacher || 'ไม่ระบุครู')} · ${escapeText(record.subjectId || 'ไม่ระบุวิชา')}` : 'เตรียมวิศวกรรมศาสตร์';
    return `<article><div><b>${escapeText(record.date)}</b><span>${escapeText(record.room)} · ${detail}${record.source ? ` · ${record.source}` : ''}</span></div><p>${stats.map(item => `${item.status} ${item.count}`).join(' · ')}</p></article>`;
  }).join('')}</div>`;
}

async function startNativeCamera() {
  const video = document.getElementById('nativeCamera');
  if (!video || !navigator.mediaDevices?.getUserMedia) { showToast('อุปกรณ์นี้ไม่รองรับกล้อง หรือจำเป็นต้องเปิดผ่าน HTTPS'); return; }
  try {
    nativeState.cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    video.srcObject = nativeState.cameraStream; await video.play();
    document.getElementById('cameraPlaceholder').hidden = true;
    showToast('เปิดกล้องแล้ว');
  } catch (error) { showToast('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง'); }
}

function stopNativeCamera() {
  closeWorkScanner();
  nativeState.cameraStream?.getTracks().forEach(track => track.stop());
  nativeState.cameraStream = null;
  const video = document.getElementById('nativeCamera');
  if (video) video.srcObject = null;
  const placeholder = document.getElementById('cameraPlaceholder');
  if (placeholder) placeholder.hidden = false;
}

async function generateNativeQR() {
  const value = document.getElementById('nativeQrText')?.value.trim();
  if (!value) { showToast('กรุณาพิมพ์ข้อความหรือลิงก์'); return; }
  const preview = document.getElementById('nativeQrPreview');
  preview.innerHTML = '<div class="native-loader">กำลังสร้าง QR…</div>';
  try {
    if (!window.QRCodeStyling) await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js'; script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
    });
    preview.innerHTML = '';
    const qr = new QRCodeStyling({width:240,height:240,data:value,dotsOptions:{color:'#4a67d6',type:'rounded'},backgroundOptions:{color:'#ffffff'},cornersSquareOptions:{color:'#8068dc',type:'extra-rounded'}});
    qr.append(preview);
    const download = document.createElement('button'); download.className = 'outline-button'; download.textContent = 'ดาวน์โหลด PNG'; download.onclick = () => qr.download({name:'knt-qrcode',extension:'png'}); preview.appendChild(download);
  } catch { preview.innerHTML = '<div class="native-error">สร้าง QR ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต</div>'; }
}

async function showGradeSet(key) {
  const target = document.getElementById('nativeGradeData');
  if (!target) return;
  target.innerHTML = '<div class="native-loader">กำลังโหลดผลการเรียนรายบุคคล…</div>';
  try {
    if (!nativeState.gradeSets[key]) {
      const response = await getJSON(API.grades, {action:'grades_get', key});
      nativeState.gradeSets[key] = response.data;
    }
    const set = nativeState.gradeSets[key] || {}, subjects = set.subjects || [], students = set.students || [];
    target.innerHTML = `<div class="native-detail-bar"><button class="outline-button" data-native-action="refresh-grades">← กลับชุดคะแนน</button><div><b>${escapeText(key)}</b><span>${students.length} นักเรียน · ${subjects.length} รายวิชา</span></div></div><div class="native-table-wrap"><table class="native-table"><thead><tr><th>นักเรียน</th>${subjects.map(subject => `<th>${escapeText(subject.name)}<small>${subject.credit} หน่วยกิต</small></th>`).join('')}<th>GPA</th></tr></thead><tbody>${students.map(student => `<tr><td><b>${escapeText(student.name)}</b><small>เลขที่ ${escapeText(student.no)}</small></td>${subjects.map(subject => `<td>${escapeText(student.grades?.[subject.code] ?? '-')}</td>`).join('')}<td><strong>${escapeText(student.gpa || '-')}</strong></td></tr>`).join('')}</tbody></table></div>`;
  } catch (error) { target.innerHTML = `<div class="native-error">โหลดผลการเรียนไม่ได้<br><small>${escapeText(error.message)}</small></div>`; }
}

function showWorkSet(key) {
  if (!nativeState.workSets[key]) return;
  nativeState.activeWorkKey = key;
  renderWorkEditor();
}

function createWorkSet() {
  const room = prompt('ห้องเรียน เช่น ม.4/1');
  if (!room?.trim()) return;
  const subject = prompt('ชื่อรายวิชา');
  if (!subject?.trim()) return;
  const key = `${room.trim()}|${subject.trim()}`;
  if (nativeState.workSets[key]) { showToast('มีห้อง/วิชานี้แล้ว'); return; }
  const roster = nativeState.roster?.[room.trim()] || [];
  nativeState.workSets[key] = {room:room.trim(), subject:subject.trim(), works:[], students:roster.map(student => ({id:uid('s'), no:student.no, name:student.name})), data:{}};
  nativeState.activeWorkKey = key;
  markWorkDirty('สร้างห้อง/วิชาแล้ว');
  renderWorkEditor();
}

function deleteWorkSet() {
  const set = activeWorkSet();
  if (!set || !confirm(`ลบ “${set.room} · ${set.subject}” รวมคะแนนและสถานะทั้งหมด?`)) return;
  delete nativeState.workSets[nativeState.activeWorkKey];
  nativeState.activeWorkKey = '';
  markWorkDirty('ลบห้อง/วิชาแล้ว');
  renderWorkSetList();
}

function editWorkSet() {
  const set = activeWorkSet();
  if (!set) return;
  const room = prompt('แก้ไขห้องเรียน', set.room);
  if (!room?.trim()) return;
  const subject = prompt('แก้ไขชื่อวิชา', set.subject);
  if (!subject?.trim()) return;
  const oldKey = nativeState.activeWorkKey;
  const newKey = `${room.trim()}|${subject.trim()}`;
  if (newKey !== oldKey && nativeState.workSets[newKey]) { showToast('มีห้อง/วิชานี้แล้ว'); return; }
  set.room = room.trim(); set.subject = subject.trim();
  if (newKey !== oldKey) { delete nativeState.workSets[oldKey]; nativeState.workSets[newKey] = set; nativeState.activeWorkKey = newKey; }
  markWorkDirty('แก้ไขห้อง/วิชาแล้ว'); renderWorkEditor();
}

function addWorkItem() {
  const set = activeWorkSet();
  const name = document.getElementById('newWorkName')?.value.trim();
  const type = document.getElementById('newWorkType')?.value || 'ส่ง';
  const max = Number(document.getElementById('newWorkMax')?.value || 0);
  if (!set || !name) { showToast('กรุณาใส่ชื่องานหรือข้อสอบ'); return; }
  const work = {id:uid('w'), name, type};
  if (type === 'สอบ') work.max = max;
  set.works.push(work);
  markWorkDirty('เพิ่มงานแล้ว');
  renderWorkEditor();
}

function deleteWorkItem(index) {
  const set = activeWorkSet();
  const work = set?.works[index];
  if (!work || !confirm(`ลบงาน “${work.name}” และคะแนน/สถานะของงานนี้?`)) return;
  Object.values(set.data).forEach(values => { if (values) delete values[work.id]; });
  set.works.splice(index, 1);
  markWorkDirty('ลบงานแล้ว');
  renderWorkEditor();
}

function editWorkItem(index) {
  const set = activeWorkSet(); const work = set?.works[index];
  if (!work) return;
  const name = prompt('แก้ไขชื่องาน/ข้อสอบ', work.name);
  if (!name?.trim()) return;
  work.name = name.trim();
  if (work.type === 'สอบ') {
    const max = prompt('คะแนนเต็ม', String(work.max || 0));
    if (max !== null) work.max = Math.max(0, Number(max) || 0);
  }
  markWorkDirty('แก้ไขงานแล้ว'); renderWorkEditor();
}

function addWorkStudent() {
  const set = activeWorkSet();
  const no = document.getElementById('newStudentNo')?.value.trim();
  const name = document.getElementById('newStudentName')?.value.trim();
  if (!set || !name) { showToast('กรุณาใส่ชื่อนักเรียน'); return; }
  set.students.push({id:uid('s'), no:no || set.students.length + 1, name});
  markWorkDirty('เพิ่มนักเรียนแล้ว');
  renderWorkEditor();
}

function deleteWorkStudent(index) {
  const set = activeWorkSet();
  const student = set?.students[index];
  if (!student || !confirm(`ลบ ${student.name} ออกจากห้องนี้?`)) return;
  delete set.data[student.id];
  set.students.splice(index, 1);
  markWorkDirty('ลบนักเรียนแล้ว');
  renderWorkEditor();
}

function editWorkStudent(index) {
  const set = activeWorkSet(); const student = set?.students[index];
  if (!student) return;
  const no = prompt('แก้ไขเลขที่', String(student.no || ''));
  if (no === null) return;
  const name = prompt('แก้ไขชื่อ-สกุล', student.name);
  if (!name?.trim()) return;
  student.no = no.trim(); student.name = name.trim();
  markWorkDirty('แก้ไขนักเรียนแล้ว'); renderWorkEditor();
}

function showWorkPendingReport() {
  const set = activeWorkSet(); const target = document.getElementById('workPendingReport');
  if (!set || !target) return;
  if (!target.hidden) { target.hidden = true; target.innerHTML = ''; return; }
  const sendWorks = set.works.filter(work => work.type !== 'สอบ');
  const pendingRows = set.students.map(student => ({student, missing:sendWorks.filter(work => workValue(set, student.id, work.id) !== true)})).filter(row => row.missing.length);
  const totalCells = set.students.length * sendWorks.length;
  const pendingCells = pendingRows.reduce((sum,row) => sum + row.missing.length, 0);
  const sentPercent = totalCells ? Math.round((totalCells - pendingCells) / totalCells * 100) : 0;
  target.hidden = false;
  target.innerHTML = `<div class="work-report-summary"><div><strong>${sentPercent}%</strong><span>อัตราส่ง</span></div><div><strong>${pendingRows.length}</strong><span>นักเรียนมีงานค้าง</span></div><div><strong>${pendingCells}</strong><span>งานค้างทั้งหมด</span></div></div><div class="pending-student-list">${pendingRows.map(row => `<article><span class="student-no">${escapeText(row.student.no)}</span><div><b>${escapeText(row.student.name)}</b><small>${row.missing.map(work => escapeText(work.name)).join(' · ')}</small></div></article>`).join('') || '<div class="native-empty">ส่งงานครบทุกคน</div>'}</div>`;
  target.scrollIntoView({behavior:'smooth',block:'nearest'});
}

async function useRoomRoster() {
  const set = activeWorkSet();
  if (!set) return;
  const roster = await ensureRoster();
  const students = roster[set.room] || [];
  if (!students.length) { showToast(`ไม่พบทะเบียนห้อง ${set.room}`); return; }
  if (set.students.length && !confirm(`แทนรายชื่อเดิม ${set.students.length} คน ด้วยทะเบียน ${students.length} คน?`)) return;
  set.students = students.map(student => ({id:uid('s'), no:student.no, name:student.name}));
  set.data = {};
  markWorkDirty('นำเข้าทะเบียนแล้ว');
  renderWorkEditor();
}

async function saveWorkCloud(button) {
  const password = document.getElementById('workCloudPassword')?.value.trim();
  if (!password) { showToast('กรุณาใส่รหัสบันทึกของครู'); return; }
  if (!confirm('บันทึกข้อมูลร่างนี้ทับข้อมูลติดตามงานบน Google Sheets?')) return;
  button.disabled = true;
  button.textContent = 'กำลังบันทึก…';
  setWorkCloudStatus('กำลังบันทึกขึ้นคลาวด์…');
  try {
    const response = await fetch(API.work, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({password, data:nativeState.workDB})});
    const result = await response.json();
    if (!result?.ok) throw new Error(result?.error || 'บันทึกไม่สำเร็จ');
    nativeState.workDirty = false;
    cacheWorkDraft();
    document.getElementById('workCloudPassword').value = '';
    setWorkCloudStatus(`บันทึกแล้ว ${new Date().toLocaleTimeString('th-TH')}`, true);
    showToast('บันทึกขึ้น Google Sheets แล้ว');
  } catch (error) { setWorkCloudStatus(`บันทึกไม่สำเร็จ · ${error.message}`); showToast(error.message); }
  finally { button.disabled = false; button.innerHTML = '<svg><use href="#icon-download"></use></svg>บันทึกขึ้น Google Sheets'; }
}

async function ensureSheetJS() {
  if (window.XLSX) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = resolve; script.onerror = () => reject(new Error('โหลดระบบ Excel ไม่สำเร็จ'));
    document.head.appendChild(script);
  });
}

function rowsToWorkStudents(rows) {
  const students = [];
  rows.forEach(row => {
    const cells = (row || []).map(value => String(value ?? '').trim()).filter(Boolean);
    if (!cells.length) return;
    const joined = cells.join(' ');
    if (/(เลขที่|ลำดับ|name|ชื่อ-สกุล)/i.test(joined) && !/(นาย|นาง|เด็ก|ด\.ช|ด\.ญ)/.test(joined)) return;
    let no = '';
    const nameParts = [];
    cells.forEach(cell => { if (!no && /^\d{1,3}$/.test(cell)) no = cell; else nameParts.push(cell); });
    const name = nameParts.join(' ').replace(/\s+/g,' ').trim();
    if (name) students.push({id:uid('s'), no:no || students.length + 1, name});
  });
  return students;
}

async function importWorkStudents(file) {
  const set = activeWorkSet();
  if (!set || !file) return;
  try {
    let students = [];
    if (file.name.toLowerCase().endsWith('.json')) {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.students;
      students = (list || []).map((student,index) => ({id:uid('s'), no:student.no || index + 1, name:String(student.name || '').trim()})).filter(student => student.name);
    } else if (/\.xlsx?$/.test(file.name.toLowerCase())) {
      await ensureSheetJS();
      const workbook = XLSX.read(await file.arrayBuffer(), {type:'array'});
      students = rowsToWorkStudents(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header:1, defval:''}));
    } else {
      const textValue = (await file.text()).replace(/^\uFEFF/,'');
      const rows = textValue.split(/\r?\n/).map(line => line.split(/,|\t/));
      students = rowsToWorkStudents(rows);
    }
    if (!students.length) throw new Error('ไม่พบรายชื่อในไฟล์');
    if (set.students.length && !confirm(`แทนรายชื่อเดิม ${set.students.length} คน ด้วย ${students.length} คนจากไฟล์?`)) return;
    set.students = students;
    set.data = {};
    markWorkDirty(`นำเข้านักเรียน ${students.length} คนแล้ว`);
    renderWorkEditor();
  } catch (error) { showToast(error.message || 'นำเข้ารายชื่อไม่สำเร็จ'); }
}

async function exportWorkExcel() {
  const set = activeWorkSet();
  if (!set) return;
  const rows = set.students.map(student => {
    const row = {'เลขที่':student.no, 'ชื่อ-สกุล':student.name};
    let pending = 0;
    set.works.forEach(work => {
      const value = workValue(set, student.id, work.id);
      if (work.type === 'สอบ') row[`${work.name} (คะแนนเต็ม ${work.max || 0})`] = value ?? '';
      else { row[work.name] = value === true ? 'ส่งแล้ว' : 'ยังไม่ส่ง'; if (value !== true) pending++; }
    });
    row['งานค้าง'] = pending;
    return row;
  });
  try {
    await ensureSheetJS();
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{wch:8},{wch:28}, ...set.works.map(() => ({wch:20})), {wch:10}];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'ติดตามงาน');
    XLSX.writeFile(workbook, `${set.room}_${set.subject}_ติดตามงาน.xlsx`.replace(/[\\/:*?"<>|]/g,'-'));
    showToast('ส่งออก Excel แล้ว');
  } catch (error) { showToast(error.message); }
}

async function ensureQrScannerLibrary() {
  if (window.Html5Qrcode) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.onload = resolve; script.onerror = () => reject(new Error('โหลดระบบสแกน QR ไม่สำเร็จ')); document.head.appendChild(script);
  });
}

function scannerControlsHtml(set) {
  return `<div class="work-scanner-heading"><div><p class="eyebrow">สแกนการ์ดนักเรียน</p><h3>บันทึกงานหรือคะแนนทันที</h3></div><button class="outline-button" data-native-action="close-work-scanner">ปิดกล้อง</button></div><div class="work-scanner-controls"><label><span>งาน/ข้อสอบ</span><select id="scanWorkId">${set.works.map(work => `<option value="${escapeText(work.id)}">${escapeText(work.name)} (${work.type})</option>`).join('')}</select></label><label><span>การทำงาน</span><select id="scanWorkAction"><option value="sent">ทำเครื่องหมายส่งแล้ว</option><option value="missing">ทำเครื่องหมายยังไม่ส่ง</option><option value="toggle">สลับสถานะ</option><option value="score">กรอกคะแนน</option></select></label><label><span>คะแนน</span><input id="scanWorkScore" type="number" min="0" value="0"></label><label class="manual-scan-field"><span>กรอกรหัสหากใช้กล้องไม่ได้</span><span><input id="manualScanCode" inputmode="numeric" placeholder="รหัสนักเรียนหรือเลขที่"><button class="outline-button" data-native-action="manual-work-scan">บันทึก</button></span></label></div><div class="work-scanner-layout"><div><div id="workQrReader" class="work-qr-reader"></div><div id="workScanStatus" class="scanner-status">กำลังเปิดกล้อง…</div></div><div><h3>ประวัติรอบนี้</h3><div id="workScanHistory" class="scan-history"><div class="native-empty">ยังไม่มีการสแกน</div></div></div></div>`;
}

async function openWorkScanner() {
  const set = activeWorkSet();
  if (!set?.works.length) { showToast('กรุณาเพิ่มงานหรือข้อสอบก่อน'); return; }
  const panel = document.getElementById('workScannerPanel');
  panel.hidden = false; panel.innerHTML = scannerControlsHtml(set); panel.scrollIntoView({behavior:'smooth', block:'start'});
  nativeState.workScanHistory = [];
  try {
    await ensureQrScannerLibrary();
    nativeState.qrScanner = new Html5Qrcode('workQrReader');
    await nativeState.qrScanner.start({facingMode:'environment'}, {fps:15, qrbox:{width:230,height:230}}, code => handleWorkScan(code), () => {});
    document.getElementById('workScanStatus').textContent = 'พร้อมสแกน · หัน QR เข้ากล้อง';
  } catch (error) { document.getElementById('workScanStatus').textContent = `เปิดกล้องไม่สำเร็จ · ${error.message || 'กรุณาอนุญาตกล้อง'}`; }
}

async function closeWorkScanner() {
  if (nativeState.qrScanner) {
    try { if (nativeState.qrScanner.isScanning) await nativeState.qrScanner.stop(); await nativeState.qrScanner.clear(); } catch {}
    nativeState.qrScanner = null;
  }
  const panel = document.getElementById('workScannerPanel');
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
}

async function handleWorkScan(rawCode) {
  const set = activeWorkSet();
  if (!set) return;
  const code = String(rawCode).trim();
  const roster = await ensureRoster();
  const rosterMatch = (roster[set.room] || []).find(student => String(student.id || '').trim() === code);
  const seatNo = rosterMatch?.no ?? (/^\d+$/.test(code) ? Number(code) : null);
  const student = set.students.find(item => String(item.no) === String(seatNo) || String(item.id) === code);
  const status = document.getElementById('workScanStatus');
  if (!student) { status.textContent = `ไม่พบนักเรียนจาก QR: ${code}`; status.classList.add('error'); return; }
  const work = set.works.find(item => item.id === document.getElementById('scanWorkId')?.value);
  if (!work) return;
  const action = document.getElementById('scanWorkAction')?.value;
  let textValue = '';
  if (work.type === 'สอบ' || action === 'score') {
    const score = Number(document.getElementById('scanWorkScore')?.value || 0);
    setWorkValue(set, student.id, work.id, score); textValue = `คะแนน ${score}`;
  } else {
    const current = workValue(set, student.id, work.id) === true;
    const next = action === 'toggle' ? !current : action !== 'missing';
    setWorkValue(set, student.id, work.id, next); textValue = next ? 'ส่งแล้ว' : 'ยังไม่ส่ง';
  }
  markWorkDirty('บันทึกผลสแกนแล้ว');
  status.classList.remove('error'); status.textContent = `✓ ${student.name} · ${work.name} · ${textValue}`;
  nativeState.workScanHistory.unshift({time:new Date().toLocaleTimeString('th-TH'), student:student.name, work:work.name, value:textValue});
  const history = document.getElementById('workScanHistory');
  history.innerHTML = nativeState.workScanHistory.slice(0,20).map(item => `<div><time>${item.time}</time><span><b>${escapeText(item.student)}</b><small>${escapeText(item.work)} · ${escapeText(item.value)}</small></span></div>`).join('');
}

async function handleNativeAction(button) {
  const action = button.dataset.nativeAction;
  if (action === 'mark-all-present') {
    const room = document.getElementById('nativeRoom')?.value;
    (nativeState.roster?.[room] || []).forEach(student => { nativeState.attendance[room][student.no] = 'มา'; });
    renderAttendanceRoster(); showToast('ทำเครื่องหมายมาครบแล้ว');
  }
  if (action === 'save-attendance') await saveNativeAttendance();
  if (action === 'show-attendance-history') {
    const history = document.getElementById('attendanceHistory');
    if (history) { history.hidden = false; await renderAttendanceHistory(); history.scrollIntoView({ behavior:'smooth', block:'start' }); }
  }
  if (action === 'hide-attendance-history') { const history = document.getElementById('attendanceHistory'); if (history) history.hidden = true; }
  if (action === 'refresh-work') {
    if (!nativeState.workDirty || confirm('โหลดข้อมูลจากคลาวด์และทิ้งร่างที่ยังไม่ได้บันทึก?')) await loadWorkData();
  }
  if (action === 'back-work-sets') { await closeWorkScanner(); nativeState.activeWorkKey = ''; renderWorkSetList(); }
  if (action === 'new-work-set') createWorkSet();
  if (action === 'save-work-cloud') await saveWorkCloud(button);
  if (action === 'delete-work-set') deleteWorkSet();
  if (action === 'edit-work-set') editWorkSet();
  if (action === 'show-work-report') showWorkPendingReport();
  if (action === 'add-work-item') addWorkItem();
  if (action === 'edit-work-item') editWorkItem(Number(button.dataset.workIndex));
  if (action === 'delete-work-item') deleteWorkItem(Number(button.dataset.workIndex));
  if (action === 'add-work-student') addWorkStudent();
  if (action === 'edit-work-student') editWorkStudent(Number(button.dataset.studentIndex));
  if (action === 'delete-work-student') deleteWorkStudent(Number(button.dataset.studentIndex));
  if (action === 'use-room-roster') await useRoomRoster();
  if (action === 'import-work-students') document.getElementById('workImportFile')?.click();
  if (action === 'export-work-excel') await exportWorkExcel();
  if (action === 'open-work-scanner') await openWorkScanner();
  if (action === 'close-work-scanner') await closeWorkScanner();
  if (action === 'manual-work-scan') {
    const code = document.getElementById('manualScanCode')?.value.trim();
    if (code) { await handleWorkScan(code); document.getElementById('manualScanCode').value = ''; }
    else showToast('กรุณาใส่รหัสนักเรียนหรือเลขที่');
  }
  if (action === 'toggle-work-status') {
    const set = activeWorkSet();
    if (set) { const current = workValue(set, button.dataset.studentId, button.dataset.workId) === true; setWorkValue(set, button.dataset.studentId, button.dataset.workId, !current); markWorkDirty('อัปเดตสถานะส่งงานแล้ว'); renderWorkEditor(); }
  }
  if (action === 'refresh-grades') await loadGradeData();
  if (action === 'refresh-exams') await loadExamData();
  if (action === 'refresh-fund') await loadFundData();
  if (action === 'start-camera') await startNativeCamera();
  if (action === 'stop-camera') stopNativeCamera();
  if (action === 'generate-qr') await generateNativeQR();
  if (action === 'print-cards') window.print();
  if (action === 'view-grade-set') await showGradeSet(button.dataset.gradeKey);
  if (action === 'select-work-set') showWorkSet(button.dataset.setKey);
  if (action === 'random-student') {
    const room = document.getElementById('nativeRoom')?.value, students = nativeState.roster?.[room] || [];
    if (!students.length) { showToast('กรุณาเลือกห้องเรียน'); return; }
    const student = students[Math.floor(Math.random() * students.length)];
    document.getElementById('randomResult').innerHTML = `<span>${escapeText(room)}</span><strong>${student.no}</strong><p>${escapeText(student.name)}</p>`;
  }
  if (action === 'select-game') document.getElementById('nativeGameStage').innerHTML = `<div class="ready-state"><span>พร้อมเริ่ม</span><h2>${escapeText(button.dataset.game)}</h2><p>สร้างห้องกิจกรรมและแบ่งนักเรียนเป็นทีมได้จากหน้านี้</p><button class="soft-button" data-action="toast" data-message="สร้างห้อง ${escapeText(button.dataset.game)} แล้ว">สร้างห้องเกม</button></div>`;
  if (action === 'open-lesson') document.getElementById('nativeLessonStage').innerHTML = `<div class="ready-state"><span>บทเรียน</span><h2>${escapeText(button.dataset.lesson)}</h2><p>เลือกดูเนื้อหา มอบหมายแบบฝึกหัด หรือตรวจความคืบหน้าของนักเรียนได้จากหน้านี้</p><div class="ready-actions"><button class="soft-button" data-action="toast" data-message="กำลังเตรียมบทเรียน ${escapeText(button.dataset.lesson)}">เปิดเนื้อหา</button><button class="outline-button" data-action="toast" data-message="สร้างงานจากบท ${escapeText(button.dataset.lesson)} แล้ว">มอบหมายงาน</button></div></div>`;
}

document.addEventListener('click', event => {
  const roleButton = event.target.closest('#roleButton');
  if (roleButton) {
    const popover = document.getElementById('rolePopover');
    popover.hidden = !popover.hidden;
    roleButton.setAttribute('aria-expanded', String(!popover.hidden));
    return;
  }

  const roleTarget = event.target.closest('#rolePopover [data-role], .setting-item[data-role]');
  if (roleTarget) { setRole(roleTarget.dataset.role); return; }

  const toolTarget = event.target.closest('[data-tool]');
  if (toolTarget) {
    currentTool = teacherTools.find(tool => tool.id === toolTarget.dataset.tool);
    if (currentTool) routeTo('tool');
    return;
  }

  const nativeAction = event.target.closest('[data-native-action]');
  if (nativeAction) { handleNativeAction(nativeAction); return; }

  const attendanceTarget = event.target.closest('[data-attendance-no]');
  if (attendanceTarget) {
    const room = document.getElementById('nativeRoom')?.value;
    if (room) {
      nativeState.attendance[room][attendanceTarget.dataset.attendanceNo] = attendanceTarget.dataset.status;
      renderAttendanceRoster();
    }
    return;
  }

  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) { event.preventDefault(); routeTo(routeTarget.dataset.route); return; }

  const toastTarget = event.target.closest('[data-action="toast"]');
  if (toastTarget) showToast(toastTarget.dataset.message);

  const toggleTarget = event.target.closest('[data-toggle]');
  if (toggleTarget) {
    const toggle = toggleTarget.querySelector('.toggle');
    toggle.classList.toggle('on');
    showToast(toggle.classList.contains('on') ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว');
  }

  const taskButton = event.target.closest('[data-task]');
  if (taskButton) {
    const task = tasks.find(item => item.id === Number(taskButton.dataset.task));
    task.done = !task.done;
    routeTo('tasks', false);
    showToast(task.done ? 'ทำเครื่องหมายว่าส่งแล้ว' : 'ย้ายกลับไปงานที่ต้องส่ง');
  }

  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    const group = filterButton.closest('[data-filter-group]');
    group.querySelectorAll('.filter-pill').forEach(pill => pill.classList.toggle('active', pill === filterButton));
    const selector = group.dataset.filterGroup === 'exam' ? '.exam-card' : '.task-card';
    document.querySelectorAll(selector).forEach(card => card.hidden = filterButton.dataset.filter !== 'all' && card.dataset.state !== filterButton.dataset.filter);
  }

  const toolFilter = event.target.closest('[data-tool-filter]');
  if (toolFilter) {
    const group = toolFilter.closest('[data-tool-filters]');
    group.querySelectorAll('.filter-pill').forEach(pill => pill.classList.toggle('active', pill === toolFilter));
    document.querySelectorAll('[data-tool-category]').forEach(card => {
      card.hidden = toolFilter.dataset.toolFilter !== 'all' && card.dataset.toolCategory !== toolFilter.dataset.toolFilter;
    });
  }

  if (!event.target.closest('#rolePopover')) {
    document.getElementById('rolePopover').hidden = true;
    document.getElementById('roleButton').setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'workImportFile') {
    const file = event.target.files?.[0];
    if (file) importWorkStudents(file);
    event.target.value = '';
  }
  if (event.target.matches('[data-work-score]')) {
    const set = activeWorkSet();
    if (!set) return;
    const value = event.target.value === '' ? '' : Number(event.target.value);
    const max = Number(event.target.max || 999);
    setWorkValue(set, event.target.dataset.studentId, event.target.dataset.workId, value === '' ? '' : Math.max(0, Math.min(value, max)));
    markWorkDirty('อัปเดตคะแนนแล้ว');
  }
  if (event.target.id === 'scanWorkId') {
    const work = activeWorkSet()?.works.find(item => item.id === event.target.value);
    if (work?.type === 'สอบ') document.getElementById('scanWorkAction').value = 'score';
    if (work?.max) document.getElementById('scanWorkScore').max = work.max;
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'nativeRoom') renderAttendanceRoster();
  if (event.target.id === 'nativeSubject') {
    const subject = nativeState.subjects.find(item => item.id === event.target.value);
    const roomSelect = document.getElementById('nativeRoom');
    if (subject && roomSelect) {
      const allowed = new Set((subject.rooms || []).map(room => String(room).replace('_','/').replace(/^(\d)/,'ม.$1')));
      [...roomSelect.options].forEach(option => { if (option.value) option.hidden = allowed.size > 0 && !allowed.has(option.value); });
    }
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'nativeScoreSearch') {
    const query = event.target.value.trim().toLowerCase();
    renderExamRows(nativeState.examRows.filter(row => [row.name,row.no,row.room,row.subject].some(value => String(value || '').toLowerCase().includes(query))));
  }
});

window.addEventListener('popstate', () => routeTo(location.hash.slice(1), false));
const initialRoute = location.hash.slice(1);
if (['teacher-home', 'attendance', 'teacher-work', 'scores', 'tools', 'teacher-profile', 'tool'].includes(initialRoute)) currentRole = 'teacher';
renderNavigation();
syncRoleUI();
routeTo(initialRoute || (currentRole === 'teacher' ? 'teacher-home' : 'home'), false);

let installPrompt;
const installButton = document.getElementById('installButton');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) { showToast('เปิดเมนูเบราว์เซอร์แล้วเลือก “เพิ่มไปยังหน้าจอโฮม”'); return; }
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => showToast('ติดตั้ง KNT Classroom เรียบร้อยแล้ว'));

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
