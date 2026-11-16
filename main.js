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
    const apply = (cat) => {
      let shown = 0;
      cards.forEach((c) => {
        const match = cat === 'all' || c.dataset.cats.split(' ').includes(cat);
        c.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
      history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
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
