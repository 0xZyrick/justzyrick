(() => {
  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    const set = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', () => set(!links.classList.contains('open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // Project filters (Work page)
  const buttons = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('[data-cats]');
  const count = document.getElementById('filter-count');
  if (buttons.length && cards.length) {
    const apply = (cat, userClick) => {
      let shown = 0;
      const slots = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      const visible = [];
      cards.forEach((c) => {
        const match = cat === 'all' || c.dataset.cats.split(' ').includes(cat);
        c.hidden = !match;
        c.classList.remove(...slots, 'solo');
        if (match) { c.classList.add(slots[shown % 6]); visible.push(c); shown++; }
      });
      // a card left alone on the last row gets the wide slot
      const last = visible[visible.length - 1];
      if (last && (visible.length - 1) % 2 === 0) { last.classList.remove(...slots); last.classList.add('solo'); }
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      if (count) count.textContent = shown === cards.length ? shown + ' projects' : shown + ' of ' + cards.length + ' projects';
      if (userClick) {
        const grid = document.querySelector('.work-grid');
        const top = grid.getBoundingClientRect().top + window.scrollY - 150;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
      try { history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat); } catch (_) { /* ignore */ }
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter, true)));
    const initial = location.hash.slice(1);
    apply([...buttons].some((b) => b.dataset.filter === initial) ? initial : 'all');
  }

  // Gentle reveal on scroll (skipped for reduced motion)
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* Case studies: one category at a time */
(function () {
  const tabs = [...document.querySelectorAll('.cs-nav a')];
  const cats = [...document.querySelectorAll('.cat')];
  const body = document.querySelector('.cs-body');
  if (!tabs.length || !cats.length || !body) return;
  const show = (id) => {
    cats.forEach((c) => { c.hidden = c.id !== id; });
    tabs.forEach((t) => {
      if (t.getAttribute('href') === '#' + id) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  };
  const route = (scroll) => {
    const h = decodeURIComponent(location.hash.slice(1));
    const el = h ? document.getElementById(h) : null;
    const c = el ? el.closest('.cat') : null;
    show(c ? c.id : cats[0].id);
    if (el && scroll) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  };
  tabs.forEach((t) => t.addEventListener('click', (ev) => {
    ev.preventDefault();
    const id = t.getAttribute('href').slice(1);
    show(id);
    try { history.replaceState(null, '', '#' + id); } catch (_) { /* ignore */ }
    const top = body.getBoundingClientRect().top + window.scrollY - 72;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }));
  window.addEventListener('hashchange', () => route(true));
  route(true);
})();

/* v12 motion + personality */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // split headline into words that rise in
  if (!reduce) document.querySelectorAll('[data-split]').forEach((h) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = tok;
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  // stagger reveals inside grids
  document.querySelectorAll('.work-grid, .testi-grid, .offer-grid, .timeline').forEach((g) => {
    [...g.children].forEach((c, k) => c.style.setProperty('--d', (k % 4) * 90 + 'ms'));
  });

  // count-up numbers
  const nums = document.querySelectorAll('.num-cell b');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, m = el.textContent.trim().match(/^(\+?)([\d,]+)(.*)$/); if (!m) return;
      const end = parseInt(m[2].replace(/,/g, ''), 10), t0 = performance.now(), dur = 1300;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = m[1] + (m[2].includes(',') ? v.toLocaleString('en-US') : v) + m[3];
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .6 });
    nums.forEach((n) => io.observe(n));
  }

  // offer card spotlight
  document.querySelectorAll('.offer-card').forEach((c) => c.addEventListener('pointermove', (ev) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ev.clientX - r.left + 'px'); c.style.setProperty('--my', ev.clientY - r.top + 'px');
  }));

  // cursor pill on project cards
  if (fine) {
    const pill = document.createElement('div'); pill.className = 'cursor-pill'; pill.setAttribute('aria-hidden', 'true'); document.body.appendChild(pill);
    document.addEventListener('pointermove', (ev) => {
      pill.style.left = ev.clientX + 'px'; pill.style.top = ev.clientY + 'px';
      const card = ev.target.closest && ev.target.closest('a.project');
      pill.classList.toggle('on', !!card); if (card) pill.textContent = 'View case study';
    }, { passive: true });
  }

  // parallax
  const par = [...document.querySelectorAll('[data-speed]')];
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (!reduce) par.forEach((el) => { el.style.translate = '0 ' + (y * parseFloat(el.dataset.speed)).toFixed(1) + 'px'; });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// problem stage: stacked cards that follow the selected problem
(() => {
  const root = document.querySelector('[data-prob]');
  if (!root) return;
  const items = [...root.querySelectorAll('.prob-item')];
  const cards = [...root.querySelectorAll('.pcard')];
  const fix = root.querySelector('.prob-fix p');
  const n = items.length;
  let cur = 0, timer = null;
  const set = (i) => {
    cur = i;
    items.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    cards.forEach((c, k) => { c.dataset.pos = String((k - i + n) % n); });
    fix.textContent = items[i].dataset.fix;
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  items.forEach((b, k) => {
    b.addEventListener('click', () => { stop(); set(k); });
    b.addEventListener('mouseenter', () => { stop(); set(k); });
    b.addEventListener('focus', () => { stop(); set(k); });
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => set((cur + 1) % n), 4500);
  set(0);
})();
