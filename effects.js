// effects.js — purely visual layer. Independent of script.js.
// Contains: intro screen, live 3D wave background, cursor effects,
// glass light-follow, magnetic buttons and 3D card tilt.

const FX = {
  root: document.documentElement,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  introStart: null,                 // set when the intro screen leaves
  mouse: { x: 0, y: 0, nx: 0, ny: 0, active: false }, // nx/ny in -1..1
};

const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);

/* ================================================================
   1. INTRO / LANDING SCREEN
   ================================================================ */
(() => {
  const loader = document.querySelector(".loader");
  if (!loader) { FX.root.classList.remove("is-loading"); FX.introStart = 0; return; }

  // split name into letters for the staggered rise
  const nameEl = loader.querySelector(".loader-name");
  if (nameEl) {
    const text = nameEl.textContent.trim();
    nameEl.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch === " " ? " " : ch;
      s.style.setProperty("--i", i);
      nameEl.appendChild(s);
    });
  }

  const fill = loader.querySelector(".lp-fill");
  const count = loader.querySelector(".loader-count");

  let seen = false;
  try { seen = sessionStorage.getItem("rk-intro-seen") === "1"; } catch (e) {}
  const MIN_TIME = FX.reduceMotion ? 400 : seen ? 1300 : 2600;

  let pageLoaded = document.readyState === "complete";
  window.addEventListener("load", () => { pageLoaded = true; });

  const t0 = performance.now();
  let shown = 0, leaving = false;

  loader.classList.add("loader--in");

  const tick = (now) => {
    if (leaving) return;
    const elapsed = now - t0;
    // creep towards 90% while waiting, then finish once the page is ready
    let target = Math.min(90, (elapsed / MIN_TIME) * 90);
    if (pageLoaded && elapsed >= MIN_TIME) target = 100;
    shown += (target - shown) * 0.12;
    if (target === 100 && shown > 99.4) shown = 100;

    if (fill) fill.style.strokeDashoffset = String(100 - shown);
    if (count) count.textContent = String(Math.round(shown)).padStart(2, "0");

    if (shown >= 100) { setTimeout(leave, 220); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // failsafe: never hold the page for long
  setTimeout(() => leave(), 6000);
  // click anywhere to skip
  loader.addEventListener("click", () => leave());

  function leave() {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem("rk-intro-seen", "1"); } catch (e) {}

    loader.classList.add("loader--exit");
    FX.introStart = performance.now();

    // let the overlay start dissolving, then release the hero
    setTimeout(() => {
      FX.root.classList.remove("is-loading");
      FX.root.classList.add("intro-play");
    }, 320);

    setTimeout(() => {
      loader.classList.add("loader--done");
      FX.root.classList.remove("intro-play");
    }, 2600);
  }
})();

/* ================================================================
   2. LIVE 3D WAVE BACKGROUND (reacts softly to the cursor)
   ================================================================ */
