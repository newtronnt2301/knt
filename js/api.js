/* ============================================================
   KNT · API Layer
   Google Apps Script Web App connectors (CORS-safe)
   ------------------------------------------------------------
   GAS Web Apps:
   - GET requests work cross-origin with no preflight.
   - POST must use Content-Type: text/plain (or no body) to
     avoid a CORS preflight that GAS cannot answer.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- API Endpoints ---------- */
  const API = {
    ATTENDANCE:       "https://script.google.com/macros/s/AKfycbx1yUYxuSgF2xsOZF872ohwjIvD56NQwbZ4BXizSG-dm00Rypu6nVO_YwE-BZJ2F6X4/exec",
    EXAM:             "https://script.google.com/macros/s/AKfycbw3eNbBuhg-P-dLxBeZkYIggp0FW9GM1TdL1wVd1XeyxvwRTzw4BcMNiPBEyyWH1le-/exec",
    GRADES:           "https://script.google.com/macros/s/AKfycbyrdVll59hQVArQGjBTPPfovFBZ0eG5mjTWn93R2GJ_Xwl3wBTjMttgjrNW6Nr-ZfbF/exec",
    SUBMIT_WORK:      "https://script.google.com/macros/s/AKfycbyt0HfLY6ZvCc12rFdJI74KGim_wmLapTKNlvhe7U3O3LlNaaCq97iHkZQ-51mLLVKY/exec",
    SUBJECT_CHECKIN:  "https://script.google.com/macros/s/AKfycbxAyuZYgGo97MWZrWo53-HV1pHKqdjzGDMS7JjBatdloLavF1Txwtz13dlHybbBhMPkTw/exec",
    CLASS_FUND:       "https://script.google.com/macros/s/AKfycbz-F0PVMgQel2G7PIutsmvIW_D7UeSwXau39cGn4G8gnKHK2O_AXJnofNu5X5AMmdDafQ/exec",
  };

  /* ---------- Core fetch helpers ---------- */

  // GET request — builds query string from params object.
  async function get(endpoint, params = {}) {
    const url = buildURL(endpoint, params);
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return parse(res, url);
  }

  // POST request — uses text/plain to bypass CORS preflight (GAS limitation).
  // Payload is JSON-stringified and sent in the body.
  async function post(endpoint, params = {}, body = null) {
    // small query params can still ride on the URL (action etc.)
    const url = buildURL(endpoint, params);
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    return parse(res, url);
  }

  // POST a form-encoded body (some GAS endpoints prefer this).
  async function postForm(endpoint, formData) {
    const res = await fetch(endpoint, {
      method: "POST",
      redirect: "follow",
      body: formData, // browser sets multipart/form-data automatically
    });
    return parse(res, endpoint);
  }

  /* ---------- Utilities ---------- */

  function buildURL(endpoint, params) {
    const u = new URL(endpoint);
    Object.entries(params).forEach(([k, v]) => {
      if (v == null) return;
      u.searchParams.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    });
    return u.toString();
  }

  async function parse(res, url) {
    const ct = res.headers.get("content-type") || "";
    let data;
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      // GAS sometimes returns JSON as text — try to recover.
      try { data = JSON.parse(text); }
      catch { data = { ok: false, raw: text, status: res.status }; }
    }
    if (!res.ok && (!data || data.ok === undefined)) {
      const err = new Error(`HTTP ${res.status} — ${url}`);
      err.data = data; err.status = res.status;
      throw err;
    }
    return data;
  }

  // File → base64 (without the data: prefix). Used for photo_save.
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const result = String(r.result || "");
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  /* ---------- Domain-specific helpers ---------- */
  //
  // These wrap the raw GET/POST into the exact actions described in the
  // brief, so each page can call one well-named function.
  //
  // Each domain object exposes:
  //   - load():  ดึงประวัติเดิมจาก Sheet แปลงเป็นรูปแบบที่เว็บใช้
  //   - save(): บันทึกกลับเข้า Sheet ในรูปแบบที่ Sheet ใช้
  // เพื่อให้เว็บใหม่เข้ากับข้อมูลเดิมที่มีอยู่แล้วใน Google Sheet

  // Normalize attendance status: Sheet ใช้ทั้งค่าไทย ("มา") และอังกฤษ ("present")
  // เว็บใช้ "มา/สาย/ลา/ขาด" เสมอ
  function normalizeStatus(s) {
    const m = {
      present: "มา", late: "สาย", leave: "ลา", absent: "ขาด",
      มา: "มา", สาย: "สาย", ลา: "ลา", ขาด: "ขาด",
    };
    return m[s] || m[String(s).toLowerCase()] || "มา";
  }
  // Inverse: เว็บ → Sheet (Sheet ยอมรับได้ทั้งค่าไทย ส่งค่าไทยกลับไป)
  const statusToSheet = (s) => s;

  // Convert Sheet's Thai timestamp "23 มิ.ค. 2569 - 10:44 น." → ISO yyyy-MM-dd
  const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  function thaiTsToDate(ts) {
    if (!ts) return "";
    // ดึงส่วนวันที่ (ตัดเวลาออก)
    const datePart = String(ts).split(" - ")[0].trim();
    const parts = datePart.split(/\s+/); // ["23","มิ.ย.","2569"]
    if (parts.length < 3) return "";
    const d = String(parts[0]).padStart(2, "0");
    const mi = TH_MONTHS.indexOf(parts[1]);
    if (mi < 0) return "";
    const be = parseInt(parts[2], 10);
    const y = isNaN(be) ? "" : (be - 543);
    return `${y}-${String(mi + 1).padStart(2, "0")}-${d}`;
  }

  const KNT = {

    /* --- Attendance (ATTENDANCE_API) ---
       Sheet: {success,data:{ "<yyyy-MM-dd>": {"<เลขที่1based>":"<status>"} }}
       เว็บ:  roster + state.statuses ใช้ "มา/สาย/ลา/ขาด" */
    attendance: {
      // ดึงประวัติทั้งหมด คืน { dates: ["yyyy-MM-dd",...], byDate: {date: {no:statusไทย}} }
      async load() {
        const res = await get(API.ATTENDANCE, { action: "get_data" });
        const raw = (res && res.data) ? res.data : {};
        const byDate = {};
        Object.entries(raw).forEach(([date, recs]) => {
          byDate[date] = {};
          Object.entries(recs).forEach(([no, st]) => {
            byDate[date][Number(no)] = normalizeStatus(st);
          });
        });
        return { dates: Object.keys(byDate).sort(), byDate };
      },
      // ดึงเฉพาะวัน → { no: statusไทย } (key เป็น number)
      async loadDate(date) {
        const all = await this.load();
        return all.byDate[date] || {};
      },
      // บันทึก: data = { "<เลขที่>": "<มา/สาย/ลา/ขาด>" } (Sheet รับค่าไทยได้)
      save(room, date /* yyyy-MM-dd */, data) {
        return get(API.ATTENDANCE, {
          action: "save", room, date, data: JSON.stringify(data),
        });
      },
      photoSave(studentId, base64Data) {
        return get(API.ATTENDANCE, {
          action: "photo_save", studentId, data: base64Data,
        });
      },
    },

    /* --- Exam & Quiz (EXAM_API) ---
       Sheet exam_get: {success, list:[{timestamp,room,no,name,subject,score,total}]} */
    exam: {
      // ดึงคะแนนสอบทั้งหมด → normalize เป็น array
      async examGet() {
        const res = await get(API.EXAM, { action: "exam_get" });
        const list = (res && res.list) ? res.list : (Array.isArray(res) ? res : (res?.data || []));
        return list.map((r) => ({
          room: r.room, no: r.no, name: r.name,
          subject: r.subject ?? r.subj,
          score: Number(r.score ?? 0), total: Number(r.total ?? 1) || 1,
          date: r.date || (r.timestamp ? String(r.timestamp).slice(0, 24) : ""),
        }));
      },
      quizSave({ room, no, name, lessonId, lessonTitle, score, total }) {
        return get(API.EXAM, {
          action: "quiz_save", room, no, name, lessonId, lessonTitle,
          score, total,
        });
      },
      examSave({ room, no, name, subject, score, total }) {
        return get(API.EXAM, {
          action: "exam_save", room, no, name, subject, score, total,
        });
      },
    },

    /* --- Grades (GRADES_API) ---
       endpoint นี้จริงๆ เก็บข้อมูล attendance-like {data:{date:{idx:status}}}
       จึงใช้ร่วมกับ attendance — บันทึกยังคง key/data ตามเดิม */
    grades: {
      async loadAll() {
        const res = await get(API.GRADES, { action: "get_all" });
        return (res && res.data) ? res.data : {};
      },
      async loadKey(key) {
        const res = await get(API.GRADES, { action: "get", key });
        return res?.data || res;
      },
      save(key, data) {
        return post(API.GRADES, { action: "save" }, { key, data });
      },
      saveGet(key, data) {
        return get(API.GRADES, {
          action: "save", key,
          data: encodeURIComponent(JSON.stringify(data)),
        });
      },
    },

    /* --- Class Fund (CLASS_FUND_API) ---
       Sheet get_data: {success, config, transactions:[{id,timestamp,type:"income"|"expense",
         studentName,amount,description,collector,method,slipUrl}], collectorHistory}
       เว็บ: txs [{date,type:"รายรับ"|"รายจ่าย",category,detail,amount,by}] */
    classFund: {
      async getData() {
        const res = await get(API.CLASS_FUND, { action: "get_data" });
        if (!res) return { transactions: [], balance: 0, raw: res };
        const rawTxs = res.transactions || [];
        const transactions = rawTxs.map((t) => ({
          id: t.id,
          date: thaiTsToDate(t.timestamp),
          timestamp: t.timestamp,
          type: t.type === "income" ? "รายรับ" : "รายจ่าย",
          category: t.category || t.description || (t.type === "income" ? "รายรับอื่นๆ" : "รายจ่ายอื่นๆ"),
          detail: t.description || t.studentName || "",
          amount: Number(t.amount || 0),
          by: t.collector || "",
          method: t.method || "",
          slipUrl: t.slipUrl || "",
        }));
        // config ที่เว็บอาจใช้ (เป้าหมาย, ชื่อครู)
        const config = res.config || {};
        return { transactions, config, raw: res };
      },
      saveTransaction(tx) {
        // แปลงจากรูปแบบเว็บ → รูปแบบ Sheet
        const payload = {
          type: tx.type === "รายรับ" ? "income" : "expense",
          studentName: tx.detail || "",
          description: tx.category || tx.detail || "",
          amount: Number(tx.amount || 0),
          collector: tx.by || "",
          date: tx.date,
        };
        return post(API.CLASS_FUND, { action: "save_transaction" }, payload);
      },
    },

    /* --- Submit Work (SUBMIT_WORK_API) ---
       Sheet get: {ok, data:{ sets: { "ห้อง|วิชา": {room,subject,works:[{id,name,type,max}],
         students:[{id,no,name}], data:{ studentId: { workId: score|true } } } }, updated} }
       เว็บ: assignments [{id,title,room,subject,due,students:[{no,name,status,note}]}] */
    submitWork: {
      async load() {
        const res = await get(API.SUBMIT_WORK, { action: "get" });
        const sets = res?.data?.sets || {};
        const assignments = [];
        Object.entries(sets).forEach(([key, s]) => {
          const students = s.students || [];
          const works = s.works || [];
          const data = s.data || {};
          // แต่ละงาน (work) → 1 assignment
          works.forEach((w) => {
            const assignStudents = students.map((st) => {
              const rec = data[st.id]?.[w.id];
              // rec: true = ส่งแล้ว, number = คะแนน (สอบ), ไม่มี = ยังไม่ส่ง
              let status = "ยังไม่ส่ง", note = "";
              if (typeof rec === "number") { status = "ส่งแล้ว"; note = `ได้ ${rec}/${w.max ?? ""}`; }
              else if (rec === true) { status = "ส่งแล้ว"; }
              return { no: st.no, name: st.name, status, note, file: "" };
            });
            assignments.push({
              id: w.id,
              title: w.name,
              room: s.room,
              subject: s.subject,
              due: "",
              _type: w.type || "ส่ง",
              _max: w.max,
              students: assignStudents,
            });
          });
        });
        return { assignments, raw: res };
      },
      async create(a) {
        return post(API.SUBMIT_WORK, { action: "create" }, a);
      },
      async updateStatus(assignmentId, no, status, note) {
        return post(API.SUBMIT_WORK, { action: "update_status" },
          { assignmentId, no, status, note });
      },
    },

    /* --- Subject Check-in (SUBJECT_CHECKIN_API) ---
       Sheet: มีเพียง action=save (ต้องการ room, subject, date, data) — ไม่มี read action
       จึงบันทึกได้ แต่ไม่สามารถดึงประวัติเดิมกลับมาแสดงได้ */
    subjectCheckin: {
      // ไม่มี load — GAS นี้ไม่รองรับการอ่านกลับ
      async load() { return []; },
      save(room, subject, date, data) {
        return get(API.SUBJECT_CHECKIN,
          { action: "save", room, subject, date, data: JSON.stringify(data) });
      },
    },

    /* --- Raw endpoints for pages that need custom params --- */
    raw: {
      get,
      post,
      postForm,
      fileToBase64,
      endpoints: API,
    },
  };

  global.KNT_API = { ...API, get, post, postForm, fileToBase64 };
  global.KNT = KNT;
})(window);
