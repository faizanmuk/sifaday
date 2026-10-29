/* =========================================================================
   SIFAAIZ — interactions.js
   Reusable UI components. Each takes a container + data and builds itself.
   ========================================================================= */
(function () {
  "use strict";

  const html = document.documentElement;
  const reduced = () => window.Motion.reduced;
  /* Setup hints (file paths) are only shown while Faizan tests locally. */
  const DEV = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  html.classList.toggle("is-dev", DEV);

  /* ---------- tiny helpers ---------- */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k === "html") el.innerHTML = v;
        else if (k === "style") el.style.cssText = v;
        else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? "" : v);
      }
    }
    children.flat().forEach((c) => c != null && el.append(c));
    return el;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const fill = (s, vars) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : ""));
  const paragraphs = (text) =>
    String(text || "").split(/\n\s*\n/).filter(Boolean).map((t) => h("p", { text: t.trim() }));
  const store = {
    get(k, f) { try { const v = sessionStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch (e) { return f; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const ICON = {
    play: '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- toast ---------- */
  let toastTimer = 0;
  function toast(msg, ms) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), ms || 3800);
  }

  /* Small persistent memory (survives closing the browser, so the
     birthday week and secrets are remembered across days). */
  const keep = {
    get(k, f) { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- dialogs (shared open/close + focus restore) ---------- */
  let lastFocus = null;
  function openDialog(dlg) {
    lastFocus = document.activeElement;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    html.classList.add("has-dialog");
  }
  function closeDialog(dlg) {
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else { dlg.removeAttribute("open"); dlg.dispatchEvent(new Event("close")); }
  }
  function wireDialog(dlg) {
    dlg.addEventListener("close", () => {
      html.classList.remove("has-dialog");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) closeDialog(dlg); });
    dlg.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => closeDialog(dlg)));
  }

  /* =======================================================================
     PHOTO — <figure> with optional WebP/AVIF sources and lazy loading.
     If the file is missing: with `note`, a little handwritten card is shown;
     without it the figure fires "photo:missing" so its slot can hide.
     ======================================================================= */
  function photoFigure(photo, opts) {
    photo = photo || {};
    const o = Object.assign({ ratio: "4 / 5", lazy: true, caption: true, note: "" }, opts);
    const fig = h("figure", { class: "photo" + (o.note ? " has-note" : "") });
    fig.style.aspectRatio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : o.ratio;

    const ph = h("div", { class: "photo-ph" }, o.note ? h("span", { class: "ph-text", text: o.note }) : null);
    fig.append(ph);

    const markMissing = () => {
      photo._missing = true;
      fig.classList.add("is-missing");
      if (o.note) { ph.setAttribute("role", "img"); ph.setAttribute("aria-label", o.note); }
      const pic = fig.querySelector("picture");
      if (pic) pic.remove();
      fig.dispatchEvent(new CustomEvent("photo:missing", { bubbles: true }));
    };

    if (!photo.src || (Array.isArray(photo.src) && !photo.src.length)) { setTimeout(markMissing); return fig; }

    const pic = h("picture");
    if (photo.avif) pic.append(h("source", { type: "image/avif", srcset: photo.avif }));
    if (photo.webp) pic.append(h("source", { type: "image/webp", srcset: photo.webp }));
    const img = new Image();
    img.alt = photo.alt || "";
    img.decoding = "async";
    if (o.lazy) img.loading = "lazy";
    if (photo.width) img.width = photo.width;
    if (photo.height) img.height = photo.height;
    img.addEventListener("load", () => fig.classList.add("is-loaded"));
    // src may be a list of candidates (e.g. .jpg, .jpeg, .png, .webp):
    // try each in turn and use the first one that exists.
    const candidates = (Array.isArray(photo.src) ? photo.src : [photo.src]).filter(Boolean);
    let tryAt = 0;
    img.addEventListener("error", () => {
      tryAt += 1;
      if (tryAt < candidates.length) img.src = candidates[tryAt];
      else markMissing();
    });
    img.addEventListener("load", () => { photo._src = candidates[tryAt]; });
    img.src = candidates[0];
    pic.append(img);
    fig.append(pic);

    if (o.caption && photo.caption) fig.append(h("figcaption", { text: photo.caption }));
    return fig;
  }

  /* Remove a photo's slot when its file is missing; hide the whole block
     once every slot in it is gone. Slots wait hidden until they load. */
  function hideIfMissing(slot, list, block) {
    slot.classList.add("is-pending");
    slot.addEventListener("load", () => slot.classList.remove("is-pending"), true);
    slot.addEventListener("photo:missing", () => {
      slot.remove();
      if (list && !list.children.length && block) block.hidden = true;
    });
  }

  /* =======================================================================
     LIGHTBOX
     ======================================================================= */
  const Lightbox = {
    init() {
      this.dlg = document.getElementById("lightbox");
      this.img = document.getElementById("lb-img");
      this.cap = document.getElementById("lb-caption");
      this.prevBtn = document.getElementById("lb-prev");
      this.nextBtn = document.getElementById("lb-next");
      wireDialog(this.dlg);
      this.prevBtn.addEventListener("click", () => this.step(-1));
      this.nextBtn.addEventListener("click", () => this.step(1));
      this.dlg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") this.step(-1);
        if (e.key === "ArrowRight") this.step(1);
      });
      let x0 = null;
      this.dlg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      this.dlg.addEventListener("touchend", (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) this.step(dx < 0 ? 1 : -1);
        x0 = null;
      });
      this.dlg.addEventListener("close", () => { this.img.removeAttribute("src"); });
    },
    open(list, index) {
      if (!list.length) return;
      this.list = list;
      this.i = Math.max(0, index);
      this.render();
      openDialog(this.dlg);
    },
    step(d) {
      if (!this.list || this.list.length < 2) return;
      this.i = (this.i + d + this.list.length) % this.list.length;
      this.render();
    },
    render() {
      const p = this.list[this.i];
      this.img.style.animation = "none";
      void this.img.offsetWidth;
      this.img.style.animation = "";
      this.img.src = p._src || p.webp || (Array.isArray(p.src) ? p.src[0] : p.src);
      this.img.alt = p.alt || `Photo ${this.i + 1}`;
      this.cap.textContent = p.caption || "";
      const multi = this.list.length > 1;
      this.prevBtn.hidden = !multi;
      this.nextBtn.hidden = !multi;
    }
  };

  /* =======================================================================
     HOW IT STARTED — diary entries (photos optional)
     ======================================================================= */
  function timeline(container, moments) {
    moments.forEach((m, i) => {
      const li = h("li", { class: "moment" + (m.photo ? " has-photo" : ""), "data-reveal": "" },
        h("div", { class: "moment-copy" },
          h("p", { class: "moment-index", "aria-hidden": "true", text: pad(i + 1) }),
          h("h3", { class: "moment-title", text: m.title }),
          m.text ? h("p", { class: "moment-text", text: m.text }) : null));
      if (m.photo) {
        const slot = h("div", { class: "moment-photo" }, photoFigure(m.photo, { lazy: false }));
        slot.addEventListener("photo:missing", () => { slot.remove(); li.classList.remove("has-photo"); });
        li.append(slot);
      }
      container.append(li);
    });
  }

  /* =======================================================================
     FIELD GUIDE — facts, mood picker, sticky notes
     ======================================================================= */
  function facts(container, list) {
    list.filter((f) => f.value && String(f.value).trim()).forEach((f) => {
      const dd = h("dd");
      // Secret: the 🥔 is tappable. Five taps start a potato storm.
      String(f.value).split("🥔").forEach((part, i, arr) => {
        dd.append(part);
        if (i < arr.length - 1) dd.append(potato());
      });
      container.append(h("div", { class: "fact" }, h("dt", { text: f.label }), dd));
    });
  }
  function potato() {
    let taps = 0;
    const b = h("button", { class: "secret-potato", type: "button", "aria-label": "Potato", text: "🥔" });
    b.addEventListener("click", () => {
      taps += 1;
      b.classList.remove("is-boop"); void b.offsetWidth; b.classList.add("is-boop");
      if (taps < 5) { Sfx.play("pop"); return; }
      taps = 0;
      Sfx.play("boing");
      window.Motion.confetti({ emoji: "🥔", count: 36, rain: true });
      Secrets.find("potato");
    });
    return b;
  }

  /* =======================================================================
     SECRETS — five hidden easter eggs, counted on the contents page
     ======================================================================= */
  const Secrets = {
    cfg: {}, found: new Set(), subs: [],
    init(cfg) { this.cfg = cfg || {}; this.found = new Set(keep.get("sfz-secrets", [])); },
    get total() { return this.cfg.total || 5; },
    get count() { return this.found.size; },
    onChange(fn) { this.subs.push(fn); fn(); },
    find(key) {
      if (this.found.has(key)) return false;
      this.found.add(key);
      keep.set("sfz-secrets", [...this.found]);
      const n = this.found.size, total = this.total;
      const msg = (this.cfg.messages || {})[key] || "";
      toast(`${fill(this.cfg.found || "Secret {n} of {total} found", { n, total })}\n${msg}`, 6500);
      Sfx.play("win");
      if (n >= total) {
        setTimeout(() => {
          toast(this.cfg.all || "All secrets found!", 6500);
          window.Motion.confetti({ count: 160, y: 0.4 });
        }, 6600);
      }
      this.subs.forEach((fn) => fn());
      return true;
    }
  };

  /* One shared letter dialog for open-when letters and birthday-week days.
     content: a string (paragraphs) or a list of ready-made elements. */
  function showLetter(kicker, title, content, sign) {
    const dlg = document.getElementById("letter");
    document.getElementById("letter-kicker").textContent = kicker;
    document.getElementById("letter-title").textContent = title;
    document.getElementById("letter-body").replaceChildren(...(typeof content === "string" ? paragraphs(content) : content));
    const s = dlg.querySelector(".letter-sign");
    if (s) s.hidden = sign === false;
    if (!dlg.open) openDialog(dlg);
    dlg.querySelector(".letter-paper").scrollTop = 0;
    Sfx.play("reveal");
  }

  /* =======================================================================
     BIRTHDAY WEEK — seven little games, one unlocking each day (her time)
     dayIndex: days since her birthday (0 = 30 Oct; negative = before).
     Each day remembers what she did (claimed, chose, cracked…) on her phone.
     ======================================================================= */
  const dayState = (i) => keep.get(`sfz-day-${i}`, {});
  const saveDay = (i, st) => keep.set(`sfz-day-${i}`, st);

  const DAY_GAMES = {
    letter(d) { return paragraphs(d.text); },

    coupons(d, i) {
      const st = dayState(i);
      st.claimed = st.claimed || [];
      const list = h("ul", { class: "dg-coupons" });
      (d.coupons || []).forEach((c, k) => {
        const btn = h("button", { class: "dg-coupon" + (st.claimed.includes(k) ? " is-claimed" : ""), type: "button" },
          h("span", { class: "dg-coupon-icon", "aria-hidden": "true", text: c.icon || "🎟️" }),
          h("span", { class: "dg-coupon-text", text: c.text }),
          h("span", { class: "dg-coupon-stamp", text: d.claimed || "CLAIMED" }));
        btn.setAttribute("aria-pressed", String(st.claimed.includes(k)));
        btn.addEventListener("click", () => {
          if (st.claimed.includes(k)) return;
          st.claimed.push(k); saveDay(i, st);
          btn.classList.add("is-claimed"); btn.setAttribute("aria-pressed", "true");
          Sfx.play("pop");
        });
        list.append(h("li", null, btn));
      });
      return [...paragraphs(d.intro), list, ...paragraphs(d.outro)];
    },

    choice(d, i) {
      const st = dayState(i);
      const react = h("p", { class: "dg-react", "aria-live": "polite" });
      const outro = h("div", { class: "dg-outro", hidden: st.choice == null }, ...paragraphs(d.outro));
      const opts = h("div", { class: "dg-options" });
      const btns = (d.options || []).map((o, k) => {
        const b = h("button", { class: "dg-option", type: "button", text: o.text });
        b.addEventListener("click", () => {
          if (st.choice != null) return;              // no take-backs
          st.choice = k; saveDay(i, st);
          paint(); Sfx.play("boing");
        });
        opts.append(b);
        return b;
      });
      function paint() {
        if (st.choice == null) return;
        btns.forEach((b, k) => { b.disabled = true; b.classList.toggle("is-chosen", k === st.choice); });
        react.textContent = d.options[st.choice].reaction || "";
        outro.hidden = false;
      }
      paint();
      return [...paragraphs(d.intro), opts, react, outro];
    },

    fortune(d, i) {
      const st = dayState(i);
      const paper = h("p", { class: "dg-fortune-paper", "aria-live": "polite" });
      const outro = h("div", { class: "dg-outro", hidden: st.f == null }, ...paragraphs(d.outro));
      const cookie = h("button", { class: "dg-cookie", type: "button", "aria-label": d.button || "Crack the cookie" },
        h("span", { class: "dg-cookie-emoji", "aria-hidden": "true", text: "🥠" }),
        h("span", { class: "dg-cookie-label", text: d.button || "Crack it" }));
      function show() {
        cookie.classList.add("is-cracked"); cookie.disabled = true;
        paper.textContent = (d.fortunes || [])[st.f] || "";
        paper.classList.add("is-in"); outro.hidden = false;
      }
      cookie.addEventListener("click", () => {
        if (st.f != null) return;
        st.f = Math.floor(Math.random() * (d.fortunes || [""]).length); saveDay(i, st);
        Sfx.play("magic"); show();
      });
      if (st.f != null) show();
      return [...paragraphs(d.intro), cookie, paper, outro];
    },

    hold(d, i) {
      const st = dayState(i);
      const inside = h("div", { class: "dg-hold-text", hidden: !st.open }, ...paragraphs(d.text));
      const env = h("button", { class: "dg-envelope" + (st.open ? " is-open" : ""), type: "button", "aria-label": "Press and hold to open the envelope" },
        h("span", { class: "dg-env-icon", "aria-hidden": "true", text: st.open ? "💌" : "✉️" }),
        h("span", { class: "dg-env-bar", "aria-hidden": "true" }, h("i")),
        h("span", { class: "dg-env-label", text: st.open ? "opened" : (d.hold || "Keep holding…") }));
      const bar = env.querySelector(".dg-env-bar i");
      let raf = 0, t0 = 0;
      const DUR = reduced() ? 300 : 1600;
      function openIt() {
        if (st.open) return;
        st.open = true; saveDay(i, st);
        env.classList.add("is-open"); env.querySelector(".dg-env-icon").textContent = "💌";
        env.querySelector(".dg-env-label").textContent = "opened";
        inside.hidden = false; Sfx.play("reveal");
        window.Motion.confetti({ count: 40, y: 0.45 });
      }
      let timer = 0;
      const stop = () => { cancelAnimationFrame(raf); clearTimeout(timer); if (!st.open) bar.style.width = "0%"; env.classList.remove("is-holding"); };
      env.addEventListener("pointerdown", (e) => {
        if (st.open) return;
        e.preventDefault();
        env.classList.add("is-holding");
        t0 = performance.now();
        // The timer decides when it opens; animation frames only draw the bar.
        timer = setTimeout(() => { cancelAnimationFrame(raf); env.classList.remove("is-holding"); bar.style.width = "100%"; openIt(); }, DUR);
        const step = (now) => {
          const k = Math.min(1, (now - t0) / DUR);
          bar.style.width = (k * 100).toFixed(1) + "%";
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((t) => env.addEventListener(t, stop));
      env.addEventListener("contextmenu", (e) => e.preventDefault());
      env.addEventListener("click", (e) => { if (e.detail === 0) openIt(); });   // keyboard: Enter / Space
      return [...paragraphs(d.intro), env, inside];
    },

    dare(d, i) {
      const st = dayState(i);
      st.flips = st.flips || 0;
      const wrap = h("div", { class: "dg-dares" });
      const doneBtn = h("button", { class: "btn btn-cherry dg-done", type: "button", text: d.done || "I did it ✓", hidden: st.pick == null || st.done });
      const stamp = h("p", { class: "dg-stamp", text: d.doneStamp || "Done!", hidden: !st.done });
      const outro = h("div", { class: "dg-outro", hidden: st.pick == null }, ...paragraphs(d.outro));
      const cards = (d.dares || []).map((txt, k) => {
        const c = h("button", { class: "dg-dare", type: "button", "aria-label": `Dare card ${k + 1}` },
          h("span", { class: "dg-dare-back", "aria-hidden": "true", text: "?" }),
          h("span", { class: "dg-dare-front", text: txt }));
        c.addEventListener("click", () => {
          if (st.done || st.pick === k || st.flips >= 2) return;
          st.pick = k; st.flips += 1; saveDay(i, st);
          paint(); Sfx.play("boing");
        });
        wrap.append(c);
        return c;
      });
      function paint() {
        cards.forEach((c, k) => {
          c.classList.toggle("is-flipped", st.pick === k);
          c.disabled = !!st.done || st.flips >= 2 && st.pick !== k;
        });
        if (st.pick != null) { outro.hidden = false; doneBtn.hidden = !!st.done; }
      }
      doneBtn.addEventListener("click", () => {
        st.done = true; saveDay(i, st);
        doneBtn.hidden = true; stamp.hidden = false; paint();
        Sfx.play("win");
      });
      paint();
      return [...paragraphs(d.intro), wrap, doneBtn, stamp, outro];
    },

    riddle(d, i) {
      const st = dayState(i);
      const q = h("p", { class: "dg-question", text: d.question });
      const react = h("p", { class: "dg-react", "aria-live": "polite" });
      const solved = h("div", { class: "dg-outro", hidden: !st.solved }, ...paragraphs(d.solved));
      const opts = h("div", { class: "dg-options" });
      (d.options || []).forEach((o) => {
        const b = h("button", { class: "dg-option" + (st.solved && o.right ? " is-chosen" : ""), type: "button", text: o.text, disabled: !!st.solved });
        b.addEventListener("click", () => {
          if (st.solved) return;
          if (o.right) {
            st.solved = true; saveDay(i, st);
            [...opts.children].forEach((x) => { x.disabled = true; });
            b.classList.add("is-chosen"); react.textContent = ""; solved.hidden = false;
            Sfx.play("win"); window.Motion.confetti({ count: 60, y: 0.45 });
          } else {
            b.classList.remove("is-wrong"); void b.offsetWidth; b.classList.add("is-wrong");
            react.textContent = o.wrong || "Nope.";
            Sfx.play("sad");
          }
        });
        opts.append(b);
      });
      return [q, opts, react, solved];
    }
  };

  function birthdayWeek(root, cfg, dayIndex, labels, onChange) {
    cfg = cfg || {};
    const days = cfg.days || [];
    if (!days.length) { root.hidden = true; return { unread: () => -1, open() {} }; }
    root.querySelector("#week-title").textContent = cfg.title || "Birthday week";
    root.querySelector("#week-hint").textContent = dayIndex < 0 ? (cfg.before || cfg.hint || "") : (cfg.hint || "");
    const list = root.querySelector("#week-days");
    const read = new Set(keep.get("sfz-week", []));

    function openDay(i) {
      const d = days[i];
      const game = DAY_GAMES[d.type] || DAY_GAMES.letter;
      const nodes = game(d, i);
      const next = days[i + 1];
      if (next && next.teaser) {
        const already = dayIndex >= i + 1;
        nodes.push(h("p", { class: "dg-next" },
          h("span", { "aria-hidden": "true", text: `${next.icon || "🎁"} ` }),
          fill(cfg.nextUp || "Next: {teaser}", { teaser: next.teaser }) + (already ? " (already open 👀)" : "")));
      }
      showLetter(`Birthday week · Day ${i + 1} · ${labels[i]}`, d.title, nodes, d.type === "letter" || d.type === "hold");
      read.add(i);
      keep.set("sfz-week", [...read]);
      render();
      if (onChange) onChange();
    }

    function render() {
      list.replaceChildren();
      days.forEach((d, i) => {
        const open = dayIndex >= i;
        const isToday = dayIndex === i;
        const isTomorrow = dayIndex === i - 1;
        const state = !open ? "locked" : read.has(i) ? "read" : "new";
        const status = !open
          ? (isTomorrow && d.teaser ? d.teaser : `🔒 ${fill(cfg.locked || "not yet", { date: labels[i] })}`)
          : state === "new" ? (isToday ? "today ✨ tap me" : "new · tap me") : "opened ✓";
        const b = h("button", { class: `day is-${state}${isToday ? " is-today" : ""}${isTomorrow ? " is-tomorrow" : ""}`, type: "button", disabled: !open },
          h("span", { class: "day-icon", "aria-hidden": "true", text: d.icon || "🎁" }),
          h("span", { class: "day-num", text: `Day ${i + 1}` }),
          h("span", { class: "day-date", text: labels[i] || "" }),
          h("span", { class: "day-state", text: status }));
        b.setAttribute("aria-label", `Birthday week, day ${i + 1}, ${labels[i]}: ${!open ? (isTomorrow && d.teaser ? `unlocks tomorrow: ${d.teaser}` : "locked until then") : state === "new" ? "new surprise" : "already opened"}`);
        if (open) b.addEventListener("click", () => openDay(i));
        list.append(h("li", null, b));
      });
    }
    render();

    return {
      /* The day to nudge her about: today's if unopened, else the earliest unopened. */
      unread() {
        if (dayIndex >= 0 && dayIndex < days.length && !read.has(dayIndex)) return dayIndex;
        for (let i = 0; i <= Math.min(dayIndex, days.length - 1); i++) if (!read.has(i)) return i;
        return -1;
      },
      open: openDay
    };
  }

  function moods(root, cfg) {
    cfg = cfg || {};
    const opts = cfg.options || [];
    if (!opts.length) { root.hidden = true; return; }
    root.querySelector("#mood-title").textContent = cfg.title || "Today's birthday mood";
    root.querySelector("#mood-hint").textContent = cfg.hint || "";
    const wrap = root.querySelector("#mood-opts");
    const react = root.querySelector("#mood-react");
    const btns = opts.map((o, i) => {
      const b = h("button", { class: "mood-opt", type: "button", "aria-pressed": "false", text: o.text });
      b.addEventListener("click", () => choose(i, true));
      wrap.append(b);
      return b;
    });
    function choose(i, byHand) {
      btns.forEach((b, j) => { b.classList.toggle("is-on", j === i); b.setAttribute("aria-pressed", String(j === i)); });
      react.textContent = opts[i].reaction || "";
      react.classList.remove("is-pop"); void react.offsetWidth; react.classList.add("is-pop");
      store.set("sfz-mood", i);
      if (byHand && !opts[i].quiet) Sfx.play(opts[i].sound || "pop");
    }
    const saved = store.get("sfz-mood", null);
    if (saved != null && opts[saved]) choose(saved, false);
  }

  function littleThings(container, items) {
    items.forEach((item, i) => {
      const back = h("span", { class: "note-face note-back", "aria-hidden": "true" },
        h("span", { class: "note-msg", text: item.message }),
        h("span", { class: "note-from", text: "— F." }));
      const note = h("button", { class: "note", type: "button", "aria-expanded": "false" },
        h("span", { class: "note-face note-front" },
          h("span", { class: "note-num", "aria-hidden": "true", text: pad(i + 1) }),
          h("span", { class: "note-title", text: item.title }),
          h("span", { class: "note-hint", "aria-hidden": "true", text: "flip →" })),
        back);
      note.addEventListener("click", () => {
        const open = note.classList.toggle("is-flipped");
        note.setAttribute("aria-expanded", String(open));
        back.setAttribute("aria-hidden", String(!open));
        if (open) Sfx.play("pop");
        if (open && item.secret) setTimeout(() => Secrets.find(item.secret), 500);
      });
      if (item.secret) note.classList.add("is-secret");
      container.append(h("li", { class: "note-item", "data-reveal": "", style: `--i:${i};--d:${(i % 3) * 0.08}s` }, note));
    });
  }

  /* =======================================================================
     WHY YOU — a jar of folded notes, one per tap
     ======================================================================= */
  function reasons(root, list, endEl, endLines, endBig) {
    endEl.append(...(endLines || []).map((t) => h("p", { text: t })), endBig ? h("p", { class: "big", text: endBig }) : null);
    if (!list.length) { endEl.classList.add("is-in"); return; }
    const notes = h("span", { class: "jar-notes", "aria-hidden": "true" },
      list.map((_, i) => h("i", { style: `--i:${i}` })));
    const jar = h("button", { class: "jar", type: "button", "aria-label": "Take a note from the jar" },
      h("span", { class: "jar-lid", "aria-hidden": "true" }),
      h("span", { class: "jar-glass", "aria-hidden": "true" }, notes),
      h("span", { class: "jar-label", "aria-hidden": "true", text: "reasons · take one" }));
    const counter = h("p", { class: "reason-counter" });
    const text = h("p", { class: "reason-text" });
    const card = h("div", { class: "reason-card", "aria-live": "polite" }, counter, text);
    root.append(jar, card);

    let i = -1;
    jar.addEventListener("click", () => {
      if (i === list.length - 1) {          // empty: put them back
        i = -1;
        root.classList.remove("is-empty", "has-note");
        [...notes.children].forEach((n) => n.classList.remove("is-taken"));
        jar.setAttribute("aria-label", "Take a note from the jar");
        return;
      }
      i += 1;
      notes.children[list.length - 1 - i].classList.add("is-taken");
      root.classList.add("has-note");
      card.classList.remove("is-pop"); void card.offsetWidth; card.classList.add("is-pop");
      counter.textContent = `Note ${i + 1} of ${list.length}`;
      text.textContent = list[i];
      Sfx.play("pop");
      if (i === list.length - 1) {
        root.classList.add("is-empty");
        jar.setAttribute("aria-label", "The jar is empty. Tap to put the notes back");
        endEl.classList.add("is-in");
      }
    });
  }

  /* =======================================================================
     THE PHOTO WALL (+ lightbox). Missing photos simply aren't shown.
     ======================================================================= */
  function gallery(container, photos, block) {
    if (!photos.length) { if (block) block.hidden = true; return; }
    photos.forEach((p, i) => {
      const btn = h("button", { class: "wall-btn", type: "button", "aria-label": p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1}` },
        photoFigure(p, { ratio: "4 / 5", lazy: false }),
        h("span", { class: "tape", "aria-hidden": "true" }),
        h("span", { class: "wall-cap", "aria-hidden": "true", text: p.caption || `exhibit ${"ABCDEFGHIJ"[i] || i + 1}` }));
      btn.addEventListener("click", () => {
        if (p._missing) return;
        const available = photos.filter((x) => !x._missing && x.src);
        Lightbox.open(available, available.indexOf(p));
      });
      const li = h("li", { "data-reveal": "", style: `--i:${i};--d:${(i % 3) * 0.08}s` }, btn);
      hideIfMissing(li, container, block);
      container.append(li);
    });
  }

  /* =======================================================================
     AUDIO BUS — one voice at a time; music and effects step aside.
     ======================================================================= */
  const AudioBus = {
    current: null,
    claim(player) {
      if (this.current && this.current !== player) this.current.pause();
      this.current = player;
      Sfx.hush();
      Music.duck(true);
    },
    release(player) {
      if (this.current === player) { this.current = null; Music.duck(false); }
    }
  };

  /* =======================================================================
     SOUND EFFECTS — short, original sounds synthesised in the browser
     (no files, nothing to license) plus local files for the ones that
     have one (data.js → sounds.files). A missing file falls back to the
     built-in sound. Rules: only after a tap, never two at once, a short
     gap between effects, never over a voice note or the video, and only a
     soft "reveal" on the quiet chapter.
     ======================================================================= */
  const FALLBACK = { magic: "reveal", cheer: "party" };   // file-only sounds → closest built-in
  const Sfx = {
    ctx: null, on: true, enabled: true, vol: 0.6, files: {}, gains: {}, bus: null, fileEl: null, last: {}, bad: {}, cache: {}, lastAny: 0,
    get available() { return !!(window.AudioContext || window.webkitAudioContext) || Object.values(this.files).some(Boolean); },

    init(cfg) {
      cfg = cfg || {};
      this.enabled = cfg.enabled !== false;
      this.vol = typeof cfg.volume === "number" ? Math.max(0, Math.min(1, cfg.volume)) : 0.6;
      this.files = cfg.files || {};
      this.gains = cfg.volumes || {};
      // Preload the short effect files so they fire instantly.
      Object.entries(this.files).forEach(([name, src]) => {
        if (!src) return;
        const a = new Audio();
        a.preload = "auto";
        a.addEventListener("error", () => { this.bad[name] = true; if (DEV) console.info(`[SIFAAIZ] Sound "${name}" not found at "${src}", using the built-in one.`); }, { once: true });
        a.src = src;
        this.cache[name] = a;
      });
      this.on = store.get("sfz-sfx", true);
      this.btn = document.getElementById("sfx-btn");
      if (this.btn) this.btn.addEventListener("click", () => this.toggle());
      this.render();
    },

    toggle() {
      if (!this.enabled || !this.available) { toast("Sound effects aren't supported in this browser, sayang."); return; }
      this.on = !this.on;
      store.set("sfz-sfx", this.on);
      if (this.on) this.play("pop", true); else this.hush();
      toast(this.on ? "Sound effects on. Brace yourself. 🔊" : "Sound effects off. Peace and quiet. 🤫");
      this.render();
    },

    render() {
      if (!this.btn) return;
      const state = !this.enabled || !this.available ? "unavailable" : this.on ? "on" : "off";
      this.btn.dataset.state = state;
      this.btn.setAttribute("aria-pressed", String(state === "on"));
      this.btn.setAttribute("aria-label", `Sound effects: ${state === "unavailable" ? "not available" : state}`);
      this.btn.title = state === "on" ? "Sound effects on (tap to turn off)" : state === "off" ? "Sound effects off (tap to turn on)" : "Sound effects not available";
      if (state === "unavailable") this.btn.hidden = !this.enabled;
    },

    allowed(name, force) {
      if (!this.enabled || !this.on || !this.available) return false;
      if (AudioBus.current) return false;                                  // voice note / video playing
      if (!force && document.body.dataset.view === "apart" && name !== "reveal") return false;
      const now = performance.now();
      // Small clicks can't machine-gun while she taps quickly.
      const gap = name === "pop" || name === "paper" ? 260 : name === "boing" ? 700 : 70;
      if (this.last[name] && now - this.last[name] < gap) return false;
      if (!force && now - this.lastAny < 90) return false;
      this.last[name] = now;
      this.lastAny = now;
      return true;
    },

    play(name, force) {
      if (!this.allowed(name, force)) return;
      const file = this.files[name];
      if (file && !this.bad[name]) { this.playFile(name); return; }
      this.playSynth(FALLBACK[name] || name);
    },

    playSynth(name) {
      const fn = this.synth[name];
      if (fn) { const bus = this.newBus(); if (bus) fn.call(this, bus); }
    },

    playFile(name) {
      this.hush();
      const a = this.cache[name];
      if (!a) { this.playSynth(FALLBACK[name] || name); return; }
      const g = typeof this.gains[name] === "number" ? this.gains[name] : 1;
      try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
      a.volume = Math.max(0, Math.min(1, this.vol * g));
      const p = a.play();
      if (p && p.catch) p.catch(() => { this.bad[name] = true; this.playSynth(FALLBACK[name] || name); });
      this.fileEl = a;
    },

    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) { try { this.ctx = new AC(); } catch (e) { return null; } }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },

    /* A fresh output for each sound; the previous one is faded out fast,
       so effects never pile on top of each other. */
    newBus() {
      const ctx = this.ensure();
      if (!ctx) return null;
      this.hush();
      const g = ctx.createGain();
      g.gain.value = this.vol;
      g.connect(ctx.destination);
      this.bus = g;
      return g;
    },

    hush() {
      if (this.fileEl) { try { this.fileEl.pause(); } catch (e) { /* ignore */ } this.fileEl = null; }
      if (this.bus && this.ctx) {
        const old = this.bus;
        old.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
        setTimeout(() => { try { old.disconnect(); } catch (e) { /* ignore */ } }, 300);
        this.bus = null;
      }
    },

    tone(bus, freq, dur, opts) {
      const ctx = this.ctx;
      const o = Object.assign({ type: "sine", vol: 0.1, at: 0, to: null, vib: 0, filter: 0 }, opts);
      const t = ctx.currentTime + o.at;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = o.type;
      osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      if (o.vib) {
        const lfo = ctx.createOscillator(), depth = ctx.createGain();
        lfo.frequency.value = o.vib; depth.gain.value = freq * 0.03;
        lfo.connect(depth).connect(osc.frequency);
        lfo.start(t); lfo.stop(t + dur + 0.05);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      let out = osc.connect(g);
      if (o.filter) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.filter; out = out.connect(f); }
      out.connect(bus);
      osc.start(t); osc.stop(t + dur + 0.05);
    },

    noise(bus, dur, freq, vol, opts) {
      const ctx = this.ctx;
      const o = Object.assign({ at: 0, type: "bandpass" }, opts);
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      const src = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      src.buffer = buf;
      f.type = o.type; f.frequency.value = freq; f.Q.value = 0.7;
      g.gain.value = vol;
      src.connect(f).connect(g).connect(bus);
      src.start(ctx.currentTime + o.at);
    },

    synth: {
      pop(b) { this.tone(b, 620, 0.14, { type: "triangle", to: 220, vol: 0.16 }); },
      boing(b) {
        this.tone(b, 160, 0.42, { type: "sine", to: 520, vol: 0.14, vib: 16 });
        this.tone(b, 520, 0.25, { type: "sine", to: 180, vol: 0.08, at: 0.18 });
      },
      sting(b) {                                   // ba-dum-tss
        this.tone(b, 190, 0.12, { type: "sine", to: 70, vol: 0.22 });
        this.tone(b, 260, 0.12, { type: "sine", to: 120, vol: 0.2, at: 0.13 });
        this.noise(b, 0.32, 8000, 0.12, { at: 0.27, type: "highpass" });
      },
      sad(b) {                                     // wah wah wah waaah
        [392, 370, 349].forEach((f, i) => this.tone(b, f, 0.24, { type: "sawtooth", vol: 0.05, at: i * 0.26, filter: 1100 }));
        this.tone(b, 330, 0.75, { type: "sawtooth", vol: 0.05, at: 0.78, filter: 1000, vib: 6 });
      },
      paper(b) { this.noise(b, 0.14, 2600, 0.12); },
      reveal(b) {
        this.tone(b, 880, 0.5, { vol: 0.05 });
        this.tone(b, 1320, 0.7, { vol: 0.04, at: 0.12 });
      },
      puff(b) { this.noise(b, 0.38, 700, 0.3); },
      party(b) {
        this.tone(b, 300, 0.45, { type: "sawtooth", to: 560, vol: 0.06, vib: 14, filter: 1800 });
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(b, f, 0.6, { at: 0.45 + i * 0.09, vol: 0.07 }));
      },
      win(b) {
        this.tone(b, 1318.5, 0.25, { type: "triangle", vol: 0.1 });
        this.tone(b, 1760, 0.4, { type: "triangle", vol: 0.1, at: 0.14 });
      },
      // A soft harp glissando: the little bridge between two songs.
      harp(b) {
        [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((f, i) => {
          this.tone(b, f, 1.6, { type: "sine", at: i * 0.055, vol: 0.045 - i * 0.003 });
          this.tone(b, f * 2, 0.9, { type: "sine", at: i * 0.055 + 0.01, vol: 0.012 });
        });
      },
      fanfare(b) {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(b, f, 0.9, { at: i * 0.13, vol: 0.05 }));
      }
    }
  };

  const MIME = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg; codecs=opus", wav: "audio/wav", webm: "audio/webm" };
  function pickSource(src) {
    const list = (Array.isArray(src) ? src : [src]).filter(Boolean);
    if (!list.length) return "";
    const probe = document.createElement("audio");
    for (const s of list) {
      const ext = s.split("?")[0].split(".").pop().toLowerCase();
      if (!MIME[ext] || probe.canPlayType(MIME[ext])) return s;
    }
    return list[0];
  }
  const fmt = (t) => {
    if (!isFinite(t) || t < 0) return "--:--";
    const m = Math.floor(t / 60);
    return `${m}:${pad(Math.floor(t % 60))}`;
  };

  /* ---------- Voice note player (play/pause, seek, time, replay) ---------- */
  class VoicePlayer {
    constructor(root, cfg, missingText) {
      cfg = cfg || {};
      this.root = root;
      this.src = pickSource(cfg.src);
      this.audio = null;
      root.classList.add("voice");

      const bars = Array.from({ length: 32 }, (_, i) => {
        const hgt = (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + (cfg.title || "").length) * Math.cos(i * 0.6))).toFixed(2);
        return `<i style="--h:${hgt};--dl:${(-(i % 7) * 0.13).toFixed(2)}s"></i>`;
      }).join("");

      root.innerHTML = `
        <div class="vp">
          <button class="vp-play" type="button">${ICON.play}${ICON.pause}</button>
          <div class="vp-main">
            <p class="vp-title"></p>
            <p class="vp-note"></p>
            <div class="vp-wave" aria-hidden="true">${bars}</div>
            <input class="vp-seek" type="range" min="0" max="1000" step="1" value="0">
            <div class="vp-times"><span class="vp-cur">0:00</span><span class="vp-dur">--:--</span></div>
          </div>
          <button class="vp-replay" type="button">${ICON.replay}</button>
        </div>
        <div class="vp-missing">
          <p class="vp-missing-title"></p>
          <p class="vp-missing-text"></p>
          <p class="vp-missing-help dev-only">Setup (only shown while testing locally): record this script from README.md and save it as <code></code></p>
        </div>`;
      this.$ = (s) => root.querySelector(s);
      const title = cfg.title || "A voice note";
      this.title = title;
      this.$(".vp-title").textContent = title;
      this.$(".vp-note").textContent = cfg.note || "";
      this.$(".vp-missing-title").textContent = title;
      this.$(".vp-missing-text").textContent = missingText || "Still recording this one. 🎙️";
      this.$(".vp-missing code").textContent = this.src || "assets/audio/…";
      this.playBtn = this.$(".vp-play");
      this.playBtn.setAttribute("aria-label", `Play voice note: ${title}`);
      this.$(".vp-replay").setAttribute("aria-label", `Replay "${title}" from the beginning`);
      this.seek = this.$(".vp-seek");
      this.seek.setAttribute("aria-label", `Seek through "${title}"`);
      this.cur = this.$(".vp-cur");
      this.dur = this.$(".vp-dur");

      if (!this.src) { this.setMissing(); return; }

      this.playBtn.addEventListener("click", () => this.toggle());
      this.$(".vp-replay").addEventListener("click", () => this.replay());
      this.seek.addEventListener("input", () => {
        this.prepare();
        const a = this.audio;
        if (a && isFinite(a.duration)) a.currentTime = (this.seek.value / 1000) * a.duration;
        this.paint();
      });

      // Only fetch metadata once the player is near the screen.
      window.Motion.onceVisible(root, () => this.prepare(), { rootMargin: "200px 0px", threshold: 0.01 });
    }

    prepare() {
      if (this.audio || !this.src) return;
      const a = new Audio();
      a.preload = "metadata";
      a.addEventListener("loadedmetadata", () => { this.dur.textContent = fmt(a.duration); this.root.classList.add("is-ready"); });
      a.addEventListener("timeupdate", () => this.paint());
      a.addEventListener("play", () => AudioBus.claim(this));
      a.addEventListener("playing", () => {
        this.root.classList.add("is-playing");
        this.playBtn.setAttribute("aria-label", `Pause voice note: ${this.title}`);
      });
      const stop = () => {
        this.root.classList.remove("is-playing");
        this.playBtn.setAttribute("aria-label", `Play voice note: ${this.title}`);
        AudioBus.release(this);
      };
      a.addEventListener("pause", stop);
      a.addEventListener("ended", stop);
      a.addEventListener("error", () => this.setMissing());
      a.src = this.src;
      this.audio = a;
    }

    paint() {
      const a = this.audio;
      if (!a) return;
      const p = isFinite(a.duration) && a.duration > 0 ? a.currentTime / a.duration : 0;
      this.seek.value = Math.round(p * 1000);
      this.seek.style.setProperty("--p", (p * 100).toFixed(2) + "%");
      this.seek.setAttribute("aria-valuetext", `${fmt(a.currentTime)} of ${fmt(a.duration)}`);
      this.cur.textContent = fmt(a.currentTime);
    }

    toggle() {
      this.prepare();
      if (!this.audio || this.missing) return;
      if (this.audio.paused) {
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => {});
      } else this.audio.pause();
    }
    play() { this.prepare(); if (this.audio && this.audio.paused) this.toggle(); }
    pause() { if (this.audio && !this.audio.paused) this.audio.pause(); }
    replay() {
      this.prepare();
      if (!this.audio || this.missing) return;
      this.audio.currentTime = 0;
      this.play();
    }
    setMissing() {
      this.missing = true;
      this.root.classList.add("is-missing");
      this.root.classList.remove("is-playing");
      AudioBus.release(this);
      if (DEV && this.src) console.info(`[SIFAAIZ] Voice note not found yet: "${this.src}".`);
    }
  }

  /* =======================================================================
     BACKGROUND MUSIC — three local tracks, one on/off switch.
       main         the soundtrack for most of the site (loops)
       emotional    soft piano for the quiet chapter and heartfelt wishes
       celebration  a short birthday clip after the cake / final reveal
     - Each track is one <audio> element for the whole visit: switching
       mood crossfades, and every track keeps its own position, so the
       song never restarts when she moves between chapters.
     - Never autoplays: it only starts from a real tap on a play control.
     - The equalizer only moves while a track is actually playing.
     - Fades out completely for voice notes and the video, then back in.
     - A missing optional track falls back to the main one.
     ======================================================================= */
  const Music = {
    tracks: {},            // key → { el, ok, vol, title, fadeId }
    current: null,         // key of the track that should be sounding
    base: "main",          // mood chosen by the chapter
    temp: null,            // a one-off overlay (celebration)
    available: null,       // main track: null = checking, true/false
    wanted: false,         // she turned music on
    ducked: false,         // a voice note / the video is speaking
    playing: false,
    buffering: false,
    readyCbs: [],

    get audio() { const t = this.tracks[this.current || "main"]; return t ? t.el : null; },

    init(cfg) {
      cfg = cfg || {};
      this.root = document.getElementById("music");
      this.btn = document.getElementById("music-btn");
      this.stateEl = document.getElementById("music-state");
      this.titleEl = document.getElementById("music-title");
      this.wasOn = store.get("sfz-music", false);
      const defs = cfg.tracks || { main: { src: cfg.src, title: cfg.title, volume: cfg.volume } };
      this.clip = (defs.celebration && defs.celebration.clip) || 25;
      this.btn.addEventListener("click", () => this.toggle());

      Object.entries(defs).forEach(([key, d]) => {
        const src = pickSource(d && d.src);
        const t = { key, ok: src ? null : false, vol: typeof d.volume === "number" ? d.volume : 0.35, title: d.title || "Our song", fadeId: 0, el: null };
        this.tracks[key] = t;
        if (!src) { if (key === "main") this.setAvailable(false); return; }
        const a = new Audio();
        a.loop = key !== "celebration";
        a.preload = "metadata";
        a.addEventListener("loadedmetadata", () => { t.ok = true; if (key === "main") this.setAvailable(true); else this.sync(); });
        a.addEventListener("error", () => {
          t.ok = false;
          if (DEV) console.info(`[SIFAAIZ] Music track "${key}" not found at "${src}" — ${key === "main" ? "music is off" : "using the main track instead"}.`);
          if (key === "main") this.setAvailable(false); else this.sync();
        });
        const live = () => this.current === key;
        a.addEventListener("playing", () => { if (live()) { this.playing = true; this.buffering = false; this.render(); } });
        a.addEventListener("waiting", () => { if (live()) { this.buffering = true; this.render(); } });
        a.addEventListener("pause", () => { if (live()) { this.playing = false; this.buffering = false; this.render(); } });
        a.addEventListener("ended", () => { if (key === "celebration") this.endCelebration(); });
        a.src = src;
        t.el = a;
      });
      this.render();
    },

    onReady(cb) {
      if (this.available !== null) cb(this.available);
      else this.readyCbs.push(cb);
    },

    setAvailable(ok) {
      if (this.available === ok) return;
      this.available = ok;
      if (!ok) {
        this.wanted = false;
        if (DEV) console.info(`[SIFAAIZ] Main background track missing. Add assets/audio/background-music.mp3 or change music.tracks.main.src in js/data.js.`);
      }
      this.render();
      this.readyCbs.splice(0).forEach((cb) => cb(ok));
    },

    has(key) { const t = this.tracks[key]; return !!(t && t.ok); },

    /* Which track the current moment wants (falls back to main). */
    target() {
      const k = this.temp || this.base;
      return this.has(k) ? k : "main";
    },

    toggle() {
      if (this.available === false) {
        toast(DEV ? "No song yet. Add assets/audio/her.mp3 (see README)." : "Our song isn't here yet, sayang. The sound effects still work though. 🎧");
        return;
      }
      if (this.available === null) { toast("One second, the song is still loading."); return; }
      if (this.wanted) this.stop(); else this.play();
    },

    /* Must be called from a user gesture (click / tap). */
    play() {
      if (this.available !== true) return;
      this.wanted = true;
      store.set("sfz-music", true);
      this.sync(true);
      this.prime();
    },

    /* Phones (iPhone especially) only let an audio element start by itself
       later if it was started once during a tap. While she taps "play",
       quietly start-and-stop the other tracks so page changes can switch
       songs on their own afterwards. */
    prime() {
      if (this.primed) return;
      this.primed = true;
      Object.values(this.tracks).forEach((t) => {
        if (!t.el || t.key === this.current || !t.el.paused) return;
        const a = t.el;
        a.muted = true;
        const p = a.play();
        const undo = () => { if (a !== this.tracks[this.current]?.el || !this.wanted) { a.pause(); } a.muted = false; };
        if (p && p.then) p.then(undo).catch(() => { a.muted = false; }); else undo();
      });
    },

    stop() {
      this.wanted = false;
      store.set("sfz-music", false);
      this.sync();
    },

    /* Switch to a track ("birthday", "main", "emotional"). Crossfades if needed. */
    setMood(key) {
      if (this.base === key && this.current === this.target()) return;
      this.base = key;
      this.sync();
    },
    /* Each page has its own track (data.js → music.views). Moments inside a
       page can borrow another track, then hand back with backToView(). */
    viewMood: "main",
    setViewMood(key) { this.viewMood = key; this.setMood(key); },
    backToView() { this.setMood(this.viewMood); },

    /* A short birthday clip, then back to the chapter's track.
       Returns false if it can't play (music off, file missing). */
    celebrate() {
      if (!this.wanted || this.ducked || !this.has("celebration")) return false;
      const t = this.tracks.celebration;
      try { t.el.currentTime = 0; } catch (e) { /* ignore */ }
      this.temp = "celebration";
      this.sync();
      clearTimeout(this.celebTimer);
      this.celebTimer = setTimeout(() => this.endCelebration(), this.clip * 1000);
      return true;
    },
    endCelebration() {
      clearTimeout(this.celebTimer);
      if (this.temp !== "celebration") return;
      this.temp = null;
      this.sync();
    },

    duck(on) {
      if (this.ducked === on) return;
      this.ducked = on;
      if (on) this.endCelebrationQuietly();
      this.sync();
    },
    endCelebrationQuietly() { clearTimeout(this.celebTimer); this.temp = null; },

    /* Make the right track sound (or none).
       Changing from one song to another is a little scene, not a crossfade
       (two unrelated songs overlapping sounds like a radio being retuned):
         1. the old song fades out under the page turn,
         2. a breath of quiet and a soft harp sparkle,
         3. the new song fades in slowly, and "now playing" slides out.
       Pausing, voice notes and the video still fade straight out. */
    switchId: 0,
    switching: false,
    audible() { return Object.values(this.tracks).some((t) => t.el && !t.el.paused); },

    sync() {
      const should = this.wanted && !this.ducked && this.available === true;
      const key = should ? this.target() : null;

      if (key && key !== this.current && (this.audible() || this.switching)) { this.transitionTo(key); return; }
      if (key && this.switching && key === this.current) return;   // already on its way there

      // Straight start/stop (first tap on play, pause, voice note, video).
      this.switchId += 1;
      this.switching = false;
      Object.values(this.tracks).forEach((t) => {
        if (!t.el || t.key === key) return;
        if (!t.el.paused) this.fade(t, 0, () => t.el.pause());
      });
      this.current = key || this.current;
      if (key) this.start(this.tracks[key]);
      if (!key) { this.playing = false; }
      this.render();
    },

    transitionTo(key) {
      const token = ++this.switchId;
      const target = this.tracks[key];
      // Turned straight back before the old song had faded? Just bring it back.
      if (target.el && !target.el.paused) {
        this.switching = false;
        this.current = key;
        Object.values(this.tracks).forEach((t) => { if (t.el && t !== target && !t.el.paused) this.fade(t, 0, () => t.el.pause(), 700); });
        this.start(target);
        this.render();
        return;
      }
      this.current = key;
      this.switching = true;
      let wasPlaying = false;
      Object.values(this.tracks).forEach((t) => {
        if (t.el && t.key !== key && !t.el.paused) { wasPlaying = true; this.fade(t, 0, () => t.el.pause(), 950); }
      });
      this.render();
      const still = () => token === this.switchId && this.wanted && !this.ducked && this.available === true;
      // Wait for the old song to fade, then a short breath with the harp…
      setTimeout(() => {
        if (!still()) return;
        Sfx.play("harp", true);
        // …then the new song blooms in.
        setTimeout(() => {
          if (!still()) return;
          this.switching = false;
          this.start(target, 2600);
          this.announce(target);
          this.render();
        }, 420);
      }, wasPlaying ? 1050 : 250);
    },

    /* "♪ now playing · Soft piano" slides out under the music button. */
    announce(t) {
      const el = document.getElementById("now-playing");
      if (!el || !t) return;
      el.querySelector(".np-title").textContent = t.title;
      el.classList.remove("is-on"); void el.offsetWidth; el.classList.add("is-on");
      clearTimeout(this.npTimer);
      this.npTimer = setTimeout(() => el.classList.remove("is-on"), 3200);
    },

    start(t, fadeMs) {
      const a = t.el;
      if (!a.paused && !a.ended) { this.fade(t, t.vol, null, fadeMs); return; }
      if (a.paused) { try { a.volume = 0; } catch (e) { /* iOS */ } }
      const p = a.play();
      // play() resolves later; by then the mood may have moved on. Only
      // fade in if this is still the track that should be sounding.
      const ok = () => {
        if (this.current === t.key && this.wanted && !this.ducked) this.fade(t, t.vol, null, fadeMs);
        else this.fade(t, 0, () => a.pause());
      };
      if (p && p.then) {
        p.then(ok).catch(() => {
          // Blocked by the browser (no gesture yet): show the real state.
          this.wanted = false;
          this.render();
        });
      } else ok();
    },

    fade(t, to, done, ms) {
      const a = t.el;
      const id = ++t.fadeId;
      const from = a.volume;
      const dur = reduced() ? 250 : (ms || 1200);
      const begin = performance.now();
      let finished = false;
      const finish = () => {
        if (finished || id !== t.fadeId) return;
        finished = true;
        try { a.volume = to; } catch (e) { /* iOS: volume is read-only */ }
        if (done) done();
      };
      const step = (now) => {
        if (finished || id !== t.fadeId) return;
        const k = Math.min(1, (now - begin) / dur);
        try { a.volume = from + (to - from) * k; } catch (e) { /* iOS: volume is read-only */ }
        if (k < 1) requestAnimationFrame(step);
        else finish();
      };
      requestAnimationFrame(step);
      // Animation frames pause when the page isn't being drawn (e.g. she
      // switches to another app mid-fade). This timer makes sure the fade
      // always completes, so two songs can never be left playing together.
      setTimeout(finish, dur + 150);
    },

    render() {
      if (!this.root) return;
      const cur = this.tracks[this.current || "main"];
      if (this.titleEl && cur) this.titleEl.textContent = cur.title;
      const live = cur && cur.el && !cur.el.paused;
      let state, text;
      if (this.available === false) { state = "unavailable"; text = "Not added yet"; }
      else if (this.available === null) { state = "checking"; text = "Checking…"; }
      else if (this.wanted && this.ducked) { state = "ducked"; text = "Paused for the moment"; }
      else if (this.wanted && this.switching) { state = "switching"; text = "Changing the song…"; }
      else if (this.wanted && live && this.playing) { state = this.buffering ? "loading" : "playing"; text = this.buffering ? "Loading…" : "Playing"; }
      else if (this.wanted) { state = "loading"; text = "Starting…"; }
      else { state = "paused"; text = this.wasOn ? "Paused · tap to resume" : "Tap to play"; }
      this.root.dataset.state = state;
      this.stateEl.textContent = text;
      const on = this.wanted && this.available === true;
      this.btn.setAttribute("aria-pressed", String(on));
      this.btn.setAttribute("aria-label",
        this.available === false ? "Background music: no song added yet"
          : on ? `Pause background music (${cur ? cur.title : "our song"})` : "Play background music");
    }
  };

  /* =======================================================================
     OPEN WHEN — airmail envelopes + letter dialog
     ======================================================================= */
  function openWhen(container, letters) {
    const opened = new Set(store.get("sfz-letters", []));
    wireDialog(document.getElementById("letter"));   // shared with the birthday-week notes

    letters.forEach((letter, i) => {
      const btn = h("button", { class: "envelope", type: "button" },
        h("span", { class: "env-stamp", "aria-hidden": "true", text: "S♥F" }),
        h("span", { class: "env-when", "aria-hidden": "true", text: "Open when" }),
        h("span", { class: "env-what", "aria-hidden": "true", text: letter.label }),
        h("span", { class: "env-opened", "aria-hidden": "true", text: "opened" }));
      const mark = () => {
        const done = opened.has(i);
        btn.classList.toggle("is-opened", done);
        btn.setAttribute("aria-label", `Open when ${letter.label}${done ? " (opened)" : ""}`);
      };
      mark();

      btn.addEventListener("click", () => {
        showLetter("Open when", letter.label.charAt(0).toUpperCase() + letter.label.slice(1), letter.message);
        opened.add(i);
        store.set("sfz-letters", [...opened]);
        mark();
      });
      container.append(h("li", { "data-reveal": "", style: `--i:${i};--d:${(i % 3) * 0.08}s` }, btn));
    });
  }

  /* =======================================================================
     THE EXAM — questions unlock one after another, marked in red pen
     ======================================================================= */
  function quiz(root, questions, texts) {
    texts = texts || {};
    const letters = "ABCDEFGH";
    let score = 0;
    const isCorrect = (q, i) =>
      q.correct === "any" ? true : Array.isArray(q.correct) ? q.correct.includes(i) : q.correct === i;

    const list = h("ol", { class: "exam-qs" });
    const result = h("div", { class: "exam-result", "aria-live": "polite" });
    root.append(list, result);

    questions.forEach((q, n) => {
      const reaction = h("p", { class: "q-react", "aria-live": "polite" });
      const options = h("div", { class: "q-opts", role: "group", "aria-label": `Answers to question ${n + 1}` });
      const li = h("li", { class: "q" + (n === 0 ? " is-open" : "") },
        h("p", { class: "q-text" }, h("span", { class: "q-num", "aria-hidden": "true", text: `${n + 1}.` }), q.question),
        options, reaction);

      q.options.forEach((opt, i) => {
        const b = h("button", { class: "q-opt", type: "button", disabled: n !== 0 },
          h("span", { class: "q-letter", "aria-hidden": "true", text: letters[i] }),
          h("span", { text: opt.text }));
        b.addEventListener("click", () => {
          const right = isCorrect(q, i);
          if (right) score += 1;
          [...options.children].forEach((btn, j) => {
            btn.disabled = true;
            if (j === i) btn.classList.add("is-chosen", right ? "is-right" : "is-wrong");
            else if (q.correct !== "any" && isCorrect(q, j)) btn.classList.add("is-answer");
          });
          li.classList.add("is-done");
          reaction.textContent = opt.reaction || (right ? "Correct." : "Hmm. Not quite.");
          const nextLi = list.children[n + 1];
          if (nextLi) {
            Sfx.play(opt.sound || (right ? "pop" : "sad"));
            nextLi.classList.add("is-open");
            nextLi.querySelectorAll(".q-opt").forEach((x) => { x.disabled = false; });
          } else showResult();
        });
        options.append(b);
      });
      list.append(li);
    });

    function showResult() {
      const again = h("button", { class: "link-btn", type: "button", text: texts.retake || "Retake the exam" });
      again.addEventListener("click", () => {
        root.replaceChildren();
        quiz(root, questions, texts);
      });
      result.replaceChildren(
        h("p", { class: "grade", "aria-label": "Grade: A plus" }, h("span", { text: "A+" })),
        h("p", { class: "grade-score", text: `${score} / ${questions.length} correct` }),
        h("p", { class: "grade-note hand red", text: score === questions.length ? texts.perfect : texts.curved }),
        again);
      result.classList.add("is-in");
      Sfx.play("win");
    }
  }

  /* =======================================================================
     SCRATCH CARD — canvas foil; a button reveals it for anyone who'd
     rather not scratch (keyboard, accessibility, laziness).
     ======================================================================= */
  function scratchCard(root, cfg, revealBtn) {
    cfg = cfg || {};
    const canvas = root.querySelector("#scratch-foil");
    const box = root.querySelector("#scratch");
    root.querySelector("#ticket-title").textContent = cfg.title || "Birthday scratch card";
    root.querySelector("#prize-big").textContent = cfg.prize || "";
    root.querySelector("#prize-detail").textContent = cfg.detail || "";
    root.querySelector("#prize-fine").textContent = cfg.fine ? "*" + cfg.fine : "";
    if (cfg.reveal) revealBtn.textContent = cfg.reveal;
    const ctx = canvas.getContext && canvas.getContext("2d");
    let drawn = false, done = false, moves = 0, last = null, w = 0, hgt = 0;

    function paint() {
      if (!ctx || done) return;
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; hgt = r.height;
      canvas.width = w * dpr; canvas.height = hgt * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, hgt);
      g.addColorStop(0, "#f7b6c8"); g.addColorStop(0.5, "#d9c6f5"); g.addColorStop(1, "#f9c9a8");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, hgt);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      for (let i = 0; i < 90; i++) ctx.fillRect(Math.random() * w, Math.random() * hgt, 2, 2);
      ctx.fillStyle = "#5b2a3e";
      ctx.font = "600 13px Jost, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(cfg.foil || "SCRATCH HERE", w / 2, hgt / 2 + 5);
      drawn = true;
    }

    function finish() {
      if (done) return;
      done = true;
      root.classList.add("is-won");
      revealBtn.hidden = true;
      Sfx.play("win");
      const r = box.getBoundingClientRect();
      window.Motion.confetti({ count: 70, x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight });
    }

    function progress() {
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0, total = 0;
        for (let i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] < 40) clear++; }
        if (clear / total > 0.45) finish();
      } catch (e) { /* ignore */ }
    }

    function scratchAt(x, y) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 34; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      if (last) ctx.moveTo(last.x, last.y); else ctx.moveTo(x - 0.1, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last = { x, y };
      if (++moves % 10 === 0) progress();
    }

    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    // Scratching is a drag: stop the browser from turning it into a text
    // selection (or an image drag) across the page.
    const clearSelection = () => { const s = window.getSelection && window.getSelection(); if (s && s.removeAllRanges) s.removeAllRanges(); };
    canvas.addEventListener("pointerdown", (e) => {
      if (done || !drawn) return;
      e.preventDefault();
      clearSelection();
      canvas.setPointerCapture(e.pointerId);
      last = null;
      const p = pos(e); scratchAt(p.x, p.y);
      root.classList.add("is-scratching");
      document.documentElement.classList.add("is-scratching");
    });
    canvas.addEventListener("pointermove", (e) => {
      if (done || !canvas.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();
      const p = pos(e); scratchAt(p.x, p.y);
    });
    const end = () => {
      last = null;
      document.documentElement.classList.remove("is-scratching");
      clearSelection();
      if (!done) progress();
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("lostpointercapture", end);
    ["selectstart", "dragstart", "contextmenu"].forEach((t) => canvas.addEventListener(t, (e) => e.preventDefault()));

    revealBtn.addEventListener("click", finish);
    if (!ctx) { finish(); return; }
    window.Motion.onceVisible(box, paint, { threshold: 0.01 });
    window.addEventListener("resize", () => { if (moves === 0) paint(); });
  }

  /* =======================================================================
     THE NOTEBOOK — pages we haven't written yet
     ======================================================================= */
  function book(root, pages, endingEl, coverText) {
    const wrap = root.parentElement;
    let i = 0;
    let busy = false;
    const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const pageHTML = (p, n) => `
      <p class="bp-kicker">${esc(p.kicker)}</p>
      <h4 class="bp-title">${esc(p.title)}</h4>
      <p class="bp-text">${esc(p.text)}${p.typing ? '<span class="bp-caret" aria-hidden="true"></span>' : ""}</p>
      <p class="bp-num" aria-hidden="true">${n + 1}</p>`;

    const cover = h("button", { class: "book-cover", type: "button", "aria-label": "Open the notebook" },
      h("span", { class: "bc-label" },
        h("span", { class: "bc-title", text: "SIFAAIZ" }),
        h("span", { class: "bc-sub", text: coverText || "pages we haven't written yet" })),
      h("span", { class: "bc-tap", text: "tap to open" }));
    const sheet = h("div", { class: "book-pages", "aria-hidden": "true" });
    const page = h("div", { class: "book-page", "aria-live": "polite" });
    root.append(sheet, page, cover);

    const prev = h("button", { class: "icon-btn", type: "button", "aria-label": "Previous page", html: ICON.prev });
    const next = h("button", { class: "icon-btn", type: "button", "aria-label": "Next page", html: ICON.next });
    const pos = h("span", { class: "book-pos", "aria-hidden": "true" });
    const controls = h("div", { class: "book-controls" }, prev, pos, next);
    wrap.append(controls);

    function update() {
      prev.disabled = i === 0;
      next.disabled = i === pages.length - 1;
      pos.textContent = `${i + 1} / ${pages.length}`;
      if (i === pages.length - 1) endingEl.classList.add("is-in");
    }

    function turn(dir) {
      const to = i + dir;
      if (busy || to < 0 || to >= pages.length) return;
      if (reduced()) { i = to; page.innerHTML = pageHTML(pages[i], i); update(); return; }
      busy = true;
      const flip = h("div", { class: "book-flip", "aria-hidden": "true" });
      if (dir > 0) {
        flip.innerHTML = pageHTML(pages[i], i);
        page.innerHTML = pageHTML(pages[to], to);
        flip.classList.add("flip-next");
      } else {
        flip.innerHTML = pageHTML(pages[to], to);
        flip.classList.add("flip-prev");
      }
      root.append(flip);
      flip.addEventListener("animationend", () => {
        if (dir < 0) page.innerHTML = pageHTML(pages[to], to);
        flip.remove();
        busy = false;
      }, { once: true });
      i = to;
      update();
    }

    cover.addEventListener("click", () => {
      root.classList.add("is-open");
      wrap.classList.add("is-open");
      setTimeout(() => { cover.hidden = true; next.focus({ preventScroll: true }); }, reduced() ? 50 : 900);
    });
    prev.addEventListener("click", () => turn(-1));
    next.addEventListener("click", () => turn(1));
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") turn(-1);
      if (e.key === "ArrowRight") turn(1);
    });
    let x0 = null;
    root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 == null || !root.classList.contains("is-open")) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) turn(dx < 0 ? 1 : -1);
      x0 = null;
    });

    if (pages.length) page.innerHTML = pageHTML(pages[0], 0);
    update();
  }

  /* =======================================================================
     THE CAKE — wish → blow each candle → celebrate
     ======================================================================= */
  function cake(block, cfg, onDone) {
    cfg = cfg || {};
    // Number candles spelling her age ("1", "9"), or plain candles.
    const digits = cfg.numerals && cfg.digits && cfg.digits.length ? cfg.digits : null;
    const n = digits ? digits.length : Math.max(1, Math.min(9, cfg.candles || 5));
    const wrap = block.querySelector("#candles");
    const wishBtn = block.querySelector("#wish-btn");
    const blowAll = block.querySelector("#blow-all");
    const title = block.querySelector("#cake-title");
    const annot = block.querySelector("#cake-annot");
    const steps = [...block.querySelectorAll("#cake-steps li")];
    let wished = false, out = 0;

    title.textContent = cfg.title || "Make a wish.";
    annot.textContent = cfg.hint || "";
    if (cfg.wishButton) wishBtn.textContent = cfg.wishButton;
    if (cfg.blowAll) blowAll.textContent = cfg.blowAll;

    const setStep = (k) => steps.forEach((s, j) => {
      s.classList.toggle("is-now", j === k);
      s.classList.toggle("is-done", j < k);
    });

    const candles = Array.from({ length: n }, (_, i) => {
      const name = digits ? `Number candle ${digits[i]}` : `Candle ${i + 1} of ${n}`;
      const c = h("button", { class: "candle" + (digits ? " is-numeral" : ""), type: "button", style: `--i:${i}`, "aria-label": `${name}, lit`, "data-name": name },
        h("span", { class: "flame", "aria-hidden": "true" }),
        h("span", { class: "smoke", "aria-hidden": "true" }),
        digits ? h("span", { class: "numeral", "aria-hidden": "true", text: digits[i] }) : h("span", { class: "stick", "aria-hidden": "true" }));
      c.addEventListener("click", () => blow(c, i));
      wrap.append(c);
      return c;
    });

    function nudge(text) {
      annot.textContent = text;
      annot.classList.remove("is-nudge"); void annot.offsetWidth; annot.classList.add("is-nudge");
    }

    function blow(c, i) {
      if (!wished) { nudge(cfg.wishFirst || "Make a wish first."); Sfx.play("boing"); return; }
      if (c.classList.contains("is-out")) return;
      c.classList.add("is-out");
      c.setAttribute("aria-label", `${c.dataset.name}, blown out`);
      out += 1;
      const left = n - out;
      if (left > 0) { Sfx.play("puff"); nudge(left === 1 ? (cfg.lastOne || "one left.") : fill(cfg.left || "{n} to go.", { n: left })); }
      else celebrate();
    }

    function celebrate() {
      setStep(2);
      block.classList.add("is-done");
      blowAll.hidden = true;
      title.textContent = cfg.doneTitle || "Happy birthday!";
      annot.textContent = "";
      block.querySelector("#cake-after-big").textContent = cfg.afterWish || "Wish received.";
      block.querySelector("#cake-after-reply").textContent = cfg.reply || "";
      Sfx.play("cheer");                 // once, at a moderate volume
      // (Happy Birthday is already playing on this page if music is on.)
      window.Motion.confetti({ count: 180, y: 0.45 });
      setTimeout(() => window.Motion.confetti({ count: 90, x: 0.2, y: 0.55 }), 350);
      setTimeout(() => window.Motion.confetti({ count: 90, x: 0.8, y: 0.55 }), 600);
      if (onDone) onDone();
    }

    wishBtn.addEventListener("click", () => {
      wished = true;
      block.classList.add("is-wished");
      setStep(1);
      wishBtn.hidden = true;
      blowAll.hidden = false;
      title.textContent = cfg.blowTitle || "Now blow!";
      nudge(cfg.blowHint || "");
      Sfx.play("pop");
      candles[0].focus({ preventScroll: true });
    });

    blowAll.addEventListener("click", () => {
      candles.filter((c) => !c.classList.contains("is-out"))
        .forEach((c, k) => setTimeout(() => blow(c, candles.indexOf(c)), reduced() ? 0 : k * 140));
    });
  }

  /* =======================================================================
     THE PRESENT — opened in stages: lid, then one wish at a time
     ======================================================================= */
  function present(block, data, onFinished) {
    data = data || {};
    const gift = block.querySelector("#gift");
    const inside = block.querySelector("#present-inside");
    const list = block.querySelector("#wishes");
    const nextBtn = block.querySelector("#wish-next");
    const compliment = block.querySelector("#compliment");
    const complimentText = block.querySelector("#compliment-text");
    const complimentBtn = block.querySelector("#compliment-btn");
    block.querySelector("#gift-tag").textContent = data.tag || "For Sifa";
    block.querySelector("#gift-hint").textContent = data.hint || "tap to open";
    block.querySelector("#present-lead").textContent = data.lead || "";
    if (data.complimentButton) complimentBtn.textContent = data.complimentButton;

    const wishes = data.wishes || [];
    wishes.forEach((w, i) => list.append(h("li", { class: "wish-ticket", style: `--i:${i}` },
      h("span", { class: "wish-no", "aria-hidden": "true", text: pad(i + 1) }), h("span", { text: w }))));
    let shown = 0;

    const compliments = data.compliments || [];
    let c = 0;

    function showNext() {
      if (shown < wishes.length) {
        list.children[shown].classList.add("is-in");
        shown += 1;
      }
      const left = wishes.length - shown;
      nextBtn.textContent = left ? fill(data.next || "Next one ({n} left)", { n: left }) : "";
      if (!left) {
        nextBtn.hidden = true;
        if (compliments.length) {
          compliment.hidden = false;
          complimentText.textContent = compliments[0];
        }
        Music.backToView();                // wishes done: back to this page's track (Happy Birthday)
        if (onFinished) onFinished();
      }
    }

    complimentBtn.addEventListener("click", () => {
      c = (c + 1) % compliments.length;
      complimentText.classList.remove("is-pop"); void complimentText.offsetWidth; complimentText.classList.add("is-pop");
      complimentText.textContent = compliments[c];
      complimentBtn.textContent = c === compliments.length - 1 ? (data.complimentAgain || "Again") : (data.complimentButton || "One more, please");
      Sfx.play("pop");
    });
    nextBtn.addEventListener("click", showNext);

    gift.addEventListener("click", () => {
      if (gift.classList.contains("is-open")) return;
      gift.classList.add("is-open");
      gift.setAttribute("aria-label", "The present is open");
      gift.disabled = true;
      block.classList.add("is-opened");
      Sfx.play("magic");
      // The wishes inside are the sincere part: soft piano while she reads.
      Music.endCelebrationQuietly();
      Music.setMood("emotional");
      const r = gift.getBoundingClientRect();
      window.Motion.confetti({ count: 80, x: (r.left + r.width / 2) / window.innerWidth, y: r.top / window.innerHeight });
      setTimeout(() => {
        inside.classList.add("is-in");
        showNext();
        nextBtn.focus({ preventScroll: true });
      }, reduced() ? 0 : 700);
    });
  }

  /* =======================================================================
     THE DISTANCE — live clocks for her time and mine
     ======================================================================= */
  function clocks(root, cfg) {
    cfg = cfg || {};
    const a = root.querySelector("#clock-a"), b = root.querySelector("#clock-b");
    root.querySelector("#clock-a-label").textContent = cfg.myLabel || "Right now with me";
    root.querySelector("#clock-b-label").textContent = cfg.yourLabel || "Right now with you";
    root.querySelector("#clock-note").textContent = cfg.note || "";
    let fmtA, fmtB;
    try {
      fmtA = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: cfg.myZone || "Asia/Karachi" });
      fmtB = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: cfg.yourZone || "Asia/Jakarta" });
    } catch (e) { root.hidden = true; return; }
    let joke = false;
    const tick = () => {
      if (joke) return;
      const now = new Date(); a.textContent = fmtA.format(now); b.textContent = fmtB.format(now);
    };
    tick();
    let timer = 0;
    window.Motion.whileVisible(root, () => { tick(); clearInterval(timer); timer = setInterval(tick, 15000); }, () => clearInterval(timer));

    // Secret: tap the clocks three times and it's "sayang o'clock".
    let taps = 0, tapTimer = 0;
    root.querySelectorAll(".clock").forEach((c) => c.addEventListener("click", () => {
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 1500);
      if (taps < 3 || joke) return;
      taps = 0;
      joke = true;
      root.classList.add("is-joke");
      a.textContent = b.textContent = cfg.joke || "sayang o'clock";
      Secrets.find("clock");
      setTimeout(() => { joke = false; root.classList.remove("is-joke"); tick(); }, 3500);
    }));
  }

  /* =======================================================================
     THE FINALE — personal birthday video
     The <video> element is only created when it's needed, with
     preload="metadata", so nothing heavy loads with the page.
     ======================================================================= */
  const VMIME = { mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime", ogv: "video/ogg" };
  function pickVideo(src) {
    const list = (Array.isArray(src) ? src : [src]).filter(Boolean);
    if (!list.length) return "";
    const probe = document.createElement("video");
    for (const s of list) {
      const ext = s.split("?")[0].split(".").pop().toLowerCase();
      if (!VMIME[ext] || probe.canPlayType(VMIME[ext])) return s;
    }
    return list[0];
  }

  function birthdayVideo(section, cfg, hooks) {
    cfg = cfg || {};
    hooks = hooks || {};
    const $ = (s) => section.querySelector(s);
    const stage = $("#vf-stage"), cover = $("#vf-play"), posterBox = $("#vf-poster");
    const frame = $("#vf-frame"), missingBox = $("#vf-missing");
    const cont = $("#vf-continue"), after = $("#vf-after");
    const src = pickVideo(cfg.src);
    let video = null, missing = false, posterOk = false;

    if (src) missingBox.querySelector("code").textContent = src;
    $("#vf-missing-title").textContent = cfg.missingTitle || "";
    $("#vf-missing-text").textContent = cfg.missingText || "";
    $("#vf-label").textContent = cfg.button || "Play your birthday message";
    cover.setAttribute("aria-label", cfg.button || "Play your birthday message");
    if (cfg.frameCaption) stage.dataset.caption = cfg.frameCaption;
    cont.textContent = cfg.done || "Continue";
    $("#vf-after-body").append(...paragraphs(cfg.afterMessage));
    $("#vf-closing").textContent = cfg.closing || "";
    $("#vf-sign").textContent = cfg.signature || "";

    // Aspect ratio: data → real video size (once known)
    const setRatio = (w, hgt) => {
      if (!w || !hgt) return;
      stage.style.aspectRatio = `${w} / ${hgt}`;
      stage.style.width = `min(100%, calc(72svh * ${(w / hgt).toFixed(4)}))`;
    };
    const m = String(cfg.aspect || "16 / 9").match(/([\d.]+)\s*\/\s*([\d.]+)/);
    if (m) setRatio(+m[1], +m[2]);

    // Poster (silently skipped if missing — never a broken icon)
    if (cfg.poster && cfg.poster.src) {
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.addEventListener("load", () => { posterOk = true; posterBox.classList.add("is-loaded"); if (video) video.poster = cfg.poster.src; });
      img.addEventListener("error", () => img.remove());
      img.src = cfg.poster.src;
      posterBox.append(img);
    }

    const handle = { pause() { if (video && !video.paused) video.pause(); } };
    const lights = (on) => document.body.classList.toggle("is-lights-down", on);

    function showMissing() {
      missing = true;
      cover.hidden = true;
      frame.hidden = true;
      missingBox.hidden = false;
      cont.hidden = false;
      cont.textContent = cfg.skip || "Continue";
      section.classList.add("no-video");
      lights(false);
      AudioBus.release(handle);
      if (DEV && src) console.info(`[SIFAAIZ] Birthday video not found yet at "${src}". Add the file or change video.src in js/data.js.`);
    }

    function revealAfter() {
      if (after.classList.contains("is-in")) return;
      after.classList.add("is-in");
      cont.hidden = true;
      lights(false);
      setTimeout(() => after.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }), 60);
      if (hooks.onAfter) hooks.onAfter();
    }

    function makeVideo() {
      if (video || missing) return video;
      if (!src) { showMissing(); return null; }
      video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "metadata";
      if (posterOk) video.poster = cfg.poster.src;
      video.addEventListener("loadedmetadata", () => setRatio(video.videoWidth, video.videoHeight));
      video.addEventListener("error", showMissing);
      video.addEventListener("play", () => { AudioBus.claim(handle); lights(true); });
      video.addEventListener("pause", () => { if (!video.ended) { AudioBus.release(handle); lights(false); } });
      video.addEventListener("ended", () => { AudioBus.release(handle); revealAfter(); });
      video.src = src;
      frame.append(video);
      return video;
    }

    function start() {
      const v = makeVideo();
      if (!v || missing) return;
      cover.hidden = true;
      frame.hidden = false;
      cont.hidden = false;
      AudioBus.claim(handle);            // fade music out, silence effects
      const p = v.play();                // user-initiated — never autoplay
      if (p && p.catch) p.catch(() => { AudioBus.release(handle); });
      v.focus({ preventScroll: true });
    }

    cover.addEventListener("click", start);
    cont.addEventListener("click", () => { handle.pause(); revealAfter(); });

    return {
      prepare: makeVideo,
      get missing() { return missing; },
      replay() {
        stage.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
        if (missing || !video) return;
        video.currentTime = 0;
        start();
      }
    };
  }

  /* =======================================================================
     THE WRITTEN LETTER (end of "The distance")
     ======================================================================= */
  function finalMessage(container, text) {
    if (!text || !text.trim()) { container.hidden = true; return; }
    container.append(
      h("p", { class: "lf-kicker", text: "A letter" }),
      h("h4", { class: "lf-title", text: "To my Sifa" }),
      h("div", { class: "lf-body" }, paragraphs(text)),
      h("p", { class: "lf-sign", text: "— Faizan" }));
  }

  window.UI = {
    h, pad, fill, store, keep, toast, DEV, photoFigure, hideIfMissing, Lightbox, timeline, facts, moods, littleThings,
    reasons, gallery, VoicePlayer, Music, Sfx, AudioBus, openWhen, quiz, scratchCard, book, cake, present,
    clocks, birthdayVideo, finalMessage, Secrets, showLetter, birthdayWeek
  };
})();
