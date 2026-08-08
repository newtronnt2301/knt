const KNT_DB_ID = "1nBtGhcMbfKxYbCPLbqIR8yLxHD0k-QjFFyTJ9m4TaCE";
const KNT_SESSION_DAYS = 30;
const KNT_TEACHER_HASH = "a96caacc78434461b8664705cbad2a9b490aa2b61ffe78bbc87b5a3e9d607d22";

const KNT_TABLES = {
  Students: ["studentId", "username", "passwordHash", "salt", "fullName", "school", "grade", "room", "no", "recoveryHash", "createdAt", "status"],
  Sessions: ["tokenHash", "studentId", "expiresAt", "createdAt", "lastSeenAt"],
  TalentAttempts: ["attemptId", "studentId", "level", "mode", "paperCode", "score", "total", "durationSec", "startedAt", "completedAt", "questionIds"],
  TalentAnswers: ["attemptId", "studentId", "questionId", "level", "topic", "skill", "selected", "correct", "isCorrect", "timeMs", "flagged", "answeredAt", "errorType", "attemptMode", "questionVersion"],
  PaperSets: ["paperCode", "level", "questionIds", "createdBy", "createdAt", "status"]
};

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  try {
    if (p.action === "health") return json_({ ok: true, service: "KNT Talent", version: 3 });
    if (p.action === "me") return json_({ ok: true, student: publicStudent_(requireStudent_(p.token)) });
    if (p.action === "dashboard") return json_({ ok: true, data: dashboard_(requireStudent_(p.token)) });
    if (p.action === "paper_get") return json_({ ok: true, paper: paperGet_(p.code) });
    if (p.action === "teacher_data") {
      requireTeacher_(p.teacherToken);
      return json_({ ok: true, data: teacherData_() });
    }
    return json_({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (error) {
    return json_({ ok: false, error: error.message || "SERVER_ERROR" });
  }
}

function doPost(e) {
  try {
    setupTables_();
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "");
    if (action === "register") return json_({ ok: true, data: register_(body) });
    if (action === "login") return json_({ ok: true, data: login_(body) });
    if (action === "logout") return json_({ ok: true, data: logout_(body.token) });
    if (action === "reset_password") return json_({ ok: true, data: resetPassword_(body) });
    if (action === "attempt_submit") return json_({ ok: true, data: attemptSubmit_(requireStudent_(body.token), body) });
    if (action === "paper_create") {
      let creator;
      if (body.teacherToken) { requireTeacher_(body.teacherToken); creator = { studentId: "TEACHER" }; }
      else creator = requireStudent_(body.token);
      return json_({ ok: true, data: paperCreate_(creator, body) });
    }
    if (action === "teacher_login") return json_({ ok: true, data: teacherLogin_(body.code) });
    return json_({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (error) {
    return json_({ ok: false, error: error.message || "SERVER_ERROR" });
  }
}

function setupTables_() {
  const ss = SpreadsheetApp.openById(KNT_DB_ID);
  Object.keys(KNT_TABLES).forEach(function(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = KNT_TABLES[name];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ede9fe");
    } else if (sheet.getLastColumn() < headers.length) {
      const start = sheet.getLastColumn() + 1;
      sheet.getRange(1, start, 1, headers.length - start + 1).setValues([headers.slice(start - 1)]);
      sheet.getRange(1, start, 1, headers.length - start + 1).setFontWeight("bold").setBackground("#ede9fe");
    }
  });
}

function register_(body) {
  const username = normalizeUsername_(body.username);
  const password = String(body.password || "");
  const fullName = clean_(body.fullName, 120);
  if (!/^[a-z0-9._-]{4,24}$/.test(username)) throw new Error("USERNAME_INVALID");
  if (password.length < 8 || password.length > 72) throw new Error("PASSWORD_INVALID");
  if (fullName.length < 3) throw new Error("NAME_INVALID");

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = sheet_("Students");
    const rows = values_(sheet);
    if (rows.some(function(row) { return String(row[1]).toLowerCase() === username; })) throw new Error("USERNAME_TAKEN");
    const studentId = "STU-" + Utilities.getUuid().replace(/-/g, "").slice(0, 12).toUpperCase();
    const salt = Utilities.getUuid().replace(/-/g, "");
    const recoveryCode = randomCode_(12);
    const now = new Date().toISOString();
    sheet.appendRow([
      studentId, username, passwordHash_(password, salt), salt, fullName,
      clean_(body.school, 120), clean_(body.grade, 30), clean_(body.room, 30), clean_(body.no, 10),
      sha256_(recoveryCode.toUpperCase()), now, "active"
    ]);
    const token = createSession_(studentId);
    return { token: token, recoveryCode: recoveryCode, student: publicStudent_(findStudentById_(studentId)) };
  } finally {
    lock.releaseLock();
  }
}

function login_(body) {
  const username = normalizeUsername_(body.username);
  const password = String(body.password || "");
  const student = findStudentByUsername_(username);
  if (!student || student.status !== "active" || !constantEqual_(student.passwordHash, passwordHash_(password, student.salt))) {
    throw new Error("LOGIN_INVALID");
  }
  return { token: createSession_(student.studentId), student: publicStudent_(student) };
}

function logout_(token) {
  const hash = sha256_(String(token || ""));
  const sheet = sheet_("Sessions");
  const rows = values_(sheet);
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (constantEqual_(String(rows[i][0]), hash)) sheet.deleteRow(i + 2);
  }
  return { loggedOut: true };
}

function resetPassword_(body) {
  const student = findStudentByUsername_(normalizeUsername_(body.username));
  const codeHash = sha256_(String(body.recoveryCode || "").replace(/\s/g, "").toUpperCase());
  const password = String(body.newPassword || "");
  if (!student || !constantEqual_(student.recoveryHash, codeHash)) throw new Error("RECOVERY_INVALID");
  if (password.length < 8 || password.length > 72) throw new Error("PASSWORD_INVALID");
  const salt = Utilities.getUuid().replace(/-/g, "");
  const sheet = sheet_("Students");
  sheet.getRange(student._row, 3, 1, 2).setValues([[passwordHash_(password, salt), salt]]);
  return { reset: true };
}

function attemptSubmit_(student, body) {
  const attempt = body.attempt || {};
  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  const questionIds = Array.isArray(attempt.questionIds) ? attempt.questionIds.map(String) : [];
  if (!attempt.id || ![1, 2, 3].includes(Number(attempt.level)) || !questionIds.length || answers.length !== questionIds.length) {
    throw new Error("ATTEMPT_INVALID");
  }
  if (findAttempt_(String(attempt.id))) return { duplicate: true };
  const now = new Date().toISOString();
  const answerRows = answers.map(function(answer) {
    return [
      clean_(attempt.id, 80), student.studentId, clean_(answer.questionId, 40), Number(attempt.level),
      clean_(answer.topic, 30), clean_(answer.skill, 160), Number(answer.selected), Number(answer.correct),
      answer.isCorrect ? 1 : 0, Math.max(0, Number(answer.timeMs) || 0), answer.flagged ? 1 : 0, now,
      clean_(answer.errorType, 30), clean_(answer.attemptMode || attempt.mode || "practice", 20), Math.max(1, Number(answer.questionVersion) || 1)
    ];
  });
  const score = answerRows.reduce(function(sum, row) { return sum + Number(row[8]); }, 0);
  sheet_("TalentAttempts").appendRow([
    clean_(attempt.id, 80), student.studentId, Number(attempt.level), clean_(attempt.mode || "online", 20),
    clean_(attempt.paperCode, 20), score, questionIds.length, Math.max(1, Number(attempt.durationSec) || 1),
    clean_(attempt.startedAt, 40), now, JSON.stringify(questionIds)
  ]);
  if (answerRows.length) sheet_("TalentAnswers").getRange(sheet_("TalentAnswers").getLastRow() + 1, 1, answerRows.length, KNT_TABLES.TalentAnswers.length).setValues(answerRows);
  return { attemptId: String(attempt.id), score: score, total: questionIds.length, dashboard: dashboard_(student) };
}

function paperCreate_(student, body) {
  const level = Number(body.level);
  const ids = Array.isArray(body.questionIds) ? body.questionIds.map(String).slice(0, 30) : [];
  if (![1, 2, 3].includes(level) || ids.length !== 30) throw new Error("PAPER_INVALID");
  const code = "P" + level + "-" + randomCode_(6);
  sheet_("PaperSets").appendRow([code, level, JSON.stringify(ids), student.studentId, new Date().toISOString(), "active"]);
  return { paperCode: code, level: level, questionIds: ids };
}

function paperGet_(code) {
  const target = String(code || "").trim().toUpperCase();
  const rows = values_(sheet_("PaperSets"));
  const row = rows.find(function(value) { return String(value[0]).toUpperCase() === target && value[5] === "active"; });
  if (!row) throw new Error("PAPER_NOT_FOUND");
  return { paperCode: row[0], level: Number(row[1]), questionIds: JSON.parse(row[2] || "[]") };
}

function dashboard_(student) {
  const attempts = values_(sheet_("TalentAttempts")).filter(function(row) { return row[1] === student.studentId; }).map(function(row) {
    return { id: row[0], level: Number(row[2]), mode: row[3], paperCode: row[4], score: Number(row[5]), total: Number(row[6]), durationSec: Number(row[7]), startedAt: row[8], completedAt: row[9], questionIds: safeJson_(row[10], []) };
  });
  const answers = values_(sheet_("TalentAnswers")).filter(function(row) { return row[1] === student.studentId; }).map(function(row) {
    return { attemptId: row[0], questionId: row[2], level: Number(row[3]), topic: row[4], skill: row[5], selected: Number(row[6]), correct: Number(row[7]), isCorrect: Number(row[8]) === 1, timeMs: Number(row[9]), flagged: Number(row[10]) === 1, answeredAt: row[11], errorType: row[12] || "", attemptMode: row[13] || "practice", questionVersion: Number(row[14]) || 1 };
  });
  return { student: publicStudent_(student), attempts: attempts, answers: answers };
}

function teacherData_() {
  const students = values_(sheet_("Students")).map(function(row, index) { return publicStudent_(studentFromRow_(row, index + 2)); });
  const attempts = values_(sheet_("TalentAttempts")).map(function(row) {
    return { id: row[0], studentId: row[1], level: Number(row[2]), mode: row[3], paperCode: row[4], score: Number(row[5]), total: Number(row[6]), durationSec: Number(row[7]), completedAt: row[9] };
  });
  const answers = values_(sheet_("TalentAnswers")).map(function(row) {
    return { attemptId: row[0], studentId: row[1], questionId: row[2], level: Number(row[3]), topic: row[4], skill: row[5], selected: Number(row[6]), correct: Number(row[7]), isCorrect: Number(row[8]) === 1, timeMs: Number(row[9]), flagged: Number(row[10]) === 1, answeredAt: row[11], errorType: row[12] || "", attemptMode: row[13] || "practice", questionVersion: Number(row[14]) || 1 };
  });
  return { students: students, attempts: attempts, answers: answers };
}

function teacherLogin_(code) {
  if (!constantEqual_(sha256_(String(code || "")), KNT_TEACHER_HASH)) throw new Error("TEACHER_INVALID");
  const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  CacheService.getScriptCache().put("teacher:" + sha256_(token), "1", 21600);
  return { teacherToken: token, expiresIn: 21600 };
}

function requireTeacher_(token) {
  if (CacheService.getScriptCache().get("teacher:" + sha256_(String(token || ""))) !== "1") throw new Error("TEACHER_AUTH_REQUIRED");
}

function createSession_(studentId) {
  const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  const now = new Date();
  const expires = new Date(now.getTime() + KNT_SESSION_DAYS * 86400000);
  sheet_("Sessions").appendRow([sha256_(token), studentId, expires.toISOString(), now.toISOString(), now.toISOString()]);
  return token;
}

function requireStudent_(token) {
  const hash = sha256_(String(token || ""));
  const sheet = sheet_("Sessions");
  const rows = values_(sheet);
  for (let i = 0; i < rows.length; i += 1) {
    if (constantEqual_(String(rows[i][0]), hash)) {
      if (new Date(rows[i][2]).getTime() < Date.now()) {
        sheet.deleteRow(i + 2);
        throw new Error("SESSION_EXPIRED");
      }
      sheet.getRange(i + 2, 5).setValue(new Date().toISOString());
      const student = findStudentById_(rows[i][1]);
      if (!student || student.status !== "active") throw new Error("ACCOUNT_DISABLED");
      return student;
    }
  }
  throw new Error("AUTH_REQUIRED");
}

function findStudentByUsername_(username) {
  const rows = values_(sheet_("Students"));
  for (let i = 0; i < rows.length; i += 1) if (String(rows[i][1]).toLowerCase() === username) return studentFromRow_(rows[i], i + 2);
  return null;
}

function findStudentById_(studentId) {
  const rows = values_(sheet_("Students"));
  for (let i = 0; i < rows.length; i += 1) if (rows[i][0] === studentId) return studentFromRow_(rows[i], i + 2);
  return null;
}

function findAttempt_(attemptId) {
  return values_(sheet_("TalentAttempts")).some(function(row) { return row[0] === attemptId; });
}

function studentFromRow_(row, rowNumber) {
  return { _row: rowNumber, studentId: row[0], username: row[1], passwordHash: row[2], salt: row[3], fullName: row[4], school: row[5], grade: row[6], room: row[7], no: row[8], recoveryHash: row[9], createdAt: row[10], status: row[11] };
}

function publicStudent_(student) {
  return { studentId: student.studentId, username: student.username, fullName: student.fullName, school: student.school, grade: student.grade, room: student.room, no: student.no, createdAt: student.createdAt };
}

function sheet_(name) {
  const sheet = SpreadsheetApp.openById(KNT_DB_ID).getSheetByName(name);
  if (!sheet) { setupTables_(); return SpreadsheetApp.openById(KNT_DB_ID).getSheetByName(name); }
  return sheet;
}

function values_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, KNT_TABLES[sheet.getName()].length).getValues();
}

function passwordHash_(password, salt) {
  let value = String(password) + ":" + salt;
  for (let i = 0; i < 1200; i += 1) value = sha256_(value + ":" + salt);
  return value;
}

function sha256_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return bytes.map(function(byte) { const v = byte < 0 ? byte + 256 : byte; return ("0" + v.toString(16)).slice(-2); }).join("");
}

function constantEqual_(a, b) {
  a = String(a || ""); b = String(b || "");
  let result = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) result |= (a.charCodeAt(i % (a.length || 1)) || 0) ^ (b.charCodeAt(i % (b.length || 1)) || 0);
  return result === 0;
}

function normalizeUsername_(value) { return String(value || "").trim().toLowerCase(); }
function clean_(value, max) { return String(value == null ? "" : value).trim().slice(0, max || 200); }
function randomCode_(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const seed = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  for (let i = 0; i < length; i += 1) result += chars[parseInt(seed.slice(i * 2, i * 2 + 2), 16) % chars.length];
  return result;
}
function safeJson_(value, fallback) { try { return JSON.parse(value); } catch (error) { return fallback; } }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
