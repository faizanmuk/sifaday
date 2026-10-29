/* =========================================================================
   SIFAAIZ — app.js
   The story flow: parcel → cover & contents → six chapters → the video.
   ========================================================================= */
(function () {
  "use strict";

  const D = window.SIFAAIZ_DATA || {};
  const M = window.Motion;
  const UI = window.UI;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const body = document.body;
  const store = UI.store;

  const chapters = (D.chapters || []).filter((c) => document.getElementById(c.id));
  const state = {
    view: "parcel",
    busy: false,
    opened: store.get("sfz-opened", false),
    visited: new Set(store.get("sfz-visited", []))
  };
  const chapterIndex = (id) => chapters.findIndex((c) => c.id === id);
  const QUIET = ["apart", "finale", "parcel"];   // no page-turn sound into or out of these

  /* =======================================================================
     VIEW SWITCHING (a sheet of coloured paper slides across)
     ======================================================================= */
  function setView(id) {
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.id === id));
    state.view = id;
    body.dataset.view = id;
    $("#hud-contents").hidden = id === "parcel";
    if (state.week) updateNudge();
    const meta = $(`meta[name="theme-color"]`);
    if (meta) meta.content = $(`#${id}`).dataset.tone || "#fbf1e4";
    if (chapterIndex(id) > -1) {
      state.visited.add(id);
      store.set("sfz-visited", [...state.visited]);
    }
    if (id !== "parcel") store.set("sfz-view", id);
    UI.Music.setViewMood(moodFor(id));
    if (id === "cover") refreshContents();
  }

  /* Which song belongs to a page (data.js → music.views). */
  function moodFor(id) { return ((D.music || {}).views || {})[id] || "main"; }

  async function go(id) {
    if (state.busy || id === state.view || !document.getElementById(id)) return;
    state.busy = true;
    const target = document.getElementById(id);
    const ch = chapters[chapterIndex(id)];
    const label = ch ? `${UI.pad(chapterIndex(id) + 1)} · ${ch.title}` : (id === "cover" ? "Contents" : "");
    // Start the music change now, so the old song fades out *under* the
    // page turn and the new one blooms in as the new page appears.
    UI.Music.setViewMood(moodFor(id));
    if (!QUIET.includes(id) && !QUIET.includes(state.view)) UI.Sfx.play("paper");
    await M.wipeIn(target.dataset.tone, label);
    setView(id);
    window.scrollTo(0, 0);
    if (M.refreshProgress) M.refreshProgress();
    await M.wait(M.reduced ? 60 : 260);
    await M.wipeOut();
    state.busy = false;
    const heading = $(`#${id} [tabindex="-1"]`);
    if (heading) heading.focus({ preventScroll: true });
  }

  /* =======================================================================
     LOADER
     ======================================================================= */
  async function finishLoading() {
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    await Promise.all([Promise.race([fonts, M.wait(1500)]), M.wait(M.reduced || state.opened ? 150 : 900)]);
    $("#loader").classList.add("is-done");
    body.classList.remove("is-loading");

    // Preview shortcut while editing: index.html?view=party&at=cake-block
    const params = new URLSearchParams(location.search);
    const preview = params.get("view");
    let start = "parcel";
    if (preview && document.getElementById(preview)) start = preview;
    else if (state.opened) start = store.get("sfz-view", "cover");
    if (!document.getElementById(start)) start = "cover";
    setView(start);
    const at = params.get("at");
    if (at && document.getElementById(at)) document.getElementById(at).scrollIntoView();
  }

  /* =======================================================================
     THE PARCEL — recipient check, then pull the ribbon
     ======================================================================= */
  function initParcel() {
    const P = D.parcel || {};
    $("#label-to").textContent = `${D.name || "Assifa Niswa"} (${D.nickname || "Sifa"})`;
    $("#label-from").textContent = D.partner || "Faizan";
    $("#label-contents").textContent = P.contents || "One birthday.";
    $("#label-handling").textContent = P.handling || "With care.";

    const box = $("#parcel-box");
    const annot = $("#parcel-annot");
    const reply = $("#parcel-reply");
    const yes = $("#yes-btn");
    const no = $("#no-btn");
    const choice = $("#music-choice");
    const withMusic = $("#with-music");
    const notMe = P.notMe && P.notMe.length ? P.notMe : ["Hm. The label says otherwise."];
    let confirmed = false, nos = 0, opening = false;

    const say = (text) => {
      annot.textContent = text;
      annot.classList.remove("is-on"); void annot.offsetWidth; annot.classList.add("is-on");
    };
    const wiggle = () => { box.classList.remove("is-wiggle"); void box.offsetWidth; box.classList.add("is-wiggle"); };

    UI.Music.onReady((ok) => { choice.hidden = !ok; });

    no.addEventListener("click", () => {
      reply.textContent = notMe[Math.min(nos, notMe.length - 1)];
      nos += 1;
      wiggle();
      UI.Sfx.play("boing");
      if (nos >= notMe.length) {
        no.hidden = true;
        yes.textContent = "…fine, it's me";
        yes.focus();
      }
    });

    yes.addEventListener("click", () => {
      confirmed = true;
      $("#pstep-check").classList.remove("is-active");
      $("#pstep-open").classList.add("is-active");
      box.classList.add("is-ready");
      say(P.ready || "go on. pull it.");
      UI.Sfx.play("pop");
      $("#pstep-open .parcel-q").focus({ preventScroll: true });
    });

    async function open() {
      if (opening) return;
      opening = true;
      if (!choice.hidden && withMusic.checked) UI.Music.play();   // a real tap: allowed to start sound
      UI.Sfx.play("magic");
      box.classList.add("is-opening");
      $("#parcel").classList.add("is-opening");
      await M.wait(M.reduced ? 200 : 1300);
      state.opened = true;
      store.set("sfz-opened", true);
      await go("cover");
      $("#parcel").classList.remove("is-opening");
      box.classList.remove("is-opening");
      opening = false;
    }

    box.addEventListener("click", () => {
      if (!confirmed) { wiggle(); say(P.wrongTap || "security check first ↓"); UI.Sfx.play("boing"); return; }
      open();
    });
    $("#open-btn").addEventListener("click", open);
  }

  /* =======================================================================
     THE COVER + CONTENTS
     ======================================================================= */
  /* ---------- The crown + handwritten caption on her polaroids ---------- */
  let crownCount = 0;
  function crown(extraClass) {
    const id = `crown-gold-${++crownCount}`;
    const el = UI.h("span", { class: `crown ${extraClass || ""}`, "aria-hidden": "true" });
    el.innerHTML = `
      <svg viewBox="0 0 120 84" class="crown-svg">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#ffd56b"/><stop offset="1" stop-color="#f6b44f"/>
          </linearGradient>
        </defs>
        <path d="M12 68 L7 24 L34 46 L60 9 L86 46 L113 24 L108 68 Z" fill="url(#${id})" stroke="#3b1e2b" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M60 18 L60 52" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
        <rect x="10" y="62" width="100" height="15" rx="5" fill="#ffd56b" stroke="#3b1e2b" stroke-width="3.2"/>
        <circle cx="7" cy="24" r="5.5" fill="#ff8fab" stroke="#3b1e2b" stroke-width="2.5"/>
        <circle cx="60" cy="9" r="7" fill="#d42a4a" stroke="#3b1e2b" stroke-width="2.5"/>
        <circle cx="113" cy="24" r="5.5" fill="#c8b6ff" stroke="#3b1e2b" stroke-width="2.5"/>
        <circle cx="35" cy="69.5" r="4.2" fill="#d42a4a"/>
        <path d="M60 64 l5 5.5 -5 5.5 -5 -5.5 z" fill="#c8b6ff" stroke="#3b1e2b" stroke-width="1.6"/>
        <circle cx="85" cy="69.5" r="4.2" fill="#ff8fab"/>
        <circle cx="57" cy="6" r="2" fill="rgba(255,255,255,.8)"/>
      </svg>
      <i class="twinkle t1"></i><i class="twinkle t2"></i><i class="twinkle t3"></i>`;
    return el;
  }
  function polaroidCaption(text) {
    return text ? UI.h("span", { class: "polaroid-cap", "aria-hidden": "true", text }) : null;
  }

  /* ---------- Her calendar day (her time zone) ----------
     While testing locally, ?today=2026-10-31 pretends it's that date. */
  function herToday() {
    const fake = UI.DEV && new URLSearchParams(location.search).get("today");
    if (fake && /^\d{4}-\d{2}-\d{2}$/.test(fake)) { const [y, m, d] = fake.split("-").map(Number); return { y, m, d }; }
    try {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: (D.places && D.places.yourZone) || "Asia/Jakarta", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
      const p = {}; parts.forEach((x) => { p[x.type] = x.value; });
      return { y: +p.year, m: +p.month, d: +p.day };
    } catch (e) { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
  }
  /* Days since her birthday this year: 0 on the day, negative before it. */
  /* ---------- Her age (her time zone) ----------
     Born 30 Oct 2007 → turns 19 at 00:00 on 30 Oct 2026, Indonesian time. */
  const ZONE_OFFSET_H = 7;   // Asia/Jakarta (WIB): UTC+7, no daylight saving
  function ageInfo() {
    const B = D.birthday || { month: 10, day: 30, year: 2007 };
    const t = herToday();
    const before = t.m < B.month || (t.m === B.month && t.d < B.day);
    const age = t.y - (B.year || t.y) - (before ? 1 : 0);
    const birthMs = Date.UTC(B.year, B.month - 1, B.day) - ZONE_OFFSET_H * 36e5;   // 00:00 her time
    // With the test-only ?today= override, pretend it's just after midnight that day.
    const fake = UI.DEV && new URLSearchParams(location.search).get("today");
    const nowMs = fake ? Date.UTC(t.y, t.m - 1, t.d, 0, 5) - ZONE_OFFSET_H * 36e5 + (performance.now() % 1000) : Date.now();
    return { age, birthMs, nowMs, offsetMs: nowMs - Date.now() };
  }
  const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");

  /* Fill {age} / {ordinal} into the few lines that mention her age. */
  function personalizeAge() {
    const { age } = ageInfo();
    const v = { age, ordinal: ordinal(age) };
    const swap = (s) => String(s).replace(/\{age\}/g, v.age).replace(/\{ordinal\}/g, v.ordinal);
    (D.facts || []).forEach((f) => { f.value = swap(f.value); });
    if (D.cake) { D.cake.doneTitle = swap(D.cake.doneTitle || ""); if (D.cake.numerals) D.cake.digits = String(age).split(""); }
    if (D.video) D.video.closing = swap(D.video.closing || "");
    if (D.odometer) D.odometer.note = swap(D.odometer.note || "");
    const left = $("#mast-left");
    if (left && age > 0) left.textContent = `Issue No. ${age}`;
  }

  /* THE SIFA ODOMETER — counts up when she arrives, seconds keep ticking. */
  function initOdometer() {
    const O = D.odometer;
    const root = $("#odometer");
    if (!O || !root) return;
    const fmt = (n) => Math.floor(n).toLocaleString("en-US");
    const fmtFor = (key, n) => key === "beats" ? (n / 1e6).toFixed(1) + " million" : fmt(n);
    const info = ageInfo();
    const now = () => Date.now() + info.offsetMs;
    const values = () => {
      const ms = Math.max(0, now() - info.birthMs);
      return { days: ms / 864e5, hours: ms / 36e5, beats: (ms / 6e4) * 72, seconds: ms / 1000 };
    };
    root.querySelector(".odo-title").textContent = O.title || "The Sifa odometer";
    root.querySelector(".odo-unit").textContent = O.unit || "years";
    root.querySelector(".odo-note").textContent = O.note || "";
    const big = root.querySelector(".odo-big");
    big.textContent = info.age;
    const list = root.querySelector(".odo-stats");
    const cells = {};
    (O.stats || []).forEach((s) => {
      const num = UI.h("b", { class: "odo-num", text: s.key === "replies" ? "∞" : "0" });
      cells[s.key] = num;
      list.append(UI.h("li", { class: `odo-stat odo-${s.key}` }, num, UI.h("span", { class: "odo-label", text: s.label })));
    });
    const live = root.querySelector(".odo-live");
    const paintLive = () => {
      const [a, b] = (O.live || "{seconds}").split("{seconds}");
      live.replaceChildren(a, UI.h("b", { class: "odo-seconds", text: fmt(values().seconds) }), b || "");
    };
    paintLive();
    // Count up from zero the first time she sees it (timer-driven, so it
    // finishes even if animation frames are paused).
    M.onceVisible(root, () => {
      const target = values();
      const dur = M.reduced ? 0 : 1900;
      const t0 = Date.now();
      const step = () => {
        const k = dur ? Math.min(1, (Date.now() - t0) / dur) : 1;
        const e = 1 - Math.pow(1 - k, 3);
        big.textContent = Math.round(info.age * e);
        ["days", "hours", "beats"].forEach((key) => { if (cells[key]) cells[key].textContent = fmtFor(key, target[key] * e); });
        if (k < 1) setTimeout(step, 40);
        else { big.textContent = info.age; root.classList.add("is-counted"); }
      };
      step();
    }, { threshold: 0.3 });
    let tick = 0;
    M.whileVisible(root, () => { clearInterval(tick); tick = setInterval(() => {
      paintLive();
      if (root.classList.contains("is-counted")) { const v = values(); ["days", "hours", "beats"].forEach((key) => { if (cells[key]) cells[key].textContent = fmtFor(key, v[key]); }); }
    }, 1000); }, () => clearInterval(tick));
  }

  function birthdayOffset() {
    const B = D.birthday || { month: 10, day: 30 };
    const t = herToday();
    return { offset: Math.round((Date.UTC(t.y, t.m - 1, t.d) - Date.UTC(t.y, B.month - 1, B.day)) / 864e5), year: t.y, B };
  }

  function birthdaySticker() {
    const S = (D.cover && D.cover.sticker) || {};
    const diff = -birthdayOffset().offset;
    let text = S.today || "Happy birthday!";
    if (diff === 1) text = S.tomorrow || text;
    else if (diff > 1 && diff <= 60) text = UI.fill(S.before || "{n} days to go", { n: diff });
    else if (diff < 0 && diff >= -7) text = S.after || text;
    $("#burst-text").textContent = text;
    return text;
  }

  /* From 00:00 on her birthday the cover wears an edition stamp. */
  function editionStamp() {
    const E = D.edition || {};
    const { offset } = birthdayOffset();
    const el = $("#edition-stamp");
    el.hidden = !(offset >= 0 && offset <= 6);
    el.textContent = offset === 0 ? (E.birthday || "Birthday edition") : (E.week || "Birthday week edition");
  }

  function buildWeek() {
    const { offset, year, B } = birthdayOffset();
    const labels = Array.from({ length: 7 }, (_, i) =>
      new Date(Date.UTC(year, B.month - 1, B.day + i)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }));
    state.week = UI.birthdayWeek($("#week"), D.birthdayWeek, offset, labels, updateNudge);
    updateNudge();
  }

  /* The little "🎁 Day N is ready" chip: shown on any page (not the parcel
     or the video page) while a birthday-week day is unlocked but unopened. */
  function updateNudge() {
    const el = $("#nudge");
    const w = state.week;
    const i = w ? w.unread() : -1;
    const quiet = state.view === "parcel" || state.view === "finale";
    el.hidden = i < 0 || quiet;
    if (i >= 0) {
      el.textContent = UI.fill((D.birthdayWeek && D.birthdayWeek.nudge) || "🎁 Day {n} is ready", { n: i + 1 });
      el.dataset.day = i;
    }
  }

  /* ---------- Secrets on the cover: the sticker and the masthead ---------- */
  function initCoverSecrets() {
    const S = D.secrets || {};
    // Keep tapping the round sticker: it gets annoyed, then gives up.
    const burst = $(".burst");
    const lines = S.sticker || ["hey.", "stop.", "fine."];
    let taps = 0, base = "";
    burst.addEventListener("click", () => {
      if (!base) base = $("#burst-text").textContent;
      burst.classList.remove("is-poked"); void burst.offsetWidth; burst.classList.add("is-poked");
      $("#burst-text").textContent = lines[Math.min(taps, lines.length - 1)];
      taps += 1;
      UI.Sfx.play(taps >= lines.length ? "boing" : "pop");
      if (taps >= lines.length) { UI.Secrets.find("sticker"); taps = 0; setTimeout(() => { $("#burst-text").textContent = base; base = ""; }, 2500); }
    });
    // Press and hold the big SIFAA for a moment.
    const mast = $("#mast-word");
    let holdTimer = 0;
    const cancel = () => { clearTimeout(holdTimer); mast.classList.remove("is-holding"); };
    mast.addEventListener("pointerdown", () => {
      mast.classList.add("is-holding");
      holdTimer = setTimeout(() => {
        mast.classList.remove("is-holding");
        mast.classList.add("is-found");
        UI.Secrets.find("masthead");
        setTimeout(() => mast.classList.remove("is-found"), 1200);
      }, 900);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => mast.addEventListener(t, cancel));
    mast.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function initSecretsCounter() {
    const S = D.secrets || {};
    $("#secrets-hint").textContent = S.hint || "";
    UI.Secrets.onChange(() => {
      const n = UI.Secrets.count, total = UI.Secrets.total;
      $("#secrets-count").textContent = UI.fill(S.count || "Secrets found: {n} / {total}", { n, total });
      $("#secrets").classList.toggle("is-complete", n >= total);
    });
  }

  function initCover() {
    const C = D.cover || {};
    if (C.issue) $("#cover-issue").textContent = C.issue;
    $("#cover-photo").append(UI.photoFigure(C.photo, { ratio: "4 / 5", lazy: false, note: C.noPhoto || "Cover model: Sifa." }),
      crown("crown-cover"), polaroidCaption(C.photoCaption));
    (C.lines || []).forEach((l, i) => $("#cover-lines").append(
      UI.h("li", { class: `cl cl-${i + 1}` }, UI.h("span", { class: "cl-kicker", text: l.kicker }), UI.h("span", { class: "cl-text", text: l.text }))));
    birthdaySticker();
    editionStamp();
    initCoverSecrets();
    initSecretsCounter();
    buildWeek();
    // The chip steps aside while the birthday-week boxes themselves are on screen.
    M.whileVisible($("#week"), () => document.body.classList.add("week-in-view"),
      () => document.body.classList.remove("week-in-view"), { threshold: 0.15 });
    $("#nudge").addEventListener("click", () => {
      const i = +$("#nudge").dataset.day;
      if (state.week && i >= 0) state.week.open(i);
    });
    $("#contents-note").textContent = C.contentsNote || "";

    const list = $("#contents-list");
    chapters.forEach((c, i) => {
      const b = UI.h("button", { class: "ct", type: "button", "data-id": c.id },
        UI.h("span", { class: "ct-num", "aria-hidden": "true", text: UI.pad(i + 1) }),
        UI.h("span", { class: "ct-copy" },
          UI.h("span", { class: "ct-title", text: c.title }),
          UI.h("span", { class: "ct-note", text: c.note })),
        UI.h("span", { class: "ct-stamp", "aria-hidden": "true" }));
      b.addEventListener("click", () => go(c.id));
      list.append(UI.h("li", null, b));
    });
    $("#start-btn").addEventListener("click", () => {
      const next = chapters.find((c) => !state.visited.has(c.id));
      go(next ? next.id : chapters[0].id);
    });
    $("#hud-contents").addEventListener("click", () => go("cover"));
  }

  function refreshContents() {
    const T = (D.cover && D.cover.start) || {};
    const next = chapters.find((c) => !state.visited.has(c.id));
    $$(".ct").forEach((b) => {
      const id = b.dataset.id;
      const i = chapterIndex(id);
      const seen = state.visited.has(id);
      const isNext = next && next.id === id;
      b.classList.toggle("is-read", seen);
      b.classList.toggle("is-next", !!isNext);
      b.querySelector(".ct-stamp").textContent = seen ? "read" : isNext ? "next" : "";
      b.setAttribute("aria-label", `Chapter ${i + 1}: ${chapters[i].title}${seen ? " (read)" : isNext ? " (up next)" : ""}`);
    });
    // The date may have changed since the page opened (midnight, a new day of birthday week).
    birthdaySticker();
    editionStamp();
    buildWeek();
    const start = $("#start-btn");
    if (!state.visited.size) start.textContent = T.first || "Start reading";
    else if (next) start.textContent = UI.fill(T.next || "Keep reading · {title}", { title: next.title });
    else start.textContent = T.again || "Read it again";
  }

  /* =======================================================================
     CHAPTER ENDINGS — "next chapter" + back to the contents
     ======================================================================= */
  function buildChapterEnds() {
    $$("[data-end]").forEach((nav) => {
      const i = chapterIndex(nav.dataset.end);
      const next = chapters[i + 1];
      nav.append(UI.h("span", { class: "ce-rule", "aria-hidden": "true" }));
      if (next) {
        nav.append(UI.h("p", { class: "ce-label", text: next.id === "finale" ? "Okay, one last page…" : "Turn the page" }));
        const b = UI.h("button", { class: "btn btn-cherry ce-next", type: "button" },
          UI.h("span", { class: "ce-n", text: UI.pad(i + 2) }), UI.h("span", { text: next.title }));
        b.addEventListener("click", () => go(next.id));
        nav.append(b);
      }
      const back = UI.h("button", { class: "link-btn", type: "button", text: "Back to the contents" });
      back.addEventListener("click", () => go("cover"));
      nav.append(back);
    });
  }

  /* =======================================================================
     CHAPTER CONTENT (all driven by data.js)
     ======================================================================= */
  function buildChapters() {
    UI.Lightbox.init();

    // 01 · Warm-up
    UI.quiz($("#quiz"), D.quiz || [], D.quizResult);
    UI.scratchCard($("#ticket"), D.scratch, $("#scratch-reveal"));

    // 02 · Field guide
    const FG = D.fieldGuidePhoto || {};
    $("#spec-photo").append(UI.photoFigure(FG, { ratio: "4 / 5", lazy: false, caption: false, note: D.noPhoto || "Sifa." }));
    // A landscape photo gets a wider polaroid (and a wider column on big screens).
    $(".specimen").classList.toggle("is-landscape", FG.width > FG.height);
    $("#spec-photo").append(crown("crown-spec"), polaroidCaption(D.fieldGuideCaption));
    UI.facts($("#facts"), D.facts || []);
    UI.moods($("#mood"), D.moods);
    UI.littleThings($("#little-things"), D.littleThings || []);
    UI.gallery($("#gallery"), D.gallery || [], $("#wall-block"));

    // 03 · How it started
    UI.timeline($("#timeline"), (D.howItStarted && D.howItStarted.moments) || []);
    UI.reasons($("#reasons"), D.whyYou || [], $("#reasons-end"), D.reasonsEnd, D.reasonsBig);

    // 04 · The distance
    const P = D.places || {};
    $("#place-a").textContent = P.mine || "From here";
    $("#place-b").textContent = P.yours || "To there";
    UI.clocks($("#clocks"), Object.assign({ joke: (D.secrets || {}).clock }, P));
    $("#apart-text").textContent = D.apartText || "";
    initRoute();
    const vl = $("#voice-notes");
    (D.voiceNotes || []).forEach((v) => {
      const li = UI.h("li", { "data-reveal": "" });
      vl.append(li);
      new UI.VoicePlayer(li, v, D.voiceMissing);
    });
    UI.openWhen($("#envelopes"), D.openWhen || []);
    const F = D.future || {};
    $("#book-ending").textContent = F.ending || "";
    UI.book($("#book"), F.pages || [], $("#book-ending"), F.cover);
    UI.finalMessage($("#final-message"), D.finalMessage);

    // 05 · Birthday
    const booth = $("#birthday-photos");
    (D.birthdayPhotos || []).forEach((p, i) => {
      const li = UI.h("li", { "data-reveal": "", style: `--i:${i};--d:${i * 0.12}s` }, UI.photoFigure(p, { lazy: false }));
      UI.hideIfMissing(li, booth, booth);
      booth.append(li);
    });
    if (!booth.children.length) booth.hidden = true;
    $("#cake-name").textContent = D.nickname || "Sifa";
    M.onceVisible($("#party-title"), (el) => el.classList.add("is-in"), { threshold: 0.4 });
    initOdometer();
    UI.cake($("#cake-block"), D.cake || {}, () => {
      setTimeout(() => $("#present-block").classList.add("is-in"), M.reduced ? 0 : 1200);
    });
    UI.present($("#present-block"), D.treasure || {});

    // 06 · The last page
    initFinale();
  }

  /* The paper plane flies a little further with every chapter she has
     read, and lands when she's read them all. When the route comes into
     view it glides from where she last saw it to where it is now. */
  function initRoute() {
    const R = D.route || {};
    const path = $("#rl-path"), done = $("#rl-done"), plane = $("#rl-plane"), note = $("#route-note");
    if (!path.getTotalLength) return;
    // Measured when used: the chapter may still be hidden at start-up.
    const place = (p) => {
      const len = path.getTotalLength() || 285;
      const at = path.getPointAtLength(len * p);
      const ahead = path.getPointAtLength(Math.min(len, len * p + 1));
      const behind = path.getPointAtLength(Math.max(0, len * p - 1));
      const ang = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
      plane.setAttribute("transform", `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      done.style.strokeDasharray = `${p} 1`;
    };
    const progress = () => {
      const total = chapters.length;
      const n = chapters.filter((c) => state.visited.has(c.id)).length;
      return { n, total, p: total ? n / total : 0 };
    };
    let shown = store.get("sfz-plane", 0);
    place(shown);
    M.whileVisible($("#route"), () => {
      const { n, total, p } = progress();
      note.textContent = p >= 1 ? (R.landed || "Landed.") : UI.fill(R.progress || "{n} of {total} pages read.", { n, total });
      $("#route").classList.toggle("is-landed", p >= 1);
      if (Math.abs(p - shown) < 0.001) { place(p); return; }
      const from = shown, to = p;
      shown = p;
      store.set("sfz-plane", p);
      if (M.reduced) { place(to); return; }
      const t0 = performance.now(), dur = 1800;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        place(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 400);
    }, () => {}, { threshold: 0.4 });
  }

  /* "Tell Fizuu you finished" — opens WhatsApp with a ready message. */
  function initWhatsApp() {
    const W = D.whatsapp || {};
    const btn = $("#wa-btn");
    if (!W.button) { $("#wa-box").hidden = true; return; }
    const num = String(W.number || "").replace(/\D/g, "");
    btn.textContent = W.button;
    btn.href = `https://wa.me/${num}?text=${encodeURIComponent(W.message || "")}`;
    $("#wa-note").textContent = W.note || "";
    btn.addEventListener("click", () => UI.Sfx.play("pop"));
  }

  function initFinale() {
    const V = D.video || {};
    if (V.title) $("#finale-title").textContent = V.title;
    (V.intro || []).forEach((line, i) => $("#fin-lines").append(
      UI.h("p", { class: "fin-line", style: `--d:${0.3 + i * 0.9}s`, text: line })));
    $("#fin-ready-note").textContent = V.ready || "";
    if (V.readyButton) $("#fin-ready").textContent = V.readyButton;
    $("#back-cover").textContent = V.backCover || "";
    $("#next-issue").textContent = V.nextIssue || "";
    $("#replay-video").textContent = V.replay || "Watch it again";
    $("#to-contents").textContent = V.toContents || "Back to the contents";
    initWhatsApp();

    const merge = $("#merge");
    M.buildMerge(merge);

    const vf = UI.birthdayVideo($("#finale"), V, {
      onAfter() {
        $("#finale").classList.add("is-after");
        $("#replay-video").hidden = vf.missing;
        setTimeout(() => {
          M.playMerge(merge);
          M.confetti({ count: 120, y: 0.3 });
          // …then slow paper snow drifts down over the closing words.
          setTimeout(() => M.confetti({ rain: true, count: 70 }), M.reduced ? 0 : 1600);
          UI.Sfx.play("magic");
          UI.Music.setMood("birthday");      // Happy Birthday comes back for the ending
        }, M.reduced ? 0 : 1400);
      }
    });

    $("#fin-ready").addEventListener("click", () => {
      $("#fin-intro").classList.add("is-done");
      const wrap = $("#fin-stage-wrap");
      wrap.hidden = false;
      vf.prepare();
      requestAnimationFrame(() => {
        wrap.scrollIntoView({ behavior: M.reduced ? "auto" : "smooth", block: "center" });
        const play = $("#vf-play");
        (play.hidden ? $("#vf-continue") : play).focus({ preventScroll: true });
      });
    });
    $("#replay-video").addEventListener("click", () => vf.replay());
    $("#to-contents").addEventListener("click", () => go("cover"));
  }

  /* =======================================================================
     BOOT
     ======================================================================= */
  function boot() {
    const L = D.loading || {};
    const lt = $("#loader-text");
    if (lt && (state.opened ? L.again : L.first)) lt.textContent = state.opened ? L.again : L.first;

    UI.Sfx.init(D.sounds || {});
    UI.Music.init(D.music || {});
    UI.Secrets.init(D.secrets || {});
    personalizeAge();     // {age} / {ordinal} → 19 / 19th, before anything is built

    initParcel();
    initCover();
    buildChapterEnds();
    buildChapters();

    M.initKinetic();      // split titles into words (after data has filled them)
    M.initReveal();       // after all dynamic content exists
    M.initTapSparkle();
    M.initTilt(".cover-photo, .spec-photo, .ticket, .gift, .book-wrap");
    M.initReadProgress();
    finishLoading();
  }

  try {
    boot();
  } catch (err) {
    // Never leave her staring at a loader: show the opening no matter what.
    console.error(err);
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("is-done");
    body.classList.remove("is-loading");
    document.getElementById("parcel").classList.add("is-active");
  }
})();
