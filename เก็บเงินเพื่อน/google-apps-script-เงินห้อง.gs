// ============================================================
//  Google Apps Script — ระบบบันทึกบัญชีเงินห้องเรียน ม.6/1 โปร่งใส (เวอร์ชันเสถียร รองรับการบันทึกรูปภาพและสลิปขนาดใหญ่)
//
//  วิธีติดตั้ง/อัปเดต:
//  1. เปิด Google Sheets ของห้องเรียน → Extensions > Apps Script
//  2. ในหน้า Apps Script ให้ลบโค้ดเดิมทั้งหมดใน Code.gs
//  3. คัดลอกโค้ดด้านล่างนี้ไปวางแทนทั้งหมด
//  4. กดปุ่ม Save (รูปแผ่นดิสก์)
//  5. กด Deploy > New deployment (หรือ Manage deployments เพื่อคลิกแก้ไขอัปเดตเวอร์ชันเดิม)
//     - Type: Web app
//     - Description: ClassFund API ม.6/1 (v2 - POST Support)
//     - Execute as: Me (บัญชี Google ของคุณครู)
//     - Who has access: Anyone (เพื่อให้ระบบสามารถซิงค์และบันทึกข้อมูลเข้าชีตได้)
//  6. กด Deploy (และกดให้สิทธิ์เข้าถึงบัญชีบัญชี Google หากมีปุ่มขึ้นมาตรวจสอบสิทธิ์)
//  7. คัดลอก "Web app URL" ใหม่ที่ได้มาใช้งานแทนลิงก์เดิมในหน้าตั้งค่าระบบ
// ============================================================

// Helper: return JSON response with CORS support
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: get or create a sheet in the Spreadsheet
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Main entry point for GET requests (For fetching data)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const params = e.parameter || {};
    return processAction(ss, params);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// Main entry point for POST requests (For saving transactions and settings with large payloads/images)
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }
    return processAction(ss, params);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// Core business logic handler for both GET and POST requests
