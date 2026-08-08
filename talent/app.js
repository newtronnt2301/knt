(() => {
  "use strict";

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbw3eNbBuhg-P-dLxBeZkYIggp0FW9GM1TdL1wVd1XeyxvwRTzw4BcMNiPBEyyWH1le-/exec";
  const ACCOUNT_API_URL = window.KNT_TALENT_API_URL || "https://script.google.com/macros/s/AKfycbyiCKS6zFxQikF1hFmJm8_Xq4BP3_vH4UeF-lyWzUVB_mhcaCFYSHfyS2XNDyYV8U78/exec";
  const AUTH_KEY = "kntTalentAuthV1";
  const SESSION_KEY = "kntTalentSessionV2";
  const PROFILE_KEY = "kntTalentProfileV1";
  const LETTERS = ["ก", "ข", "ค", "ง"];
  const LEVELS = {
    1: { name: "ตั้งหลักสนามจริง" },
    2: { name: "ใกล้สนามจริง" },
    3: { name: "ฝึกคัดตัว" }
  };
  const FRACTION_OPERAND = String.raw`(?:\([^()]+\)|\|[^|]+\||\\sqrt(?:\{[^{}]+\}|[A-Za-z0-9]+)|(?:\\[A-Za-z]+(?:_\{[^{}]+\}|_[A-Za-z0-9]+)?[A-Za-z0-9]*|[A-Za-z0-9_]+)(?:\^\{[^{}]+\}|\^[A-Za-z0-9]+)?)`;
  const SLASH_FRACTION = new RegExp(`(${FRACTION_OPERAND})\\s*\\/\\s*(${FRACTION_OPERAND})`, "g");

  function stripFractionParentheses(operand) {
    return operand.startsWith("(") && operand.endsWith(")") ? operand.slice(1, -1).trim() : operand;
  }

  function stackSlashFractions(math) {
    let formatted = math;
    for (let pass = 0; pass < 5; pass += 1) {
      const next = formatted.replace(SLASH_FRACTION, (_, numerator, denominator) =>
        `\\dfrac{${stripFractionParentheses(numerator)}}{${stripFractionParentheses(denominator)}}`
      );
      if (next === formatted) break;
      formatted = next;
    }
    return formatted;
  }

  function readableMath(value) {
    return String(value ?? "")
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `\\(${stackSlashFractions(math)}\\)`)
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\\[${stackSlashFractions(math)}\\]`);
  }

  function enhanceQuestionMath(question) {
    ["prompt", "concept", "check", "takeaway"].forEach((field) => {
      question[field] = readableMath(question[field]);
    });
    ["options", "steps", "mistakes"].forEach((field) => {
      question[field] = (question[field] || []).map(readableMath);
    });
  }

  window.TALENT_QUESTIONS.forEach(enhanceQuestionMath);
  const questionsById = new Map(window.TALENT_QUESTIONS.map((q) => [q.id, q]));
  const $ = (id) => document.getElementById(id);
  let session = null;
  let questionOpenedAt = Date.now();
  let teacherStudents = [];
  let selectedTeacherKey = "";
  let selectedLevel = 1;
  let toastTimer = null;
  let auth = null;
  let dashboardData = { attempts: [], answers: [] };
  let pendingRegisteredAuth = null;
  let teacherToken = "";

  const screens = {
    auth: $("authScreen"),
    dashboard: $("dashboardScreen"),
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

  function newSession(student, level = selectedLevel, selectedIds = null, mode = "online", paperCode = "") {
    const questionIds = selectedIds || window.TALENT_QUESTIONS.filter((q) => q.level === level).map((q) => q.id);
    const ids = mode === "paper" ? [...questionIds].slice(0, 30) : [...questionIds].sort(() => Math.random() - 0.5).slice(0, 30);
    const optionOrders = {};
    ids.forEach((id) => { optionOrders[id] = mode === "paper" ? questionsById.get(id).options.map((_, index) => index) : shuffleIndexes(questionsById.get(id).options.length); });
    return {
      version: 2,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level,
      student,
      mode,
      paperCode,
      questionOrder: ids,
      optionOrders,
      current: 0,
      answers: {},
      flagged: {},
      timeByQuestion: {},
      startedAt: new Date().toISOString(),
      completedAt: null,
      synced: false,
      reviewMode: false
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
    updateLevelLabels(session.level);
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

    $("questionCounter").textContent = reviewing ? `เฉลยข้อ ${session.current + 1} จาก ${total}` : `ข้อ ${session.current + 1} จาก ${total}`;
    $("answeredCounter").textContent = reviewing ? `ถูก ${calculateStats().correct} ข้อ` : `ตอบแล้ว ${answered} ข้อ`;
    $("progressBar").style.width = `${(answered / total) * 100}%`;
    $("questionNumber").textContent = reviewing ? `เฉลยข้อที่ ${session.current + 1}` : `ข้อ ${session.current + 1}`;
    $("questionPrompt").textContent = question.prompt;
    $("topicChip").textContent = window.TALENT_TOPICS[question.topic].label;
    $("difficultyChip").textContent = question.difficulty === 1
      ? "พื้นฐานสำคัญ"
      : question.difficulty === 2 ? "ประยุกต์" : "โจทย์หลายขั้น";
    $("flagButton").classList.toggle("active", Boolean(session.flagged[id]));
    $("flagButton").hidden = reviewing;
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
    renderSolutionNavigator(reviewing);
    renderTopicMiniList();
    renderSolution(question, checked, selected);
    renderMath($("questionShell") || document.querySelector(".question-shell"));
    questionOpenedAt = Date.now();
  }

  function renderSolutionNavigator(reviewing) {
    $("solutionNavigator").hidden = !reviewing;
    if (!reviewing) return;
    $("solutionQuestionGrid").innerHTML = session.questionOrder.map((id, index) => {
      const question = questionsById.get(id);
      const correct = session.answers[id] === question.answer;
      const state = correct ? "correct" : "wrong";
      const current = index === session.current ? "current" : "";
      return `<button class="solution-number ${state} ${current}" type="button" data-index="${index}" aria-label="ดูเฉลยข้อ ${index + 1}">${index + 1}</button>`;
    }).join("");
    $("solutionQuestionGrid").querySelectorAll(".solution-number").forEach((button) => {
      button.addEventListener("click", () => jumpToSolution(Number(button.dataset.index)));
    });
  }

  function jumpToSolution(index) {
    if (session.reviewMode !== "solutions" || index < 0 || index >= session.questionOrder.length) return;
    saveElapsed();
    session.current = index;
    persistSession();
    renderQuestion();
    $("questionShell").scrollIntoView({ behavior: "smooth", block: "start" });
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
    $("solutionSteps").innerHTML = question.steps.map((step) => `<li><div>${step}</div></li>`).join("");
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
    $("resultLevelLabel").textContent = `ฝึกระดับ ${session.level} สำเร็จแล้ว`;
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

  async function apiPost(action, payload = {}) {
    const response = await fetch(ACCOUNT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "API_ERROR");
    return data.data;
  }

  async function saveSheetRow(activeSession, subject, score, total) {
    const params = new URLSearchParams({
      action: "exam_save",
      room: activeSession.student.room,
      no: activeSession.student.no,
      name: activeSession.student.name,
      subject,
      score: String(score),
      total: String(total)
    });
    await fetch(`${SHEET_URL}?${params.toString()}`, { mode: "no-cors", keepalive: true });
  }

  async function syncCompletedAttempt() {
    const completedSession = session;
    const stats = calculateStats(completedSession);
    const duration = durationSeconds(completedSession);
    setCloudStatus("syncing");
    try {
      if (auth?.token) {
        const accountResult = await apiPost("attempt_submit", {
          token: auth.token,
          attempt: {
            id: completedSession.id,
            level: completedSession.level,
            mode: completedSession.mode || "online",
            paperCode: completedSession.paperCode || "",
            questionIds: completedSession.questionOrder,
            durationSec: duration,
            startedAt: completedSession.startedAt,
            answers: completedSession.questionOrder.map((id) => {
              const question = questionsById.get(id);
              return {
                questionId: id,
                topic: question.topic,
                skill: question.concept,
                selected: completedSession.answers[id],
                correct: question.answer,
                isCorrect: completedSession.answers[id] === question.answer,
                timeMs: completedSession.timeByQuestion[id] || 0,
                flagged: Boolean(completedSession.flagged[id])
              };
            })
          }
        });
        if (accountResult.dashboard) dashboardData = accountResult.dashboard;
      }
      const rows = [
        saveSheetRow(completedSession, `KNT-TALENT|v1|L${completedSession.level}|summary|${completedSession.id}|${duration}`, stats.correct, stats.total),
        ...Object.entries(stats.topics).map(([topic, value]) =>
          saveSheetRow(completedSession, `KNT-TALENT|v1|L${completedSession.level}|topic:${topic}|${completedSession.id}|${duration}`, value.correct, value.total))
      ];
      await Promise.all(rows);
      completedSession.synced = true;
      if (session?.id === completedSession.id) persistSession();
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

  function selectLevel(level) {
    if (!LEVELS[level]) return;
    selectedLevel = level;
    document.querySelectorAll(".level-card[data-level]").forEach((card) => {
      card.classList.toggle("selected", Number(card.dataset.level) === level);
    });
    $("startButtonText").textContent = `เริ่มฝึกระดับ ${level}`;
  }

  function updateLevelLabels(level) {
    const info = LEVELS[level] || LEVELS[1];
    $("practiceLevelLabel").textContent = `ระดับ ${level}`;
    $("focusLevelNumber").textContent = String(level).padStart(2, "0");
    $("focusLevelName").textContent = info.name;
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
    if (auth) loadDashboard();
    else showScreen("auth");
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
        id: parsed.attemptId, level: parsed.level, timestamp: row.timestamp, duration: parsed.duration, topics: {}
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
      const comparableAttempts = latest ? attempts.filter((attempt) => attempt.level === latest.level) : [];
      const percentages = comparableAttempts.map((attempt) => Math.round((attempt.score / attempt.total) * 100));
      const recent = percentages.slice(-3);
      const recentAverage = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
      const growth = percentages.length > 1 ? recentAverage - percentages[0] : 0;
      return { ...student, attempts, latest, latestLevel: latest?.level || "L1", latestPercent: percentages.at(-1) || 0, recentAverage, growth };
    }).sort((a, b) => b.latestPercent - a.latestPercent || a.name.localeCompare(b.name, "th"));
  }

  async function loadTeacherData() {
    $("teacherStudentList").innerHTML = '<div class="loading-card">กำลังโหลดข้อมูลจาก Google Sheets…</div>';
    try {
      const response = await fetch(`${SHEET_URL}?action=exam_get`);
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      const allRows = Array.isArray(data.list) ? [...data.list] : [];
      if (teacherToken) {
        try {
          const modern = await apiGet("teacher_data", { teacherToken });
          const studentMap = new Map((modern.students || []).map((student) => [student.studentId, student]));
          const answerMap = new Map();
          (modern.answers || []).forEach((answer) => {
            const key = `${answer.attemptId}|${answer.topic}`;
            if (!answerMap.has(key)) answerMap.set(key, { score: 0, total: 0 });
            const value = answerMap.get(key);
            value.total += 1;
            if (answer.isCorrect) value.score += 1;
          });
          (modern.attempts || []).forEach((attempt) => {
            const student = studentMap.get(attempt.studentId);
            if (!student) return;
            const base = { timestamp: attempt.completedAt, room: student.room || student.grade, no: student.no, name: student.fullName };
            allRows.push({ ...base, subject: `KNT-TALENT|v1|L${attempt.level}|summary|${attempt.id}|${attempt.durationSec}`, score: attempt.score, total: attempt.total });
            Object.keys(window.TALENT_TOPICS).forEach((topic) => {
              const value = answerMap.get(`${attempt.id}|${topic}`);
              if (value) allRows.push({ ...base, subject: `KNT-TALENT|v1|L${attempt.level}|topic:${topic}|${attempt.id}|${attempt.durationSec}`, score: value.score, total: value.total });
            });
          });
        } catch { /* keep legacy teacher data available */ }
      }
      teacherStudents = buildTeacherStudents(allRows);
      renderTeacherList();
      if (teacherStudents.length) selectTeacherStudent(selectedTeacherKey || teacherStudents[0].key);
      else $("studentDetail").innerHTML = '<div class="empty-detail"><span>ยังไม่มีผลการฝึก</span><p>เมื่อนักเรียนทำแบบฝึกระดับใดระดับหนึ่งจบ ข้อมูลจะปรากฏที่นี่</p></div>';
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
        <span class="student-score"><b>${student.latestPercent}%</b><small>ระดับ ${escapeHtml(student.latestLevel.replace("L", ""))}</small></span>
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
    const comparableAttempts = student.attempts.filter((attempt) => attempt.level === student.latestLevel);
    comparableAttempts.slice(-3).forEach((attempt) => Object.entries(attempt.topics).forEach(([topic, value]) => {
      if (!topicTotals[topic]) topicTotals[topic] = { score: 0, total: 0 };
      topicTotals[topic].score += value.score;
      topicTotals[topic].total += value.total;
    }));
    const growthClass = student.growth > 0 ? "growth-up" : student.growth < 0 ? "growth-down" : "";
    $("studentDetail").innerHTML = `
      <div class="detail-head"><div><h2>${escapeHtml(student.name)}</h2><p>${escapeHtml(student.room)} · เลขที่ ${escapeHtml(student.no)}</p></div>
        <div class="detail-latest"><small>ล่าสุด · ระดับ ${escapeHtml(student.latestLevel.replace("L", ""))}</small><strong>${student.latestPercent}%</strong></div></div>
      <div class="detail-grid">
        <div class="detail-stat"><span>ฝึกแล้ว</span><strong>${student.attempts.length} รอบ</strong></div>
        <div class="detail-stat"><span>เฉลี่ย 3 รอบล่าสุด · ระดับ ${escapeHtml(student.latestLevel.replace("L", ""))}</span><strong>${student.recentAverage}%</strong></div>
        <div class="detail-stat"><span>พัฒนาการระดับเดียวกัน</span><strong class="${growthClass}">${student.growth > 0 ? "+" : ""}${student.growth}%</strong></div>
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
          return `<div class="attempt-item"><span><b>${index === 0 ? "รอบล่าสุด" : `ย้อนหลัง ${index} รอบ`} · ระดับ ${escapeHtml(attempt.level.replace("L", ""))}</b><small>${escapeHtml(date)} · ${Math.max(1, Math.round(attempt.duration / 60))} นาที</small></span><strong>${attempt.score}/${attempt.total} · ${pct}%</strong></div>`;
        }).join("")}
      </div></section>`;
  }

  function loadAuth() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
      if (stored?.token && stored?.student) return stored;
    } catch { /* ignore broken local data */ }
    return null;
  }

  function saveAuth(nextAuth) {
    auth = nextAuth;
    if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_KEY);
  }

  function accountStudent() {
    const student = auth?.student || {};
    return { name: student.fullName || student.username || "นักเรียน", room: student.room || student.grade || "–", no: student.no || "–", studentId: student.studentId || "" };
  }

  async function apiGet(action, params = {}) {
    const query = new URLSearchParams({ action, ...params });
    const response = await fetch(`${ACCOUNT_API_URL}?${query.toString()}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "API_ERROR");
    return data.data || data.student || data.paper;
  }

  function accountError(error) {
    const messages = {
      USERNAME_INVALID: "ชื่อผู้ใช้ต้องเป็นอังกฤษ ตัวเลข จุด ขีด หรือขีดล่าง 4–24 ตัว",
      USERNAME_TAKEN: "ชื่อผู้ใช้นี้มีคนใช้แล้ว ลองเติมตัวเลขท้ายชื่อ",
      PASSWORD_INVALID: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว",
      NAME_INVALID: "กรุณากรอกชื่อ-นามสกุลจริง",
      LOGIN_INVALID: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      RECOVERY_INVALID: "ชื่อผู้ใช้หรือรหัสกู้คืนไม่ถูกต้อง",
      SESSION_EXPIRED: "หมดเวลาเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่",
      AUTH_REQUIRED: "กรุณาเข้าสู่ระบบใหม่",
      PAPER_NOT_FOUND: "ไม่พบรหัสชุดกระดาษนี้ กรุณาตรวจตัวอักษรอีกครั้ง"
    };
    return messages[error?.message] || "ยังเชื่อมต่อระบบไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง";
  }

  function setAuthTab(tab) {
    const registering = tab === "register";
    $("loginTab").classList.toggle("active", !registering);
    $("registerTab").classList.toggle("active", registering);
    $("loginForm").hidden = registering;
    $("registerForm").hidden = !registering;
    (registering ? $("registerName") : $("loginUsername")).focus();
  }

  async function loadDashboard() {
    if (!auth?.token) { showScreen("auth"); return; }
    showScreen("dashboard");
    $("dashboardGreeting").textContent = `สวัสดี ${auth.student.fullName || auth.student.username}`;
    try {
      dashboardData = await apiGet("dashboard", { token: auth.token });
      if (dashboardData.student) {
        auth.student = dashboardData.student;
        saveAuth(auth);
      }
      renderDashboard();
    } catch (error) {
      if (["AUTH_REQUIRED", "SESSION_EXPIRED", "ACCOUNT_DISABLED"].includes(error.message)) {
        saveAuth(null);
        showScreen("auth");
        toast(accountError(error));
        return;
      }
      renderDashboard();
      toast(accountError(error));
    }
  }

  function seenQuestionIds(level) {
    return new Set((dashboardData.answers || []).filter((answer) => Number(answer.level) === level).map((answer) => answer.questionId));
  }

  function chooseQuestionIds(level, count = 30) {
    const pool = window.TALENT_QUESTIONS.filter((question) => question.level === level).map((question) => question.id);
    const seen = seenQuestionIds(level);
    const fresh = pool.filter((id) => !seen.has(id)).sort(() => Math.random() - 0.5);
    if (fresh.length >= count) {
      if (level === 3 && count === 30) {
        const balanced = Object.keys(window.TALENT_TOPICS).flatMap((topic) => fresh.filter((id) => questionsById.get(id).topic === topic).slice(0, 5));
        if (balanced.length === 30) return balanced.sort(() => Math.random() - 0.5);
      }
      return fresh.slice(0, count);
    }
    const wrongCounts = {};
    (dashboardData.answers || []).filter((answer) => Number(answer.level) === level && !answer.isCorrect).forEach((answer) => { wrongCounts[answer.questionId] = (wrongCounts[answer.questionId] || 0) + 1; });
    const review = pool.filter((id) => seen.has(id)).sort((a, b) => (wrongCounts[b] || 0) - (wrongCounts[a] || 0) || Math.random() - 0.5);
    return [...fresh, ...review].slice(0, Math.min(count, pool.length));
  }

  function startAccountPractice(level) {
    const stored = loadStoredSession();
    if (stored && !stored.completedAt && stored.student?.studentId === auth?.student?.studentId) {
      if (confirm("มีแบบฝึกที่ยังทำไม่จบ ต้องการทำชุดเดิมต่อหรือไม่?")) { beginPractice(stored); return; }
    }
    selectedLevel = level;
    beginPractice(newSession(accountStudent(), level, chooseQuestionIds(level)));
  }

  function renderDashboard() {
    const attempts = [...(dashboardData.attempts || [])].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    const answers = dashboardData.answers || [];
    const latest = attempts.at(-1);
    const recent = attempts.slice(-3).map((attempt) => Math.round((attempt.score / attempt.total) * 100));
    const recentAverage = recent.length ? Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length) : null;
    const firstPercent = attempts.length ? Math.round((attempts[0].score / attempts[0].total) * 100) : null;
    const growth = recentAverage == null || attempts.length < 2 ? null : recentAverage - firstPercent;
    $("dashLatest").textContent = latest ? `${Math.round((latest.score / latest.total) * 100)}%` : "–";
    $("dashLatestLevel").textContent = latest ? `ระดับ ${latest.level} · ${latest.score}/${latest.total} ข้อ` : "ยังไม่เคยฝึก";
    $("dashAverage").textContent = recentAverage == null ? "–" : `${recentAverage}%`;
    $("dashAttempts").textContent = `${attempts.length} รอบ`;
    $("dashQuestionCount").textContent = `${answers.length} ข้อที่บันทึกแล้ว`;
    $("dashGrowth").textContent = growth == null ? "–" : `${growth > 0 ? "+" : ""}${growth}%`;
    $("dashGrowth").className = growth > 0 ? "growth-up" : growth < 0 ? "growth-down" : "";

    $("dashboardLevelGrid").innerHTML = [1, 2, 3].map((level) => {
      const total = window.TALENT_QUESTIONS.filter((question) => question.level === level).length;
      const fresh = Math.max(0, total - seenQuestionIds(level).size);
      return `<button class="dash-level ${fresh < 30 ? "exhausted" : ""}" type="button" data-dashboard-level="${level}"><span>LEVEL ${String(level).padStart(2, "0")}</span><strong>${LEVELS[level].name}</strong><small>${total} ข้อในคลัง · ยังไม่เคยทำ ${fresh} ข้อ</small><b>${fresh >= 30 ? "เริ่มชุดใหม่ 30 ข้อ →" : fresh > 0 ? `ทำข้อใหม่ ${fresh} ข้อ + ทบทวนจุดอ่อน →` : "ทบทวนจุดอ่อนโดยไม่คิดว่าเป็นข้อใหม่ →"}</b></button>`;
    }).join("");
    $("dashboardLevelGrid").querySelectorAll("[data-dashboard-level]").forEach((button) => button.addEventListener("click", () => startAccountPractice(Number(button.dataset.dashboardLevel))));

    const topicStats = {};
    Object.keys(window.TALENT_TOPICS).forEach((topic) => { topicStats[topic] = { correct: 0, total: 0 }; });
    answers.forEach((answer) => { if (topicStats[answer.topic]) { topicStats[answer.topic].total += 1; if (answer.isCorrect) topicStats[answer.topic].correct += 1; } });
    $("studentTopicProgress").innerHTML = Object.entries(topicStats).map(([topic, value]) => {
      const percent = value.total ? Math.round((value.correct / value.total) * 100) : 0;
      return `<div class="topic-result-row"><div class="topic-result-name"><span>${escapeHtml(window.TALENT_TOPICS[topic].short)}</span><small>${value.total ? `${value.correct}/${value.total} ข้อ` : "ยังไม่มีข้อมูล"}</small></div><div class="result-bar"><i style="width:${percent}%"></i></div><strong>${value.total ? `${percent}%` : "–"}</strong></div>`;
    }).join("");

    const weakTopics = Object.entries(topicStats).filter(([, value]) => value.total).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total)).slice(0, 3);
    $("readingPlan").innerHTML = weakTopics.length ? weakTopics.map(([topic, value], index) => {
      const pct = Math.round((value.correct / value.total) * 100);
      const action = pct < 50 ? "อ่านแนวคิดพื้นฐานและตัวอย่างทีละขั้น" : pct < 75 ? "ทบทวนข้อที่ผิด แล้วลองทำโดยไม่ดูเฉลย" : "เก็บรายละเอียดโจทย์หลายขั้น";
      return `<div class="plan-row"><span><strong>${index + 1}. ${escapeHtml(window.TALENT_TOPICS[topic].label)}</strong><small>${action}</small></span><b>${pct}%</b></div>`;
    }).join("") : '<div class="empty-dashboard">เมื่อทำแบบฝึกครั้งแรก ระบบจะจัดแผนอ่านให้ตามข้อที่ตอบผิดจริง</div>';

    const latestByQuestion = new Map();
    answers.forEach((answer) => latestByQuestion.set(answer.questionId, answer));
    const mistakes = [...latestByQuestion.values()].filter((answer) => !answer.isCorrect && questionsById.has(answer.questionId)).slice(-8).reverse();
    $("mistakeNotebook").innerHTML = mistakes.length ? mistakes.map((answer) => {
      const question = questionsById.get(answer.questionId);
      return `<div class="notebook-row"><span><strong>${escapeHtml(window.TALENT_TOPICS[question.topic].short)} · ${escapeHtml(answer.questionId)}</strong><small>${escapeHtml(question.concept)}</small></span><button type="button" data-review-id="${escapeHtml(answer.questionId)}">ดูเฉลย</button></div>`;
    }).join("") : '<div class="empty-dashboard">ยังไม่มีข้อที่ต้องทบทวน ทำแบบฝึกแล้วข้อที่ผิดจะมาอยู่ตรงนี้</div>';
    $("mistakeNotebook").querySelectorAll("[data-review-id]").forEach((button) => button.addEventListener("click", () => reviewSavedMistake(button.dataset.reviewId)));
  }

  function reviewSavedMistake(questionId) {
    const answer = [...(dashboardData.answers || [])].reverse().find((item) => item.questionId === questionId);
    if (!answer || !questionsById.has(questionId)) return;
    const review = newSession(accountStudent(), Number(answer.level), [questionId]);
    review.answers[questionId] = Number(answer.selected);
    review.completedAt = new Date().toISOString();
    review.reviewMode = "solutions";
    review.synced = true;
    beginPractice(review);
  }

  function openTeacherLogin() {
    $("teacherLoginModal").hidden = false;
    $("teacherLoginError").textContent = "";
    $("teacherCode").value = "";
    setTimeout(() => $("teacherCode").focus(), 80);
  }

  function bindEvents() {
    $("loginTab").addEventListener("click", () => setAuthTab("login"));
    $("registerTab").addEventListener("click", () => setAuthTab("register"));
    $("loginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      $("loginError").textContent = "";
      const button = event.submitter || event.currentTarget.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "กำลังเข้าสู่ระบบ…";
      try {
        const data = await apiPost("login", { username: $("loginUsername").value.trim(), password: $("loginPassword").value });
        saveAuth(data);
        $("loginPassword").value = "";
        await loadDashboard();
      } catch (error) { $("loginError").textContent = accountError(error); }
      finally { button.disabled = false; button.textContent = "เข้าสู่ระบบ →"; }
    });
    $("registerForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      $("registerError").textContent = "";
      const button = event.submitter || event.currentTarget.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "กำลังสร้างรหัส…";
      try {
        const data = await apiPost("register", {
          fullName: $("registerName").value.trim(), school: $("registerSchool").value.trim(), grade: $("registerGrade").value.trim(),
          room: $("registerRoom").value.trim(), no: $("registerNo").value.trim(), username: $("registerUsername").value.trim(), password: $("registerPassword").value
        });
        pendingRegisteredAuth = { token: data.token, student: data.student };
        $("newRecoveryCode").textContent = data.recoveryCode;
        $("recoveryCodeModal").hidden = false;
      } catch (error) { $("registerError").textContent = accountError(error); }
      finally { button.disabled = false; button.textContent = "สมัครและเริ่มฝึก →"; }
    });
    $("confirmRecoveryCode").addEventListener("click", async () => {
      $("recoveryCodeModal").hidden = true;
      saveAuth(pendingRegisteredAuth);
      pendingRegisteredAuth = null;
      await loadDashboard();
    });
    $("forgotPassword").addEventListener("click", () => { $("recoveryModal").hidden = false; $("recoveryError").textContent = ""; });
    $("cancelRecovery").addEventListener("click", () => { $("recoveryModal").hidden = true; });
    $("recoveryForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      $("recoveryError").textContent = "";
      try {
        await apiPost("reset_password", { username: $("recoveryUsername").value.trim(), recoveryCode: $("recoveryCode").value.trim(), newPassword: $("recoveryPassword").value });
        $("recoveryModal").hidden = true;
        $("loginUsername").value = $("recoveryUsername").value.trim();
        setAuthTab("login");
        toast("ตั้งรหัสผ่านใหม่แล้ว กรุณาเข้าสู่ระบบ");
      } catch (error) { $("recoveryError").textContent = accountError(error); }
    });
    $("logoutButton").addEventListener("click", async () => {
      const token = auth?.token;
      saveAuth(null);
      dashboardData = { attempts: [], answers: [] };
      showScreen("auth");
      if (token) apiPost("logout", { token }).catch(() => {});
    });
    $("paperModeButton").addEventListener("click", () => { $("paperModal").hidden = false; $("paperError").textContent = ""; $("paperCodeInput").focus(); });
    $("cancelPaper").addEventListener("click", () => { $("paperModal").hidden = true; });
    $("loadPaper").addEventListener("click", async () => {
      $("paperError").textContent = "";
      try {
        const paper = await apiGet("paper_get", { code: $("paperCodeInput").value.trim().toUpperCase() });
        if (!paper.questionIds.every((id) => questionsById.has(id))) throw new Error("PAPER_NOT_FOUND");
        $("paperModal").hidden = true;
        beginPractice(newSession(accountStudent(), paper.level, paper.questionIds, "paper", paper.paperCode));
      } catch (error) { $("paperError").textContent = accountError(error); }
    });
    document.querySelectorAll(".level-card[data-level]").forEach((card) => {
      card.addEventListener("click", () => selectLevel(Number(card.dataset.level)));
    });
    $("studentForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const student = {
        room: $("studentRoom").value.trim(),
        no: $("studentNo").value.trim(),
        name: $("studentName").value.trim()
      };
      if (!student.room || !student.no || !student.name) return;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(student));
      beginPractice(newSession(student, selectedLevel));
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
    $("backToResultButton").addEventListener("click", showResult);
    $("homeButton").addEventListener("click", () => {
      if (auth) loadDashboard();
      else showScreen("auth");
    });
    $("teacherEntry").addEventListener("click", openTeacherLogin);
    $("cancelTeacherLogin").addEventListener("click", () => { $("teacherLoginModal").hidden = true; });
    $("teacherLoginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const data = await apiPost("teacher_login", { code: $("teacherCode").value });
        teacherToken = data.teacherToken;
      } catch {
        $("teacherLoginError").textContent = "รหัสครูไม่ถูกต้อง กรุณาลองอีกครั้ง";
        return;
      }
      $("teacherLoginModal").hidden = true;
      showScreen("teacher");
      loadTeacherData();
    });
    $("teacherBack").addEventListener("click", () => {
      if (auth) loadDashboard();
      else showScreen("auth");
    });
    $("refreshTeacher").addEventListener("click", loadTeacherData);
    $("createPaperButton").addEventListener("click", () => { $("createPaperModal").hidden = false; $("createPaperError").textContent = ""; });
    $("cancelCreatePaper").addEventListener("click", () => { $("createPaperModal").hidden = true; });
    $("generatePaper").addEventListener("click", async () => {
      const level = Number($("paperLevelSelect").value);
      const levelPool = window.TALENT_QUESTIONS.filter((question) => question.level === level);
      const ids = level === 3
        ? Object.keys(window.TALENT_TOPICS).flatMap((topic) => levelPool.filter((question) => question.topic === topic).sort(() => Math.random() - 0.5).slice(0, 5).map((question) => question.id)).sort(() => Math.random() - 0.5)
        : levelPool.map((question) => question.id).sort(() => Math.random() - 0.5).slice(0, 30);
      $("createPaperError").textContent = "";
      try {
        const paper = await apiPost("paper_create", { teacherToken, level, questionIds: ids });
        $("createPaperModal").hidden = true;
        $("printPaperCode").textContent = `รหัสชุดกระดาษ ${paper.paperCode} · ระดับ ${level} · 30 ข้อ`;
        $("printPaperQuestions").innerHTML = paper.questionIds.map((id, index) => {
          const question = questionsById.get(id);
          return `<article class="print-question"><p>${index + 1}. <span class="math-content">${escapeHtml(question.prompt)}</span></p><div class="print-choices">${question.options.map((option, optionIndex) => `<span>${LETTERS[optionIndex]}. <span class="math-content">${escapeHtml(option)}</span></span>`).join("")}</div></article>`;
        }).join("");
        $("printPaper").hidden = false;
        renderMath($("printPaper"));
        setTimeout(() => window.print(), 120);
      } catch (error) { $("createPaperError").textContent = accountError(error); }
    });
    window.addEventListener("afterprint", () => { $("printPaper").hidden = true; });
    $("teacherSearch").addEventListener("input", renderTeacherList);
    $("exitModal").addEventListener("click", (event) => { if (event.target === $("exitModal")) closeExitModal(); });
    $("teacherLoginModal").addEventListener("click", (event) => {
      if (event.target === $("teacherLoginModal")) $("teacherLoginModal").hidden = true;
    });
    ["recoveryModal", "paperModal", "createPaperModal"].forEach((id) => $(id).addEventListener("click", (event) => { if (event.target === $(id)) $(id).hidden = true; }));
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
    selectLevel(1);
    updateHomeState();
    renderMath(document.body);
    auth = loadAuth();
    if (auth) loadDashboard();
    else showScreen("auth");
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js?v=7", { updateViaCache: "none" }).catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
