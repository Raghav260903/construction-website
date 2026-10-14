/* Bharath Constructions - site behaviour */
(function () {
  'use strict';

  // Header: solid background after scrolling
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () { links.classList.toggle('open'); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') links.classList.remove('open'); });

  // Images: lazy load, with gradient fallback if a photo fails
  function setBg(el) {
    var src = el.getAttribute('data-img');
    var im = new Image();
    im.onload = function () { el.style.backgroundImage = 'url("' + src + '")'; };
    im.src = src;
  }
  document.querySelectorAll('[data-img]').forEach(setBg);

  var imgObs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es, o) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var img = e.target; img.src = img.dataset.src; o.unobserve(img);
    });
  }, { rootMargin: '200px' }) : null;
  document.querySelectorAll('img[data-src]').forEach(function (img) {
    img.addEventListener('error', function () { img.style.opacity = 0; });
    if (imgObs) imgObs.observe(img); else img.src = img.dataset.src;
  });

  // Reveal on scroll
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { ro.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('in'); }); }

  // Counters
  var counted = false;
  var statCard = document.querySelector('.stat-card');
  function runCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = +el.dataset.count, cur = 0, step = Math.max(1, Math.round(target / 60));
      var t = setInterval(function () {
        cur += step; if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur;
      }, 24);
    });
  }
  if (statCard && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting && !counted) { counted = true; runCounters(); o.disconnect(); }
    }, { threshold: 0.5 }).observe(statCard);
  } else { runCounters(); }

  // Project filters
  var filters = document.getElementById('filters');
  filters.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filters.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    var f = b.dataset.f;
    document.querySelectorAll('.proj').forEach(function (p) {
      p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f);
    });
  });

  // Quote form: validate, then open WhatsApp with the details after about 1.5 seconds
  var WA_NUMBER = '919444879169';   // <-- your WhatsApp number: country code + number, no + or spaces
  var form = document.getElementById('quoteForm');
  var msg = document.getElementById('formMsg');
  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var d = new FormData(form);
    var email = (d.get('email') || '').toString();
    if (!d.get('name') || !/^\S+@\S+\.\S+$/.test(email)) {
      msg.textContent = 'Please enter your name and a valid email.'; msg.className = 'form-msg err'; return;
    }
    var text = [
      'Hello Bharath Constructions, I would like to book a site visit.',
      '',
      'Name: ' + d.get('name'),
      'Email: ' + email,
      'Phone: ' + (d.get('phone') || '-'),
      'Project type: ' + d.get('type'),
      'VR walkthrough: ' + (d.get('vr') ? 'Yes' : 'No'),
      'Message: ' + ((d.get('msg') || '').toString().trim() || '-')
    ].join('\n');
    var btn = form.querySelector('button[type="submit"]');
    sending = true; btn.disabled = true;
    msg.textContent = 'Thank you! Opening WhatsApp to confirm your slot…'; msg.className = 'form-msg';
    setTimeout(function () {
      window.location.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
      sending = false; btn.disabled = false; form.reset();
    }, 1500);
  });

  // 3D engine (A-Frame + vr.js) is only downloaded when the 3D tab is opened
  var vrStarted = false;
  window.loadVR = function () {
    if (vrStarted) return; vrStarted = true;
    var s = document.createElement('script');
    s.src = 'https://aframe.io/releases/1.5.0/aframe.min.js';
    s.onload = function () { var v = document.createElement('script'); v.src = 'vr.js'; document.body.appendChild(v); };
    s.onerror = function () { var l = document.getElementById('vrLoading'); if (l) l.textContent = '3D engine could not load. Check your internet connection.'; vrStarted = false; };
    document.head.appendChild(s);
  };

  document.getElementById('yr').textContent = new Date().getFullYear();
})();