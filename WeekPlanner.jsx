import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ============================================================
   WEEK PLANNER — "LifeOS"  (upgraded build)
   Plan your week. Build your life.
   ============================================================ */

/* ---------- 1. THEME TOKENS ---------- */
const BASE = {
  appBlack: "#000000", deepBg: "#030304", panel: "#0A0A0C", panel2: "#101013",
  elevated: "#16151A", popover: "#1A191F",
  border: "rgba(240,236,255,0.08)", borderStrong: "rgba(240,236,255,0.16)",
  text: "#FAF8FF", text2: "#D6CFE6", muted: "#9B90AE", vmuted: "#6B6377",
  purple: "#B66BFF", deepPurple: "#8B43F5", plum: "#6D28D9",
  pink: "#FF7AC4", fuchsia: "#E455F5", hotPink: "#FF4FB8",
  brandGrad: "linear-gradient(135deg,#B66BFF 0%,#E455F5 48%,#FF7AC4 100%)",
  deepGrad: "linear-gradient(135deg,#8B43F5 0%,#B66BFF 45%,#FF7AC4 100%)",
  purpleGlow: "rgba(182,107,255,0.30)", pinkGlow: "rgba(255,122,196,0.26)",
  focusRing: "rgba(228,85,245,0.6)", accentWash: "rgba(182,107,255,0.13)", pinkWash: "rgba(255,122,196,0.10)",
  // depth system — gradient edges over true black, brighter top sheen, deeper drop shadows
  edge: "linear-gradient(168deg, rgba(182,107,255,0.55) 0%, rgba(240,236,255,0.10) 28%, rgba(240,236,255,0.06) 64%, rgba(255,122,196,0.42) 100%)",
  edgeSoft: "linear-gradient(168deg, rgba(182,107,255,0.28) 0%, rgba(240,236,255,0.07) 40%, rgba(255,122,196,0.22) 100%)",
  cardShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 40px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)",
  popShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 36px 90px rgba(0,0,0,0.8)",
  grainOpacity: 0.045, orbOpacity: 1,
};
const LIGHT = {
  ...BASE,
  appBlack: "#F3EEFB", deepBg: "#F7F4FD", panel: "#FFFFFF", panel2: "#F4EFFB",
  elevated: "#FBF8FF", popover: "#FFFFFF",
  border: "rgba(80,40,120,0.14)", borderStrong: "rgba(80,40,120,0.26)",
  text: "#1B1126", text2: "#3D2C52", muted: "#6E5C85", vmuted: "#9A8AB0",
  purpleGlow: "rgba(168,85,247,0.18)", pinkGlow: "rgba(244,114,182,0.16)",
  accentWash: "rgba(168,85,247,0.10)", pinkWash: "rgba(244,114,182,0.08)",
  edge: "linear-gradient(168deg, rgba(124,58,237,0.40) 0%, rgba(80,40,120,0.14) 30%, rgba(80,40,120,0.12) 64%, rgba(236,72,153,0.32) 100%)",
  edgeSoft: "linear-gradient(168deg, rgba(124,58,237,0.22) 0%, rgba(80,40,120,0.12) 45%, rgba(236,72,153,0.18) 100%)",
  cardShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 14px 30px rgba(74,35,120,0.10), 0 2px 6px rgba(74,35,120,0.08)",
  popShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 30px 80px rgba(60,30,100,0.22)",
  grainOpacity: 0.03, orbOpacity: 0.8,
};
const HC = {
  ...BASE,
  appBlack: "#000000", deepBg: "#000000", panel: "#0A0A0A", panel2: "#111111",
  elevated: "#161616", popover: "#161616",
  border: "rgba(255,255,255,0.55)", borderStrong: "rgba(255,255,255,0.85)",
  text: "#FFFFFF", text2: "#FFFFFF", muted: "#E6DCF5", vmuted: "#C9BCE0",
  purple: "#C98BFF", pink: "#FF9AD2", fuchsia: "#F36BFF",
  purpleGlow: "rgba(0,0,0,0)", pinkGlow: "rgba(0,0,0,0)", focusRing: "#FFD400",
  accentWash: "rgba(201,139,255,0.20)", pinkWash: "rgba(255,154,210,0.18)",
  edge: "linear-gradient(0deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55))",
  edgeSoft: "linear-gradient(0deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55))",
  cardShadow: "none", popShadow: "0 30px 80px rgba(0,0,0,0.8)",
  grainOpacity: 0, orbOpacity: 0,
};
const THEMES = { dark: BASE, light: LIGHT, "high-contrast": HC };
/* Design-system scale — the canonical steps for the app. New UI should pull from these
   so spacing, radii, durations and elevation stay consistent across the whole planner. */
const SCALE = {
  radius: { chip: 8, control: 10, card: 12, panel: 14, lg: 18, hero: 22, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  dur: { fast: 160, base: 240, slow: 420 },
  ease: { spring: "cubic-bezier(.34,1.4,.5,1)", out: "cubic-bezier(.16,1,.3,1)" },
};
function resolveTheme(name) {
  if (name === "system") {
    const dark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return dark ? BASE : LIGHT;
  }
  return THEMES[name] || BASE;
}

/* ---------- 2. CATEGORIES ---------- */
const DEFAULT_CATEGORIES = [
  { id: "Trading", color: "#FB923C", strong: ["trade", "trading", "backtest", "forex", "scalp", "candlestick", "ticker"], kw: ["market", "chart", "stocks", "crypto", "swing", "entry", "exit", "setup", "pips", "futures", "options", "portfolio", "ema", "rsi", "breakout"] },
  { id: "Finance", color: "#FACC15", strong: ["budget", "invoice", "tax", "taxes", "expense", "reimburse", "payroll", "tax forms", "tax return"], kw: ["finance", "bill", "bills", "money", "invest", "savings", "payment", "bank", "rent", "mortgage", "salary", "refund", "subscription", "spend", "loan"] },
  { id: "Study", color: "#A855F7", strong: ["study", "exam", "revise", "homework", "lecture", "flashcard", "thesis"], kw: ["read", "learn", "course", "research", "notes", "assignment", "quiz", "syllabus", "tutorial", "chapter", "essay", "practice", "memorize", "class"] },
  { id: "Build", color: "#3B82F6", strong: ["code", "deploy", "refactor", "debug", "commit", "merge", "pull request", "pr"], kw: ["build", "dev", "feature", "bug", "ship", "prototype", "api", "frontend", "backend", "database", "test", "release", "sprint", "function", "component", "compile", "repo"] },
  { id: "Health", color: "#34D399", strong: ["gym", "workout", "yoga", "exercise", "cardio", "lift", "stretch"], kw: ["run", "walk", "health", "doctor", "sleep", "cricket", "swim", "hike", "steps", "protein", "diet", "nutrition", "physio", "dentist", "checkup", "weights", "pushups"] },
  { id: "Mindfulness", color: "#2DD4BF", strong: ["meditate", "meditation", "journaling", "breathwork", "gratitude"], kw: ["mindful", "reflect", "breathe", "calm", "journal", "affirmation", "mindset", "presence"] },
  { id: "Work", color: "#22D3EE", strong: ["meeting", "standup", "1:1", "onboarding", "interview", "deadline"], kw: ["work", "email", "client", "report", "presentation", "review", "project", "sync", "slack", "stakeholder", "demo", "kickoff", "retro", "okr", "deck", "boss", "team"] },
  { id: "Creative", color: "#E879F9", strong: ["design", "sketch", "paint", "draw", "compose", "edit video"], kw: ["creative", "art", "music", "write", "blog", "photo", "video", "podcast", "logo", "mockup", "illustration", "song", "render", "brand"] },
  { id: "Errands", color: "#A3E635", strong: ["grocery", "groceries", "errand", "pickup", "pick up", "drop off"], kw: ["buy", "post", "repair", "store", "shop", "purchase", "return", "package", "mail", "refill", "laundry", "dryclean"] },
  { id: "Home", color: "#FBBF24", strong: ["clean", "tidy", "laundry", "dishes", "vacuum", "declutter"], kw: ["home", "cook", "cooking", "organize", "fix", "garden", "plants", "trash", "chores", "kitchen", "bedroom", "household"] },
  { id: "Social", color: "#FB7185", strong: ["dinner", "party", "date", "hangout", "drinks", "birthday", "meetup", "wedding"], kw: ["lunch", "event", "catch up", "coffee", "brunch", "visit", "celebrate", "reunion", "gathering", "friends night"] },
  { id: "Travel", color: "#38BDF8", strong: ["flight", "trip", "hotel", "vacation", "booking", "passport", "itinerary"], kw: ["travel", "pack", "packing", "airport", "train", "visa", "checkin", "boarding", "luggage", "tour", "drive", "road trip"] },
  { id: "Personal", color: "#F472B6", strong: ["self-care", "haircut", "hobby", "me time"], kw: ["personal", "family", "friend", "call", "shopping", "relax", "rest", "leisure", "fun", "reward", "treat"] },
  { id: "Admin", color: "#94A3B8", strong: ["paperwork", "renew", "form", "registration", "license", "insurance"], kw: ["admin", "file", "organize", "plan", "schedule", "setup", "account", "password", "document", "submit", "apply", "sign up"] },
];

/* ============================================================
   2b. AUTO-ASSIGN ENGINE — normalization, stemming, phrase
   sequencing, typo tolerance, weighted confidence scoring.
   ============================================================ */
// Expanded keyword bank merged into each category at index build.
const EXTRA_KW = {
  Trading: { strong: ["xauusd", "tradingview", "pine script", "stop loss", "take profit", "price action", "order block", "paper trade", "trading journal", "risk management", "cot report", "backtesting"], kw: ["gold", "oil", "wti", "crude", "broker", "leverage", "margin", "hedge", "drawdown", "candle", "fomc", "cpi", "nfp", "lot", "spread", "bullish", "bearish", "fibonacci", "fib", "liquidity", "volume", "position", "watchlist", "indicator", "strategy", "pepperstone", "nasdaq", "sp500", "dow", "etf"] },
  Finance: { strong: ["pay bill", "pay bills", "pay rent", "tax return", "credit card", "bank statement", "transfer money", "superannuation"], kw: ["super", "ato", "gst", "bas", "emi", "deposit", "withdraw", "statement", "owe", "debt", "repay", "repayment", "interest", "dividend", "paypal", "transfer", "split", "reimbursement", "centrelink", "pension", "premium"] },
  Study: { strong: ["study session", "due date", "mock exam", "past paper", "study plan", "problem set", "cs50", "leetcode"], kw: ["uni", "university", "torrens", "semester", "unit", "module", "lab", "midterm", "finals", "submission", "deadline", "enrol", "enroll", "census", "textbook", "professor", "tutor", "grade", "gpa", "certificate", "diploma", "revision", "odin"] },
  Build: { strong: ["fix bug", "code review", "pull request", "unit test", "side project", "pine script editor"], kw: ["react", "javascript", "typescript", "python", "git", "github", "vercel", "css", "html", "hook", "localhost", "npm", "sql", "json", "server", "endpoint", "auth", "ui", "ux", "lint", "refactoring", "deployment", "integration", "app", "script", "automation", "cli", "docker"] },
  Health: { strong: ["leg day", "push day", "pull day", "net practice", "cricket match", "cricket training", "blood test", "meal prep", "go for a run", "morning run", "evening run", "5k run", "run 5k", "10k run"], kw: ["jog", "jogging", "sprint", "stretching", "mobility", "physio", "gp", "medicare", "vitamins", "creatine", "calories", "macros", "hydrate", "water", "fasting", "abs", "chest", "squat", "deadlift", "bench", "session", "recovery", "injury", "appointment doctor"] },
  Mindfulness: { strong: ["morning pages", "gratitude journal", "digital detox", "deep breathing"], kw: ["pray", "prayer", "meditation app", "stillness", "unwind", "decompress", "grounding", "visualization", "intention", "silence", "zen"] },
  Work: { strong: ["team meeting", "performance review", "all hands", "cover letter", "job application", "follow up email"], kw: ["shift", "roster", "store", "retail", "oakley", "customer", "stocktake", "manager", "colleague", "agenda", "minutes", "proposal", "contract", "invoice client", "timesheet", "payslip", "resume", "cv", "linkedin", "recruiter", "briefing", "handover", "training"] },
  Creative: { strong: ["edit reel", "edit photos", "record podcast", "content plan", "shoot video"], kw: ["figma", "canva", "thumbnail", "reel", "instagram", "youtube", "tiktok", "premiere", "lightroom", "photoshop", "palette", "typography", "moodboard", "storyboard", "script video", "animation", "drawing", "guitar", "piano", "lyrics", "poem", "novel", "chapter draft"] },
  Errands: { strong: ["post office", "drop parcel", "car wash", "car service", "fuel up", "get petrol"], kw: ["pharmacy", "chemist", "woolworths", "coles", "aldi", "kmart", "bunnings", "ikea", "servo", "petrol", "fuel", "parcel", "courier", "deliver", "delivery", "exchange", "topup", "recharge", "print", "photocopy", "keys", "carwash"] },
  Home: { strong: ["deep clean", "take out bins", "mow lawn", "water plants", "meal plan"], kw: ["mow", "lawn", "bin", "bins", "mop", "iron", "ironing", "fridge", "freezer", "pantry", "wardrobe", "closet", "garage", "bathroom", "toilet", "windows", "dust", "dusting", "linen", "sheets", "lightbulb", "leak", "plumber", "electrician"] },
  Social: { strong: ["movie night", "game night", "catch up with", "video call family", "call mum", "call dad", "call parents"], kw: ["bbq", "barbecue", "mates", "buddy", "bro", "cousin", "uncle", "aunt", "nephew", "niece", "housewarming", "farewell", "anniversary", "engagement", "invite", "rsvp", "gift", "present", "surprise"] },
  Travel: { strong: ["book flight", "book hotel", "check in online", "airport pickup", "road trip"], kw: ["airbnb", "esim", "currency", "forex card", "stay", "resort", "beach", "sydney", "melbourne", "india", "interstate", "departure", "arrival", "terminal", "gate", "stopover", "souvenir"] },
  Personal: { strong: ["me time", "self care", "skin care", "buy clothes"], kw: ["barber", "salon", "nails", "skincare", "spa", "massage", "nap", "chill", "gaming", "playstation", "xbox", "netflix", "movie", "series", "anime", "binge", "playlist", "spotify", "wishlist"] },
  Admin: { strong: ["renew visa", "visa application", "book appointment", "update details", "back up", "backup data"], kw: ["visa", "immigration", "passport renewal", "medicare card", "opal", "rego", "registration", "lease", "tenancy", "bond", "utilities", "electricity", "internet", "sim", "plan", "cancel subscription", "unsubscribe", "print form", "scan", "upload", "portal", "mygov", "appointment"] },
};
// — text normalization + iterative light stemmer (applied to both index and input) —
function normText(s) { return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
function stem(w) {
  let prev = null, x = w;
  for (let pass = 0; pass < 2 && x !== prev; pass++) {
    prev = x;
    if (x.length <= 3) break;
    for (const suf of ["'s", "ies", "ing", "ed", "es", "s", "ly"]) {
      if (x.endsWith(suf) && x.length - suf.length >= 3) {
        x = x.slice(0, -suf.length) + (suf === "ies" ? "y" : "");
        // de-double trailing consonant: running → runn → run
        if (x.length > 3 && x[x.length - 1] === x[x.length - 2] && !"aeiou".includes(x[x.length - 1])) x = x.slice(0, -1);
        break;
      }
    }
  }
  return x;
}
// edit distance ≤ 1 (typo tolerance) — fast char walk, no allocation
function lev1(a, b) {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}
function buildIndex(cats) {
  const entries = [];
  const push = (cat, term, w) => {
    const toks = normText(term).split(" ").filter(Boolean).map(stem);
    if (toks.length) entries.push({ cat, toks, w, phrase: toks.length > 1 });
  };
  for (const c of cats) {
    const extra = EXTRA_KW[c.id] || {};
    for (const t of (c.strong || [])) push(c.id, t, 5);
    for (const t of (extra.strong || [])) push(c.id, t, 5);
    for (const t of (c.kw || [])) push(c.id, t, t.length > 4 ? 2.5 : 1.5);
    for (const t of (extra.kw || [])) push(c.id, t, t.length > 4 ? 2.5 : 1.5);
    push(c.id, c.id, 4); // the category's own name always counts
  }
  return entries;
}
const KW_INDEX = buildIndex(DEFAULT_CATEGORIES);
const IDX_CACHE = typeof WeakMap !== "undefined" ? new WeakMap() : null;
function getIndex(cats) {
  if (!cats || cats === DEFAULT_CATEGORIES) return KW_INDEX;
  if (IDX_CACHE) { let v = IDX_CACHE.get(cats); if (!v) { v = buildIndex(cats); IDX_CACHE.set(cats, v); } return v; }
  return buildIndex(cats);
}
/* Scored detection:
   · phrases match as token sequences and score highest
   · single terms match stemmed tokens exactly, or within 1 typo for terms ≥5 chars
   · words near the start of the title get a position bonus
   · returns null unless the winner clears a confidence + ambiguity gate */
function detectCategoryScored(title, cats) {
  const toks = normText(title).split(" ").filter(Boolean).map(stem);
  if (!toks.length) return { cat: null, score: 0 };
  const index = getIndex(cats);
  const scores = {}, strongHit = {};
  for (const e of index) {
    let hit = 0;
    if (e.phrase) {
      outer: for (let i = 0; i <= toks.length - e.toks.length; i++) {
        for (let j = 0; j < e.toks.length; j++) if (toks[i + j] !== e.toks[j]) continue outer;
        hit = e.w * 2 + e.toks.length;
        if (i < 3) hit *= 1.2;
        break;
      }
    } else {
      const t = e.toks[0];
      for (let i = 0; i < toks.length; i++) {
        if (toks[i] === t) { hit = e.w * 1.6 * (i < 3 ? 1.2 : 1); break; }
        if (t.length >= 5 && lev1(toks[i], t)) hit = Math.max(hit, e.w * 0.9);
      }
    }
    if (hit > 0) {
      scores[e.cat] = (scores[e.cat] || 0) + hit;
      if (e.w >= 5) strongHit[e.cat] = true;
    }
  }
  let best = null, bs = 0, second = 0;
  for (const k in scores) { const s = scores[k]; if (s > bs) { second = bs; bs = s; best = k; } else if (s > second) second = s; }
  if (!best) return { cat: null, score: 0 };
  if (bs < 2.2 && !strongHit[best]) return { cat: null, score: bs };          // too weak
  if (second > 0 && bs / second < 1.12 && !strongHit[best]) return { cat: null, score: bs }; // too ambiguous
  return { cat: best, score: bs };
}

/* ---------- 3. STORAGE LAYER ---------- */
const K = {
  tasks: "planner_tasks_v1", notes: "planner_notes_v1",
  settings: "planner_settings_v1", categories: "planner_categories_v1",
  theme: "planner_theme", tables: "planner_tables_v1",
  collections: "planner_collections_v1", savedSearches: "planner_saved_searches_v1",
  searchHistory: "planner_search_history_v1", noteTemplates: "planner_note_templates_v1",
  routines: "planner_routines_v1",
};
const memStore = {};
function hasLS() {
  try { const k = "__pl_test__"; window.localStorage.setItem(k, "1"); window.localStorage.removeItem(k); return true; }
  catch { return false; }
}
const LS_AVAILABLE = typeof window !== "undefined" && hasLS();
function storageGet(key) {
  try {
    if (LS_AVAILABLE) { const v = window.localStorage.getItem(key); return v == null ? null : JSON.parse(v); }
    return key in memStore ? memStore[key] : null;
  } catch { return null; }
}
function storageSet(key, value) {
  try {
    if (LS_AVAILABLE) window.localStorage.setItem(key, JSON.stringify(value));
    else memStore[key] = value;
    return true;
  } catch (e) { memStore[key] = value; return false; }
}
function storageRemove(key) {
  try { if (LS_AVAILABLE) window.localStorage.removeItem(key); else delete memStore[key]; } catch {}
}

/* ---------- 4. DATE + RECURRENCE HELPERS ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const startOfWeek = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => toKey(a) === toKey(b);
const WD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtRange = (s) => { const e = addDays(s, 6); const a = `${MO[s.getMonth()]} ${s.getDate()}`; const b = (s.getMonth() === e.getMonth()) ? `${e.getDate()}, ${e.getFullYear()}` : `${MO[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`; return `${a} – ${b}`; };
const to12 = (hhmm) => { if (!hhmm) return ""; const [h, m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; const hr = h % 12 === 0 ? 12 : h % 12; return `${hr}:${pad(m)} ${ap}`; };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => new Date().toISOString();
const dowOf = (dateKey) => fromKey(dateKey).getDay(); // 0=Sun..6=Sat

function recursOn(task, dateKey) {
  if (!task.recurring || !task.recurring.enabled) return false;
  const days = task.recurring.days || [];
  if (days.length === 0) return false;
  if (dateKey < task.date) return false;
  return days.includes(dowOf(dateKey));
}
function isComplete(task, dateKey) {
  if (task.recurring && task.recurring.enabled) return (task.completedDates || []).includes(dateKey);
  return !!task.completed;
}
function fuzzy(query, text) {
  if (!query) return true;
  const q = query.toLowerCase(), t = (text || "").toLowerCase();
  if (t.includes(q)) return true;
  let i = 0;
  for (let j = 0; j < t.length && i < q.length; j++) if (t[j] === q[i]) i++;
  return i === q.length;
}
function parseQuick(raw, cats) {
  let text = " " + raw + " ";
  const out = { time: "", durationMinutes: 30, priority: "medium", category: null, date: null, categoryAuto: false };
  // explicit #Category (wins over auto-detect)
  const catMatch = text.match(/#(\w+)/);
  if (catMatch) { const f = cats.find((c) => c.id.toLowerCase() === catMatch[1].toLowerCase()); if (f) { out.category = f.id; text = text.replace(catMatch[0], " "); } }
  // duration — compound first: "1h30m", "1h 30", "2 hr 15 min"
  const durHM = text.match(/\b(\d+)\s*h(?:r|rs|our|ours)?\s*(\d{1,2})\s*(?:m|min|mins|minutes)?\b/i);
  if (durHM) { out.durationMinutes = Number(durHM[1]) * 60 + Number(durHM[2]); text = text.replace(durHM[0], " "); }
  else {
    const dur = text.match(/\b(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hrs|hour|hours)\b/i);
    if (dur) { const n = Number(dur[1]); out.durationMinutes = /h/i.test(dur[2]) ? Math.round(n * 60) : Math.round(n); text = text.replace(dur[0], " "); }
  }
  // priority: words, p1/p2/p3, !! / !!!, or a single trailing !
  const pr = text.match(/\b(high|medium|med|low|urgent|p1|p2|p3)\b/i);
  if (pr) {
    const p = pr[1].toLowerCase();
    out.priority = (p === "med" || p === "p2") ? "medium" : (p === "urgent" || p === "p1") ? "high" : (p === "p3") ? "low" : p;
    text = text.replace(pr[0], " ");
  }
  else if (/!{2,}/.test(text)) { out.priority = "high"; text = text.replace(/!{2,}/g, " "); }
  else if (/!\s*$/.test(text.trimEnd() + " ") && /!/.test(text)) { out.priority = "high"; text = text.replace(/!/g, " "); }
  // time: 6pm, 6:30pm, 6.30pm, 18:00, "at 9", noon, midnight
  if (/\bnoon\b/i.test(text)) { out.time = "12:00"; text = text.replace(/\b(at\s+)?noon\b/i, " "); }
  else if (/\bmidnight\b/i.test(text)) { out.time = "00:00"; text = text.replace(/\b(at\s+)?midnight\b/i, " "); }
  else {
    // scan every numeric candidate; accept the first that carries minutes or am/pm
    const tmRe = /\b(?:at\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/gi;
    let tm;
    while ((tm = tmRe.exec(text))) {
      if (!tm[3] && !tm[2]) continue;
      let h = Number(tm[1]); const mi = tm[2] ? Number(tm[2]) : 0; const ap = tm[3] ? tm[3].toLowerCase() : null;
      if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0;
      if (h >= 0 && h <= 23 && mi < 60) { out.time = `${pad(h)}:${pad(mi)}`; text = text.replace(tm[0], " "); break; }
    }
  }
  // dates: today / tomorrow / (next) weekday / "in N days" / "in a week" / 15/8 / 15 aug / aug 15
  const WDAYS = { sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3, thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6 };
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  const now0 = new Date(); now0.setHours(0, 0, 0, 0);
  if (/\btoday\b/i.test(text)) { out.date = toKey(now0); text = text.replace(/\btoday\b/i, " "); }
  else if (/\b(tomorrow|tmrw|tmr)\b/i.test(text)) { out.date = toKey(addDays(now0, 1)); text = text.replace(/\b(tomorrow|tmrw|tmr)\b/i, " "); }
  else {
    const wm = text.match(/\b(?:(next)\s+)?(sunday|saturday|monday|tuesday|wednesday|thursday|friday|sun|mon|tues?|wed|thur?s?|fri|sat)\b/i);
    const inDays = text.match(/\bin\s+(\d{1,2})\s+days?\b/i);
    const inWeek = text.match(/\bin\s+a\s+week\b/i);
    const numDate = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);
    const monA = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\b/i);
    const monB = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (wm) {
      const target = WDAYS[wm[2].toLowerCase()];
      let delta = (target - now0.getDay() + 7) % 7; if (delta === 0) delta = 7; // upcoming occurrence
      out.date = toKey(addDays(now0, delta)); text = text.replace(wm[0], " ");
    } else if (inDays) { out.date = toKey(addDays(now0, Number(inDays[1]))); text = text.replace(inDays[0], " "); }
    else if (inWeek) { out.date = toKey(addDays(now0, 7)); text = text.replace(inWeek[0], " "); }
    else if (monA || monB) {
      const m = MONTHS[(monA ? monA[2] : monB[1]).toLowerCase()];
      const dnum = Number(monA ? monA[1] : monB[2]);
      if (m != null && dnum >= 1 && dnum <= 31) {
        let d = new Date(now0.getFullYear(), m, dnum);
        if (d < now0) d = new Date(now0.getFullYear() + 1, m, dnum);
        out.date = toKey(d); text = text.replace((monA || monB)[0], " ");
      }
    } else if (numDate) {
      // day/month (AU convention); rolls to next year if already past
      const dd = Number(numDate[1]), mm = Number(numDate[2]);
      if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
        let d = new Date(now0.getFullYear(), mm - 1, dd);
        if (d < now0) d = new Date(now0.getFullYear() + 1, mm - 1, dd);
        out.date = toKey(d); text = text.replace(numDate[0], " ");
      }
    }
  }
  out.title = text.replace(/\s+/g, " ").trim();
  // smart category auto-detect (only if not explicitly set via #tag)
  if (!out.category) {
    out.category = detectCategory(out.title, cats);
    if (out.category) out.categoryAuto = true;
  }
  return out;
}

// Weighted detection via the auto-assign engine (section 2b).
function detectCategory(title, cats) { return detectCategoryScored(title, cats).cat; }

/* ---------- 4b. PRO NOTES HELPERS ---------- */
const NOTE_TYPE_ICON = {
  note: "IconNote", daily: "IconSunDay", meeting: "IconUsers", "trading-journal": "IconChart",
  "workout-log": "IconDumbbell", study: "IconBook", project: "IconLayers", review: "IconRepeat",
};
const DEFAULT_COLLECTIONS = [
  { id: "inbox", name: "Inbox", icon: "inbox", color: "#A855F7", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "daily", name: "Daily Notes", icon: "sun", color: "#F472B6", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "trading", name: "Trading", icon: "chart", color: "#FB923C", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "study", name: "Study", icon: "book", color: "#A855F7", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "build", name: "Build", icon: "layers", color: "#3B82F6", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "health", name: "Health", icon: "heart", color: "#34D399", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
  { id: "personal", name: "Personal", icon: "spark", color: "#F472B6", parentId: null, type: "folder", createdAt: now(), updatedAt: now() },
];

// Safely upgrade any old note {title,body,category,pinned} into the Pro Notes shape.
function migrateNote(n) {
  const tags = Array.isArray(n.tags) ? n.tags : [];
  const parsed = parseTags(n.body || "");
  const merged = [...new Set([...tags, ...parsed])];
  return {
    id: n.id || uid(),
    title: n.title || "Untitled",
    body: n.body || "",
    category: n.category || "Personal",
    collectionId: n.collectionId !== undefined ? n.collectionId : null,
    tags: merged,
    pinned: !!n.pinned,
    favorite: !!n.favorite,
    archived: !!n.archived,
    linkedTaskIds: Array.isArray(n.linkedTaskIds) ? n.linkedTaskIds : [],
    linkedRecurringIds: Array.isArray(n.linkedRecurringIds) ? n.linkedRecurringIds : [],
    linkedDate: n.linkedDate || null,
    reminderDate: n.reminderDate || null,
    capturedDuring: n.capturedDuring || null,
    createdAt: n.createdAt || now(),
    updatedAt: n.updatedAt || now(),
    lastOpenedAt: n.lastOpenedAt || null,
    type: n.type || "note",
  };
}
function migrateNotes(arr) { return (Array.isArray(arr) ? arr : []).map(migrateNote); }

function parseTags(body) {
  const out = [];
  const re = /(?:^|\s)#([a-z0-9][a-z0-9-]*)/gi;
  let m; while ((m = re.exec(body || ""))) out.push(m[1].toLowerCase());
  return [...new Set(out)];
}
// effective tags = manual + parsed from body
function noteTags(note) { return [...new Set([...(note.tags || []), ...parseTags(note.body || "")])]; }

function parseWikiLinks(body) {
  const out = []; const re = /\[\[([^\]]+)\]\]/g; let m;
  while ((m = re.exec(body || ""))) out.push(m[1].trim());
  return [...new Set(out)];
}

const dailyTitle = (dateKey) => {
  const d = fromKey(dateKey);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  return `Daily Note — ${wd} ${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`;
};
const DAILY_TEMPLATE_BODY = "# Priorities\n- [ ] \n- [ ] \n- [ ] \n\n# Schedule Notes\n\n# Tasks Created\n\n# Wins\n\n# Reflection\nWhat moved my life forward today?";

// Build a fresh note (defaults) with overrides
function makeNote(over = {}) {
  return migrateNote({
    title: "", body: "", category: "Personal", pinned: false,
    tags: [], linkedTaskIds: [], linkedDate: null, collectionId: null, type: "note",
    ...over,
  });
}


/* ---------- 5. SEED DATA ---------- */
function seed() {
  const wk = startOfWeek(new Date());
  const day = (i) => toKey(addDays(wk, i));
  const t = (title, category, di, time, dur, priority, completed) => ({
    id: uid(), title, date: day(di), category, time, durationMinutes: dur,
    priority, completed: !!completed, createdAt: now(), updatedAt: now(), notes: "",
    recurring: { enabled: false, days: [] }, completedDates: [],
  });
  const tasks = [
    t("Market Analysis", "Trading", 0, "09:00", 90, "high", false),
    t("Backtest Strategy", "Trading", 0, "11:00", 60, "medium", false),
    t("Gym Workout", "Health", 0, "18:00", 60, "low", true),
    t("Study Option Strategies", "Study", 1, "10:00", 60, "medium", false),
    t("Build Dashboard Feature", "Build", 1, "14:00", 120, "high", false),
    t("Read Book", "Personal", 1, "20:30", 45, "low", false),
    t("Live Trading Session", "Trading", 2, "09:30", 120, "high", false),
    t("Content Creation", "Personal", 2, "13:00", 60, "medium", true),
    t("Evening Walk", "Health", 2, "19:00", 30, "low", false),
    t("Finance Review", "Finance", 3, "10:00", 60, "medium", false),
    t("Code Refactor", "Build", 3, "14:00", 90, "medium", false),
    t("Meditation", "Health", 3, "20:00", 20, "low", false),
    t("Backtest New Strategy", "Trading", 4, "09:30", 90, "high", false),
    t("System Design", "Study", 4, "11:00", 60, "medium", false),
    t("Call with Mentor", "Personal", 4, "18:00", 45, "medium", false),
    t("Cricket Practice", "Health", 5, "07:30", 120, "medium", false),
    t("Weekend Plan", "Personal", 5, "11:00", 30, "low", false),
    t("Weekly Review", "Admin", 6, "10:00", 60, "high", false),
    t("Plan Next Week", "Admin", 6, "17:00", 45, "medium", false),
  ];
  tasks.push({ id: uid(), title: "Morning Routine", date: day(0), category: "Health", time: "07:00", durationMinutes: 30, priority: "medium", completed: false, createdAt: now(), updatedAt: now(), notes: "", recurring: { enabled: true, days: [1, 2, 3, 4, 5] }, completedDates: [] });
  tasks.push(
    { id: uid(), title: "Finish dashboard UI", date: toKey(addDays(wk, -1)), category: "Build", time: "15:00", durationMinutes: 60, priority: "high", completed: false, createdAt: now(), updatedAt: now(), notes: "", recurring: { enabled: false, days: [] }, completedDates: [] },
    { id: uid(), title: "Read chapters 4-6", date: toKey(addDays(wk, -2)), category: "Study", time: "20:00", durationMinutes: 45, priority: "medium", completed: false, createdAt: now(), updatedAt: now(), notes: "", recurring: { enabled: false, days: [] }, completedDates: [] },
    { id: uid(), title: "Workout consistency", date: toKey(addDays(wk, -1)), category: "Health", time: "06:00", durationMinutes: 60, priority: "low", completed: false, createdAt: now(), updatedAt: now(), notes: "", recurring: { enabled: false, days: [] }, completedDates: [] },
  );
  const firstTradeTask = tasks[0]; // Market Analysis
  const notes = [
    makeNote({ title: "Trading Setup", body: "Market structure looks strong on higher timeframes. Watching key liquidity zones into the open. Related: [[Monthly Goals]] #trading #setup", category: "Trading", collectionId: "trading", pinned: true, favorite: true, type: "trading-journal", linkedTaskIds: [firstTradeTask.id], linkedDate: day(0) }),
    makeNote({ title: "Vue.js Patterns", body: "Composables, provide/inject and advanced reactivity patterns to revisit this week. #study #frontend", category: "Study", collectionId: "study", type: "study", createdAt: new Date(Date.now() - 864e5).toISOString() }),
    makeNote({ title: "Monthly Goals", body: "- [ ] Consistent profits\n- [ ] Read 12 books\n- [ ] Build 2 products #goals #personal", category: "Personal", collectionId: "personal", type: "project" }),
    makeNote({ title: "Workout Log", body: "Push Day:\n- Bench 4x10\n- Overhead 4x10\n- Triceps superset #health #workout", category: "Health", collectionId: "health", type: "workout-log", linkedDate: day(0) }),
  ];
  const tables = [{ id: uid(), name: "Trade Journal", columns: ["Date", "Pair", "Result", "R:R"], rows: [["Mon", "XAU/USD", "Win", "1:3"], ["Tue", "WTI", "Loss", "1:2"]] }];
  const collections = DEFAULT_COLLECTIONS;
  return { tasks, notes, tables, collections };
}

/* ============================================================
   6. ROOT
   ============================================================ */
/* ---- Launch reveal: a brief, elegant brand assembly on first open (once per session) ---- */
function LaunchReveal({ T }) {
  const skip = (typeof window !== "undefined" && ((window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || window.__wpLaunched));
  const [gone, setGone] = useState(!!skip);
  const [lift, setLift] = useState(false);
  useEffect(() => {
    if (skip) return;
    if (typeof window !== "undefined") window.__wpLaunched = true;
    const t1 = setTimeout(() => setLift(true), 1150);
    const t2 = setTimeout(() => setGone(true), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (gone) return null;
  return (
    <div className={"launchReveal" + (lift ? " lifting" : "")} aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: `radial-gradient(900px 600px at 50% 42%, ${hexA(T.deepPurple, 0.35)}, ${T.appBlack} 70%)` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div className="launchMark" style={{ width: 78, height: 78, borderRadius: 22, background: T.brandGrad, display: "grid", placeItems: "center", boxShadow: `0 18px 60px ${T.purpleGlow}, 0 0 0 1px rgba(255,255,255,0.14) inset, 0 1px 0 rgba(255,255,255,0.3) inset` }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
            <circle className="lrCore" cx="12" cy="12" r="3" fill="#fff" />
            <g className="lrOrbit1" style={{ transformOrigin: "12px 12px" }}>
              <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#fff" strokeWidth="1.3" opacity="0.9" />
              <circle cx="22" cy="12" r="1.5" fill="#fff" />
            </g>
            <g className="lrOrbit2" style={{ transformOrigin: "12px 12px" }}>
              <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#fff" strokeWidth="1.3" opacity="0.9" transform="rotate(60 12 12)" />
            </g>
          </svg>
        </div>
        <div className="launchWord" style={{ textAlign: "center" }}>
          <div className="gradText" style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Week Planner</div>
          <div style={{ fontSize: 12, color: T.muted, letterSpacing: 3, marginTop: 4, textTransform: "uppercase" }}>Life OS</div>
        </div>
      </div>
    </div>
  );
}
/* ---- first-run onboarding — premium, calm, on-brand ---- */
function OnboardingFlow({ T, onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState([]);
  const inputRef = useRef(null);
  useEffect(() => { if (step === 1) { const id = setTimeout(() => inputRef.current && inputRef.current.focus(), 320); return () => clearTimeout(id); } }, [step]);
  useEffect(() => { if (typeof window !== "undefined") window.__wpLaunched = true; }, []);
  const FOCUS = [["Work", "#22D3EE"], ["Study", "#A78BFA"], ["Health", "#34D399"], ["Trading", "#FBBF24"], ["Creative", "#F472B6"], ["Personal", "#FB7185"], ["Home", "#38BDF8"], ["Finance", "#4ADE80"]];
  const toggleFocus = (f) => setFocus((c) => c.includes(f) ? c.filter((x) => x !== f) : [...c, f]);
  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const firstName = name.trim().split(/\s+/)[0] || "";

  const Mark = ({ size = 64 }) => (
    <div className="obMark" style={{ width: size, height: size, borderRadius: size * 0.3, background: T.brandGrad, display: "grid", placeItems: "center", boxShadow: `0 18px 50px ${T.purpleGlow}, 0 0 0 1px rgba(255,255,255,0.14) inset, 0 1px 0 rgba(255,255,255,0.35) inset` }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
        <circle cx="12" cy="12" r="3" fill="#fff" />
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.95">
          <line x1="12" y1="2.5" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="21.5" y2="12" />
          <line x1="5.2" y1="5.2" x2="7.6" y2="7.6" /><line x1="16.4" y1="16.4" x2="18.8" y2="18.8" />
          <line x1="18.8" y1="5.2" x2="16.4" y2="7.6" /><line x1="7.6" y1="16.4" x2="5.2" y2="18.8" />
        </g>
      </svg>
    </div>
  );
  const Dots = () => (
    <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 26 }}>
      {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, background: i === step ? T.brandGrad : hexA("#FFFFFF", 0.14), transition: "width .35s cubic-bezier(.34,1.45,.55,1), background .3s ease" }} />)}
    </div>
  );
  const primaryBtn = { all: "unset", boxSizing: "border-box", cursor: "pointer", textAlign: "center", background: T.brandGrad, color: "#fff", fontWeight: 800, fontSize: 15.5, padding: "14px 22px", borderRadius: 14, boxShadow: `0 12px 30px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.3) inset`, letterSpacing: 0.2 };
  const ghostLink = { all: "unset", cursor: "pointer", color: T.muted, fontSize: 13.5, fontWeight: 600, padding: "8px 4px" };

  return (
    <div className="obWrap" style={{ position: "fixed", inset: 0, zIndex: 300, display: "grid", placeItems: "center", padding: 22, background: `radial-gradient(1100px 720px at 50% 30%, ${hexA(T.deepPurple, 0.4)}, transparent 66%), #000000` }} role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="obGlow" aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(600px 380px at 80% 100%, ${hexA(T.pink, 0.16)}, transparent 70%), radial-gradient(520px 360px at 12% 8%, ${hexA(T.cyan || "#38BDF8", 0.12)}, transparent 70%)`, pointerEvents: "none" }} />
      <div className="obCard" style={{ position: "relative", width: "100%", maxWidth: 460, background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.03)}, transparent 120px), #000000`, border: "1px solid transparent", backgroundClip: "padding-box", borderRadius: 26, padding: "30px 26px 26px", boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.06)} inset, 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px ${hexA(T.purple, 0.18)}` }}>
        <Dots />
        <div key={step} className="obStep">
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <Mark size={76} />
              <div>
                <div className="gradText" style={{ fontSize: 28, fontWeight: 850, letterSpacing: -0.6, lineHeight: 1.1 }}>Welcome to<br />Week Planner</div>
                <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.5, margin: "12px 4px 0", maxWidth: 320 }}>Your tasks, notes and focus — together in one calm, beautiful place. Let’s set it up in a few taps.</p>
              </div>
              <button className="focusable obPrimary" style={{ ...primaryBtn, width: "100%", marginTop: 6 }} onClick={next}>Get started  →</button>
              <button className="focusable" style={ghostLink} onClick={() => onFinish({})}>Skip for now</button>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 23, fontWeight: 820, color: T.text, letterSpacing: -0.4 }}>What should we call you?</div>
                <p style={{ color: T.muted, fontSize: 14, margin: "8px 0 0" }}>So your planner feels like yours.</p>
              </div>
              <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") next(); }} placeholder="Your name" maxLength={40} aria-label="Your name"
                style={{ all: "unset", boxSizing: "border-box", width: "100%", textAlign: "center", fontSize: 19, fontWeight: 700, color: T.text, padding: "15px 16px", borderRadius: 14, background: hexA("#FFFFFF", 0.04), border: `1px solid ${hexA(T.purple, 0.4)}`, boxShadow: `0 0 0 4px ${hexA(T.purple, 0.08)}` }} />
              <button className="focusable obPrimary" style={{ ...primaryBtn, width: "100%" }} onClick={next}>{firstName ? `Continue` : "Continue"}  →</button>
              <button className="focusable" style={{ ...ghostLink, textAlign: "center" }} onClick={back}>← Back</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 23, fontWeight: 820, color: T.text, letterSpacing: -0.4 }}>{firstName ? `What matters most, ${firstName}?` : "What do you want to stay on top of?"}</div>
                <p style={{ color: T.muted, fontSize: 14, margin: "8px 0 0" }}>Pick any that fit — you can change these later.</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center" }}>
                {FOCUS.map(([label, color]) => {
                  const on = focus.includes(label);
                  return (
                    <button key={label} className="focusable obChip" onClick={() => toggleFocus(label)} aria-pressed={on}
                      style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 15px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, color: on ? "#fff" : T.muted, background: on ? hexA(color, 0.18) : hexA("#FFFFFF", 0.03), border: `1px solid ${on ? hexA(color, 0.7) : hexA("#FFFFFF", 0.09)}`, boxShadow: on ? `0 0 18px ${hexA(color, 0.3)}` : "none", transition: "all .2s ease" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: color, boxShadow: on ? `0 0 8px ${color}` : "none" }} />{label}
                    </button>
                  );
                })}
              </div>
              <button className="focusable obPrimary" style={{ ...primaryBtn, width: "100%", marginTop: 4 }} onClick={next}>Continue  →</button>
              <button className="focusable" style={{ ...ghostLink, textAlign: "center" }} onClick={back}>← Back</button>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div className="gradText" style={{ fontSize: 25, fontWeight: 840, letterSpacing: -0.5 }}>{firstName ? `You’re all set, ${firstName} ✦` : "You’re all set ✦"}</div>
                <p style={{ color: T.muted, fontSize: 14, margin: "8px 0 2px" }}>How would you like to begin?</p>
              </div>
              <button className="focusable obChoice" onClick={() => onFinish({ name, examples: false })}
                style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: "16px 16px", borderRadius: 16, background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.03)}, transparent), #000`, border: `1px solid ${hexA(T.purple, 0.5)}`, boxShadow: `0 0 0 1px ${hexA(T.purple, 0.12)}` }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: T.brandGrad, display: "grid", placeItems: "center", color: "#fff", fontSize: 20, boxShadow: `0 8px 20px ${T.purpleGlow}` }}>✦</div>
                <div><div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Start with a clean slate</div><div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>An empty, calm planner — add your first task.</div></div>
              </button>
              <button className="focusable obChoice" onClick={() => onFinish({ name, examples: true })}
                style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: "16px 16px", borderRadius: 16, background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.03)}, transparent), #000`, border: `1px solid ${hexA("#FFFFFF", 0.1)}` }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: hexA(T.pink, 0.16), display: "grid", placeItems: "center", color: T.pink, fontSize: 20, border: `1px solid ${hexA(T.pink, 0.4)}` }}>◷</div>
                <div><div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Explore with examples</div><div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>A sample week so you can see how it works.</div></div>
              </button>
              <button className="focusable" style={{ ...ghostLink, textAlign: "center" }} onClick={back}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ---- live header clock (desktop) — quiet, premium time + date ---- */
function HeaderClock({ T }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(iv);
  }, []);
  const hh = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ap = now.getHours() >= 12 ? "PM" : "AM";
  return (
    <div className="deskonly headerClock" style={{ textAlign: "right", lineHeight: 1.1, userSelect: "none" }}>
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.3, fontVariantNumeric: "tabular-nums", color: T.text }}>
        {hh}:{mm}<span style={{ fontSize: 10, fontWeight: 700, color: T.muted, marginLeft: 3 }}>{ap}</span>
      </div>
      <div style={{ fontSize: 10.5, color: T.vmuted, fontWeight: 600, letterSpacing: 0.3 }}>{now.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
    </div>
  );
}

export default function WeekPlanner() {
  // ---- load-once initializers (seed only if storage empty) ----
  const boot = useMemo(() => {
    const sTasks = storageGet(K.tasks);
    const sNotes = storageGet(K.notes);
    const sTables = storageGet(K.tables);
    const sCollections = storageGet(K.collections);
    const sSaved = storageGet(K.savedSearches);
    const sHistory = storageGet(K.searchHistory);
    const sRoutines = storageGet(K.routines);
    if (sTasks == null && sNotes == null) {
      return { tasks: [], notes: [], tables: [], collections: DEFAULT_COLLECTIONS, savedSearches: [], searchHistory: [], routines: [], fresh: true };
    }
    return {
      tasks: Array.isArray(sTasks) ? sTasks : [],
      notes: migrateNotes(sNotes), // safe migration of old note shapes
      tables: Array.isArray(sTables) ? sTables : seed().tables,
      collections: Array.isArray(sCollections) && sCollections.length ? sCollections : DEFAULT_COLLECTIONS,
      savedSearches: Array.isArray(sSaved) ? sSaved : [],
      searchHistory: Array.isArray(sHistory) ? sHistory : [],
      routines: Array.isArray(sRoutines) ? sRoutines : [],
      fresh: false,
    };
  }, []);

  const [tasks, setTasks] = useState(boot.tasks);
  const [notes, setNotes] = useState(boot.notes);
  const [tables, setTables] = useState(boot.tables);
  const [collections, setCollections] = useState(boot.collections);
  const [savedSearches, setSavedSearches] = useState(boot.savedSearches);
  const [searchHistory, setSearchHistory] = useState(boot.searchHistory);
  const [categories] = useState(() => storageGet(K.categories) || DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState(() => storageGet(K.settings) || { theme: storageGet(K.theme) || "dark", sidebarCollapsed: false });
  const [onboarding, setOnboarding] = useState(() => boot.fresh && !(storageGet(K.settings) || {}).onboarded);
  const loadExamples = useCallback(() => { const s = seed(); setTasks(s.tasks); setNotes(s.notes); setTables(s.tables); }, []);
  const finishOnboarding = useCallback(({ name, examples } = {}) => {
    setSettings((s) => ({ ...s, profileName: (name || "").trim() || s.profileName, onboarded: true }));
    if (examples) loadExamples();
    setOnboarding(false);
  }, [loadExamples]);

  const T = useMemo(() => resolveTheme(settings.theme), [settings.theme]);
  const catColor = useCallback((id) => (categories.find((c) => c.id === id) || { color: T.muted }).color, [categories, T]);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [today, setToday] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const todayKey = toKey(today);
  // Opening/resuming the app always lands on the real today: refresh on visibility,
  // focus, and a minute tick (catches midnight rollover while open).
  useEffect(() => {
    const refresh = () => {
      const d = new Date(); d.setHours(0, 0, 0, 0);
      setToday((prev) => (prev.getTime() === d.getTime() ? prev : d));
    };
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", refresh);
    const iv = setInterval(refresh, 60000);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", refresh); clearInterval(iv); };
  }, []);
  const [nav, setNav] = useState("Planner");
  const [quickCat, setQuickCat] = useState(null);   // category for the next quick-added task
  const [filterCat, setFilterCat] = useState(null); // filters which tasks show in the planner grid

  const [taskModal, setTaskModal] = useState(null);
  const [taskSheet, setTaskSheet] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // {title, body, onYes}
  const [toast, setToast] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [scrollNonce, setScrollNonce] = useState(0);
  const [plannerView, setPlannerView] = useState("week"); // week | day (time-blocking timeline)
  const [dayCursor, setDayCursor] = useState(null); // date key for Day view; null follows today
  const [routines, setRoutines] = useState(boot.routines);
  const [planPreview, setPlanPreview] = useState(null); // { dateKey, assignments:[{id,title,time,durationMinutes,category}] }
  const [weeklyReview, setWeeklyReview] = useState(false);
  // date rollover (e.g. reopening the app the next morning) → land on the current week, centred on today
  useEffect(() => {
    setWeekStart(startOfWeek(today));
    setScrollNonce((n) => n + 1);
  }, [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bursts, setBursts] = useState([]);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [focusStart, setFocusStart] = useState(null);
  useEffect(() => { if (focusTaskId) setFocusStart(Date.now()); else setFocusStart(null); }, [focusTaskId]);
  const reducedMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fireCelebration = useCallback((x, y, color) => {
    if (reducedMotion()) return;
    const id = uid();
    setBursts((b) => [...b, { id, x, y, color, big: false }]);
    setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 1100);
  }, []);
  const fireBigCelebration = useCallback((x, y) => {
    if (reducedMotion()) return;
    const id = uid();
    setBursts((b) => [...b, { id, x, y, color: "#A855F7", big: true }]);
    setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 1400);
  }, []);
  const [storageWarn, setStorageWarn] = useState(false);
  const importRef = useRef(null);
  const undoRef = useRef(null);

  const flash = useCallback((msg, undo, variant) => {
    setToast({ msg, undo, variant: variant || "info" });
    clearTimeout(undoRef.current);
    undoRef.current = setTimeout(() => setToast(null), undo ? 5000 : 2400);
  }, []);

  // ---- persistence (debounced writes; flushed on tab-hide / unload / unmount so nothing is lost) ----
  useDebouncedWrite(tasks, (v) => { if (!storageSet(K.tasks, v)) setStorageWarn(true); });
  useDebouncedWrite(notes, (v) => { if (!storageSet(K.notes, v)) setStorageWarn(true); });
  useDebouncedWrite(tables, (v) => storageSet(K.tables, v));
  useDebouncedWrite(collections, (v) => storageSet(K.collections, v));
  useDebouncedWrite(savedSearches, (v) => storageSet(K.savedSearches, v));
  useDebouncedWrite(searchHistory, (v) => storageSet(K.searchHistory, v));
  useDebouncedWrite(routines, (v) => storageSet(K.routines, v));
  useDebouncedWrite(settings, (v) => { storageSet(K.settings, v); storageSet(K.theme, v.theme); });

  // ---- inline favicon + title (silences favicon 404 in any host shell) ----
  useEffect(() => {
    try {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23A855F7'/><stop offset='50%' stop-color='%23D946EF'/><stop offset='100%' stop-color='%23F472B6'/></linearGradient></defs><rect width='32' height='32' rx='8' fill='url(%23g)'/><circle cx='16' cy='16' r='3.4' fill='%23fff'/><g stroke='%23fff' stroke-width='1.6' fill='none' opacity='0.9'><ellipse cx='16' cy='16' rx='11' ry='5'/><ellipse cx='16' cy='16' rx='11' ry='5' transform='rotate(60 16 16)'/></g></svg>`;
      const href = "data:image/svg+xml," + svg;
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.type = "image/svg+xml"; link.href = href;
      if (document.title === "" || /vite|react|document/i.test(document.title)) document.title = "Week Planner — LifeOS";
    } catch {}
  }, []);

  // ---- Cmd/Ctrl+K ----
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ---- task ops ----
  const upsertTask = (data) => setTasks((prev) => {
    if (data.id && prev.some((t) => t.id === data.id)) return prev.map((t) => (t.id === data.id ? { ...t, ...data, updatedAt: now() } : t));
    return [...prev, { id: uid(), completed: false, completedDates: [], recurring: { enabled: false, days: [] }, createdAt: now(), updatedAt: now(), ...data }];
  });
  const deleteTask = (id) => {
    const removed = tasks.find((t) => t.id === id);
    setTasks((p) => p.filter((t) => t.id !== id));
    flash("Task deleted", () => setTasks((p) => [...p, removed]), "danger");
  };
  const toggleTaskDate = (id, dateKey, origin) => setTasks((p) => {
    let toggledTask = null, becameComplete = false;
    const nextList = p.map((t) => {
      if (t.id !== id) return t;
      toggledTask = t;
      if (t.recurring && t.recurring.enabled) {
        const set = new Set(t.completedDates || []);
        becameComplete = !set.has(dateKey);
        becameComplete ? set.add(dateKey) : set.delete(dateKey);
        return { ...t, completedDates: [...set], updatedAt: now() };
      }
      becameComplete = !t.completed;
      return { ...t, completed: becameComplete, updatedAt: now() };
    });
    if (becameComplete && origin && toggledTask) {
      fireCelebration(origin.x, origin.y, catColor(toggledTask.category));
      // "Perfect day" — if every task occurring on this date is now complete (and there are at least 2)
      const onDate = nextList.filter((t) => (t.recurring && t.recurring.enabled) ? recursOn(t, dateKey) : t.date === dateKey);
      if (onDate.length >= 2 && onDate.every((t) => isComplete(t, dateKey))) {
        setTimeout(() => {
          const cx = (typeof window !== "undefined" ? window.innerWidth : 800) / 2;
          fireBigCelebration(cx, 180);
          flash("Perfect day — every task done! 🎉", null, "milestone");
        }, 420);
      } else {
        flash("Task completed ✨", null, "success");
      }
    }
    return nextList;
  });
  const moveTask = (id, dateKey) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, date: dateKey, recurring: { enabled: false, days: [] }, updatedAt: now() } : t)));
  const duplicateTask = (task) => { const copy = { ...task, id: uid(), completed: false, completedDates: [], title: task.title + " (copy)", createdAt: now(), updatedAt: now(), linkedNoteIds: [] }; setTasks((p) => [...p, copy]); flash("Task duplicated", null, "success"); };
  const cyclePriority = (id) => setTasks((p) => p.map((t) => t.id === id ? { ...t, priority: t.priority === "high" ? "low" : t.priority === "low" ? "medium" : "high", updatedAt: now() } : t));
  const startFocus = (id) => { setFocusTaskId(id); const t = tasks.find((x) => x.id === id); flash(`Focusing: ${t ? t.title : "task"}`, null, "info"); };

  // ---- routines: save a day's blocks, stamp them onto another day ----
  const saveRoutineFromDay = (dateKey, name) => {
    const onDate = tasksOnDateRaw(dateKey);
    if (!onDate.length) { flash("Nothing on this day to save", null, "info"); return; }
    const blocks = onDate.map((t) => ({ title: t.title, time: t.time || "", durationMinutes: t.durationMinutes || 30, category: t.category, priority: t.priority || "medium", notes: t.notes || "" }));
    const r = { id: uid(), name: (name || "Routine").trim().slice(0, 40), blocks, createdAt: now() };
    setRoutines((p) => [r, ...p]);
    flash(`Saved “${r.name}” · ${blocks.length} block${blocks.length === 1 ? "" : "s"}`, null, "success");
  };
  const applyRoutine = (routineId, dateKey) => {
    const r = routines.find((x) => x.id === routineId); if (!r) return;
    const created = r.blocks.map((b) => ({ id: uid(), title: b.title, date: dateKey, time: b.time, durationMinutes: b.durationMinutes, category: b.category, priority: b.priority, notes: b.notes || "", completed: false, completedDates: [], recurring: { enabled: false, days: [] }, createdAt: now(), updatedAt: now() }));
    setTasks((p) => [...p, ...created]);
    const ids = new Set(created.map((c) => c.id));
    flash(`Stamped “${r.name}” · ${created.length} task${created.length === 1 ? "" : "s"}`, () => setTasks((p) => p.filter((t) => !ids.has(t.id))), "success");
  };
  const deleteRoutine = (routineId) => setRoutines((p) => p.filter((x) => x.id !== routineId));

  // ---- plan my day: fit untimed tasks into free gaps, then preview before committing ----
  const planDay = (dateKey) => {
    const onDate = tasksOnDateRaw(dateKey);
    const allUntimed = onDate.filter((t) => !t.time);
    const untimed = allUntimed.filter((t) => !isComplete(t, dateKey));
    // friendly, specific guidance for every empty case
    if (!onDate.length) { flash("This day is empty — add a few tasks, then I’ll lay them out.", null, "info"); return; }
    if (!allUntimed.length) { flash("Everything here already has a time. Add a task with no time (an “Anytime” task) and Plan my day will slot it in.", null, "info"); return; }
    if (!untimed.length) { flash("Your Anytime tasks are all done ✓ — nothing left to schedule.", null, "info"); return; }
    const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
    // busy intervals from existing timed tasks on this day
    const busy = onDate.filter((t) => t.time).map((t) => { const s = toMin(t.time); return [s, s + Math.max(15, t.durationMinutes || 30)]; }).sort((a, b) => a[0] - b[0]);
    // working window: 8:00 → 22:00, and never schedule in the past on today
    const isToday = dateKey === toKey(today);
    const WORK_START = 8 * 60, WORK_END = 22 * 60;
    let cursor = WORK_START;
    if (isToday) { const nowM = new Date().getHours() * 60 + new Date().getMinutes(); cursor = Math.max(cursor, Math.ceil(nowM / 15) * 15); }
    // order: high → low priority, then longer first (anchor the big rocks)
    const rank = { high: 0, medium: 1, low: 2 };
    const queue = [...untimed].sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || (b.durationMinutes || 30) - (a.durationMinutes || 30));
    const nextFree = (from, dur) => { let t0 = from; for (const [bs, be] of busy) { if (t0 + dur <= bs) return t0; if (t0 < be) t0 = be; } return t0; };
    const assignments = [];
    for (const t of queue) {
      const dur = Math.max(15, t.durationMinutes || 30);
      const slot = nextFree(cursor, dur);
      if (slot + dur > WORK_END) continue; // doesn't fit before 10pm — try the next (shorter) task
      assignments.push({ id: t.id, title: t.title, time: `${pad(Math.floor(slot / 60))}:${pad(slot % 60)}`, durationMinutes: dur, category: t.category });
      busy.push([slot, slot + dur]); busy.sort((a, b) => a[0] - b[0]);
      cursor = slot + dur;
    }
    if (!assignments.length) { flash(isToday ? "No room left before 10pm today — try a lighter day or shorter tasks." : "This day is fully booked until 10pm — free up time or shorten tasks.", null, "info"); return; }
    setPlanPreview({ dateKey, assignments, leftover: untimed.length - assignments.length });
  };
  const commitPlan = () => {
    if (!planPreview) return;
    const map = {}; planPreview.assignments.forEach((a) => { map[a.id] = a; });
    setTasks((p) => p.map((t) => map[t.id] ? { ...t, time: map[t.id].time, durationMinutes: map[t.id].durationMinutes, updatedAt: now() } : t));
    flash(`Planned ${planPreview.assignments.length} task${planPreview.assignments.length === 1 ? "" : "s"} ✨`, null, "success");
    setPlanPreview(null);
  };

  // ---- note ops ----
  // upsertNote returns the note id (so create-and-link flows can wire links)
  const upsertNote = (data) => {
    let resultId = data.id;
    setNotes((prev) => {
      if (data.id && prev.some((n) => n.id === data.id)) {
        return prev.map((n) => (n.id === data.id ? migrateNote({ ...n, ...data, tags: data.tags || n.tags, updatedAt: now() }) : n));
      }
      const fresh = migrateNote({ ...data, id: data.id || uid(), createdAt: now(), updatedAt: now() });
      resultId = fresh.id;
      return [fresh, ...prev];
    });
    return resultId;
  };
  const deleteNote = (id) => {
    const removed = notes.find((n) => n.id === id);
    setNotes((p) => p.filter((n) => n.id !== id));
    // also unlink from any tasks
    setTasks((p) => p.map((t) => (t.linkedNoteIds || []).includes(id) ? { ...t, linkedNoteIds: t.linkedNoteIds.filter((x) => x !== id) } : t));
    flash("Note deleted", () => setNotes((p) => [removed, ...p]), "danger");
  };
  const togglePin = (id) => setNotes((p) => p.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: now() } : n)));
  const toggleFavorite = (id) => setNotes((p) => p.map((n) => (n.id === id ? { ...n, favorite: !n.favorite, updatedAt: now() } : n)));
  const toggleArchive = (id) => { setNotes((p) => p.map((n) => (n.id === id ? { ...n, archived: !n.archived, updatedAt: now() } : n))); flash("Note archived"); };
  const duplicateNote = (id) => setNotes((p) => { const src = p.find((n) => n.id === id); if (!src) return p; const copy = migrateNote({ ...src, id: uid(), title: src.title + " (copy)", pinned: false, createdAt: now(), updatedAt: now() }); return [copy, ...p]; });
  const markNoteOpened = (id) => setNotes((p) => p.map((n) => (n.id === id ? { ...n, lastOpenedAt: now() } : n)));

  // ---- note<->task linking ----
  const linkNoteTask = (noteId, taskId) => {
    setNotes((p) => p.map((n) => n.id === noteId ? { ...n, linkedTaskIds: [...new Set([...(n.linkedTaskIds || []), taskId])], updatedAt: now() } : n));
    setTasks((p) => p.map((t) => t.id === taskId ? { ...t, linkedNoteIds: [...new Set([...(t.linkedNoteIds || []), noteId])] } : t));
  };
  const unlinkNoteTask = (noteId, taskId) => {
    setNotes((p) => p.map((n) => n.id === noteId ? { ...n, linkedTaskIds: (n.linkedTaskIds || []).filter((x) => x !== taskId), updatedAt: now() } : n));
    setTasks((p) => p.map((t) => t.id === taskId ? { ...t, linkedNoteIds: (t.linkedNoteIds || []).filter((x) => x !== noteId) } : t));
  };

  // ---- daily / calendar notes ----
  const notesForDate = useCallback((dateKey) => notes.filter((n) => !n.archived && n.linkedDate === dateKey), [notes]);
  const dailyNoteFor = useCallback((dateKey) => notes.find((n) => n.type === "daily" && n.linkedDate === dateKey), [notes]);
  const openOrCreateDaily = (dateKey) => {
    const existing = dailyNoteFor(dateKey);
    if (existing) { markNoteOpened(existing.id); setNoteModal(existing); return; }
    setNoteModal(makeNote({ type: "daily", title: dailyTitle(dateKey), body: DAILY_TEMPLATE_BODY, linkedDate: dateKey, collectionId: "daily", category: "Personal" }));
  };
  // open a note by title (wiki link); offer create if missing
  const openNoteByTitle = (title) => {
    const found = notes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (found) { markNoteOpened(found.id); setNoteModal(found); }
    else setNoteModal(makeNote({ title }));
  };

  // ---- saved searches ----
  const addSavedSearch = (name, query, filters) => setSavedSearches((p) => [...p, { id: uid(), name, query, filters: filters || {}, createdAt: now() }]);
  const deleteSavedSearch = (id) => setSavedSearches((p) => p.filter((s) => s.id !== id));
  const pushHistory = (q) => { if (!q.trim()) return; setSearchHistory((p) => [q, ...p.filter((x) => x !== q)].slice(0, 8)); };

  // ---- derived ----
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const allTags = useMemo(() => {
    const m = {}; notes.forEach((n) => { if (!n.archived) noteTags(n).forEach((t) => { m[t] = (m[t] || 0) + 1; }); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const sortTasks = (arr) => [...arr].sort((a, b) => {
    const ta = a.time || "99:99", tb = b.time || "99:99";
    if (ta !== tb) return ta < tb ? -1 : 1;
    const pr = { high: 0, medium: 1, low: 2 };
    const pa = pr[a.priority] ?? 3, pb = pr[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  // tasks occurring on a given dateKey (one-offs by date + recurring matches) — unfiltered
  const tasksOnDateRaw = useCallback((dateKey) => {
    const list = tasks.filter((t) => {
      if (t.recurring && t.recurring.enabled) return recursOn(t, dateKey);
      return t.date === dateKey;
    });
    return sortTasks(list);
  }, [tasks]);
  // grid view: applies the planner category filter
  const tasksOnDate = useCallback((dateKey) => {
    const list = tasksOnDateRaw(dateKey);
    return filterCat ? list.filter((t) => t.category === filterCat) : list;
  }, [tasksOnDateRaw, filterCat]);

  const tasksByDay = useMemo(() => {
    const m = {}; days.forEach((d) => { m[toKey(d)] = tasksOnDate(toKey(d)); }); return m;
  }, [days, tasksOnDate]);

  // dashboard metrics always reflect ALL tasks (never silently filtered)
  const todayTasks = useMemo(() => tasksOnDateRaw(todayKey), [tasksOnDateRaw, todayKey]);
  const doneToday = todayTasks.filter((t) => isComplete(t, todayKey)).length;
  const weekStats = useMemo(() => {
    let total = 0, doneN = 0;
    for (const d of days) { const k = toKey(d); const list = tasksOnDateRaw(k); total += list.length; doneN += list.filter((t) => isComplete(t, k)).length; }
    return { total, done: doneN };
  }, [days, tasksOnDateRaw]);
  const focusMin = todayTasks.filter((t) => isComplete(t, todayKey)).reduce((s, t) => s + (t.durationMinutes || 0), 0);

  const byCategory = useMemo(() => {
    const m = {}; todayTasks.forEach((t) => { m[t.category] = (m[t.category] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [todayTasks]);

  const momentum = useMemo(() => {
    const bars = days.map((d) => tasksOnDateRaw(toKey(d)).filter((t) => isComplete(t, toKey(d))).length);
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const k = toKey(addDays(today, -i));
      const has = tasksOnDateRaw(k).some((t) => isComplete(t, k));
      if (has) streak++; else if (i > 0) break; else continue;
    }
    return { bars, streak };
  }, [days, tasksOnDateRaw, today]);

  const carryover = useMemo(() =>
    sortTasks(tasks.filter((t) => !(t.recurring && t.recurring.enabled) && !t.completed && fromKey(t.date) < today)).slice(0, 8),
    [tasks, today]);

  const recentNotes = useMemo(() =>
    [...notes].filter((n) => !n.archived).sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt < a.updatedAt ? -1 : 1)).slice(0, 4),
    [notes]);

  // notes created/updated today (for dashboard)
  const notesTodayCount = useMemo(() => notes.filter((n) => !n.archived && (toKey(new Date(n.updatedAt)) === todayKey || toKey(new Date(n.createdAt)) === todayKey)).length, [notes, todayKey]);
  const unlinkedNotes = useMemo(() => notes.filter((n) => !n.archived && (n.linkedTaskIds || []).length === 0 && !n.linkedDate), [notes]);

  // ---- backup ----
  const buildBackup = () => ({ version: 3, exportedAt: now(), tasks, notes, settings, categories, tables, collections, savedSearches, searchHistory, noteTemplates: NOTE_TEMPLATE_DEFS });
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `week-planner-backup-${toKey(new Date())}.json`; a.click();
    URL.revokeObjectURL(url); flash("Backup exported", null, "success");
  };
  const importBackup = (file) => {
    const r = new FileReader();
    r.onload = () => {
      let d;
      try { d = JSON.parse(r.result); } catch { flash("Invalid backup: not valid JSON"); return; }
      if (!d || !Array.isArray(d.tasks) || !Array.isArray(d.notes)) { flash("Invalid backup: missing tasks/notes"); return; }
      const migrated = migrateNotes(d.notes);
      const collCount = Array.isArray(d.collections) ? d.collections.length : 0;
      setConfirm({
        title: "Restore backup?",
        body: `Replaces current data with ${d.tasks.length} tasks, ${migrated.length} notes${collCount ? `, ${collCount} collections` : ""} from the backup. This cannot be undone.`,
        yesLabel: "Restore",
        onYes: () => {
          setTasks(d.tasks); setNotes(migrated);
          if (Array.isArray(d.tables)) setTables(d.tables);
          if (Array.isArray(d.collections) && d.collections.length) setCollections(d.collections);
          if (Array.isArray(d.savedSearches)) setSavedSearches(d.savedSearches);
          if (Array.isArray(d.searchHistory)) setSearchHistory(d.searchHistory);
          if (d.settings) setSettings(d.settings);
          setConfirm(null); flash("Backup restored", null, "success");
        },
      });
    };
    r.readAsText(file);
  };
  const resetData = () => setConfirm({
    title: "Reset all data?",
    body: "This permanently clears all tasks, notes, collections and tables, then reloads the sample data. This cannot be undone.",
    yesLabel: "Reset", danger: true,
    onYes: () => { const s = seed(); setTasks(s.tasks); setNotes(s.notes); setTables(s.tables); setCollections(s.collections); setSavedSearches([]); setSearchHistory([]); setConfirm(null); flash("Data reset to samples"); },
  });
  const clearData = () => setConfirm({
    title: "Clear all data?",
    body: "This permanently removes every task, note, collection and table, and returns you to the welcome setup.",
    yesLabel: "Clear", danger: true,
    onYes: () => { setTasks([]); setNotes([]); setTables([]); setCollections(DEFAULT_COLLECTIONS); setSavedSearches([]); setSearchHistory([]); setSettings((s) => ({ ...s, onboarded: false })); setConfirm(null); setNav("Planner"); setOnboarding(true); },
  });

  const goToday = () => { setWeekStart(startOfWeek(new Date())); setNav("Planner"); setScrollNonce((n) => n + 1); };
  // power shortcuts: N or "/" focuses quick add, T jumps to today — never while typing or in a modal
  useEffect(() => {
    const h = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el && el.closest && el.closest("input, textarea, select, [contenteditable=\'true\'], [contenteditable=\'\']")) return;
      if (taskModal || noteModal || paletteOpen) return;
      const k = e.key.toLowerCase();
      if (k === "n" || k === "/") {
        e.preventDefault();
        setNav("Planner");
        requestAnimationFrame(() => { const inp = document.getElementById("quickadd-input"); if (inp) inp.focus(); });
      } else if (k === "t") { goToday(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [taskModal, noteModal, paletteOpen]);
  const setTheme = (theme) => setSettings((s) => ({ ...s, theme }));
  const cycleTheme = () => { const order = ["dark", "light", "high-contrast"]; setTheme(order[(order.indexOf(settings.theme === "system" ? "dark" : settings.theme) + 1) % order.length]); };

  const S = useMemo(() => makeStyles(T), [T]);
  const ctx = { T, S, categories, catColor, settings };

  return (
    <div style={S.root}>
      <style>{makeCSS(T)}</style>
      {onboarding ? <OnboardingFlow T={T} onFinish={finishOnboarding} /> : <LaunchReveal T={T} />}
      <div style={S.shell}>
        <AmbientArt T={T} nav={nav} />
        <Sidebar {...ctx} nav={nav} setNav={(n) => { setNav(n); setDrawer(false); }} open={drawer} onClose={() => setDrawer(false)}
          profileName={settings.profileName || "You"} setProfileName={(v) => setSettings((s) => ({ ...s, profileName: v }))} />
        <div style={S.main}>
          <Header {...ctx} todayPct={todayTasks.length ? doneToday / todayTasks.length : 0} weekStart={weekStart} navName={nav}
            onPrev={() => setWeekStart((w) => addDays(w, -7))} onNext={() => setWeekStart((w) => addDays(w, 7))}
            onToday={goToday} onPalette={() => setPaletteOpen(true)} onQuickAdd={() => setTaskModal({ date: todayKey })}
            onMenu={() => setDrawer(true)} onExport={exportBackup} onImport={() => importRef.current?.click()} onCycleTheme={cycleTheme} onWeeklyReview={() => setWeeklyReview(true)} />

          <div className="scrollarea mobileBody" style={S.body} role="main" aria-label="Content">
            <div className="centerStage" key={nav} style={S.centerCol}>
              {nav === "Planner" && (
                <QuickAdd {...ctx} tasks={tasks} activeCat={quickCat} setActiveCat={setQuickCat}
                  onAdd={(payload) => {
                    upsertTask(payload);
                    // smart conflict check: does this collide with another timed task that day?
                    let conflict = null;
                    if (payload.time && payload.date) {
                      const [h, m] = payload.time.split(":").map(Number);
                      const st = h * 60 + m, en = st + (payload.durationMinutes || 30);
                      conflict = tasks.find((t) => {
                        if (!t.time) return false;
                        const onDay = (t.recurring && t.recurring.enabled) ? recursOn(t, payload.date) : t.date === payload.date;
                        if (!onDay) return false;
                        const [th, tm] = t.time.split(":").map(Number);
                        const ts = th * 60 + tm, te = ts + (t.durationMinutes || 30);
                        return st < te && ts < en;
                      });
                    }
                    flash(conflict ? `Added — heads up, overlaps “${conflict.title}” at ${conflict.time}` : "Task added", null, "success");
                  }} todayKey={todayKey} />
              )}

              {nav === "Planner" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 40 }}>
                  <div className="viewSeg" style={S.viewSegWrap} role="tablist" aria-label="Planner view">
                    {[["week", "Week", IconGrid], ["day", "Day", IconClock]].map(([k, lbl, Ic]) => (
                      <button key={k} role="tab" aria-selected={plannerView === k} className="viewSegBtn focusable" onClick={() => setPlannerView(k)}
                        style={{ ...S.viewSegBtn, ...(plannerView === k ? S.viewSegBtnOn : null) }}><Ic w={15} /><span>{lbl}</span></button>
                    ))}
                  </div>
                  <div style={{ flex: 1 }} />
                  {plannerView === "week" && <FilterBar {...ctx} filterCat={filterCat} setFilterCat={setFilterCat} />}
                </div>
              )}

              {nav === "Planner" && plannerView === "week" && (
                <MobileTodaySummary {...ctx} tasksCount={todayTasks.length} done={doneToday} focusMin={focusMin} carryover={carryover.length} weekStats={weekStats} profileName={settings.profileName} onOpen={() => setNav("Dashboard")} />
              )}

              {nav === "Planner" && plannerView === "week" && (
                <UpNextStrip {...ctx} tasks={todayTasks} todayKey={todayKey} onOpen={setTaskModal} />
              )}

              {nav === "Planner" && focusTaskId && (() => { const ft = tasks.find((t) => t.id === focusTaskId); if (!ft) return null; return (
                <div className="focusBanner" style={S.focusBanner} role="status">
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FB7185", boxShadow: "0 0 10px #FB7185", flexShrink: 0 }} className="livePulse" />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>LIVE · {ft.title}</span>
                  <FocusTimer start={focusStart} T={T} />
                  <div style={{ flex: 1 }} />
                  <button className="pillbtn focusable" style={{ ...S.pill, padding: "6px 12px" }} onClick={() => { toggleTaskDate(ft.id, todayKey, { x: window.innerWidth / 2, y: 120 }); setFocusTaskId(null); }}>Complete</button>
                  <button className="pillbtn focusable" style={{ ...S.pill, padding: "6px 12px" }} onClick={() => setFocusTaskId(null)}>Stop</button>
                </div>
              ); })()}

              {nav === "Planner" && plannerView === "day" && (
                <DayTimeline {...ctx} dateKey={dayCursor || todayKey} todayKey={todayKey} tasksOnDate={tasksOnDateRaw}
                  onOpen={setTaskModal}
                  onToggle={(id, dk, pos) => toggleTaskDate(id, dk, pos)}
                  onCreate={(dk, time) => setTaskModal({ date: dk, time })}
                  onUpdate={(id, patch) => upsertTask({ id, ...patch })}
                  onSaveRoutine={saveRoutineFromDay} onApplyRoutine={applyRoutine} onDeleteRoutine={deleteRoutine} onPlanDay={planDay} routines={routines}
                  onPrev={() => setDayCursor(toKey(addDays(fromKey(dayCursor || todayKey), -1)))}
                  onNext={() => setDayCursor(toKey(addDays(fromKey(dayCursor || todayKey), 1)))}
                  onToday={() => setDayCursor(null)} />
              )}

              {nav === "Planner" && plannerView === "week" && (
                <WeekGrid {...ctx} days={days} today={today} tasksByDay={tasksByDay} scrollNonce={scrollNonce}
                  onAdd={(dk) => setTaskModal({ date: dk })} onOpen={setTaskModal}
                  onToggle={toggleTaskDate} onMove={moveTask} onDelete={deleteTask}
                  onDuplicate={duplicateTask} onPriority={cyclePriority} onFocus={startFocus}
                  onOpenSheet={(task, dateKey, pos) => setTaskSheet({ task, dateKey, pos })}
                  notes={notes} notesForDate={notesForDate} dailyNoteFor={dailyNoteFor}
                  onDailyNote={openOrCreateDaily} onAddDayNote={(dk) => setNoteModal(makeNote({ linkedDate: dk, collectionId: "inbox" }))}
                  onOpenNote={(n) => { markNoteOpened(n.id); setNoteModal(n); }} />
              )}
              {nav === "Dashboard" && <FullDashboard {...ctx} tasks={tasks} days={days} todayTasks={todayTasks} todayKey={todayKey} doneToday={doneToday} focusMin={focusMin} byCategory={byCategory} momentum={momentum} tasksOnDate={tasksOnDateRaw}
                notes={notes} notesTodayCount={notesTodayCount} unlinkedNotes={unlinkedNotes} dailyNoteFor={dailyNoteFor} onOpenNote={(n) => { markNoteOpened(n.id); setNoteModal(n); }} onDailyNote={openOrCreateDaily} onGotoNotes={() => setNav("Notes")} />}
              {nav === "Notes" && <NotesPage {...ctx} notes={notes} tasks={tasks} collections={collections} setCollections={setCollections}
                savedSearches={savedSearches} addSavedSearch={addSavedSearch} deleteSavedSearch={deleteSavedSearch}
                searchHistory={searchHistory} pushHistory={pushHistory} allTags={allTags}
                onOpen={(n) => { markNoteOpened(n.id); setNoteModal(n); }} onNew={(over) => setNoteModal(makeNote(over || {}))}
                onDelete={deleteNote} onPin={togglePin} onFavorite={toggleFavorite} onArchive={toggleArchive} onDuplicate={duplicateNote}
                onDailyToday={() => openOrCreateDaily(todayKey)} onTemplate={(tpl) => setNoteModal(makeNote({ title: tpl.name === "Daily Note" ? dailyTitle(todayKey) : "", body: tpl.body, category: tpl.category, type: tpl.type, linkedDate: tpl.type === "daily" ? todayKey : null, collectionId: tpl.category.toLowerCase() }))} todayKey={todayKey} />}
              {nav === "Templates" && <TemplatesPage {...ctx} onTask={(d) => { upsertTask({ ...d, date: todayKey }); flash("Task created from template"); setNav("Planner"); }} onNote={(d) => { setNoteModal(makeNote(d)); setNav("Notes"); }} />}
              {nav === "Tables" && <TablesPage {...ctx} tables={tables} setTables={setTables} />}
              {nav === "Categories" && <CategoriesPage {...ctx} tasks={tasks} />}
              {nav === "Analytics" && <AnalyticsPage {...ctx} tasks={tasks} days={days} tasksOnDate={tasksOnDateRaw} momentum={momentum} />}
              {nav === "Settings" && <SettingsPage {...ctx} setTheme={setTheme} onExport={exportBackup} onImport={() => importRef.current?.click()} onReset={resetData} onClear={clearData} taskCount={tasks.length} noteCount={notes.length} storageWarn={storageWarn} lsAvailable={LS_AVAILABLE} />}

              {nav === "Planner" && (
                <NotesSection {...ctx} notes={recentNotes} onOpen={(n) => { markNoteOpened(n.id); setNoteModal(n); }} onNew={() => setNoteModal(makeNote({}))} onViewAll={() => setNav("Notes")} onDailyToday={() => openOrCreateDaily(todayKey)} />
              )}
            </div>

            {(nav === "Planner" || nav === "Dashboard" || nav === "Notes") && (
              <DashboardPanel {...ctx} today={today} tasksCount={todayTasks.length} done={doneToday} focusMin={focusMin} weekStats={weekStats}
                byCategory={byCategory} momentum={momentum} carryover={carryover} notesTodayCount={notesTodayCount}
                dailyDone={!!dailyNoteFor(todayKey)} onDailyNote={() => openOrCreateDaily(todayKey)}
                onCarryAction={(action, t, dk) => {
                  if (action === "today") { moveTask(t.id, todayKey); flash("Moved to today", null, "success"); }
                  else if (action === "reschedule") { moveTask(t.id, dk); flash("Rescheduled", null, "success"); }
                  else if (action === "done") { toggleTaskDate(t.id, t.date, { x: window.innerWidth - 160, y: 200 }); flash("Marked done ✨", null, "success"); }
                  else if (action === "delete") { deleteTask(t.id); }
                  else if (action === "open") { setTaskModal(t); }
                }} onViewAll={() => setNav("Dashboard")} />
            )}
          </div>
        </div>
        <BottomNav T={T} S={S} nav={nav} setNav={setNav} onAdd={() => setTaskModal({ date: todayKey })} onMenu={() => setDrawer(true)} />
      </div>

      {taskModal && <TaskModal {...ctx} data={taskModal} notes={notes} onClose={() => setTaskModal(null)}
        onSave={(d) => { const linkId = d._linkNoteId; const clean = { ...d }; delete clean._linkNoteId; const before = clean.id; const tid = before || uid(); if (!before) clean.id = tid; upsertTask(clean); if (linkId) linkNoteTask(linkId, tid); setTaskModal(null); flash(before ? "Task updated" : "Task added"); }}
        onDelete={(id) => { deleteTask(id); setTaskModal(null); }}
        onMove={(id, dk) => { moveTask(id, dk); setTaskModal(null); flash("Task moved"); }} today={today}
        onOpenNote={(n) => { setTaskModal(null); markNoteOpened(n.id); setNoteModal(n); }}
        onAddLinkedNote={(task) => { setTaskModal(null); setNoteModal(makeNote({ linkedTaskIds: [task.id], linkedDate: task.date, category: task.category, collectionId: (task.category || "").toLowerCase() })); }}
        onReviewNote={(task) => { setTaskModal(null); const tpl = NOTE_TEMPLATE_DEFS.find((x) => x.id === "tpl-weekly"); setNoteModal(makeNote({ title: `Review — ${task.title}`, body: tpl.body, linkedTaskIds: [task.id], linkedDate: task.date, category: task.category, type: "review" })); }} />}
      {noteModal && <NoteModal {...ctx} data={noteModal} notes={notes} tasks={tasks} collections={collections} allTags={allTags} today={today} todayKey={todayKey}
        onClose={() => setNoteModal(null)}
        onSave={(d, opts) => { const id = upsertNote(d); (d.linkedTaskIds || []).forEach((tid) => linkNoteTask(id, tid)); if (opts && opts.keepOpen) return id; setNoteModal(null); flash(d.id ? "Note updated" : "Note created"); return id; }}
        onDelete={(id) => { deleteNote(id); setNoteModal(null); }}
        onArchive={(id) => { toggleArchive(id); setNoteModal(null); }}
        onOpenTask={(t) => { setNoteModal(null); setTaskModal(t); }}
        onOpenNoteTitle={(title) => { openNoteByTitle(title); }}
        onCreateTask={(payload, noteId) => { setNoteModal(null); setTaskModal({ ...payload, _linkNoteId: noteId }); }}
        linkNoteTask={linkNoteTask} unlinkNoteTask={unlinkNoteTask} />}
      {paletteOpen && <CommandPalette {...ctx} tasks={tasks} notes={notes} collections={collections} allTags={allTags} templates={NOTE_TEMPLATE_ALL} onClose={() => setPaletteOpen(false)}
        actions={{
          addTask: () => { setPaletteOpen(false); setTaskModal({ date: todayKey }); },
          addNote: () => { setPaletteOpen(false); setNoteModal(makeNote({})); },
          dailyToday: () => { setPaletteOpen(false); openOrCreateDaily(todayKey); },
          noteFromTemplate: (tpl) => { setPaletteOpen(false); setNoteModal(makeNote({ title: tpl.type === "daily" ? dailyTitle(todayKey) : "", body: tpl.body, category: tpl.category, type: tpl.type, linkedDate: tpl.type === "daily" ? todayKey : null })); },
          goToday: () => { goToday(); setPaletteOpen(false); },
          weeklyReview: () => { setPaletteOpen(false); setWeeklyReview(true); },
          openPlanner: () => { setNav("Planner"); setPaletteOpen(false); },
          openDashboard: () => { setNav("Dashboard"); setPaletteOpen(false); },
          openNotes: () => { setNav("Notes"); setPaletteOpen(false); },
          openSettings: () => { setNav("Settings"); setPaletteOpen(false); },
          exportBackup: () => { setPaletteOpen(false); exportBackup(); },
          importBackup: () => { setPaletteOpen(false); importRef.current?.click(); },
          toggleTheme: () => { cycleTheme(); setPaletteOpen(false); },
          openTask: (t) => { setPaletteOpen(false); setTaskModal(t); },
          openNote: (n) => { setPaletteOpen(false); markNoteOpened(n.id); setNoteModal(n); },
        }} />}
      {confirm && <ConfirmModal {...ctx} {...confirm} onClose={() => setConfirm(null)} />}
      {planPreview && <PlanPreviewModal {...ctx} plan={planPreview} onConfirm={commitPlan} onClose={() => setPlanPreview(null)} />}
      {weeklyReview && <WeeklyReviewModal {...ctx} tasks={tasks} days={days} today={today} todayKey={todayKey}
        tasksOnDate={tasksOnDateRaw} onMove={moveTask} onOpen={(t) => { setWeeklyReview(false); setTaskModal(t); }}
        onAddPriority={(title) => upsertTask({ title, date: toKey(addDays(startOfWeek(today), 7)) })}
        onClose={() => setWeeklyReview(false)} />}
      {taskSheet && <TaskSheet {...ctx} sheet={taskSheet} today={today} onClose={() => setTaskSheet(null)}
        onEdit={(t) => { setTaskSheet(null); setTaskModal(t); }}
        onToggle={(t, dk) => { toggleTaskDate(t.id, dk, { x: (typeof window !== "undefined" ? window.innerWidth : 400) - 80, y: 200 }); setTaskSheet(null); }}
        onFocus={(t) => { startFocus(t.id); setTaskSheet(null); }}
        onDuplicate={(t) => { duplicateTask(t); setTaskSheet(null); }}
        onPriority={(t) => { cyclePriority(t.id); setTaskSheet(null); }}
        onMove={(t, dk) => { moveTask(t.id, dk); setTaskSheet(null); flash("Task moved", null, "success"); }}
        onDelete={(t) => { deleteTask(t.id); setTaskSheet(null); }} />}

      <input ref={importRef} type="file" accept="application/json" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) importBackup(e.target.files[0]); e.target.value = ""; }} />

      {bursts.map((b) => <Celebration key={b.id} x={b.x} y={b.y} color={b.color} big={b.big} T={T} />)}
      {storageWarn && <div style={S.warnBar} role="alert">⚠ Storage is full or blocked — changes this session may not be saved. Export a backup to be safe.</div>}
      {toast && <div className="toastBox" style={{ ...S.toast, borderColor: toast.variant === "success" ? hexA("#34D399", 0.5) : toast.variant === "danger" ? hexA("#FB7185", 0.5) : toast.variant === "milestone" ? hexA(T.pink, 0.6) : hexA(T.purple, 0.5) }} role="status" aria-live="polite">
        <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: toast.variant === "success" ? "#34D399" : toast.variant === "danger" ? "#FB7185" : toast.variant === "milestone" ? T.pink : T.purple, boxShadow: `0 0 8px ${toast.variant === "success" ? "#34D399" : toast.variant === "danger" ? "#FB7185" : T.pink}` }} />
        <span>{toast.msg}</span>
        {toast.undo && <button className="focusable" style={S.undoBtn} onClick={() => { toast.undo(); setToast(null); }}>Undo</button>}
      </div>}
    </div>
  );
}

/* ============================================================
   7. SIDEBAR / HEADER / QUICK ADD
   ============================================================ */
const NAVS = [
  ["Planner", IconCal], ["Dashboard", IconGrid], ["Notes", IconNote],
  ["Templates", IconLayers], ["Tables", IconTable], ["Categories", IconTag],
  ["Analytics", IconChart], ["Settings", IconGear],
];
function Sidebar({ T, S, nav, setNav, open, onClose, profileName, setProfileName }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profileName || "");
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  const initial = (profileName || "Y").trim().charAt(0).toUpperCase() || "Y";
  const saveName = () => { const v = draft.trim() || "You"; setProfileName(v); setEditing(false); };
  return (
    <>
      {open && <div style={S.scrim} onClick={onClose} />}
      <aside className={"sidebar" + (open ? " sidebar-open" : "")} style={S.sidebar} aria-label="Main navigation">
        <div style={S.brandRow}>
          <div style={S.brandMark}><OrbitMark /></div>
          <div style={{ flex: 1 }}>
            <div className="gradText" style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Week Planner</div>
            <div style={{ fontSize: 11.5, color: T.muted }}>Plan your week. Build your life.</div>
          </div>
          <span className="mobileonly"><button className="iconbtn focusable" style={{ ...S.iconBtn, width: 34, height: 34 }} onClick={onClose} aria-label="Close menu"><IconX w={16} /></button></span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          {NAVS.map(([name, Icon]) => {
            const active = nav === name;
            return (
              <button key={name} onClick={() => setNav(name)} className="navbtn focusable" aria-current={active ? "page" : undefined}
                style={{ ...S.navBtn, ...(active ? S.navActive : null) }}>
                <span style={{ color: active ? T.text : T.muted, display: "grid", placeItems: "center" }}><Icon /></span>
                <span>{name}</span>
                {active && <span style={S.navGlow} />}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={S.quoteCard}>
          <div aria-hidden style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle, ${hexA(T.pink, 0.18)}, transparent 70%)`, pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", bottom: -36, left: -24, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${hexA(T.purple, 0.15)}, transparent 70%)`, pointerEvents: "none" }} />
          <div style={S.quoteMark}><span className="twink" style={{ display: "grid", placeItems: "center", color: "#fff" }}><IconSpark /></span></div>
          <div className="gradText" style={{ fontWeight: 800, marginTop: 8, letterSpacing: 0.2 }}>LifeOS</div>
          <div style={{ fontSize: 12.5, color: T.text2, marginTop: 6, fontStyle: "italic", lineHeight: 1.4, position: "relative" }}>“Discipline today, freedom tomorrow.”</div>
        </div>
        <div style={S.userRow}>
          <div style={S.avatar}>{initial}</div>
          {editing ? (
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={saveName}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false); }}
              maxLength={24} aria-label="Your name"
              style={{ flex: 1, background: T.panel2, border: `1px solid ${hexA(T.purple, 0.4)}`, borderRadius: 8, padding: "6px 9px", color: T.text, fontSize: 14, fontWeight: 600, outline: "none", minWidth: 0 }} />
          ) : (
            <button className="focusable" onClick={() => { setDraft(profileName || ""); setEditing(true); }} aria-label="Edit your name"
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: T.text, fontWeight: 600, fontSize: 14, textAlign: "left", padding: 0 }}>
              <span>{profileName || "You"}</span>
              <IconPencil w={13} style={{ marginLeft: "auto", color: T.muted }} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Header({ T, S, weekStart, navName, onPrev, onNext, onToday, onPalette, onQuickAdd, onMenu, onExport, onImport, onCycleTheme, onWeeklyReview, todayPct = 0 }) {
  const [menu, setMenu] = useState(false);
  const showWeek = navName === "Planner" || navName === "Dashboard";
  const e = addDays(weekStart, 6);
  const shortRange = `${MO[weekStart.getMonth()]} ${weekStart.getDate()}–${weekStart.getMonth() === e.getMonth() ? e.getDate() : MO[e.getMonth()] + " " + e.getDate()}`;
  return (
    <header style={{ ...S.header, position: "relative" }}>
      {todayPct > 0 && (
        <div aria-hidden style={{ position: "absolute", left: 0, bottom: -1, height: 2, width: `${Math.min(100, todayPct * 100)}%`, background: T.brandGrad, boxShadow: `0 0 8px ${T.hotPink}, 0 0 16px ${T.purpleGlow}`, borderRadius: 2, transition: "width .7s cubic-bezier(.22,1,.36,1)", zIndex: 1 }} />
      )}
      <span className="mobileonly"><button className="iconbtn focusable" style={S.iconBtn} onClick={onMenu} aria-label="Open menu"><IconMenu /></button></span>

      {/* Desktop week nav (centered) */}
      {showWeek ? (
        <div className="deskonly" style={S.weekNav}>
          <button className="iconbtn focusable" style={S.iconBtn} onClick={onPrev} aria-label="Previous week"><IconChevron style={{ transform: "rotate(180deg)" }} /></button>
          <button className="pillbtn focusable" style={S.pill} onClick={onToday}>Today</button>
          <div style={{ fontWeight: 700, minWidth: 168, textAlign: "center" }}>{fmtRange(weekStart)}</div>
          <button className="iconbtn focusable" style={S.iconBtn} onClick={onNext} aria-label="Next week"><IconChevron /></button>
        </div>
      ) : <div className="deskonly gradText" style={{ margin: "0 auto", fontWeight: 800, fontSize: 18 }}>{navName}</div>}

      {/* Mobile compact center: prev / today+range / next */}
      <div className="mobileFlex" style={{ display: "none", alignItems: "center", gap: 6, flex: 1, justifyContent: "center", minWidth: 0 }}>
        {showWeek ? (
          <>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 36, height: 36 }} onClick={onPrev} aria-label="Previous week"><IconChevron style={{ transform: "rotate(180deg)" }} /></button>
            <button className="pillbtn focusable" style={{ ...S.pill, padding: "7px 10px", gap: 6, minWidth: 0 }} onClick={onToday}><span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{shortRange}</span></button>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 36, height: 36 }} onClick={onNext} aria-label="Next week"><IconChevron /></button>
          </>
        ) : <div style={{ fontWeight: 800, fontSize: 16 }}>{navName}</div>}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <HeaderClock T={T} />
        <div className="deskonly" style={{ width: 1, height: 26, background: `linear-gradient(180deg, transparent, ${T.border}, transparent)`, margin: "0 2px" }} />
        <button className="pillbtn deskonly focusable" style={{ ...S.pill, gap: 6 }} onClick={onPalette} aria-label="Open command palette"><span style={{ fontSize: 13 }}>⌘K</span></button>
        <button className="gradbtn focusable" style={S.gradBtn} onClick={onQuickAdd} aria-label="Quick add task"><IconPlus /> <span className="deskonly">Quick Add</span></button>
        <button className="iconbtn deskonly focusable" style={S.iconBtn} onClick={onExport} aria-label="Export backup"><IconExport /></button>
        <button className="iconbtn deskonly focusable" style={S.themeBtn} onClick={onCycleTheme} aria-label="Cycle theme"><IconSun /></button>
        <div style={{ position: "relative" }}>
          <button className="iconbtn focusable" style={S.iconBtn} onClick={() => setMenu((m) => !m)} aria-label="More options" aria-expanded={menu}><IconDots /></button>
          {menu && (
            <div style={S.menu} role="menu" onMouseLeave={() => setMenu(false)}>
              <span className="mobileonly2">
                <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setMenu(false); onCycleTheme(); }}>Cycle theme</button>
                <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setMenu(false); onPalette(); }}>Command palette</button>
              </span>
              <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setMenu(false); onWeeklyReview && onWeeklyReview(); }}>Weekly review</button>
              <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setMenu(false); onExport(); }}>Export backup</button>
              <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setMenu(false); onImport(); }}>Import backup</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function QuickAdd({ T, S, categories, catColor, activeCat, setActiveCat, onAdd, todayKey, tasks }) {
  const [val, setVal] = useState("");
  const qaRef = useRef(null);
  // smart suggestions: your most-repeated tasks + a time-of-day starter
  const suggestions = useMemo(() => {
    const freq = {};
    for (const t of (tasks || [])) {
      const k = (t.title || "").trim();
      if (k.length < 3 || k.length > 32) continue;
      freq[k] = (freq[k] || 0) + 1;
    }
    const top = Object.entries(freq).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    const hr = new Date().getHours();
    const starter = hr < 11 ? "Gym 60m" : hr < 17 ? "Deep work 90m" : "Plan tomorrow 15m";
    if (!top.some((t) => t.toLowerCase() === starter.toLowerCase())) top.push(starter);
    return top.slice(0, 3);
  }, [tasks]);
  const [priority, setPriority] = useState("medium");
  const [dateKey, setDateKey] = useState(todayKey);
  const [expanded, setExpanded] = useState(false);
  const submit = () => {
    if (!val.trim()) return;
    const p = parseQuick(val, categories);
    onAdd({
      title: p.title || val.trim(), category: p.category || activeCat || "Personal",
      time: p.time, durationMinutes: p.durationMinutes, priority: p.priority !== "medium" ? p.priority : priority,
      date: p.date || dateKey, notes: "", recurring: { enabled: false, days: [] }, completedDates: [],
    });
    setVal("");
  };
  const isToday = dateKey === todayKey;
  const dateLabel = isToday ? "Today" : `${MO[fromKey(dateKey).getMonth()]} ${fromKey(dateKey).getDate()}`;
  // live preview of what the parser detected (premium "smart" feedback)
  const preview = useMemo(() => val.trim() ? parseQuick(val, categories) : null, [val, categories]);
  const detectedCat = preview && (preview.category || activeCat);
  return (
    <div className="quickAddWrap" style={{ ...S.quickAdd, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 24, height: 24, borderRadius: 8, background: T.brandGrad, display: "grid", placeItems: "center", color: "#fff", boxShadow: `0 3px 10px ${T.purpleGlow}` }}><IconSpark w={13} /></span>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.2, color: T.text }}>Quick Add</span>
        <span style={{ fontSize: 10.5, color: T.vmuted, fontWeight: 600 }}>· auto-detects time, date & category</span>
      </div>
      <div style={S.quickRow}>
        <input className="quickInput" style={S.quickInput} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} onFocus={() => setExpanded(true)}
          placeholder="Add a task…" aria-label="Add a task" ref={qaRef} id="quickadd-input" />
        <button className="ghostbtn focusable qa-expand" style={{ ...S.ghostBtn, padding: "8px 10px" }} onClick={() => setExpanded((e) => !e)} aria-label="More options" aria-expanded={expanded}><IconDots w={16} /></button>
        <button className="gradbtn focusable" style={{ ...S.gradBtn, opacity: val.trim() ? 1 : 0.4, pointerEvents: val.trim() ? "auto" : "none" }} onClick={submit} aria-label="Add task"><IconPlus /> <span className="qa-addlabel">Add</span></button>
      </div>
      {!val.trim() && suggestions.length > 0 && (
        <div className="qa-suggest" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10, animation: "fade .25s ease" }}>
          <span className="twink" style={{ display: "grid", placeItems: "center", color: T.pink }}><IconSpark w={11} /></span>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: T.vmuted, marginRight: 2 }}>SUGGESTED</span>
          {suggestions.map((sg) => (
            <button key={sg} className="chip focusable" style={{ ...S.miniChip, cursor: "pointer", background: "transparent", color: T.text2, borderColor: T.border }}
              onClick={() => { setVal(sg); setExpanded(true); requestAnimationFrame(() => qaRef.current && qaRef.current.focus()); }}>{sg}</button>
          ))}
        </div>
      )}
      {preview && (preview.categoryAuto || preview.date || preview.time || preview.priority !== "medium") && (
        <div className="qa-preview" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, animation: "fade .2s ease" }}>
          {detectedCat && <span style={{ ...S.miniChip, color: catColor(detectedCat), borderColor: hexA(catColor(detectedCat), 0.45) }}><CatIcon id={detectedCat} w={11} /> {detectedCat}{preview.categoryAuto ? " · auto" : ""}</span>}
          {preview.date && <span style={{ ...S.miniChip, color: T.text2, borderColor: T.border }}><IconCal w={11} /> {preview.date === todayKey ? "Today" : `${MO[fromKey(preview.date).getMonth()]} ${fromKey(preview.date).getDate()}`}</span>}
          {preview.time && <span style={{ ...S.miniChip, color: T.text2, borderColor: T.border }}><IconClock w={11} /> {to12(preview.time)}</span>}
          {preview.durationMinutes !== 30 && <span style={{ ...S.miniChip, color: T.text2, borderColor: T.border }}>{preview.durationMinutes}m</span>}
          {preview.priority !== "medium" && <span style={{ ...S.miniChip, color: preview.priority === "high" ? "#FB7185" : T.muted, borderColor: T.border }}><IconFlag w={11} color={preview.priority === "high" ? "#FB7185" : T.muted} /> {preview.priority}</span>}
        </div>
      )}
      <div className={"qa-controls" + (expanded ? " qa-open" : "")} style={S.quickControls}>
        <button className="ghostbtn focusable" style={S.ghostBtn} onClick={() => setActiveCat((c) => c ? null : categories[0].id)} aria-label="Category">
          {activeCat ? <CatIcon id={activeCat} w={13} color={catColor(activeCat)} /> : <span style={{ ...S.dot, background: T.muted }} />} {activeCat || "Category"}
        </button>
        <label className="ghostbtn focusable" style={{ ...S.ghostBtn, position: "relative" }}>
          <IconCal w={14} /> {dateLabel}
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value || todayKey)} style={S.hiddenDate} aria-label="Task date" />
        </label>
        <button className="ghostbtn focusable" style={S.ghostBtn} onClick={() => setPriority((p) => p === "high" ? "low" : p === "low" ? "medium" : "high")} aria-label="Priority">
          <IconFlag color={priority === "high" ? "#FB7185" : priority === "medium" ? "#FBBF24" : T.muted} /> {priority[0].toUpperCase() + priority.slice(1)}
        </button>
      </div>
      <div className={"qa-chips chipRow" + (expanded ? " qa-open" : "")} style={S.chipRow}>
        {categories.map((c) => {
          const on = activeCat === c.id;
          return (
            <button key={c.id} className="chip focusable" onClick={() => setActiveCat(on ? null : c.id)} aria-pressed={on}
              style={{ ...S.chip, ...(on ? { borderColor: c.color, background: hexA(c.color, 0.14), color: T.text } : null) }}>
              <CatIcon id={c.id} w={12} color={c.color} /> {c.id}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/* ---- Mobile-only Today summary (shown above the day carousel) ---- */
function FilterBar({ T, S, categories, catColor, filterCat, setFilterCat }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{ position: "relative" }}>
        <button className="ghostbtn focusable" style={{ ...S.ghostBtn, ...(filterCat ? { borderColor: hexA(catColor(filterCat), 0.5), color: T.text } : null) }} onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
          <IconFilter w={14} /> {filterCat ? "Filtered" : "Filter"}
        </button>
        {open && (
          <div style={{ ...S.menu, left: 0, right: "auto", top: "calc(100% + 6px)", minWidth: 160, zIndex: 60 }} role="menu" onMouseLeave={() => setOpen(false)}>
            <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setFilterCat(null); setOpen(false); }}>All categories</button>
            <div style={S.menuSep} />
            {categories.map((c) => (
              <button key={c.id} role="menuitem" className="menuItem focusable" style={{ ...S.menuItem, display: "flex", alignItems: "center", gap: 8 }} onClick={() => { setFilterCat(c.id); setOpen(false); }}>
                <CatIcon id={c.id} w={13} color={c.color} /> {c.id}
              </button>
            ))}
          </div>
        )}
      </div>
      {filterCat && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 8px 6px 12px", borderRadius: 20, background: hexA(catColor(filterCat), 0.14), border: `1px solid ${hexA(catColor(filterCat), 0.4)}`, fontSize: 12.5, fontWeight: 600, color: T.text, animation: "fade .2s ease" }}>
          <CatIcon id={filterCat} w={12} color={catColor(filterCat)} /> Filtered by {filterCat}
          <button className="focusable" onClick={() => setFilterCat(null)} aria-label="Clear filter" style={{ all: "unset", cursor: "pointer", display: "grid", placeItems: "center", width: 18, height: 18, borderRadius: "50%", color: T.muted }}><IconX w={12} /></button>
        </div>
      )}
    </div>
  );
}
function FocusTimer({ start, T }) {
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  if (!start) return null;
  const s = Math.floor((Date.now() - start) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  return <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, color: T.pink, fontWeight: 700 }}>{mm}:{ss}</span>;
}
function MobileTodaySummary({ T, S, tasksCount, done, focusMin, carryover, onOpen, weekStats, profileName }) {
  const fh = Math.floor(focusMin / 60), fm = focusMin % 60;
  const pct = tasksCount ? Math.round((done / tasksCount) * 100) : 0;
  const wPct = weekStats && weekStats.total ? weekStats.done / weekStats.total : 0;
  const hr = new Date().getHours();
  const name = (profileName || "").trim();
  const greet = (hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening") + (name && name !== "You" ? `, ${name.split(" ")[0]}` : "");
  const motto = pct >= 100 && tasksCount ? "Day cleared — legend. 🏆" : pct >= 60 ? "Strong pace, keep going." : tasksCount ? "One task at a time." : "A clean slate today.";
  const Stat = ({ label, value, color }) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: color || T.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{label}</div>
    </div>
  );
  return (
    <div className="mobileSummary">
      <button className="focusable mobileSumBtn" onClick={onOpen} aria-label="Open dashboard"
        style={{ cursor: "pointer", width: "100%", background: `linear-gradient(${T.panel},${T.panel}) padding-box, ${T.edgeSoft} border-box`, border: "1px solid transparent", boxShadow: T.cardShadow, borderRadius: 18, padding: "13px 14px", boxSizing: "border-box", textAlign: "left", color: "inherit", font: "inherit", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.5 }}><SceneArt T={T} motif="peaks" color={T.purple} h={120} /></div>
        <div aria-hidden style={{ position: "absolute", top: -45, right: -45, width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle, ${hexA(T.purple, 0.18)}, transparent 68%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, position: "relative", zIndex: 2 }}>
          <span className="gradText" style={{ fontSize: 14.5, fontWeight: 800 }}>{greet}</span>
          <span style={{ fontSize: 11, color: T.vmuted, display: "inline-flex", alignItems: "center", gap: 4 }}>{motto} <span style={{ display: "inline-grid", transform: "rotate(-90deg)" }}><IconChevronD w={11} /></span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
          <ProgressRing T={T} pct={tasksCount ? done / tasksCount : 0} size={58} stroke={6} label={`${pct}%`} />
          <div style={{ display: "flex", flex: 1, gap: 4 }}>
            <Stat label="Tasks" value={tasksCount} />
            <Stat label="Done" value={done} color="#34D399" />
            <Stat label="Focus" value={focusMin ? `${fh ? fh + "h" : ""}${fm}m` : "0m"} color={T.pink} />
            <Stat label="Slipped" value={carryover} color={carryover ? "#FB7185" : T.text} />
          </div>
        </div>
        {weekStats && weekStats.total > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11, position: "relative", zIndex: 2 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, color: T.vmuted }}>WEEK</span>
            <div style={{ flex: 1, height: 5, borderRadius: 4, background: T.panel2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${wPct * 100}%`, borderRadius: 4, background: T.brandGrad, boxShadow: `0 0 8px ${T.purpleGlow}`, transition: "width .7s cubic-bezier(.22,1,.36,1)" }} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text2, fontVariantNumeric: "tabular-nums" }}>{weekStats.done}/{weekStats.total}</span>
          </div>
        )}
      </button>
    </div>
  );
}

/* ---- Mobile bottom navigation ---- */
function BottomNav({ T, S, nav, setNav, onAdd, onMenu }) {
  const Item = ({ icon, label, active, onClick, accent }) => (
    <button className={"focusable " + (accent ? "bn-add" : "bn-item")} onClick={onClick} aria-label={label} aria-current={active ? "page" : undefined}
      style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", minWidth: 56, color: active ? T.text : T.muted, position: "relative" }}>
      {active && !accent && <span className="bn-ind" aria-hidden />}
      {accent
        ? <span style={{ width: 40, height: 40, borderRadius: 14, background: T.brandGrad, display: "grid", placeItems: "center", color: "#fff", boxShadow: `0 6px 18px ${hexA(T.fuchsia, 0.45)}, 0 1px 0 rgba(255,255,255,0.3) inset`, marginTop: -12 }}>{icon}</span>
        : <span style={{ color: active ? T.pink : T.muted, display: "grid", placeItems: "center" }}>{icon}</span>}
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{label}</span>
    </button>
  );
  return (
    <nav className="bottomnav" aria-label="Primary">
      <Item icon={<IconCal w={20} />} label="Planner" active={nav === "Planner"} onClick={() => setNav("Planner")} />
      <Item icon={<IconGrid w={20} />} label="Dashboard" active={nav === "Dashboard"} onClick={() => setNav("Dashboard")} />
      <Item icon={<IconPlus w={22} />} label="Add" accent onClick={onAdd} />
      <Item icon={<IconNote w={20} />} label="Notes" active={nav === "Notes"} onClick={() => setNav("Notes")} />
      <Item icon={<IconMenu w={20} />} label="More" onClick={onMenu} />
    </nav>
  );
}

/* ============================================================
   8. WEEK GRID / TASK CARD
   ============================================================ */
/* ---- Up Next: live schedule intelligence for today ---- */
function fmtClock(hm) {
  if (!hm) return "";
  const [h, m] = hm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}
function UpNextStrip({ T, S, tasks, todayKey, catColor, onOpen }) {
  const [, tick] = useState(0);
  useEffect(() => { const iv = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(iv); }, []);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const timed = tasks
    .filter((t) => t.time && !isComplete(t, todayKey))
    .map((t) => { const [h, m] = t.time.split(":").map(Number); const st = h * 60 + m; return { t, st, en: st + (t.durationMinutes || 30) }; })
    .sort((a, b) => a.st - b.st);
  const running = timed.find((x) => x.st <= nowMin && nowMin < x.en);
  const next = timed.find((x) => x.st > nowMin);
  const slipped = timed.filter((x) => x.en <= nowMin).length;
  if (!running && !next && !slipped) return null;
  const span = (mins) => mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? (mins % 60) + "m" : ""}`.trim() : `${mins}m`;
  const item = running || next;
  const c = item ? catColor(item.t.category) : T.muted;
  return (
    <button className="focusable upnext" onClick={() => item && onOpen(item.t)} aria-label="Up next"
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", cursor: item ? "pointer" : "default",
        background: `linear-gradient(${hexA(T.panel, 0.9)},${hexA(T.panel, 0.9)}) padding-box, ${T.edgeSoft} border-box`,
        border: "1px solid transparent", borderRadius: 14, padding: "9px 14px", boxShadow: T.cardShadow, color: "inherit", font: "inherit", boxSizing: "border-box" }}>
      <span className="livePulse" style={{ width: 8, height: 8, minWidth: 8, borderRadius: "50%", background: running ? "#FB7185" : "#34D399", boxShadow: `0 0 10px ${running ? "#FB7185" : "#34D399"}` }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.vmuted, minWidth: 52 }}>{running ? "NOW" : "UP NEXT"}</span>
      {item ? (<>
        <CatIcon id={item.t.category} w={13} color={c} />
        <span style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{item.t.title}</span>
        <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{fmtClock(item.t.time)}</span>
        <span className="gradText" style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>
          {running ? `ends in ${span(running.en - nowMin)}` : `in ${span(next.st - nowMin)}`}
        </span>
      </>) : (
        <span style={{ fontSize: 13, color: T.text2 }}>Nothing left on the clock today ✨</span>
      )}
      {slipped > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#FB7185", whiteSpace: "nowrap", marginLeft: item ? 0 : "auto" }}>{slipped} slipped</span>}
    </button>
  );
}
/* inline "save this day as a routine" row used inside the timeline routines menu */
function RoutineSaveRow({ T, S, onSave, disabled }) {
  const [name, setName] = useState("");
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "2px 4px" }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={disabled ? "Add tasks first…" : "Save today as…"} disabled={disabled}
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); }}
        style={{ flex: 1, minWidth: 0, background: "#000", border: `1px solid ${T.border}`, borderRadius: 9, color: T.text, fontSize: 12.5, padding: "8px 10px", outline: "none", opacity: disabled ? 0.5 : 1 }} aria-label="Routine name" />
      <button className="gradbtn focusable" style={{ ...S.gradBtn, padding: "8px 11px", opacity: name.trim() && !disabled ? 1 : 0.4, pointerEvents: name.trim() && !disabled ? "auto" : "none" }} onClick={() => name.trim() && onSave(name.trim())}><IconCheck w={14} /></button>
    </div>
  );
}
/* ---- Day timeline (time-blocking): an hour grid with tasks placed by start time ---- */
function DayTimeline({ T, S, catColor, dateKey, todayKey, tasksOnDate, onOpen, onToggle, onCreate, onUpdate, onPrev, onNext, onToday, onSaveRoutine, onApplyRoutine, onDeleteRoutine, onPlanDay, routines }) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30000);
    const onVis = () => setClock(new Date());
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  const isToday = dateKey === todayKey;
  const d = fromKey(dateKey);
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const all = tasksOnDate(dateKey);
  const timed = all.filter((t) => t.time);
  const untimed = all.filter((t) => !t.time);
  const PXH = 62; // px per hour

  // ---- drag-to-reschedule + resize ----
  const [drag, setDrag] = useState(null); // live preview { id, mode, min, dur }
  const dragRef = useRef(null);
  const [routineMenu, setRoutineMenu] = useState(false);
  const snap15 = (m) => Math.round(m / 15) * 15;
  const beginDrag = (e, t, s, dur, mode) => {
    e.preventDefault(); e.stopPropagation();
    dragRef.current = { id: t.id, task: t, startMin: s, dur, startY: e.clientY, mode, moved: false, curMin: s, curDur: dur };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    setDrag({ id: t.id, mode, min: s, dur });
  };
  const moveDrag = (e) => {
    const d2 = dragRef.current; if (!d2) return;
    const dy = e.clientY - d2.startY;
    if (Math.abs(dy) > 4) d2.moved = true;
    const delta = snap15((dy / PXH) * 60);
    if (d2.mode === "move") { d2.curMin = Math.max(0, Math.min(1440 - d2.dur, d2.startMin + delta)); d2.curDur = d2.dur; }
    else { d2.curMin = d2.startMin; d2.curDur = Math.max(15, Math.min(1440 - d2.startMin, d2.dur + delta)); }
    setDrag({ id: d2.id, mode: d2.mode, min: d2.curMin, dur: d2.curDur });
  };
  const endDrag = () => {
    const d2 = dragRef.current; dragRef.current = null; setDrag(null);
    if (!d2) return;
    if (!d2.moved) { onOpen(d2.task); return; } // a tap, not a drag → open
    if (d2.mode === "move" && d2.curMin !== d2.startMin) onUpdate(d2.id, { time: `${pad(Math.floor(d2.curMin / 60))}:${pad(d2.curMin % 60)}` });
    else if (d2.mode === "resize" && d2.curDur !== d2.dur) onUpdate(d2.id, { durationMinutes: d2.curDur });
  };

  const { hours, minH } = useMemo(() => {
    let lo = 6, hi = 22;
    timed.forEach((t) => { const s = toMin(t.time), e = s + (t.durationMinutes || 30); lo = Math.min(lo, Math.floor(s / 60)); hi = Math.max(hi, Math.ceil(e / 60)); });
    if (isToday) { const nh = clock.getHours(); lo = Math.min(lo, nh); hi = Math.max(hi, nh + 1); }
    lo = Math.max(0, lo); hi = Math.min(24, Math.max(hi, lo + 1));
    const hrs = []; for (let h = lo; h <= hi; h++) hrs.push(h);
    return { hours: hrs, minH: lo };
  }, [timed, isToday, clock]);

  const blocks = useMemo(() => {
    const evs = timed.map((t) => ({ t, s: toMin(t.time), e: toMin(t.time) + Math.max(15, t.durationMinutes || 30) })).sort((a, b) => a.s - b.s || a.e - b.e);
    const out = []; let cluster = [], clusterEnd = -1;
    const flush = () => {
      const cols = [];
      cluster.forEach((ev) => {
        let c = cols.findIndex((end) => end <= ev.s);
        if (c === -1) { c = cols.length; cols.push(ev.e); } else cols[c] = ev.e;
        ev.col = c;
      });
      const n = cols.length;
      cluster.forEach((ev) => out.push({ ...ev, cols: n }));
      cluster = []; clusterEnd = -1;
    };
    evs.forEach((ev) => {
      if (cluster.length && ev.s >= clusterEnd) flush();
      cluster.push(ev); clusterEnd = Math.max(clusterEnd, ev.e);
    });
    if (cluster.length) flush();
    return out;
  }, [timed]);

  const topOf = (mins) => ((mins - minH * 60) / 60) * PXH;
  const nowMins = clock.getHours() * 60 + clock.getMinutes();
  const showNow = isToday && nowMins >= minH * 60 && nowMins <= hours[hours.length - 1] * 60;
  const gridH = (hours.length - 1) * PXH + 8;
  const doneCount = all.filter((t) => isComplete(t, dateKey)).length;

  return (
    <div className="luxcard" style={{ ...S.card, padding: 0, overflow: "hidden", background: "#000000" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: `1px solid ${hexA("#FFFFFF", 0.06)}` }}>
        <button className="ghostbtn focusable" style={{ ...S.ghostBtn, padding: 8 }} onClick={onPrev} aria-label="Previous day"><IconChevron w={16} style={{ transform: "rotate(180deg)" }} /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 700, color: isToday ? T.pink : T.muted }}>{WD[(d.getDay() + 6) % 7]} · {MO[d.getMonth()]} {d.getDate()}{isToday ? " · TODAY" : ""}</div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{all.length ? `${doneCount}/${all.length} done · ${timed.length} scheduled` : "Nothing planned"}</div>
        </div>
        <button className="ghostbtn focusable" style={{ ...S.ghostBtn, padding: 8 }} onClick={onNext} aria-label="Next day"><IconChevron w={16} /></button>
        {!isToday && <button className="pillbtn focusable" style={{ ...S.pill, padding: "7px 12px" }} onClick={onToday}>Today</button>}
      </div>

      {/* timeline toolbar: auto-plan + routines */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${hexA("#FFFFFF", 0.05)}` }}>
        <button className="pillbtn focusable" style={{ ...S.pill, padding: "8px 12px", background: `linear-gradient(180deg, ${hexA(T.purple, 0.2)}, ${hexA(T.purple, 0.08)}), #000`, borderColor: hexA(T.purple, 0.45), color: T.text, fontWeight: 700 }} onClick={() => onPlanDay(dateKey)}>
          <IconSpark w={13} /> Plan my day
        </button>
        <div style={{ position: "relative" }}>
          <button className="pillbtn focusable" style={{ ...S.pill, padding: "8px 12px" }} onClick={() => setRoutineMenu((o) => !o)} aria-haspopup="true" aria-expanded={routineMenu}>
            <IconRepeat w={13} /> Routines {routineMenu ? "▴" : "▾"}
          </button>
          {routineMenu && (
            <div style={{ ...S.menu, left: 0, right: "auto", top: "calc(100% + 6px)", minWidth: 244, padding: 8 }} role="menu" onMouseLeave={() => setRoutineMenu(false)}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: T.vmuted, padding: "4px 8px 6px" }}>STAMP A ROUTINE ONTO THIS DAY</div>
              {(routines || []).length === 0 && <div style={{ fontSize: 12, color: T.vmuted, padding: "2px 8px 8px" }}>No routines yet. Save a day below to reuse it.</div>}
              {(routines || []).map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button role="menuitem" className="menuItem focusable" style={{ ...S.menuItem, flex: 1 }} onClick={() => { onApplyRoutine(r.id, dateKey); setRoutineMenu(false); }}>
                    <span style={{ display: "grid", placeItems: "center", color: T.purple }}><IconRepeat w={14} /></span>
                    <span style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.name}</div><div style={{ fontSize: 11, color: T.muted }}>{r.blocks.length} block{r.blocks.length === 1 ? "" : "s"}</div></span>
                  </button>
                  <button className="focusable" title="Delete routine" onClick={() => onDeleteRoutine(r.id)} style={{ all: "unset", cursor: "pointer", color: T.vmuted, padding: 6, borderRadius: 8 }}><IconTrash w={13} /></button>
                </div>
              ))}
              <div style={{ height: 1, background: T.border, margin: "8px 4px" }} />
              <RoutineSaveRow T={T} S={S} onSave={(name) => { onSaveRoutine(dateKey, name); setRoutineMenu(false); }} disabled={all.length === 0} />
            </div>
          )}
        </div>
      </div>

      {untimed.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "11px 14px", borderBottom: `1px solid ${hexA("#FFFFFF", 0.05)}` }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: T.vmuted, alignSelf: "center", marginRight: 2 }}>ANYTIME</span>
          {untimed.map((t) => { const done = isComplete(t, dateKey); const col = catColor(t.category); return (
            <button key={t.id} className="chip focusable" onClick={() => onOpen(t)} style={{ ...S.miniChip, cursor: "pointer", background: hexA(col, 0.12), borderColor: hexA(col, 0.4), color: done ? T.muted : T.text, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, boxShadow: `0 0 6px ${col}` }} /> {t.title}
            </button>
          ); })}
        </div>
      )}

      <div style={{ position: "relative", padding: "8px 14px 14px" }}>
        <div style={{ position: "relative", marginLeft: 52, height: gridH }}>
          {hours.map((h, i) => (
            <div key={h} style={{ position: "absolute", top: i * PXH, left: -52, right: 0, height: PXH }}>
              <span style={{ position: "absolute", left: 0, top: -7, width: 46, textAlign: "right", fontSize: 11, color: T.vmuted, fontVariantNumeric: "tabular-nums" }}>{h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}</span>
              <button aria-label={`Add task at ${h}:00`} onClick={() => onCreate(dateKey, `${pad(h)}:00`)} className="tlSlot"
                style={{ position: "absolute", left: 0, right: 0, top: 0, height: PXH, borderTop: `1px solid ${hexA("#FFFFFF", 0.06)}`, background: "transparent", cursor: "pointer" }} />
            </div>
          ))}

          {showNow && (
            <div aria-hidden style={{ position: "absolute", left: -8, right: 0, top: topOf(nowMins), zIndex: 5, pointerEvents: "none" }}>
              <span style={{ position: "absolute", left: -2, top: -4, width: 9, height: 9, borderRadius: "50%", background: "#FB7185", boxShadow: "0 0 10px #FB7185" }} className="livePulse" />
              <span style={{ display: "block", height: 2, background: "linear-gradient(90deg,#FB7185,transparent)", borderRadius: 2 }} />
            </div>
          )}

          {blocks.map(({ t, s, e, col, cols }) => {
            const color = catColor(t.category);
            const done = isComplete(t, dateKey);
            const dragging = drag && drag.id === t.id;
            const sMin = dragging ? drag.min : s;
            const eMin = dragging ? drag.min + drag.dur : e;
            const h = Math.max(26, ((eMin - sMin) / 60) * PXH - 4);
            const wPct = dragging ? 100 : 100 / cols;
            const leftPct = dragging ? 0 : col * wPct;
            const short = h < 42;
            const timeLabel = `${to12(`${pad(Math.floor(sMin / 60))}:${pad(sMin % 60)}`)} · ${eMin - sMin}m`;
            return (
              <div key={t.id} className="tlBlock focusable" role="button" tabIndex={0} aria-label={`${t.title}, ${timeLabel}. Drag to reschedule, drag bottom edge to resize.`}
                onPointerDown={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); const mode = (r.bottom - ev.clientY) < 16 ? "resize" : "move"; beginDrag(ev, t, s, Math.max(15, e - s), mode); }}
                onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onOpen(t); } }}
                style={{ position: "absolute", top: topOf(sMin), left: `calc(${leftPct}% + 2px)`, width: `calc(${wPct}% - 4px)`, height: h, zIndex: dragging ? 20 : 6,
                  textAlign: "left", padding: short ? "3px 8px" : "5px 9px", borderRadius: 10, overflow: "hidden", touchAction: "none", userSelect: "none", cursor: dragging && drag.mode === "resize" ? "ns-resize" : "grab",
                  background: `linear-gradient(180deg, ${hexA(color, dragging ? 0.34 : 0.22)}, ${hexA(color, dragging ? 0.2 : 0.12)}), #000`, border: `1px solid ${hexA(color, dragging ? 0.85 : 0.5)}`, borderLeft: `3px solid ${color}`,
                  boxShadow: dragging ? `0 16px 40px rgba(0,0,0,0.65), 0 0 0 1px ${hexA(color, 0.5)}, 0 0 24px ${hexA(color, 0.4)}` : `0 6px 18px rgba(0,0,0,0.5), 0 0 0 1px ${hexA(color, 0.08)}`,
                  opacity: done && !dragging ? 0.55 : 1, transition: dragging ? "none" : "box-shadow .15s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                  <span style={{ fontSize: short ? 11.5 : 12.5, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: done && !dragging ? "line-through" : "none" }}>{t.title}</span>
                </div>
                {(!short || dragging) && <div style={{ fontSize: 10.5, color: dragging ? "#fff" : hexA(color, 0.95), marginTop: 1, fontWeight: dragging ? 800 : 600 }}>{dragging ? timeLabel : `${to12(t.time)} · ${t.durationMinutes || 30}m`}</div>}
                {/* resize grip */}
                <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, cursor: "ns-resize", display: "grid", placeItems: "center" }}>
                  <span style={{ width: 22, height: 3, borderRadius: 2, background: hexA(dragging ? "#fff" : color, 0.6) }} />
                </span>
              </div>
            );
          })}
        </div>

        {all.length === 0 && (
          <div style={{ textAlign: "center", color: T.vmuted, fontSize: 13, padding: "8px 0 4px" }}>Tap any hour to block out time.</div>
        )}
      </div>
    </div>
  );
}

function WeekGrid({ T, S, categories, catColor, days, today, tasksByDay, onAdd, onOpen, onToggle, onMove, onDelete, notesForDate, dailyNoteFor, onDailyNote, onAddDayNote, onOpenNote, scrollNonce, onDuplicate, onPriority, onFocus, onOpenSheet }) {
  const [dragId, setDragId] = useState(null);
  const dragRef = useRef(null);
  const setDrag = (id) => { dragRef.current = id; setDragId(id); };
  const [overKey, setOverKey] = useState(null);
  const overRef = useRef(null);
  const [ctxKey, setCtxKey] = useState(null);
  // ghost: { x, y, title, color, tilt, phase: "drag" | "snap" | "return" }
  const [ghost, setGhost] = useState(null);
  const ghostTimer = useRef(null);
  const lastX = useRef(0);
  const [justDropped, setJustDropped] = useState(null); // { id, key } → landing animation
  const droppedTimer = useRef(null);
  const gridRef = useRef(null);
  const todayRef = useRef(null);
  const touch = useRef({ id: null, task: null, startX: 0, startY: 0, active: false, longTimer: null, pointerType: "mouse", node: null, pid: null });
  const [pressId, setPressId] = useState(null);   // card currently being pressed (pre-lift feedback)
  const [liftId, setLiftId] = useState(null);     // card currently lifted/dragging

  const buzz = (ms) => { if (typeof navigator !== "undefined" && navigator.vibrate) { try { navigator.vibrate(ms); } catch {} } };
  const colKeyAt = (x, y) => {
    const node = touch.current.node;
    let prevPE;
    // hide the dragged card from hit-testing so we read the column underneath
    if (node) { prevPE = node.style.pointerEvents; node.style.pointerEvents = "none"; }
    const el = document.elementFromPoint(x, y);
    if (node) node.style.pointerEvents = prevPE || "";
    const col = el && el.closest ? el.closest(".dayCol") : null;
    return col ? col.getAttribute("data-daykey") : null;
  };
  const setOver = (k) => {
    if (overRef.current !== k) {
      // entering a new column: tick haptic on touch
      if (k && touch.current.pointerType === "touch") buzz(5);
      overRef.current = k;
      setOverKey(k);
    }
  };
  const activate = (sx, sy, task) => {
    touch.current.active = true;
    setPressId(null);
    setLiftId(task.id);
    buzz(14);
    lastX.current = sx;
    clearTimeout(ghostTimer.current);
    setGhost({ x: sx, y: sy, title: task.title, color: catColor(task.category), tilt: 0, phase: "drag" });
    const k = colKeyAt(sx, sy);
    if (k) setOver(k);
  };
  // clears interaction state; ghost can outlive it for snap/return animations
  const reset = (keepGhost) => {
    clearTimeout(touch.current.longTimer);
    if (touch.current.node && touch.current.pid != null) { try { touch.current.node.releasePointerCapture(touch.current.pid); } catch {} }
    touch.current = { id: null, task: null, startX: 0, startY: 0, active: false, longTimer: null, pointerType: "mouse", node: null, pid: null };
    if (!keepGhost) { clearTimeout(ghostTimer.current); setGhost(null); }
    overRef.current = null;
    setOverKey(null); setPressId(null); setLiftId(null);
  };
  // ghost flies into the target column, shrinks and fades
  const snapGhostTo = (key) => {
    const col = gridRef.current && gridRef.current.querySelector(`.dayCol[data-daykey="${key}"]`);
    if (!col) { setGhost(null); return; }
    const r = col.getBoundingClientRect();
    setGhost((g) => g ? { ...g, x: r.left + r.width / 2, y: Math.min(r.top + 110, r.bottom - 30), tilt: 0, phase: "snap" } : null);
    clearTimeout(ghostTimer.current);
    ghostTimer.current = setTimeout(() => setGhost(null), 300);
  };
  // invalid drop / cancel: ghost springs back to where the drag started
  const returnGhost = (sx, sy) => {
    setGhost((g) => g ? { ...g, x: sx, y: sy, tilt: 0, phase: "return" } : null);
    clearTimeout(ghostTimer.current);
    ghostTimer.current = setTimeout(() => setGhost(null), 340);
  };
  // move + arm the landing animation on the card in its new column
  const doMove = (id, key) => {
    onMove(id, key);
    clearTimeout(droppedTimer.current);
    setJustDropped({ id, key });
    droppedTimer.current = setTimeout(() => setJustDropped(null), 700);
  };
  const pointerDown = (task, e) => {
    if (e.button === 2) return;
    // presses that begin on interactive children (check circle, kebab, links…) must keep
    // native click semantics — capturing the pointer on the card would retarget their click
    if (e.target && e.target.closest && e.target.closest("button, input, select, textarea, a, label")) return;
    const sx = e.clientX, sy = e.clientY;
    const node = e.currentTarget;
    try { node.setPointerCapture(e.pointerId); } catch {}
    touch.current = { id: task.id, task, startX: sx, startY: sy, active: false, longTimer: null, pointerType: e.pointerType, node, pid: e.pointerId };
    if (e.pointerType === "touch") {
      setPressId(task.id); // immediate press feedback
      touch.current.longTimer = setTimeout(() => activate(sx, sy, task), 180);
    }
  };
  const pointerMove = (e) => {
    const tc = touch.current; if (!tc.id) return;
    const x = e.clientX, y = e.clientY;
    const dx = Math.abs(x - tc.startX), dy = Math.abs(y - tc.startY);
    if (!tc.active) {
      if (tc.pointerType === "touch") {
        // moved before long-press fired → treat as a scroll, abandon the drag
        if (dx > 10 || dy > 10) { clearTimeout(tc.longTimer); setPressId(null); touch.current.id = null; }
      } else if (dx > 6 || dy > 6) {
        activate(tc.startX, tc.startY, tc.task);
      }
      if (!touch.current.active) return;
    }
    if (e.cancelable) e.preventDefault();
    // velocity-based tilt: ghost leans into the direction of travel
    const vx = x - lastX.current; lastX.current = x;
    setGhost((g) => {
      const tilt = Math.max(-9, Math.min(9, (g ? g.tilt : 0) * 0.7 + vx * 0.45));
      return g ? { ...g, x, y, tilt, phase: "drag" } : { x, y, tilt, title: tc.task.title, color: catColor(tc.task.category), phase: "drag" };
    });
    const k = colKeyAt(x, y);
    setOver(k || null);
    // edge auto-scroll: horizontal day carousel (mobile)
    const grid = gridRef.current;
    if (grid && grid.scrollWidth > grid.clientWidth + 4) {
      const gr = grid.getBoundingClientRect();
      const edge = 56;
      if (x < gr.left + edge) grid.scrollLeft -= 14;
      else if (x > gr.right - edge) grid.scrollLeft += 14;
    }
    // edge auto-scroll: vertical page scroll (tall columns on desktop)
    const body = grid && grid.closest(".mobileBody");
    if (body && body.scrollHeight > body.clientHeight + 4) {
      const br = body.getBoundingClientRect();
      const vEdge = 64;
      if (y < br.top + vEdge) body.scrollTop -= 12;
      else if (y > br.bottom - vEdge) body.scrollTop += 12;
    }
  };
  const pointerUp = (e) => {
    const tc = touch.current;
    const wasActive = tc.active;
    if (tc.active && tc.id) {
      const k = colKeyAt(e.clientX, e.clientY);
      if (k) { doMove(tc.id, k); buzz(10); snapGhostTo(k); reset(true); }
      else { returnGhost(tc.startX, tc.startY); reset(true); }
    } else reset();
    return wasActive;
  };
  const pointerCancel = () => { const tc = touch.current; if (tc.active) { returnGhost(tc.startX, tc.startY); reset(true); } else reset(); };

  // Escape cancels an in-flight drag — ghost springs back home
  useEffect(() => {
    if (!liftId) return;
    const h = (e) => { if (e.key === "Escape") { const tc = touch.current; returnGhost(tc.startX, tc.startY); reset(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [liftId]);
  useEffect(() => () => { clearTimeout(ghostTimer.current); clearTimeout(droppedTimer.current); }, []);

  // Centre the carousel on Today: instantly on first paint (double-rAF + a late retry
  // for webfont reflow, so scroll-snap settles on the right card), smoothly afterwards.
  const firstScroll = useRef(true);
  useEffect(() => {
    const center = (smooth) => {
      const grid = gridRef.current, cell = todayRef.current;
      if (!grid || !cell) return;
      if (grid.scrollWidth > grid.clientWidth + 4) {
        const left = cell.offsetLeft - (grid.clientWidth - cell.clientWidth) / 2;
        grid.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
      }
    };
    if (firstScroll.current) {
      firstScroll.current = false;
      requestAnimationFrame(() => requestAnimationFrame(() => center(false)));
      const t = setTimeout(() => center(false), 360);
      return () => clearTimeout(t);
    }
    center(true);
  }, [days, scrollNonce]);
  return (
    <div ref={gridRef} className={"weekgrid scrollarea" + (ghost && ghost.phase === "drag" ? " dragging" : "")} style={S.weekGrid}>
      {ghost && (
        <div className={"dragGhost" + (ghost.phase === "snap" ? " snapping" : ghost.phase === "return" ? " returning" : "")}
          style={{ left: ghost.x, top: ghost.y, borderLeft: `3px solid ${ghost.color}`, ["--tilt"]: `${ghost.tilt || 0}deg` }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: ghost.color, marginRight: 7, boxShadow: `0 0 8px ${ghost.color}`, verticalAlign: "middle" }} />
          <span style={{ verticalAlign: "middle" }}>{ghost.title}</span>
          {ghost.phase === "drag" && overKey && (
            <span className="ghostTarget">→ {WD[(fromKey(overKey).getDay() + 6) % 7]} {fromKey(overKey).getDate()}</span>
          )}
        </div>
      )}
      {days.map((d) => {
        const key = toKey(d);
        const isToday = sameDay(d, today);
        const list = tasksByDay[key] || [];
        const over = overKey === key;
        const dayNotes = notesForDate ? notesForDate(key) : [];
        const hasDaily = dailyNoteFor && !!dailyNoteFor(key);
        return (
          <div key={key} className="dayCol" data-daykey={key} ref={isToday ? todayRef : null} data-today={isToday ? "1" : "0"} data-over={over ? "1" : "0"} aria-current={isToday ? "date" : undefined}
            onDragOver={(e) => { if (dragRef.current) { e.preventDefault(); setOver(key); } }}
            onDragLeave={() => setOver(overRef.current === key ? null : overRef.current)}
            onDrop={(e) => { e.preventDefault(); if (dragRef.current) doMove(dragRef.current, key); setDrag(null); setOver(null); }}
            style={{ ...S.dayCol, ...(isToday ? S.dayToday : null), ...(over ? S.dayOver : null) }}>
            <div style={S.dayHead}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}>
                <div style={{ fontSize: 11.5, letterSpacing: 1.2, color: isToday ? T.text : T.muted, fontWeight: isToday ? 800 : 700 }}>{WD[(d.getDay() + 6) % 7]}</div>
                {dayNotes.length > 0 && <span style={S.noteBadge} title={`${dayNotes.length} note${dayNotes.length === 1 ? "" : "s"} linked`}>{dayNotes.length}</span>}
              </div>
              {isToday ? <div className="todayBadgeEl" style={S.todayBadge}>{d.getDate()}</div> : <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>{d.getDate()}</div>}
              {isToday && <div style={S.todayPill}>TODAY</div>}
            </div>
            {(() => {
              const doneN = list.filter((t) => isComplete(t, key)).length;
              if (!list.length) return <div style={{ height: 4, marginBottom: 8 }} />;
              const dPct = doneN / list.length;
              return (
                <div style={{ margin: "0 2px 8px", display: "flex", alignItems: "center", gap: 7 }} title={`${doneN} of ${list.length} done`}>
                  <div style={{ flex: 1, height: 4, borderRadius: 3, background: hexA(T.text, 0.08), overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${dPct * 100}%`, borderRadius: 3, background: dPct === 1 ? "linear-gradient(90deg,#34D399,#2DD4BF)" : T.brandGrad, boxShadow: dPct === 1 ? "0 0 8px rgba(52,211,153,0.6)" : `0 0 6px ${T.purpleGlow}`, transition: "width .55s cubic-bezier(.22,1,.36,1), background .3s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: dPct === 1 ? "#34D399" : T.vmuted, fontVariantNumeric: "tabular-nums", minWidth: 24, textAlign: "right" }}>{doneN}/{list.length}</span>
                </div>
              );
            })()}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
              <button className="addmini focusable" style={S.addMini} onClick={() => onAdd(key)} aria-label={`Add task on ${key}`}><IconPlus w={14} /></button>
              <button className="addmini focusable" style={{ ...S.addMini, ...(hasDaily ? { color: T.pink, borderColor: hexA(T.pink, 0.5), background: T.pinkWash } : null) }} onClick={() => onDailyNote(key)} aria-label={hasDaily ? "Open daily note" : "Create daily note"} title={hasDaily ? "Open daily note" : "Create daily note"}><IconSunDay w={14} /></button>
              <div style={{ position: "relative" }}>
                <button className="addmini focusable" style={S.addMini} onClick={() => setCtxKey(ctxKey === key ? null : key)} aria-label="Day options"><IconDots w={14} /></button>
                {ctxKey === key && (
                  <div style={{ ...S.menu, left: 0, right: "auto" }} role="menu" onMouseLeave={() => setCtxKey(null)}>
                    <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setCtxKey(null); onAdd(key); }}>Add task</button>
                    <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setCtxKey(null); onAddDayNote(key); }}>Add note for this day</button>
                    <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setCtxKey(null); onDailyNote(key); }}>{hasDaily ? "Open daily note" : "Create daily note"}</button>
                  </div>
                )}
              </div>
            </div>
            {dayNotes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                {dayNotes.slice(0, 2).map((n) => (
                  <button key={n.id} className="noteChip focusable" style={{ ...S.noteChip, borderColor: hexA(catColor(n.category), 0.4) }} onClick={() => onOpenNote(n)} title={n.title}>
                    <NoteTypeIcon type={n.type} w={11} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1 }}>{n.title}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={S.dayBody}>
              {list.length === 0 && !over && <div style={S.dayEmpty}><EmptyDayArt T={T} /><span style={{ fontSize: 11.5, color: T.vmuted }}>Nothing planned</span></div>}
              {list.map((t) => (
                <TaskCard key={t.id + key} T={T} S={S} catColor={catColor} task={t} dateKey={key} today={today}
                  onOpen={() => onOpen(t)} onToggle={(origin) => onToggle(t.id, key, origin)} onDelete={() => onDelete(t.id)} onMove={doMove}
                  onDuplicate={onDuplicate} onPriority={onPriority} onFocus={onFocus} onOpenSheet={onOpenSheet}
                  onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel} dragStateRef={touch}
                  pressing={pressId === t.id} lifting={liftId === t.id}
                  dropped={!!(justDropped && justDropped.id === t.id && justDropped.key === key)} />
              ))}
              {over && liftId && (
                <div className="dropSlot" aria-hidden>
                  <span style={{ fontSize: 11, fontWeight: 700, color: hexA(T.text, 0.75), letterSpacing: 0.4 }}>Drop here</span>
                </div>
              )}
            </div>
            <button className="addtask focusable" style={S.addTask} onClick={() => onAdd(key)}><IconPlus w={14} /> Add task</button>
            {isToday && <div style={S.todayUnderline} />}
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ T, S, catColor, task, dateKey, today, onOpen, onToggle, onDelete, onMove, onDuplicate, onPriority, onFocus, onOpenSheet, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, dragStateRef, pressing, lifting, dropped }) {
  const c = catColor(task.category);
  const [pop, setPop] = useState(false);
  const done = isComplete(task, dateKey);
  const recurring = task.recurring && task.recurring.enabled;
  const handleToggle = (origin) => {
    if (!done) {
      setPop(true);
      setTimeout(() => setPop(false), 420);
      if (typeof navigator !== "undefined" && navigator.vibrate) { try { navigator.vibrate(18); } catch {} }
    }
    onToggle(origin);
  };
  // keyboard control: Shift+←/→ shifts the task by a day (drag alternative)
  const keyShift = (e) => {
    if (recurring || !e.shiftKey) return false;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return false;
    e.preventDefault(); e.stopPropagation();
    const next = toKey(addDays(fromKey(dateKey), e.key === "ArrowRight" ? 1 : -1));
    onMove(task.id, next);
    return true;
  };
  return (
    <div className={"taskcard focusable" + (pop ? " just-completed" : "") + (pressing ? " pressing" : "") + (lifting ? " lifting" : "") + (dropped ? " dropLand" : "")}
      onPointerDown={(e) => { if (!recurring && onPointerDown) onPointerDown(task, e); }}
      onPointerMove={(e) => { if (!recurring && onPointerMove) onPointerMove(e); }}
      onPointerUp={(e) => { if (!recurring && onPointerUp) { const wasDrag = onPointerUp(e); if (wasDrag) { e.preventDefault(); e.stopPropagation(); return; } } }}
      onPointerCancel={() => { if (!recurring && onPointerCancel) onPointerCancel(); }}
      onClick={(e) => { if (dragStateRef && dragStateRef.current && dragStateRef.current.active) { e.preventDefault(); return; } onOpen(); }}
      role="button" tabIndex={0} onKeyDown={(e) => { if (keyShift(e)) return; if (e.key === "Enter") onOpen(); }}
      style={{ ...S.taskCard, borderLeft: `2.5px solid ${c}`, boxShadow: done ? "none" : `inset 2px 0 12px ${hexA(c, 0.10)}`, opacity: done ? 0.55 : 1, touchAction: recurring ? "auto" : "pan-y" }}
      title={recurring ? undefined : "Drag to another day · Shift+←/→ to shift days"}
      aria-label={`${task.title}, ${task.category}${done ? ", completed" : ""}${recurring ? "" : ". Press Shift plus arrow keys to move between days"}`}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingRight: 16 }}>
        <button className="checkdot focusable" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); handleToggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); }} aria-label={done ? "Mark incomplete" : "Mark complete"} aria-pressed={done}
          style={{ ...S.checkDot, ...(done ? { background: c, borderColor: c } : { borderColor: c }) }}>{done && <span className="checkPop" style={{ display: "grid", placeItems: "center" }}><IconCheck /></span>}</button>
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div className={"taskTitle" + (done ? " struck" : "")} style={{ fontSize: 13, fontWeight: 600, color: done ? T.muted : T.text, lineHeight: 1.3, position: "relative" }}>{task.title}</div>
        </div>
        <div style={{ position: "absolute", top: 6, right: 4 }}>
          <button className="kebab focusable" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); onOpenSheet && onOpenSheet(task, dateKey, { x: r.right, y: r.bottom }); }} aria-label="Task actions" style={S.kebab}><IconDots w={14} /></button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
        <CatIcon id={task.category} w={11} color={c} />
        <span style={{ fontSize: 11.5, color: T.muted }}>{task.category}</span>
        {task.priority === "high" && <span title="High priority" style={{ width: 6, height: 6, borderRadius: "50%", background: "#FB7185", boxShadow: "0 0 6px rgba(251,113,133,0.7)" }} />}
        {recurring && <span title="Repeats weekly" style={{ display: "inline-flex", color: T.purple }}><IconRepeat w={11} /></span>}
        {(task.linkedNoteIds || []).length > 0 && <span title={`${task.linkedNoteIds.length} linked note(s)`} style={{ display: "inline-flex", alignItems: "center", gap: 2, color: T.pink, fontSize: 10.5, fontWeight: 700 }}><IconNote w={10} />{task.linkedNoteIds.length}</span>}
      </div>
      {task.time && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 11.5, color: T.muted }}><IconClock /> {to12(task.time)}{task.durationMinutes ? ` · ${task.durationMinutes}m` : ""}</div>}
    </div>
  );
}

/* ============================================================
   9. RIGHT DASHBOARD PANEL + GRAPHICS
   ============================================================ */
function ProgressRing({ T, pct, size = 76, stroke = 8, label, sub, labelSize }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  const gid = useMemo(() => "g" + uid(), []);
  // Fit label inside the inner circle. Numeric "NN%" labels render as big number + small % suffix.
  const inner = size - stroke * 2;
  const str = String(label || "");
  const pm = str.match(/^(\d{1,3})%$/);
  const chars = Math.max(1, pm ? pm[1].length + 0.6 : str.length);
  const widthCap = (inner * 0.86) / (chars * 0.66);
  const heightCap = sub ? inner * 0.42 : inner * 0.58;
  const fs = labelSize || Math.max(9, Math.min(widthCap, heightCap));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }} aria-hidden>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#A855F7" /><stop offset="50%" stopColor="#D946EF" /><stop offset="100%" stopColor="#F472B6" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.panel2} strokeWidth={stroke} />
        {/* soft glow under-stroke */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke + 3} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} className="ring" style={{ opacity: 0.35, filter: "blur(4px)" }} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} className="ring" style={{ filter: `drop-shadow(0 0 6px ${T.purpleGlow})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: stroke }}>
        <div>
          <div style={{ fontSize: fs, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
            {pm ? (<>{pm[1]}<span style={{ fontSize: fs * 0.55, fontWeight: 700, color: T.muted, marginLeft: 1 }}>%</span></>) : label}
          </div>
          {sub && <div style={{ fontSize: Math.max(8, fs * 0.42), color: T.muted, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function CarryoverItem({ T, S, catColor, task, today, onMoveToday, onReschedule, onComplete, onDelete, onOpen }) {
  const [open, setOpen] = useState(false);
  const c = catColor(task.category);
  const daysAgo = Math.round((today - fromKey(task.date)) / 864e5);
  const agoLabel = daysAgo <= 0 ? "today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
  return (
    <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 6px", borderRadius: 10, background: open ? T.accentWash : "transparent" }}>
      <span style={{ marginTop: 4 }}><CatIcon id={task.category} w={12} color={c} /></span>
      <button className="focusable" onClick={onOpen} style={{ all: "unset", cursor: "pointer", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
        <div style={{ fontSize: 11, color: T.muted, display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ color: c }}>{task.category}</span> · <span style={{ color: daysAgo >= 3 ? "#FB7185" : T.muted }}>{agoLabel}</span>
        </div>
      </button>
      <div style={{ position: "relative" }}>
        <button className="kebab focusable" onClick={() => setOpen((o) => !o)} aria-label="Carryover actions" style={S.kebab}><IconDots w={14} /></button>
        {open && (
          <div style={{ ...S.menu, minWidth: 170 }} role="menu" onMouseLeave={() => setOpen(false)}>
            <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setOpen(false); onMoveToday(); }}>Move to Today</button>
            <label role="menuitem" className="menuItem focusable" style={{ ...S.menuItem, position: "relative", display: "block", cursor: "pointer" }}>Reschedule…
              <input type="date" defaultValue={task.date} onChange={(e) => { if (e.target.value) { onReschedule(e.target.value); setOpen(false); } }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} aria-label="Reschedule to date" />
            </label>
            <button role="menuitem" className="menuItem focusable" style={S.menuItem} onClick={() => { setOpen(false); onComplete(); }}>Mark done</button>
            <div style={S.menuSep} />
            <button role="menuitem" className="menuItem focusable" style={{ ...S.menuItem, color: "#FB7185" }} onClick={() => { setOpen(false); onDelete(); }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
function DashboardPanel({ T, S, catColor, today, tasksCount, done, focusMin, byCategory, momentum, carryover, onCarryAction, onViewAll, notesTodayCount, dailyDone, onDailyNote, weekStats }) {
  const fh = Math.floor(focusMin / 60), fm = focusMin % 60;
  const total = Math.max(1, ...byCategory.map(([, n]) => n));
  const pct = tasksCount ? done / tasksCount : 0;
  const wPct = weekStats && weekStats.total ? weekStats.done / weekStats.total : 0;
  return (
    <aside className="rightpanel rightStage scrollarea" style={S.right} aria-label="Today dashboard">
      <Card S={S} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ position: "relative", height: 84, background: T.panel }}>
          <MeshGlow colors={["#7C3AED", "#A855F7", "#38BDF8"]} motif="dashboard" style={{ opacity: 0.94 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, ${hexA("#000000", 0.45)} 0%, ${hexA("#000000", 0.12)} 50%, transparent 74%)` }} />
          <div className="heroBody" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 16px 12px", zIndex: 2 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.2, textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>Today Overview</div>
            <button className="link focusable" style={{ ...S.link, color: "#fff", fontWeight: 700, fontSize: 12.5, background: hexA("#000000", 0.3), padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }} onClick={onViewAll}>View all →</button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing T={T} pct={pct} label={`${Math.round(pct * 100)}%`} sub="today" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
            <MiniStat T={T} label="Tasks" value={tasksCount} />
            <MiniStat T={T} label="Done" value={done} color="#34D399" />
            <MiniStat T={T} label="Focus" value={focusMin ? `${fh ? fh + "h " : ""}${fm}m` : "0m"} grad T0={T} />
            <MiniStat T={T} label="Notes today" value={notesTodayCount || 0} color={T.pink} />
          </div>
        </div>
        {weekStats && weekStats.total > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 11.5, marginBottom: 5 }}>
              <span style={{ color: T.muted, fontWeight: 700, letterSpacing: 0.4 }}>THIS WEEK</span>
              <span style={{ color: T.text2, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{weekStats.done}/{weekStats.total} · {Math.round(wPct * 100)}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 5, background: T.panel2, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}>
              <div style={{ height: "100%", width: `${wPct * 100}%`, borderRadius: 5, background: T.brandGrad, boxShadow: `0 0 10px ${T.purpleGlow}`, transition: "width .7s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>
        )}
        <button className="pillbtn focusable" style={{ ...S.pill, width: "100%", marginTop: 12, justifyContent: "center", ...(dailyDone ? { borderColor: hexA(T.pink, 0.5), color: T.pink, background: T.pinkWash } : null) }} onClick={onDailyNote}>
          <IconSunDay w={15} /> {dailyDone ? "Open today's daily note" : "Start today's daily note"}
        </button>
        </div>
      </Card>

      <Card S={S}>
        <CardHead S={S} T={T} title="By Category" />
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 12 }}>
          {byCategory.length === 0 && <Empty T={T} text="No tasks today" />}
          {byCategory.map(([cat, n]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <CatIcon id={cat} w={13} color={catColor(cat)} />
              <span style={{ fontSize: 12.5, color: T.text2, width: 64 }}>{cat}</span>
              <div style={S.barTrack}><div className="bar" style={{ width: `${(n / total) * 100}%`, background: catColor(cat) }} /></div>
              <span style={{ fontSize: 12.5, color: T.muted, width: 14, textAlign: "right" }}>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card S={S}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><span className="flame"><IconFlame /></span> Momentum</div>
          <div style={{ textAlign: "right" }}><div className="gradText" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{momentum.streak}</div><div style={{ fontSize: 11, color: T.muted }}>days in a row</div></div>
        </div>
        <BarChart T={T} data={momentum.bars} labels={["M", "T", "W", "T", "F", "S", "S"]} height={70} />
      </Card>

      <Card S={S}>
        <CardHead S={S} T={T} title="Carryover" count={carryover.length} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {carryover.length === 0 && <Empty T={T} text="Nothing overdue 🎉" />}
          {carryover.slice(0, 4).map((t) => (
            <CarryoverItem key={t.id} T={T} S={S} catColor={catColor} task={t} today={today}
              onMoveToday={() => onCarryAction("today", t)} onReschedule={(dk) => onCarryAction("reschedule", t, dk)}
              onComplete={() => onCarryAction("done", t)} onDelete={() => onCarryAction("delete", t)} onOpen={() => onCarryAction("open", t)} />
          ))}
        </div>
        {carryover.length > 4 && <button className="viewall focusable" style={S.viewAll} onClick={onViewAll}>View all {carryover.length}</button>}
      </Card>
    </aside>
  );
}

function BarChart({ T, data, labels, height = 70, highlightLast = true }) {
  const max = Math.max(1, ...data);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 16, height }}>
      {data.map((v, i) => {
        const last = highlightLast && i === data.length - 1;
        return (
          <div key={i} className="vbarCell" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
            <div style={{ width: "100%", flex: 1, background: T.panel2, borderRadius: 6, display: "flex", alignItems: "flex-end", padding: 2, boxShadow: `inset 0 1px 3px rgba(0,0,0,0.25)` }}>
              <div className="bar-v" title={`${v} done`} style={{
                height: `${Math.max(8, (v / max) * 100)}%`, width: "100%", borderRadius: 5,
                background: last ? T.brandGrad : `linear-gradient(180deg, ${hexA(T.purple, 0.55)}, ${hexA(T.deepPurple, 0.35)})`,
                boxShadow: last ? `0 0 12px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.25) inset` : "0 1px 0 rgba(255,255,255,0.08) inset",
              }} />
            </div>
            {labels && <span style={{ fontSize: 10.5, color: last ? T.pink : T.vmuted, fontWeight: last ? 700 : 400 }}>{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

const Card = ({ S, children, style }) => <div className="luxcard" style={{ ...S.card, ...style }}>{children}</div>;
/* animated count-up for stat numbers — eases to new values, tabular digits */
function CountUp({ value }) {
  const n = typeof value === "number" ? value : null;
  const [disp, setDisp] = useState(n ?? 0);
  const prevRef = useRef(n ?? 0);
  useEffect(() => {
    if (n == null) return;
    const from = prevRef.current, to = n;
    prevRef.current = to;
    if (from === to) { setDisp(to); return; }
    const t0 = performance.now(), dur = 480;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  if (n == null) return <>{value}</>;
  return <span className="numTick" key={n}>{disp}</span>;
}
function CardHead({ S, T, title, action, onAction, count, icon, tint }) {
  const c = tint || T.purple;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700 }}>
        {icon && <span style={{ width: 28, height: 28, borderRadius: 8, background: hexA(c, 0.14), border: `1px solid ${hexA(c, 0.32)}`, color: c, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>}
        {title}{count != null && <span style={S.countPill}>{count}</span>}
      </div>
      {action && <button className="link focusable" style={S.link} onClick={onAction}>{action}</button>}
    </div>
  );
}
function MiniStat({ T, label, value, color, grad, T0 }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12.5, color: T.muted }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, ...(grad ? { background: T.brandGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: color || T.text }) }}><CountUp value={value} /></span>
    </div>
  );
}
function Empty({ T, text }) { return <div style={{ color: T.vmuted, fontSize: 12.5, padding: "6px 0" }}>{text}</div>; }
function EmptyArt({ T, kind = "tasks" }) {
  // premium floating icon tile with a soft glow halo — matches the app's icon-tile language
  const Icon = kind === "notes" ? IconNote : kind === "search" ? IconSearch : kind === "tables" ? IconTable : IconCheck;
  const c = kind === "tables" ? "#38BDF8" : kind === "notes" ? "#A855F7" : kind === "search" ? "#A855F7" : T.purple;
  return (
    <div style={{ position: "relative", width: 92, height: 92, display: "grid", placeItems: "center" }}>
      <span aria-hidden style={{ position: "absolute", inset: -6, borderRadius: "50%", background: `radial-gradient(circle, ${hexA(c, 0.3)}, transparent 68%)` }} />
      <span aria-hidden className="twink" style={{ position: "absolute", top: 6, right: 10, width: 7, height: 7, borderRadius: "50%", background: hexA(T.pink, 0.85) }} />
      <span aria-hidden className="twink" style={{ position: "absolute", bottom: 8, left: 12, width: 5, height: 5, borderRadius: "50%", background: hexA(c, 0.7), animationDelay: "1.1s" }} />
      <div className="floaty" style={{ position: "relative", width: 70, height: 70, borderRadius: 22, background: `linear-gradient(150deg, ${hexA(c, 0.92)}, ${hexA(T.pink, 0.85)})`, display: "grid", placeItems: "center", color: "#fff", boxShadow: `0 16px 38px ${hexA(c, 0.42)}, 0 1px 0 rgba(255,255,255,0.4) inset` }}>
        <Icon w={32} />
      </div>
    </div>
  );
}
function EmptyState({ T, S, kind, title, sub, actionLabel, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 20px", gap: 4, animation: "fade .3s ease" }}>
      <EmptyArt T={T} kind={kind} />
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 8 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: T.muted, maxWidth: 320, lineHeight: 1.5 }}>{sub}</div>}
      {actionLabel && onAction && <button className="gradbtn focusable" style={{ ...S.gradBtn, marginTop: 12 }} onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

/* ============================================================
   10. PAGES
   ============================================================ */
function PageWrap({ S, children }) { return <div style={S.page}>{children}</div>; }
function PageHead({ T, title, sub, icon: Icon, tint, scene }) {
  const c1 = tint || T.purple;
  if (scene) {
    const SCENES = {
      peaks: { grad: ["#7C3AED", "#A855F7", "#38BDF8"], motif: "dashboard" },
      layers: { grad: ["#D946EF", "#A855F7", "#6366F1"], motif: "templates" },
      city: { grad: ["#0EA5E9", "#38BDF8", "#22D3EE"], motif: "tables" },
      bloom: { grad: ["#FB923C", "#F472B6", "#EC4899"], motif: "categories" },
      bars: { grad: ["#10B981", "#34D399", "#0EA5E9"], motif: "analytics" },
      stars: { grad: ["#8B5CF6", "#A855F7", "#EC4899"], motif: "settings" },
      notes: { grad: ["#7C3AED", "#9333EA", "#DB2777"], motif: "notes" },
    };
    const sc = SCENES[scene] || { grad: [c1, T.fuchsia, T.pink], motif: null };
    return (
      <div className="luxcard pageBanner" style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 16, border: `1px solid ${T.border}`, boxShadow: T.cardShadow }}>
        <div style={{ position: "relative", height: 112, background: T.panel }}>
          <MeshGlow colors={sc.grad} motif={sc.motif} style={{ opacity: 0.96 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, ${hexA("#000000", 0.45)} 0%, ${hexA("#000000", 0.15)} 48%, transparent 72%)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: "150px 150px", opacity: 0.06, mixBlendMode: "overlay" }} />
          <div className="heroBody" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 18px", zIndex: 2 }}>
            <div className="heroCluster" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              {Icon && (
                <span style={{ position: "relative", width: 56, height: 56, minWidth: 56, borderRadius: 18, display: "grid", placeItems: "center", color: "#fff", background: hexA("#000000", 0.22), border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(6px)", boxShadow: "0 8px 22px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.4) inset" }}>
                  <Icon w={27} />
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                <div className="heroTitle" style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.5, color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                {sub && <div className="heroSub" style={{ fontSize: 12.5, color: hexA("#FFFFFF", 0.85), marginTop: 3, textShadow: "0 1px 8px rgba(0,0,0,0.6)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{sub}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 4, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {Icon && (
          <span style={{ position: "relative", width: 46, height: 46, minWidth: 46, borderRadius: 14, display: "grid", placeItems: "center", color: "#fff", background: `linear-gradient(140deg, ${c1}, ${T.pink})`, boxShadow: `0 8px 22px ${hexA(c1, 0.4)}, 0 1px 0 rgba(255,255,255,0.3) inset` }}>
            <span aria-hidden style={{ position: "absolute", inset: -10, borderRadius: 20, background: `radial-gradient(circle, ${hexA(c1, 0.3)}, transparent 70%)`, zIndex: -1 }} />
            <Icon w={22} />
          </span>
        )}
        <div>
          <div className="gradText" style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <div aria-hidden style={{ height: 1, marginTop: 14, background: `linear-gradient(90deg, ${hexA(c1, 0.45)}, ${hexA(T.pink, 0.3)} 40%, transparent 85%)` }} />
    </div>
  );
}

/* ---- Full Dashboard ---- */
function Sparkline({ T, data, color, height = 32 }) {
  const arr = data && data.length ? data : [0, 0];
  const max = Math.max(1, ...arr);
  const w = 100, n = arr.length;
  const pts = arr.map((v, i) => [(i / (n - 1 || 1)) * w, height - 3 - (v / max) * (height - 6)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${w},${height}`;
  const gid = useMemo(() => "sp" + uid(), []);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, marginTop: 10, display: "block" }} aria-hidden>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(color, 0.3)} /><stop offset="100%" stopColor={hexA(color, 0)} /></linearGradient></defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 1px 3px ${hexA(color, 0.5)})` }} />
    </svg>
  );
}
/* shared premium stat tile (icon · label · value · sub · mini-viz) — used on Dashboard & Analytics */
function StatTile({ T, S, icon, tint, label, value, sub, viz }) {
  return (
    <div className="luxcard dash-stat" style={{ ...S.card, padding: 15, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: hexA(tint, 0.14), border: `1px solid ${hexA(tint, 0.34)}`, color: tint, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 11.5, color: T.muted, fontWeight: 700, marginTop: 10, whiteSpace: "nowrap" }}>{label}</div>
      <div className="dash-stat-val" style={{ fontSize: 24, fontWeight: 850, color: tint, lineHeight: 1.1, marginTop: 1, letterSpacing: -0.4, whiteSpace: "nowrap" }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: T.vmuted, marginTop: 1, whiteSpace: "nowrap" }}>{sub}</div>}
      {viz}
    </div>
  );
}
function DotRow({ data, color }) {
  return <div style={{ display: "flex", gap: 3, marginTop: 13 }}>{data.map((v, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: v > 0 ? color : hexA("#FFFFFF", 0.08), boxShadow: v > 0 ? `0 0 6px ${hexA(color, 0.5)}` : "none" }} />)}</div>;
}
function FullDashboard({ T, S, catColor, tasks, days, todayTasks, todayKey, doneToday, focusMin, byCategory, momentum, tasksOnDate, notes, notesTodayCount, unlinkedNotes, dailyNoteFor, onOpenNote, onDailyNote, onGotoNotes }) {
  const totalDone = tasks.reduce((s, t) => s + (t.recurring?.enabled ? (t.completedDates || []).length : (t.completed ? 1 : 0)), 0);
  const totalFocus = useMemo(() => {
    let m = 0;
    tasks.forEach((t) => { if (t.recurring?.enabled) m += (t.completedDates || []).length * (t.durationMinutes || 0); else if (t.completed) m += t.durationMinutes || 0; });
    return m;
  }, [tasks]);
  const weekDone = days.map((d) => tasksOnDate(toKey(d)).filter((t) => isComplete(t, toKey(d))).length);
  const weekFocus = days.map((d) => tasksOnDate(toKey(d)).filter((t) => isComplete(t, toKey(d))).reduce((s, t) => s + (t.durationMinutes || 0), 0));
  const total = Math.max(1, ...byCategory.map(([, n]) => n));
  const pct = todayTasks.length ? doneToday / todayTasks.length : 0;
  // daily-note streak
  const dailyStreak = useMemo(() => { let s = 0; for (let i = 0; i < 90; i++) { const k = toKey(addDays(new Date(), -i)); if (dailyNoteFor && dailyNoteFor(k)) s++; else if (i > 0) break; } return s; }, [notes]);
  const todaysTaskNotes = useMemo(() => (notes || []).filter((n) => !n.archived && todayTasks.some((t) => (n.linkedTaskIds || []).includes(t.id))), [notes, todayTasks]);
  const hasDaily = dailyNoteFor && !!dailyNoteFor(todayKey);
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Dashboard" sub="Your week at a glance" icon={IconGrid} tint="#A855F7" scene="peaks" />
      {(() => {
        const heroChip = (c) => ({ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: c, background: hexA(c, 0.12), border: `1px solid ${hexA(c, 0.3)}`, borderRadius: 999, padding: "4px 11px" });
        const left = Math.max(0, todayTasks.length - doneToday);
        return (<>
          <Card S={S} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ProgressRing T={T} pct={pct} size={96} label={`${Math.round(pct * 100)}%`} sub="done" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Today</div>
              <div style={{ fontSize: 27, fontWeight: 850, letterSpacing: -0.5, marginTop: 1 }}>{doneToday}<span style={{ color: T.muted, fontSize: 17, fontWeight: 700 }}> / {todayTasks.length} done</span></div>
              <div style={{ display: "flex", gap: 8, marginTop: 11, flexWrap: "wrap" }}>
                <span style={heroChip(T.pink)}><IconClock w={12} /> {Math.floor(focusMin / 60)}h {focusMin % 60}m</span>
                <span style={heroChip(left ? "#A855F7" : "#34D399")}>{left ? `${left} left` : "all clear ✓"}</span>
              </div>
            </div>
          </Card>
          <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <StatTile T={T} S={S} icon={<IconCheck w={16} />} tint="#A855F7" label="Completed" value={<CountUp value={totalDone} />} sub="all time" viz={<Sparkline T={T} data={weekDone} color="#A855F7" />} />
            <StatTile T={T} S={S} icon={<IconClock w={15} />} tint={T.pink} label="Focus" value={`${Math.floor(totalFocus / 60)}h ${totalFocus % 60}m`} sub="all time" viz={<Sparkline T={T} data={weekFocus} color={T.pink} />} />
            <StatTile T={T} S={S} icon={<IconFlame w={15} />} tint="#FB923C" label="Streak" value={momentum.streak} sub={momentum.streak === 1 ? "day" : "days"} viz={<DotRow data={weekDone} color="#FB923C" />} />
          </div>
        </>);
      })()}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-2col">
        <Card S={S}><CardHead S={S} T={T} title="Completed this week" icon={<IconCheck w={14} />} tint="#A855F7" /><BarChart T={T} data={weekDone} labels={WD} height={150} /></Card>
        <Card S={S}><CardHead S={S} T={T} title="Focus minutes this week" icon={<IconClock w={14} />} tint={T.pink} /><BarChart T={T} data={weekFocus} labels={WD} height={150} /></Card>
      </div>
      {/* Notes insights row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="dash-2col">
        <Card S={S}>
          <CardHead S={S} T={T} title="Daily note" icon={<IconSunDay w={14} />} tint={T.pink} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: T.pink, display: "flex", alignItems: "center", gap: 8 }}><IconSunDay w={26} /> {dailyStreak}</div>
            <div style={{ fontSize: 12.5, color: T.muted }}>day streak</div>
          </div>
          <button className="pillbtn focusable" style={{ ...S.pill, width: "100%", justifyContent: "center", marginTop: 12, ...(hasDaily ? { color: T.pink, borderColor: hexA(T.pink, 0.5), background: T.pinkWash } : null) }} onClick={onDailyNote}>{hasDaily ? "Open today's daily note" : "Start today's daily note"}</button>
        </Card>
        <Card S={S}>
          <CardHead S={S} T={T} title="Notes activity" icon={<IconNote w={14} />} tint="#A855F7" action="All notes" onAction={onGotoNotes} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <div style={{ textAlign: "center", flex: 1 }}><div style={{ fontSize: 26, fontWeight: 800 }}>{notesTodayCount || 0}</div><div style={{ fontSize: 11.5, color: T.muted }}>today</div></div>
            <div style={{ textAlign: "center", flex: 1 }}><div style={{ fontSize: 26, fontWeight: 800, color: T.pink }}>{todaysTaskNotes.length}</div><div style={{ fontSize: 11.5, color: T.muted }}>on tasks</div></div>
            <div style={{ textAlign: "center", flex: 1 }}><div style={{ fontSize: 26, fontWeight: 800, color: "#FBBF24" }}>{(unlinkedNotes || []).length}</div><div style={{ fontSize: 11.5, color: T.muted }}>unlinked</div></div>
          </div>
        </Card>
        <Card S={S}>
          <CardHead S={S} T={T} title="Needs follow-up" icon={<IconLink w={14} />} tint="#FBBF24" count={(unlinkedNotes || []).length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {(unlinkedNotes || []).length === 0 && <Empty T={T} text="Everything's linked 🎉" />}
            {(unlinkedNotes || []).slice(0, 3).map((n) => (
              <button key={n.id} className="carry focusable" onClick={() => onOpenNote(n)} style={{ ...S.carryItem, padding: "4px 0" }}>
                <span style={{ marginTop: 4 }}><CatIcon id={n.category} w={12} color={catColor(n.category)} /></span>
                <span style={{ textAlign: "left", flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{n.title}</div><div style={{ fontSize: 11, color: T.muted }}>Link to a task or date</div></span>
                <IconArrowRight w={13} style={{ color: T.muted, alignSelf: "center" }} />
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Card S={S}>
        <CardHead S={S} T={T} title="Today by category" icon={<IconTag w={14} />} tint="#A855F7" />
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 12 }}>
          {byCategory.length === 0 && <Empty T={T} text="No tasks today" />}
          {byCategory.map(([cat, n]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <CatIcon id={cat} w={13} color={catColor(cat)} /><span style={{ fontSize: 12.5, color: T.text2, width: 80 }}>{cat}</span>
              <div style={S.barTrack}><div className="bar" style={{ width: `${(n / total) * 100}%`, background: catColor(cat) }} /></div>
              <span style={{ fontSize: 12.5, color: T.muted, width: 14, textAlign: "right" }}>{n}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageWrap>
  );
}

/* ---- Pro Notes graphics ---- */
function NoteHeatmap({ T, notes }) {
  // last ~5 weeks (35 cells) of note activity by updatedAt date
  const days = 35;
  const counts = {};
  notes.forEach((n) => { const k = toKey(new Date(n.updatedAt)); counts[k] = (counts[k] || 0) + 1; });
  const cells = Array.from({ length: days }, (_, i) => { const d = addDays(new Date(), -(days - 1 - i)); const c = counts[toKey(d)] || 0; return { c, k: toKey(d) }; });
  const max = Math.max(1, ...cells.map((x) => x.c));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
      {cells.map((x, i) => {
        const t = x.c === 0 ? 0 : 0.2 + 0.8 * (x.c / max);
        return <div key={i} title={`${x.k}: ${x.c} note${x.c === 1 ? "" : "s"}`} style={{ aspectRatio: "1", borderRadius: 4, background: x.c === 0 ? T.panel2 : `rgba(168,85,247,${t})`, border: `1px solid ${T.border}` }} />;
      })}
    </div>
  );
}
function KnowledgeGraph({ T, notes }) {
  // simple radial constellation: center hub, notes as nodes, lines for links
  const n = Math.min(notes.length, 10);
  const cx = 110, cy = 70, R = 54;
  const nodes = notes.slice(0, n).map((note, i) => { const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2; return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R * 0.8, linked: (note.linkedTaskIds || []).length > 0 || !!note.linkedDate }; });
  return (
    <svg viewBox="0 0 220 140" style={{ width: "100%", height: 130 }} aria-hidden>
      {nodes.map((nd, i) => <line key={i} x1={cx} y1={cy} x2={nd.x} y2={nd.y} stroke={hexA(T.purple, nd.linked ? 0.5 : 0.18)} strokeWidth={nd.linked ? 1.4 : 0.8} />)}
      {nodes.map((nd, i) => <circle key={i} cx={nd.x} cy={nd.y} r={nd.linked ? 5 : 3.5} fill={nd.linked ? T.pink : hexA(T.purple, 0.7)} style={{ filter: nd.linked ? `drop-shadow(0 0 4px ${T.pinkGlow})` : "none" }} />)}
      <circle cx={cx} cy={cy} r="9" fill="url(#kg)" />
      <defs><radialGradient id="kg"><stop offset="0%" stopColor="#F472B6" /><stop offset="100%" stopColor="#A855F7" /></radialGradient></defs>
    </svg>
  );
}

/* ---- Pro Notes note card ---- */
function NoteCard({ T, S, catColor, note, tasks, onOpen, onPin, onFavorite, onArchive, onDuplicate, onDelete }) {
  const [menu, setMenu] = useState(false);
  const c = catColor(note.category);
  const tags = noteTags(note);
  const linkedCount = (note.linkedTaskIds || []).length;
  return (
    <div className="notecard" style={{ ...S.noteCard, minHeight: 168, borderLeft: `3px solid ${c}`, boxShadow: note.pinned ? `0 0 24px ${hexA(T.pink, 0.12)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ color: c, marginTop: 2 }}><NoteTypeIcon type={note.type} w={15} /></span>
        <button onClick={() => onOpen(note)} className="focusable" style={{ all: "unset", cursor: "pointer", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
            {note.pinned && <IconPin w={12} />}{note.favorite && <IconStar w={12} filled />}{note.title}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
            {relDate(note.updatedAt)}
            {note.linkedDate && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: T.purple }}><IconCal w={10} /> {MO[fromKey(note.linkedDate).getMonth()]} {fromKey(note.linkedDate).getDate()}</span>}
            {linkedCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: T.pink }}><IconLink w={10} /> {linkedCount}</span>}
          </div>
        </button>
        <div style={{ position: "relative" }}>
          <button className="kebab focusable" style={S.kebab} onClick={() => setMenu((m) => !m)} aria-label="Note menu"><IconDots w={14} /></button>
          {menu && (
            <div style={S.menu} role="menu" onMouseLeave={() => setMenu(false)}>
              <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setMenu(false); onOpen(note); }}>Open</button>
              <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setMenu(false); onPin(note.id); }}>{note.pinned ? "Unpin" : "Pin"}</button>
              <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setMenu(false); onFavorite(note.id); }}>{note.favorite ? "Unfavorite" : "Favorite"}</button>
              <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setMenu(false); onDuplicate(note.id); }}>Duplicate</button>
              <button role="menuitem" className="menuItem" style={S.menuItem} onClick={() => { setMenu(false); onArchive(note.id); }}>{note.archived ? "Unarchive" : "Archive"}</button>
              <div style={S.menuSep} />
              <button role="menuitem" className="menuItem" style={{ ...S.menuItem, color: "#FB7185" }} onClick={() => { setMenu(false); onDelete(note.id); }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => onOpen(note)} className="focusable" style={{ all: "unset", cursor: "pointer", flex: 1 }}>
        <div style={S.notePreview}>{mdSnippet(note.body)}</div>
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto", paddingTop: 10, alignItems: "center" }}>
        <span style={{ ...S.miniChip, color: c, borderColor: hexA(c, 0.4) }}><CatIcon id={note.category} w={11} /> {note.category}</span>
        {tags.slice(0, 3).map((t) => <span key={t} style={{ ...S.tagChip, color: T.purple, borderColor: hexA(T.purple, 0.35) }}>#{t}</span>)}
      </div>
    </div>
  );
}

/* ---- Pro Notes page ---- */
function NotesPage({ T, S, catColor, categories, notes, tasks, collections, savedSearches, addSavedSearch, deleteSavedSearch, searchHistory, pushHistory, allTags, onOpen, onNew, onDelete, onPin, onFavorite, onArchive, onDuplicate, onDailyToday, onTemplate, todayKey }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState({ kind: "all" }); // all | inbox | pinned | daily | calendar | archive | collection:<id> | tag:<t> | saved:<id>
  const [catFilter, setCatFilter] = useState(null);
  const [showCats, setShowCats] = useState(false);
  const [tagFilter, setTagFilter] = useState(null);
  const [sort, setSort] = useState("updated");
  const [showTemplates, setShowTemplates] = useState(false);
  const [tplQuery, setTplQuery] = useState("");

  const filtered = useMemo(() => {
    let list = notes.slice();
    // view scoping
    if (view.kind !== "archive") list = list.filter((n) => !n.archived);
    if (view.kind === "inbox") list = list.filter((n) => n.collectionId === "inbox" || !n.collectionId);
    if (view.kind === "pinned") list = list.filter((n) => n.pinned);
    if (view.kind === "daily") list = list.filter((n) => n.type === "daily");
    if (view.kind === "calendar") list = list.filter((n) => !!n.linkedDate);
    if (view.kind === "archive") list = list.filter((n) => n.archived);
    if (view.kind === "favorite") list = list.filter((n) => n.favorite);
    if (view.kind === "linked-tasks") list = list.filter((n) => (n.linkedTaskIds || []).length > 0);
    if (view.kind === "collection") list = list.filter((n) => n.collectionId === view.id);
    if (view.kind === "tag") list = list.filter((n) => noteTags(n).includes(view.tag));
    if (view.kind === "saved") { const s = savedSearches.find((x) => x.id === view.id); if (s) { const f = s.filters || {}; if (f.category) list = list.filter((n) => n.category === f.category); if (f.tag) list = list.filter((n) => noteTags(n).includes(f.tag)); if (f.pinned) list = list.filter((n) => n.pinned); if (f.hasTasks) list = list.filter((n) => (n.linkedTaskIds || []).length); if (s.query) list = list.filter((n) => fuzzy(s.query, n.title) || fuzzy(s.query, n.body)); } }
    if (catFilter) list = list.filter((n) => n.category === catFilter);
    if (tagFilter) list = list.filter((n) => noteTags(n).includes(tagFilter));
    if (q.trim()) list = list.filter((n) => fuzzy(q, n.title) || fuzzy(q, n.body) || noteTags(n).some((t) => fuzzy(q, t)) || fuzzy(q, n.category) || (tasks.filter((t) => (n.linkedTaskIds || []).includes(t.id)).some((t) => fuzzy(q, t.title))));
    const cmp = { updated: (a, b) => (b.updatedAt < a.updatedAt ? -1 : 1), created: (a, b) => (b.createdAt < a.createdAt ? -1 : 1), title: (a, b) => a.title.localeCompare(b.title) };
    list.sort((a, b) => (b.pinned - a.pinned) || (cmp[sort] || cmp.updated)(a, b));
    return list;
  }, [notes, tasks, view, catFilter, tagFilter, q, sort, savedSearches]);

  const counts = useMemo(() => {
    const live = notes.filter((n) => !n.archived);
    const byColl = {}; live.forEach((n) => { const c = n.collectionId || "inbox"; byColl[c] = (byColl[c] || 0) + 1; });
    return { all: live.length, pinned: live.filter((n) => n.pinned).length, daily: live.filter((n) => n.type === "daily").length, calendar: live.filter((n) => n.linkedDate).length, archive: notes.filter((n) => n.archived).length, favorite: live.filter((n) => n.favorite).length, linkedTasks: live.filter((n) => (n.linkedTaskIds || []).length).length, byColl };
  }, [notes]);

  const SideItem = ({ icon, label, active, count, onClick, color }) => (
    <button className="navbtn focusable" onClick={onClick} aria-current={active ? "true" : undefined} style={{ ...S.notesSideItem, ...(active ? S.notesSideActive : null) }}>
      <span style={{ color: active ? T.text : (color || T.muted), display: "grid", placeItems: "center", width: 18 }}>{icon}</span>
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
      {count != null && count > 0 && <span style={{ fontSize: 11, color: T.muted }}>{count}</span>}
    </button>
  );

  const viewTitle = view.kind === "collection" ? (collections.find((c) => c.id === view.id)?.name || "Collection")
    : view.kind === "tag" ? `#${view.tag}` : view.kind === "saved" ? (savedSearches.find((s) => s.id === view.id)?.name || "Saved")
    : { all: "All Notes", inbox: "Inbox", pinned: "Pinned", daily: "Daily Notes", calendar: "Calendar Linked", archive: "Archive", favorite: "Favorites", "linked-tasks": "Linked to tasks" }[view.kind] || "Notes";

  return (
    <div>
      <PageHead T={T} title="Notes" sub={`${notes.filter((n) => !n.archived).length} notes · templates, daily, search`} icon={IconNote} tint="#9333EA" scene="notes" />
      <div style={S.notesWorkspace}>
      {/* LEFT: collections */}
      <aside className="notesSidebar scrollarea" style={S.notesSidebar} aria-label="Note collections">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SideItem icon={<IconNote w={16} />} label="All Notes" count={counts.all} active={view.kind === "all"} onClick={() => setView({ kind: "all" })} />
          <SideItem icon={<IconInbox w={16} />} label="Inbox" count={counts.byColl.inbox} active={view.kind === "inbox"} onClick={() => setView({ kind: "inbox" })} />
          <SideItem icon={<IconPin w={14} />} label="Pinned" count={counts.pinned} active={view.kind === "pinned"} onClick={() => setView({ kind: "pinned" })} color="#FBBF24" />
          <SideItem icon={<IconStar w={14} />} label="Favorites" count={counts.favorite} active={view.kind === "favorite"} onClick={() => setView({ kind: "favorite" })} />
          <SideItem icon={<IconSunDay w={16} />} label="Daily Notes" count={counts.daily} active={view.kind === "daily"} onClick={() => setView({ kind: "daily" })} color={T.pink} />
          <SideItem icon={<IconCal w={15} />} label="Calendar Linked" count={counts.calendar} active={view.kind === "calendar"} onClick={() => setView({ kind: "calendar" })} />
          <SideItem icon={<IconLink w={15} />} label="Linked to tasks" count={counts.linkedTasks} active={view.kind === "linked-tasks"} onClick={() => setView({ kind: "linked-tasks" })} />
        </div>
        <div style={S.notesSideLabel}>Collections</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {collections.filter((c) => c.id !== "inbox" && c.id !== "daily").map((c) => (
            <SideItem key={c.id} icon={<CollectionIcon icon={c.icon} w={15} />} label={c.name} count={counts.byColl[c.id]} active={view.kind === "collection" && view.id === c.id} onClick={() => setView({ kind: "collection", id: c.id })} color={c.color} />
          ))}
        </div>
        {allTags.length > 0 && <>
          <div style={S.notesSideLabel}>Tags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.slice(0, 12).map(([t, n]) => <button key={t} className="focusable" onClick={() => setView({ kind: "tag", tag: t })} style={{ ...S.tagChip, cursor: "pointer", color: view.kind === "tag" && view.tag === t ? T.text : T.purple, borderColor: hexA(T.purple, 0.35), background: view.kind === "tag" && view.tag === t ? T.accentWash : "transparent" }}>#{t} <span style={{ opacity: 0.6 }}>{n}</span></button>)}
          </div>
        </>}
        {savedSearches.length > 0 && <>
          <div style={S.notesSideLabel}>Saved searches</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {savedSearches.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                <SideItem icon={<IconSearch w={14} />} label={s.name} active={view.kind === "saved" && view.id === s.id} onClick={() => setView({ kind: "saved", id: s.id })} />
                <button className="link focusable" style={{ ...S.link, color: "#FB7185", padding: 4 }} onClick={() => deleteSavedSearch(s.id)} aria-label="Delete saved search"><IconX w={12} /></button>
              </div>
            ))}
          </div>
        </>}
        <div style={S.notesSideLabel}>Archive</div>
        <SideItem icon={<IconArchive w={15} />} label="Archive" count={counts.archive} active={view.kind === "archive"} onClick={() => setView({ kind: "archive" })} />
      </aside>

      {/* CENTER: list */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="gradText" style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>{viewTitle}</div>
          <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 700, background: T.panel2, borderRadius: 20, padding: "2px 9px" }}>{filtered.length}</span>
          <div style={{ flex: 1 }} />
          <button className="pillbtn focusable deskonly" style={S.pill} onClick={() => setShowTemplates((s) => !s)}><IconLayers w={15} /> Templates</button>
          <button className="pillbtn focusable deskonly" style={S.pill} onClick={onDailyToday}><IconSunDay w={15} /> Daily note</button>
        </div>

        {/* mobile quick actions */}
        <div className="mobileFlex" style={{ display: "none", gap: 8 }}>
          <button className="pillbtn focusable" style={{ ...S.pill, flex: 1, justifyContent: "center" }} onClick={() => setShowTemplates((s) => !s)}><IconLayers w={15} /> Templates</button>
          <button className="pillbtn focusable" style={{ ...S.pill, flex: 1, justifyContent: "center" }} onClick={onDailyToday}><IconSunDay w={15} /> Daily note</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel2, border: `1px solid ${catFilter || tagFilter ? hexA(T.purple, 0.4) : T.border}`, borderRadius: 12, padding: "0 12px", flex: 1, minWidth: 0, transition: "border-color .2s ease" }}>
            <IconSearch w={15} /><input style={{ ...S.input, border: "none", background: "transparent", padding: "11px 0", minWidth: 0 }} placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") pushHistory(q); }} aria-label="Search notes" />
            {q && <button className="link focusable" style={S.link} onClick={() => setQ("")} aria-label="Clear">✕</button>}
          </div>
          <button className="iconbtn focusable" aria-label="Filter by category" aria-expanded={showCats} onClick={() => setShowCats((v) => !v)}
            style={{ ...S.iconBtn, width: 42, height: 42, position: "relative", ...(catFilter ? { borderColor: hexA(catColor(catFilter), 0.6), color: catColor(catFilter) } : showCats ? { borderColor: hexA(T.purple, 0.5), color: T.text } : null) }}>
            <IconFilter w={16} />
            {catFilter && <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: catColor(catFilter) }} />}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...S.input, width: "auto", padding: "10px 10px", flexShrink: 0 }} aria-label="Sort notes">
            <option value="updated">Recent</option><option value="created">Created</option><option value="title">A–Z</option>
          </select>
        </div>

        {/* active category filter shown as a removable pill when the panel is collapsed */}
        {catFilter && !showCats && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "fade .2s ease" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 8px 5px 11px", borderRadius: 20, background: hexA(catColor(catFilter), 0.14), border: `1px solid ${hexA(catColor(catFilter), 0.4)}`, fontSize: 12.5, fontWeight: 600, color: T.text }}>
              <CatIcon id={catFilter} w={12} color={catColor(catFilter)} /> {catFilter}
              <button className="focusable" onClick={() => setCatFilter(null)} aria-label="Clear category" style={{ all: "unset", cursor: "pointer", display: "grid", placeItems: "center", marginLeft: 2, color: T.muted }}><IconX w={11} /></button>
            </span>
            {(q || tagFilter) && <button className="link focusable" style={{ ...S.link, fontSize: 12.5 }} onClick={() => { addSavedSearch(q ? `"${q}"` : viewTitle, q, { category: catFilter, tag: tagFilter }); }}>Save search</button>}
          </div>
        )}

        {/* category filter chips — collapsible to keep the header clean */}
        {showCats && (
          <div style={{ ...S.chipRow, animation: "slideDown .25s cubic-bezier(.22,1,.36,1)", background: hexA(T.panel2, 0.5), borderRadius: 14, padding: 10, border: `1px solid ${T.border}` }}>
            <button className="chip focusable" onClick={() => { setCatFilter(null); }} aria-pressed={!catFilter} style={{ ...S.chip, ...(!catFilter ? { borderColor: T.purple, color: T.text, background: T.accentWash } : null) }}>All</button>
            {categories.map((c) => { const on = catFilter === c.id; return <button key={c.id} className="chip focusable" onClick={() => { setCatFilter(on ? null : c.id); }} aria-pressed={on} style={{ ...S.chip, ...(on ? { borderColor: c.color, background: hexA(c.color, 0.14), color: T.text } : null) }}><CatIcon id={c.id} w={12} color={c.color} /> {c.id}</button>; })}
          </div>
        )}

        {showTemplates && (
          <Card S={S}>
            <CardHead S={S} T={T} title={`Template gallery · ${NOTE_TEMPLATE_ALL.length}`} action="Hide" onAction={() => setShowTemplates(false)} />
            <input value={tplQuery} onChange={(e) => setTplQuery(e.target.value)} placeholder="Search templates…" aria-label="Search templates" style={{ ...S.input, marginTop: 12 }} />
            <div className="scrollarea" style={{ ...S.notesGrid, marginTop: 12, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
              {NOTE_TEMPLATE_ALL.filter((tpl) => !tplQuery || fuzzy(tplQuery, tpl.name) || fuzzy(tplQuery, tpl.desc) || fuzzy(tplQuery, tpl.category)).map((tpl) => (
                <button key={tpl.id} className="notecard focusable" onClick={() => { onTemplate(tpl); setShowTemplates(false); }} style={{ ...S.noteCard, minHeight: 104, cursor: "pointer", borderLeft: `3px solid ${catColor(tpl.category)}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: T.text }}><CollectionIcon icon={tpl.icon} w={15} /> {tpl.name}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>{tpl.desc}</div>
                  <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...S.miniChip, color: catColor(tpl.category), borderColor: hexA(catColor(tpl.category), 0.4) }}><CatIcon id={tpl.category} w={11} /> {tpl.category}</span>
                    <span style={{ fontSize: 11.5, color: T.pink, fontWeight: 600 }}>Use →</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        <div style={S.notesGrid}>
          {filtered.length > 0 && <button className="newnote focusable newNoteTile" onClick={() => onNew({})} style={{ ...S.newNote, minHeight: 120 }}><div style={S.newNotePlus}><IconPlus w={20} /></div><div style={{ fontWeight: 700, color: T.pink }}>New Note</div></button>}
          {filtered.map((n) => (
            <NoteCard key={n.id} T={T} S={S} catColor={catColor} note={n} tasks={tasks}
              onOpen={onOpen} onPin={onPin} onFavorite={onFavorite} onArchive={onArchive} onDuplicate={onDuplicate} onDelete={onDelete} />
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyState T={T} S={S} kind={q ? "search" : "notes"}
            title={q ? "No notes match your search" : "No notes here yet"}
            sub={q ? "Try a different keyword, tag, or clear the filters." : "Capture a thought, link it to a task, or start from one of 165+ templates."}
            actionLabel={q ? null : "Create a note"} onAction={q ? null : () => onNew({})} />
        )}
      </div>

      {/* RIGHT: insights */}
      <aside className="notesInsights scrollarea" style={S.notesInsights} aria-label="Notes insights">
        <Card S={S}>
          <CardHead S={S} T={T} title="Activity" />
          <div style={{ marginTop: 12 }}><NoteHeatmap T={T} notes={notes.filter((n) => !n.archived)} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12.5 }}>
            <div><div style={{ color: T.muted }}>This week</div><div style={{ fontWeight: 800, fontSize: 18 }}>{notes.filter((n) => !n.archived && new Date(n.updatedAt) > addDays(new Date(), -7)).length}</div></div>
            <div><div style={{ color: T.muted }}>Linked</div><div style={{ fontWeight: 800, fontSize: 18, color: T.pink }}>{counts.linkedTasks + counts.calendar}</div></div>
            <div><div style={{ color: T.muted }}>Pinned</div><div style={{ fontWeight: 800, fontSize: 18 }}>{counts.pinned}</div></div>
          </div>
        </Card>
        <Card S={S}>
          <CardHead S={S} T={T} title="Knowledge graph" />
          <KnowledgeGraph T={T} notes={notes.filter((n) => !n.archived)} />
          <div style={{ fontSize: 11.5, color: T.vmuted, textAlign: "center" }}>Pink nodes are linked to a task or date</div>
        </Card>
        {allTags.length > 0 && (
          <Card S={S}>
            <CardHead S={S} T={T} title="Top tags" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {allTags.slice(0, 8).map(([t, n]) => <button key={t} className="focusable" onClick={() => setView({ kind: "tag", tag: t })} style={{ ...S.tagChip, cursor: "pointer", color: T.purple, borderColor: hexA(T.purple, 0.35) }}>#{t} <span style={{ opacity: 0.6 }}>{n}</span></button>)}
            </div>
          </Card>
        )}
      </aside>
      </div>
    </div>
  );
}

/* ---- Templates page ---- */
const TASK_TEMPLATES = [
  { title: "Trading Review", category: "Trading", time: "16:00", durationMinutes: 45, priority: "high" },
  { title: "Workout", category: "Health", time: "18:00", durationMinutes: 60, priority: "medium" },
  { title: "Weekly Review", category: "Admin", time: "10:00", durationMinutes: 60, priority: "high" },
  { title: "Study Session", category: "Study", time: "10:00", durationMinutes: 90, priority: "medium" },
  { title: "Finance Review", category: "Finance", time: "11:00", durationMinutes: 45, priority: "medium" },
  { title: "Build Sprint", category: "Build", time: "14:00", durationMinutes: 120, priority: "high" },
];
const NOTE_TEMPLATES = [
  { title: "Trading Journal", category: "Trading", body: "Setup:\nThesis:\nRisk:\nResult:\nLesson:" },
  { title: "Workout Log", category: "Health", body: "Focus:\n- Exercise 1: \n- Exercise 2: \n- Exercise 3: \nNotes:" },
  { title: "Weekly Review", category: "Admin", body: "Wins:\nMisses:\nLessons:\nNext week focus:" },
  { title: "Meeting Notes", category: "Personal", body: "Attendees:\nAgenda:\nDecisions:\nAction items:" },
];

// Rich Pro Notes templates (used in Pro Notes template gallery + command palette)
const NOTE_TEMPLATE_DEFS = [
  { id: "tpl-daily", name: "Daily Note", desc: "Plan and reflect on your day", category: "Personal", type: "daily", icon: "sun", body: DAILY_TEMPLATE_BODY },
  { id: "tpl-weekly", name: "Weekly Review", desc: "Close out the week with intention", category: "Admin", type: "review", icon: "repeat", body: "> [!tip] Be honest — this note is for future you.\n\n# Wins\n- \n\n# Lessons\n\n# What slipped\n\n# Output this week\n```chart\ntype: bar\ntitle: Tasks completed\nMon: 0\nTue: 0\nWed: 0\nThu: 0\nFri: 0\nSat: 0\nSun: 0\n```\n\n# Next week priorities\n- [ ] \n- [ ] \n\n# Carryover decisions\n| Item | Decision | When |\n| --- | --- | --- |\n|  |  |  |" },
  { id: "tpl-trade", name: "Trading Journal", desc: "Log a trade end-to-end", category: "Trading", type: "trading-journal", icon: "chart", body: "> [!warn] Risk ≤ 1% — process over outcome.\n\n# Market Context\n**Bias:** \n\n# Setup\n| Field | Value |\n| --- | --- |\n| Instrument |  |\n| Entry |  |\n| Stop |  |\n| Target |  |\n| Risk (R) | 1 |\n\n# Rules check\n- [ ] Waited for confirmation\n- [ ] Risk sized correctly\n- [ ] No revenge trading\n\n# Execution Notes\n\n# Result\n\n# Lesson\n==  ==" },
  { id: "tpl-backtest", name: "Backtest Review", desc: "Evaluate a strategy", category: "Trading", type: "trading-journal", icon: "chart", body: "> [!info] A backtest is only as honest as its worst assumption.\n\n# Strategy\n| Field | Value |\n| --- | --- |\n| Market |  |\n| Timeframe |  |\n| Sample size |  |\n\n# Rules\n1. \n2. \n\n# Results\n| Metric | Value |\n| --- | --- |\n| Win rate |  |\n| Avg R |  |\n| Max drawdown |  |\n\n# Equity shape\n```chart\ntype: line\ntitle: Equity curve (R)\nT1: 0\nT2: 0\nT3: 0\nT4: 0\nT5: 0\n```\n\n# Improvement\n- " },
  { id: "tpl-study", name: "Study Notes", desc: "Capture what you learned", category: "Study", type: "study", icon: "book", body: "> [!tip] Write it like you'll teach it tomorrow.\n\n# Topic\n\n# Key Ideas\n- \n\n# In my own words\n==  ==\n\n# Questions\n- \n\n# Related\n- [[ ]]\n\n# Review later\n- [ ] Recall test in 2 days\n- [ ] Recall test in 1 week" },
  { id: "tpl-workout", name: "Workout Log", desc: "Track a training session", category: "Health", type: "workout-log", icon: "dumbbell", body: "> [!done] Showing up beats the perfect session.\n\n# Session\n**Type:**   ·  **Duration:** \n\n# Exercises\n| Exercise | Sets | Reps | Weight |\n| --- | --- | --- | --- |\n|  |  |  |  |\n|  |  |  |  |\n\n# How it felt\n```progress\nEnergy: 0\nIntensity: 0\n```\n\n# Notes" },
  { id: "tpl-project", name: "Project Plan", desc: "Scope a build or project", category: "Build", type: "project", icon: "layers", body: "> [!idea] Define \"done\" before you start.\n\n# Goal\n\n# Phases\n```flow\nScope -> Build -> Test -> Ship\n```\n\n# Milestones\n- [ ] \n- [ ] \n- [ ] \n\n# Risks\n> [!danger] Biggest risk: \n\n# Notes" },
  { id: "tpl-meeting", name: "Meeting Notes", desc: "Structure a discussion", category: "Personal", type: "meeting", icon: "users", body: "> [!info] Capture decisions *and* owners.\n\n# Attendees\n\n# Agenda\n- \n\n# Decisions\n- \n\n# Action items\n| Action | Owner | Due |\n| --- | --- | --- |\n|  |  |  |" },
  { id: "tpl-finance", name: "Finance Review", desc: "Review money and budgets", category: "Finance", type: "review", icon: "repeat", body: "> [!tip] Pay yourself first.\n\n# Income\n| Source | Amount |\n| --- | --- |\n|  |  |\n\n# Expenses\n| Item | Amount | Needed? |\n| --- | --- | --- |\n|  |  |  |\n\n# Net\n**This month:** \n\n# Goals\n```progress\nSavings goal: 0\nDebt payoff: 0\n```\n\n# Decisions\n- [ ] " },
  { id: "tpl-habit", name: "Habit Reflection", desc: "Reflect on a habit or routine", category: "Health", type: "review", icon: "spark", body: "> [!tip] Make it easy before you make it big.\n\n# Habit\n\n# Consistency\n```progress\nThis week: 0\nThis month: 0\n```\n\n# How it went\n\n# Friction\n\n# Adjustment for next week\n==  ==" },
];

// Extended professional template library (merged into NOTE_TEMPLATE_DEFS below)
/* Expand a bare section header into a pro scaffold (tables, checklists, flows, progress, prompts)
   so every generated template opens with genuinely useful structure instead of an empty heading. */
function expandSection(name, type) {
  const n = name.toLowerCase().trim();
  const H = (...k) => k.some((w) => n.includes(w));
  const tbl = (cols, rows = 2) => { const head = "| " + cols.join(" | ") + " |"; const sep = "| " + cols.map(() => "---").join(" | ") + " |"; const blank = "| " + cols.map(() => " ").join(" | ") + " |"; return "\n" + [head, sep, ...Array(rows).fill(blank)].join("\n"); };
  const check = (n2 = 3) => "\n" + Array(n2).fill("- [ ] ").join("\n");
  const bullets = (n2 = 2) => "\n" + Array(n2).fill("- ").join("\n");
  const numbered = (n2 = 3) => "\n" + Array.from({ length: n2 }, (_, i) => `${i + 1}. `).join("\n");
  const progress = (rows) => "\n```progress\n" + rows.join("\n") + "\n```";
  const flow = (s) => "\n```flow\n" + s + "\n```";
  const field = (...labels) => "\n" + labels.map((l) => `**${l}:** `).join("\n");

  // checklists / action lists
  if (H("action item")) return tbl(["Action", "Owner", "Due"]);
  if (H("checklist","to-do","to do","todo","next step","next action","follow up","follow-up","deliverable","release checklist","rollout","final review","questions to ask","to process")) return check();
  if (H("packing","shopping","groceries","essentials")) return check();
  if (H("milestone")) return check();
  if (H("acceptance criteria","definition of done","rules check")) return check();

  // money / finance
  if (n === "income" || H("side income","earnings")) return tbl(["Source", "Amount", "Note"]);
  if (H("expense","fixed cost","variable cost","spending","outgoings")) return tbl(["Item", "Amount", "Needed?"]);
  if (H("budget")) return tbl(["Category", "Planned", "Actual"]);
  if (H("bill")) return tbl(["Bill", "Due", "Amount", "Paid?"]);
  if (n === "assets") return tbl(["Asset", "Value"]);
  if (n === "liabilities" || H("debt")) return tbl(["Name", "Balance", "Rate", "Min payment"]);
  if (H("net worth")) return field("This period", "Change vs last");
  if (H("balances","owed back","per-person","per person","settle")) return tbl(["Person", "Owes", "Status"]);
  if (H("annual total","monthly total","this month's target","total")) return field("Total");

  // trading
  if (n === "watchlist" || H("holdings","open positions","positions")) return tbl(["Ticker", "Level / Entry", "Bias"], 3);
  if (H("key level")) return tbl(["Level", "Type", "Note"]);
  if (n === "setup") return "\n| Field | Value |\n| --- | --- |\n| Instrument |  |\n| Entry |  |\n| Stop |  |\n| Target |  |\n| Risk (R) | 1 |";
  if (H("entry / stop","entry/stop","entry, stop")) return field("Entry", "Stop", "Target", "R:R");
  if (n === "bias" || H("direction")) return field("Direction", "Conviction");
  if (H("r:r","risk limit","max risk","position sizing")) return field("Risk per trade", "R:R");
  if (H("p&l","pnl","p & l")) return "\n| Metric | Value |\n| --- | --- |\n| Trades |  |\n| Win rate |  |\n| Net R |  |";
  if (H("best trade","worst trade")) return field("Trade", "Why");
  if (H("entry rule","exit rule","rules")) return numbered();
  if (H("invalidation","edge")) return bullets(1);

  // study
  if (H("review later","spaced")) return "\n- [ ] Recall test in 2 days\n- [ ] Recall test in 1 week";
  if (H("module","topics to cover")) return check();
  if (H("grading breakdown","credit load")) return tbl(["Component", "Weight"]);
  if (H("important dates","key deadlines","deadlines")) return tbl(["Date", "What"]);
  if (H("practice schedule","study schedule") || n === "schedule") return tbl(["Day", "Focus", "Done?"]);
  if (H("key point","key idea","big idea","findings","sources","examples","resources","weak area")) return bullets();
  if (H("in my own words","favorite quote","favourite quote")) return "\n==  ==";

  // build / work structure
  if (H("steps to reproduce","steps","agenda")) return numbered();
  if (H("expected")) return field("Expected");
  if (H("actual")) return field("Actual");
  if (H("risk")) return "\n> [!danger] Biggest risk: ";
  if (H("owner","stakeholder")) return tbl(["Area", "Owner", "Due"]);
  if (H("success metric","metrics","key result")) return tbl(["Metric", "Target", "Actual"]);
  if (H("phase","pipeline","workflow","process","funnel","stages")) return flow("Start -> In progress -> Done");
  if (H("timeline")) return flow("Kickoff -> Milestone -> Ship");
  if (H("endpoint","request","response","errors","code","commands")) return "\n```\n\n```";
  if (H("acceptance","done")) return check();

  // health
  if (H("exercise","main lift","accessor")) return "\n| Exercise | Sets | Reps | Weight |\n| --- | --- | --- | --- |\n|  |  |  |  |\n|  |  |  |  |";
  if (H("symptom")) return tbl(["Symptom", "Severity", "Note"]);
  if (H("week structure","split")) return tbl(["Day", "Focus"], 3);
  if (H("heart rate","distance","duration","mileage","servings")) return field(name.replace(/^\w/, (c) => c.toUpperCase()));
  if (H("quality","energy","stress","severity","mood","level (1","(1-10)","1-10")) return field("Rating (1–10)");
  if (H("breakfast","lunch","dinner","snack","meal")) return bullets(1);
  if (H("progression","warm-up","warm up")) return bullets();

  // personal / mindfulness
  if (H("grateful","gratitude")) return bullets(3);
  if (H("intention","one-liner","logline","theme of the week","how i want to feel","how i'll feel")) return "\n> ";
  if (H("one priority","top priority","#1","tomorrow's #1","priority")) return field("#1");
  if (H("what went well","wins","win of the day","highlight","achievements","progress this week")) return bullets();
  if (H("lesson","takeaway","insight","verdict","conclusion","key message","winner")) return "\n==  ==";
  if (H("let go","stop","drop")) return bullets(1);
  if (H("pros & cons","pros and cons")) return tbl(["Option", "Pros", "Cons"]);
  if (n === "options") return tbl(["Option", "Notes"]);
  if (H("dear future","i hope","right now","mantra")) return "\n> ";

  // work / comms / people
  if (H("challenge","concern","blocker","feedback","strength","yesterday","today","ideas","decisions","follow-ups","follow ups")) return bullets();
  if (H("objective","goal")) return "\n> ";
  if (H("attendee","guest list","guests","members","contacts","people")) return bullets();
  if (H("call to action","cta")) return "\n==  ==";
  if (H("to","subject","ask") && n.length <= 8) return field(name.replace(/^\w/, (c) => c.toUpperCase()));
  if (H("progress","consistency","confidence","completion","streak")) return progress(["Overall: 0"]);

  // prose-ish defaults stay open; everything else gets a starter bullet
  if (H("notes","note","body","discussion","reflection","explanation","overview","summary","thesis","draft","abstract","intro")) return "\n- ";
  return "\n- ";
}
const NOTE_TEMPLATE_EXTRA = (() => {
  const mk = (name, desc, category, type, icon, sections) => ({ id: "tpl-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, desc, category, type, icon, body: sections.map((s) => (s.startsWith("- ") || s.startsWith("> ") || s.startsWith("| ") || s.startsWith("```")) ? s : (s.includes("\n") || /^\d+\.\s/.test(s)) ? "# " + s : "# " + s + expandSection(s, type)).join("\n\n") });
  return [
    // Trading
    mk("Pre-Market Plan", "Set up before the open", "Trading", "trading-journal", "chart", ["Bias", "Key Levels", "Watchlist", "Risk Limit", "Game Plan"]),
    mk("Post-Market Review", "Wrap up the trading day", "Trading", "trading-journal", "chart", ["What I traded", "What worked", "What didn't", "Tomorrow's focus"]),
    mk("Trade Idea", "Capture a setup", "Trading", "trading-journal", "chart", ["Instrument", "Thesis", "Entry / Stop / Target", "R:R", "Invalidation"]),
    mk("Weekly Trading Review", "Review the trading week", "Trading", "review", "chart", ["P&L summary", "Best trade", "Worst trade", "Rule breaks", "Next week rules"]),
    mk("Risk Audit", "Check your risk discipline", "Trading", "review", "chart", ["Max risk per trade", "Open exposure", "Correlation check", "Adjustments"]),
    mk("Strategy Spec", "Define a system", "Trading", "trading-journal", "chart", ["Market & timeframe", "Entry rules", "Exit rules", "Position sizing", "Edge"]),
    mk("Market Recap", "Daily market notes", "Trading", "note", "chart", ["Indices", "Sectors", "News", "Takeaways"]),
    mk("Psychology Journal", "Track your headspace", "Trading", "review", "spark", ["Mood before", "Decisions", "Emotional triggers", "Lesson"]),
    // Finance
    mk("Monthly Budget", "Plan the month's money", "Finance", "review", "repeat", ["Income", "Fixed costs", "Variable costs", "Savings goal", "Notes"]),
    mk("Expense Log", "Track spending", "Finance", "note", "repeat", ["Date / Item / Amount", "Category", "Necessary?", "Notes"]),
    mk("Investment Thesis", "Why you're buying", "Finance", "note", "repeat", ["Asset", "Thesis", "Risks", "Time horizon", "Exit plan"]),
    mk("Net Worth Update", "Snapshot your finances", "Finance", "review", "repeat", ["Assets", "Liabilities", "Net worth", "Change vs last month"]),
    mk("Bill Tracker", "Stay on top of bills", "Finance", "note", "repeat", ["Bill", "Due date", "Amount", "Paid?"]),
    mk("Savings Goal", "Plan a savings target", "Finance", "project", "repeat", ["Goal", "Target amount", "Deadline", "Monthly contribution", "Progress"]),
    mk("Tax Prep Checklist", "Get ready for taxes", "Finance", "review", "repeat", ["Documents needed", "Deductions", "Deadlines", "Questions for accountant"]),
    // Study
    mk("Lecture Notes", "Capture a class", "Study", "study", "book", ["Topic", "Key points", "Examples", "Questions", "Review later"]),
    mk("Book Notes", "Notes on a book", "Study", "study", "book", ["Title & author", "Big ideas", "Favorite quotes", "How I'll apply it"]),
    mk("Exam Prep", "Plan your revision", "Study", "study", "book", ["Topics to cover", "Weak areas", "Practice plan", "Schedule"]),
    mk("Concept Map", "Break down a concept", "Study", "study", "book", ["Concept", "Definition", "Connections", "Example"]),
    mk("Research Log", "Track research", "Study", "study", "book", ["Question", "Sources", "Findings", "Next steps"]),
    mk("Flashcard Set", "Make study cards", "Study", "study", "book", ["Topic", "- Q: \n- A: ", "- Q: \n- A: "]),
    mk("Course Plan", "Plan a course", "Study", "project", "book", ["Course", "Modules", "Milestones", "Deadline"]),
    mk("Language Practice", "Practice a language", "Study", "study", "book", ["New words", "Grammar", "Sentences", "Review"]),
    // Build
    mk("Feature Spec", "Define a feature", "Build", "project", "layers", ["Problem", "Solution", "Scope", "Acceptance criteria", "Risks"]),
    mk("Bug Report", "Document a bug", "Build", "note", "layers", ["Summary", "Steps to reproduce", "Expected", "Actual", "Fix idea"]),
    mk("Sprint Plan", "Plan a sprint", "Build", "project", "layers", ["Goal", "Committed work", "- [ ] ", "Stretch", "Risks"]),
    mk("Code Review Notes", "Review a PR", "Build", "note", "layers", ["What changed", "Concerns", "Suggestions", "Approve?"]),
    mk("Architecture Decision", "Record a decision", "Build", "project", "layers", ["Context", "Decision", "Alternatives", "Consequences"]),
    mk("Release Checklist", "Ship safely", "Build", "review", "layers", ["- [ ] Tests pass", "- [ ] Changelog", "- [ ] Migration", "- [ ] Rollback plan"]),
    mk("Retro", "Team retrospective", "Build", "review", "repeat", ["What went well", "What didn't", "Action items"]),
    mk("Tech Debt Log", "Track debt", "Build", "note", "layers", ["Item", "Impact", "Effort", "Priority"]),
    mk("API Design", "Design an endpoint", "Build", "project", "layers", ["Endpoint", "Request", "Response", "Errors", "Auth"]),
    // Health
    mk("Strength Session", "Log a lift", "Health", "workout-log", "dumbbell", ["Warm-up", "Main lifts", "Accessories", "Notes"]),
    mk("Cardio Log", "Log cardio", "Health", "workout-log", "dumbbell", ["Type", "Duration", "Distance", "Heart rate", "Feel"]),
    mk("Meal Plan", "Plan your meals", "Health", "note", "heart", ["Breakfast", "Lunch", "Dinner", "Snacks", "Water"]),
    mk("Sleep Log", "Track your sleep", "Health", "review", "heart", ["Bedtime", "Wake time", "Quality", "Notes"]),
    mk("Meditation Log", "Track mindfulness", "Health", "review", "spark", ["Duration", "Technique", "How I felt", "Insight"]),
    mk("Symptom Tracker", "Track how you feel", "Health", "note", "heart", ["Symptoms", "Severity", "Triggers", "What helped"]),
    mk("Running Plan", "Plan your runs", "Health", "project", "dumbbell", ["Goal", "Weekly mileage", "Long run", "Rest days"]),
    mk("Wellness Check", "Weekly wellness review", "Health", "review", "heart", ["Energy", "Sleep", "Nutrition", "Stress", "Adjustments"]),
    // Personal
    mk("Gratitude Journal", "Three good things", "Personal", "review", "spark", ["I'm grateful for", "Win of the day", "Tomorrow I'll"]),
    mk("Morning Pages", "Brain dump", "Personal", "note", "spark", ["On my mind", "Today's intention", "One priority"]),
    mk("Evening Reflection", "Close the day", "Personal", "review", "spark", ["What went well", "What I learned", "Let go of"]),
    mk("Goal Setting", "Set a goal", "Personal", "project", "spark", ["Goal", "Why it matters", "Milestones", "First step", "Deadline"]),
    mk("Decision Journal", "Think through a choice", "Personal", "note", "spark", ["Decision", "Options", "Pros & cons", "Gut feeling", "Choice"]),
    mk("Bucket List", "Things to do", "Personal", "project", "spark", ["- [ ] ", "- [ ] ", "- [ ] "]),
    mk("Travel Plan", "Plan a trip", "Personal", "project", "spark", ["Destination", "Dates", "Itinerary", "Packing", "Budget"]),
    mk("Reading List", "Books to read", "Personal", "note", "book", ["- [ ] ", "- [ ] ", "Currently reading", "Finished"]),
    mk("Letter to Self", "Note to future you", "Personal", "note", "spark", ["Dear future me", "Right now", "I hope"]),
    mk("Idea Vault", "Capture an idea", "Personal", "note", "spark", ["Idea", "Why it's interesting", "Next step"]),
    // Work
    mk("1:1 Notes", "Manager / report sync", "Work", "meeting", "users", ["Wins", "Challenges", "Feedback", "Action items"]),
    mk("Standup Update", "Daily standup", "Work", "note", "users", ["Yesterday", "Today", "Blockers"]),
    mk("Project Kickoff", "Start a project", "Work", "project", "layers", ["Objective", "Stakeholders", "Scope", "Timeline", "Risks"]),
    mk("Status Report", "Report progress", "Work", "review", "users", ["Summary", "Done", "In progress", "Blockers", "Next"]),
    mk("Brainstorm", "Generate ideas", "Work", "note", "spark", ["Prompt", "Ideas", "Top picks", "Next steps"]),
    mk("Interview Notes", "Evaluate a candidate", "Work", "meeting", "users", ["Candidate", "Strengths", "Concerns", "Verdict"]),
    mk("OKR Planning", "Set objectives", "Work", "project", "layers", ["Objective", "Key results", "Initiatives", "Confidence"]),
    mk("Client Call", "Log a client call", "Work", "meeting", "users", ["Attendees", "Discussion", "Decisions", "Follow-ups"]),
    mk("Presentation Outline", "Plan a talk", "Work", "project", "layers", ["Audience", "Key message", "Structure", "Call to action"]),
    mk("Email Draft", "Draft a message", "Work", "note", "users", ["To", "Subject", "Body", "Ask"]),
    mk("Performance Self-Review", "Reflect on your work", "Work", "review", "repeat", ["Achievements", "Growth areas", "Goals", "Support needed"]),
    mk("Process Doc", "Document a process", "Work", "project", "layers", ["Purpose", "Steps", "Owners", "Edge cases"]),
    // Errands / Social / Admin
    mk("Shopping List", "What to buy", "Errands", "note", "spark", ["- [ ] ", "- [ ] ", "- [ ] "]),
    mk("Packing List", "Pack for a trip", "Errands", "note", "spark", ["- [ ] ", "- [ ] ", "Essentials", "Don't forget"]),
    mk("Home Maintenance", "Track home tasks", "Errands", "note", "spark", ["- [ ] ", "Seasonal", "Repairs needed"]),
    mk("Event Plan", "Plan a gathering", "Social", "project", "users", ["Occasion", "Guest list", "Menu", "To-do", "Budget"]),
    mk("Gift Ideas", "Track gift ideas", "Social", "note", "spark", ["Person", "Ideas", "Budget", "Occasion"]),
    mk("Contact Log", "Remember a conversation", "Social", "note", "users", ["Who", "When", "What we discussed", "Follow up"]),
    mk("Party Checklist", "Throw an event", "Social", "review", "users", ["- [ ] Invites", "- [ ] Food", "- [ ] Music", "- [ ] Cleanup"]),
    mk("Weekly Admin", "Handle life admin", "Admin", "review", "repeat", ["- [ ] ", "Appointments", "Renewals", "Forms"]),
    mk("Document Checklist", "Organize paperwork", "Admin", "note", "repeat", ["- [ ] ", "Needed", "Filed", "Pending"]),
    mk("Subscription Audit", "Review subscriptions", "Admin", "review", "repeat", ["Service", "Cost", "Keep / Cancel", "Renewal date"]),
    mk("Quarterly Review", "Review the quarter", "Admin", "review", "repeat", ["Wins", "Misses", "Lessons", "Next quarter goals"]),
    mk("Year in Review", "Reflect on the year", "Personal", "review", "spark", ["Highlights", "Challenges", "Growth", "Next year theme"]),
    mk("Weekly Plan", "Plan your week", "Admin", "project", "repeat", ["Top 3 priorities", "- [ ] ", "Schedule", "Notes"]),
    mk("Daily Top 3", "Three things today", "Personal", "daily", "sun", ["- [ ] ", "- [ ] ", "- [ ] ", "Notes"]),
    mk("Mood Log", "Track your mood", "Personal", "review", "spark", ["Mood", "Energy", "What influenced it", "Note"]),
    mk("Problem Solving", "Work through a problem", "Work", "note", "layers", ["Problem", "Root cause", "Options", "Plan"]),
    mk("SWOT Analysis", "Strategic snapshot", "Work", "project", "layers", ["Strengths", "Weaknesses", "Opportunities", "Threats"]),
    mk("Pros and Cons", "Weigh a choice", "Personal", "note", "spark", ["Decision", "- Pros", "- Cons", "Verdict"]),
    mk("Vision Board", "Define your vision", "Personal", "project", "spark", ["1 year", "3 years", "Values", "Focus"]),
    mk("Skill Plan", "Learn a skill", "Study", "project", "book", ["Skill", "Why", "Resources", "Practice schedule", "Milestones"]),
    mk("Workout Split", "Plan a training week", "Health", "project", "dumbbell", ["Mon", "Tue", "Wed", "Thu", "Fri", "Weekend"]),
    mk("Recipe", "Save a recipe", "Personal", "note", "heart", ["Ingredients", "Steps", "Notes"]),
    mk("Cleaning Schedule", "Plan chores", "Errands", "project", "repeat", ["Daily", "Weekly", "Monthly"]),
    mk("Networking Notes", "After meeting someone", "Work", "meeting", "users", ["Name & role", "Where we met", "Topics", "Follow up"]),
    mk("Content Plan", "Plan content", "Build", "project", "layers", ["Topic", "Audience", "Outline", "Publish date"]),
    mk("Launch Plan", "Plan a launch", "Build", "project", "layers", ["What", "When", "Channels", "Checklist", "Success metrics"]),
    mk("Customer Feedback", "Capture feedback", "Work", "note", "users", ["Source", "Feedback", "Theme", "Action"]),
    mk("Experiment Log", "Run an experiment", "Build", "note", "layers", ["Hypothesis", "Method", "Result", "Conclusion"]),
    mk("Daily Standup Journal", "Personal standup", "Personal", "daily", "sun", ["Yesterday", "Today", "Blockers", "One win"]),
    mk("Focus Session Plan", "Plan deep work", "Work", "note", "layers", ["Objective", "Duration", "Distractions to remove", "Outcome"]),
    mk("Weekly Wins", "Celebrate progress", "Personal", "review", "spark", ["Wins", "Progress", "Gratitude", "Next week"]),
    mk("Goal Check-in", "Track a goal", "Personal", "review", "spark", ["Goal", "Progress", "Obstacles", "Adjustment"]),
    mk("Inbox Zero", "Process inbox", "Admin", "review", "repeat", ["- [ ] Reply", "- [ ] Delegate", "- [ ] Defer", "- [ ] Delete"]),
  ];
})();
// Third wave: power-user / custom pro templates (IOU ledgers, learning & university trackers, etc.)
const NOTE_TEMPLATE_PRO = (() => {
  const mk = (name, desc, category, type, icon, sections) => ({ id: "tpl-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, desc, category, type, icon, body: sections.map((s) => (s.startsWith("- ") || s.startsWith("> ") || s.startsWith("| ") || s.startsWith("```")) ? s : (s.includes("\n") || /^\d+\.\s/.test(s)) ? "# " + s : "# " + s + expandSection(s, type)).join("\n\n") });
  return [
    // Money / ledgers
    mk("IOU Ledger", "Track who owes whom", "Finance", "note", "repeat", ["People owe me\n- Name — amount — reason — date\n- ", "I owe\n- Name — amount — reason — date\n- ", "Settled\n- "]),
    mk("Shared Expenses", "Split costs with others", "Finance", "note", "repeat", ["Group", "Expenses\n- Item — paid by — amount — split\n- ", "Balances", "Settle-up plan"]),
    mk("Debt Payoff Tracker", "Crush your debts", "Finance", "project", "repeat", ["Debts\n- Name — balance — APR — min payment\n- ", "Strategy (snowball / avalanche)", "This month's target", "Progress"]),
    mk("Savings Tracker", "Hit a savings goal", "Finance", "project", "repeat", ["Goal & amount", "Deadline", "Monthly contribution", "Milestones\n- [ ] 25%\n- [ ] 50%\n- [ ] 75%\n- [ ] 100%"]),
    mk("Subscription Ledger", "All recurring charges", "Finance", "note", "repeat", ["Active\n- Service — cost — billing date — renew?\n- ", "To cancel", "Annual total"]),
    mk("Bill Splitter", "Split a bill fairly", "Finance", "note", "repeat", ["Total", "People", "Per-person share", "Who paid", "Owed back"]),
    mk("Crypto/Stock Watchlist", "Track positions", "Trading", "trading-journal", "chart", ["Holdings\n- Ticker — entry — size — current — P/L\n- ", "Watchlist", "Alerts", "Notes"]),
    mk("Side Income Log", "Track extra earnings", "Finance", "note", "repeat", ["Source\n- Date — source — amount\n- ", "Monthly total", "Goal"]),
    // Learning / skills
    mk("Learn Something New", "Track a new skill end-to-end", "Study", "project", "book", ["What I'm learning & why", "Resources\n- ", "Milestones\n- [ ] Beginner\n- [ ] Intermediate\n- [ ] Advanced", "Practice log\n- Date — what I did — minutes\n- ", "Reflections"]),
    mk("Skill Progress Tracker", "Measure improvement", "Study", "review", "book", ["Skill", "Current level (1-10)", "Target level", "Weekly practice", "Wins this week", "Next focus"]),
    mk("Course Tracker", "Work through a course", "Study", "project", "book", ["Course & platform", "Modules\n- [ ] \n- [ ] \n- [ ] ", "Notes per module", "Final project", "Certificate?"]),
    mk("Reading Tracker", "Books & progress", "Study", "note", "book", ["Currently reading\n- Title — page / total\n- ", "Up next", "Finished this year", "Key takeaways"]),
    mk("Language Learning", "Track a language", "Study", "study", "book", ["Language & level", "Daily streak", "New vocab\n- word — meaning\n- ", "Grammar points", "Speaking practice", "Resources"]),
    mk("Tutorial Notes", "Notes from a tutorial/video", "Study", "study", "book", ["Source & link", "Key steps\n1. \n2. ", "Code / commands", "Gotchas", "What to try next"]),
    mk("Concept Deep-Dive", "Master one concept", "Study", "study", "book", ["Concept", "Plain-English explanation", "Why it matters", "Example", "Related concepts\n- [[ ]]", "Open questions"]),
    mk("Skill Roadmap", "Plan a learning path", "Study", "project", "book", ["End goal", "Phase 1 — fundamentals\n- ", "Phase 2 — practice\n- ", "Phase 3 — projects\n- ", "Resources"]),
    mk("Practice Journal", "Daily deliberate practice", "Study", "review", "book", ["Date", "What I practised", "Minutes", "What felt hard", "Improvement for tomorrow"]),
    mk("Certification Prep", "Prep for an exam/cert", "Study", "project", "book", ["Cert name & date", "Topics\n- [ ] \n- [ ] ", "Weak areas", "Practice tests\n- Date — score", "Final review checklist"]),
    // University / school
    mk("University Course Hub", "One note per course", "Study", "project", "book", ["Course code & title", "Professor & office hours", "Syllabus overview", "Grading breakdown\n- ", "Important dates\n- ", "Resources"]),
    mk("Lecture Notes (Cornell)", "Cornell-method notes", "Study", "study", "book", ["Course & date", "Cues / Questions\n- ", "Notes\n- ", "Summary"]),
    mk("Assignment Tracker", "Track all assignments", "Study", "project", "book", ["Pending\n- Course — title — due — weight\n- ", "In progress", "Submitted", "Graded"]),
    mk("Exam Study Plan", "Plan for finals", "Study", "project", "book", ["Exam — date — course", "Topics to cover\n- [ ] ", "Study schedule\n- ", "Past papers done", "Formula sheet"]),
    mk("Research Paper Outline", "Structure a paper", "Study", "project", "book", ["Title / thesis", "Abstract", "Intro", "Literature review", "Method", "Results", "Discussion", "References"]),
    mk("Citation Manager", "Track sources", "Study", "note", "book", ["Sources\n- Author (year) — title — link — note\n- ", "To read", "Quotes to use"]),
    mk("Group Project Tracker", "Coordinate a team project", "Study", "project", "users", ["Project & deadline", "Members & roles", "Tasks\n- [ ] task — owner — due", "Meeting notes", "Deliverables"]),
    mk("Semester Planner", "Plan a whole semester", "Study", "project", "book", ["Courses this term", "Credit load", "Key deadlines\n- ", "Weekly schedule", "Goals & target GPA"]),
    mk("Grade Tracker", "Track grades & GPA", "Study", "review", "book", ["Courses\n- Course — assessment — weight — grade\n- ", "Current average", "Target", "What I need on finals"]),
    mk("Study Group Notes", "Notes from group study", "Study", "meeting", "users", ["Topic & date", "Who attended", "Key points", "Questions to ask prof", "Next session"]),
    mk("Office Hours Prep", "Questions for the prof", "Study", "note", "book", ["Course", "Questions\n- [ ] ", "Concepts I'm stuck on", "Follow-ups"]),
    mk("Class Schedule", "Weekly timetable", "Study", "note", "book", ["Mon\n- ", "Tue\n- ", "Wed\n- ", "Thu\n- ", "Fri\n- "]),
    mk("Thesis Tracker", "Manage a dissertation", "Study", "project", "book", ["Working title", "Research question", "Chapters\n- [ ] ", "Supervisor meetings", "Deadlines", "Word count"]),
    mk("Flashcard Deck", "Build a study deck", "Study", "study", "book", ["Topic", "- Q: \n- A: ", "- Q: \n- A: ", "- Q: \n- A: "]),
    mk("Internship Tracker", "Track applications", "Work", "project", "users", ["Applications\n- Company — role — applied — status\n- ", "Interviews", "Offers", "Follow-ups"]),
    // Productivity / planning
    mk("Second Brain Inbox", "Capture anything fast", "Personal", "note", "spark", ["Capture\n- ", "To process", "To file"]),
    mk("Weekly Time Audit", "Where time actually goes", "Admin", "review", "repeat", ["Categories", "Hours per category\n- Work — \n- Study — \n- Health — ", "Time wasters", "Adjustments"]),
    mk("Eisenhower Matrix", "Prioritise by urgency/importance", "Work", "project", "layers", ["Urgent + Important (do now)\n- ", "Important not urgent (schedule)\n- ", "Urgent not important (delegate)\n- ", "Neither (drop)\n- "]),
    mk("Brain Dump", "Clear your head", "Mindfulness", "note", "spark", ["Everything on my mind\n- ", "Next actions", "Can wait", "Let go"]),
    mk("Habit Tracker", "Build daily habits", "Health", "review", "repeat", ["Habits\n- [ ] \n- [ ] \n- [ ] ", "Streaks", "Why it matters", "Reward"]),
    mk("Monthly Review", "Reflect on the month", "Admin", "review", "repeat", ["Wins", "Lessons", "What I'll stop", "What I'll start", "Next month focus"]),
    mk("Goal Breakdown", "Break a big goal into steps", "Personal", "project", "spark", ["Goal", "Why", "Milestones\n- [ ] ", "First action", "Obstacles", "Deadline"]),
    mk("Decision Matrix", "Compare options objectively", "Work", "project", "layers", ["Options", "Criteria & weights", "Scores\n- Option A — \n- Option B — ", "Winner & why"]),
    mk("Project Retrospective", "Learn from a project", "Build", "review", "repeat", ["Project", "What went well", "What didn't", "Surprises", "Action items"]),
    mk("Weekly Intentions", "Set the week's tone", "Mindfulness", "review", "spark", ["Theme of the week", "Top 3 outcomes", "What I'll say no to", "How I want to feel"]),
    // Health / life
    mk("Symptom & Medication Log", "Track health over time", "Health", "note", "heart", ["Date", "Symptoms & severity", "Medication & dose", "Triggers", "What helped", "Doctor notes"]),
    mk("Meal Prep Planner", "Plan the week's food", "Health", "project", "heart", ["Mon\n- ", "Tue\n- ", "Wed\n- ", "Shopping list\n- [ ] ", "Prep day tasks"]),
    mk("Workout Program", "Multi-week training plan", "Health", "project", "dumbbell", ["Goal", "Split", "Week structure\n- Day 1 — \n- Day 2 — ", "Progression", "Deload week"]),
    mk("Water & Sleep Tracker", "Daily wellness basics", "Health", "review", "heart", ["Date", "Water (glasses)", "Sleep (hours & quality)", "Energy 1-10", "Notes"]),
    mk("Mood Journal", "Track emotional patterns", "Mindfulness", "review", "spark", ["Date", "Mood (1-10)", "What happened", "Thoughts", "What helped", "Gratitude"]),
    mk("Doctor Visit Prep", "Get ready for an appointment", "Health", "note", "heart", ["Reason for visit", "Symptoms timeline", "Questions\n- [ ] ", "Current meds", "After-visit notes"]),
    // Work / career
    mk("Meeting Agenda", "Run a tight meeting", "Work", "meeting", "users", ["Goal", "Attendees", "Agenda\n1. \n2. ", "Decisions", "Action items\n- [ ] owner — task"]),
    mk("Brag Document", "Track your wins for reviews", "Work", "review", "repeat", ["Wins this quarter\n- ", "Metrics & impact", "Feedback received", "Skills grown", "For next review"]),
    mk("Job Application Tracker", "Manage your search", "Work", "project", "users", ["Applied\n- Company — role — date — status\n- ", "Interviews", "Offers", "Rejections & learnings"]),
    mk("Networking CRM", "Remember your contacts", "Work", "note", "users", ["Contacts\n- Name — where met — topic — follow-up\n- ", "To reach out", "Follow-ups due"]),
    mk("1:1 Tracker", "Recurring manager 1:1s", "Work", "meeting", "users", ["Date", "Talking points\n- ", "Feedback", "Asks", "Action items", "Career notes"]),
    mk("Standup Log", "Daily dev standup", "Build", "note", "layers", ["Yesterday", "Today", "Blockers", "Notes"]),
    mk("Incident Postmortem", "Learn from an outage", "Build", "review", "layers", ["Summary", "Timeline", "Root cause", "Impact", "Action items\n- [ ] "]),
    mk("Feature Launch Plan", "Ship with confidence", "Build", "project", "layers", ["Feature", "Success metrics", "Rollout plan", "Checklist\n- [ ] ", "Comms", "Rollback"]),
    // Creative / personal
    mk("Content Calendar", "Plan posts & content", "Creative", "project", "layers", ["This week\n- Date — platform — idea — status\n- ", "Backlog", "Performing well", "Ideas"]),
    mk("Video Script", "Script a video", "Creative", "project", "layers", ["Hook", "Intro", "Main points\n- ", "CTA", "B-roll / visuals"]),
    mk("Blog Post Draft", "Write an article", "Creative", "project", "layers", ["Working title", "Audience & angle", "Outline\n- ", "Draft", "SEO keywords", "Publish checklist"]),
    mk("Story Idea", "Capture a creative idea", "Creative", "note", "spark", ["Logline", "Characters", "Setting", "Conflict", "Notes"]),
    mk("Gift Planner", "Plan gifts for people", "Social", "project", "users", ["People\n- Name — occasion — idea — budget — bought?\n- ", "Ideas vault", "Important dates"]),
    mk("Trip Itinerary", "Plan a trip day-by-day", "Travel", "project", "spark", ["Destination & dates", "Bookings\n- Flight — \n- Hotel — ", "Day 1\n- ", "Day 2\n- ", "Packing\n- [ ] ", "Budget"]),
    mk("Packing Checklist", "Never forget essentials", "Travel", "note", "spark", ["Essentials\n- [ ] Passport\n- [ ] Charger\n- [ ] Meds", "Clothes\n- [ ] ", "Tech\n- [ ] ", "Toiletries\n- [ ] "]),
    mk("Bucket List", "Life goals & dreams", "Personal", "project", "spark", ["Experiences\n- [ ] ", "Places\n- [ ] ", "Skills\n- [ ] ", "Done ✓"]),
    mk("Home Inventory", "Track belongings", "Home", "note", "spark", ["Room\n- Item — value — warranty — note\n- ", "Warranties expiring", "To replace"]),
    mk("Recipe Card", "Save a recipe", "Home", "note", "heart", ["Dish", "Ingredients\n- ", "Steps\n1. ", "Servings & time", "Notes / tweaks"]),
    mk("Cleaning Rota", "Household cleaning plan", "Home", "project", "repeat", ["Daily\n- [ ] ", "Weekly\n- [ ] ", "Monthly\n- [ ] ", "Who does what"]),
    mk("Car / Vehicle Log", "Maintenance & expenses", "Admin", "note", "repeat", ["Vehicle", "Service history\n- Date — service — cost — mileage\n- ", "Insurance & renewals", "Fuel log"]),
    mk("Plant Care", "Keep plants alive", "Home", "note", "heart", ["Plants\n- Name — water schedule — light — note\n- ", "Watered on", "Issues"]),
    mk("Pet Care Log", "Track a pet's needs", "Personal", "note", "heart", ["Pet", "Feeding", "Vet visits\n- Date — reason — note", "Meds", "Grooming"]),
    mk("Event Planning", "Plan an event", "Social", "project", "users", ["Event & date", "Guest list", "Budget", "To-do\n- [ ] ", "Vendors", "Timeline"]),
    mk("Daily Reflection", "End-of-day journal", "Mindfulness", "daily", "sun", ["3 wins today", "What I'm grateful for", "What I learned", "Tomorrow's #1", "Mood"]),
    mk("Morning Routine", "Start the day with intention", "Mindfulness", "daily", "sun", ["Today's intention", "Top 3 priorities\n- [ ] ", "Schedule", "Energy & mood", "One thing I'm excited about"]),
  ];
})();
const NOTE_TEMPLATE_BLOCKS = [
  { id: "tpl-metrics", name: "Weekly Metrics", desc: "Bar + line charts of your week", category: "Admin", type: "review", icon: "chart", body: "# Weekly Metrics\n\n> [!info] Edit the numbers — charts redraw live in Preview.\n\n## Tasks completed\n```chart\ntype: bar\ntitle: Completed per day\nMon: 4\nTue: 6\nWed: 3\nThu: 7\nFri: 5\nSat: 2\nSun: 1\n```\n\n## Focus trend\n```chart\ntype: line\ntitle: Deep work hours\nW1: 8\nW2: 11\nW3: 9\nW4: 14\n```\n\n## Takeaway\n- " },
  { id: "tpl-brainstorm", name: "Brainstorm Map", desc: "Idea → branches → next steps", category: "Creative", type: "project", icon: "spark", body: "# Brainstorm\n\n> [!idea] Dump everything first. Judge later.\n\n```flow\nProblem -> Idea A -> Quick win\nProblem -> Idea B -> Needs research\nProblem -> Idea C -> Park it\n```\n\n## Raw ideas\n- \n- \n\n## Top pick & why\n==  ==\n\n## Next actions\n- [ ] " },
  { id: "tpl-habits", name: "Habit Tracker", desc: "Progress bars for the month", category: "Personal", type: "review", icon: "repeat", body: "# Habits — this month\n\n```progress\nGym sessions: 40\nReading: 65\nMeditation: 25\nNo junk food: 80\n```\n\n> [!tip] Update the numbers every Sunday night.\n\n## Notes\n" },
  { id: "tpl-decision", name: "Decision Matrix", desc: "Compare options side by side", category: "Admin", type: "note", icon: "book", body: "# Decision: \n\n| Option | Pros | Cons | Score |\n| --- | --- | --- | --- |\n| A | | | /10 |\n| B | | | /10 |\n| C | | | /10 |\n\n```flow\nGather options -> Score -> Sleep on it -> Decide -> Commit\n```\n\n> [!warn] Set a deadline for this decision: \n\n## Verdict\n**Going with:** " },
  { id: "tpl-trade-pro", name: "Trade Review Pro", desc: "Journal with R-curve + rules check", category: "Trading", type: "trading-journal", icon: "chart", body: "# Trade Review — \n\n## Setup\n| Field | Value |\n| --- | --- |\n| Instrument | XAUUSD |\n| Direction | |\n| Entry | |\n| Stop | |\n| Target | |\n| Risk (R) | 1 |\n\n## Equity curve (R)\n```chart\ntype: line\ntitle: Last 6 trades\nT1: 1\nT2: 2\nT3: 0.5\nT4: 2.5\nT5: 1.5\nT6: 3\n```\n\n## Rules check\n- [ ] Waited for confirmation\n- [ ] Risk ≤ 1%\n- [ ] No revenge trading\n- [ ] Journaled same day\n\n> [!warn] Break a rule → halve size next trade.\n\n## Lesson\n==  ==" },
  { id: "tpl-kickoff", name: "Project Kickoff Pro", desc: "Scope, phases, owners, risks", category: "Build", type: "project", icon: "layers", body: "# Project: \n\n## One-liner\n> \n\n## Phases\n```flow\nScope -> Build -> Test -> Polish -> Ship\n```\n\n## Workstream status\n```progress\nDesign: 10\nBuild: 0\nTesting: 0\n```\n\n## Owners\n| Area | Owner | Due |\n| --- | --- | --- |\n| | | |\n\n> [!danger] Biggest risk: \n\n## Definition of done\n- [ ] \n- [ ] " },
];
/* ---- template enrichment: upgrade generated templates with pro blocks ----
   · bullets that spell out columns ("- Name — amount — reason — date") become real tables
   · each template type opens with a matching callout
   · trackers gain a progress block; roadmaps/pipelines gain a flow diagram */
const TPL_TYPE_CALLOUT = {
  "trading-journal": "> [!warn] Risk ≤ 1% — process over outcome.",
  review: "> [!tip] Be honest — this note is for future you.",
  project: "> [!idea] Define \"done\" before you start.",
  "workout-log": "> [!done] Showing up beats the perfect session.",
  meeting: "> [!info] Capture decisions *and* owners.",
  study: "> [!tip] Write it like you'll teach it tomorrow.",
};
function enrichTemplate(t) {
  let body = t.body;
  // 1) column-hint bullets → real markdown tables
  body = body.split("\n\n").map((sec) => {
    const lines = sec.split("\n");
    const hint = lines.find((l) => /^- [^[].* — .+/.test(l));
    if (!hint) return sec;
    const cols = hint.replace(/^- /, "").split("—").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2 || cols.length > 6 || cols.some((c) => c.length > 26 || c.includes("["))) return sec;
    const cap = (c) => c.charAt(0).toUpperCase() + c.slice(1);
    const head = "| " + cols.map(cap).join(" | ") + " |";
    const sepr = "| " + cols.map(() => "---").join(" | ") + " |";
    const empt = "| " + cols.map(() => " ").join(" | ") + " |";
    const kept = lines.filter((l) => l !== hint && l.trim() !== "-" && l.trim() !== "");
    return [...kept, head, sepr, empt].join("\n");
  }).join("\n\n");
  // 2) name-matched block scaffolds (only if no block present yet)
  const n = t.name.toLowerCase();
  if (!body.includes("```")) {
    if (/tracker|streak/.test(n) && !body.includes("|")) body += "\n\n# At a glance\n```progress\nOverall: 0\n```";
    else if (/roadmap|pipeline|workflow|funnel/.test(n)) body += "\n\n# Flow\n```flow\nStart -> In progress -> Done\n```";
  }
  // 3) opening callout by type
  const co = TPL_TYPE_CALLOUT[t.type];
  if (co && !body.startsWith(">")) body = co + "\n\n" + body;
  return { ...t, body };
}
const NOTE_TEMPLATE_ALL = NOTE_TEMPLATE_DEFS.concat(NOTE_TEMPLATE_EXTRA.map(enrichTemplate), NOTE_TEMPLATE_PRO.map(enrichTemplate), NOTE_TEMPLATE_BLOCKS);
function TemplatesPage({ T, S, catColor, categories, onTask, onNote }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);
  const list = NOTE_TEMPLATE_ALL.filter((tp) => (!cat || tp.category === cat) && (!q || fuzzy(q, tp.name) || fuzzy(q, tp.desc) || fuzzy(q, tp.category)));
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Templates" sub={`${NOTE_TEMPLATE_ALL.length} templates — one tap to create`} icon={IconLayers} tint="#D946EF" scene="layers" />
      <div style={{ fontWeight: 700, fontSize: 14, color: T.text2, marginTop: 4 }}>Quick task templates</div>
      <div style={S.notesGrid}>
        {TASK_TEMPLATES.map((tp, i) => (
          <button key={i} className="notecard focusable" onClick={() => onTask({ ...tp, notes: "", recurring: { enabled: false, days: [] }, completedDates: [] })}
            style={{ ...S.noteCard, minHeight: 96, cursor: "pointer", borderLeft: `3px solid ${catColor(tp.category)}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{tp.title}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, fontSize: 12, color: T.muted }}>
              <span style={{ ...S.miniChip, color: catColor(tp.category), borderColor: hexA(catColor(tp.category), 0.4) }}><CatIcon id={tp.category} w={11} /> {tp.category}</span>
              <span><IconClock /> {to12(tp.time)}</span><span>{tp.durationMinutes}m</span>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 12, color: T.purple, fontWeight: 600 }}>+ Add to Today</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: T.text2 }}>Note templates</div>
        <span style={{ fontSize: 12.5, color: T.muted }}>{list.length}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "0 12px", minWidth: 200 }}>
          <IconSearch w={15} /><input style={{ ...S.input, border: "none", background: "transparent", padding: "9px 0" }} placeholder="Search 100+ templates…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search templates" />
        </div>
      </div>
      <div style={S.chipRow}>
        <button className="chip focusable" onClick={() => setCat(null)} aria-pressed={!cat} style={{ ...S.chip, ...(!cat ? { borderColor: T.purple, color: T.text, background: T.accentWash } : null) }}>All</button>
        {categories.map((c) => { const on = cat === c.id; return <button key={c.id} className="chip focusable" onClick={() => setCat(on ? null : c.id)} aria-pressed={on} style={{ ...S.chip, ...(on ? { borderColor: c.color, background: hexA(c.color, 0.14), color: T.text } : null) }}><CatIcon id={c.id} w={12} color={c.color} /> {c.id}</button>; })}
      </div>
      <div style={S.notesGrid}>
        {list.map((tp) => (
          <button key={tp.id} className="notecard focusable" onClick={() => onNote({ title: tp.type === "daily" ? "" : "", body: tp.body, category: tp.category, type: tp.type, collectionId: (tp.category || "").toLowerCase() })} style={{ ...S.noteCard, minHeight: 104, cursor: "pointer", borderLeft: `3px solid ${catColor(tp.category)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: T.text }}><CollectionIcon icon={tp.icon} w={15} /> {tp.name}</div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>{tp.desc}</div>
            <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...S.miniChip, color: catColor(tp.category), borderColor: hexA(catColor(tp.category), 0.4) }}><CatIcon id={tp.category} w={11} /> {tp.category}</span>
              <span style={{ fontSize: 11.5, color: T.pink, fontWeight: 600 }}>+ Create</span>
            </div>
          </button>
        ))}
        {list.length === 0 && <Empty T={T} text="No templates match." />}
      </div>
    </PageWrap>
  );
}

/* ---- Tables page (tracker) ---- */
function TablesPage({ T, S, tables, setTables }) {
  const addRow = (tid) => setTables((p) => p.map((t) => t.id === tid ? { ...t, rows: [...t.rows, t.columns.map(() => "")] } : t));
  const delRow = (tid, ri) => setTables((p) => p.map((t) => t.id === tid ? { ...t, rows: t.rows.filter((_, i) => i !== ri) } : t));
  const editCell = (tid, ri, ci, v) => setTables((p) => p.map((t) => t.id === tid ? { ...t, rows: t.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? v : c) : r) } : t));
  const addTable = () => setTables((p) => [...p, { id: uid(), name: "New Tracker", columns: ["Column 1", "Column 2"], rows: [["", ""]] }]);
  const delTable = (tid) => setTables((p) => p.filter((t) => t.id !== tid));
  const renameTable = (tid, name) => setTables((p) => p.map((t) => t.id === tid ? { ...t, name } : t));
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Tables" sub="Editable trackers, auto-saved" icon={IconTable} tint="#38BDF8" scene="city" />
      {tables.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 4 }}>
          <button className="gradbtn focusable" style={S.gradBtn} onClick={addTable}><IconPlus /> New table</button>
        </div>
      )}
      {tables.length === 0 && <EmptyState T={T} S={S} kind="tables" title="No trackers yet" sub="Build a simple table to track trades, habits, expenses, or anything else. It saves automatically." actionLabel="Create a table" onAction={addTable} />}
      {tables.map((t) => (
        <Card S={S} key={t.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <input value={t.name} onChange={(e) => renameTable(t.id, e.target.value)} style={{ ...S.input, fontWeight: 700, fontSize: 16, width: "auto", flex: 1, background: "transparent", border: "none", padding: 4 }} aria-label="Table name" />
            <button className="link focusable" style={{ ...S.link, color: "#FB7185" }} onClick={() => delTable(t.id)}>Delete table</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead><tr>{t.columns.map((c, i) => <th key={i} style={S.th}>{c}</th>)}<th style={S.th}></th></tr></thead>
              <tbody>
                {t.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((cell, ci) => <td key={ci} style={S.td}><input value={cell} onChange={(e) => editCell(t.id, ri, ci, e.target.value)} style={S.cellInput} aria-label={`${t.columns[ci]} row ${ri + 1}`} /></td>)}
                    <td style={S.td}><button className="link focusable" style={{ ...S.link, color: "#FB7185" }} onClick={() => delRow(t.id, ri)} aria-label="Delete row">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="addtask focusable" style={{ ...S.addTask, marginTop: 12, maxWidth: 160 }} onClick={() => addRow(t.id)}><IconPlus w={14} /> Add row</button>
        </Card>
      ))}
    </PageWrap>
  );
}

/* ---- Categories page ---- */
function CategoriesPage({ T, S, categories, catColor, tasks }) {
  const counts = useMemo(() => { const m = {}; tasks.forEach((t) => { m[t.category] = (m[t.category] || 0) + 1; }); return m; }, [tasks]);
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Categories" sub="Your tasks by category" icon={IconTag} tint="#FB923C" scene="bloom" />
      <div style={S.cardGrid}>
        {categories.map((c) => {
          const n = counts[c.id] || 0;
          const sc = (CAT_SCENE[c.id] || { grad: [c.color, T.pink, T.fuchsia] }).grad;
          return (
            <div className="luxcard catCard" key={c.id} style={{ position: "relative", borderRadius: 20, overflow: "hidden", height: 168, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, background: T.panel }}>
              {/* gradient that fills the card and fades smoothly into the dark base — no hard seam */}
              <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${sc[0]} 0%, ${sc[1]} 42%, ${sc[2]} 78%)`, WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 38%, transparent 82%)", maskImage: "linear-gradient(180deg, #000 0%, #000 38%, transparent 82%)" }}>
                <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.16), transparent 40%)" }} />
              </div>
              {/* contained motif art — centred in the upper band, fully visible, soft */}
              <div aria-hidden style={{ position: "absolute", top: 16, right: 16, width: 88, height: 88, opacity: 0.92, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.28))" }}>
                <svg viewBox="80 18 76 76" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet"><CatSceneArt id={c.id} /></svg>
              </div>
              {/* count — top-left, clean, on the brightest part */}
              <div style={{ position: "absolute", top: 14, left: 18, zIndex: 3, fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: "0 2px 14px rgba(0,0,0,0.45)", fontVariantNumeric: "tabular-nums" }}>{n}</div>
              {/* content block — bottom, on the dark area */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 16px 15px", zIndex: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                  <CatBadge T={T} id={c.id} color={c.color} size={42} iconW={21} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.2, color: T.text }}>{c.id}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{n} task{n === 1 ? "" : "s"}</div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: hexA("#000000", 0.35), overflow: "hidden" }}><div className="bar" style={{ width: `${Math.min(100, n * 12)}%`, background: c.color, boxShadow: `0 0 8px ${hexA(c.color, 0.6)}` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, color: T.vmuted, marginTop: 6 }}>Editing category names/colours is read-only for now to keep existing tasks safe.</div>
    </PageWrap>
  );
}

/* ---- Analytics page ---- */
function AnalyticsPage({ T, S, catColor, tasks, days, tasksOnDate, momentum }) {
  const last14 = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), -(13 - i))), []);
  const doneSeries = last14.map((d) => tasksOnDate(toKey(d)).filter((t) => isComplete(t, toKey(d))).length);
  const focusSeries = last14.map((d) => tasksOnDate(toKey(d)).filter((t) => isComplete(t, toKey(d))).reduce((s, t) => s + (t.durationMinutes || 0), 0));
  const catTotals = useMemo(() => { const m = {}; tasks.forEach((t) => { const done = t.recurring?.enabled ? (t.completedDates || []).length : (t.completed ? 1 : 0); if (done) m[t.category] = (m[t.category] || 0) + done; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [tasks]);
  const catMax = Math.max(1, ...catTotals.map(([, n]) => n));
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Analytics" sub="Completed tasks, focus and consistency" icon={IconChart} tint="#34D399" scene="bars" />
      {(() => {
        const done14 = doneSeries.reduce((s, v) => s + v, 0);
        const focus14 = focusSeries.reduce((s, v) => s + v, 0);
        return (
          <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            <StatTile T={T} S={S} icon={<IconCheck w={16} />} tint="#A855F7" label="Completed" value={<CountUp value={done14} />} sub="last 14 days" viz={<Sparkline T={T} data={doneSeries} color="#A855F7" />} />
            <StatTile T={T} S={S} icon={<IconClock w={15} />} tint={T.pink} label="Focus" value={`${Math.floor(focus14 / 60)}h ${focus14 % 60}m`} sub="last 14 days" viz={<Sparkline T={T} data={focusSeries} color={T.pink} />} />
            <StatTile T={T} S={S} icon={<IconFlame w={15} />} tint="#FB923C" label="Streak" value={momentum.streak} sub={momentum.streak === 1 ? "day" : "days"} viz={<DotRow data={momentum.bars} color="#FB923C" />} />
          </div>
        );
      })()}
      <Card S={S}><CardHead S={S} T={T} title="Completed — last 14 days" icon={<IconCheck w={14} />} tint="#A855F7" /><BarChart T={T} data={doneSeries} labels={last14.map((d) => d.getDate())} height={150} highlightLast={false} /></Card>
      <Card S={S}><CardHead S={S} T={T} title="Focus minutes — last 14 days" icon={<IconClock w={14} />} tint={T.pink} /><BarChart T={T} data={focusSeries} labels={last14.map((d) => d.getDate())} height={150} highlightLast={false} /></Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-2col">
        <Card S={S}><CardHead S={S} T={T} title="This week consistency" icon={<IconFlame w={14} />} tint="#FB923C" /><BarChart T={T} data={momentum.bars} labels={WD} height={140} /></Card>
        <Card S={S}>
          <CardHead S={S} T={T} title="Completed by category" icon={<IconTag w={14} />} tint="#A855F7" />
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
            {catTotals.length === 0 && <Empty T={T} text="No completions yet" />}
            {catTotals.map(([cat, n]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <CatIcon id={cat} w={13} color={catColor(cat)} /><span style={{ fontSize: 12.5, color: T.text2, width: 80 }}>{cat}</span>
                <div style={S.barTrack}><div className="bar" style={{ width: `${(n / catMax) * 100}%`, background: catColor(cat) }} /></div>
                <span style={{ fontSize: 12.5, color: T.muted, width: 20, textAlign: "right" }}>{n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrap>
  );
}

/* ---- Settings page ---- */
function SettingsPage({ T, S, settings, setTheme, onExport, onImport, onReset, onClear, taskCount, noteCount, storageWarn, lsAvailable }) {
  const themes = [["dark", "Dark"], ["light", "Light"], ["system", "System"], ["high-contrast", "High contrast"]];
  return (
    <PageWrap S={S}>
      <PageHead T={T} title="Settings" sub="Theme, data and backups" icon={IconGear} tint="#B66BFF" scene="stars" />
      <Card S={S}>
        <CardHead S={S} T={T} title="Appearance" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          {themes.map(([id, label]) => (
            <button key={id} className="focusable" onClick={() => setTheme(id)} style={{ ...S.segBtn, flex: "0 0 auto", padding: "10px 18px", ...(settings.theme === id ? S.segActive : null) }}>{label}</button>
          ))}
        </div>
      </Card>
      <Card S={S}>
        <CardHead S={S} T={T} title="Data & backup" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button className="pillbtn focusable" style={S.pill} onClick={onExport}><IconExport w={15} /> Export backup</button>
          <button className="pillbtn focusable" style={S.pill} onClick={onImport}><IconImport w={15} /> Import backup</button>
          <button className="pillbtn focusable" style={S.pill} onClick={onReset}>Reset to samples</button>
          <button className="dangerbtn focusable" style={S.dangerBtn} onClick={onClear}>Clear all data</button>
        </div>
      </Card>
      <Card S={S}>
        <CardHead S={S} T={T} title="Storage status" />
        <div style={{ marginTop: 12, fontSize: 13.5, color: T.text2, lineHeight: 1.8 }}>
          <div>Persistence: {lsAvailable ? "localStorage (saved across refreshes)" : "in-memory fallback (this session only — export to keep data)"}</div>
          <div>Tasks stored: {taskCount} · Notes stored: {noteCount}</div>
          {storageWarn && <div style={{ color: "#FB7185" }}>⚠ A recent save failed (storage full or blocked).</div>}
          <div style={{ color: T.vmuted, fontSize: 12 }}>Keys: planner_tasks_v1, planner_notes_v1, planner_settings_v1, planner_categories_v1, planner_theme, planner_tables_v1</div>
        </div>
      </Card>
      <Card S={S}>
        <CardHead S={S} T={T} title="About" />
        <div style={{ marginTop: 10, fontSize: 13.5, color: T.text2 }}>Week Planner — LifeOS. A premium offline-first weekly planner. Plan your week. Build your life.</div>
      </Card>
    </PageWrap>
  );
}

/* ---- Recent notes strip ---- */
function NotesSection({ T, S, catColor, notes, onOpen, onNew, onViewAll, onDailyToday }) {
  return (
    <div style={S.notesWrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Recent Notes</div>
        <div style={{ display: "flex", gap: 8 }}>
          {onDailyToday && <button className="pillbtn focusable" style={{ ...S.pill, padding: "6px 12px" }} onClick={onDailyToday}><IconSunDay w={14} /> Daily note</button>}
          <button className="link focusable" style={S.link} onClick={onViewAll}>View all</button>
        </div>
      </div>
      <div className="notesrow scrollarea" style={S.notesRow}>
        {notes.map((n) => (
          <button key={n.id} className="notecard focusable" onClick={() => onOpen(n)} style={{ ...S.noteCard, borderLeft: `3px solid ${catColor(n.category)}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: catColor(n.category) }}><NoteTypeIcon type={n.type} w={13} /></span>{n.pinned && <IconPin w={12} />}{n.title}</div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, display: "flex", gap: 8 }}>{relDate(n.updatedAt)}{n.linkedDate && <span style={{ color: T.purple, display: "inline-flex", alignItems: "center", gap: 3 }}><IconCal w={10} /> {MO[fromKey(n.linkedDate).getMonth()]} {fromKey(n.linkedDate).getDate()}</span>}</div>
            <div style={S.notePreview}>{mdSnippet(n.body)}</div>
            {n.category && <div style={{ marginTop: "auto", paddingTop: 10 }}><span style={{ ...S.miniChip, color: catColor(n.category), borderColor: hexA(catColor(n.category), 0.4) }}><span style={{ ...S.dot, background: catColor(n.category) }} /> {n.category}</span></div>}
          </button>
        ))}
        <button className="newnote focusable" onClick={onNew} style={S.newNote}><div style={S.newNotePlus}><IconPlus w={22} /></div><div style={{ fontWeight: 700, color: T.pink }}>New Note</div></button>
      </div>
    </div>
  );
}

/* ============================================================
   11. MODALS
   ============================================================ */
function TaskModal({ T, S, categories, catColor, data, notes, onClose, onSave, onDelete, onMove, today, onOpenNote, onAddLinkedNote, onReviewNote }) {
  const isNew = !data.id;
  const ref = useFocusTrap(onClose);
  const [f, setF] = useState({
    id: data.id, title: data.title || "", date: data.date || toKey(new Date()),
    category: data.category || (categories[0] && categories[0].id) || "Personal", time: data.time || "",
    durationMinutes: data.durationMinutes || 30, priority: data.priority || "medium", notes: data.notes || "",
    recurring: data.recurring || { enabled: false, days: [] }, completedDates: data.completedDates || [],
    linkedNoteIds: data.linkedNoteIds || [], _linkNoteId: data._linkNoteId,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleDay = (d) => setF((s) => { const days = new Set(s.recurring.days); days.has(d) ? days.delete(d) : days.add(d); return { ...s, recurring: { ...s.recurring, days: [...days].sort() } }; });
  const save = () => { if (!f.title.trim()) return; onSave({ ...f, title: f.title.trim() }); };
  const dayLetters = [["S", 0], ["M", 1], ["T", 2], ["W", 3], ["T", 4], ["F", 5], ["S", 6]];
  const linkedNotes = (notes || []).filter((n) => (f.linkedNoteIds || []).includes(n.id) || (n.linkedTaskIds || []).includes(f.id));
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} className="formModal" style={S.modal} role="dialog" aria-modal="true" aria-label={isNew ? "New task" : "Edit task"} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}><div style={{ fontWeight: 800, fontSize: 18 }}>{isNew ? "New Task" : "Edit Task"}</div><button className="iconbtn focusable" style={S.iconBtn} onClick={onClose} aria-label="Close"><IconX /></button></div>
        <div className="scrollarea" style={S.modalBody}>
        <Field T={T} label="Title"><input autoFocus style={S.input} value={f.title} onChange={(e) => set("title", e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="Task title" /></Field>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Field T={T} label="Date" flex><input type="date" style={{ ...S.input, ...S.dateInput }} value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <Field T={T} label="Time" flex><input type="time" style={{ ...S.input, ...S.dateInput }} value={f.time} onChange={(e) => set("time", e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Field T={T} label="Category" flex><select style={{ ...S.input, ...S.dateInput }} value={f.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}</select></Field>
          <Field T={T} label="Focus (min)" flex><input type="number" min="0" step="5" style={{ ...S.input, ...S.dateInput }} value={f.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} /></Field>
        </div>
        <Field T={T} label="Priority">
          <div style={{ display: "flex", gap: 8 }}>{["low", "medium", "high"].map((p) => <button key={p} className="focusable" onClick={() => set("priority", p)} style={{ ...S.segBtn, ...(f.priority === p ? S.segActive : null) }}>{p[0].toUpperCase() + p.slice(1)}</button>)}</div>
        </Field>
        <Field T={T} label="Notes"><textarea style={{ ...S.input, minHeight: 64, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes…" /></Field>
        <div style={{ background: T.panel2, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: T.text2, fontSize: 13.5, cursor: "pointer", fontWeight: 600 }}>
            <input type="checkbox" checked={f.recurring.enabled} onChange={(e) => set("recurring", { ...f.recurring, enabled: e.target.checked })} /> <IconRepeat w={14} /> Recurring task
          </label>
          {f.recurring.enabled && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Repeats on</div>
              <div style={{ display: "flex", gap: 6 }}>
                {dayLetters.map(([L, d], i) => { const on = f.recurring.days.includes(d); return <button key={i} className="focusable" onClick={() => toggleDay(d)} aria-pressed={on} aria-label={`Toggle day ${d}`} style={{ ...S.dayToggle, ...(on ? S.dayToggleOn : null) }}>{L}</button>; })}
              </div>
              <div style={{ fontSize: 11.5, color: T.vmuted, marginTop: 8 }}>Completion is tracked per day, and recurring tasks don't pile up as carryover.</div>
            </div>
          )}
        </div>
        {/* Linked notes */}
        {!isNew && (
          <div style={{ background: T.panel2, borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, color: T.text2, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><IconNote w={13} /> Linked notes {linkedNotes.length > 0 && `(${linkedNotes.length})`}</div>
            </div>
            {linkedNotes.length === 0 && <div style={{ fontSize: 12, color: T.vmuted, marginBottom: 8 }}>No notes linked yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {linkedNotes.map((n) => (
                <button key={n.id} className="focusable" onClick={() => onOpenNote(n)} style={{ display: "flex", alignItems: "center", gap: 8, background: T.elevated, border: `1px solid ${T.border}`, borderLeft: `3px solid ${catColor(n.category)}`, borderRadius: 10, padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>
                  <NoteTypeIcon type={n.type} w={13} /><span style={{ flex: 1, fontSize: 12.5, color: T.text }}>{n.title}</span><IconArrowRight w={13} style={{ color: T.muted }} />
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="pillbtn focusable" style={{ ...S.pill, padding: "7px 12px", fontSize: 12.5 }} onClick={() => onAddLinkedNote({ ...f })}><IconPlus w={13} /> Add linked note</button>
              <button className="pillbtn focusable" style={{ ...S.pill, padding: "7px 12px", fontSize: 12.5 }} onClick={() => onReviewNote({ ...f })}>Create review note</button>
            </div>
          </div>
        )}
        </div>
        <div style={S.modalFoot}>
          {!isNew && <button className="dangerbtn focusable" style={S.dangerBtn} onClick={() => onDelete(f.id)}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="pillbtn focusable" style={S.pill} onClick={onClose}>Cancel</button>
          <button className="gradbtn focusable" style={{ ...S.gradBtn, opacity: f.title.trim() ? 1 : 0.5 }} onClick={save}>{isNew ? "Add task" : "Save"}</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ============================================================
   PRO NOTES — RICH RENDERER SUITE
   inline: **bold** *italic* __underline__ ~~strike~~ ==highlight==
           `code` [text](url) [[wiki]] #tag
   blocks: ```chart ```flow ```progress ```code, tables, callouts,
           nested + numbered lists, headings, quotes, dividers
   ============================================================ */
const CHART_PALETTE = ["#A855F7", "#F472B6", "#38BDF8", "#34D399", "#FACC15", "#FB923C", "#E879F9", "#2DD4BF"];
function mdInline(text, opts = {}) {
  const parts = [];
  let rest = text, key = 0;
  const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|~~([^~]+)~~|==([^=]+)==|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\[\[([^\]]+)\]\]|(^|\s)#([a-z0-9][a-z0-9-]*))/i;
  let m;
  while ((m = rest.match(re))) {
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    if (m[2]) parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3]) parts.push(<u key={key++} style={{ textUnderlineOffset: 3 }}>{m[3]}</u>);
    else if (m[4]) parts.push(<em key={key++}>{m[4]}</em>);
    else if (m[5]) parts.push(<s key={key++} style={{ opacity: 0.75 }}>{m[5]}</s>);
    else if (m[6]) parts.push(<mark key={key++} style={{ background: "linear-gradient(120deg, rgba(250,204,21,0.35), rgba(244,114,182,0.3))", color: "inherit", padding: "0 4px", borderRadius: 4 }}>{m[6]}</mark>);
    else if (m[7]) parts.push(<code key={key++} style={{ fontFamily: "monospace", fontSize: "0.9em", background: "rgba(168,85,247,0.14)", padding: "1px 5px", borderRadius: 5 }}>{m[7]}</code>);
    else if (m[8] && m[9]) parts.push(<a key={key++} href={m[9]} target="_blank" rel="noopener noreferrer" style={{ color: "#38BDF8", textDecorationColor: "rgba(56,189,248,0.5)", textUnderlineOffset: 2 }}>{m[8]}</a>);
    else if (m[10]) { const title = m[10]; parts.push(opts.onWiki ? <button key={key++} className="focusable wikilink" onClick={() => opts.onWiki(title)} style={{ all: "unset", cursor: "pointer", color: opts.wikiColor || "#A855F7", textDecoration: "underline", textUnderlineOffset: 2 }}>{title}</button> : <span key={key++} style={{ color: "#A855F7" }}>{title}</span>); }
    else if (m[12]) { if (m[11]) parts.push(m[11]); parts.push(<span key={key++} style={{ color: "#A855F7", fontWeight: 600 }}>#{m[12]}</span>); }
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) parts.push(rest);
  return parts;
}
/* ---- parse "Label: value" data lines + "key: value" params ---- */
function parseBlockData(lines) {
  const params = {}, data = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*([^:]+):\s*(.+)\s*$/);
    if (!m) continue;
    const k = m[1].trim(), v = m[2].trim();
    const num = Number(String(v).replace(/[%,$]/g, ""));
    if (["type", "title", "max", "unit"].includes(k.toLowerCase())) params[k.toLowerCase()] = v;
    else if (!isNaN(num)) data.push({ label: k, value: num });
  }
  return { params, data };
}
function ChartBlock({ T, lines }) {
  const { params, data } = parseBlockData(lines);
  const type = (params.type || "bar").toLowerCase();
  if (!data.length) return <div style={{ padding: 12, border: `1px dashed ${T.border}`, borderRadius: 12, color: T.vmuted, fontSize: 12.5 }}>Chart needs data lines like <code>Mon: 5</code></div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 560, H = 190, PADL = 8, PADB = 26, PADT = 22;
  const title = params.title && <div style={{ fontWeight: 800, fontSize: 13.5, color: T.text, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: T.brandGrad }} />{params.title}</div>;
  if (type === "pie" || type === "donut") {
    const total = data.reduce((a, d) => a + d.value, 0) || 1;
    const R = 56, CIRC = 2 * Math.PI * R;
    let acc = 0;
    return (
      <div className="mdBlock" style={{ margin: "12px 0" }}>{title}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="75" cy="75" r={R} fill="none" stroke={T.panel2} strokeWidth="26" />
            {data.map((d, i) => {
              const frac = d.value / total, off = acc; acc += frac;
              return <circle key={i} className="pieSeg" style={{ animationDelay: `${i * 90}ms` }} cx="75" cy="75" r={R} fill="none"
                stroke={CHART_PALETTE[i % CHART_PALETTE.length]} strokeWidth="26"
                strokeDasharray={`${Math.max(0.5, frac * CIRC - 1.5)} ${CIRC}`} strokeDashoffset={-off * CIRC} strokeLinecap="butt" />;
            })}
            <circle cx="75" cy="75" r="34" fill={T.popover} />
          </svg>
          <div style={{ display: "grid", gap: 6 }}>
            {data.map((d, i) => (
              <div key={i} className="legendRow" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, animationDelay: `${i * 70}ms` }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: CHART_PALETTE[i % CHART_PALETTE.length], boxShadow: `0 0 8px ${hexA(CHART_PALETTE[i % CHART_PALETTE.length], 0.5)}` }} />
                <span style={{ color: T.text2 }}>{d.label}</span>
                <span style={{ color: T.muted, marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{Math.round((d.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (type === "line") {
    const n = data.length, stepX = (W - PADL * 2) / Math.max(1, n - 1);
    const pts = data.map((d, i) => [PADL + i * stepX, PADT + (1 - d.value / max) * (H - PADT - PADB)]);
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = path + ` L ${pts[pts.length - 1][0]} ${H - PADB} L ${pts[0][0]} ${H - PADB} Z`;
    const gid = "lg" + Math.abs((lines.join("") || "x").length * 7919 % 99991);
    return (
      <div className="mdBlock" style={{ margin: "12px 0" }}>{title}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A855F7" /><stop offset="100%" stopColor="#F472B6" /></linearGradient>
            <linearGradient id={gid + "a"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(168,85,247,0.28)" /><stop offset="100%" stopColor="rgba(168,85,247,0)" /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={PADL} x2={W - PADL} y1={PADT + g * (H - PADT - PADB)} y2={PADT + g * (H - PADT - PADB)} stroke={T.border} strokeDasharray="3 5" />)}
          <path className="chartArea" d={area} fill={`url(#${gid}a)`} />
          <path className="chartLine" d={path} fill="none" stroke={`url(#${gid})`} strokeWidth="2.6" strokeLinecap="round" pathLength="1" />
          {pts.map((p, i) => (
            <g key={i} className="chartDot" style={{ animationDelay: `${200 + i * 70}ms` }}>
              <circle cx={p[0]} cy={p[1]} r="4" fill={T.popover} stroke="#E879F9" strokeWidth="2.2" />
              <text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.text2}>{data[i].value}</text>
              <text x={p[0]} y={H - 8} textAnchor="middle" fontSize="10" fill={T.vmuted}>{data[i].label.slice(0, 8)}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }
  // default: bar
  return (
    <div className="mdBlock" style={{ margin: "12px 0" }}>{title}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 150, padding: "4px 2px 0" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text2, fontVariantNumeric: "tabular-nums" }}>{d.value}</div>
            <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div className="chartBar" style={{
                width: "100%", height: `${Math.max(4, (d.value / max) * 100)}%`, borderRadius: "7px 7px 3px 3px",
                background: `linear-gradient(180deg, ${CHART_PALETTE[i % CHART_PALETTE.length]}, ${hexA(CHART_PALETTE[i % CHART_PALETTE.length], 0.45)})`,
                boxShadow: `0 0 14px ${hexA(CHART_PALETTE[i % CHART_PALETTE.length], 0.35)}, 0 1px 0 rgba(255,255,255,0.25) inset`,
                animationDelay: `${i * 70}ms`,
              }} />
            </div>
            <div style={{ fontSize: 10, color: T.vmuted, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function FlowBlock({ T, lines }) {
  const chains = lines.map((l) => l.split(/-+>|→/).map((x) => x.trim()).filter(Boolean)).filter((c) => c.length);
  if (!chains.length) return <div style={{ padding: 12, border: `1px dashed ${T.border}`, borderRadius: 12, color: T.vmuted, fontSize: 12.5 }}>Diagram needs lines like <code>Idea -&gt; Draft -&gt; Ship</code></div>;
  let n = 0;
  return (
    <div className="mdBlock" style={{ margin: "12px 0", display: "grid", gap: 10 }}>
      {chains.map((chain, ci) => (
        <div key={ci} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, rowGap: 10 }}>
          {chain.map((node, i) => {
            const first = i === 0, last = i === chain.length - 1, idx = n++;
            const col = first ? "#A855F7" : last ? "#F472B6" : "#38BDF8";
            return (
              <React.Fragment key={i}>
                <span className="flowNode" style={{
                  animationDelay: `${idx * 80}ms`,
                  padding: "7px 13px", borderRadius: 12, fontSize: 12.5, fontWeight: 700, color: T.text,
                  background: `linear-gradient(${T.elevated},${T.elevated}) padding-box, linear-gradient(140deg, ${col}, ${hexA(col, 0.25)}) border-box`,
                  border: "1.5px solid transparent", boxShadow: `0 4px 14px ${hexA(col, 0.25)}`,
                }}>{node}</span>
                {!last && (
                  <svg className="flowArrow" style={{ animationDelay: `${idx * 80 + 60}ms` }} width="26" height="12" viewBox="0 0 26 12" fill="none">
                    <path d="M1 6h21M17 1.5 22.5 6 17 10.5" stroke={hexA(T.text, 0.45)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
}
function ProgressBlock({ T, lines }) {
  const { data } = parseBlockData(lines);
  if (!data.length) return <div style={{ padding: 12, border: `1px dashed ${T.border}`, borderRadius: 12, color: T.vmuted, fontSize: 12.5 }}>Progress needs lines like <code>Reading: 70</code></div>;
  return (
    <div className="mdBlock" style={{ margin: "12px 0", display: "grid", gap: 10 }}>
      {data.map((d, i) => {
        const pct = Math.max(0, Math.min(100, d.value));
        const col = CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: T.text2, fontWeight: 600 }}>{d.label}</span>
              <span style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
            </div>
            <div style={{ height: 9, borderRadius: 6, background: T.panel2, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}>
              <div className="progFill" style={{ height: "100%", width: `${pct}%`, borderRadius: 6, background: `linear-gradient(90deg, ${col}, ${hexA(col, 0.6)})`, boxShadow: `0 0 10px ${hexA(col, 0.5)}`, animationDelay: `${i * 100}ms` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function TableBlock({ T, rows, onWiki }) {
  const cells = rows.filter((r) => !/^\s*\|?[\s|:-]+\|?\s*$/.test(r)).map((r) => r.replace(/^\s*\||\|\s*$/g, "").split("|").map((c) => c.trim()));
  if (!cells.length) return null;
  const [head, ...body] = cells;
  return (
    <div className="mdBlock" style={{ margin: "12px 0", overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead><tr>
          {head.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "9px 12px", color: T.text, fontWeight: 800, fontSize: 12, letterSpacing: 0.3, borderBottom: `2px solid ${hexA(T.purple, 0.45)}`, background: hexA(T.purple, 0.07), whiteSpace: "nowrap" }}>{mdInline(c, { onWiki })}</th>)}
        </tr></thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri} className="mdTr" style={{ background: ri % 2 ? hexA(T.text, 0.025) : "transparent" }}>
              {head.map((_, ci) => <td key={ci} style={{ padding: "8px 12px", color: T.text2, borderBottom: `1px solid ${T.border}` }}>{mdInline(r[ci] || "", { onWiki })}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const CALLOUTS = {
  info: { color: "#38BDF8", label: "Info", icon: "i" },
  tip: { color: "#34D399", label: "Tip", icon: "✓" },
  warn: { color: "#FACC15", label: "Warning", icon: "!" },
  danger: { color: "#F87171", label: "Caution", icon: "!" },
  idea: { color: "#A855F7", label: "Idea", icon: "✦" },
  done: { color: "#2DD4BF", label: "Done", icon: "✓" },
};
function CalloutLine({ T, type, text, onWiki }) {
  const c = CALLOUTS[type] || CALLOUTS.info;
  return (
    <div className="mdBlock" style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "10px 0", padding: "10px 13px", borderRadius: 12, background: hexA(c.color, 0.09), border: `1px solid ${hexA(c.color, 0.35)}`, boxShadow: `inset 3px 0 0 ${c.color}` }}>
      <span style={{ width: 19, height: 19, minWidth: 19, borderRadius: 8, background: c.color, color: "#0B0712", fontWeight: 900, fontSize: 11, display: "grid", placeItems: "center", marginTop: 1 }}>{c.icon}</span>
      <span style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}><strong style={{ color: c.color, marginRight: 6 }}>{c.label}</strong>{mdInline(text, { onWiki })}</span>
    </div>
  );
}
function CodeBlock({ T, lang, lines }) {
  return (
    <div className="mdBlock" style={{ margin: "12px 0", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", background: hexA(T.purple, 0.08), borderBottom: `1px solid ${T.border}` }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171" }} /><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FACC15" }} /><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }} />
        <span style={{ fontSize: 11, color: T.muted, marginLeft: 6, fontWeight: 700, letterSpacing: 0.5 }}>{(lang || "code").toUpperCase()}</span>
      </div>
      <pre style={{ margin: 0, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.55, fontFamily: "ui-monospace, Menlo, monospace", color: T.text2, overflowX: "auto", background: hexA("#000000", 0.18) }}>{lines.join("\n")}</pre>
    </div>
  );
}
/* clean preview snippet: pretty placeholders for blocks, md tokens stripped */
function mdSnippet(body) {
  const out = [];
  const lines = (body || "").split("\n");
  let i = 0, lastTable = false;
  while (i < lines.length) {
    const ln = lines[i];
    const fence = ln.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = (fence[1] || "").toLowerCase();
      while (i < lines.length && !/^```\s*$/.test(lines[++i])) {}
      i++;
      out.push(lang === "chart" ? "📊 Chart" : lang === "flow" ? "🔀 Flow diagram" : lang === "progress" ? "📶 Progress" : "⌨️ Code block");
      lastTable = false; continue;
    }
    if (/^\s*\|.*\|\s*$/.test(ln)) { if (!lastTable) out.push("▦ Table"); lastTable = true; i++; continue; }
    lastTable = false;
    const co = ln.match(/^>\s*\[!(\w+)\]\s?(.*)$/);
    const clean = (co ? `${(CALLOUTS[co[1].toLowerCase()] || CALLOUTS.info).label}: ${co[2]}` : ln)
      .replace(/^#{1,3}\s/, "").replace(/^>\s/, "").replace(/^\s*- \[[ x]\]\s?/, "☐ ").replace(/^(\s*)[-*]\s/, "$1• ")
      .replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1")
      .replace(/~~([^~]+)~~/g, "$1").replace(/==([^=]+)==/g, "$1").replace(/`([^`]+)`/g, "$1")
      .replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1");
    out.push(clean);
    i++;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
/* ---- Apple Notes-grade checklist row: round animated checkbox + type-in-place text ---- */
function ChecklistRow({ T, idx, done, text, onWiki, onToggle, onEdit, onAdd, onDel, autoFocus, indent }) {
  const editable = !!onEdit;
  const inputRef = useRef(null);
  useEffect(() => { if (autoFocus && inputRef.current) { inputRef.current.focus(); const v = inputRef.current.value; inputRef.current.setSelectionRange(v.length, v.length); } }, [autoFocus]);
  const [draft, setDraft] = useState(text);
  useEffect(() => { setDraft(text); }, [text]);
  const commit = () => { if (editable && draft !== text) onEdit(idx, draft); };
  return (
    <div className="clRow" style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 8px", marginLeft: indent ? indent * 22 : 0, borderRadius: 10 }}>
      <button className="focusable clCheck" onClick={() => onToggle && onToggle(idx)} aria-label={done ? "Mark incomplete" : "Mark complete"} aria-pressed={done}
        style={{
          width: 21, height: 21, minWidth: 21, borderRadius: "50%", cursor: onToggle ? "pointer" : "default",
          border: done ? "2px solid transparent" : `2px solid ${hexA(T.text, 0.32)}`,
          background: done ? T.brandGrad : "transparent",
          boxShadow: done ? `0 2px 8px ${T.pinkGlow}, 0 0 0 1px rgba(255,255,255,0.15) inset` : "none",
          display: "grid", placeItems: "center", padding: 0,
        }}>
        {done && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path className="clTick" d="M2.4 6.4 5 9l4.6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
          </svg>
        )}
      </button>
      {editable ? (
        <input ref={inputRef} className="clInput" value={draft} placeholder="List item"
          onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); onAdd && onAdd(idx); }
            else if (e.key === "Backspace" && draft === "") { e.preventDefault(); onDel && onDel(idx); }
            else if (e.key === "Escape") { setDraft(text); e.currentTarget.blur(); }
          }}
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", padding: 0,
            font: "inherit", fontSize: 14, color: done ? T.muted : T.text2,
            textDecoration: done ? "line-through" : "none", textDecorationColor: hexA(T.muted, 0.7),
            opacity: done ? 0.6 : 1, transition: "opacity .25s ease, color .25s ease",
          }} />
      ) : (
        <span style={{ flex: 1, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1, fontSize: 14, transition: "opacity .25s ease" }}>{mdInline(text, { onWiki })}</span>
      )}
    </div>
  );
}
function ChecklistAdd({ T, afterIdx, onAdd }) {
  return (
    <button className="focusable clAddRow" onClick={() => onAdd(afterIdx)}
      style={{ all: "unset", boxSizing: "border-box", display: "flex", gap: 10, alignItems: "center", padding: "4px 8px", borderRadius: 10, cursor: "pointer", width: "100%" }}>
      <span style={{ width: 21, height: 21, minWidth: 21, borderRadius: "50%", border: `2px dashed ${hexA(T.text, 0.22)}`, display: "grid", placeItems: "center", color: hexA(T.text, 0.4), boxSizing: "border-box" }}><IconPlus w={10} /></span>
      <span style={{ fontSize: 13, color: T.vmuted }}>List item</span>
    </button>
  );
}
function MarkdownView({ T, body, onWiki, onToggleCheck, onEditCheck, onAddCheck, onDelCheck, focusIdx }) {
  const lines = (body || "").split("\n");
  const out = [];
  let checkIdx = -1, headIdx = -1;
  let i = 0, key = 0;
  while (i < lines.length) {
    const ln = lines[i];
    // fenced blocks
    const fence = ln.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = (fence[1] || "").toLowerCase();
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // skip closing fence
      if (lang === "chart") out.push(<ChartBlock key={key++} T={T} lines={buf} />);
      else if (lang === "flow") out.push(<FlowBlock key={key++} T={T} lines={buf} />);
      else if (lang === "progress") out.push(<ProgressBlock key={key++} T={T} lines={buf} />);
      else out.push(<CodeBlock key={key++} T={T} lang={lang} lines={buf} />);
      continue;
    }
    // tables
    if (/^\s*\|.*\|\s*$/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      out.push(<TableBlock key={key++} T={T} rows={buf} onWiki={onWiki} />);
      continue;
    }
    // checklist (keeps global toggle index) — rendered as real interactive rows
    const chk = ln.match(/^(\s*)- \[([ x])\]\s?(.*)$/);
    if (chk) {
      checkIdx++; const idx = checkIdx; const done = chk[2] === "x";
      const indent = Math.floor(chk[1].length / 2);
      out.push(<ChecklistRow key={"c" + idx + (done ? "x" : "o")} T={T} idx={idx} done={done} text={chk[3]} onWiki={onWiki}
        onToggle={onToggleCheck} onEdit={onEditCheck} onAdd={onAddCheck} onDel={onDelCheck}
        autoFocus={focusIdx != null && focusIdx === idx} indent={indent} />);
      // end of a checklist group → offer an add row (editable contexts only)
      const nxt = lines[i + 1];
      if (onAddCheck && (nxt == null || !/^\s*- \[[ x]\]/.test(nxt))) {
        out.push(<ChecklistAdd key={"ca" + idx} T={T} afterIdx={idx} onAdd={onAddCheck} />);
      }
      i++; continue;
    }
    // callouts > [!type] text
    const co = ln.match(/^>\s*\[!(\w+)\]\s?(.*)$/);
    if (co) { out.push(<CalloutLine key={key++} T={T} type={co[1].toLowerCase()} text={co[2]} onWiki={onWiki} />); i++; continue; }
    if (/^#{1,3}\s/.test(ln)) {
      const lvl = ln.match(/^#+/)[0].length; const txt = ln.replace(/^#+\s/, "");
      headIdx++;
      out.push(<div key={key++} data-mdh={headIdx} className={lvl === 1 ? "gradText" : undefined} style={{ fontSize: 23 - lvl * 2.5, fontWeight: 800, color: T.text, margin: lvl === 1 ? "14px 0 6px" : "10px 0 4px", letterSpacing: -0.2, scrollMarginTop: 12 }}>{mdInline(txt, { onWiki })}</div>);
      i++; continue;
    }
    if (/^>\s/.test(ln)) { out.push(<div key={key++} style={{ borderLeft: `3px solid ${T.purple}`, paddingLeft: 12, margin: "6px 0", color: T.muted, fontStyle: "italic" }}>{mdInline(ln.replace(/^>\s/, ""), { onWiki })}</div>); i++; continue; }
    if (/^---+$/.test(ln.trim())) { out.push(<div key={key++} style={{ height: 1, background: `linear-gradient(90deg, ${hexA(T.purple, 0.4)}, ${hexA(T.pink, 0.3)}, transparent)`, margin: "14px 0" }} />); i++; continue; }
    const num = ln.match(/^(\s*)(\d+)\.\s(.*)$/);
    if (num) {
      const depth = Math.floor(num[1].length / 2);
      out.push(
        <div key={key++} className="liRow" style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "2.5px 8px", marginLeft: depth * 22, borderRadius: 8 }}>
          <span style={{ minWidth: 20, textAlign: "right", fontWeight: 700, fontSize: 12.5, fontVariantNumeric: "tabular-nums", background: T.brandGrad, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num[2]}.</span>
          <span style={{ flex: 1, fontSize: 14 }}>{mdInline(num[3], { onWiki })}</span>
        </div>
      ); i++; continue;
    }
    const bul = ln.match(/^(\s*)[-*]\s(.*)$/);
    if (bul) {
      const depth = Math.min(2, Math.floor(bul[1].length / 2));
      const marker = depth === 0
        ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.text2, display: "inline-block", boxShadow: `0 0 6px ${hexA(T.purple, 0.35)}` }} />
        : depth === 1
          ? <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${T.muted}`, display: "inline-block", boxSizing: "border-box" }} />
          : <span style={{ width: 5, height: 5, borderRadius: 1.5, background: T.muted, display: "inline-block" }} />;
      out.push(
        <div key={key++} className="liRow" style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "2.5px 8px", marginLeft: depth * 22, borderRadius: 8 }}>
          <span style={{ display: "grid", placeItems: "center", height: 21, minWidth: 8 }}>{marker}</span>
          <span style={{ flex: 1, fontSize: 14 }}>{mdInline(bul[2], { onWiki })}</span>
        </div>
      ); i++; continue;
    }
    if (ln.trim() === "") { out.push(<div key={key++} style={{ height: 8 }} />); i++; continue; }
    out.push(<div key={key++}>{mdInline(ln, { onWiki })}</div>);
    i++;
  }
  return <div className="mdFade" style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{out}</div>;
}

/* ============================================================
   BLOCK EDITOR — Apple Notes-style direct editing.
   Each line of the markdown body is a live row: real checkboxes,
   bullets, headings, quotes — typed and toggled in place.
   Markdown stays the storage format underneath.
   ============================================================ */
function parseBlockLine(l) {
  let m;
  if ((m = l.match(/^(\s*)- \[([ x])\] ?(.*)$/))) return { t: "chk", indent: m[1], done: m[2] === "x", text: m[3] };
  if ((m = l.match(/^(\s*)[-*] (.*)$/))) return { t: "bul", indent: m[1], text: m[2] };
  if ((m = l.match(/^(\s*)(\d+)\. (.*)$/))) return { t: "num", indent: m[1], n: +m[2], text: m[3] };
  if ((m = l.match(/^(#{1,3}) (.*)$/))) return { t: "h", lvl: m[1].length, text: m[2], indent: "" };
  if ((m = l.match(/^> ?(?!\[!)(.*)$/))) return { t: "q", text: m[1], indent: "" };
  return { t: "p", text: l, indent: "" };
}
function buildBlockLine(b) {
  if (b.t === "chk") return (b.indent || "") + "- [" + (b.done ? "x" : " ") + "] " + b.text;
  if (b.t === "bul") return (b.indent || "") + "- " + b.text;
  if (b.t === "num") return (b.indent || "") + b.n + ". " + b.text;
  if (b.t === "h") return "#".repeat(b.lvl) + " " + b.text;
  if (b.t === "q") return "> " + b.text;
  return b.text;
}
// typing a marker at the start of a plain row converts it live ("[] " → checklist…)
const LIVE_TRIGGERS = [
  [/^\[\] (.*)$/, (m) => ({ t: "chk", done: false, indent: "", text: m[1] })],
  [/^\[x\] (.*)$/i, (m) => ({ t: "chk", done: true, indent: "", text: m[1] })],
  [/^- (.*)$/, (m) => ({ t: "bul", indent: "", text: m[1] })],
  [/^\* (.*)$/, (m) => ({ t: "bul", indent: "", text: m[1] })],
  [/^(#{1,3}) (.*)$/, (m) => ({ t: "h", lvl: m[1].length, text: m[2] })],
  [/^(\d+)\. (.*)$/, (m) => ({ t: "num", indent: "", n: +m[1], text: m[2] })],
  [/^> (.*)$/, (m) => ({ t: "q", text: m[1] })],
];
function BlockRow({ T, idx, raw, onSetLine, onEnter, onBackspaceAtStart, onArrow, onToggle, onTab, focusPos, onFocused, onModShortcut, onSlash }) {
  const b = parseBlockLine(raw);
  const ref = useRef(null);
  const fit = () => { const el = ref.current; if (!el) return; el.style.height = "0px"; el.style.height = el.scrollHeight + "px"; };
  useEffect(fit, [raw]);
  useEffect(() => {
    if (focusPos == null) return;
    const el = ref.current; if (!el) return;
    el.focus();
    const p = Math.min(focusPos, b.text.length);
    try { el.setSelectionRange(p, p); } catch {}
  }, [focusPos]);
  const indent = Math.min(3, Math.floor((b.indent || "").length / 2));
  const isList = b.t === "chk" || b.t === "bul" || b.t === "num";
  const fontSize = b.t === "h" ? (b.lvl === 1 ? 21 : b.lvl === 2 ? 17.5 : 15.5) : 14;
  const fontWeight = b.t === "h" ? 800 : 400;
  const color = b.t === "h" ? T.text : b.t === "q" ? T.muted : b.t === "chk" && b.done ? T.muted : T.text2;
  const handleChange = (e) => {
    const v = e.target.value;
    if (b.t === "p") {
      for (const [re, mk] of LIVE_TRIGGERS) {
        const m = v.match(re);
        if (m) { onSetLine(idx, buildBlockLine(mk(m)), { focus: { idx, pos: m[m.length - 1].length } }); return; }
      }
      if (v === "/") { onSlash && onSlash(idx, ref.current); }
    }
    onSetLine(idx, buildBlockLine({ ...b, text: v }));
    fit();
  };
  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && onModShortcut) { onModShortcut(e); if (e.defaultPrevented) return; }
    const el = e.target;
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(idx, el.selectionStart, b); }
    else if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0) { e.preventDefault(); onBackspaceAtStart(idx, b); }
    else if (e.key === "ArrowUp" && el.selectionStart === 0 && el.selectionEnd === 0) { e.preventDefault(); onArrow(idx, -1, el.selectionStart); }
    else if (e.key === "ArrowDown" && el.selectionEnd === el.value.length && el.selectionStart === el.selectionEnd) { e.preventDefault(); onArrow(idx, 1, el.selectionStart); }
    else if (e.key === "Tab" && isList) { e.preventDefault(); onTab(idx, e.shiftKey, b); }
  };
  return (
    <div className={"blkRow" + (b.t === "chk" ? " clRow" : "")} style={{
      display: "flex", gap: 10, alignItems: b.t === "h" ? "baseline" : "flex-start",
      padding: b.t === "h" ? "6px 8px 2px" : "2.5px 8px", marginLeft: indent * 22, borderRadius: 10,
      borderLeft: b.t === "q" ? `3px solid ${T.purple}` : "3px solid transparent",
    }}>
      {b.t === "chk" && (
        <button className="focusable clCheck" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => onToggle(idx, b)} aria-label={b.done ? "Mark incomplete" : "Mark complete"} aria-pressed={b.done}
          style={{ width: 21, height: 21, minWidth: 21, borderRadius: "50%", cursor: "pointer", marginTop: 1, padding: 0,
            border: b.done ? "2px solid transparent" : `2px solid ${hexA(T.text, 0.32)}`,
            background: b.done ? T.brandGrad : "transparent",
            boxShadow: b.done ? `0 2px 8px ${T.pinkGlow}, 0 0 0 1px rgba(255,255,255,0.15) inset` : "none",
            display: "grid", placeItems: "center" }}>
          {b.done && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path className="clTick" d="M2.4 6.4 5 9l4.6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>}
        </button>
      )}
      {b.t === "bul" && <span style={{ display: "grid", placeItems: "center", height: 23, minWidth: 8 }}>{indent === 0 ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.text2, boxShadow: `0 0 6px ${hexA(T.purple, 0.35)}` }} /> : <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${T.muted}`, boxSizing: "border-box" }} />}</span>}
      {b.t === "num" && <span style={{ minWidth: 20, textAlign: "right", fontWeight: 700, fontSize: 12.5, lineHeight: "23px", fontVariantNumeric: "tabular-nums", background: T.brandGrad, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{b.n}.</span>}
      <textarea ref={ref} rows={1} className="blkInput" value={b.text} placeholder={b.t === "chk" ? "List item" : b.t === "h" ? "Heading" : idx === 0 ? "Start writing — type [] then space for a checklist" : ""}
        onChange={handleChange} onKeyDown={handleKey} onFocus={(e) => { fit(); onFocused && onFocused(idx, e.target); }}
        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", resize: "none", overflow: "hidden",
          padding: 0, font: "inherit", fontFamily: "inherit", lineHeight: b.t === "h" ? 1.3 : "23px",
          fontSize, fontWeight, color, fontStyle: b.t === "q" ? "italic" : "normal",
          textDecoration: b.t === "chk" && b.done ? "line-through" : "none", textDecorationColor: hexA(T.muted, 0.7),
          opacity: b.t === "chk" && b.done ? 0.6 : 1, transition: "opacity .25s ease, color .25s ease", caretColor: T.pink }} />
    </div>
  );
}
function BlockEditor({ T, S, body, apply, onWiki, onFocusedRow, onModShortcut, onSlash, focusReq, onJumpMd }) {
  const lines = (body || "").split("\n");
  const isFence = (l) => /^```/.test(l);
  const isTable = (l) => /^\s*\|.*\|\s*$/.test(l);
  const isCallout = (l) => /^>\s*\[!\w+\]/.test(l);
  const setLine = (idx, raw, opts) => {
    apply((b) => { const ls = b.split("\n"); ls[idx] = raw; return ls.join("\n"); }, opts && opts.focus);
  };
  const doEnter = (idx, caret, b) => {
    // empty list item → exit the list (Apple behavior)
    if ((b.t === "chk" || b.t === "bul" || b.t === "num") && b.text === "") { setLine(idx, "", { focus: { idx, pos: 0 } }); return; }
    apply((body0) => {
      const ls = body0.split("\n");
      const left = b.text.slice(0, caret), right = b.text.slice(caret);
      ls[idx] = buildBlockLine({ ...b, text: left });
      let nb;
      if (b.t === "chk") nb = { t: "chk", done: false, indent: b.indent, text: right };
      else if (b.t === "bul") nb = { t: "bul", indent: b.indent, text: right };
      else if (b.t === "num") nb = { t: "num", indent: b.indent, n: b.n + 1, text: right };
      else if (b.t === "q") nb = { t: "q", text: right };
      else nb = { t: "p", text: right };
      ls.splice(idx + 1, 0, buildBlockLine(nb));
      return ls.join("\n");
    }, { idx: idx + 1, pos: 0 });
  };
  const doBackspace0 = (idx, b) => {
    if (b.t !== "p") { setLine(idx, b.text, { focus: { idx, pos: 0 } }); return; } // first backspace strips the marker
    if (idx === 0) return;
    apply((body0) => {
      const ls = body0.split("\n");
      ls[idx - 1] = ls[idx - 1] + b.text;
      ls.splice(idx, 1);
      return ls.join("\n");
    }, { idx: idx - 1, pos: parseBlockLine(lines[idx - 1]).text.length });
  };
  const doArrow = (idx, dir, caret) => {
    let j = idx + dir;
    while (j >= 0 && j < lines.length && (isFence(lines[j]) || isTable(lines[j]) || isCallout(lines[j]))) j += dir;
    if (j < 0 || j >= lines.length) return;
    apply((b) => b, { idx: j, pos: caret });
  };
  const doToggle = (idx, b) => setLine(idx, buildBlockLine({ ...b, done: !b.done }));
  const doTab = (idx, shift, b) => {
    const ind = b.indent || "";
    const next = shift ? ind.replace(/^ {1,2}/, "") : "  " + ind;
    setLine(idx, buildBlockLine({ ...b, indent: next }), { focus: { idx, pos: 999 } });
  };
  // render: rich segments (fences, tables, callouts) stay read-only; everything else is a live row
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (isFence(lines[i])) {
      let j = i + 1; while (j < lines.length && !/^```\s*$/.test(lines[j])) j++;
      const seg = lines.slice(i, Math.min(j + 1, lines.length)).join("\n");
      out.push(<RichSeg key={"f" + i} T={T} body={seg} onWiki={onWiki} onJumpMd={onJumpMd} />);
      i = j + 1; continue;
    }
    if (isTable(lines[i])) {
      let j = i; while (j < lines.length && isTable(lines[j])) j++;
      out.push(<RichSeg key={"t" + i} T={T} body={lines.slice(i, j).join("\n")} onWiki={onWiki} onJumpMd={onJumpMd} />);
      i = j; continue;
    }
    if (isCallout(lines[i])) { out.push(<RichSeg key={"co" + i} T={T} body={lines[i]} onWiki={onWiki} onJumpMd={onJumpMd} />); i++; continue; }
    if (/^---+$/.test(lines[i].trim())) { out.push(<div key={"hr" + i} style={{ height: 1, background: `linear-gradient(90deg, ${hexA(T.purple, 0.4)}, ${hexA(T.pink, 0.3)}, transparent)`, margin: "12px 8px" }} />); i++; continue; }
    const idx = i;
    out.push(<BlockRow key={idx} T={T} idx={idx} raw={lines[idx]}
      onSetLine={setLine} onEnter={doEnter} onBackspaceAtStart={doBackspace0} onArrow={doArrow} onToggle={doToggle} onTab={doTab}
      focusPos={focusReq && focusReq.idx === idx ? focusReq.pos : null}
      onFocused={onFocusedRow} onModShortcut={onModShortcut} onSlash={onSlash} />);
    i++;
  }
  return (
    <div className="scrollarea blockEditor" style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "12px 10px 40vh" }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        // click below content → focus or append a trailing paragraph
        const last = lines.length - 1;
        if (parseBlockLine(lines[last]).t === "p") apply((b) => b, { idx: last, pos: lines[last].length });
        else apply((b) => b + "\n", { idx: last + 1, pos: 0 });
      }}>
      {out}
    </div>
  );
}
function RichSeg({ T, body, onWiki, onJumpMd }) {
  return (
    <div className="richSeg" style={{ position: "relative", borderRadius: 12, margin: "2px 0" }}>
      <MarkdownView T={T} body={body} onWiki={onWiki} />
      {onJumpMd && (
        <button className="focusable richSegHint" onClick={onJumpMd} title="Edit this block as Markdown"
          style={{ position: "absolute", top: 6, right: 6, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, color: T.vmuted, border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 7px", background: hexA(T.popover, 0.9), cursor: "pointer" }}>MARKDOWN ›</button>
      )}
    </div>
  );
}

/* pixel position of the textarea caret — mirror-div measurement */
function caretXY(ta) {
  const cs = getComputedStyle(ta);
  const d = document.createElement("div");
  for (const p of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderWidth", "boxSizing"]) d.style[p] = cs[p];
  d.style.position = "fixed"; d.style.visibility = "hidden"; d.style.whiteSpace = "pre-wrap"; d.style.wordWrap = "break-word";
  d.style.width = ta.clientWidth + "px"; d.style.top = "0"; d.style.left = "0";
  d.textContent = ta.value.slice(0, ta.selectionStart);
  const span = document.createElement("span"); span.textContent = "\u200b"; d.appendChild(span);
  document.body.appendChild(d);
  const r = ta.getBoundingClientRect();
  const lh = parseFloat(cs.lineHeight) || 24;
  const xy = { x: r.left + span.offsetLeft - ta.scrollLeft, y: r.top + span.offsetTop - ta.scrollTop + lh };
  d.remove();
  return xy;
}

function NoteModal({ T, S, categories, catColor, data, notes, tasks, collections, allTags, today, todayKey, onClose, onSave, onDelete, onArchive, onOpenTask, onOpenNoteTitle, onCreateTask, linkNoteTask, unlinkNoteTask }) {
  const isNew = !data.id;
  const ref = useFocusTrap(onClose);
  const taRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [showMeta, setShowMeta] = useState(true);
  const [tagDraft, setTagDraft] = useState("");
  const [linkPicker, setLinkPicker] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");
  const [f, setF] = useState({
    id: data.id, title: data.title || "", body: data.body || "",
    category: data.category || "Personal", collectionId: data.collectionId || null,
    pinned: data.pinned || false, favorite: data.favorite || false,
    tags: data.tags || [], type: data.type || "note",
    linkedDate: data.linkedDate || null, linkedTaskIds: data.linkedTaskIds || [],
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const [dirty, setDirty] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [zen, setZen] = useState(false);
  const firstRef = useRef(true);
  const skipDirtyRef = useRef(false);
  useEffect(() => { if (firstRef.current) { firstRef.current = false; return; } if (skipDirtyRef.current) { skipDirtyRef.current = false; return; } setDirty(true); }, [f]);
  const flashTimer = useRef(null);
  useEffect(() => () => clearTimeout(flashTimer.current), []);
  // document outline (headings) for the side panel
  const outline = useMemo(() => {
    const out = []; let pos = 0;
    for (const ln of f.body.split("\n")) {
      const m = ln.match(/^(#{1,3})\s+(.+)$/);
      if (m) out.push({ lvl: m[1].length, text: m[2].replace(/[*_`=~]/g, ""), pos, n: out.length });
      pos += ln.length + 1;
    }
    return out;
  }, [f.body]);
  const previewRef = useRef(null);

  const save = () => { if (!f.title.trim() && !f.body.trim()) return; const tags = [...new Set([...(f.tags || []), ...parseTags(f.body)])]; onSave({ ...f, title: f.title.trim() || dailyTitleOrUntitled(f), tags }); };
  const silentSave = () => {
    if (!f.title.trim() && !f.body.trim()) return;
    const tags = [...new Set([...(f.tags || []), ...parseTags(f.body)])];
    const id = onSave({ ...f, title: f.title.trim() || dailyTitleOrUntitled(f), tags }, { keepOpen: true });
    if (id && !f.id) { skipDirtyRef.current = true; set("id", id); }
    setDirty(false); setSaveFlash(true);
    clearTimeout(flashTimer.current); flashTimer.current = setTimeout(() => setSaveFlash(false), 1600);
  };
  const copyMd = async () => {
    try { await navigator.clipboard.writeText(f.body); } catch { const t = document.createElement("textarea"); t.value = f.body; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch {} t.remove(); }
    setSaveFlash("copied"); clearTimeout(flashTimer.current); flashTimer.current = setTimeout(() => setSaveFlash(false), 1400);
  };
  const downloadMd = () => {
    const blob = new Blob(["# " + (f.title || "Untitled") + "\n\n" + f.body], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = (f.title || "note").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() + ".md";
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 800);
  };
  const jumpTo = (h) => {
    if (viewMode !== "write" && previewRef.current) {
      const el = previewRef.current.querySelector(`[data-mdh="${h.n}"]`);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    const ta = taRef.current; if (!ta) return;
    setViewMode((v) => v === "preview" ? "write" : v);
    requestAnimationFrame(() => {
      const t = taRef.current; if (!t) return;
      t.focus(); t.setSelectionRange(h.pos, h.pos);
      const lineNo = f.body.slice(0, h.pos).split("\n").length - 1;
      t.scrollTop = Math.max(0, lineNo * 24.75 - 70);
    });
  };
  function dailyTitleOrUntitled(ff) { return ff.type === "daily" && ff.linkedDate ? dailyTitle(ff.linkedDate) : "Untitled"; }

  // ---- editing engine: undo-preserving (execCommand keeps the native textarea undo stack) ----
  const editRange = (s, e, text, selS, selE) => {
    const ta = taRef.current;
    if (!ta) { set("body", f.body.slice(0, s) + text + f.body.slice(e)); return; }
    ta.focus(); ta.setSelectionRange(s, e);
    let ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch {}
    if (!ok) { ta.setRangeText(text, s, e, "end"); set("body", ta.value); }
    requestAnimationFrame(() => { try { ta.setSelectionRange(selS != null ? selS : s + text.length, selE != null ? selE : s + text.length); } catch {} });
  };
  // edit-mode helpers: operate on the focused block row
  const rowParts = (idx) => {
    const lines = f.body.split("\n");
    const raw = lines[idx] != null ? lines[idx] : "";
    const b = parseBlockLine(raw);
    return { lines, raw, b };
  };
  const wrapInRow = (before, after, placeholder) => {
    const a = activeRow.current; if (!a || !a.el) return;
    const { b } = rowParts(a.idx);
    const el = a.el, sP = el.selectionStart, eP = el.selectionEnd;
    const sel = b.text.slice(sP, eP);
    let inner = sel || placeholder, ns = sP, ne;
    let text;
    if (sel.startsWith(before) && sel.endsWith(after) && sel.length >= before.length + after.length) {
      inner = sel.slice(before.length, sel.length - after.length);
      text = b.text.slice(0, sP) + inner + b.text.slice(eP); ne = ns + inner.length;
    } else {
      text = b.text.slice(0, sP) + before + inner + after + b.text.slice(eP);
      ns = sP + before.length; ne = ns + inner.length;
    }
    applyBody((body0) => { const ls = body0.split("\n"); ls[a.idx] = buildBlockLine({ ...b, text }); return ls.join("\n"); });
    requestAnimationFrame(() => { try { el.focus(); el.setSelectionRange(ns, ne); } catch {} });
  };
  const convertRow = (prefix, numbered) => {
    const a = activeRow.current; if (!a) return;
    const { b } = rowParts(a.idx);
    let nb;
    if (numbered) nb = b.t === "num" ? { t: "p", text: b.text } : { t: "num", indent: "", n: 1, text: b.text };
    else if (prefix === "- [ ] ") nb = b.t === "chk" ? { t: "p", text: b.text } : { t: "chk", done: false, indent: "", text: b.text };
    else if (prefix === "- ") nb = b.t === "bul" ? { t: "p", text: b.text } : { t: "bul", indent: "", text: b.text };
    else if (prefix === "> ") nb = b.t === "q" ? { t: "p", text: b.text } : { t: "q", text: b.text };
    else { const lvl = prefix.trim().length; nb = (b.t === "h" && b.lvl === lvl) ? { t: "p", text: b.text } : { t: "h", lvl, text: b.text }; }
    applyBody((body0) => { const ls = body0.split("\n"); ls[a.idx] = buildBlockLine(nb); return ls.join("\n"); }, { idx: a.idx, pos: 999 });
  };
  const insertAfterRow = (text) => {
    const a = activeRow.current;
    applyBody((body0) => {
      const ls = body0.split("\n");
      const at = a ? a.idx : ls.length - 1;
      // typing "/" opened the menu → the slash row becomes the block
      if (a && ls[a.idx] === "/") { ls.splice(a.idx, 1, ...text.split("\n"), ""); return ls.join("\n"); }
      ls.splice(at + 1, 0, ...text.split("\n"), "");
      return ls.join("\n");
    });
  };
  // wrap selection — toggles off if already wrapped (Word-style)
  const wrapSel = (before, after = before, placeholder = "text") => {
    if (viewMode === "edit") return wrapInRow(before, after, placeholder);
    const ta = taRef.current; const val = ta ? ta.value : f.body;
    const s = ta ? ta.selectionStart : val.length, e = ta ? ta.selectionEnd : val.length;
    const sel = val.slice(s, e);
    const inner = sel || placeholder;
    if (sel.startsWith(before) && sel.endsWith(after) && sel.length >= before.length + after.length) {
      const un = sel.slice(before.length, sel.length - after.length);
      editRange(s, e, un, s, s + un.length); return;
    }
    if (val.slice(s - before.length, s) === before && val.slice(e, e + after.length) === after) {
      editRange(s - before.length, e + after.length, sel, s - before.length, s - before.length + sel.length); return;
    }
    editRange(s, e, before + inner + after, s + before.length, s + before.length + inner.length);
  };
  // prefix every selected line — toggles, supports numbered renumbering
  const prefixLines = (prefix, { numbered } = {}) => {
    if (viewMode === "edit") return convertRow(prefix, numbered);
    const ta = taRef.current; const val = ta ? ta.value : f.body;
    const s = ta ? ta.selectionStart : val.length, e = ta ? ta.selectionEnd : s;
    const ls = val.lastIndexOf("\n", s - 1) + 1;
    let le = val.indexOf("\n", e); if (le === -1) le = val.length;
    const seg = val.slice(ls, le);
    const linesArr = seg.split("\n");
    // empty selection on a blank line → just start the list/heading there
    if (!linesArr.some((l) => l.trim())) {
      const p = numbered ? "1. " : prefix;
      editRange(ls, le, p + seg, ls + p.length, ls + p.length);
      return;
    }
    const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const allHave = numbered ? linesArr.every((l) => /^\s*\d+\.\s/.test(l) || !l.trim()) : linesArr.every((l) => new RegExp("^" + esc).test(l) || !l.trim());
    const OTHER = /^(#{1,3}\s|>\s*(\[!\w+\]\s*)?|- \[[ x]\]\s|[-*]\s|\d+\.\s)/;
    let counter = 0;
    const nextSeg = linesArr.map((l) => {
      if (!l.trim()) return l;
      if (allHave) return numbered ? l.replace(/^\s*\d+\.\s/, "") : l.replace(new RegExp("^" + esc), "");
      const clean = l.replace(OTHER, "");
      counter++;
      return (numbered ? `${counter}. ` : prefix) + clean;
    }).join("\n");
    editRange(ls, le, nextSeg, ls, ls + nextSeg.length);
  };
  // insert a block on its own lines at the cursor
  const insertBlock = (text) => {
    if (viewMode === "edit") return insertAfterRow(text);
    const ta = taRef.current; const val = ta ? ta.value : f.body;
    const s = ta ? ta.selectionStart : val.length;
    const before = val.slice(0, s);
    const lead = before === "" ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    editRange(s, s, lead + text + "\n");
  };
  const stamp = () => {
    const d = new Date();
    const t = `**${d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}** — `;
    if (viewMode === "edit") return wrapInRow(t, "", "");
    const ta = taRef.current; const s = ta ? ta.selectionStart : (ta ? ta.value : f.body).length;
    editRange(s, s, t);
  };
  const INSERTS = [
    { label: "Table", icon: <IconTable w={14} />, text: "| Column | Column | Column |\n| --- | --- | --- |\n| value | value | value |\n| value | value | value |" },
    { label: "Bar chart", icon: <IconChart w={14} />, text: "```chart\ntype: bar\ntitle: This week\nMon: 4\nTue: 6\nWed: 3\nThu: 7\nFri: 5\n```" },
    { label: "Line chart", icon: <IconTrendUp w={14} />, text: "```chart\ntype: line\ntitle: Trend\nW1: 10\nW2: 14\nW3: 12\nW4: 18\n```" },
    { label: "Pie chart", icon: <IconPieSlice w={14} />, text: "```chart\ntype: pie\ntitle: Split\nDeep work: 50\nMeetings: 30\nAdmin: 20\n```" },
    { label: "Flow diagram", icon: <IconFlow w={14} />, text: "```flow\nIdea -> Draft -> Review -> Ship\n```" },
    { label: "Progress bars", icon: <IconGauge w={14} />, text: "```progress\nReading: 60\nCourse: 35\nProject: 80\n```" },
    { label: "Code block", icon: <IconCode w={14} />, text: "```js\n// code here\n```" },
    { label: "Callout · Tip", icon: <IconSpark w={14} />, text: "> [!tip] Something worth remembering" },
    { label: "Callout · Warning", icon: <IconAlert w={14} />, text: "> [!warn] Watch out for this" },
    { label: "Callout · Idea", icon: <IconBulb w={14} />, text: "> [!idea] What if…" },
  ];
  // ---- slash command menu ----
  const [slash, setSlash] = useState(null); // { x, y, q, start, idx }
  const slashCmds = useMemo(() => [
    { label: "Heading 1", hint: "# ", icon: <span style={{ fontWeight: 800, fontSize: 12 }}>H1</span>, run: () => prefixLines("# ") },
    { label: "Heading 2", hint: "## ", icon: <span style={{ fontWeight: 800, fontSize: 11 }}>H2</span>, run: () => prefixLines("## ") },
    { label: "Heading 3", hint: "### ", icon: <span style={{ fontWeight: 800, fontSize: 10 }}>H3</span>, run: () => prefixLines("### ") },
    { label: "Checklist", hint: "todo", icon: <IconCheckSquare />, run: () => prefixLines("- [ ] ") },
    { label: "Bullet list", hint: "list", icon: <IconList w={14} />, run: () => prefixLines("- ") },
    { label: "Numbered list", hint: "1.", icon: <span style={{ fontWeight: 800, fontSize: 11 }}>1.</span>, run: () => prefixLines("", { numbered: true }) },
    { label: "Quote", hint: "> ", icon: <IconQuote />, run: () => prefixLines("> ") },
    { label: "Divider", hint: "---", icon: <IconMinus />, run: () => insertBlock("---") },
    { label: "Date stamp", hint: "now", icon: <IconClock w={14} />, run: stamp },
    ...INSERTS.map((it) => ({ label: it.label, hint: "block", icon: it.icon, run: () => { insertBlock(it.text); setViewMode((v) => v === "preview" ? "split" : v); } })),
  ], [f.body]);
  const slashList = slash ? slashCmds.filter((c) => fuzzy(slash.q, c.label)).slice(0, 8) : [];
  const checkSlash = (ta) => {
    const sPos = ta.selectionStart;
    if (ta.selectionEnd !== sPos) { setSlash(null); return; }
    const val = ta.value;
    const ls = val.lastIndexOf("\n", sPos - 1) + 1;
    const m = val.slice(ls, sPos).match(/^(\s*)\/([\w-]*)$/);
    if (!m) { setSlash(null); return; }
    const xy = caretXY(ta);
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    setSlash((prev) => ({ x: Math.min(xy.x, W - 250), y: Math.min(xy.y + 4, H - 330), q: m[2], start: ls + m[1].length, idx: prev && prev.q !== m[2] ? 0 : (prev ? prev.idx : 0) }));
  };
  const runSlash = (cmd) => {
    const ta = taRef.current; if (!ta) return;
    const end = ta.selectionStart;
    setSlash(null);
    editRange(slash.start, end, "", slash.start, slash.start);
    requestAnimationFrame(() => cmd.run());
  };
  // ---- keyboard brain: slash nav → smart lists → Tab → shortcuts ----
  const onKeys = (e) => {
    const ta = e.target;
    // slash menu navigation
    if (slash && slashList.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlash((p) => ({ ...p, idx: (p.idx + 1) % slashList.length })); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSlash((p) => ({ ...p, idx: (p.idx - 1 + slashList.length) % slashList.length })); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); runSlash(slashList[Math.min(slash.idx, slashList.length - 1)]); return; }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setSlash(null); return; }
    }
    // auto-format-as-you-type: "[]"+space → "- [ ] ", "[x]"+space → "- [x] ", "*"+space → "- "
    if (e.key === " ") {
      const val = ta.value, sPos = ta.selectionStart;
      if (ta.selectionEnd === sPos) {
        const ls = val.lastIndexOf("\n", sPos - 1) + 1;
        const tok = val.slice(ls, sPos);
        const m2 = tok.match(/^(\s*)(\[\]|\[x\]|\[X\]|\*)$/);
        if (m2) {
          e.preventDefault();
          const rep = m2[2] === "*" ? "- " : m2[2] === "[]" ? "- [ ] " : "- [x] ";
          editRange(ls, sPos, m2[1] + rep);
          return;
        }
      }
    }
    // smart list continuation on Enter
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      const val = ta.value, sPos = ta.selectionStart;
      if (ta.selectionEnd === sPos) {
        const ls = val.lastIndexOf("\n", sPos - 1) + 1;
        const line = val.slice(ls, sPos);
        const m = line.match(/^(\s*)(- \[[ x]\] |[-*] |(\d+)\. |> )(.*)$/);
        if (m) {
          e.preventDefault();
          if (!m[4].trim()) { editRange(ls, sPos, m[1], ls + m[1].length, ls + m[1].length); return; } // empty item → exit list
          let marker = m[2];
          if (m[3]) marker = (parseInt(m[3], 10) + 1) + ". ";
          else if (marker.startsWith("- [")) marker = "- [ ] ";
          editRange(sPos, sPos, "\n" + m[1] + marker);
          return;
        }
      }
    }
    // Tab indents lists / inserts spaces; Shift+Tab outdents
    if (e.key === "Tab") {
      e.preventDefault();
      const val = ta.value, sPos = ta.selectionStart, en = ta.selectionEnd;
      const ls = val.lastIndexOf("\n", sPos - 1) + 1;
      let le = val.indexOf("\n", en); if (le === -1) le = val.length;
      const seg = val.slice(ls, le);
      const listish = /^(\s*)(- |\d+\. |- \[|\* )/.test(seg);
      if (e.shiftKey) {
        const out = seg.split("\n").map((l) => l.replace(/^ {1,2}/, "")).join("\n");
        if (out !== seg) editRange(ls, le, out, ls, ls + out.length);
      } else if (listish || sPos !== en) {
        const out = seg.split("\n").map((l) => (l ? "  " + l : l)).join("\n");
        editRange(ls, le, out, ls, ls + out.length);
      } else {
        editRange(sPos, en, "  ");
      }
      return;
    }
    // Word muscle-memory shortcuts
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "s") { e.preventDefault(); silentSave(); }
    else if (k === "b") { e.preventDefault(); wrapSel("**"); }
    else if (k === "i") { e.preventDefault(); wrapSel("*"); }
    else if (k === "u") { e.preventDefault(); wrapSel("__"); }
    else if (k === "h" && e.shiftKey) { e.preventDefault(); wrapSel("=="); }
    else if (k === "e") { e.preventDefault(); wrapSel("`"); }
    else if (k === "k") { e.preventDefault(); wrapSel("[", "](https://)", "link text"); }
    else if (k === "7" && e.shiftKey) { e.preventDefault(); prefixLines("", { numbered: true }); }
    else if (k === "8" && e.shiftKey) { e.preventDefault(); prefixLines("- "); }
    else if (k === "9" && e.shiftKey) { e.preventDefault(); prefixLines("- [ ] "); }
  };
  // legacy helpers used elsewhere
  const surround = wrapSel;
  const insertLine = (prefix) => prefixLines(prefix);

  const addTag = (t) => { const tag = t.replace(/^#/, "").trim().toLowerCase(); if (tag && !f.tags.includes(tag)) set("tags", [...f.tags, tag]); setTagDraft(""); };
  const removeTag = (t) => set("tags", f.tags.filter((x) => x !== t));

  const linkedTasks = (tasks || []).filter((t) => (f.linkedTaskIds || []).includes(t.id));
  const wikiTitles = parseWikiLinks(f.body);
  // backlinks: other notes that mention this note's title in [[...]]
  const backlinks = (notes || []).filter((n) => n.id !== f.id && parseWikiLinks(n.body).some((w) => w.toLowerCase() === (f.title || "").toLowerCase()));
  const linkCandidates = (tasks || []).filter((t) => !(f.linkedTaskIds || []).includes(t.id) && (!linkQuery || fuzzy(linkQuery, t.title))).slice(0, 8);

  // create task from selected text in body
  const createTaskFromSelection = () => {
    const ta = taRef.current; let sel = "";
    if (ta) sel = f.body.slice(ta.selectionStart, ta.selectionEnd).trim();
    const title = sel || f.title || "Follow-up";
    // save current note first so links persist, then open task modal linking back
    const tags = [...new Set([...(f.tags || []), ...parseTags(f.body)])];
    const noteId = f.id || uid();
    onSave({ ...f, id: noteId, title: f.title.trim() || dailyTitleOrUntitled(f), tags });
    onCreateTask({ title, category: f.category, date: f.linkedDate || todayKey, priority: "medium" }, noteId);
  };

  const [viewMode, setViewMode] = useState("edit"); // edit | write(markdown) | split | preview
  const [chkFocus, setChkFocus] = useState(null); // preview checklist autofocus
  const [blkFocus, setBlkFocus] = useState(null); // block editor focus request { idx, pos, t }
  const activeRow = useRef(null); // { idx, el } — focused block row (ribbon target in edit mode)
  const applyBody = (fn, focus) => {
    setF((st) => ({ ...st, body: fn(st.body) }));
    if (focus) setBlkFocus({ ...focus, t: Date.now() });
  };
  const [insOpen, setInsOpen] = useState(false);
  const TBtn = ({ onClick, label, children, accent }) => (
    <button className="tbtn focusable" style={{ ...S.tbtn, ...(accent ? { color: T.pink } : null) }} onMouseDown={(e) => e.preventDefault()} onClick={onClick} aria-label={label} title={label}>{children}</button>
  );
  const TSep = () => <div style={{ width: 1, alignSelf: "stretch", margin: "5px 3px", background: `linear-gradient(180deg, transparent, ${T.border}, transparent)` }} />;

  return (
    <Overlay onClose={onClose}>
      <div ref={ref} className={"noteEditor" + (zen ? " zenMode" : "")} style={S.noteEditor} role="dialog" aria-modal="true" aria-label={isNew ? "New note" : "Edit note"} onClick={(e) => e.stopPropagation()}>
        {/* main column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={S.editorHead}>
            <span style={{ color: catColor(f.category), display: "grid", placeItems: "center" }}><NoteTypeIcon type={f.type} w={18} /></span>
            <input autoFocus value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Untitled note" style={S.editorTitle} aria-label="Note title" />
            {dirty && <span title="Unsaved changes — Ctrl+S saves" style={{ width: 8, height: 8, minWidth: 8, borderRadius: "50%", background: "#FBBF24", boxShadow: "0 0 8px rgba(251,191,36,0.6)", animation: "fade .3s ease" }} />}
            <button className="iconbtn focusable deskonly" style={{ ...S.iconBtn, width: 34, height: 34, ...(zen ? { color: T.pink, borderColor: hexA(T.pink, 0.5) } : null) }} onClick={() => { setZen((z) => !z); if (!zen) setShowMeta(false); }} aria-label="Zen mode" title="Zen mode"><IconExpand w={14} /></button>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 34, height: 34, ...(f.pinned ? { color: "#FBBF24", borderColor: hexA("#FBBF24", 0.5) } : null) }} onClick={() => set("pinned", !f.pinned)} aria-label="Pin" title="Pin"><IconPin w={14} /></button>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 34, height: 34, ...(f.favorite ? { color: "#FBBF24", borderColor: hexA("#FBBF24", 0.5) } : null) }} onClick={() => set("favorite", !f.favorite)} aria-label="Favorite" title="Favorite"><IconStar w={14} filled={f.favorite} /></button>
            <button className="pillbtn focusable deskonly" style={{ ...S.pill, padding: "7px 10px" }} onClick={() => setShowMeta((s) => !s)} aria-label="Toggle details">Details</button>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 34, height: 34 }} onClick={onClose} aria-label="Close"><IconX /></button>
          </div>

          {/* ribbon */}
          <div className="ribbon scrollarea" style={S.editorToolbar}>
            <div className="ribbonGroup">
              <TBtn onClick={() => wrapSel("**")} label="Bold (Ctrl+B)"><IconBold /></TBtn>
              <TBtn onClick={() => wrapSel("*")} label="Italic (Ctrl+I)"><span style={{ fontStyle: "italic", fontWeight: 700, fontSize: 14, fontFamily: "Georgia, serif" }}>I</span></TBtn>
              <TBtn onClick={() => wrapSel("__")} label="Underline (Ctrl+U)"><span style={{ textDecoration: "underline", fontWeight: 700, fontSize: 13.5, textUnderlineOffset: 2 }}>U</span></TBtn>
              <TBtn onClick={() => wrapSel("~~")} label="Strikethrough"><span style={{ textDecoration: "line-through", fontWeight: 700, fontSize: 13.5 }}>S</span></TBtn>
              <TBtn onClick={() => wrapSel("==")} label="Highlight (Ctrl+Shift+H)"><span style={{ fontWeight: 800, fontSize: 12.5, padding: "0 4px", borderRadius: 4, background: "linear-gradient(120deg, rgba(250,204,21,0.5), rgba(244,114,182,0.45))", color: T.text }}>H</span></TBtn>
              <TBtn onClick={() => wrapSel("`")} label="Inline code (Ctrl+E)"><IconCode w={14} /></TBtn>
            </div>
            <TSep />
            <div className="ribbonGroup">
              <TBtn onClick={() => prefixLines("# ")} label="Heading 1"><span style={{ fontWeight: 800, fontSize: 13 }}>H1</span></TBtn>
              <TBtn onClick={() => prefixLines("## ")} label="Heading 2"><span style={{ fontWeight: 800, fontSize: 12 }}>H2</span></TBtn>
              <TBtn onClick={() => prefixLines("### ")} label="Heading 3"><span style={{ fontWeight: 800, fontSize: 11 }}>H3</span></TBtn>
              <TBtn onClick={() => prefixLines("> ")} label="Quote"><IconQuote /></TBtn>
            </div>
            <TSep />
            <div className="ribbonGroup">
              <TBtn onClick={() => prefixLines("- ")} label="Bullet list (Ctrl+Shift+8)"><IconList w={15} /></TBtn>
              <TBtn onClick={() => prefixLines("", { numbered: true })} label="Numbered list (Ctrl+Shift+7)"><span style={{ fontWeight: 800, fontSize: 11.5, fontVariantNumeric: "tabular-nums" }}>1.</span></TBtn>
              <TBtn onClick={() => prefixLines("- [ ] ")} label="Checklist (Ctrl+Shift+9)"><IconCheckSquare /></TBtn>
              <TBtn onClick={() => insertBlock("---")} label="Divider"><IconMinus /></TBtn>
            </div>
            <TSep />
            <div className="ribbonGroup">
              <TBtn onClick={() => wrapSel("[", "](https://)", "link text")} label="Link (Ctrl+K)"><IconLink /></TBtn>
              <TBtn onClick={() => wrapSel("[[", "]]", "Note title")} label="Wiki link"><IconHash w={14} /></TBtn>
              <TBtn onClick={stamp} label="Date & time stamp"><IconClock w={14} /></TBtn>
              <TBtn onClick={createTaskFromSelection} label="Create task from selection" accent><IconCheckSquare /></TBtn>
              <div style={{ position: "relative" }}>
                <button className="tbtn focusable" style={{ ...S.tbtn, width: "auto", padding: "0 10px", gap: 5, color: insOpen ? T.pink : undefined }} onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setInsOpen((o) => o ? false : { x: Math.min(r.left, (typeof window !== "undefined" ? window.innerWidth : 9999) - 216), y: r.bottom + 6 }); }} aria-expanded={!!insOpen} aria-label="Insert">
                  <IconPlus w={13} /><span style={{ fontSize: 12, fontWeight: 700 }}>Insert</span><IconChevronD w={11} />
                </button>
                {insOpen && (<>
                  <div style={{ position: "fixed", inset: 0, zIndex: 69 }} onClick={() => setInsOpen(false)} />
                  <div style={{ ...S.menu, position: "fixed", left: insOpen.x, top: insOpen.y, right: "auto", minWidth: 196, maxHeight: 300, overflowY: "auto", zIndex: 70 }} role="menu" className="scrollarea">
                    {INSERTS.map((it) => (
                      <button key={it.label} role="menuitem" className="menuItem focusable" style={{ ...S.menuItem, display: "flex", alignItems: "center", gap: 9 }}
                        onClick={() => { insertBlock(it.text); setInsOpen(false); setViewMode((v) => v === "preview" ? "edit" : v); }}>
                        <span style={{ color: T.purple, display: "grid", placeItems: "center" }}>{it.icon}</span>{it.label}
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div className="ribbonGroup" style={{ background: T.panel2, borderRadius: 10, padding: 3, gap: 2 }}>
              {[["edit", "Edit"], ["write", "MD"], ["split", "Split"], ["preview", "Preview"]].map(([m, lbl]) => (
                <button key={m} className={"focusable" + (m === "split" ? " deskonly" : "")} onClick={() => setViewMode(m)} aria-pressed={viewMode === m}
                  style={{ all: "unset", cursor: "pointer", padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: viewMode === m ? "#fff" : T.muted, background: viewMode === m ? T.brandGrad : "transparent", boxShadow: viewMode === m ? `0 3px 10px ${T.purpleGlow}` : "none", transition: "background .2s ease, color .2s ease" }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
            {(() => {
              const CHK = /^\s*- \[[ x]\]/;
              // all mutations go through functional updates — chained ops (commit→add) never read stale body
              const withBody = (fn) => setF((st) => ({ ...st, body: fn(st.body) }));
              const lineOfCheck = (body, idx) => {
                const lines = body.split("\n"); let count = -1;
                for (let i = 0; i < lines.length; i++) if (CHK.test(lines[i])) { count++; if (count === idx) return i; }
                return -1;
              };
              const editCheck = (idx, text) => withBody((b) => {
                const li = lineOfCheck(b, idx); if (li < 0) return b;
                const lines = b.split("\n");
                lines[li] = lines[li].replace(/^(\s*- \[[ x]\]\s?).*$/, "$1") + text;
                return lines.join("\n");
              });
              const addCheck = (afterIdx) => {
                withBody((b) => {
                  const li = lineOfCheck(b, afterIdx); if (li < 0) return b;
                  const lines = b.split("\n");
                  const indent = (lines[li].match(/^\s*/) || [""])[0];
                  lines.splice(li + 1, 0, indent + "- [ ] ");
                  return lines.join("\n");
                });
                setChkFocus({ idx: afterIdx + 1, t: Date.now() });
              };
              const delCheck = (idx) => {
                withBody((b) => {
                  const li = lineOfCheck(b, idx); if (li < 0) return b;
                  const lines = b.split("\n");
                  lines.splice(li, 1);
                  return lines.join("\n");
                });
                setChkFocus(idx > 0 ? { idx: idx - 1, t: Date.now() } : null);
              };
              const toggleCheck = (idx) => withBody((b) => {
                const lines = b.split("\n"); let count = -1;
                for (let i = 0; i < lines.length; i++) { if (CHK.test(lines[i])) { count++; if (count === idx) { lines[i] = lines[i].includes("[ ]") ? lines[i].replace("[ ]", "[x]") : lines[i].replace("[x]", "[ ]"); break; } } }
                return lines.join("\n");
              });
              const editor = (
                <textarea ref={taRef} className="scrollarea editorTa" style={{ ...S.editorBody, height: "100%", caretColor: T.pink }} value={f.body}
                  onChange={(e) => { set("body", e.target.value); checkSlash(e.target); }} onKeyDown={onKeys}
                  onClick={(e) => checkSlash(e.target)} onBlur={() => setTimeout(() => setSlash(null), 150)} onScroll={() => setSlash(null)}
                  placeholder={"Start writing…\n\nTry the ribbon above, or:\n  **bold**  *italic*  ==highlight==\n  - [ ] checklist     [[Note link]]    #tags\n  Insert ▸ charts, flow diagrams, tables, callouts"} aria-label="Note body" />
              );
              const preview = (
                <div ref={previewRef} className="scrollarea previewPane" style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "14px 16px", scrollBehavior: "smooth" }}>
                  <MarkdownView T={T} body={f.body} onWiki={onOpenNoteTitle} onToggleCheck={toggleCheck} onEditCheck={editCheck} onAddCheck={addCheck} onDelCheck={delCheck} focusIdx={chkFocus ? chkFocus.idx : null} />
                </div>
              );
              if (viewMode === "edit") return (
                <BlockEditor T={T} S={S} body={f.body} apply={applyBody} onWiki={onOpenNoteTitle}
                  onFocusedRow={(idx, el) => { activeRow.current = { idx, el }; }}
                  onModShortcut={(e) => {
                    const k = e.key.toLowerCase();
                    if (k === "s") { e.preventDefault(); silentSave(); }
                    else if (k === "b") { e.preventDefault(); wrapSel("**"); }
                    else if (k === "i") { e.preventDefault(); wrapSel("*"); }
                    else if (k === "u") { e.preventDefault(); wrapSel("__"); }
                    else if (k === "e") { e.preventDefault(); wrapSel("`"); }
                    else if (k === "k") { e.preventDefault(); wrapSel("[", "](https://)", "link text"); }
                  }}
                  onSlash={(idx, el) => {
                    if (!el) return;
                    const r = el.getBoundingClientRect();
                    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
                    setInsOpen({ x: Math.min(r.left, W - 216), y: r.bottom + 4 });
                  }}
                  focusReq={blkFocus} onJumpMd={() => setViewMode("write")} />
              );
              if (viewMode === "preview") return preview;
              if (viewMode === "split") return (<>
                <div style={{ flex: 1, minWidth: 0, display: "flex", padding: "4px 2px" }}>{editor}</div>
                <div className="deskonly" style={{ width: 1, background: `linear-gradient(180deg, transparent, ${T.border} 15%, ${T.border} 85%, transparent)` }} />
                <div className="splitPane deskonly" style={{ flex: 1, minWidth: 0, display: "flex" }}>{preview}</div>
              </>);
              return <div style={{ flex: 1, minWidth: 0, display: "flex", padding: "4px 2px" }}>{editor}</div>;
            })()}
            {slash && slashList.length > 0 && (
              <div className="slashMenu" style={{ position: "fixed", left: slash.x, top: slash.y, zIndex: 75, minWidth: 232, background: `linear-gradient(${T.popover},${T.popover}) padding-box, ${T.edge} border-box`, border: "1px solid transparent", borderRadius: 14, padding: 5, boxShadow: `0 22px 60px rgba(0,0,0,0.55), 0 0 30px ${T.purpleGlow}` }} role="listbox" aria-label="Insert command">
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: T.vmuted, padding: "5px 9px 4px", textTransform: "uppercase" }}>{slash.q ? `"${slash.q}"` : "Insert"}</div>
                {slashList.map((c, i) => (
                  <button key={c.label} role="option" aria-selected={i === slash.idx} className="focusable slashItem"
                    onMouseDown={(e) => { e.preventDefault(); runSlash(c); }} onMouseEnter={() => setSlash((p) => p ? { ...p, idx: i } : p)}
                    style={{ all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 9px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: i === slash.idx ? T.text : T.text2, background: i === slash.idx ? T.accentWash : "transparent" }}>
                    <span style={{ width: 26, height: 26, minWidth: 26, borderRadius: 8, display: "grid", placeItems: "center", color: i === slash.idx ? "#fff" : T.purple, background: i === slash.idx ? T.brandGrad : hexA(T.purple, 0.1), transition: "background .15s ease, color .15s ease" }}>{c.icon}</span>
                    {c.label}
                    {i === slash.idx && <span style={{ marginLeft: "auto", fontSize: 10, color: T.vmuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: "1px 5px" }}>↵</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* live document stats */}
          {(() => {
            const words = (f.body.match(/\S+/g) || []).length;
            const boxes = f.body.match(/^\s*- \[[ x]\]/gm) || [];
            const done = boxes.filter((b) => b.includes("[x]")).length;
            const mins = Math.max(1, Math.round(words / 200));
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "5px 16px", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.vmuted, flexWrap: "wrap" }}>
                <span>{words} words</span><span>·</span><span>{f.body.length} chars</span><span>·</span><span>~{mins} min read</span>
                {boxes.length > 0 && (<>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 54, height: 5, borderRadius: 4, background: T.panel2, overflow: "hidden", display: "inline-block" }}>
                      <span style={{ display: "block", height: "100%", width: `${Math.round((done / boxes.length) * 100)}%`, background: T.brandGrad, borderRadius: 4, transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
                    </span>
                    {done}/{boxes.length} done
                  </span>
                </>)}
              </div>
            );
          })()}

          <div className="editorFoot" style={S.editorFoot}>
            {!isNew && <button className="dangerbtn focusable" style={S.dangerBtn} onClick={() => onDelete(f.id)}>Delete</button>}
            {!isNew && <button className="pillbtn focusable" style={S.pill} onClick={() => onArchive(f.id)}><IconArchive w={14} /> Archive</button>}
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 32, height: 32 }} onClick={copyMd} aria-label="Copy as Markdown" title="Copy as Markdown"><IconCopy w={13} /></button>
            <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 32, height: 32 }} onClick={downloadMd} aria-label="Download .md" title="Download .md"><IconDownload w={13} /></button>
            <span style={{ fontSize: 11.5, color: saveFlash ? "#34D399" : T.vmuted, marginLeft: 4, transition: "color .25s ease", fontWeight: saveFlash ? 700 : 400 }}>
              {saveFlash === "copied" ? "Copied ✓" : saveFlash ? "Saved ✓" : data.updatedAt ? `Updated ${relDate(data.updatedAt)}` : "Not saved yet"}
            </span>
            <div style={{ flex: 1 }} />
            <button className="pillbtn focusable" style={S.pill} onClick={onClose}>Cancel</button>
            <button className="gradbtn focusable" style={S.gradBtn} onClick={save}>{isNew ? "Create" : "Save"}</button>
          </div>
        </div>

        {/* metadata panel */}
        {showMeta && (
          <aside className="editorMeta scrollarea" style={S.editorMeta} aria-label="Note details">
            {outline.length > 0 && (<>
              <div style={{ ...S.metaLabel, marginTop: 0 }}>Outline</div>
              <div style={{ display: "grid", gap: 1, marginBottom: 4 }}>
                {outline.map((h) => (
                  <button key={h.n} className="focusable outlineItem" onClick={() => jumpTo(h)}
                    style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", padding: "5px 8px", paddingLeft: 8 + (h.lvl - 1) * 13, borderRadius: 8, fontSize: 12.2, fontWeight: h.lvl === 1 ? 700 : 500, color: h.lvl === 1 ? T.text : T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", borderLeft: `2px solid ${h.lvl === 1 ? hexA(T.purple, 0.6) : "transparent"}` }}
                    title={h.text}>{h.text}</button>
                ))}
              </div>
            </>)}
            <div style={{ ...S.metaLabel, ...(outline.length ? null : { marginTop: 0 }) }}>Type</div>
            <select value={f.type} onChange={(e) => set("type", e.target.value)} style={{ ...S.input, padding: "9px 11px" }}>
              {["note", "daily", "meeting", "trading-journal", "workout-log", "study", "project", "review"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <div style={S.metaLabel}>Category</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CatBadge T={T} id={f.category} color={catColor(f.category)} size={30} />
              <select value={f.category} onChange={(e) => set("category", e.target.value)} style={{ ...S.input, padding: "9px 11px", flex: 1, minWidth: 0 }}>{categories.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}</select>
            </div>

            <div style={S.metaLabel}>Collection</div>
            <select value={f.collectionId || ""} onChange={(e) => set("collectionId", e.target.value || null)} style={{ ...S.input, padding: "9px 11px" }}>
              <option value="">None</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div style={S.metaLabel}>Linked date</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="date" value={f.linkedDate || ""} onChange={(e) => set("linkedDate", e.target.value || null)} style={{ ...S.input, padding: "9px 11px" }} />
              {f.linkedDate && <button className="iconbtn focusable" style={{ ...S.iconBtn, width: 36, height: 36 }} onClick={() => set("linkedDate", null)} aria-label="Clear date"><IconX w={14} /></button>}
            </div>

            <div style={S.metaLabel}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              {[...new Set([...f.tags, ...parseTags(f.body)])].map((t) => (
                <span key={t} style={{ ...S.tagChip, color: T.purple, borderColor: hexA(T.purple, 0.35), display: "inline-flex", alignItems: "center", gap: 4 }}>#{t}{f.tags.includes(t) && <button className="focusable" onClick={() => removeTag(t)} style={{ all: "unset", cursor: "pointer", color: T.muted }} aria-label={`Remove ${t}`}>×</button>}</span>
              ))}
            </div>
            <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && tagDraft.trim()) addTag(tagDraft); }} placeholder="Add tag + Enter" style={{ ...S.input, padding: "8px 11px" }} aria-label="Add tag" />
            {tagDraft && allTags.filter(([t]) => t.includes(tagDraft.toLowerCase()) && !f.tags.includes(t)).slice(0, 4).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                {allTags.filter(([t]) => t.includes(tagDraft.toLowerCase()) && !f.tags.includes(t)).slice(0, 4).map(([t]) => <button key={t} className="focusable" onClick={() => addTag(t)} style={{ ...S.tagChip, cursor: "pointer", color: T.muted, borderColor: T.border }}>#{t}</button>)}
              </div>
            )}

            <div style={S.metaLabel}>Linked tasks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {linkedTasks.length === 0 && <div style={{ fontSize: 12, color: T.vmuted }}>No tasks linked.</div>}
              {linkedTasks.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, background: T.elevated, border: `1px solid ${T.border}`, borderLeft: `3px solid ${catColor(t.category)}`, borderRadius: 10, padding: "7px 9px" }}>
                  <button className="focusable" onClick={() => onOpenTask(t)} style={{ all: "unset", cursor: "pointer", flex: 1, fontSize: 12.5, color: T.text }}>{t.title}</button>
                  <button className="focusable" onClick={() => { set("linkedTaskIds", f.linkedTaskIds.filter((x) => x !== t.id)); if (f.id) unlinkNoteTask(f.id, t.id); }} style={{ all: "unset", cursor: "pointer", color: T.muted }} aria-label="Unlink"><IconX w={12} /></button>
                </div>
              ))}
            </div>
            <button className="pillbtn focusable" style={{ ...S.pill, padding: "7px 11px", marginTop: 6, fontSize: 12.5 }} onClick={() => setLinkPicker((p) => !p)}><IconLink w={13} /> Link a task</button>
            {linkPicker && (
              <div style={{ marginTop: 6, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8 }}>
                <input value={linkQuery} onChange={(e) => setLinkQuery(e.target.value)} placeholder="Search tasks…" style={{ ...S.input, padding: "7px 9px" }} aria-label="Search tasks to link" />
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflow: "auto" }}>
                  {linkCandidates.map((t) => (
                    <button key={t.id} className="menuItem focusable" style={{ ...S.menuItem, display: "flex", alignItems: "center", gap: 6 }} onClick={() => { set("linkedTaskIds", [...f.linkedTaskIds, t.id]); if (f.id) linkNoteTask(f.id, t.id); setLinkPicker(false); setLinkQuery(""); }}>
                      <span style={{ ...S.dot, background: catColor(t.category) }} /> {t.title}
                    </button>
                  ))}
                  {linkCandidates.length === 0 && <div style={{ fontSize: 12, color: T.vmuted, padding: 6 }}>No matching tasks.</div>}
                </div>
              </div>
            )}

            {(wikiTitles.length > 0 || backlinks.length > 0) && <>
              <div style={S.metaLabel}>Links & backlinks</div>
              {wikiTitles.map((w) => <button key={"w" + w} className="focusable" onClick={() => onOpenNoteTitle(w)} style={{ ...S.backlink, color: T.purple }}><IconLink w={12} /> {w}</button>)}
              {backlinks.map((n) => <button key={"b" + n.id} className="focusable" onClick={() => onOpenNoteTitle(n.title)} style={{ ...S.backlink, color: T.pink }}><IconArrowRight w={12} /> {n.title}</button>)}
            </>}
          </aside>
        )}
      </div>
    </Overlay>
  );
}

function ConfirmModal({ T, S, title, body, yesLabel = "Confirm", danger, onYes, onClose }) {
  const ref = useFocusTrap(onClose);
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} style={{ ...S.modal, width: "min(420px,100%)", display: "block", padding: 22 }} role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{body}</div>
        <div style={{ ...S.modalFoot, padding: 0, borderTop: "none", marginTop: 18, background: "transparent" }}><div style={{ flex: 1 }} />
          <button className="pillbtn focusable" style={S.pill} onClick={onClose}>Cancel</button>
          <button className={danger ? "dangerbtn focusable" : "gradbtn focusable"} style={danger ? { ...S.dangerBtn, padding: "9px 18px" } : S.gradBtn} onClick={onYes} autoFocus>{yesLabel}</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ---- Plan-my-day preview: review the auto-proposed schedule before committing ---- */
function PlanPreviewModal({ T, S, catColor, plan, onConfirm, onClose }) {
  const ref = useFocusTrap(onClose);
  const total = plan.assignments.reduce((s, a) => s + a.durationMinutes, 0);
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} style={{ ...S.palette, maxWidth: 460, padding: 0, overflow: "hidden" }} role="dialog" aria-modal="true" aria-label="Plan my day" onClick={(e) => e.stopPropagation()}>
        <div style={{ position: "relative", padding: "18px 18px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(125deg, ${hexA(T.purple, 0.18)}, ${hexA(T.fuchsia, 0.1)} 60%, transparent)` }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: T.brandGrad, display: "grid", placeItems: "center", color: "#fff", boxShadow: `0 6px 18px ${T.purpleGlow}` }}><IconSpark w={19} /></span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: T.text }}>Plan my day</div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>{plan.assignments.length} task{plan.assignments.length === 1 ? "" : "s"} · {Math.round(total / 60 * 10) / 10}h scheduled</div>
            </div>
          </div>
        </div>
        <div className="scrollarea" style={{ maxHeight: "48vh", overflow: "auto", padding: "10px 14px" }}>
          {plan.assignments.map((a, i) => { const c = catColor(a.category); return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 8px", borderRadius: 10, animation: `riseIn .4s cubic-bezier(.16,1,.3,1) both`, animationDelay: `${i * 0.04}s` }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text, width: 62, fontVariantNumeric: "tabular-nums" }}>{to12(a.time)}</span>
              <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: c, boxShadow: `0 0 8px ${hexA(c, 0.6)}` }} />
              <span style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div><div style={{ fontSize: 11, color: T.muted }}>{a.category} · {a.durationMinutes}m</div></span>
            </div>
          ); })}
          {plan.leftover > 0 && <div style={{ fontSize: 12, color: T.vmuted, padding: "8px 8px 2px" }}>{plan.leftover} task{plan.leftover === 1 ? "" : "s"} couldn’t fit before 6pm — left in Anytime.</div>}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
          <button className="ghostbtn focusable" style={{ ...S.ghostBtn, flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
          <button className="gradbtn focusable" style={{ ...S.gradBtn, flex: 1, justifyContent: "center" }} onClick={onConfirm}><IconCheck w={15} /> Apply plan</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ---- Guided weekly review: a calm 3-step ritual to close the week and set the next ---- */
function WeeklyReviewModal({ T, S, catColor, tasks, days, today, todayKey, tasksOnDate, onMove, onOpen, onAddPriority, onClose }) {
  const ref = useFocusTrap(onClose);
  const [step, setStep] = useState(0);
  const [prios, setPrios] = useState(["", "", ""]);
  const [added, setAdded] = useState(false);

  const stats = useMemo(() => {
    let done = 0, total = 0; const perDay = [];
    for (let i = 6; i >= 0; i--) {
      const k = toKey(addDays(today, -i)); const list = tasksOnDate(k);
      const dn = list.filter((t) => isComplete(t, k)).length;
      done += dn; total += list.length; perDay.push({ k, d: addDays(today, -i), done: dn, total: list.length });
    }
    const best = perDay.reduce((a, b) => (b.done > (a ? a.done : -1) ? b : a), null);
    // streak: consecutive days up to today with ≥1 completion
    let streak = 0;
    for (let i = 0; i < 60; i++) { const k = toKey(addDays(today, -i)); const list = tasksOnDate(k); const dn = list.filter((t) => isComplete(t, k)).length; if (dn > 0) streak++; else if (i > 0) break; else break; }
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0, best, perDay };
  }, [tasks, today, tasksOnDate]);

  const loose = useMemo(() => {
    const weekAgo = toKey(addDays(today, -7));
    return tasks.filter((t) => !(t.recurring && t.recurring.enabled) && !t.completed && t.date < todayKey && t.date >= weekAgo).sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, todayKey, today]);
  const [swept, setSwept] = useState({});

  const steps = ["Last week", "Loose ends", "Set the week"];
  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => { prios.forEach((p) => p.trim() && onAddPriority(p.trim())); onClose(); };

  return (
    <Overlay onClose={onClose}>
      <div ref={ref} style={{ ...S.palette, maxWidth: 540, padding: 0, overflow: "hidden", maxHeight: "86vh", display: "flex", flexDirection: "column" }} role="dialog" aria-modal="true" aria-label="Weekly review" onClick={(e) => e.stopPropagation()}>
        {/* header + stepper */}
        <div style={{ position: "relative", padding: "18px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(125deg, ${hexA(T.purple, 0.2)}, ${hexA(T.fuchsia, 0.12)} 55%, transparent)` }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: T.brandGrad, display: "grid", placeItems: "center", color: "#fff", boxShadow: `0 6px 18px ${T.purpleGlow}` }}><IconRepeat w={18} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: T.text }}>Weekly review</div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>{steps[step]} · {step + 1} of 3</div>
            </div>
            <button className="iconbtn focusable" style={S.iconBtn} onClick={onClose} aria-label="Close"><IconX w={16} /></button>
          </div>
          <div style={{ position: "relative", display: "flex", gap: 6 }}>
            {steps.map((_, i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 3, background: i <= step ? T.brandGrad : hexA(T.text, 0.1), transition: "background .3s ease" }} />)}
          </div>
        </div>

        <div className="scrollarea" style={{ flex: 1, overflow: "auto", padding: 18 }}>
          {step === 0 && (
            <div style={{ animation: "fade .3s ease" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: "#000", border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1 }}>{stats.pct}<span style={{ fontSize: 15, color: T.muted }}>%</span></div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>completed</div>
                </div>
                <div style={{ flex: 1, background: "#000", border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1 }}>{stats.done}<span style={{ fontSize: 15, color: T.muted }}>/{stats.total}</span></div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5 }}>tasks done</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.vmuted, marginBottom: 8 }}>YOUR WEEK</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 2px" }}>
                {stats.perDay.map((p) => { const pct = p.total ? p.done / p.total : 0; const isToday = p.k === todayKey; return (
                  <div key={p.k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: "100%", height: 56, display: "flex", alignItems: "flex-end", background: hexA(T.text, 0.05), borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: "100%", height: `${Math.max(pct * 100, p.total ? 8 : 0)}%`, background: pct === 1 && p.total ? "linear-gradient(180deg,#34D399,#2DD4BF)" : T.brandGrad, borderRadius: 6, transition: "height .5s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: isToday ? 800 : 600, color: isToday ? T.pink : T.vmuted }}>{WD[(p.d.getDay() + 6) % 7][0]}</span>
                  </div>
                ); })}
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{stats.pct >= 70 ? "Strong week — you showed up. Carry the momentum." : stats.done > 0 ? "Progress is progress. Let’s tidy up and set the next week." : "Fresh slate. Let’s set up a week worth showing up for."}</div>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: "fade .3s ease" }}>
              {loose.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: T.muted }}><div style={{ fontSize: 30, marginBottom: 8 }}>✨</div>Nothing left hanging. Clean week.</div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>{loose.filter((t) => !swept[t.id]).length} unfinished from the past week. Pull them into today, or leave them.</div>
                  {loose.map((t) => { const c = catColor(t.category); const done = swept[t.id]; return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, marginBottom: 6, background: "#000", border: `1px solid ${T.border}`, opacity: done ? 0.5 : 1 }}>
                      <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: c }} />
                      <span style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: done ? "line-through" : "none" }}>{t.title}</div><div style={{ fontSize: 11, color: T.muted }}>{t.category} · {relDate(t.date)}</div></span>
                      {!done && <button className="pillbtn focusable" style={{ ...S.pill, padding: "6px 11px" }} onClick={() => { onMove(t.id, todayKey); setSwept((s) => ({ ...s, [t.id]: true })); }}>→ Today</button>}
                    </div>
                  ); })}
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fade .3s ease" }}>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 14 }}>What are the 3 things that would make next week a win? They’ll be added to next week.</div>
              {prios.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: hexA(T.purple, 0.15), color: T.purple, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</span>
                  <input value={p} onChange={(e) => setPrios((arr) => arr.map((x, j) => j === i ? e.target.value : x))} placeholder={["Most important outcome…", "Second priority…", "Third priority…"][i]}
                    style={{ flex: 1, background: "#000", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 14, padding: "11px 12px", outline: "none" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
          {step > 0 ? <button className="ghostbtn focusable" style={{ ...S.ghostBtn }} onClick={back}>Back</button> : <button className="ghostbtn focusable" style={{ ...S.ghostBtn }} onClick={onClose}>Skip</button>}
          <div style={{ flex: 1 }} />
          {step < 2 ? <button className="gradbtn focusable" style={{ ...S.gradBtn }} onClick={next}>Next</button>
            : <button className="gradbtn focusable" style={{ ...S.gradBtn }} onClick={finish}><IconCheck w={15} /> Finish review</button>}
        </div>
      </div>
    </Overlay>
  );
}

function CommandPalette({ T, S, catColor, tasks, notes, collections, allTags, templates, onClose, actions }) {
  const ref = useFocusTrap(onClose);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const groups = useMemo(() => {
    const live = (notes || []).filter((n) => !n.archived);
    const acts = [
      { label: "Add task", icon: IconPlus, run: actions.addTask },
      { label: "Add note", icon: IconNote, run: actions.addNote },
      { label: "Create daily note for today", icon: IconSunDay, run: actions.dailyToday },
      { label: "Go to Today", icon: IconCal, run: actions.goToday },
      { label: "Start weekly review", icon: IconRepeat, run: actions.weeklyReview },
      { label: "Open Planner", icon: IconCal, run: actions.openPlanner },
      { label: "Open Dashboard", icon: IconGrid, run: actions.openDashboard },
      { label: "Open Notes", icon: IconNote, run: actions.openNotes },
      { label: "Open Settings", icon: IconGear, run: actions.openSettings },
      { label: "Export Backup", icon: IconExport, run: actions.exportBackup },
      { label: "Import Backup", icon: IconImport, run: actions.importBackup },
      { label: "Toggle Theme", icon: IconSun, run: actions.toggleTheme },
    ].filter((a) => fuzzy(q, a.label));
    const daily = live.filter((n) => n.type === "daily" && (fuzzy(q, n.title) || fuzzy(q, "daily"))).slice(0, 5).map((n) => ({ label: n.title, sub: "Daily note", icon: IconSunDay, color: T.pink, run: () => actions.openNote(n) }));
    const tk = (tasks || []).filter((t) => fuzzy(q, t.title)).slice(0, 6).map((t) => ({ label: t.title, sub: `${t.category}${t.recurring?.enabled ? " · recurring" : " · " + t.date}`, icon: IconCal, color: catColor(t.category), run: () => actions.openTask(t) }));
    const nt = live.filter((n) => n.type !== "daily" && (fuzzy(q, n.title) || fuzzy(q, n.body) || noteTags(n).some((t) => fuzzy(q, t)))).slice(0, 6).map((n) => ({ label: n.title, sub: `Note · ${n.category}`, icon: IconNote, color: catColor(n.category), run: () => actions.openNote(n) }));
    const tpl = (templates || []).filter((t) => fuzzy(q, t.name) || fuzzy(q, "template")).slice(0, 5).map((t) => ({ label: `New: ${t.name}`, sub: "Template", icon: IconLayers, run: () => actions.noteFromTemplate(t) }));
    const tg = (allTags || []).filter(([t]) => q && fuzzy(q, t)).slice(0, 5).map(([t, n]) => ({ label: `#${t}`, sub: `${n} note${n === 1 ? "" : "s"}`, icon: IconHash, color: T.purple, run: actions.openNotes }));
    const cl = (collections || []).filter((c) => q && fuzzy(q, c.name)).slice(0, 4).map((c) => ({ label: c.name, sub: "Collection", icon: IconFolder, color: c.color, run: actions.openNotes }));
    const g = [];
    if (acts.length) g.push({ name: "Actions", items: acts });
    if (daily.length) g.push({ name: "Daily Notes", items: daily });
    if (tk.length) g.push({ name: "Tasks", items: tk });
    if (nt.length) g.push({ name: "Notes", items: nt });
    if (tpl.length) g.push({ name: "Templates", items: tpl });
    if (cl.length) g.push({ name: "Collections", items: cl });
    if (tg.length) g.push({ name: "Tags", items: tg });
    return g;
  }, [q, tasks, notes, collections, allTags, templates]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => { setIdx(0); }, [q]);
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(flat.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") { e.preventDefault(); flat[idx]?.run(); }
  };
  let running = -1;
  return (
    <Overlay onClose={onClose} top>
      <div ref={ref} style={S.palette} role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div style={S.palInputWrap}>
          <IconSearch />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search tasks, notes, daily, templates, tags…" style={S.palInput} aria-label="Command search" />
          <span style={{ fontSize: 11, color: T.vmuted, border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 6px" }}>ESC</span>
        </div>
        <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{q ? `${flat.length} result${flat.length === 1 ? "" : "s"}` : ""}</div>
        <div className="scrollarea" style={S.palList}>
          {flat.length === 0 && <div style={{ padding: 20, color: T.vmuted, fontSize: 13 }}>No results.</div>}
          {groups.map((g) => (
            <div key={g.name}>
              <div style={S.palGroup}>{g.name}</div>
              {g.items.map((it) => { running++; const i = running; const Icon = it.icon; const active = i === idx;
                return (
                  <button key={i} onMouseEnter={() => setIdx(i)} onClick={it.run} style={{ ...S.palItem, ...(active ? S.palItemActive : null) }}>
                    <span style={{ color: it.color || (active ? T.pink : T.muted), display: "grid", placeItems: "center" }}><Icon w={16} /></span>
                    <span style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13.5, color: T.text, fontWeight: 600 }}>{it.label}</div>{it.sub && <div style={{ fontSize: 11.5, color: T.muted }}>{it.sub}</div>}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

/* ============================================================
   12. SHARED UI + HOOKS + ICONS
   ============================================================ */
/* ---- Celebration confetti (fired when a task is completed) ---- */
function Celebration({ x, y, color, big, T }) {
  const palette = big ? ["#A855F7", "#D946EF", "#F472B6", "#FACC15", "#34D399", "#FFFFFF"] : [color, color, T.pink, T.fuchsia, "#FFFFFF"];
  const count = big ? 44 : 20;
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => {
    const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist = (big ? 90 : 46) + Math.random() * (big ? 120 : 54);
    const r = Math.random();
    return {
      dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - (big ? 30 : 18),
      rot: (Math.random() * 360) | 0, size: (big ? 6 : 5) + Math.random() * 5,
      col: palette[(Math.random() * palette.length) | 0], delay: Math.random() * 60,
      shape: r < 0.22 ? "star" : r < 0.6 ? "dot" : "square",
    };
  }), []);
  const STAR_CLIP = "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)";
  return (
    <div aria-hidden style={{ position: "fixed", left: x, top: y, zIndex: 80, pointerEvents: "none", width: 0, height: 0 }}>
      <div className="celebRing" style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${big ? T.pink : color}`, opacity: 0.9 }} />
      <div className="celebRing" style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${hexA("#FFFFFF", 0.8)}`, opacity: 0.7, animationDelay: "90ms", animationFillMode: "both" }} />
      {parts.map((p, i) => (
        <span key={i} className="celebPart" style={{
          position: "absolute", left: 0, top: 0,
          width: p.shape === "star" ? p.size * 1.7 : p.size, height: p.shape === "star" ? p.size * 1.7 : p.size,
          background: p.col,
          borderRadius: p.shape === "dot" ? "50%" : 2,
          clipPath: p.shape === "star" ? STAR_CLIP : "none",
          ["--dx"]: `${p.dx}px`, ["--dy"]: `${p.dy}px`, ["--rot"]: `${p.rot}deg`,
          animationDelay: `${p.delay}ms`, boxShadow: p.shape === "star" ? "none" : `0 0 6px ${hexA(p.col, 0.6)}`,
        }} />
      ))}
    </div>
  );
}

/* Portal: render into document.body to escape transformed ancestors.
   Uses the global ReactDOM.createPortal (available in the artifact runtime and Vite builds)
   without statically importing "react-dom" (which the artifact sandbox rejects).
   Falls back to inline rendering if unavailable, so it never crashes. */
function Portal({ children }) {
  const [el, setEl] = useState(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const node = document.createElement("div");
    node.setAttribute("data-portal", "task-sheet");
    document.body.appendChild(node);
    setEl(node);
    return () => { try { document.body.removeChild(node); } catch {} };
  }, []);
  const RD = (typeof window !== "undefined" && window.ReactDOM) ? window.ReactDOM : null;
  if (RD && typeof RD.createPortal === "function" && el) {
    return RD.createPortal(children, el);
  }
  // fallback: render inline so the sheet still appears (no crash if portal API is unavailable)
  return <div data-portal-fallback="task-sheet">{children}</div>;
}

/* Top-level task action sheet. Rendered as a sibling of the modals via Overlay,
   so it lives at the app root and can never be clipped by a transformed/overflow ancestor.
   No portal / react-dom dependency. */
function TaskSheet({ T, S, catColor, sheet, today, onClose, onEdit, onToggle, onFocus, onDuplicate, onPriority, onMove, onDelete }) {
  const ref = useFocusTrap(onClose);
  const { task, dateKey } = sheet;
  const done = isComplete(task, dateKey);
  const recurring = task.recurring && task.recurring.enabled;
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} className="actionSheet" style={S.actionSheet} role="menu" aria-label="Task actions" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHandle" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 16px 10px" }}>
          <span style={{ ...S.dot, background: catColor(task.category) }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
        </div>
        <div className="scrollarea" style={{ overflowY: "auto", maxHeight: "60vh", paddingBottom: 4 }}>
          <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onEdit(task)}><IconPencil w={16} /> Edit</button>
          <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onToggle(task, dateKey)}><IconCheck2 w={16} /> {done ? "Mark active" : "Mark done"}</button>
          {!done && <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onFocus(task)}><IconFlame w={16} /> Start focus</button>}
          <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onDuplicate(task)}><IconCopy w={16} /> Duplicate</button>
          <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onPriority(task)}><IconFlag w={16} /> Cycle priority ({task.priority})</button>
          {!recurring && <>
            <div style={S.menuSep} />
            <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onMove(task, toKey(today))}><IconArrowRight w={16} /> Move to Today</button>
            <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onMove(task, toKey(addDays(today, 1)))}><IconArrowRight w={16} /> Move to Tomorrow</button>
            <button role="menuitem" className="menuItem focusable" style={S.sheetItem} onClick={() => onMove(task, toKey(addDays(fromKey(dateKey), 1)))}><IconArrowRight w={16} /> Move to next day</button>
            <label role="menuitem" className="menuItem focusable" style={{ ...S.sheetItem, position: "relative", cursor: "pointer" }}><IconCal w={16} /> Move to date…
              <input type="date" defaultValue={dateKey} onChange={(e) => { if (e.target.value) onMove(task, e.target.value); }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} aria-label="Move task to date" />
            </label>
          </>}
          <div style={S.menuSep} />
          <button role="menuitem" className="menuItem focusable" style={{ ...S.sheetItem, color: "#FB7185" }} onClick={() => onDelete(task)}><IconTrash w={16} /> Delete</button>
        </div>
        <button className="pillbtn focusable deskHideSheet" style={{ ...S.pill, width: "calc(100% - 32px)", margin: "8px 16px 0", justifyContent: "center" }} onClick={onClose}>Cancel</button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose, top }) {
  return <div className="modalOverlay" style={{ position: "fixed", inset: 0, background: "rgba(5,3,10,0.72)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: top ? "flex-start" : "center", paddingTop: top ? "12vh" : 0, padding: top ? "12vh 20px 20px" : 20, boxSizing: "border-box", zIndex: 50, animation: "fade .15s ease" }} onClick={onClose}>{children}</div>;
}
function Field({ T, label, children, flex }) {
  return <div style={{ marginBottom: 14, ...(flex ? { flex: 1, minWidth: 0 } : null) }}><div style={{ fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>{label}</div>{children}</div>;
}
/* Debounced persistence: coalesces rapid writes, and flushes immediately on tab-hide,
   page unload, and unmount so the latest state is never lost. */
function useDebouncedWrite(value, writer, delay = 500) {
  const valRef = useRef(value); valRef.current = value;
  const writerRef = useRef(writer); writerRef.current = writer;
  const tRef = useRef(null);
  const firstRef = useRef(true);
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; } // don't rewrite freshly-loaded data
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => writerRef.current(valRef.current), delay);
    return () => clearTimeout(tRef.current);
  }, [value, delay]);
  useEffect(() => {
    const flush = () => { clearTimeout(tRef.current); try { writerRef.current(valRef.current); } catch {} };
    const onVis = () => { if (typeof document !== "undefined" && document.visibilityState === "hidden") flush(); };
    if (typeof window !== "undefined") window.addEventListener("beforeunload", flush);
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVis);
    return () => {
      flush();
      if (typeof window !== "undefined") window.removeEventListener("beforeunload", flush);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}
function useFocusTrap(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const node = ref.current;
    const sel = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || !node) return;
      const els = [...node.querySelectorAll(sel)].filter((el) => !el.disabled && el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (prev && prev.focus) try { prev.focus(); } catch {} };
  }, [onClose]);
  return ref;
}
function relDate(iso) {
  const d = new Date(iso); const t = new Date(); t.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const diff = Math.round((t - dd) / 864e5);
  if (diff === 0) return "Today"; if (diff === 1) return "Yesterday"; if (diff < 7) return `${diff} days ago`;
  return `${MO[d.getMonth()]} ${d.getDate()}`;
}
function hexA(hex, a) {
  const h = hex.replace("#", ""); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* icons */
function S0(w = 18) { return { width: w, height: w, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", shapeRendering: "geometricPrecision" }; }
function IconCal({ w }) { return <svg {...S0(w)}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>; }
function IconGrid({ w }) { return <svg {...S0(w)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>; }
function IconNote({ w }) { return <svg {...S0(w)}><path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5M8 13h8M8 17h5" /></svg>; }
function IconLayers({ w }) { return <svg {...S0(w)}><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" /></svg>; }
function IconTable({ w }) { return <svg {...S0(w)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16M15 4v16" /></svg>; }
function IconTag({ w }) { return <svg {...S0(w)}><path d="M20 11l-8 8-9-9V4a1 1 0 0 1 1-1h6l10 10z" /><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" /></svg>; }
function IconChart({ w }) { return <svg {...S0(w)}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>; }
function IconGear({ w }) { return <svg {...S0(w)}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.5A1.7 1.7 0 0 0 11 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 11h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z" /></svg>; }
function IconPlus({ w = 16 }) { return <svg {...S0(w)}><path d="M12 5v14M5 12h14" /></svg>; }
function IconChevron({ w = 18, style }) { return <svg {...S0(w)} style={style}><path d="M9 6l6 6-6 6" /></svg>; }
function IconMenu({ w }) { return <svg {...S0(w)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>; }
function IconDots({ w = 18 }) { return <svg {...S0(w)}><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" /></svg>; }
function IconSun({ w }) { return <svg {...S0(w)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>; }
function IconExport({ w }) { return <svg {...S0(w)}><path d="M12 3v12M8 7l4-4 4 4M5 21h14a1 1 0 0 0 1-1v-5" /></svg>; }
function IconImport({ w }) { return <svg {...S0(w)}><path d="M12 15V3M8 11l4 4 4-4M5 21h14a1 1 0 0 0 1-1v-5" /></svg>; }
function IconFlag({ w = 13, color }) { return <svg {...S0(w)} style={{ color: color || "currentColor" }}><path d="M5 21V4M5 4h12l-2 3.5L17 11H5" /></svg>; }
function IconClock({ w = 12 }) { return <svg {...S0(w)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
function IconCheck({ w = 11 }) { return <svg {...S0(w)} style={{ strokeWidth: 2.6, color: "#0a0512" }}><path d="M5 12l4 4 10-10" /></svg>; }
function IconFlame({ w = 18 }) { return <svg {...S0(w)} style={{ color: "#FB923C", fill: "rgba(251,146,60,0.15)" }}><path d="M12 3c2 3 4 5 4 9a4 4 0 0 1-8 0c0-1 .5-2 1-3-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-4-7-6-11z" /></svg>; }
function IconSpark({ w = 16 }) { return <svg {...S0(w)} style={{ color: "currentColor" }}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>; }
function IconX({ w = 18 }) { return <svg {...S0(w)}><path d="M6 6l12 12M18 6L6 18" /></svg>; }
function IconSearch({ w = 18 }) { return <svg {...S0(w)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>; }
function IconRepeat({ w = 14 }) { return <svg {...S0(w)}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>; }
function IconPin({ w = 13 }) { return <svg {...S0(w)} style={{ color: "#FBBF24" }}><path d="M12 17v5M9 3h6l-1 7 3 3H7l3-3-1-7z" /></svg>; }
function IconArrowRight({ w = 14, style }) { return <svg {...S0(w)} style={style}><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
/* ---- CatScene: a distinct illustrated banner per category (relevant motif on its own gradient) ---- */
const CAT_SCENE = {
  Trading:    { grad: ["#F97316", "#FB923C", "#FBBF24"] },
  Finance:    { grad: ["#EAB308", "#FBBF24", "#F59E0B"] },
  Work:       { grad: ["#0EA5E9", "#38BDF8", "#22D3EE"] },
  Creative:   { grad: ["#D946EF", "#E879F9", "#F0ABFC"] },
  Errands:    { grad: ["#84CC16", "#A3E635", "#BEF264"] },
  Home:       { grad: ["#F59E0B", "#FBBF24", "#FCD34D"] },
  Travel:     { grad: ["#06B6D4", "#22D3EE", "#67E8F9"] },
  Admin:      { grad: ["#64748B", "#94A3B8", "#A5B4FC"] },
  Mindfulness:{ grad: ["#10B981", "#34D399", "#6EE7B7"] },
  Study:      { grad: ["#8B5CF6", "#A78BFA", "#C4B5FD"] },
  Build:      { grad: ["#3B82F6", "#60A5FA", "#38BDF8"] },
  Health:     { grad: ["#EF4444", "#FB7185", "#FDA4AF"] },
  Social:     { grad: ["#EC4899", "#F472B6", "#F9A8D4"] },
  Personal:   { grad: ["#A855F7", "#EC4899", "#FB7185"] },
};
function CatScene({ T, id, color, h = 92 }) {
  const sc = CAT_SCENE[id] || { grad: [color, T.pink, T.fuchsia] };
  const [a, b, c] = sc.grad;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", background: `linear-gradient(125deg, ${a} 0%, ${b} 52%, ${c} 100%)` }}>
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 44%)" }} />
      <span style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, ${hexA("#000000", 0.34)}, transparent 58%)` }} />
      <svg viewBox="0 0 160 92" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", right: -6, top: 0, height: "100%", width: 150, opacity: 0.96 }}>
        <CatSceneArt id={id} />
      </svg>
    </div>
  );
}
function CatSceneArt({ id }) {
  const W = "rgba(255,255,255,0.95)", Wm = "rgba(255,255,255,0.55)", Wf = "rgba(255,255,255,0.18)";
  const S = { stroke: W, strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  switch (id) {
    case "Trading": return <g>{/* candlesticks */}
      {[[96, 30, 24], [116, 20, 40], [136, 38, 18]].map(([x, y, bh], i) => <g key={i} className="mmFloat" style={{ animationDelay: `${i * 0.3}s`, transformBox: "fill-box", transformOrigin: "center" }}><line x1={x} y1={y - 8} x2={x} y2={y + bh + 8} stroke={Wm} strokeWidth="3" /><rect x={x - 6} y={y} width="12" height={bh} rx="2" fill={i === 1 ? W : Wf} stroke={W} strokeWidth="2.5" /></g>)}
      <path className="mmDraw" d="M84 56 L104 40 L124 48 L146 22" stroke={W} strokeWidth="3.5" fill="none" /></g>;
    case "Finance": return <g>{/* stacked coins */}
      {[64, 50, 36].map((y, i) => <ellipse key={i} className="mmFloat" style={{ animationDelay: `${i * 0.25}s`, transformBox: "fill-box", transformOrigin: "center" }} cx="116" cy={y + 14} rx="26" ry="9" fill={i === 0 ? W : Wf} stroke={W} strokeWidth="3" />)}
      <text x="116" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="rgba(0,0,0,0.35)">$</text></g>;
    case "Work": return <g>{/* briefcase */}
      <rect x="86" y="40" width="60" height="42" rx="7" fill={Wf} stroke={W} strokeWidth="4" />
      <path d="M104 40 v-8 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 v8" {...S} />
      <line x1="86" y1="58" x2="146" y2="58" stroke={Wm} strokeWidth="3" /><rect x="108" y="54" width="16" height="9" rx="2" fill={W} /></g>;
    case "Creative": return <g>{/* palette */}
      <path className="mmFloat" style={{ transformBox: "fill-box", transformOrigin: "center" }} d="M116 30 a28 26 0 1 0 4 52 c-7 0 -6 -8 -1 -11 c6 -3 14 1 18 -6 a28 26 0 0 0 -21 -35 Z" fill={Wf} stroke={W} strokeWidth="3.5" />
      {[[104, 48], [118, 42], [132, 50], [124, 64]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={W} />)}</g>;
    case "Errands": return <g>{/* shopping cart */}
      <path {...S} d="M84 38 h10 l8 34 h34 l8 -24 h-44" />
      <circle cx="106" cy="80" r="5" fill={W} /><circle cx="136" cy="80" r="5" fill={W} /></g>;
    case "Home": return <g>{/* house */}
      <path className="mmFloat" style={{ transformBox: "fill-box", transformOrigin: "center" }} d="M82 56 L116 28 L150 56" {...S} />
      <rect x="92" y="56" width="48" height="30" rx="3" fill={Wf} stroke={W} strokeWidth="4" /><rect x="108" y="66" width="16" height="20" fill={W} /></g>;
    case "Travel": return <g>{/* paper plane */}
      <path className="mmFloat" style={{ transformBox: "fill-box", transformOrigin: "center" }} d="M142 26 L92 50 L112 58 L120 78 L142 26 Z" fill={Wf} stroke={W} strokeWidth="4" />
      <path d="M112 58 L142 26" stroke={Wm} strokeWidth="3" /><path className="mmDraw" d="M80 70 q14 -10 26 -4" stroke={Wm} strokeWidth="3" fill="none" /></g>;
    case "Admin": return <g>{/* clipboard */}
      <rect x="90" y="30" width="52" height="56" rx="6" fill={Wf} stroke={W} strokeWidth="4" />
      <rect x="106" y="24" width="20" height="12" rx="3" fill={W} />
      {[46, 58, 70].map((y, i) => <line key={i} x1="100" y1={y} x2="132" y2={y} stroke={Wm} strokeWidth="3" />)}</g>;
    case "Mindfulness": return <g>{/* lotus */}
      {[0, 40, -40, 75, -75].map((r, i) => <path key={i} className="mmFloat" style={{ animationDelay: `${i * 0.15}s`, transformBox: "fill-box", transformOrigin: "116px 64px" }} d="M116 64 q-9 -22 0 -38 q9 16 0 38" fill={i === 0 ? W : Wf} stroke={W} strokeWidth="2.5" transform={`rotate(${r} 116 64)`} />)}
      <ellipse cx="116" cy="66" rx="20" ry="5" fill={Wm} /></g>;
    case "Study": return <g>{/* open book */}
      <path className="mmFloat" style={{ transformBox: "fill-box", transformOrigin: "center" }} d="M84 40 q16 -8 32 0 v40 q-16 -8 -32 0 Z" fill={Wf} stroke={W} strokeWidth="3.5" />
      <path d="M116 40 q16 -8 32 0 v40 q-16 -8 -32 0 Z" fill={Wf} stroke={W} strokeWidth="3.5" /><line x1="116" y1="40" x2="116" y2="80" stroke={W} strokeWidth="3" /></g>;
    case "Build": return <g>{/* code brackets */}
      <path className="mmDraw" d="M104 36 L84 58 L104 80" {...S} strokeWidth="5" />
      <path className="mmDraw" d="M128 36 L148 58 L128 80" {...S} strokeWidth="5" /><line x1="122" y1="32" x2="110" y2="84" stroke={Wm} strokeWidth="4" /></g>;
    case "Health": return <g>{/* dumbbell */}
      <line x1="92" y1="58" x2="140" y2="58" stroke={W} strokeWidth="6" />
      {[[88, 14], [144, 14]].map(([x, hh], i) => <rect key={i} className="mmFloat" style={{ animationDelay: `${i * 0.2}s`, transformBox: "fill-box", transformOrigin: "center" }} x={x - 7} y={58 - 16} width="14" height="32" rx="4" fill={Wf} stroke={W} strokeWidth="3.5" />)}</g>;
    case "Social": return <g>{/* two people */}
      <circle cx="104" cy="42" r="11" fill={Wf} stroke={W} strokeWidth="3.5" /><path d="M86 80 a18 16 0 0 1 36 0" fill={Wf} stroke={W} strokeWidth="3.5" />
      <circle cx="132" cy="46" r="9" fill={W} /><path d="M120 80 a14 13 0 0 1 28 0" fill={Wm} /></g>;
    case "Personal": return <g>{/* heart */}
      <path className="mmFloat" style={{ transformBox: "fill-box", transformOrigin: "center" }} d="M116 80 C 86 60, 90 36, 108 36 C 116 36, 116 44, 116 44 C 116 44, 116 36, 124 36 C 142 36, 146 60, 116 80 Z" fill={Wf} stroke={W} strokeWidth="4" /></g>;
    default: return <g><circle cx="116" cy="56" r="22" fill={Wf} stroke={W} strokeWidth="4" /></g>;
  }
}
/* ---- VividMesh: a sharp saturated gradient + a motif of crisp shapes unique to each tab ---- */
function MeshGlow({ colors, className, style, motif }) {
  const cs = colors || ["#A855F7", "#EC4899", "#38BDF8"];
  const a = cs[0], b = cs[1] || cs[0], c = cs[2] || cs[1] || cs[0];
  return (
    <div aria-hidden className={"vividMesh " + (className || "")} style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none", background: `linear-gradient(125deg, ${a} 0%, ${b} 50%, ${c} 100%)`, ...style }}>
      <span className="vmShine" />
      {motif ? <MeshMotif motif={motif} /> : (<>
        <span className="vmRing vmr1" style={{ borderColor: hexA("#FFFFFF", 0.3) }} />
        <span className="vmDot vmd2" style={{ background: hexA(a, 0.55) }} />
      </>)}
    </div>
  );
}
/* crisp white line-art motifs, drawn large on the right of each banner — distinct per tab */
function MeshMotif({ motif }) {
  const W = "rgba(255,255,255,0.9)", Wd = "rgba(255,255,255,0.5)", Wf = "rgba(255,255,255,0.16)";
  const wrap = (children, extra) => (
    <svg className="meshMotif" viewBox="0 0 120 120" fill="none" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 132, height: 132, opacity: 0.95, ...extra }}>{children}</svg>
  );
  if (motif === "dashboard") return wrap(<g stroke={W} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <rect className="mmFloat" x="14" y="60" width="18" height="44" rx="4" fill={Wf} />
    <rect className="mmFloat mmF2" x="42" y="40" width="18" height="64" rx="4" fill={Wf} />
    <rect className="mmFloat mmF3" x="70" y="22" width="18" height="82" rx="4" fill={Wf} />
    <path className="mmDraw" d="M14 54 L42 36 L70 44 L98 16" stroke={W} strokeWidth="5" fill="none" />
    <circle cx="98" cy="16" r="5" fill={W} stroke="none" />
  </g>);
  if (motif === "tables") return wrap(<g stroke={W} strokeWidth="4.5" strokeLinejoin="round">
    <rect x="20" y="20" width="80" height="80" rx="8" fill={Wf} />
    <line x1="20" y1="46" x2="100" y2="46" /><line x1="20" y1="72" x2="100" y2="72" />
    <line x1="47" y1="20" x2="47" y2="100" /><line x1="73" y1="20" x2="73" y2="100" />
    <rect className="mmFloat" x="22" y="22" width="23" height="22" rx="3" fill="rgba(255,255,255,0.32)" stroke="none" />
  </g>);
  if (motif === "templates") return wrap(<g stroke={W} strokeWidth="4.5" strokeLinejoin="round">
    <path className="mmFloat mmF3" d="M30 40 l30 -16 l30 16 l-30 16 Z" fill="rgba(255,255,255,0.30)" />
    <path className="mmFloat mmF2" d="M30 58 l30 -16 l30 16 l-30 16 Z" fill="rgba(255,255,255,0.20)" />
    <path className="mmFloat" d="M30 76 l30 -16 l30 16 l-30 16 Z" fill={Wf} />
  </g>);
  if (motif === "categories") return wrap(<g>
    <rect className="mmFloat" x="22" y="22" width="34" height="34" rx="9" fill="rgba(255,255,255,0.28)" />
    <rect className="mmFloat mmF2" x="64" y="22" width="34" height="34" rx="9" fill="rgba(255,255,255,0.18)" />
    <rect className="mmFloat mmF3" x="22" y="64" width="34" height="34" rx="9" fill="rgba(255,255,255,0.22)" />
    <rect className="mmFloat mmF2" x="64" y="64" width="34" height="34" rx="9" fill="rgba(255,255,255,0.14)" />
  </g>);
  if (motif === "analytics") return wrap(<g stroke={W} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path className="mmDraw" d="M16 92 C 36 92, 40 40, 60 40 S 84 78, 104 28" />
    <circle className="mmFloat" cx="60" cy="40" r="6" fill={W} stroke="none" />
    <circle className="mmFloat mmF2" cx="104" cy="28" r="6" fill={W} stroke="none" />
    <line x1="16" y1="104" x2="104" y2="104" stroke={Wd} strokeWidth="3" />
  </g>);
  if (motif === "settings") return wrap(<g stroke={W} strokeWidth="5" strokeLinecap="round" fill="none">
    <g className="mmSpin" style={{ transformOrigin: "60px 60px" }}>
      <circle cx="60" cy="60" r="20" fill={Wf} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => <rect key={d} x="57" y="30" width="6" height="12" rx="2" fill={W} stroke="none" transform={`rotate(${d} 60 60)`} />)}
      <circle cx="60" cy="60" r="8" fill="rgba(255,255,255,0.4)" stroke="none" />
    </g>
  </g>);
  if (motif === "notes") return wrap(<g stroke={W} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    <rect className="mmFloat" x="26" y="20" width="60" height="80" rx="8" fill={Wf} />
    <line className="mmDraw" x1="38" y1="40" x2="74" y2="40" /><line className="mmDraw" x1="38" y1="54" x2="74" y2="54" /><line className="mmDraw" x1="38" y1="68" x2="62" y2="68" />
    {/* pen */}
    <g className="mmFloat mmF2" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <path d="M84 50 L100 66 L74 92 L58 76 Z" fill="rgba(255,255,255,0.28)" stroke={W} strokeWidth="4" />
      <path d="M58 76 L52 98 L74 92" fill={W} stroke="none" />
    </g>
  </g>);
  return null;
}
/* ---- Brand mark: orbiting electrons around a pulsing core ---- */
function OrbitMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
      <circle className="orbitCore" cx="12" cy="12" r="3" fill="#fff" />
      <g className="orbitSpinA" style={{ transformOrigin: "12px 12px" }}>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#fff" strokeWidth="1.3" opacity="0.85" />
        <circle cx="22" cy="12" r="1.5" fill="#fff" />
      </g>
      <g className="orbitSpinB" style={{ transformOrigin: "12px 12px" }}>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="#fff" strokeWidth="1.3" opacity="0.85" transform="rotate(60 12 12)" />
        <circle cx="7" cy="20.66" r="1.3" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  );
}

/* ============================================================
   CARD ARTWORK — premium illustrated scenes (à la Fabulous/Habitica)
   Layered SVG: soft hills, foliage, drifting light, themed motif.
   ============================================================ */
function SceneArt({ T, motif = "default", color, h = 116 }) {
  const c = color || T.purple;
  const uid = "sc" + Math.abs((motif + c).split("").reduce((a, x) => a + x.charCodeAt(0), 0) % 99991);
  return (
    <div className="sceneArt" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`0 0 400 ${h}`} preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
        <defs>
          <linearGradient id={uid + "sky"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(c, 0.22)} /><stop offset="100%" stopColor={hexA(c, 0.02)} /></linearGradient>
          <radialGradient id={uid + "sun"} cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor={hexA(c, 0.55)} /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <linearGradient id={uid + "h1"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(c, 0.30)} /><stop offset="100%" stopColor={hexA(c, 0.12)} /></linearGradient>
          <linearGradient id={uid + "h2"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(T.pink, 0.22)} /><stop offset="100%" stopColor={hexA(T.pink, 0.08)} /></linearGradient>
        </defs>
        <rect width="400" height={h} fill={`url(#${uid}sky)`} />
        <circle className="scSun" cx="320" cy="34" r="50" fill={`url(#${uid}sun)`} />
        <circle cx="320" cy="34" r="13" fill={hexA(c, 0.6)} />
        <circle className="scMote scMoteA" cx="80" cy="30" r="2" fill={hexA("#FFFFFF", 0.5)} />
        <circle className="scMote scMoteB" cx="180" cy="20" r="1.5" fill={hexA("#FFFFFF", 0.4)} />
        <circle className="scMote scMoteC" cx="260" cy="44" r="1.8" fill={hexA(T.pink, 0.5)} />
        <path className="scHillBack" d={`M0 ${h} L0 ${h - 34} Q100 ${h - 58} 200 ${h - 40} T400 ${h - 44} L400 ${h} Z`} fill={`url(#${uid}h2)`} />
        <path d={`M0 ${h} L0 ${h - 18} Q120 ${h - 40} 240 ${h - 22} T400 ${h - 26} L400 ${h} Z`} fill={`url(#${uid}h1)`} />
        <SceneMotif T={T} motif={motif} c={c} h={h} />
      </svg>
    </div>
  );
}
function SceneMotif({ T, motif, c, h }) {
  const tree = (x, y, s, col) => (
    <g className="scTree" style={{ transformOrigin: `${x}px ${y}px` }}>
      <rect x={x - 1.5 * s} y={y} width={3 * s} height={10 * s} rx={1.5} fill={hexA("#000000", 0.4)} />
      <circle cx={x} cy={y - 4 * s} r={7 * s} fill={col} /><circle cx={x - 4 * s} cy={y - 1 * s} r={5 * s} fill={hexA(col, 0.85)} /><circle cx={x + 4 * s} cy={y - 1 * s} r={5 * s} fill={hexA(col, 0.9)} />
    </g>
  );
  const leaf = (x, y, r, col) => <path className="scLeaf" style={{ transformOrigin: `${x}px ${y}px` }} transform={`rotate(${r} ${x} ${y})`} d={`M${x} ${y} q8 -10 0 -20 q-8 10 0 20`} fill={col} />;
  if (motif === "trees") return <g>{tree(50, h - 20, 1.5, hexA(T.purple, 0.5))}{tree(110, h - 16, 1.1, hexA(T.pink, 0.45))}{leaf(300, h - 30, 20, hexA(c, 0.4))}{leaf(340, h - 24, -30, hexA(T.pink, 0.35))}</g>;
  if (motif === "peaks") return <g><path d={`M30 ${h - 14} l34 -46 l34 46 Z`} fill={hexA(c, 0.4)} /><path d={`M90 ${h - 14} l28 -36 l28 36 Z`} fill={hexA(T.pink, 0.3)} /><path d="M58 70 l6 -8 l6 8 Z" fill={hexA("#FFFFFF", 0.6)} /></g>;
  if (motif === "waves") return <g><path className="scWave" d={`M0 ${h - 16} q50 -10 100 0 t100 0 t100 0 t100 0`} stroke={hexA(c, 0.5)} strokeWidth="2.5" fill="none" /><path className="scWave scWave2" d={`M0 ${h - 8} q50 -8 100 0 t100 0 t100 0 t100 0`} stroke={hexA(T.pink, 0.4)} strokeWidth="2" fill="none" /></g>;
  if (motif === "bloom") return <g>{leaf(60, h - 22, 0, hexA(c, 0.5))}{leaf(60, h - 22, 72, hexA(c, 0.45))}{leaf(60, h - 22, 144, hexA(T.pink, 0.4))}{leaf(60, h - 22, 216, hexA(c, 0.42))}{leaf(60, h - 22, 288, hexA(T.pink, 0.38))}<circle cx="60" cy={h - 22} r="5" fill={hexA(T.pink, 0.7)} /></g>;
  if (motif === "spark") return <g><path className="scSpark" d={`M70 ${h - 30} l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 Z`} fill={hexA(c, 0.6)} /><path className="scSpark" style={{ animationDelay: ".7s" }} d={`M130 ${h - 22} l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 Z`} fill={hexA(T.pink, 0.5)} /></g>;
  if (motif === "city") return <g>
    {[[28, 34], [44, 52], [60, 24], [76, 44], [92, 30], [108, 50]].map(([x, bh], i) => <rect key={i} className="scTree" style={{ transformOrigin: `${x}px ${h - 14}px`, animationDelay: `${i * 0.3}s` }} x={x} y={h - 14 - bh} width="12" height={bh} rx="2" fill={hexA(i % 2 ? T.pink : c, 0.35 + (i % 3) * 0.06)} />)}
    {[[34, 40], [50, 30], [82, 36]].map(([x, y], i) => <rect key={"w" + i} x={x} y={h - y} width="2" height="2" fill={hexA("#FFF", 0.5)} />)}
  </g>;
  if (motif === "stars") return <g>
    {[[40, 26, 1], [90, 18, 2], [150, 34, 1.4], [210, 22, 1], [120, 50, 1.6], [70, 44, 1.2]].map(([x, y, r], i) => <circle key={i} className="scSpark" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: `${x}px ${y}px` }} cx={x} cy={y} r={r} fill={hexA(i % 2 ? T.pink : "#FFF", 0.7)} />)}
    <path className="scMoteA" d={`M250 28 q14 -6 26 4`} stroke={hexA(c, 0.4)} strokeWidth="1.5" fill="none" />
  </g>;
  if (motif === "bars") return <g>
    {[[40, 30], [62, 48], [84, 22], [106, 56], [128, 38]].map(([x, bh], i) => <rect key={i} className="scBar" style={{ transformOrigin: `${x}px ${h - 14}px`, animationDelay: `${i * 0.15}s` }} x={x} y={h - 14 - bh} width="14" height={bh} rx="3" fill={hexA(i === 3 ? T.pink : c, 0.45)} />)}
  </g>;
  if (motif === "shelf") return <g>
    {[[36, 0], [48, 4], [60, -2], [72, 2]].map(([x, off], i) => <rect key={i} className="scTree" style={{ transformOrigin: `${x}px ${h - 14}px`, animationDelay: `${i * 0.25}s` }} x={x} y={h - 40 + off} width="9" height={26 - off} rx="1.5" fill={hexA(i % 2 ? T.pink : c, 0.4)} />)}
    {leaf(320, h - 28, 25, hexA(c, 0.35))}
  </g>;
  if (motif === "gear") return <g>
    <g className="scGear" style={{ transformOrigin: "70px " + (h - 22) + "px" }}><circle cx="70" cy={h - 22} r="13" fill="none" stroke={hexA(c, 0.45)} strokeWidth="4" />{[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x="68" y={h - 40} width="4" height="6" rx="1" fill={hexA(c, 0.45)} transform={`rotate(${a} 70 ${h - 22})`} />)}</g>
    {leaf(320, h - 26, 25, hexA(T.pink, 0.3))}
  </g>;
  if (motif === "layers") return <g>
    {[0, 1, 2].map((i) => <path key={i} className="scTree" style={{ transformOrigin: `70px ${h - 22}px`, animationDelay: `${i * 0.3}s` }} d={`M50 ${h - 30 + i * 8} l20 -8 l20 8 l-20 8 Z`} fill={hexA(i === 1 ? T.pink : c, 0.4 - i * 0.06)} />)}
  </g>;
  return <g>{tree(60, h - 18, 1.3, hexA(c, 0.45))}{leaf(320, h - 28, 25, hexA(T.pink, 0.35))}</g>;
}
/* ---- Ambient artwork: drifting aurora orbs + dot grid + film grain ---- */
const GRAIN_URI = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/></svg>"
);
const AmbientArt = React.memo(function AmbientArt({ T, nav }) {
  // Planner is a pure jet-black canvas — no orbs, no wash, no tint. Just the void + a whisper of grain.
  if (nav === "Planner") {
    return (
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", background: "#000000" }}>
        {T.grainOpacity > 0 && <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: "160px 160px", opacity: T.grainOpacity * 0.6, mixBlendMode: "overlay" }} />}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px 80px rgba(0,0,0,0.7)", borderRadius: "inherit" }} />
      </div>
    );
  }
  if (!T.orbOpacity && !T.grainOpacity) return <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
  const orb = (size, color, blur) => ({
    position: "absolute", width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 35%, ${color}, transparent 70%)`,
    filter: `blur(${blur}px)`, willChange: "transform", opacity: T.orbOpacity,
  });
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div className="orbA" style={{ ...orb(680, hexA(T.purple, 0.20), 80), top: "-20%", left: "-10%" }} />
      <div className="orbB" style={{ ...orb(600, hexA(T.pink, 0.16), 90), top: "-14%", right: "-12%" }} />
      <div className="orbC" style={{ ...orb(560, hexA(T.fuchsia, 0.14), 90), bottom: "-24%", right: "10%" }} />
      <div className="orbD" style={{ ...orb(460, hexA(T.deepPurple, 0.15), 80), bottom: "-16%", left: "14%" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${hexA(T.purple, 0.05)} 0%, transparent 22%)` }} />
      {/* starfield: fixed pseudo-random constellation, gentle twinkle */}
      {[[8, 12, 1.3, 0], [22, 6, 1, 2.2], [38, 16, 1.5, 1.1], [55, 7, 1, 3.4], [71, 13, 1.4, 0.6], [86, 9, 1, 2.8], [93, 22, 1.2, 1.7], [15, 26, 1, 4.1], [64, 24, 1.1, 3]].map(([x, y, r, d], i) => (
        <span key={i} className="lxStar" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%", background: hexA(T.text, 0.55), boxShadow: `0 0 ${r * 4}px ${hexA(T.text, 0.35)}`, animationDelay: `${d}s` }} />
      ))}
      {/* occasional shooting stars */}
      <span className="lxShoot" style={{ position: "absolute", top: "9%", left: "-12%", width: 130, height: 1.5, background: `linear-gradient(90deg, transparent, ${hexA(T.text, 0.8)}, ${hexA(T.pink, 0.6)})`, borderRadius: 2, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.45))" }} />
      <span className="lxShoot" style={{ position: "absolute", top: "20%", left: "-12%", width: 90, height: 1, background: `linear-gradient(90deg, transparent, ${hexA(T.text, 0.6)}, ${hexA(T.purple, 0.5)})`, borderRadius: 2, animationDelay: "11s", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.35))" }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(${hexA(T.text, 0.05)} 1px, transparent 1.4px)`,
        backgroundSize: "26px 26px",
        maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.25) 45%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.25) 45%, transparent 80%)",
      }} />
      {T.grainOpacity > 0 && <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: "160px 160px", opacity: T.grainOpacity, mixBlendMode: "overlay" }} />}
      {/* edge vignette — frames the canvas, sinks corners into pure black (OLED luxury) */}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 200px 60px rgba(0,0,0,0.55)", borderRadius: "inherit" }} />
    </div>
  );
});
function EmptyDayArt({ T }) {
  return (
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ opacity: 0.75, overflow: "visible" }} aria-hidden>
      <circle cx="20" cy="15" r="13" fill={hexA(T.purple, 0.08)} />
      <path d="M24 8a8.5 8.5 0 1 0 6 12.5A9.5 9.5 0 0 1 24 8z" fill={hexA(T.purple, 0.4)} style={{ filter: `drop-shadow(0 2px 6px ${T.purpleGlow})` }} />
      <path className="twink" d="M9 7 L9.8 9 L11.8 9.8 L9.8 10.6 L9 12.6 L8.2 10.6 L6.2 9.8 L8.2 9 Z" fill={hexA(T.pink, 0.7)} />
      <path className="twink" style={{ animationDelay: "1.3s" }} d="M33 19 L33.6 20.5 L35.1 21.1 L33.6 21.7 L33 23.2 L32.4 21.7 L30.9 21.1 L32.4 20.5 Z" fill={hexA(T.fuchsia, 0.6)} />
      <circle className="twink" style={{ animationDelay: "2s" }} cx="31" cy="6" r="1.1" fill={hexA(T.pink, 0.6)} />
    </svg>
  );
}
function IconSunDay({ w }) { return <svg {...S0(w)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" /></svg>; }
function IconUsers({ w }) { return <svg {...S0(w)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 6M21 20a5.5 5.5 0 0 0-4-5.3" /></svg>; }
function IconDumbbell({ w }) { return <svg {...S0(w)}><path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" /></svg>; }
function IconBook({ w }) { return <svg {...S0(w)}><path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 0-2 2V4zM4 4v16M9 8h6M9 12h6" /></svg>; }
/* ---- category logo set ---- */
function IconCandles({ w }) { return <svg {...S0(w)}><path d="M7 3v3M7 14v4M17 6v3M17 17v4" /><rect x="4.6" y="6" width="4.8" height="8" rx="1.2" /><rect x="14.6" y="9" width="4.8" height="8" rx="1.2" /></svg>; }
function IconCoin({ w }) { return <svg {...S0(w)}><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.2a3 3 0 0 0-2.8-1.4c-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.2 0 1.2-1.3 2.1-3 2.1a3.2 3.2 0 0 1-3-1.5M12 6v1.8M12 16.2V18" /></svg>; }
function IconBriefcase({ w }) { return <svg {...S0(w)}><rect x="3" y="7.5" width="18" height="13" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18M12 11.6v2.8" /></svg>; }
function IconPalette({ w }) { return <svg {...S0(w)}><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.2-.9 2.2-2 0-.9-.5-1.4-.5-2.2 0-1.1.9-2 2-2h1.8A3.5 3.5 0 0 0 21 11.5C21 6.8 16.9 3 12 3z" /><circle cx="7.5" cy="11" r="1.15" fill="currentColor" stroke="none" /><circle cx="10.5" cy="7.3" r="1.15" fill="currentColor" stroke="none" /><circle cx="15" cy="7.3" r="1.15" fill="currentColor" stroke="none" /></svg>; }
function IconCart({ w }) { return <svg {...S0(w)}><path d="M3 4h2.4l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 8H6" /><circle cx="9.6" cy="20" r="1.3" fill="currentColor" stroke="none" /><circle cx="17.4" cy="20" r="1.3" fill="currentColor" stroke="none" /></svg>; }
function IconHome({ w }) { return <svg {...S0(w)}><path d="M3.5 10.8 12 3.6l8.5 7.2M5.5 9.4V20h13V9.4M9.8 20v-5.6h4.4V20" /></svg>; }
function IconPlane({ w }) { return <svg {...S0(w)}><path d="M10.2 13.8 3.6 11l-1.3-1.2c-.5-.5-.2-1.3.5-1.4l4.6-.5L13 3.3c.8-.8 2-.9 2.6-.3.6.6.5 1.8-.3 2.6l-4.6 5.6-.5 4.6c-.1.7-.9 1-1.4.5l-1.2-1.3-2.8-6.6M6.5 17.5 4 20M9.5 18.5 8 20" /></svg>; }
function IconClipboard({ w }) { return <svg {...S0(w)}><rect x="5" y="4.5" width="14" height="17" rx="2.5" /><path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5M9 11h6M9 15h6M9 18.2h3.4" /></svg>; }
function IconLotus({ w }) { return <svg {...S0(w)}><path d="M12 20c-2.4-1.5-3.8-4-3.8-6.7 0-2.6 1.5-5.1 3.8-7 2.3 1.9 3.8 4.4 3.8 7 0 2.7-1.4 5.2-3.8 6.7z" /><path d="M12 20c-3.4.4-6.6-.8-8.6-3.3 1.5-1 3.3-1.5 5.2-1.4M12 20c3.4.4 6.6-.8 8.6-3.3-1.5-1-3.3-1.5-5.2-1.4" /></svg>; }
/* category id → logo */
function IconTrendUp({ w }) { return <svg {...S0(w)}><path d="M3 17l5.5-5.5 4 4L21 7M15 7h6v6" /></svg>; }
function IconDownload({ w }) { return <svg {...S0(w)}><path d="M12 3v12M7 10.5 12 15l5-4.5M4.5 19h15" /></svg>; }
function IconExpand({ w }) { return <svg {...S0(w)}><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" /></svg>; }
function IconPieSlice({ w }) { return <svg {...S0(w)}><path d="M12 3a9 9 0 1 0 9 9h-9V3z" /><path d="M15 3.5A9 9 0 0 1 20.5 9L15 11V3.5z" /></svg>; }
function IconFlow({ w }) { return <svg {...S0(w)}><rect x="2.5" y="9" width="6" height="6" rx="1.6" /><rect x="15.5" y="3" width="6" height="6" rx="1.6" /><rect x="15.5" y="15" width="6" height="6" rx="1.6" /><path d="M8.5 12h3.5M12 12V6.5h3.5M12 12v5.5h3.5" /></svg>; }
function IconGauge({ w }) { return <svg {...S0(w)}><path d="M4 14a8 8 0 1 1 16 0" /><path d="M12 14l4-4.5" /><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" /></svg>; }
function IconAlert({ w }) { return <svg {...S0(w)}><path d="M12 3.5 21.5 20h-19L12 3.5z" /><path d="M12 10v4M12 17.2v.3" /></svg>; }
function IconBulb({ w }) { return <svg {...S0(w)}><path d="M9 18h6M10 21h4M12 3a6.5 6.5 0 0 0-3.8 11.8c.8.6 1.3 1.3 1.5 2.2h4.6c.2-.9.7-1.6 1.5-2.2A6.5 6.5 0 0 0 12 3z" /></svg>; }
function IconList({ w }) { return <svg {...S0(w)}><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" /></svg>; }
function IconChevronD({ w }) { return <svg {...S0(w)}><path d="M6 9l6 6 6-6" /></svg>; }
const CAT_ICON = {
  Trading: IconCandles, Finance: IconCoin, Study: IconBook, Build: IconCode,
  Health: IconDumbbell, Mindfulness: IconLotus, Work: IconBriefcase, Creative: IconPalette,
  Errands: IconCart, Home: IconHome, Social: IconUsers, Travel: IconPlane,
  Personal: IconHeart, Admin: IconClipboard,
};
function CatIcon({ id, w = 12, color, style }) {
  const C = CAT_ICON[id] || IconTag;
  return <span style={{ display: "inline-grid", placeItems: "center", color: color || "currentColor", flexShrink: 0, ...style }}><C w={w} /></span>;
}
/* gradient tile holding a category logo — used in pickers, pages, cards */
function CatBadge({ T, id, color, size = 26, iconW }) {
  return (
    <span style={{
      width: size, height: size, minWidth: size, borderRadius: Math.max(7, size * 0.3),
      display: "inline-grid", placeItems: "center", color: "#fff",
      background: color,
      boxShadow: `0 2px 6px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.22) inset`,
    }}><CatIcon id={id} w={iconW || Math.round(size * 0.56)} /></span>
  );
}
function IconHeart({ w }) { return <svg {...S0(w)}><path d="M12 21s-7-4.6-9.3-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9z" /></svg>; }
function IconInbox({ w }) { return <svg {...S0(w)}><path d="M4 13l2.5-8h11L20 13M4 13v6h16v-6M4 13h5l1.5 2.5h3L15 13h5" /></svg>; }
function IconArchive({ w }) { return <svg {...S0(w)}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M9 12h6" /></svg>; }
function IconLink({ w = 14 }) { return <svg {...S0(w)}><path d="M10 13a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7L11 7M14 11a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.7 18L13 17" /></svg>; }
function IconStar({ w = 14, filled }) { return <svg {...S0(w)} style={filled ? { fill: "#FBBF24", color: "#FBBF24" } : {}}><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" /></svg>; }
function IconPencil({ w = 14, style }) { return <svg {...S0(w)} style={style}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>; }
function IconFilter({ w = 14 }) { return <svg {...S0(w)}><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>; }
function IconCopy({ w = 14 }) { return <svg {...S0(w)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>; }
function IconCheck2({ w = 14 }) { return <svg {...S0(w)}><path d="M20 6L9 17l-5-5" /></svg>; }
function IconTrash({ w = 14 }) { return <svg {...S0(w)}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>; }
function IconHash({ w = 14 }) { return <svg {...S0(w)}><path d="M9 3L7 21M17 3l-2 18M4 8h16M3 16h16" /></svg>; }
function IconFolder({ w = 16 }) { return <svg {...S0(w)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>; }
function IconCheckSquare({ w = 14 }) { return <svg {...S0(w)}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></svg>; }
function IconQuote({ w = 14 }) { return <svg {...S0(w)}><path d="M7 7H4v6h4l-1 4M17 7h-3v6h4l-1 4" /></svg>; }
function IconCode({ w = 14 }) { return <svg {...S0(w)}><path d="M8 8l-4 4 4 4M16 8l4 4-4 4" /></svg>; }
function IconBold({ w = 14 }) { return <svg {...S0(w)} style={{ strokeWidth: 2.4 }}><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z" /></svg>; }
function IconHeading({ w = 14 }) { return <svg {...S0(w)} style={{ strokeWidth: 2.4 }}><path d="M6 4v16M18 4v16M6 12h12" /></svg>; }
function IconMinus({ w = 14 }) { return <svg {...S0(w)}><path d="M5 12h14" /></svg>; }
function CollectionIcon({ icon, w }) {
  const map = { inbox: IconInbox, sun: IconSunDay, chart: IconChart, book: IconBook, layers: IconLayers, heart: IconHeart, spark: IconSpark, folder: IconFolder, repeat: IconRepeat, dumbbell: IconDumbbell, users: IconUsers };
  const C = map[icon] || IconFolder; return <C w={w} />;
}
function NoteTypeIcon({ type, w }) {
  const map = { daily: IconSunDay, meeting: IconUsers, "trading-journal": IconChart, "workout-log": IconDumbbell, study: IconBook, project: IconLayers, review: IconRepeat, note: IconNote };
  const C = map[type] || IconNote; return <C w={w} />;
}

/* ============================================================
   13. STYLES + CSS (theme-aware factories)
   ============================================================ */
function makeStyles(T) {
  // gradient-edge "glass" surface: theme gradient runs through the 1px border
  const glass = (bg, soft) => ({
    background: `linear-gradient(${bg},${bg}) padding-box, ${soft ? T.edgeSoft : T.edge} border-box`,
    border: "1px solid transparent",
    boxShadow: T.cardShadow,
  });
  const popGlass = (bg) => ({
    background: `linear-gradient(${bg},${bg}) padding-box, ${T.edge} border-box`,
    border: "1px solid transparent",
    boxShadow: `${T.popShadow}, 0 0 50px ${T.purpleGlow}`,
  });
  return {
    root: { fontFamily: "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: T.text, background: T.appBlack, minHeight: "100dvh", height: "100dvh", overflow: "hidden", WebkitFontSmoothing: "antialiased" },
    shell: { position: "relative", display: "flex", height: "100dvh", minHeight: 0, maxWidth: 1600, margin: "0 auto", background: T.appBlack, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: `0 0 80px ${T.purpleGlow}` },
    ambient: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 },
    sidebar: { width: 234, flexShrink: 0, background: hexA(T.panel, 0.86), backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRight: `1px solid ${T.border}`, padding: 18, display: "flex", flexDirection: "column", gap: 4, position: "relative", zIndex: 2 },
    scrim: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49 },
    brandRow: { display: "flex", gap: 12, alignItems: "center", marginBottom: 18 },
    brandMark: { width: 40, height: 40, borderRadius: 12, background: T.brandGrad, display: "grid", placeItems: "center", boxShadow: `0 6px 22px ${T.purpleGlow}, 0 0 0 1px rgba(255,255,255,0.12) inset, 0 1px 0 rgba(255,255,255,0.25) inset`, position: "relative" },
    navBtn: { position: "relative", display: "flex", alignItems: "center", gap: 13, padding: "10px 13px", borderRadius: 12, border: "1px solid transparent", background: "transparent", color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" },
    navActive: { background: T.accentWash, border: `1px solid ${hexA(T.purple, 0.35)}`, color: T.text, boxShadow: `inset 0 0 22px ${T.accentWash}` },
    navGlow: { position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 4, background: T.brandGrad },
    quoteCard: { ...glass(T.panel2, true), borderRadius: 16, padding: 16, marginTop: 10, position: "relative", overflow: "hidden" },
    quoteMark: { width: 30, height: 30, borderRadius: 10, background: T.deepGrad, display: "grid", placeItems: "center", boxShadow: `0 4px 14px ${T.purpleGlow}` },
    userRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` },
    avatar: { width: 34, height: 34, borderRadius: "50%", background: T.deepGrad, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, color: "#fff", boxShadow: `0 0 0 2px ${hexA(T.purple, 0.25)}, 0 4px 12px ${T.purpleGlow}` },

    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, position: "relative", zIndex: 1 },
    header: { display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "1px solid transparent", borderImage: `linear-gradient(90deg, transparent, ${hexA(T.purple, 0.45)} 30%, ${hexA(T.pink, 0.4)} 70%, transparent) 1`, background: hexA(T.panel, 0.72), backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", flexShrink: 0, zIndex: 20 },
    weekNav: { display: "flex", alignItems: "center", gap: 10, margin: "0 auto" },
    body: { flex: 1, minHeight: 0, display: "flex", gap: 16, padding: 16, overflow: "auto", alignItems: "flex-start" },
    centerCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
    viewSegWrap: { display: "inline-flex", gap: 4, padding: 4, borderRadius: 13, background: "#0A0A0C", border: `1px solid ${hexA("#FFFFFF", 0.08)}`, boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.04)} inset` },
    viewSegBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, minWidth: 84, height: 38, padding: "0 16px", borderRadius: 9, background: "transparent", border: "1px solid transparent", color: T.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 0.1, whiteSpace: "nowrap", transition: "color .2s ease, background .2s ease, box-shadow .2s ease" },
    viewSegBtnOn: { background: `linear-gradient(180deg, ${hexA(T.purple, 0.32)}, ${hexA(T.purple, 0.16)}), #050507`, color: "#fff", boxShadow: `0 4px 14px ${hexA(T.purple, 0.3)}, 0 1px 0 ${hexA("#FFFFFF", 0.12)} inset`, borderColor: hexA(T.purple, 0.45) },
    page: { display: "flex", flexDirection: "column", gap: 16 },
    cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16 },

    iconBtn: { width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, color: T.text2, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
    themeBtn: { width: 40, height: 40, borderRadius: "50%", border: `1px solid ${hexA(T.purple, 0.4)}`, background: T.accentWash, color: T.purple, display: "grid", placeItems: "center", cursor: "pointer", boxShadow: `0 0 16px ${T.purpleGlow}`, flexShrink: 0 },
    pill: { padding: "9px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, color: T.text, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
    gradBtn: { position: "relative", overflow: "hidden", padding: "9px 16px", borderRadius: 12, border: "none", background: T.brandGrad, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: `0 6px 20px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.28) inset, 0 -6px 14px rgba(0,0,0,0.18) inset` },

    quickAdd: { ...glass(T.panel), borderRadius: 18, padding: 16, position: "relative" },
    quickRow: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
    quickInput: { flex: 1, minWidth: 220, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 16, padding: "8px 4px" },
    quickControls: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    ghostBtn: { padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.text2, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
    hiddenDate: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" },
    chipRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
    chip: { padding: "7px 13px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.panel2, color: T.muted, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, whiteSpace: "nowrap" },
    dot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0, display: "inline-block" },

    weekGrid: { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, background: `linear-gradient(#000,#000) padding-box, ${T.edgeSoft} border-box`, border: "1px solid transparent", boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.04)} inset, 0 24px 60px rgba(0,0,0,0.6)`, borderRadius: 20, padding: 12 },
    dayCol: { minWidth: 0, display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.022)}, transparent 120px), #000000`, borderRadius: 16, padding: 10, border: `1px solid ${hexA("#FFFFFF", 0.06)}`, boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.05)} inset, 0 18px 44px rgba(0,0,0,0.55)`, position: "relative", transition: "transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s cubic-bezier(.22,1,.36,1), border-color .2s ease" },
    dayToday: { border: "1.5px solid transparent", background: `linear-gradient(180deg, ${hexA(T.purple, 0.06)}, transparent 140px), linear-gradient(#000,#000) padding-box, ${T.edge} border-box`, boxShadow: `0 0 0 1px ${hexA(T.purple, 0.18)}, 0 1px 0 ${hexA("#FFFFFF", 0.06)} inset, 0 20px 50px rgba(0,0,0,0.7), 0 0 36px ${hexA(T.purple, 0.18)}` },
    dayOver: { border: `1.5px dashed ${hexA(T.purple, 0.7)}`, background: T.accentWash },
    dayHead: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 8 },
    todayBadge: { width: 42, height: 42, borderRadius: "50%", background: T.brandGrad, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 19, color: "#fff", boxShadow: `0 6px 18px ${T.pinkGlow}, 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.3) inset` },
    todayPill: { fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: T.muted, background: "transparent", border: `1px solid ${hexA(T.text, 0.18)}`, borderRadius: 8, padding: "2px 8px", marginTop: 3, textTransform: "uppercase" },
    todayUnderline: { position: "absolute", left: "30%", right: "30%", bottom: -1, height: 3, borderRadius: 3, background: T.brandGrad, boxShadow: `0 0 14px ${T.hotPink}` },
    noteBadge: { fontSize: 9.5, fontWeight: 800, color: "#fff", background: T.deepGrad, borderRadius: 8, padding: "1px 6px", lineHeight: 1.5, minWidth: 14, textAlign: "center" },
    noteChip: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.text2, background: T.elevated, border: "1px solid", borderRadius: 8, padding: "4px 7px", cursor: "pointer", maxWidth: "100%", overflow: "hidden" },
    addMini: { alignSelf: "center", width: 28, height: 28, minWidth: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, display: "grid", placeItems: "center", cursor: "pointer" },
    dayBody: { display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 40 },
    dayEmpty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 0", opacity: 0.8 },
    taskCard: { position: "relative", background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.025)}, transparent 60%), #000000`, borderRadius: 12, padding: "9px 10px", cursor: "grab", border: `1px solid ${hexA("#FFFFFF", 0.07)}`, boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.04)} inset, 0 8px 22px rgba(0,0,0,0.5)`, transition: "transform .22s cubic-bezier(.34,1.4,.5,1), box-shadow .22s cubic-bezier(.22,1,.36,1), border-color .2s ease, opacity .2s ease" },
    checkDot: { width: 18, height: 18, minWidth: 18, borderRadius: "50%", border: "1.8px solid", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, marginTop: 1, transition: "transform .22s cubic-bezier(.34,1.6,.6,1), background .18s ease, box-shadow .25s ease" },
    kebab: { width: 22, height: 22, borderRadius: 6, border: "none", background: "transparent", color: T.vmuted, display: "grid", placeItems: "center", cursor: "pointer" },
    addTask: { marginTop: 10, padding: "10px", borderRadius: 10, border: `1px dashed ${hexA(T.pink, 0.4)}`, background: "transparent", color: T.pink, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 700 },

    right: { width: 312, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 0 },
    card: { ...glass(T.panel), borderRadius: 18, padding: 18, position: "relative", overflow: "hidden" },
    link: { background: "none", border: "none", color: T.purple, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "2px 4px" },
    countPill: { fontSize: 12, fontWeight: 700, color: T.pink, background: hexA(T.pink, 0.14), border: `1px solid ${hexA(T.pink, 0.35)}`, borderRadius: 8, padding: "1px 8px" },
    barTrack: { flex: 1, height: 7, borderRadius: 6, background: T.panel2, overflow: "hidden" },
    carryItem: { display: "flex", gap: 10, alignItems: "flex-start", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", width: "100%" },
    viewAll: { width: "100%", marginTop: 16, padding: "10px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer" },

    notesWrap: { ...glass(T.panel), borderRadius: 20, padding: 18 },
    notesRow: { display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 },
    notesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 },
    noteCard: { all: "unset", boxSizing: "border-box", flex: "0 0 230px", minHeight: 150, background: `linear-gradient(180deg, ${hexA("#FFFFFF", 0.025)}, transparent 64px), #000000`, border: `1px solid ${hexA("#FFFFFF", 0.07)}`, borderRadius: 14, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", boxShadow: `0 1px 0 ${hexA("#FFFFFF", 0.04)} inset, 0 10px 28px rgba(0,0,0,0.45)` },
    notePreview: { fontSize: 12.5, color: T.text2, marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-line", overflowWrap: "anywhere", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" },
    miniChip: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, border: "1px solid", borderRadius: 16, padding: "3px 9px" },
    newNote: { boxSizing: "border-box", flex: "0 0 230px", minHeight: 150, border: `1.5px dashed ${hexA(T.pink, 0.4)}`, borderRadius: 14, background: T.pinkWash, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: `inset 0 0 30px ${T.pinkWash}` },
    newNotePlus: { width: 46, height: 46, borderRadius: "50%", background: hexA(T.pink, 0.15), border: `1px solid ${hexA(T.pink, 0.4)}`, display: "grid", placeItems: "center", color: T.pink, boxShadow: `0 0 18px ${T.pinkGlow}` },

    table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
    th: { textAlign: "left", padding: "8px 10px", color: T.muted, fontSize: 12, fontWeight: 700, borderBottom: `1px solid ${T.border}`, textTransform: "uppercase", letterSpacing: 0.5 },
    td: { padding: "4px 6px", borderBottom: `1px solid ${T.border}` },
    cellInput: { width: "100%", boxSizing: "border-box", background: "transparent", border: `1px solid transparent`, borderRadius: 8, padding: "7px 8px", color: T.text, fontSize: 13.5, fontFamily: "inherit", outline: "none" },

    modal: { width: "min(540px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", ...popGlass(T.popover), borderRadius: 20, animation: "pop .26s cubic-bezier(.34,1.45,.55,1) both" },
    modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: hexA(T.popover, 0.9) },
    modalBody: { padding: "18px 22px", overflowY: "auto", flex: 1, minHeight: 0 },
    modalFoot: { display: "flex", gap: 10, alignItems: "center", padding: "14px 22px", borderTop: `1px solid ${T.border}`, flexShrink: 0, background: hexA(T.popover, 0.9) },
    input: { width: "100%", boxSizing: "border-box", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "11px 13px", color: T.text, fontSize: 16, outline: "none", fontFamily: "inherit" },
    dateInput: { height: 46, minHeight: 46, lineHeight: "22px", WebkitAppearance: "none", appearance: "none" },
    actionSheet: { width: "min(360px,100%)", maxHeight: "80vh", display: "flex", flexDirection: "column", ...popGlass(T.popover), borderRadius: 18, padding: "10px 0 12px", animation: "pop .24s cubic-bezier(.34,1.45,.55,1) both" },
    sheetItem: { display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "13px 16px", border: "none", background: "transparent", color: T.text2, fontSize: 14.5, fontWeight: 600, cursor: "pointer" },
    segBtn: { flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" },
    segActive: { background: T.accentWash, borderColor: hexA(T.purple, 0.5), color: T.text },
    dayToggle: { width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.muted, fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
    dayToggleOn: { background: T.brandGrad, color: "#fff", borderColor: "transparent" },
    dangerBtn: { padding: "9px 16px", borderRadius: 12, border: `1px solid ${hexA("#FB7185", 0.4)}`, background: hexA("#FB7185", 0.12), color: "#FB7185", fontWeight: 600, fontSize: 13.5, cursor: "pointer" },

    palette: { width: "min(620px,100%)", ...popGlass(T.popover), borderRadius: 18, overflow: "hidden", animation: "pop .24s cubic-bezier(.34,1.45,.55,1) both" },
    palInputWrap: { display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${T.border}`, color: T.muted },
    palInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 16 },
    palList: { maxHeight: 380, overflow: "auto", padding: 8 },
    palGroup: { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.vmuted, padding: "8px 12px 4px" },
    palItem: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 12, border: "none", background: "transparent", cursor: "pointer", boxSizing: "border-box" },
    palItemActive: { background: T.accentWash },

    menu: { position: "absolute", right: 0, top: "calc(100% + 6px)", background: `linear-gradient(${T.popover},${T.popover}) padding-box, ${T.edge} border-box`, border: "1px solid transparent", borderRadius: 12, padding: 6, minWidth: 168, zIndex: 30, boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${T.purpleGlow}`, animation: "menuIn .2s cubic-bezier(.34,1.45,.55,1) both" },
    menuItem: { display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: T.text2, fontSize: 13.5, cursor: "pointer" },
    menuSep: { height: 1, background: T.border, margin: "4px 6px" },
    toast: { position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: hexA(T.popover, 0.92), backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${hexA(T.purple, 0.5)}`, color: T.text, padding: "11px 16px 11px 16px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, zIndex: 65, boxShadow: `0 10px 30px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.07) inset`, animation: "toastUp .42s cubic-bezier(.34,1.45,.55,1)", display: "flex", alignItems: "center", gap: 10, maxWidth: "calc(100vw - 32px)" },
    focusBanner: { display: "flex", alignItems: "center", gap: 10, background: `linear-gradient(90deg, ${hexA("#FB7185", 0.16)}, ${hexA(T.fuchsia, 0.10)})`, border: `1px solid ${hexA("#FB7185", 0.4)}`, borderRadius: 14, padding: "10px 14px", boxShadow: `0 0 24px ${hexA("#FB7185", 0.18)}` },
    undoBtn: { background: T.accentWash, border: `1px solid ${hexA(T.purple, 0.4)}`, color: T.purple, borderRadius: 8, padding: "5px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" },
    warnBar: { position: "fixed", top: 0, left: 0, right: 0, background: "#3a1020", color: "#FFD9E3", padding: "8px 16px", fontSize: 12.5, textAlign: "center", zIndex: 70, borderBottom: "1px solid rgba(255,120,150,0.4)" },

    // Pro Notes workspace
    notesWorkspace: { display: "flex", gap: 16, alignItems: "flex-start" },
    notesSidebar: { width: 220, flexShrink: 0, ...glass(T.panel, true), borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 130px)", overflow: "auto", position: "sticky", top: 0 },
    notesSideItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: "1px solid transparent", background: "transparent", color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" },
    notesSideActive: { background: T.accentWash, border: `1px solid ${hexA(T.purple, 0.35)}`, color: T.text },
    notesSideLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: T.vmuted, padding: "12px 8px 6px" },
    notesInsights: { width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 0 },
    tagChip: { fontSize: 11, fontWeight: 600, border: "1px solid", borderRadius: 14, padding: "2px 8px", whiteSpace: "nowrap" },

    // Pro Notes editor
    noteEditor: { display: "flex", width: "min(940px,100%)", height: "min(86vh,760px)", ...popGlass(T.popover), borderRadius: 20, overflow: "hidden", animation: "pop .26s cubic-bezier(.34,1.45,.55,1) both" },
    editorHead: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${T.border}`, background: hexA(T.panel, 0.6) },
    editorTitle: { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 19, fontWeight: 800 },
    editorToolbar: { display: "flex", alignItems: "center", gap: 3, padding: "7px 12px", borderBottom: "1px solid transparent", borderImage: `linear-gradient(90deg, ${hexA(T.purple, 0.4)}, ${hexA(T.pink, 0.3)} 55%, transparent) 1`, background: hexA(T.panel2, 0.55), backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", overflowX: "auto", overflowY: "visible", flexWrap: "nowrap", flexShrink: 0 },
    tbtn: { width: 32, height: 32, minWidth: 32, borderRadius: 10, border: "1px solid transparent", background: "transparent", color: T.text2, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
    editorBody: { width: "100%", height: "100%", minHeight: 240, boxSizing: "border-box", background: "transparent", border: "none", outline: "none", color: T.text2, fontSize: 15, lineHeight: 1.65, padding: "14px 16px", resize: "none", fontFamily: "inherit" },
    editorFoot: { display: "flex", alignItems: "center", gap: 10, rowGap: 8, flexWrap: "wrap", padding: "12px 16px", borderTop: `1px solid ${T.border}` },
    editorMeta: { width: 280, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.panel, padding: 16, overflow: "auto", display: "flex", flexDirection: "column" },
    metaLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.vmuted, margin: "14px 0 6px" },
    backlink: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", padding: "5px 0", fontSize: 12.5, textAlign: "left", width: "100%" },
  };
}

function makeCSS(T) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
/* === premium layer: launch, typography, materiality === */
/* launch reveal */
@keyframes lrMarkIn { 0% { opacity: 0; transform: scale(.6) translateY(10px); } 60% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes lrSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes lrWordIn { from { opacity: 0; transform: translateY(8px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
@keyframes lrCorePulse { 0%,100% { r: 3; } 50% { r: 3.6; } }
.launchMark { animation: lrMarkIn .7s cubic-bezier(.34,1.5,.55,1) both; }
.lrOrbit1 { animation: lrSpin 2.4s linear infinite; }
.lrOrbit2 { animation: lrSpin 3.4s linear infinite reverse; }
.lrCore { animation: lrCorePulse 1.6s ease-in-out infinite; }
.launchWord { animation: lrWordIn .6s cubic-bezier(.22,1,.36,1) .35s both; }
.launchReveal { transition: opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1); }
.launchReveal.lifting { opacity: 0; transform: scale(1.04); pointer-events: none; }
/* — onboarding — */
@keyframes obIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes obCardIn { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes obStepIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes obFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.obWrap { animation: obIn .4s ease both; }
.obCard { animation: obCardIn .6s cubic-bezier(.34,1.4,.5,1) both; }
.obStep { animation: obStepIn .42s cubic-bezier(.34,1.3,.5,1) both; }
.obMark { animation: lrMarkIn .7s cubic-bezier(.34,1.5,.55,1) both, obFloat 4.5s ease-in-out 0.7s infinite; }
.obPrimary:hover { filter: brightness(1.08); transform: translateY(-1px); }
.obChip:hover { border-color: ${hexA("#FFFFFF", 0.22)}; }
.obChoice { transition: transform .22s cubic-bezier(.34,1.45,.55,1), box-shadow .25s ease, border-color .2s ease; }
.obChoice:hover { transform: translateY(-2px); border-color: ${hexA(T.purple, 0.6)}; box-shadow: 0 14px 34px rgba(0,0,0,0.5), 0 0 22px ${T.purpleGlow}; }
/* typography: confident tracking, tabular numerals where it counts */
.gradText { letter-spacing: -0.02em; }
.headerClock, .numTick, [style*="tabular-nums"] { font-feature-settings: "tnum" 1, "cv01" 1; }
body, button, input, textarea { font-feature-settings: "cv01" 1, "ss01" 1; }
/* materiality: a faint top-light highlight on raised surfaces (light from above) */
.luxcard::before, .quickAddWrap::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), transparent 30%); z-index: 0;
}
.quickAddWrap, .weekgrid { position: relative; }
.quickAddWrap > *, .weekgrid > * { position: relative; z-index: 1; }
/* refined focus ring — premium apps make keyboard nav beautiful */
.focusable:focus-visible { outline: none !important; box-shadow: 0 0 0 2px ${T.appBlack}, 0 0 0 4px ${hexA(T.fuchsia, 0.7)}, 0 0 16px ${hexA(T.fuchsia, 0.4)} !important; border-radius: 10px; }
* { box-sizing: border-box; }
body { margin: 0; background: ${T.appBlack}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
button, input, select, textarea { font-family: inherit; }
button { transition: background .2s ease, border-color .2s ease, color .2s ease, transform .22s cubic-bezier(.34,1.45,.55,1), box-shadow .25s ease, filter .2s ease; }
button:active:not(:disabled) { transform: scale(.96); }
svg { display: block; }
* { -webkit-tap-highlight-color: transparent; }
html, body, button, [role="button"], a, input, select, label { touch-action: manipulation; } /* kills 300ms dbl-tap zoom + accidental zooms */
.taskcard { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; } /* no text-select / iOS callout mid-drag */
/* invisible expanded hit areas — small controls keep their look but gain ~44px touch targets */
.checkdot, .kebab, .addmini, .qa-expand { position: relative; }
.checkdot::after { content: ""; position: absolute; inset: -10px; border-radius: 50%; }
.kebab::after { content: ""; position: absolute; inset: -9px; border-radius: 10px; }
.addmini::after { content: ""; position: absolute; inset: -6px; border-radius: 10px; }
.qa-expand::after { content: ""; position: absolute; inset: -6px; border-radius: 12px; }
/* text-overflow safety net: only unbreakable strings break; normal words wrap whole */
.taskcard, .notecard, .carry, .noteChip, .menuItem { overflow-wrap: break-word; }
.taskTitle { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: break-word; }
::selection { background: ${hexA(T.purple, 0.35)}; }
/* — smooth, premium scrolling everywhere — */
.scrollarea { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: ${hexA(T.purple, 0.45)} transparent; }
.scrollarea::-webkit-scrollbar { width: 9px; height: 9px; }
.scrollarea::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${hexA(T.purple, 0.45)}, ${hexA(T.pink, 0.32)}); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; transition: background .2s ease; }
.scrollarea::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, ${hexA(T.purple, 0.7)}, ${hexA(T.pink, 0.55)}); background-clip: padding-box; }
.scrollarea::-webkit-scrollbar-track { background: transparent; }
.focusable:focus-visible { outline: 2px solid ${T.focusRing}; outline-offset: 2px; }
.iconbtn:hover, .pillbtn:hover, .ghostbtn:hover { border-color: ${hexA(T.purple, 0.45)}; color: ${T.text}; box-shadow: 0 4px 14px ${T.purpleGlow}; transform: translateY(-1px); }
/* gradient button: lift + travelling light sweep */
.gradbtn::after { content: ""; position: absolute; top: 0; bottom: 0; left: -70%; width: 50%; background: linear-gradient(105deg, transparent, rgba(255,255,255,0.45), transparent); transform: skewX(-18deg); transition: left .55s cubic-bezier(.22,1,.36,1); pointer-events: none; }
.gradbtn:hover { filter: brightness(1.1) saturate(1.05); transform: translateY(-2px); box-shadow: 0 10px 28px ${hexA(T.fuchsia, 0.45)}, 0 1px 0 rgba(255,255,255,0.3) inset; }
.gradbtn:hover::after { left: 120%; }
.navbtn { transition: background .2s ease, color .2s ease, border-color .2s ease, transform .22s cubic-bezier(.34,1.45,.55,1); }
.navbtn svg { transition: transform .25s cubic-bezier(.34,1.6,.6,1); }
.navbtn:hover { color: ${T.text}; background: ${hexA(T.purple, 0.07)}; transform: translateX(2px); }
.navbtn:hover svg { transform: scale(1.12) rotate(-4deg); }
.chip { transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s cubic-bezier(.34,1.45,.55,1), box-shadow .2s ease; }
.chip:hover { border-color: ${T.borderStrong}; color: ${T.text}; transform: translateY(-1px); }
.taskcard:hover { transform: translateY(-3px) scale(1.012); box-shadow: 0 10px 26px rgba(0,0,0,0.45), 0 0 18px ${T.purpleGlow}; border-color: ${hexA(T.purple, 0.4)}; }
.taskcard:active { cursor: grabbing; }
.checkdot:hover { transform: scale(1.18); box-shadow: 0 0 12px ${T.purpleGlow}; }
.notecard { transition: transform .28s cubic-bezier(.34,1.45,.55,1), box-shadow .28s ease, border-color .2s ease; }
.notecard:hover { border-color: ${hexA(T.purple, 0.45)}; transform: translateY(-3px) scale(1.01); box-shadow: 0 12px 30px rgba(0,0,0,0.35), 0 0 20px ${T.purpleGlow}; }
.newnote:hover { border-color: ${hexA(T.pink, 0.7)}; filter: brightness(1.06); transform: translateY(-2px); }
.addtask:hover { border-color: ${hexA(T.pink, 0.7)}; color: ${T.pink}; background: ${hexA(T.pink, 0.08)}; }
.addmini:hover { border-color: ${hexA(T.purple, 0.5)}; color: ${T.text}; background: ${T.accentWash}; }
.viewall:hover, .link:hover { filter: brightness(1.15); }
.kebab:hover { color: ${T.text}; transform: scale(1.15); }
.carry { transition: background .2s ease; }
.carry:hover { background: ${T.accentWash}; border-radius: 10px; }
.menuItem, .palItem { transition: background .15s ease, transform .15s ease, color .15s ease; }
.menuItem:hover, .palItem:hover { background: ${T.accentWash}; transform: translateX(2px); }
.cellInput:hover { border-color: ${T.border} !important; }
.cellInput:focus { border-color: ${hexA(T.purple, 0.5)} !important; background: ${T.panel2}; }
.bar { height: 100%; border-radius: 6px; transition: width .6s cubic-bezier(.2,.8,.2,1); }
.bar-v { transition: height .6s cubic-bezier(.2,.8,.2,1); }
.ring { transition: stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1); }
input::placeholder, textarea::placeholder { color: ${T.vmuted}; }
input[type=date], input[type=time], select { color-scheme: ${T.text === "#1B1126" ? "light" : "dark"}; }
input[type=date], input[type=time], input[type=number] { -webkit-appearance: none; appearance: none; box-sizing: border-box; max-height: 46px; overflow: hidden; }
input[type=date]::-webkit-date-and-time-value, input[type=time]::-webkit-date-and-time-value { text-align: right; margin: 0; }
input[type=date]::-webkit-calendar-picker-indicator, input[type=time]::-webkit-calendar-picker-indicator { margin: 0; }
.mobileonly { display: none; }
.mobileonly2 { display: none; }
.mobileFlex { display: none; }
.mobileSummary { display: none; }
.hdr-title-mobile { display: none; }
.qa-expand { display: none; }
/* desktop: controls sit on the same row visually via flex wrap; chips below */
.quickAddWrap .qa-controls { margin-top: 12px; }
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pop { from { opacity: 0; transform: scale(.93) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
@keyframes menuIn { from { opacity: 0; transform: translateY(-5px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes riseIn { from { opacity: 0; transform: translateY(16px) scale(.988); filter: blur(6px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
@keyframes cardIn { from { opacity: 0; transform: translateY(8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
/* === ambient aurora drift === */
@keyframes orbDriftA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px, 44px) scale(1.12); } }
@keyframes orbDriftB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px, 36px) scale(.94); } }
@keyframes orbDriftC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px, -56px) scale(1.1); } }
@keyframes orbDriftD { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(52px, -34px) scale(1.06); } }
.orbA { animation: orbDriftA 26s ease-in-out infinite; }
.orbB { animation: orbDriftB 32s ease-in-out infinite; }
.orbC { animation: orbDriftC 38s ease-in-out infinite; }
.orbD { animation: orbDriftD 29s ease-in-out infinite; }
/* === brand mark orbit === */
@keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes corePulse { 0%,100% { r: 3; opacity: 1; } 50% { r: 3.6; opacity: .85; } }
.orbitSpinA { animation: orbitSpin 9s linear infinite; }
.orbitSpinB { animation: orbitSpin 13s linear infinite reverse; }
.orbitCore { animation: corePulse 2.6s ease-in-out infinite; }
/* === gradient ink for headline text === */
.gradText { background: ${T.brandGrad}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
${T.orbOpacity === 0 ? `.gradText { background: none; -webkit-text-fill-color: ${T.text}; color: ${T.text}; }` : ""}
/* === flame flicker (momentum) === */
@keyframes flameFlicker { 0%,100% { transform: scale(1) rotate(0deg); } 30% { transform: scale(1.08) rotate(-3deg); } 55% { transform: scale(.96) rotate(2.5deg); } 78% { transform: scale(1.05) rotate(-1.5deg); } }
.flame { display: grid; place-items: center; animation: flameFlicker 2.4s ease-in-out infinite; transform-origin: 50% 85%; }
/* === today badge breathing === */
@keyframes badgeBreathe { 0%,100% { box-shadow: 0 6px 18px ${T.pinkGlow}, 0 0 0 0 ${hexA(T.fuchsia, 0.35)}, 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.3) inset; } 50% { box-shadow: 0 6px 22px ${T.pinkGlow}, 0 0 0 7px ${hexA(T.fuchsia, 0)}, 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.3) inset; } }
.todayBadgeEl { animation: badgeBreathe 3s ease-in-out infinite; }
/* === empty-state float === */
@keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes sparkTwinkle { 0%,100% { opacity: .25; transform: scale(.7); } 50% { opacity: .95; transform: scale(1.15); } }
.floaty { animation: floatY 4.5s ease-in-out infinite; }
.twink { animation: sparkTwinkle 2.8s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
/* === momentum bars hover === */
.vbarCell:hover .bar-v { filter: brightness(1.25) saturate(1.1); }
/* staggered entrance for the main column sections */
.centerStage > * { animation: riseIn .6s cubic-bezier(.16,1,.3,1) both; }
.centerStage > *:nth-child(1) { animation-delay: .02s; }
.centerStage > *:nth-child(2) { animation-delay: .1s; }
.centerStage > *:nth-child(3) { animation-delay: .18s; }
.centerStage > *:nth-child(4) { animation-delay: .26s; }
.rightStage > * { animation: riseIn .55s cubic-bezier(.22,1,.36,1) both; }
.rightStage > *:nth-child(1) { animation-delay: .08s; }
.rightStage > *:nth-child(2) { animation-delay: .16s; }
.rightStage > *:nth-child(3) { animation-delay: .24s; }
.rightStage > *:nth-child(4) { animation-delay: .32s; }
.taskcard { animation: cardIn .38s cubic-bezier(.34,1.3,.5,1); }
/* desktop pointer: day columns gently lift toward the cursor */
@media (hover: hover) and (min-width: 861px) {
  .weekgrid:not(.dragging) .dayCol:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,0.3); border-color: ${hexA(T.purple, 0.3)}; }
}
.taskcard.pressing { transform: scale(.97); opacity: .85; }
.taskcard.lifting { opacity: .35; transform: scale(.98); filter: saturate(.7); }
.taskcard.lifting::after { content: ""; position: absolute; inset: 0; border: 1.5px dashed ${hexA(T.purple, 0.5)}; border-radius: 11px; pointer-events: none; }
.dragGhost { position: fixed; z-index: 90; transform: translate(-50%, -120%) rotate(var(--tilt, 0deg)); pointer-events: none; background: linear-gradient(${T.popover},${T.popover}) padding-box, ${T.edge} border-box; color: ${T.text}; border: 1px solid transparent; border-radius: 11px; padding: 9px 14px; font-size: 13px; font-weight: 700; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-shadow: 0 18px 44px rgba(0,0,0,0.55), 0 0 26px ${hexA(T.purple, 0.35)}, 0 1px 0 rgba(255,255,255,0.08) inset; opacity: .98; animation: ghostLift .2s cubic-bezier(.34,1.5,.6,1); transition: transform .12s ease-out; }
@keyframes ghostLift { from { transform: translate(-50%, -106%) scale(.85) rotate(0deg); opacity: 0; } to { transform: translate(-50%, -120%) scale(1) rotate(var(--tilt, 0deg)); opacity: .98; } }
/* ghost flies into the column it was dropped on, then fades out */
.dragGhost.snapping { transition: left .26s cubic-bezier(.22,1,.36,1), top .26s cubic-bezier(.22,1,.36,1), transform .26s cubic-bezier(.22,1,.36,1), opacity .24s ease .06s; transform: translate(-50%, -50%) scale(.45) rotate(0deg); opacity: 0; }
/* invalid drop or Esc: ghost springs back to where it came from */
.dragGhost.returning { transition: left .3s cubic-bezier(.34,1.3,.5,1), top .3s cubic-bezier(.34,1.3,.5,1), transform .3s ease, opacity .26s ease .08s; transform: translate(-50%, -120%) scale(.92) rotate(0deg); opacity: 0; }
.ghostTarget { display: inline-block; margin-left: 9px; padding: 2px 8px; border-radius: 7px; font-size: 10.5px; font-weight: 800; letter-spacing: .4px; color: #fff; background: ${T.brandGrad}; vertical-align: middle; animation: fade .15s ease; }
/* gradient placeholder slot showing where the card will land */
@keyframes slotIn { from { opacity: 0; transform: scaleY(.5); max-height: 0; } to { opacity: 1; transform: scaleY(1); max-height: 44px; } }
@keyframes slotPulse { 0%,100% { border-color: ${hexA(T.purple, 0.55)}; box-shadow: 0 0 14px ${T.purpleGlow}, inset 0 0 16px ${T.accentWash}; } 50% { border-color: ${hexA(T.pink, 0.65)}; box-shadow: 0 0 22px ${T.pinkGlow}, inset 0 0 20px ${T.pinkWash}; } }
.dropSlot { display: grid; place-items: center; height: 40px; border-radius: 11px; border: 1.5px dashed ${hexA(T.purple, 0.55)}; background: linear-gradient(135deg, ${T.accentWash}, ${T.pinkWash}); transform-origin: top; animation: slotIn .22s cubic-bezier(.34,1.4,.5,1) both, slotPulse 1.3s ease-in-out .22s infinite; }
/* hovered drop column pulses */
@keyframes dropZonePulse { 0%,100% { box-shadow: 0 0 0 0 ${hexA(T.purple, 0.35)}, 0 0 24px ${T.purpleGlow}; } 50% { box-shadow: 0 0 0 5px ${hexA(T.purple, 0)}, 0 0 32px ${T.purpleGlow}; } }
.weekgrid .dayCol[data-over="1"] { animation: dropZonePulse 1.2s ease-in-out infinite; transform: scale(1.012); }
/* the moved card lands with a springy settle + glow flash */
@keyframes dropLand { 0% { transform: scale(.78); box-shadow: 0 0 0 2px ${hexA(T.fuchsia, 0.7)}, 0 14px 34px rgba(0,0,0,0.5), 0 0 30px ${hexA(T.fuchsia, 0.45)}; } 55% { transform: scale(1.05); } 78% { transform: scale(.985); } 100% { transform: scale(1); box-shadow: 0 0 0 0 ${hexA(T.fuchsia, 0)}; } }
.taskcard.dropLand { animation: dropLand .6s cubic-bezier(.34,1.4,.5,1); }
.weekgrid.dragging { touch-action: none; }
.weekgrid.dragging .dayCol { transition: background .15s ease, border-color .15s ease, box-shadow .15s ease; }
.bottomnav button svg { transition: transform .18s cubic-bezier(.22,.61,.36,1); }
.quickInput:focus { outline: none; }
.quickAddWrap:focus-within { box-shadow: 0 0 0 1px ${hexA(T.purple, 0.35)}, 0 0 24px ${hexA(T.purple, 0.12)}; }
@keyframes celebFly { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 60px)) rotate(var(--rot)); opacity: 0; } }
@keyframes celebRing { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(2.6); opacity: 0; } }
.celebPart { animation: celebFly .95s cubic-bezier(.15,.7,.3,1) forwards; }
.celebRing { animation: celebRing .55s ease-out forwards; }
@keyframes checkPop { 0% { transform: scale(.4); } 55% { transform: scale(1.45); } 100% { transform: scale(1); } }
.checkPop { animation: checkPop .4s cubic-bezier(.34,1.6,.6,1); }
@keyframes cardPop { 0% { transform: scale(1); } 35% { transform: scale(1.045); box-shadow: 0 10px 32px rgba(168,85,247,0.4); } 100% { transform: scale(1); } }
.taskcard.just-completed { animation: cardPop .5s cubic-bezier(.34,1.45,.55,1); }
.taskTitle.struck::after { content: ""; position: absolute; left: 0; top: 50%; height: 1.5px; width: 100%; background: currentColor; opacity: .65; transform: scaleX(0); transform-origin: left; animation: strikeDraw .38s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes strikeDraw { to { transform: scaleX(1); } }
@keyframes toastUp { 0% { opacity: 0; transform: translate(-50%, 22px) scale(.96); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1); } }
@keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: .55; } }
.livePulse { animation: livePulse 1.4s ease-in-out infinite; }
/* === pro notes: zen mode, slash menu, outline === */
.noteEditor { transition: width .4s cubic-bezier(.22,1,.36,1), height .4s cubic-bezier(.22,1,.36,1), max-height .4s ease; }
.noteEditor.zenMode { width: min(1320px, 100%) !important; height: min(96vh, 100dvh) !important; }
.zenMode .editorTa { padding-left: max(18px, calc(50% - 380px)) !important; padding-right: max(18px, calc(50% - 380px)) !important; font-size: 16px !important; line-height: 1.75 !important; }
.zenMode .previewPane { padding-left: max(18px, calc(50% - 380px)) !important; padding-right: max(18px, calc(50% - 380px)) !important; }
.slashMenu { animation: slashIn .18s cubic-bezier(.34,1.5,.6,1) both; transform-origin: top left; }
@keyframes slashIn { from { opacity: 0; transform: scale(.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.slashItem { transition: background .12s ease, color .12s ease; }
.outlineItem { transition: background .15s ease, color .15s ease, border-color .15s ease, padding-left .2s cubic-bezier(.22,1,.36,1); }
.outlineItem:hover { background: ${T.accentWash}; color: ${T.text} !important; border-left-color: ${T.pink} !important; }
/* === block editor === */
.blkRow { transition: background .15s ease, border-color .15s ease; }
.blkRow:hover, .blkRow:focus-within { background: ${hexA(T.text, 0.03)}; }
.blkRow.clRow:focus-within { background: ${T.accentWash}; }
.blkInput::placeholder { color: ${T.vmuted}; opacity: .8; }
.blockEditor { cursor: text; }
.richSeg { outline: 1px solid transparent; transition: outline-color .2s ease; }
.richSeg .richSegHint { opacity: 0; transition: opacity .2s ease; }
.richSeg:hover { outline-color: ${hexA(T.purple, 0.3)}; }
.richSeg:hover .richSegHint { opacity: 1; }
.richSegHint:hover { color: ${T.text} !important; border-color: ${hexA(T.purple, 0.5)} !important; }
/* === apple-grade checklists & lists === */
.clRow, .liRow { transition: background .15s ease; }
.clRow:hover, .clRow:focus-within { background: ${T.accentWash}; }
.liRow:hover { background: ${hexA(T.text, 0.03)}; }
.clCheck { transition: transform .22s cubic-bezier(.34,1.6,.6,1), background .2s ease, border-color .2s ease, box-shadow .25s ease; }
.clCheck:hover { transform: scale(1.12); border-color: ${hexA(T.fuchsia, 0.7)} !important; }
.clCheck:active { transform: scale(.9); }
@keyframes clPop { 0% { transform: scale(.6); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }
@keyframes clDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.clTick { stroke-dasharray: 1; animation: clDraw .32s cubic-bezier(.22,1,.36,1) .05s backwards; }
.clCheck[aria-pressed="true"] { animation: clPop .35s cubic-bezier(.34,1.6,.6,1); }
.clInput::placeholder { color: ${T.vmuted}; }
.clAddRow { opacity: .55; transition: opacity .2s ease, background .15s ease; }
.clAddRow:hover { opacity: 1; background: ${T.accentWash}; }
/* === pro notes: ribbon + rendered block animations === */
.ribbon { scrollbar-width: thin; }
.ribbon::-webkit-scrollbar { height: 5px; }
.ribbonGroup { display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0; animation: riseIn .4s cubic-bezier(.22,1,.36,1) both; }
.ribbonGroup:nth-child(1) { animation-delay: .02s; } .ribbonGroup:nth-child(3) { animation-delay: .07s; }
.ribbonGroup:nth-child(5) { animation-delay: .12s; } .ribbonGroup:nth-child(7) { animation-delay: .17s; }
.tbtn { transition: background .15s ease, color .15s ease, border-color .15s ease, transform .2s cubic-bezier(.34,1.6,.6,1); }
.tbtn:hover { background: ${T.accentWash}; color: ${T.text}; border-color: ${hexA(T.purple, 0.35)}; transform: translateY(-1px); }
.tbtn:active { transform: scale(.92); }
.mdFade { animation: mdIn .3s cubic-bezier(.22,1,.36,1); }
@keyframes mdIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.mdBlock { animation: mdIn .35s cubic-bezier(.22,1,.36,1); }
.mdTr { transition: background .15s ease; }
.mdTr:hover { background: ${T.accentWash} !important; }
.mdCheck { transition: transform .2s cubic-bezier(.34,1.6,.6,1), background .15s ease, border-color .15s ease; }
.mdCheck:hover { transform: scale(1.2); }
@keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.chartBar { transform-origin: bottom; animation: barGrow .65s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes lineDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.chartLine { stroke-dasharray: 1; animation: lineDraw 1.1s cubic-bezier(.22,1,.36,1) .1s backwards; }
.chartArea { animation: fade .8s ease .5s backwards; }
.chartDot { animation: fade .35s ease backwards; }
@keyframes segIn { from { opacity: 0; } to { opacity: 1; } }
.pieSeg { animation: segIn .5s ease backwards; }
.legendRow { animation: riseIn .4s cubic-bezier(.22,1,.36,1) backwards; }
.flowNode { display: inline-block; animation: pop .4s cubic-bezier(.34,1.5,.6,1) backwards; }
.flowArrow { animation: fade .3s ease backwards; }
@keyframes progGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.progFill { transform-origin: left; animation: progGrow .8s cubic-bezier(.22,1,.36,1) backwards; }
/* === luxury layer === */
@keyframes lxTwinkle { 0%,100% { opacity: .35; transform: scale(.8); } 50% { opacity: .9; transform: scale(1.15); } }
.lxStar { animation: lxTwinkle 4.5s ease-in-out infinite; }
@keyframes lxShoot { 0%, 92% { transform: translate(0, 0) rotate(18deg); opacity: 0; } 93% { opacity: 1; } 100% { transform: translate(125vw, 42vh) rotate(18deg); opacity: 0; } }
.lxShoot { animation: lxShoot 17s linear infinite; will-change: transform; }
/* cards catch the light on hover — a slow diagonal sheen sweep */
.luxcard { position: relative; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.luxcard::after { content: ""; position: absolute; top: -60%; left: -75%; width: 50%; height: 220%; transform: rotate(22deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.045), transparent); pointer-events: none; transition: left .8s cubic-bezier(.22,1,.36,1); }
@media (hover: hover) {
  .luxcard:hover { transform: translateY(-2px); box-shadow: 0 18px 44px rgba(2,0,8,0.5), 0 0 26px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.07) inset; }
  .luxcard:hover::after { left: 135%; }
}
/* sidebar nav: active item is a clean gradient-edged pill — no stray rails */
.navbtn { position: relative; }
.navbtn[aria-current="page"] {
  background: linear-gradient(${hexA(T.purple, 0.13)}, ${hexA(T.purple, 0.13)}) padding-box, ${T.edgeSoft} border-box !important;
  border: 1px solid transparent !important;
  box-shadow: 0 4px 16px ${T.purpleGlow}, 0 1px 0 rgba(255,255,255,0.06) inset !important;
}
.navbtn[aria-current="page"] svg { filter: drop-shadow(0 0 5px ${hexA(T.pink, 0.55)}); }
/* count-up numbers settle with a soft pop */
@keyframes numIn { from { opacity: .35; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
.numTick { animation: numIn .3s cubic-bezier(.22,1,.36,1); display: inline-block; font-variant-numeric: tabular-nums; }
/* === card scene artwork === */
@keyframes scSun { 0%,100% { opacity: .8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
.scSun { animation: scSun 6s ease-in-out infinite; transform-origin: 320px 34px; }
@keyframes scMote { 0% { transform: translateY(0); opacity: .2; } 50% { opacity: .9; } 100% { transform: translateY(-14px); opacity: .2; } }
.scMoteA { animation: scMote 5s ease-in-out infinite; }
.scMoteB { animation: scMote 6.5s ease-in-out .8s infinite; }
.scMoteC { animation: scMote 5.8s ease-in-out 1.4s infinite; }
@keyframes scSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
.scTree { animation: scSway 5s ease-in-out infinite; }
.scLeaf { animation: scSway 4s ease-in-out infinite; }
@keyframes scWaveShift { from { transform: translateX(0); } to { transform: translateX(-100px); } }
.scWave { animation: scWaveShift 8s linear infinite; }
.scWave2 { animation: scWaveShift 11s linear infinite; }
@keyframes scSpark { 0%,100% { opacity: .3; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.15); } }
.scSpark { animation: scSpark 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes scGearSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.scGear { animation: scGearSpin 14s linear infinite; }
@keyframes scBarGrow { 0% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.4); } }
.scBar { animation: scBarGrow 4s ease-in-out infinite; }
/* day timeline */
.tlSlot:hover { background: rgba(255,255,255,0.03) !important; }
.tlSlot:active { background: rgba(168,85,247,0.08) !important; }
.tlBlock { transition: transform .16s cubic-bezier(.34,1.4,.5,1), box-shadow .16s ease, filter .16s ease; }
.tlBlock:hover { transform: translateY(-1px); filter: brightness(1.12); }
.tlBlock:active { transform: scale(.985); }
.viewSegBtn[aria-selected="false"]:hover { color: ${T.text}; background: ${hexA("#FFFFFF", 0.04)}; }
/* vivid mesh: sharp gradient + crisp geometry */
.vividMesh { isolation: isolate; }
.vmRing { position: absolute; border-radius: 50%; border-style: solid; will-change: transform; }
.vmr1 { width: 150px; height: 150px; border-width: 18px; top: -56px; right: 26px; animation: vmDrift1 16s ease-in-out infinite; }
.vmr2 { width: 96px; height: 96px; border-width: 12px; bottom: -40px; left: 14%; animation: vmDrift2 19s ease-in-out infinite; }
.vmDot { position: absolute; border-radius: 50%; will-change: transform; }
.vmd1 { width: 70px; height: 70px; top: 30%; left: 24%; animation: vmDrift2 14s ease-in-out infinite; }
.vmd2 { width: 120px; height: 120px; bottom: -50px; right: -30px; animation: vmDrift1 21s ease-in-out infinite; }
.vmShine { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.18), transparent 42%); }
@keyframes vmDrift1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-18px,12px); } }
@keyframes vmDrift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(16px,-12px); } }
/* banner motifs */
.meshMotif { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); }
.pageBanner .heroCluster { max-width: calc(100% - 142px); }
@keyframes mmFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.mmFloat { animation: mmFloat 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.mmF2 { animation-duration: 5s; animation-delay: .4s; }
.mmF3 { animation-duration: 4.6s; animation-delay: .8s; }
@keyframes mmDraw { from { stroke-dasharray: 220; stroke-dashoffset: 220; } to { stroke-dasharray: 220; stroke-dashoffset: 0; } }
.mmDraw { animation: mmDraw 1.6s cubic-bezier(.22,1,.36,1) .2s both; }
@keyframes mmSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.mmSpin { animation: mmSpin 18s linear infinite; transform-box: fill-box; }

.heroCard { position: relative; overflow: hidden; }
.heroCard .heroBody { position: relative; z-index: 2; }
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 260px; } }
/* === bottom nav micro-interactions === */
.bn-item { position: relative; }
.bn-item svg { transition: transform .25s cubic-bezier(.34,1.6,.6,1); }
.bn-item:active svg { transform: scale(.85); }
.bn-item[aria-current="page"] svg { transform: translateY(-1px) scale(1.1); }
.bn-ind { position: absolute; top: -7px; left: 50%; transform: translateX(-50%); width: 16px; height: 3px; border-radius: 3px; background: ${T.brandGrad}; box-shadow: 0 0 10px ${T.hotPink}; animation: indIn .3s cubic-bezier(.34,1.6,.6,1) both; }
@keyframes indIn { from { width: 0; opacity: 0; } to { width: 16px; opacity: 1; } }
.bn-add { transition: transform .25s cubic-bezier(.34,1.6,.6,1), box-shadow .25s ease; }
.bn-add:active { transform: scale(.9) rotate(8deg); }
/* desktop: task menu is a fixed popover near the kebab; scrim is invisible click-catcher */
.sheetScrim { display: block; position: fixed; inset: 0; z-index: 70; background: transparent; }
.sheetHandle, .sheetTitle { display: none; }
.deskHideSheet { display: none; }
.taskSheet { z-index: 71; min-width: 200px; max-width: 240px; box-shadow: 0 18px 50px rgba(0,0,0,0.6); animation: pop .14s ease; max-height: 360px; overflow-y: auto; }
/* today column keeps a still, premium black finish — the date badge is the only colour cue */
@media (max-width: 1180px) {
  .rightpanel { display: none !important; }
  .dash-2col { grid-template-columns: 1fr !important; }
  .pageBanner .meshMotif { width: 102px !important; height: 102px !important; right: 2px !important; }
  .pageBanner .heroCluster { max-width: calc(100% - 108px) !important; }
  .pageBanner .heroTitle { font-size: 21px !important; }
  .pageBanner .heroSub { font-size: 11.5px !important; }
  .dash-stats { gap: 9px !important; }
  .dash-stat { padding: 12px !important; }
  .dash-stat-val { font-size: 21px !important; }
  .notesInsights { display: none !important; }
}
@media (max-width: 980px) {
  .notesSidebar { display: none !important; }
  .editorMeta { display: none !important; }
}
@media (max-width: 860px) {
  /* ---- mistouch guard: roomier targets on phones ---- */
  .taskcard { padding: 11px 11px !important; }
  .taskcard + .taskcard { margin-top: 2px; }
  .addmini { width: 34px !important; height: 34px !important; min-width: 34px !important; }
  .kebab { width: 28px !important; height: 28px !important; }
  .addtask { padding: 13px !important; font-size: 13.5px !important; }
  .noteChip { padding: 7px 9px !important; }
  .chip { padding: 9px 15px !important; }
  .ghostbtn { padding: 10px 14px !important; }
  .bottomnav { gap: 2px; }
  .bottomnav .bn-item, .bottomnav .bn-add { min-width: 60px; padding: 6px 10px 4px; min-height: 48px; box-sizing: border-box; }
  .sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 60 !important; transform: translateX(-100%); transition: transform .28s cubic-bezier(.22,.61,.36,1); width: 248px; }
  .sidebar.sidebar-open { transform: translateX(0); box-shadow: 0 0 60px rgba(0,0,0,0.7); }
  .mobileonly { display: grid !important; }
  .mobileonly2 { display: block !important; }
  .mobileFlex { display: flex !important; }
  .mobileSummary { display: block !important; }
  .deskonly { display: none !important; }
  .hdr-title-mobile { display: block !important; }
  /* week grid becomes a horizontal day carousel with scroll-snap */
  .weekgrid { display: flex !important; grid-template-columns: none !important; overflow-x: auto !important; scroll-snap-type: x mandatory; gap: 12px !important; -webkit-overflow-scrolling: touch; padding: 14px 12px !important; scroll-padding: 0 12px; }
  .weekgrid::-webkit-scrollbar { display: none; }
  .weekgrid { scrollbar-width: none; }
  .weekgrid.dragging { scroll-snap-type: none; } /* drag auto-scroll must not fight snapping */
  .weekgrid .dayCol { min-width: calc(100vw - 76px) !important; scroll-snap-align: center; border-radius: 18px !important; padding: 14px 12px !important; box-shadow: 0 8px 26px rgba(0,0,0,0.28); }
  /* roomier, friendlier task cards on phones */
  .checkdot { width: 21px !important; height: 21px !important; min-width: 21px !important; }
  .taskcard { border-radius: 13px !important; }
  .taskTitle { font-size: 14px !important; line-height: 1.4 !important; }
  .dayEmpty svg { width: 130px; height: auto; }
  /* notes: New Note becomes a slim bar, not a giant empty hero */
  .newNoteTile { min-height: 56px !important; flex-direction: row !important; gap: 10px !important; }
  .newNoteTile > div:first-child { width: 30px !important; height: 30px !important; }
  .notesrow > .newnote:only-child { flex: 1 1 100% !important; min-height: 128px !important; }
  .notesrow > .notecard, .notesrow > .newnote { flex-basis: 82% !important; }
  .mobileSumBtn { transition: transform .2s cubic-bezier(.34,1.5,.6,1), box-shadow .2s ease; }
  .mobileSumBtn:active { transform: scale(.98); }
  .mobileBody { padding-bottom: 76px !important; }
  .noteEditor { width: 100% !important; height: 100% !important; max-height: 100dvh !important; border-radius: 0 !important; }
  .editorFoot { gap: 8px !important; padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important; }
  .editorFoot > div { flex: 1 1 100% !important; height: 0 !important; margin: 0 !important; }
  .editorFoot > button:nth-last-child(1), .editorFoot > button:nth-last-child(2) { flex: 1 1 0 !important; min-width: 120px; justify-content: center !important; padding-top: 12px !important; padding-bottom: 12px !important; }
  .ribbon { padding-left: 12px !important; padding-right: 12px !important; flex-wrap: wrap !important; overflow-x: visible !important; row-gap: 5px; }
  .formModal { width: 100% !important; max-width: 100% !important; max-height: 92dvh !important; border-radius: 22px 22px 0 0 !important; align-self: flex-end !important; animation: sheetUp .28s cubic-bezier(.22,.61,.36,1) !important; }
  .actionSheet { width: 100% !important; max-width: 100% !important; border-radius: 22px 22px 0 0 !important; align-self: flex-end !important; padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important; animation: sheetUp .26s cubic-bezier(.22,.61,.36,1) !important; }
  .actionSheet .sheetItem { padding: 15px 18px !important; font-size: 16px !important; }
  .modalOverlay:has(.formModal), .modalOverlay:has(.actionSheet) { padding: 0 !important; align-items: flex-end !important; }
  .notesWorkspace { display: block !important; }
  .desk-quick-controls { width: 100%; }
  .toastBox { bottom: 86px !important; }
  .quickInput { font-size: 16px !important; }
  .qa-expand { display: inline-flex !important; }
  .qa-addlabel { display: none; }
  .quickAddWrap .qa-controls, .quickAddWrap .qa-chips { display: none !important; }
  .quickAddWrap .qa-controls.qa-open { display: flex !important; margin-top: 12px; }
  .quickAddWrap .qa-chips.qa-open { display: flex !important; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
  .taskSheet { position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; top: auto !important; width: 100vw !important; min-width: 0 !important; max-width: 100vw !important; border-radius: 20px 20px 0 0 !important; padding: 8px 12px calc(16px + env(safe-area-inset-bottom)) !important; z-index: 71 !important; animation: sheetUp .26s cubic-bezier(.22,.61,.36,1) !important; max-height: 70vh; overflow-y: auto; box-shadow: 0 -10px 40px rgba(0,0,0,0.6) !important; }
  .sheetScrim { display: block !important; position: fixed !important; inset: 0 !important; background: rgba(0,0,0,0.55) !important; z-index: 70 !important; animation: fade .18s ease; }
  .taskSheet .menuItem { padding: 14px 12px !important; font-size: 15px !important; }
  .sheetHandle { display: block !important; width: 40px; height: 4px; border-radius: 3px; background: rgba(255,255,255,0.25); margin: 4px auto 10px; }
  .deskHideSheet { display: inline-flex !important; }
  .sheetTitle { display: block !important; font-size: 13px; font-weight: 700; color: var(--muted, #A596B8); padding: 0 12px 6px; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
.bottomnav { display: none; }
@media (max-width: 860px) {
  .bottomnav { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 45; background: ${hexA(T.panel, 0.96)}; backdrop-filter: blur(14px); border-top: 1px solid ${T.border}; padding: 8px 10px calc(8px + env(safe-area-inset-bottom)); justify-content: space-around; }
}
@media (min-width: 861px) { .bottomnav { display: none !important; } }
@media (prefers-reduced-motion: reduce) {
  *, .bar, .bar-v, .ring { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;
}