function processAction(ss, params) {
  const action = params.action || 'get_data';
  
  // --- 1. GET ALL DATA ---
  if (action === 'get_data') {
    const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
    const transSheet = getOrCreateSheet(ss, "Transactions", [
      "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
    ]);
    const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);

    // Read Configuration
    const configRows = configSheet.getDataRange().getValues();
    const config = {
      goalPerPerson: 200,
      teacherName: "ครูนิวตรอน",
      currentCollectorId: "",
      promptpayId: "091-234-5678",
      promptpayName: "",
      collectorPassword: "1234",
      teacherPassword: "2301",
      appsScriptUrl: ""
    };
    
    for (let i = 1; i < configRows.length; i++) {
      const param = String(configRows[i][0]).trim();
      const value = String(configRows[i][1]).trim();
      if (param === "goalPerPerson") config.goalPerPerson = Number(value);
      if (param === "teacherName") config.teacherName = value;
      if (param === "currentCollectorId") config.currentCollectorId = value;
      if (param === "promptpayId") config.promptpayId = value;
      if (param === "promptpayName") config.promptpayName = value;
      if (param === "collectorPassword") config.collectorPassword = value;
      if (param === "teacherPassword") config.teacherPassword = value;
    }

    // Read Transactions
    const transRows = transSheet.getDataRange().getValues();
    const transactions = [];
    for (let i = 1; i < transRows.length; i++) {
      transactions.push({
        id: String(transRows[i][0]),
        timestamp: String(transRows[i][1]),
        type: String(transRows[i][2]),
        studentId: String(transRows[i][3]),
        studentNo: transRows[i][4] ? Number(transRows[i][4]) : "",
        studentName: String(transRows[i][5]),
        amount: Number(transRows[i][6]),
        description: String(transRows[i][7]),
        collector: String(transRows[i][8]),
        method: String(transRows[i][9] || 'cash'),
        slipUrl: String(transRows[i][10] || '')
      });
    }

    // Read History Log
    const histRows = historySheet.getDataRange().getValues();
    const collectorHistory = [];
    for (let i = 1; i < histRows.length; i++) {
      collectorHistory.push({
        timestamp: String(histRows[i][0]),
        title: String(histRows[i][1]),
        desc: String(histRows[i][2]),
        author: String(histRows[i][3])
      });
    }

    return jsonResponse({
      success: true,
      config: config,
      transactions: transactions,
      collectorHistory: collectorHistory
    });
  }

  // --- 2. SAVE TRANSACTION ---
  if (action === 'save_transaction') {
    const transSheet = getOrCreateSheet(ss, "Transactions", [
      "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
    ]);

    const txid = params.id || ("TX-" + Math.floor(100000 + Math.random() * 900000));
    const timestamp = params.timestamp || new Date().toLocaleString("th-TH");
    const type = params.type || "income";
    const studentId = params.studentId || "";
    const studentNo = params.studentNo ? Number(params.studentNo) : "";
    const studentName = params.studentName || "";
    const amount = Number(params.amount || 0);
    const description = params.description || "";
    const collector = params.collector || "";
    const method = params.method || "cash";
    const slipUrl = params.slipUrl || "";

    transSheet.appendRow([txid, timestamp, type, studentId, studentNo, studentName, amount, description, collector, method, slipUrl]);

    return jsonResponse({ success: true, message: "บันทึกธุรกรรมลง Google Sheet เรียบร้อยแล้ว", id: txid });
  }

  // --- 2.1 SAVE MULTIPLE TRANSACTIONS (BATCH) ---
  if (action === 'save_transactions') {
    const transSheet = getOrCreateSheet(ss, "Transactions", [
      "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
    ]);
    
    const txs = params.transactions || [];
    txs.forEach(tx => {
      const txid = tx.id || ("TX-" + Math.floor(100000 + Math.random() * 900000));
      const timestamp = tx.timestamp || new Date().toLocaleString("th-TH");
      const type = tx.type || "income";
      const studentId = tx.studentId || "";
      const studentNo = tx.studentNo ? Number(tx.studentNo) : "";
      const studentName = tx.studentName || "";
      const amount = Number(tx.amount || 0);
      const description = tx.description || "";
      const collector = tx.collector || "";
      const method = tx.method || "cash";
      const slipUrl = tx.slipUrl || "";

      transSheet.appendRow([txid, timestamp, type, studentId, studentNo, studentName, amount, description, collector, method, slipUrl]);
    });

    return jsonResponse({ success: true, message: "บันทึกรายการแบบกลุ่มลง Google Sheet เรียบร้อยแล้ว", count: txs.length });
  }

  // --- 3. SAVE CONFIG SETTINGS ---
  if (action === 'save_settings') {
    const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
    configSheet.clear();
    configSheet.appendRow(["Parameter", "Value"]); // restore header

    const settings = [
      ["goalPerPerson", params.goalPerPerson || "200"],
      ["teacherName", params.teacherName || "ครูนิวตรอน"],
      ["currentCollectorId", params.currentCollectorId || ""],
      ["promptpayId", params.promptpayId || ""],
      ["promptpayName", params.promptpayName || ""],
      ["collectorPassword", params.collectorPassword || "1234"],
      ["teacherPassword", params.teacherPassword || "2301"]
    ];

    settings.forEach(row => configSheet.appendRow(row));

    return jsonResponse({ success: true, message: "บันทึกการตั้งค่าลง Google Sheet เรียบร้อยแล้ว" });
  }

  // --- 4. RECORD AUDIT HISTORY ---
  if (action === 'save_history') {
    const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);
    const timestamp = params.timestamp || new Date().toLocaleString("th-TH");
    const title = params.title || "";
    const desc = params.desc || "";
    const author = params.author || "";

    historySheet.appendRow([timestamp, title, desc, author]);
    return jsonResponse({ success: true, message: "บันทึกประวัติสำเร็จ" });
  }

  // --- 5. DELETE TRANSACTION ---
  if (action === 'delete_transaction') {
    const transSheet = getOrCreateSheet(ss, "Transactions", [
      "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
    ]);
    const txid = params.id;
    if (!txid) {
      return jsonResponse({ success: false, error: "ขาดข้อมูล ID ธุรกรรม" });
    }

    const rows = transSheet.getDataRange().getValues();
    let deleteRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(txid).trim()) {
        deleteRowIndex = i + 1; // 1-indexed row number
        break;
      }
    }

    if (deleteRowIndex > 0) {
      transSheet.deleteRow(deleteRowIndex);
      return jsonResponse({ success: true, message: "ลบรายการธุรกรรมเรียบร้อยแล้ว" });
    } else {
      return jsonResponse({ success: false, error: "ไม่พบรหัสธุรกรรมในชีต" });
    }
  }

  // --- 6. RESET ALL DATABASE ---
  if (action === 'reset_database') {
    const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
    const transSheet = getOrCreateSheet(ss, "Transactions", [
      "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
    ]);
    const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);

    // Reset Transactions
    transSheet.clear();
    transSheet.appendRow(["ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"]);

    // Reset History
    historySheet.clear();
    historySheet.appendRow(["Timestamp", "Title", "Description", "Author"]);

    // Reset Config to defaults
    configSheet.clear();
    configSheet.appendRow(["Parameter", "Value"]);
    const settings = [
      ["goalPerPerson", "200"],
      ["teacherName", "ครูนิวตรอน"],
      ["currentCollectorId", ""],
      ["promptpayId", "091-234-5678"],
      ["promptpayName", "เหรัญญิก ม.6/1"],
      ["collectorPassword", "1234"],
      ["teacherPassword", "2301"]
    ];
    settings.forEach(row => configSheet.appendRow(row));

    return jsonResponse({ success: true, message: "รีเซ็ตระบบฐานข้อมูลใน Google Sheets เรียบร้อยแล้ว" });
  }

  return jsonResponse({ success: false, error: "ไม่พบการกระทำ Action ที่กำหนด" });
}
