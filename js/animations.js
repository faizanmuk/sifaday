/* =========================================================================
   SIFAAIZ — animations.js
   Scroll reveals, the page-turn wipe, confetti, and the name merge.
   No continuous JS loops: confetti runs only for a few seconds, on demand.
   ========================================================================= */
(function () {
  "use strict";

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const Motion = {
    get reduced() { return reducedQuery.matches; },

    wait(ms) { return new Promise((r) => setTimeout(r, ms)); },

    /* ---------------------------------------------------------------
       SCROLL REVEAL — one shared IntersectionObserver.
       --------------------------------------------------------------- */
    _revealIO: null,
    initReveal() {
      const els = document.querySelectorAll("[data-reveal]");
      if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-in"));
        return;
      }
      this._revealIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            this._revealIO.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      els.forEach((el) => this._revealIO.observe(el));
    },

    /* Run a callback once, the first time an element becomes visible. */
    onceVisible(el, cb, options) {
      if (!el) return;
      if (!("IntersectionObserver" in window)) { cb(el); return; }
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(el); }
      }, options || { threshold: 0.25 });
      io.observe(el);
    },

    /* Toggle a callback when an element enters/leaves the viewport. */
    whileVisible(el, onEnter, onLeave, options) {
      if (!el || !("IntersectionObserver" in window)) { if (el) onEnter(el); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? onEnter(el) : onLeave(el)));
      }, options || { threshold: 0.1 });
      io.observe(el);
    },

    /* ---------------------------------------------------------------
       WIPE — a sheet of coloured paper slides across between chapters.
       Returns once the screen is covered; call wipeOut() to reveal.
       --------------------------------------------------------------- */
    wipeIn(tone, label) {
      const el = document.getElementById("wipe");
      el.style.setProperty("--tone", tone || "#fbf1e4");
      document.getElementById("wipe-label").textContent = label || "";
      el.classList.remove("is-out");
      el.classList.add("is-in");
      return this.wait(this.reduced ? 200 : 560);
    },
    wipeOut() {
      const el = document.getElementById("wipe");
      el.classList.add("is-out");
      return this.wait(this.reduced ? 200 : 560).then(() => el.classList.remove("is-in", "is-out"));
    },

    /* ---------------------------------------------------------------
       KINETIC TYPE — titles arrive word by word; the masthead letters
       drop in one by one. Chapter headers play when the chapter opens;
       other titles play when they scroll into view.
       --------------------------------------------------------------- */
    splitWords(el) {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      let wi = 0;
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(part); return; }
              const s = document.createElement("span");
              s.className = "w";
              s.style.setProperty("--wi", wi++);
              s.textContent = part;
              frag.append(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
        });
      };
      walk(el);
      el.classList.add("split");
    },
    initKinetic() {
      document.querySelectorAll(".ch-title, .sec-title:not(#cake-title), .parcel-q, .fin-title, .contents-title, .week-title").forEach((el) => {
        this.splitWords(el);
        if (!el.closest(".ch-head")) this.onceVisible(el, () => el.classList.add("words-in"), { threshold: 0.3 });
      });
      const mast = document.getElementById("mast-word");
      if (mast && !mast.dataset.split) {
        mast.dataset.split = "1";
        const text = mast.textContent;
        mast.textContent = "";
        [...text].forEach((c, i) => {
          const s = document.createElement("span");
          s.className = "l";
          s.style.setProperty("--li", i);
          s.textContent = c;
          mast.append(s);
        });
      }
    },

    /* ---------------------------------------------------------------
       TAP SPARKLES — every button press throws a tiny pinch of paper
       dots in the site's colours. Pure CSS particles, removed at once.
       --------------------------------------------------------------- */
    initTapSparkle() {
      const layer = document.createElement("div");
      layer.className = "sparkle-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.append(layer);
      const colors = ["#e23a55", "#ff8fab", "#ffd166", "#c8b6ff", "#ffb38a", "#8fd3b6"];
      document.addEventListener("pointerdown", (e) => {
        if (this.reduced) return;
        if (!e.target.closest("button:not(:disabled), a.btn, .burst, .mast-word")) return;
        for (let i = 0; i < 7; i++) {
          const s = document.createElement("i");
          const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
          const d = 18 + Math.random() * 24;
          s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px;background:${colors[i % colors.length]}`;
          layer.append(s);
          setTimeout(() => s.remove(), 700);
        }
      }, { passive: true });
    },

    /* ---------------------------------------------------------------
       3D TILT — paper objects lean toward the cursor (mouse only).
       Uses the separate `rotate` property, so it never fights the
       objects' own tilt or entrance animations.
       --------------------------------------------------------------- */
    initTilt(selector) {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add("tiltable");
        el.addEventListener("pointermove", (e) => {
          if (this.reduced) return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          const ang = Math.min(9, Math.hypot(x, y) * 16);
          if (ang < 0.2) return;
          el.style.rotate = `${(-y).toFixed(3)} ${x.toFixed(3)} 0 ${ang.toFixed(2)}deg`;
        });
        el.addEventListener("pointerleave", () => { el.style.rotate = ""; });
      });
    },

    /* ---------------------------------------------------------------
       READING RIBBON — a thin ribbon at the top fills as she scrolls
       through a chapter.
       --------------------------------------------------------------- */
    initReadProgress() {
      const bar = document.getElementById("read-progress");
      if (!bar) return;
      let queued = false;
      const paint = () => {
        queued = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.setProperty("--p", p.toFixed(4));
      };
      const ask = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
      window.addEventListener("scroll", ask, { passive: true });
      window.addEventListener("resize", ask, { passive: true });
      this.refreshProgress = () => { bar.style.setProperty("--p", 0); ask(); };
      paint();
    },

    /* ---------------------------------------------------------------
       CONFETTI — a short burst on a single canvas, then it stops.
       --------------------------------------------------------------- */
    confetti(opts) {
      if (this.reduced) return;
      const o = Object.assign({ count: 150, x: 0.5, y: 0.35, spread: 1 }, opts);
      const canvas = document.getElementById("confetti");
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const colors = ["#e23a55", "#ff8fab", "#ffd166", "#c8b6ff", "#ffb38a", "#fff4e0", "#8fd3b6"];
      const parts = this._parts || (this._parts = []);
      for (let i = 0; i < o.count; i++) {
        if (o.rain && o.emoji) {
          // Potato storm: they tumble down with real gravity, staggered so
          // they don't arrive as one block.
          parts.push({
            x: Math.random() * W, y: -40 - Math.random() * H * 0.5,
            vx: (Math.random() - 0.5) * 2, vy: 3 + Math.random() * 3,
            max: 9 + Math.random() * 5,
            w: 26 + Math.random() * 18, h: 0,
            r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.16,
            sprite: this.sprite(o.emoji), fall: true, life: 0
          });
          continue;
        }
        if (o.rain) {
          // Paper snow (the finale): deliberately slow and drifting.
          parts.push({
            x: Math.random() * W, y: -30 - Math.random() * H * 0.6,
            vx: (Math.random() - 0.5) * 1.5, vy: 1.5 + Math.random() * 2.5, max: 3.2,
            w: 7 + Math.random() * 7, h: 5 + Math.random() * 8,
            r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.12,
            c: colors[i % colors.length], fall: true, life: 0
          });
          continue;
        }
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2 * o.spread;
        const v = 6 + Math.random() * 9;
        parts.push({
          x: W * o.x, y: H * o.y,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: 6 + Math.random() * 7, h: 4 + Math.random() * 9,
          r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
          c: colors[i % colors.length], round: Math.random() < 0.25, life: 0
        });
      }
      if (this._running) return;
      this._running = true;
      canvas.classList.add("is-on");
      // Movement is scaled by real elapsed time (k = 1 at 60 fps), so it
      // looks the same speed on a fast laptop and a slower phone.
      let last = 0;
      const tick = (now) => {
        const k = last ? Math.min(3, (now - last) / 16.667) : 1;
        last = now;
        ctx.clearRect(0, 0, W, H);
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += k;
          if (p.sprite) { p.vy = Math.min(p.vy + 0.22 * k, p.max); p.vx *= Math.pow(0.99, k); }
          else if (p.fall) { p.vy = Math.min(p.vy + 0.05 * k, p.max); p.vx += Math.sin((p.life + i) * 0.05) * 0.05 * k; }
          else { const drag = Math.pow(0.985, k); p.vx *= drag; p.vy = p.vy * drag + 0.28 * k; }
          p.x += p.vx * k; p.y += p.vy * k; p.r += p.vr * k;
          if (p.y > H + 60 || p.life > (p.fall ? 900 : 420)) { parts.splice(i, 1); continue; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          if (p.sprite) ctx.drawImage(p.sprite, -p.w / 2, -p.w / 2, p.w, p.w);
          else {
            ctx.fillStyle = p.c || "#000";
            if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); ctx.fill(); }
            else { ctx.scale(1, Math.cos(p.life * 0.12)); ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
          }
          ctx.restore();
        }
        if (parts.length) requestAnimationFrame(tick);
        else { this._running = false; ctx.clearRect(0, 0, W, H); canvas.classList.remove("is-on"); }
      };
      requestAnimationFrame(tick);
    },

    /* Draw an emoji once onto a small canvas and reuse it as an image:
       far cheaper than drawing emoji text every frame. */
    sprite(emoji) {
      const cache = this._sprites || (this._sprites = {});
      if (cache[emoji]) return cache[emoji];
      const c = document.createElement("canvas");
      c.width = c.height = 96;
      const g = c.getContext("2d");
      g.font = "76px serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(emoji, 48, 54);
      cache[emoji] = c;
      return c;
    },

    /* ---------------------------------------------------------------
       NAME MERGE — "SIFAA ♥ FAIZ" becomes "SIFAAIZ" (FLIP animation).
       --------------------------------------------------------------- */
    buildMerge(el) {
      const parts = [
        ..."SIFAA".split("").map((c) => ({ c, keep: true })),
        { c: "", cls: "m-gap" },
        { c: "♥", cls: "m-heart" },
        { c: "", cls: "m-gap" },
        { c: "F" }, { c: "A" },
        { c: "I", keep: true }, { c: "Z", keep: true }
      ];
      el.innerHTML = "";
      parts.forEach((p, i) => {
        const s = document.createElement("span");
        s.textContent = p.c;
        s.setAttribute("aria-hidden", "true");
        s.className = (p.keep ? "m-keep" : "m-drop") + (p.cls ? " " + p.cls : "");
        s.style.animationDelay = (i * 0.07) + "s";
        el.appendChild(s);
      });
    },

    async playMerge(el) {
      if (el.classList.contains("is-started")) return;
      el.classList.add("is-started");
      if (this.reduced) {
        el.classList.add("is-fading", "is-merged", "is-glow");
        return;
      }
      await this.wait(1800);
      const keeps = [...el.querySelectorAll(".m-keep")];
      el.classList.add("is-fading");
      await this.wait(800);
      const first = keeps.map((k) => k.getBoundingClientRect().left);
      el.classList.add("is-merged");
      const last = keeps.map((k) => k.getBoundingClientRect().left);
      keeps.forEach((k, i) => {
        k.style.transition = "none";
        k.style.transform = `translateX(${first[i] - last[i]}px)`;
      });
      void el.offsetWidth; // flush
      keeps.forEach((k) => {
        k.style.transition = "transform 1.2s cubic-bezier(.16,1,.3,1)";
        k.style.transform = "";
      });
      await this.wait(1200);
      el.classList.add("is-glow");
    }
  };

  window.Motion = Motion;
})();
