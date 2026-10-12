/* Orbit Studio — guarded progressive enhancement. Page works with zero CDN. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Progress bar + nav ---------- */
  var fill = document.getElementById("progressFill");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (fill) fill.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      if (window.__lenis) window.__lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Lenis smooth scroll (guarded) ---------- */
  var lenis = null;
  try {
    if (typeof Lenis !== "undefined" && !reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      window.__lenis = lenis;
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
      }
    }
  } catch (e) { lenis = null; }

  // Smooth anchors via Lenis or native
  document.querySelectorAll("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -64 });
      else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Three.js hero (guarded) ---------- */
  (function hero3D() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas || typeof THREE === "undefined") return;
    var smallScreen = window.matchMedia("(max-width: 640px)").matches;
    var staticMode = reduced || smallScreen;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0b0b10, 1);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b10);
    scene.fog = new THREE.Fog(0x0b0b10, 8, 22);

    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    var knotGeo = new THREE.TorusKnotGeometry(1.7, 0.5, 140, 20);
    var knotMat = new THREE.MeshBasicMaterial({ color: 0xd6ff3f, wireframe: true, transparent: true, opacity: 0.85 });
    var knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    var innerGeo = new THREE.IcosahedronGeometry(0.9, 1);
    var innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 });
    var inner = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    // Particle field
    var N = staticMode ? 300 : 700;
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.7 });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    var mx = 0, my = 0, tx = 0, ty = 0;
    if (!staticMode) {
      window.addEventListener("pointermove", function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    function resize() {
      var w = canvas.clientWidth || canvas.parentElement.clientWidth;
      var h = canvas.clientHeight || canvas.parentElement.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    if (staticMode) {
      knot.rotation.set(0.4, 0.8, 0);
      inner.rotation.set(0.2, 0.4, 0);
      renderer.render(scene, camera);
      return;
    }

    var clock = new THREE.Clock();
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(canvas);
    }
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      knot.rotation.x = t * 0.18 + my * 0.4;
      knot.rotation.y = t * 0.24 + mx * 0.6;
      inner.rotation.x = -t * 0.3;
      inner.rotation.y = t * 0.35;
      points.rotation.y = t * 0.02 + mx * 0.1;
      camera.position.x = mx * 0.8;
      camera.position.y = -my * 0.6;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  })();

  /* ---------- GSAP reveals + horizontal + counters (guarded) ---------- */
  try {
    if (typeof gsap === "undefined" || reduced) {
      // No motion: ensure counters show final values
      document.querySelectorAll(".count").forEach(function (el) {
        el.textContent = el.getAttribute("data-count");
      });
      return;
    }
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    // Intro timeline
    gsap.from(".revealHero", { y: 36, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 });

    if (typeof ScrollTrigger !== "undefined") {
      // Generic reveals
      gsap.utils.toArray(".reveal").forEach(function (el) {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        });
      });

      // Pinned horizontal on desktop only
      var mm = gsap.matchMedia();
      mm.add("(min-width: 821px)", function () {
        var track = document.getElementById("hTrack");
        var wrap = document.getElementById("hWrap");
        if (!track || !wrap) return;
        var getX = function () { return -(track.scrollWidth - window.innerWidth + 48); };
        gsap.to(track, {
          x: getX,
          ease: "none",
          scrollTrigger: {
            trigger: ".work",
            start: "top top",
            end: function () { return "+=" + (track.scrollWidth - window.innerWidth + 400); },
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });

      // Counters
      document.querySelectorAll(".count").forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: "top 90%", once: true,
          onEnter: function () {
            gsap.to(obj, {
              v: target, duration: 1.6, ease: "power2.out",
              onUpdate: function () { el.textContent = Math.round(obj.v); }
            });
          }
        });
      });
    } else {
      document.querySelectorAll(".count").forEach(function (el) {
        el.textContent = el.getAttribute("data-count");
      });
    }
  } catch (e) { /* readable without animation */ }

  /* ---------- Contact validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName");
      var email = document.getElementById("fEmail");
      var budget = document.getElementById("fBudget");
      var msg = document.getElementById("fMsg");
      var ok = true;
      function setErr(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text || "";
      }
      setErr("eName", ""); setErr("eEmail", ""); setErr("eBudget", ""); setErr("eMsg", "");
      if (!name.value.trim() || name.value.trim().length < 2) { setErr("eName", "Please enter your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setErr("eEmail", "Please enter a valid email."); ok = false; }
      if (!budget.value) { setErr("eBudget", "Please choose a budget range."); ok = false; }
      if (!msg.value.trim() || msg.value.trim().length < 10) { setErr("eMsg", "Tell us a little more (10+ characters)."); ok = false; }
      var done = document.getElementById("formOk");
      if (ok && done) {
        done.hidden = false;
        form.reset();
        if (!reduced) done.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (done) done.hidden = true;
    });
  }
})();