(() => {
  const canvas = document.querySelector(".wave-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, DPR = 1, small = false;
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 1) * 0.85;
    W = window.innerWidth;
    H = window.innerHeight;
    small = W < 700;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  // smoothed cursor influence
  let mx = 0, my = 0;

  const waveY = (x, z, t) =>
    0.16 * Math.sin(x * 2.1 + t * 0.55 + z * 1.2) +
    0.11 * Math.sin(z * 2.7 - t * 0.42) +
    0.08 * Math.sin((x + z) * 1.5 + t * 0.3) +
    // gentle swell that follows the cursor
    0.14 * Math.exp(-((x - mx * 1.9) ** 2 + (z - 0.1) ** 2) * 1.4) * (0.6 + 0.4 * Math.sin(t * 1.3));

  let intro = 1; // 0 → 1 during the entrance swoop

  const project = (x, y, z, t) => {
    const a = Math.sin(t * 0.06) * 0.45 + t * 0.015 + mx * 0.12;
    const cos = Math.cos(a), sin = Math.sin(a);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos + 2.4 - (1 - intro) * 0.9;
    if (rz < 0.35) return null;
    const p = 1 / rz;
    return {
      x: W / 2 + rx * W * 0.62 * p,
      y: H * 0.5 + (0.35 - y * intro) * H * 0.75 * p + my * H * 0.03 + (1 - intro) * H * 0.18,
      depth: rz,
    };
  };

  const lights = [
    { r: 1.25, tilt: 0.35, speed: 0.16, phase: 0.0, size: 2.2 },
    { r: 1.65, tilt: -0.25, speed: -0.11, phase: 2.1, size: 1.8 },
    { r: 0.95, tilt: 0.55, speed: 0.21, phase: 4.0, size: 1.6 },
    { r: 2.05, tilt: 0.15, speed: 0.08, phase: 5.2, size: 2.0 },
  ];

  const draw = (ms) => {
    const t = ms / 1000;
    mx += (FX.mouse.nx - mx) * 0.04;
    my += (FX.mouse.ny - my) * 0.04;
    intro = FX.introStart == null ? 0.15 : easeOutCubic(Math.min(1, (ms - FX.introStart) / 2200)) * 0.85 + 0.15;
    if (FX.reduceMotion) intro = 1;

    ctx.clearRect(0, 0, W, H);

    const rows = small ? 18 : 28;
    const cols = small ? 50 : 90;

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "rgba(124,196,255,1)");
    grad.addColorStop(0.5, "rgba(169,155,255,1)");
    grad.addColorStop(1, "rgba(94,234,212,1)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;

    for (let i = 0; i < rows; i++) {
      const z = -1.6 + (i / (rows - 1)) * 3.4;
      ctx.beginPath();
      let started = false, depthSum = 0, n = 0;
      for (let j = 0; j < cols; j++) {
        const x = -2.2 + (j / (cols - 1)) * 4.4;
        const pt = project(x, waveY(x, z, t), z, t);
        if (!pt) { started = false; continue; }
        depthSum += pt.depth; n++;
        if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      const d = n ? depthSum / n : 4;
      ctx.globalAlpha = Math.max(0, Math.min(0.22, 0.34 - d * 0.055));
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    lights.forEach((l) => {
      const ang = l.phase + t * l.speed * 2;
      const pt = project(Math.cos(ang) * l.r, 0.45 + Math.sin(ang) * l.tilt, Math.sin(ang) * l.r, t);
      if (!pt) return;
      const s = Math.min((l.size * 2.6) / pt.depth, 2.4);
      const a = Math.max(0.15, Math.min(0.6, 1.4 / pt.depth));
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, s * 9);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.15, `rgba(170,215,255,${a * 0.5})`);
      g.addColorStop(1, "rgba(124,196,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, s * 9, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  if (FX.reduceMotion) { FX.introStart = 0; draw(0); return; }

  const loop = (ms) => {
    if (!document.hidden) draw(ms);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

/* ================================================================
   3. CURSOR: dot + ring + soft glow, glass light-follow, text light
   ================================================================ */
(() => {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const glow = document.querySelector(".cursor-glow");

  // elements whose border / fill / text light up near the cursor
  const lit = [...document.querySelectorAll(
    ".glass-panel, .skill-card, .project-card, .achieve-card, .timeline-item, " +
    ".contact-form, .contact-info, .hero-card, .cert-block, .hero-content h1, .section-title"
  )];

  // track the mouse for every pointer type (wave uses it too)
  window.addEventListener("pointermove", (e) => {
    FX.mouse.x = e.clientX;
    FX.mouse.y = e.clientY;
    FX.mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    FX.mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
    FX.mouse.active = true;
  }, { passive: true });

  if (!FX.finePointer || FX.reduceMotion) return;

  FX.root.classList.add("has-cursor");

  let rx = -100, ry = -100, gx = -100, gy = -100;

  const interactive = "a, button, .btn, .interest-tags span, .cert-link, .socials a, .menu-btn, label";
  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    FX.root.classList.toggle("cursor-hover", !!t.closest(interactive));
    FX.root.classList.toggle("cursor-text", !!t.closest("input, textarea"));
  });
  document.addEventListener("pointerdown", () => FX.root.classList.add("cursor-down"));
  document.addEventListener("pointerup", () => FX.root.classList.remove("cursor-down"));
  document.addEventListener("mouseleave", () => FX.root.classList.add("cursor-away"));
  document.addEventListener("mouseenter", () => FX.root.classList.remove("cursor-away"));

  // only light up elements that are on screen
  const onScreen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target)));
  }, { rootMargin: "100px" });
  lit.forEach((el) => io.observe(el));

  let lastX = -1, lastY = -1, lastScroll = -1;

  const frame = () => {
    const { x, y, active } = FX.mouse;
    if (active) {
      // cursor pieces — skip once they've caught up
      if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 || Math.abs(x - gx) > 0.1 || Math.abs(y - gy) > 0.1) {
        rx += (x - rx) * 0.2;
        ry += (y - ry) * 0.2;
        gx += (x - gx) * 0.08;
        gy += (y - gy) * 0.08;
        if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        if (glow) glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      }

      // glass / text light — only when the mouse or the page moved
      const sy = window.scrollY;
      if (x !== lastX || y !== lastY || sy !== lastScroll) {
        if (dot) dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        const els = [...onScreen];
        const rects = els.map((el) => el.getBoundingClientRect());
        els.forEach((el, i) => {
          el.style.setProperty("--mx", `${Math.round(x - rects[i].left)}px`);
          el.style.setProperty("--my", `${Math.round(y - rects[i].top)}px`);
        });
        lastX = x; lastY = y; lastScroll = sy;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

/* ================================================================
   4. MAGNETIC BUTTONS
   ================================================================ */
(() => {
  if (!FX.finePointer || FX.reduceMotion) return;
  document.querySelectorAll(".btn, .socials a, .back-to-top").forEach((el) => {
    const strength = el.matches(".socials a, .back-to-top") ? 0.35 : 0.22;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${(dx * strength).toFixed(1)}px ${(dy * strength).toFixed(1)}px`;
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
})();

/* ================================================================
   5. 3D CARD TILT
   ================================================================ */
(() => {
  if (!FX.finePointer || FX.reduceMotion) return;
  const MAX_TILT = 6; // degrees

  document.querySelectorAll(".tilt").forEach((card) => {
    let raf = null;
    card.addEventListener("pointermove", (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", `${((px - 0.5) * MAX_TILT).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${((0.5 - py) * MAX_TILT).toFixed(2)}deg`);
      });
    });
    card.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });
})();

/* ================================================================
   6. BUTTERY SMOOTH SCROLL (mouse wheel / trackpad, desktop only)
   Works with the page's normal scroll position, so anchors, the
   back-to-top button and the reveal animations keep working as-is.
   ================================================================ */
(() => {
  if (!FX.finePointer || FX.reduceMotion) return;

  const EASE = 0.09;          // lower = silkier / longer glide
  let target = window.scrollY;
  let current = window.scrollY;
  let running = false;
  let lastTime = 0;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  // let elements that scroll on their own keep their wheel
  const scrollsItself = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (n.matches && n.matches("textarea, .nav-links.open")) return true;
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight) return true;
    }
    return false;
  };

  const step = (now) => {
    const dt = Math.min(64, now - (lastTime || now)) / 16.67; // frame-rate independent
    lastTime = now;
    const k = 1 - Math.pow(1 - EASE, dt || 1);
    current += (target - current) * k;

    if (Math.abs(target - current) < 0.4) {
      current = target;
      running = false;
    }
    window.scrollTo({ top: current, behavior: "instant" });
    if (running) requestAnimationFrame(step);
    else lastTime = 0;
  };

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;                    // pinch-zoom
    if (FX.root.classList.contains("is-loading")) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;            // sideways swipes
    if (scrollsItself(e.target)) return;

    e.preventDefault();
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 16;                             // lines
    else if (e.deltaMode === 2) delta *= window.innerHeight;        // pages

    if (!running) { current = window.scrollY; target = current; }
    target = Math.max(0, Math.min(maxScroll(), target + delta));

    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: false });

  // any other kind of scrolling (keyboard, scrollbar, nav links,
  // back-to-top) takes over cleanly
  const sync = () => { if (!running) { target = current = window.scrollY; } };
  window.addEventListener("scroll", sync, { passive: true });
  ["keydown", "pointerdown"].forEach((ev) =>
    window.addEventListener(ev, () => { running = false; target = current = window.scrollY; }, { passive: true })
  );
  window.addEventListener("resize", () => { target = Math.min(target, maxScroll()); });
})();
