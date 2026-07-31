(() => {
  "use strict";

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbw3eNbBuhg-P-dLxBeZkYIggp0FW9GM1TdL1wVd1XeyxvwRTzw4BcMNiPBEyyWH1le-/exec";
  const SESSION_KEY = "kntTalentSessionV2";
  const PROFILE_KEY = "kntTalentProfileV1";
  const LETTERS = ["ก", "ข", "ค", "ง"];
  const questionsById = new Map(window.TALENT_QUESTIONS.map((q) => [q.id, q]));
  const $ = (id) => document.getElementById(id);
  let session = null;
  let questionOpenedAt = Date.now();
  let teacherStudents = [];
  let selectedTeacherKey = "";
  let toastTimer = null;

  const screens = {
    home: $("homeScreen"),
    practice: $("practiceScreen"),
    result: $("resultScreen"),
    teacher: $("teacherScreen")
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => node.classList.toggle("active", key === name));
    document.querySelector(".site-header").hidden = name === "teacher";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderMath(root = document.body) {
    if (typeof window.renderMathInElement !== "function") return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  function shuffleIndexes(length) {
    const values = Array.from({ length }, (_, index) => index);
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [values[index], values[swap]] = [values[swap], values[index]];
    }
    return values;
  }

  function newSession(student, questionIds = window.TALENT_QUESTIONS.map((q) => q.id), reviewMode = false) {
    const ids = reviewMode ? [...questionIds] : [...questionIds].sort(() => Math.random() - 0.5);
    const optionOrders = {};
    ids.forEach((id) => { optionOrders[id] = shuffleIndexes(questionsById.get(id).options.length); });
    return {
      version: 2,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level: 1,
      student,
      questionOrder: ids,
      optionOrders,
      current: 0,
      answers: {},
      flagged: {},
      timeByQuestion: {},
      startedAt: new Date().toISOString(),
      completedAt: null,
      synced: false,
      reviewMode
    };
  }

  function loadStoredSession() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!value || value.version !== 2 || !Array.isArray(value.questionOrder)) return null;
      if (!value.questionOrder.every((id) => questionsById.has(id))) return null;
      return value;
    } catch {
      return null;
    }
  }

  function saveElapsed() {
    if (!session || session.completedAt) return;
    const id = session.questionOrder[session.current];
    session.timeByQuestion[id] = (session.timeByQuestion[id] || 0) + Math.max(0, Date.now() - questionOpenedAt);
    questionOpenedAt = Date.now();
  }

  function persistSession() {
    if (!session) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function saveAndMark() {
    saveElapsed();
    persistSession();
    setCloudStatus("saved");
  }

  function setCloudStatus(state) {
    const node = $("cloudStatus");
    node.classList.remove("syncing", "error");
    if (state === "syncing") {
      node.classList.add("syncing");
      node.lastChild.textContent = " กำลังบันทึกผล";
    } else if (state === "error") {
      node.classList.add("error");
      node.lastChild.textContent = " เก็บไว้ในเครื่องแล้ว";
    } else {
      node.lastChild.textContent = " บันทึกความคืบหน้าอัตโนมัติ";
    }
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2400);
  }

  function currentQuestion() {
    return questionsById.get(session.questionOrder[session.current]);
  }

  function beginPractice(nextSession) {
    session = nextSession;
    questionOpenedAt = Date.now();
    persistSession();
    $("practiceStudentName").textContent = session.student.name;
    showScreen("practice");
    history.pushState({ kntTalentPractice: true }, "", location.href);
    renderQuestion();
  }

  function renderTopicMiniList() {
    const activeTopic = currentQuestion().topic;
    const topicCounts = {};
    session.questionOrder.forEach((id) => {
      const topic = questionsById.get(id).topic;
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    $("topicMiniList").innerHTML = Object.entries(window.TALENT_TOPICS)
      .filter(([key]) => topicCounts[key])
      .map(([key, topic]) => {
      const done = session.questionOrder.filter((id) => questionsById.get(id).topic === key && session.answers[id] !== undefined).length;
        return `<div class="topic-mini ${key === activeTopic ? "active" : ""}"><i></i><span>${escapeHtml(topic.short)}</span><b>${done}/${topicCounts[key]}</b></div>`;
      }).join("");
  }

  function renderQuestion() {
    const question = currentQuestion();
    const id = question.id;
    const selected = session.answers[id];
    const reviewing = session.reviewMode === "solutions";
    const checked = reviewing;
    const order = session.optionOrders[id];
    const total = session.questionOrder.length;
    const answered = Object.keys(session.answers).filter((key) => session.questionOrder.includes(key)).length;

    $("questionCounter").textContent = `ข้อ ${session.current + 1} จาก ${total}`;
    $("answeredCounter").textContent = `ตอบแล้ว ${answered} ข้อ`;
    $("progressBar").style.width = `${(answered / total) * 100}%`;
    $("questionNumber").textContent = reviewing ? `เฉลยข้อที่ ${session.current + 1}` : `ข้อ ${session.current + 1}`;
    $("questionPrompt").textContent = question.prompt;
    $("topicChip").textContent = window.TALENT_TOPICS[question.topic].label;
    $("difficultyChip").textContent = question.difficulty === 1 ? "พื้นฐานสำคัญ" : "ประยุกต์เบื้องต้น";
    $("flagButton").classList.toggle("active", Boolean(session.flagged[id]));
    $("flagButton").setAttribute("aria-pressed", String(Boolean(session.flagged[id])));
    $("flagButton").textContent = session.flagged[id] ? "★ ทำเครื่องหมายไว้" : "☆ ยังไม่แน่ใจ";

    $("choiceList").innerHTML = order.map((originalIndex, shownIndex) => {
      const isSelected = selected === originalIndex;
      const isCorrect = originalIndex === question.answer;
      const classes = [
        "choice-button",
        isSelected ? "selected" : "",
        checked && isCorrect ? "correct" : "",
        checked && isSelected && !isCorrect ? "wrong" : ""
      ].filter(Boolean).join(" ");
      const state = checked && isCorrect ? "✓" : checked && isSelected && !isCorrect ? "×" : "";
      return `<button class="${classes}" type="button" data-answer="${originalIndex}" ${checked ? "disabled" : ""}>
        <span class="choice-letter">${LETTERS[shownIndex]}.</span>
        <span class="math-content">${question.options[originalIndex]}</span>
        <span class="choice-state">${state}</span>
      </button>`;
    }).join("");

    $("choiceList").querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => selectAnswer(Number(button.dataset.answer)));
    });
    $("choiceFeedback").textContent = "";
    $("previousButton").disabled = session.current === 0;
    $("checkButton").hidden = true;
    $("nextButton").hidden = selected === undefined;
    $("nextButton").textContent = session.current === total - 1
      ? (reviewing ? "กลับหน้าสรุป →" : "ส่งคำตอบและดูผล →")
      : (reviewing ? "ดูเฉลยข้อต่อไป →" : "ข้อต่อไป →");
    renderTopicMiniList();
    renderSolution(question, checked, selected);
    renderMath($("questionShell") || document.querySelector(".question-shell"));
    questionOpenedAt = Date.now();
  }

  function selectAnswer(answer) {
    const id = currentQuestion().id;
    if (session.reviewMode === "solutions") return;
    session.answers[id] = answer;
    persistSession();
    renderQuestion();
  }

  function renderSolution(question, checked, selected) {
    $("solutionPanel").hidden = !checked;
    if (!checked) return;
    const correct = selected === question.answer;
    $("solutionResult").className = `solution-result ${correct ? "correct" : "wrong"}`;
    $("solutionResult").textContent = correct
      ? "✓ ถูกต้อง เก็บวิธีคิดนี้ไว้ใช้กับโจทย์ที่ยากขึ้นได้เลย"
      : `ยังไม่ถูก — คำตอบที่ถูกคือ ${LETTERS[session.optionOrders[question.id].indexOf(question.answer)]}. ${question.options[question.answer]}`;
    $("solutionConcept").textContent = question.concept;
    $("solutionSteps").innerHTML = question.steps.map((step) => `<li>${step}</li>`).join("");
    $("mistakeBlock").hidden = correct;
    $("solutionMistake").textContent = correct ? "" : (question.mistakes[selected] || "ลองเปรียบเทียบวิธีคิดของตนเองกับขั้นตอนด้านบนอีกครั้ง");
    $("solutionCheck").textContent = question.check;
    $("solutionTakeaway").textContent = question.takeaway;
  }

  function moveQuestion(direction) {
    saveElapsed();
    const target = session.current + direction;
    if (target < 0 || target >= session.questionOrder.length) return;
    session.current = target;
    persistSession();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function calculateStats(activeSession = session) {
    const stats = {};
    let correct = 0;
    activeSession.questionOrder.forEach((id) => {
      const question = questionsById.get(id);
      if (!stats[question.topic]) stats[question.topic] = { correct: 0, total: 0 };
      stats[question.topic].total += 1;
      if (activeSession.answers[id] === question.answer) {
        stats[question.topic].correct += 1;
        correct += 1;
      }
    });
    return { correct, total: activeSession.questionOrder.length, topics: stats };
  }

  function finishPractice() {
    saveElapsed();
    session.completedAt = session.completedAt || new Date().toISOString();
    persistSession();
    showResult();
    if (!session.reviewMode && !session.synced) syncCompletedAttempt();
  }

  function showResult() {
    const stats = calculateStats();
    const percent = Math.round((stats.correct / stats.total) * 100);
    $("resultGreeting").textContent = percent >= 80 ? "ยอดเยี่ยม เห็นวิธีคิดชัดขึ้นแล้ว" : percent >= 60 ? "ทำได้ดี กำลังไปถูกทาง" : "เริ่มเห็นจุดที่ควรเสริมแล้ว";
    $("scorePercent").textContent = `${percent}%`;
    $("scoreFraction").textContent = `${stats.correct} จาก ${stats.total} ข้อ`;
    $("scorePoints").textContent = `${stats.correct * 2} จาก ${stats.total * 2} คะแนน`;
    $("topicResults").innerHTML = Object.entries(stats.topics).map(([key, value]) => {
      const pct = Math.round((value.correct / value.total) * 100);
      return `<div class="topic-result-row">
        <div class="topic-result-name"><span>${escapeHtml(window.TALENT_TOPICS[key].short)}</span><small>${value.correct}/${value.total} ข้อ</small></div>
        <div class="result-bar"><i style="width:${pct}%"></i></div><strong>${pct}%</strong>
      </div>`;
    }).join("");
    const weakest = Object.entries(stats.topics).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
    $("nextAdviceTitle").textContent = weakest ? `แนะนำให้ทบทวน “${window.TALENT_TOPICS[weakest[0]].short}”` : "ทบทวนจุดที่ยังไม่มั่นใจ";
    $("nextAdviceText").textContent = weakest
      ? `บทนี้ทำได้ ${weakest[1].correct} จาก ${weakest[1].total} ข้อ ลองอ่านเฉลยข้อที่ผิดซ้ำแล้วฝึกอีกครั้ง`
      : "กลับมาเริ่มชุดใหม่ได้ทุกเมื่อ";
    $("reviewMistakesButton").hidden = false;
    $("syncMessage").textContent = session.reviewMode ? "รอบทบทวนนี้ไม่คิดเป็นคะแนนพัฒนาการ" : session.synced ? "บันทึกผลให้คุณครูแล้ว" : "กำลังบันทึกผลให้คุณครู…";
    showScreen("result");
    renderMath($("resultScreen"));
  }

  function durationSeconds(activeSession) {
    return Math.max(1, Math.round(Object.values(activeSession.timeByQuestion).reduce((sum, value) => sum + value, 0) / 1000));
  }

  async function saveSheetRow(subject, score, total) {
    const params = new URLSearchParams({
      action: "exam_save",
      room: session.student.room,
      no: session.student.no,
      name: session.student.name,
      subject,
      score: String(score),
      total: String(total)
    });
    await fetch(`${SHEET_URL}?${params.toString()}`, { mode: "no-cors", keepalive: true });
  }

  async function syncCompletedAttempt() {
    const stats = calculateStats();
    const duration = durationSeconds(session);
    setCloudStatus("syncing");
    try {
      const rows = [
        saveSheetRow(`KNT-TALENT|v1|L1|summary|${session.id}|${duration}`, stats.correct, stats.total),
        ...Object.entries(stats.topics).map(([topic, value]) =>
          saveSheetRow(`KNT-TALENT|v1|L1|topic:${topic}|${session.id}|${duration}`, value.correct, value.total))
      ];
      await Promise.all(rows);
      session.synced = true;
      persistSession();
      $("syncMessage").textContent = "บันทึกผลให้คุณครูแล้ว";
      setCloudStatus("saved");
    } catch {
      $("syncMessage").textContent = "ผลเก็บไว้ในเครื่องแล้ว ระบบจะส่งใหม่เมื่อกลับมาดูผล";
      setCloudStatus("error");
    }
  }

  function updateHomeState() {
    const stored = loadStoredSession();
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
    })();
    if (profile) {
      $("studentRoom").value = profile.room || "";
      $("studentNo").value = profile.no || "";
      $("studentName").value = profile.name || "";
    }
    const resumable = stored && !stored.completedAt && !stored.reviewMode;
    $("resumeCard").hidden = !resumable;
    if (resumable) {
      const done = Object.keys(stored.answers).length;
      $("resumeText").textContent = `${stored.student.name} · ตอบแล้ว ${done} จาก ${stored.questionOrder.length} ข้อ`;
    }
  }

  function requestExit() {
    if (!screens.practice.classList.contains("active")) return;
    saveAndMark();
    $("exitModal").hidden = false;
  }

  function closeExitModal() {
    $("exitModal").hidden = true;
  }

  function exitToHome() {
    saveAndMark();
    closeExitModal();
    updateHomeState();
    showScreen("home");
    toast("บันทึกไว้แล้ว กลับมาทำต่อได้ทุกเมื่อ");
  }

  function reviewSolutions() {
    session.reviewMode = "solutions";
    session.current = 0;
    persistSession();
    questionOpenedAt = Date.now();
    $("practiceStudentName").textContent = session.student.name;
    showScreen("practice");
    history.pushState({ kntTalentPractice: true }, "", location.href);
    renderQuestion();
  }

  function parseSubject(subject) {
    const parts = String(subject || "").split("|");
    if (parts.length < 6 || parts[0] !== "KNT-TALENT" || parts[1] !== "v1") return null;
    return { level: parts[2], kind: parts[3], attemptId: parts[4], duration: Number(parts[5]) || 0 };
  }

  function buildTeacherStudents(rows) {
    const studentMap = new Map();
    rows.forEach((row) => {
      const parsed = parseSubject(row.subject);
      if (!parsed) return;
      const key = `${row.room}|${row.no}|${row.name}`;
      if (!studentMap.has(key)) studentMap.set(key, {
        key, room: String(row.room || ""), no: String(row.no || ""), name: String(row.name || ""), attempts: new Map()
      });
      const student = studentMap.get(key);
      if (!student.attempts.has(parsed.attemptId)) student.attempts.set(parsed.attemptId, {
        id: parsed.attemptId, timestamp: row.timestamp, duration: parsed.duration, topics: {}
      });
      const attempt = student.attempts.get(parsed.attemptId);
      const score = Number(row.score) || 0;
      const total = Number(row.total) || 0;
      if (parsed.kind === "summary") {
        attempt.score = score;
        attempt.total = total;
        attempt.timestamp = row.timestamp || attempt.timestamp;
      } else if (parsed.kind.startsWith("topic:")) {
        attempt.topics[parsed.kind.slice(6)] = { score, total };
      }
    });

    return [...studentMap.values()].map((student) => {
      const attempts = [...student.attempts.values()]
        .filter((attempt) => Number.isFinite(attempt.score) && attempt.total > 0)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const latest = attempts.at(-1);
      const percentages = attempts.map((attempt) => Math.round((attempt.score / attempt.total) * 100));
      const recent = percentages.slice(-3);
      const recentAverage = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
      const growth = percentages.length > 1 ? recentAverage - percentages[0] : 0;
      return { ...student, attempts, latest, latestPercent: percentages.at(-1) || 0, recentAverage, growth };
    }).sort((a, b) => b.latestPercent - a.latestPercent || a.name.localeCompare(b.name, "th"));
  }

  async function loadTeacherData() {
    $("teacherStudentList").innerHTML = '<div class="loading-card">กำลังโหลดข้อมูลจาก Google Sheets…</div>';
    try {
      const response = await fetch(`${SHEET_URL}?action=exam_get`);
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      teacherStudents = buildTeacherStudents(Array.isArray(data.list) ? data.list : []);
      renderTeacherList();
      if (teacherStudents.length) selectTeacherStudent(selectedTeacherKey || teacherStudents[0].key);
      else $("studentDetail").innerHTML = '<div class="empty-detail"><span>ยังไม่มีผลการฝึก</span><p>เมื่อนักเรียนทำระดับ 1 จบ ข้อมูลจะปรากฏที่นี่</p></div>';
    } catch {
      $("teacherStudentList").innerHTML = '<div class="loading-card">โหลดข้อมูลไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วกด “โหลดข้อมูลใหม่”</div>';
      toast("ยังโหลดข้อมูลครูไม่ได้");
    }
  }

  function renderTeacherList() {
    const query = $("teacherSearch").value.trim().toLocaleLowerCase("th");
    const filtered = teacherStudents.filter((student) =>
      `${student.name} ${student.room} ${student.no}`.toLocaleLowerCase("th").includes(query));
    const attemptCount = teacherStudents.reduce((sum, student) => sum + student.attempts.length, 0);
    const average = attemptCount
      ? Math.round(teacherStudents.reduce((sum, student) =>
        sum + student.attempts.reduce((inner, attempt) => inner + (attempt.score / attempt.total) * 100, 0), 0) / attemptCount)
      : 0;
    $("teacherStudentCount").textContent = String(teacherStudents.length);
    $("teacherAttemptCount").textContent = String(attemptCount);
    $("teacherAverage").textContent = `${average}%`;
    $("teacherStudentList").innerHTML = filtered.length ? filtered.map((student) => `
      <button class="student-row ${student.key === selectedTeacherKey ? "active" : ""}" type="button" data-key="${escapeHtml(student.key)}">
        <span class="student-avatar">${escapeHtml(student.name.slice(0, 1) || "?")}</span>
        <span><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.room)} · เลขที่ ${escapeHtml(student.no)} · ${student.attempts.length} รอบ</small></span>
        <span class="student-score"><b>${student.latestPercent}%</b><small class="${student.growth > 0 ? "growth-up" : student.growth < 0 ? "growth-down" : ""}">${student.growth > 0 ? "+" : ""}${student.growth}%</small></span>
      </button>`).join("") : `<div class="loading-card">${teacherStudents.length ? "ไม่พบนักเรียนที่ค้นหา" : "ยังไม่มีผลการฝึกในระบบ"}</div>`;
    $("teacherStudentList").querySelectorAll(".student-row").forEach((row) =>
      row.addEventListener("click", () => selectTeacherStudent(row.dataset.key)));
  }

  function selectTeacherStudent(key) {
    const student = teacherStudents.find((item) => item.key === key);
    if (!student) return;
    selectedTeacherKey = key;
    renderTeacherList();
    const topicTotals = {};
    student.attempts.slice(-3).forEach((attempt) => Object.entries(attempt.topics).forEach(([topic, value]) => {
      if (!topicTotals[topic]) topicTotals[topic] = { score: 0, total: 0 };
      topicTotals[topic].score += value.score;
      topicTotals[topic].total += value.total;
    }));
    const growthClass = student.growth > 0 ? "growth-up" : student.growth < 0 ? "growth-down" : "";
    $("studentDetail").innerHTML = `
      <div class="detail-head"><div><h2>${escapeHtml(student.name)}</h2><p>${escapeHtml(student.room)} · เลขที่ ${escapeHtml(student.no)}</p></div>
        <div class="detail-latest"><small>ล่าสุด</small><strong>${student.latestPercent}%</strong></div></div>
      <div class="detail-grid">
        <div class="detail-stat"><span>ฝึกแล้ว</span><strong>${student.attempts.length} รอบ</strong></div>
        <div class="detail-stat"><span>เฉลี่ย 3 รอบล่าสุด</span><strong>${student.recentAverage}%</strong></div>
        <div class="detail-stat"><span>พัฒนาการเทียบครั้งแรก</span><strong class="${growthClass}">${student.growth > 0 ? "+" : ""}${student.growth}%</strong></div>
      </div>
      <section class="detail-section"><h3>ความเข้าใจรายบท (ไม่เกิน 3 รอบล่าสุด)</h3>
        ${Object.entries(window.TALENT_TOPICS).map(([key, topic]) => {
          const value = topicTotals[key] || { score: 0, total: 0 };
          const pct = value.total ? Math.round((value.score / value.total) * 100) : 0;
          return `<div class="mastery-row"><span>${escapeHtml(topic.short)}</span><div class="result-bar"><i style="width:${pct}%"></i></div><strong>${value.total ? `${pct}%` : "–"}</strong></div>`;
        }).join("")}
      </section>
      <section class="detail-section"><h3>คะแนนย้อนหลัง</h3><div class="attempt-list">
        ${[...student.attempts].reverse().map((attempt, index) => {
          const pct = Math.round((attempt.score / attempt.total) * 100);
          const date = attempt.timestamp ? new Date(attempt.timestamp).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "ไม่ระบุเวลา";
          return `<div class="attempt-item"><span><b>${index === 0 ? "รอบล่าสุด" : `ย้อนหลัง ${index} รอบ`}</b><small>${escapeHtml(date)} · ${Math.max(1, Math.round(attempt.duration / 60))} นาที</small></span><strong>${attempt.score}/${attempt.total} · ${pct}%</strong></div>`;
        }).join("")}
      </div></section>`;
  }

  function openTeacherLogin() {
    $("teacherLoginModal").hidden = false;
    $("teacherLoginError").textContent = "";
    $("teacherCode").value = "";
    setTimeout(() => $("teacherCode").focus(), 80);
  }

  function bindEvents() {
    $("studentForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const student = {
        room: $("studentRoom").value.trim(),
        no: $("studentNo").value.trim(),
        name: $("studentName").value.trim()
      };
      if (!student.room || !student.no || !student.name) return;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(student));
      beginPractice(newSession(student));
    });
    $("resumeButton").addEventListener("click", () => {
      const stored = loadStoredSession();
      if (stored) beginPractice(stored);
    });
    $("discardButton").addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      updateHomeState();
      toast("ล้างแบบฝึกเดิมแล้ว พร้อมเริ่มชุดใหม่");
    });
    $("exitPractice").addEventListener("click", requestExit);
    $("stayButton").addEventListener("click", closeExitModal);
    $("saveExitButton").addEventListener("click", exitToHome);
    $("flagButton").addEventListener("click", () => {
      const id = currentQuestion().id;
      session.flagged[id] = !session.flagged[id];
      persistSession();
      renderQuestion();
    });
    $("previousButton").addEventListener("click", () => moveQuestion(-1));
    $("nextButton").addEventListener("click", () => {
      if (session.current === session.questionOrder.length - 1 && session.reviewMode === "solutions") showResult();
      else if (session.current === session.questionOrder.length - 1) finishPractice();
      else moveQuestion(1);
    });
    $("reviewMistakesButton").addEventListener("click", reviewSolutions);
    $("homeButton").addEventListener("click", () => {
      updateHomeState();
      showScreen("home");
    });
    $("teacherEntry").addEventListener("click", openTeacherLogin);
    $("cancelTeacherLogin").addEventListener("click", () => { $("teacherLoginModal").hidden = true; });
    $("teacherLoginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if ($("teacherCode").value !== "newtron05") {
        $("teacherLoginError").textContent = "รหัสครูไม่ถูกต้อง กรุณาลองอีกครั้ง";
        return;
      }
      $("teacherLoginModal").hidden = true;
      showScreen("teacher");
      loadTeacherData();
    });
    $("teacherBack").addEventListener("click", () => {
      showScreen("home");
      updateHomeState();
    });
    $("refreshTeacher").addEventListener("click", loadTeacherData);
    $("teacherSearch").addEventListener("input", renderTeacherList);
    $("exitModal").addEventListener("click", (event) => { if (event.target === $("exitModal")) closeExitModal(); });
    $("teacherLoginModal").addEventListener("click", (event) => {
      if (event.target === $("teacherLoginModal")) $("teacherLoginModal").hidden = true;
    });
    window.addEventListener("popstate", () => {
      if (screens.practice.classList.contains("active")) {
        history.pushState({ kntTalentPractice: true }, "", location.href);
        requestExit();
      }
    });
    window.addEventListener("beforeunload", (event) => {
      if (!screens.practice.classList.contains("active")) return;
      saveAndMark();
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    bindEvents();
    updateHomeState();
    renderMath(document.body);
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
