(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Cursor glow (needs the .glow CSS in style.css) ---- */
  if (fine && !reduce) {
    var g = document.createElement('div');
    g.className = 'glow';
    g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
    var tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; g.classList.add('on'); });
    document.documentElement.addEventListener('mouseleave', function () { g.classList.remove('on'); });
    (function loop() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      g.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Typing intro (home page). Plays on every fresh load; skipped only when
          coming back from the projects page or opening a #section link ---- */
  var h1 = document.getElementById('name');
  if (h1) {
    var full = h1.textContent;
    var skip = /projects\.html/.test(document.referrer) || location.hash.length > 1;
    if (!reduce && !skip) {
      h1.textContent = '';
      h1.classList.add('typing');
      document.body.classList.add('run');
      var i = 0;
      (function type() {
        h1.textContent = full.slice(0, ++i);
        if (i < full.length) setTimeout(type, 85);
        else setTimeout(function () { h1.classList.remove('typing'); }, 900);
      })();
    }
  }

  /* ---- Scroll reveal ---- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Nav highlight: follows the section you're in (home page only) ---- */
  var secs = [].slice.call(document.querySelectorAll('section[id]'));
  var nav = document.querySelector('#homeView .site-nav') || document.querySelector('.site-nav');
  var links = nav ? [].slice.call(nav.querySelectorAll('a')) : [];
  if (secs.length && links.length) {
    var lock = 0, ticking = false;
    function setActive(id) {
      links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
    }
    function spy() {
      ticking = false;
      if (Date.now() < lock) return;                       // a nav click is mid-scroll
      var line = innerHeight * 0.35, cur = secs[0];
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1];
      setActive(cur.id);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        var h = a.getAttribute('href');
        if (h && h.charAt(0) === '#') { setActive(h.slice(1)); lock = Date.now() + 900; setTimeout(spy, 950); }
      });
    });
    window.updateNav = spy;
    spy();
  }

  /* ---- Chip effects (About box) ---- */
  function petals(n, r, rx, ry) {
    var p = '';
    for (var k = 0; k < n; k++) p += '<ellipse cx="12" cy="' + (12 - r) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (k * 360 / n) + ' 12 12)"/>';
    return p;
  }
  var ICON = {
    ai: '<svg viewBox="0 0 24 24"><g class="g1"><circle cx="9" cy="14" r="5.2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-dasharray="2.04 2.04"/><circle cx="9" cy="14" r="4.2" fill="currentColor"/><circle cx="9" cy="14" r="1.5" fill="#fff"/></g><g class="g2"><circle cx="18" cy="7" r="3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1.68 1.68"/><circle cx="18" cy="7" r="2.4" fill="currentColor"/><circle cx="18" cy="7" r=".8" fill="#fff"/></g></svg>',
    pm: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path class="chk" d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ngo: '<svg viewBox="0 0 24 24"><path class="heart" d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z" fill="currentColor"/></svg>',
    yoga: '<svg viewBox="0 0 24 24"><g class="fl" fill="currentColor">' + petals(5, 5.2, 2.7, 4.4) + '</g><circle cx="12" cy="12" r="2.2" fill="#fff"/></svg>'
  };
  function flowerSVG(c) {
    return '<svg viewBox="0 0 24 24"><g fill="' + c + '" stroke="rgba(124,92,140,.35)" stroke-width=".7">' + petals(5, 6.2, 3.4, 3.6) + '</g><circle cx="12" cy="12" r="2.4" fill="#ffd45e"/></svg>';
  }
  var bloomBusy = false;
  function bloom(chip) {
    if (bloomBusy || reduce) return;
    bloomBusy = true; setTimeout(function () { bloomBusy = false; }, 1500);
    var cols = ['#ffb3d1', '#e4c9ff', '#bfe0ff', '#ffd3e6'];
    for (var k = 0; k < 7; k++) {
      (function (k) {
        var f = document.createElement('span'), a = (k / 7) * 6.283 + Math.random() * 0.6, d = 44 + Math.random() * 26;
        f.className = 'fl-pop';
        f.style.setProperty('--dx', Math.cos(a) * d * 1.5 + 'px');
        f.style.setProperty('--dy', Math.sin(a) * d * 0.9 + 'px');
        f.style.setProperty('--rot', (Math.random() * 200 - 100) + 'deg');
        f.style.setProperty('--s', 0.8 + Math.random() * 0.6);
        f.style.animationDelay = (k * 60) + 'ms';
        f.innerHTML = flowerSVG(cols[k % 4]);
        chip.appendChild(f);
        setTimeout(function () { f.remove(); }, 1900);
      })(k);
    }
  }
  document.querySelectorAll('.chip[data-fx]').forEach(function (chip) {
    var fx = chip.getAttribute('data-fx'), ico = document.createElement('span');
    ico.className = 'ico'; ico.setAttribute('aria-hidden', 'true'); ico.innerHTML = ICON[fx] || '';
    chip.insertBefore(ico, chip.firstChild);
    function play() {
      chip.classList.add('play'); setTimeout(function () { chip.classList.remove('play'); }, 1500);
      if (fx === 'yoga') bloom(chip);
    }
    chip.addEventListener('pointerenter', play);
    chip.addEventListener('click', play);
  });
})();
