/* Bharath Constructions - Real photo room recolouring (client view)
 *
 * FILES (same folder as index.html):  livingroom.jpeg, kitchen.jpeg ...          (your photos)
 *                                      livingroom-mask.jpeg, kitchen-mask.jpeg ... (wall masks, made once in admin mode)
 *
 * Visitors only pick a colour. They cannot upload or change photos.
 * ADMIN MODE (for you): open  http://127.0.0.1:5500/index.html?admin
 *   -> Select walls -> click the wall -> "Download wall mask" -> save the file next to the photos.
 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('phCanvas'); if (!cv) return;
  var ctx = cv.getContext('2d');

  /* ====== EDIT HERE ====== */
  var FOLDER = '';                                   // '' = photos are next to index.html. For a folder use 'rooms/'
  var EXT = 'jpeg';                                   // photo file type: 'jpeg', 'jpg' or 'webp'
  var ROOMS = [['exterior', 'Exterior'], ['livingroom', 'Living'], ['dining', 'Dining'], ['kitchen', 'Kitchen'], ['bedroom', 'Master Bedroom']];
  var PALETTE = [['Ivory', '#efe6d6'], ['Sage', '#cfd9cf'], ['Sand', '#e3c3a6'], ['Mist blue', '#aab7c4'], ['Peach', '#f1c9b0'], ['Butter', '#f3e2a5'], ['Rose', '#e8c4c4'], ['Teal', '#a8cfc9'], ['Terracotta', '#d98e6a'], ['Navy', '#2c4a73']];
  /* ======================= */

  var ADMIN = /[?&]admin\b/.test(location.search) || location.hash === '#admin';
  try { Object.keys(localStorage).forEach(function (k) { if (/^bh_(ph|mk|co)_/.test(k)) localStorage.removeItem(k); }); } catch (e) { /* ignore */ }

  var S = {};
  ROOMS.forEach(function (r) { S[r[0]] = { ok: false, loading: false, cbs: [], tried: false, w: 0, h: 0, orig: null, out: null, mask: null, fromFile: false, soft: null, idx: null, midx: null, color: null, avg: 128, count: 0, hist: [] }; });
  var cur = ROOMS[0][0], tool = 'wand', selecting = false, comparing = false, painting = false, tol = 22, bsize = 22;
  var msg = $('phMsg'), empty = $('phEmpty'), DEFAULT_HELP = msg.innerHTML;
  var avail = [];

  function say(t) { msg.innerHTML = t; }
  function label(id) { return ROOMS.filter(function (r) { return r[0] === id; })[0][1]; }
  function photoUrl(id) { return FOLDER + id + '.' + EXT; }
  function maskUrl(id) { return FOLDER + id + '-mask.jpeg'; }

  /* ---------- tabs (3D engine loads only when its tab is opened) ---------- */
  function showTab(which) {
    var photo = which === 'photo';
    $('pane3d').hidden = photo; $('panePhoto').hidden = !photo;
    $('tab3d').classList.toggle('active', !photo); $('tabPhoto').classList.toggle('active', photo);
    if (!photo) { if (window.loadVR) window.loadVR(); setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 80); }
    else render();
  }
  $('tab3d').addEventListener('click', function () { showTab('3d'); });
  $('tabPhoto').addEventListener('click', function () { showTab('photo'); });

  /* ---------- room chips ---------- */
  var bar = $('phRooms');
  bar.innerHTML = ROOMS.map(function (r) { return '<button class="chip" data-room="' + r[0] + '">' + r[1] + '</button>'; }).join('');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    selectRoom(b.dataset.room);
  });
  function selectRoom(id) {
    cur = id; setSelecting(false);
    bar.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c.dataset.room === id); });
    markSwatch(); render();
    ensureRoom(id, function () { if (cur === id) { markSwatch(); render(); } });
  }

  /* ---------- colours ---------- */
  var sw = $('phSwatches');
  sw.innerHTML = PALETTE.map(function (p) { return '<button data-c="' + p[1] + '" style="--c:' + p[1] + '" aria-label="' + p[0] + '" title="' + p[0] + '"></button>'; }).join('') +
    '<input type="color" id="phCustom" value="#000000" title="Custom colour" aria-label="Custom colour">';
  var picker = $('phCustom');
  function markSwatch() {
    var st = S[cur], c = (st.color || '').toLowerCase();
    sw.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === c); });
    picker.value = st.color || '#000000';
    $('phLabel').textContent = label(cur) + ' walls:';
    $('phPaint').hidden = !st.ok;
    $('phAdmin').hidden = !ADMIN;
    var click = clickMode();
    cv.classList.toggle('sel', selecting || click);
    $('phSelTools').hidden = !(selecting || click);
    undoV.hidden = !click || !st.hist.length;
  }
  function applyColor(c) {
    var st = S[cur]; if (!st.ok) return;
    st.color = c; markSwatch(); render();
    if (clickMode() && !st.count) say('Colour set. Now <b>tap the wall</b> you want to repaint.');
  }
  sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) applyColor(b.dataset.c); });
  picker.addEventListener('input', function () { applyColor(picker.value); });
  var undoV = document.createElement('button'); undoV.className = 'tool'; undoV.type = 'button'; undoV.textContent = '↶ Undo'; undoV.hidden = true;
  $('phReset').parentNode.insertBefore(undoV, $('phReset').nextSibling);
  function clickMode() { var st = S[cur]; return !!(st.ok && !st.fromFile && !selecting); }   // visitor taps a wall to colour it
  $('phReset').addEventListener('click', function () {
    var st = S[cur]; st.color = null;
    if (!st.fromFile) { st.mask.fill(0); st.hist = []; refresh(st); }
    markSwatch(); render();
  });
  undoV.addEventListener('click', function () { var st = S[cur]; if (!st.hist.length) return; st.mask = st.hist.pop(); refresh(st); markSwatch(); render(); });

  /* ---------- loading ---------- */
  function fromSrc(src, ok, fail) {
    var im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async';
    im.onload = function () { ok(im); }; im.onerror = fail; im.src = src;
  }
  function ingest(id, im) {
    var sc = Math.min(1, 1200 / Math.max(im.naturalWidth, im.naturalHeight));
    var w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc));
    var t = document.createElement('canvas'); t.width = w; t.height = h;
    var g = t.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
    var d;
    try { d = g.getImageData(0, 0, w, h); }
    catch (e) { say('The browser blocked reading the photo. Open the site with <b>Live Server</b> (http://127.0.0.1:5500), not by double-clicking the file.'); return false; }
    var st = S[id];
    st.w = w; st.h = h; st.orig = d.data; st.out = new ImageData(w, h); st.mask = new Uint8Array(w * h);
    st.soft = null; st.idx = new Int32Array(0); st.midx = new Int32Array(0); st.count = 0; st.avg = 128; st.ok = true;
    return true;
  }
  function loadMask(id, done) {
    var st = S[id];
    fromSrc(maskUrl(id), function (im) {
      var c = document.createElement('canvas'); c.width = st.w; c.height = st.h;
      var g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, st.w, st.h);
      var a = g.getImageData(0, 0, st.w, st.h).data, n = st.w * st.h, i;
      for (i = 0; i < n; i++) st.mask[i] = a[i * 4 + 3] > 127 ? 1 : 0;
      st.fromFile = true; refresh(st); done();
    }, done);
  }
  function ensureRoom(id, cb) {
    var st = S[id];
    if (st.tried) { if (cb) cb(); return; }
    if (cb) st.cbs.push(cb);
    if (st.loading) return;
    st.loading = true;
    fromSrc(photoUrl(id), function (im) {
      if (!ingest(id, im)) { st.loading = false; st.tried = true; fire(st); return; }
      if (id === cur) { markSwatch(); render(); }
      loadMask(id, function () {
        st.loading = false; st.tried = true; fire(st);
      });
    }, function () {
      st.loading = false; st.tried = true; markMissing(id); fire(st);
    });
  }
  function fire(st) { var q = st.cbs; st.cbs = []; q.forEach(function (f) { f(); }); }
  var missing = {};
  function markMissing(id) {                       // photo file not found -> hide that room chip
    missing[id] = true;
    var chip = bar.querySelector('[data-room="' + id + '"]'); if (chip) chip.hidden = true;
    if (window.console) console.warn('Bharath: photo not found -> ' + photoUrl(id));
    var left = ROOMS.filter(function (r) { return !missing[r[0]]; });
    if (!left.length) { showTab('3d'); return; }     // no photos at all: show the 3D tour instead
    if (cur === id) selectRoom(left[0][0]);
  }

  /* ---------- mask maths ---------- */
  function refresh(st) {
    var w = st.w, h = st.h, n = w * h, d = st.orig, m = st.mask, i, sum = 0, c = 0, mi = [];
    for (i = 0; i < n; i++) if (m[i]) { sum += 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; c++; mi.push(i); }
    st.count = c; st.avg = c ? Math.max(20, sum / c) : 128; st.midx = Int32Array.from(mi);
    var s = new Float32Array(n), k, x, y, q, p, dy, dx;
    for (k = 0; k < mi.length; k++) {
      p = mi[k]; x = p % w; y = (p / w) | 0;
      for (dy = -1; dy <= 1; dy++) { if (y + dy < 0 || y + dy >= h) continue;
        for (dx = -1; dx <= 1; dx++) { if (x + dx < 0 || x + dx >= w) continue; s[(y + dy) * w + x + dx] += 1 / 9; } }
    }
    var ix = []; for (i = 0; i < n; i++) if (s[i] > 0.01) ix.push(i);
    st.soft = s; st.idx = Int32Array.from(ix);
  }
  function wand(st, x0, y0, add) {
    var w = st.w, h = st.h, d = st.orig, sr = 0, sg = 0, sb = 0, k = 0, dx, dy;
    for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
      var px = Math.min(w - 1, Math.max(0, x0 + dx)), py = Math.min(h - 1, Math.max(0, y0 + dy)), j = (py * w + px) * 4;
      sr += d[j]; sg += d[j + 1]; sb += d[j + 2]; k++;
    }
    sr /= k; sg /= k; sb /= k;
    var thr = Math.pow(tol * 2.4, 2), seen = new Uint8Array(w * h), stack = [y0 * w + x0];
    seen[y0 * w + x0] = 1;
    while (stack.length) {
      var p = stack.pop(), jj = p * 4, r = d[jj] - sr, g = d[jj + 1] - sg, b = d[jj + 2] - sb;
      if (r * r + g * g + b * b > thr) continue;
      st.mask[p] = add ? 1 : 0;
      var cx = p % w, cy = (p / w) | 0;
      if (cx > 0 && !seen[p - 1]) { seen[p - 1] = 1; stack.push(p - 1); }
      if (cx < w - 1 && !seen[p + 1]) { seen[p + 1] = 1; stack.push(p + 1); }
      if (cy > 0 && !seen[p - w]) { seen[p - w] = 1; stack.push(p - w); }
      if (cy < h - 1 && !seen[p + w]) { seen[p + w] = 1; stack.push(p + w); }
    }
  }
  function dab(st, x, y, on) {
    var r = bsize, w = st.w, h = st.h, yy, xx;
    for (yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy++)
      for (xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx++)
        if ((xx - x) * (xx - x) + (yy - y) * (yy - y) <= r * r) st.mask[yy * w + xx] = on ? 1 : 0;
  }
  function quickIdx(st) {      // cheap list of selected pixels while painting
    var n = st.w * st.h, i, a = []; for (i = 0; i < n; i++) if (st.mask[i]) a.push(i); st.midx = Int32Array.from(a);
  }

  /* ---------- render (only touches painted pixels, so it is fast) ---------- */
  function hex(c) { c = c || '#000000'; return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function render() {
    var st = S[cur];
    if (!st.ok) {
      cv.style.display = 'none'; empty.style.display = 'grid';
      empty.innerHTML = st.tried ? '<div>Photo for <b>' + label(cur) + '</b> not found.<br><small>Add <code>' + photoUrl(cur) + '</code></small></div>' : '<div>Loading photo…</div>';
      return;
    }
    cv.style.display = 'block'; empty.style.display = 'none';
    if (cv.width !== st.w || cv.height !== st.h) { cv.width = st.w; cv.height = st.h; }
    var o = st.out.data, d = st.orig, i, j, k, m, r, g, b, lum, f, nr, ng, nb;
    o.set(d);
    if (!comparing && !painting && st.color && st.count) {
      var t = hex(st.color), idx = st.idx, soft = st.soft, avg = st.avg;
      for (k = 0; k < idx.length; k++) {
        i = idx[k]; j = i * 4; m = soft[i]; if (m > 1) m = 1;
        r = d[j]; g = d[j + 1]; b = d[j + 2];
        lum = 0.299 * r + 0.587 * g + 0.114 * b; f = lum / avg; f = f < 0.3 ? 0.3 : (f > 1.7 ? 1.7 : f);
        nr = t[0] * f; ng = t[1] * f; nb = t[2] * f;
        o[j] = r + ((nr > 255 ? 255 : nr) - r) * m; o[j + 1] = g + ((ng > 255 ? 255 : ng) - g) * m; o[j + 2] = b + ((nb > 255 ? 255 : nb) - b) * m;
      }
    }
    if ((selecting || painting) && !comparing) {
      var mi = st.midx;
      for (k = 0; k < mi.length; k++) { j = mi[k] * 4; o[j] = o[j] * 0.6; o[j + 1] = o[j + 1] * 0.6 + 90; o[j + 2] = o[j + 2] * 0.6 + 105; }
    }
    ctx.putImageData(st.out, 0, 0);
  }

  /* ---------- ADMIN: select walls, download mask ---------- */
  function setSelecting(on) {
    if (!ADMIN) on = false;
    selecting = on;
    var b = $('phSelect'); if (b) { b.classList.toggle('on', on); b.textContent = on ? '✔ Done selecting' : '🖌 Select walls'; }
    cv.classList.toggle('sel', on); markSwatch();
    if (ADMIN) say(on ? 'Click on the wall. Missed a bit? Click it again or use <b>Brush</b>. <b>Shift + click</b> removes. Raise <b>Wand strength</b> for textured walls. Finally press <b>Download wall mask</b> and put the file in the same folder as the photos.' : DEFAULT_HELP);
    render();
  }
  function pushHist(st) { st.hist.push(st.mask.slice()); if (st.hist.length > 15) st.hist.shift(); }
  {
    $('phToolBtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; tool = b.dataset.tool;
      $('phToolBtns').querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
    $('phTol').addEventListener('input', function (e) { tol = +e.target.value; });
    $('phBrush').addEventListener('input', function (e) { bsize = +e.target.value; });
    $('phClear').addEventListener('click', function () { var st = S[cur]; if (!st.ok) return; pushHist(st); st.mask.fill(0); refresh(st); markSwatch(); render(); });
  }
  if (ADMIN) {
    $('phSelect').addEventListener('click', function () { if (S[cur].ok) setSelecting(!selecting); });
    $('phUndo').addEventListener('click', function () { var st = S[cur]; if (!st.hist.length) return; st.mask = st.hist.pop(); refresh(st); markSwatch(); render(); });
    $('phMask').addEventListener('click', function () {
      var st = S[cur]; if (!st.ok || !st.count) { say('Select the walls first.'); return; }
      var c = document.createElement('canvas'); c.width = st.w; c.height = st.h;
      var g = c.getContext('2d'), d = g.createImageData(st.w, st.h), n = st.w * st.h, i;
      for (i = 0; i < n; i++) if (st.mask[i]) { d.data[i * 4] = 255; d.data[i * 4 + 1] = 255; d.data[i * 4 + 2] = 255; d.data[i * 4 + 3] = 255; }
      g.putImageData(d, 0, 0);
      c.toBlob(function (b) { download(b, cur + '-mask.jpeg'); say('Saved <b>' + cur + '-mask.jpeg</b>. Move it next to <code>' + photoUrl(cur) + '</code> (same folder as the photo).'); }, 'image/jpeg');
    });
  }
  function pos(e) {
    var r = cv.getBoundingClientRect(), st = S[cur];
    return { x: Math.min(st.w - 1, Math.max(0, Math.round((e.clientX - r.left) * st.w / r.width))), y: Math.min(st.h - 1, Math.max(0, Math.round((e.clientY - r.top) * st.h / r.height))) };
  }
  cv.addEventListener('pointerdown', function (e) {
    var st = S[cur]; if (!st.ok || !(selecting || clickMode())) return;
    if (!selecting && !st.color) { say('First <b>pick a colour</b> from the swatches above, then tap the wall.'); return; }
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    var p = pos(e); pushHist(st);
    if (tool === 'wand') { wand(st, p.x, p.y, !(e.shiftKey || e.altKey)); refresh(st); markSwatch(); render(); }
    else { painting = true; dab(st, p.x, p.y, tool === 'brush'); quickIdx(st); render(); }
    if (!selecting) say('If the wall is not fully covered, use <b>Brush</b>. If too much is coloured, use <b>Eraser</b> or <b>Undo</b>.');
  });
  cv.addEventListener('pointermove', function (e) {
    if (!painting) return; var p = pos(e); dab(S[cur], p.x, p.y, tool === 'brush'); quickIdx(S[cur]); render();
  });
  function endPaint() { if (!painting) return; painting = false; refresh(S[cur]); markSwatch(); render(); }
  cv.addEventListener('pointerup', endPaint); cv.addEventListener('pointercancel', endPaint);

  /* ---------- compare + save ---------- */
  var cmp = $('phCompare');
  function cmpOn(e) { e.preventDefault(); comparing = true; render(); }
  function cmpOff() { if (comparing) { comparing = false; render(); } }
  cmp.addEventListener('pointerdown', cmpOn); cmp.addEventListener('pointerup', cmpOff); cmp.addEventListener('pointerleave', cmpOff); cmp.addEventListener('pointercancel', cmpOff);
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  $('phSave').addEventListener('click', function () {
    var st = S[cur]; if (!st.ok) return;
    var was = selecting; selecting = false; render();
    cv.toBlob(function (b) { download(b, 'bharath-' + cur + '.jpeg'); selecting = was; render(); }, 'image/jpeg');
  });

  /* ---------- start ---------- */
  render();
  selectRoom(ROOMS[0][0]);
  // warm up the other rooms quietly (also hides chips of rooms that have no photo)
  var queue = ROOMS.slice(1).map(function (r) { return r[0]; }), idle = window.requestIdleCallback || function (f) { setTimeout(f, 500); };
  (function next() { if (!queue.length) return; var id = queue.shift(); idle(function () { ensureRoom(id, next); }); })();
})();
