(function () {
  "use strict";
  var d = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state */
  var hdr = d.querySelector(".hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var btn = d.querySelector(".menu-btn");
  var sheet = d.getElementById("sheet");
  function setMenu(open) {
    if (!btn || !sheet) return;
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    sheet.classList.toggle("open", open);
    d.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && sheet) {
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    sheet.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (e) { if (e.matches) setMenu(false); });
  }

  /* Scroll spy */
  var links = [].slice.call(d.querySelectorAll('.nav a[href^="#"], .sheet nav a[href^="#"], .jump a[href^="#"]'));
  var ids = links.map(function (a) { return a.hash.slice(1); }).filter(function (v, i, arr) { return v && arr.indexOf(v) === i; });
  var targets = ids.map(function (id) { return d.getElementById(id); }).filter(Boolean);
  if ("IntersectionObserver" in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.hash === "#" + en.target.id); });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    targets.forEach(function (t) { spy.observe(t); });
    var heroEl = d.querySelector(".hero, .pg-hero");
    if (heroEl) new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.classList.remove("on"); }); });
    }, { rootMargin: "-35% 0px -55% 0px" }).observe(heroEl);
  }

  /* Count-up numbers */
  function fmt(n) { return n.toLocaleString("en-US"); }
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    if (reduce || isNaN(to)) return;
    var start = null, dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + fmt(Math.round(to * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Reveal on scroll */
  var rv = [].slice.call(d.querySelectorAll(".rv"));
  function show(el) {
    el.classList.add("in");
    [].forEach.call(el.querySelectorAll("[data-to]"), countUp);
    if (el.hasAttribute("data-to")) countUp(el);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el, i) {
      if (el.classList.contains("stat") || el.classList.contains("svc")) el.style.transitionDelay = (i % 3) * 80 + "ms";
      io.observe(el);
    });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* "See more" toggles on the case studies page */
  var mores = [].slice.call(d.querySelectorAll(".more"));
  function measure() {
    mores.forEach(function (b) {
      var p = d.getElementById(b.getAttribute("aria-controls"));
      if (!p || p.classList.contains("open")) return;
      b.classList.toggle("show", p.scrollHeight > p.clientHeight + 2);
    });
  }
  mores.forEach(function (b) {
    b.addEventListener("click", function () {
      var p = d.getElementById(b.getAttribute("aria-controls"));
      var open = p.classList.toggle("open");
      b.setAttribute("aria-expanded", String(open));
      b.firstElementChild.textContent = open ? "See less" : "See more";
      if (!open) measure();
    });
  });
  if (mores.length) {
    measure();
    window.addEventListener("load", measure);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(measure, 150); });
  }
})();
