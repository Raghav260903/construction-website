/* Bharath Constructions - VR walkthrough (A-Frame / WebXR)
 * A sample South-Indian style home: sit-out porch, teak furniture,
 * grilled windows with chajjas, terrace with water tank, coconut trees, compound wall and gate.
 * Built from shapes + generated textures so it needs no extra files.
 * For a real client project, swap in a .glb model (see README.md).
 */
(function () {
  'use strict';
  var host = document.getElementById('vrCanvas');
  if (!host || typeof AFRAME === 'undefined') {
    if (host) host.innerHTML = '<p style="padding:2rem;color:#fff">3D engine could not load. Please check your internet connection.</p>';
    return;
  }

  /* ================= generated textures ================= */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function tex(w, h, fn, jpeg) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    return jpeg ? c.toDataURL('image/jpeg') : c.toDataURL('image/jpeg', 0.88);
  }
  function speckle(g, w, h, n, cols, size) {
    for (var i = 0; i < n; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(rnd(0, w), rnd(0, h), size, size); }
  }
  var T = {};
  T.t_tile = tex(256, 256, function (g, w, h) {            // cream vitrified tiles
    g.fillStyle = '#ece4d2'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '255,250,240' : '210,200,180') + ',.18)'; g.fillRect((i % 2) * 128, ((i / 2) | 0) * 128, 128, 128); }
    speckle(g, w, h, 900, ['rgba(120,100,70,.10)', 'rgba(255,255,255,.18)'], 2);
    g.strokeStyle = '#c2b8a2'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, h); g.moveTo(0, 128); g.lineTo(w, 128); g.stroke();
  });
  T.t_wood = tex(256, 256, function (g, w, h) {            // teak grain
    g.fillStyle = '#8a5a34'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) { g.strokeStyle = 'rgba(' + (Math.random() < .5 ? '50,25,8' : '190,130,80') + ',' + rnd(.08, .25) + ')'; g.lineWidth = rnd(1, 3); var y = rnd(0, h); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + rnd(-6, 6), w * .6, y + rnd(-6, 6), w, y + rnd(-4, 4)); g.stroke(); }
  });
  T.t_grass = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#5b8a4e'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 5000, ['#4f7d44', '#6a9a5a', '#486f3d', '#78a864'], 3);
  });
  T.t_road = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#3b3b3d'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3500, ['#4a4a4c', '#2f2f31', '#555'], 2);
  });
  T.t_paver = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#a39d92'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 600, ['#948e83', '#b3ada2'], 3);
    g.strokeStyle = '#7d786f'; g.lineWidth = 3;
    for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  });
  T.t_granite = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#2a2a2e'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1800, ['#3b3b40', '#1d1d20', '#55555c'], 2);
  });
  T.t_marble = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 14; i++) { g.strokeStyle = 'rgba(120,120,120,' + rnd(.06, .16) + ')'; g.lineWidth = rnd(.6, 2); g.beginPath(); var x = rnd(0, w), y = rnd(0, h); g.moveTo(x, y); g.bezierCurveTo(x + rnd(-80, 80), y + rnd(-80, 80), x + rnd(-80, 80), y + rnd(-80, 80), x + rnd(-100, 100), y + rnd(-100, 100)); g.stroke(); }
  });
  T.t_kolam = tex(256, 256, function (g, w, h) {           // rangoli / kolam on the porch
    g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3;
    var n = 5, s = 36, o = (w - (n - 1) * s) / 2;
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { g.beginPath(); g.arc(o + i * s, o + j * s, 4, 0, 6.3); g.fill(); }
    g.beginPath(); g.moveTo(w / 2, 20); g.lineTo(w - 20, h / 2); g.lineTo(w / 2, h - 20); g.lineTo(20, h / 2); g.closePath(); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 62, 0, 6.3); g.stroke();
    g.fillStyle = '#e0a93a'; g.beginPath(); g.arc(w / 2, h / 2, 10, 0, 6.3); g.fill();
    for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 62, h / 2 + Math.sin(a) * 62, 14, 0, 6.3); g.stroke(); }
  }, true);
  T.skyDay = tex(1024, 512, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a80d0'); gr.addColorStop(.3, '#86c4ee'); gr.addColorStop(.5, '#e4f2f8'); gr.addColorStop(.5, '#cfdcc8'); gr.addColorStop(1, '#a9bba2');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 26; i++) { var x = rnd(0, w), y = rnd(40, 200); g.fillStyle = 'rgba(255,255,255,' + rnd(.25, .55) + ')'; g.shadowColor = '#fff'; g.shadowBlur = 24; g.beginPath(); g.ellipse(x, y, rnd(40, 110), rnd(8, 22), 0, 0, 6.3); g.fill(); }
  });
  T.skyNight = tex(1024, 512, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#040814'); gr.addColorStop(.5, '#16284d'); gr.addColorStop(.5, '#0c1a14'); gr.addColorStop(1, '#070d0a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,255,255,' + rnd(.3, 1) + ')'; g.fillRect(rnd(0, w), rnd(0, h * .48), rnd(1, 2.2), rnd(1, 2.2)); }
    g.fillStyle = '#f5efd8'; g.shadowColor = '#fff7d0'; g.shadowBlur = 30; g.beginPath(); g.arc(760, 110, 24, 0, 6.3); g.fill();
  });
  var assets = '<a-assets>' + Object.keys(T).map(function (k) { return '<img id="' + k + '" src="' + T[k] + '">'; }).join('') + '</a-assets>';

  /* ================= builders ================= */
  var WALL = '#efe6d6', CREAM = '#e6dccb', NAVY = '#1b3f6e', GOLD = '#e0a93a', TEAK = '#c99a6b';
  function mat(c, o) {
    if (o.src === 't_wood') c = '#dcb084';
    return 'color:' + c + ';roughness:' + (o.r == null ? .85 : o.r) + ';metalness:' + (o.m || 0) +
      (o.src ? ';src:#' + o.src + (o.rep ? ';repeat:' + o.rep : '') : '') +
      (o.emis ? ';emissive:' + o.emis + ';emissiveIntensity:' + (o.ei || .8) : '') +
      (o.op ? ';opacity:' + o.op + ';transparent:true' : '');
  }
  function shd(o) { return o.ns ? ' shadow="cast:false;receive:false"' : ' shadow="cast:true;receive:true"'; }
  function B(x, y, z, w, h, d, c, o) {
    o = o || {};
    return '<a-box position="' + x + ' ' + y + ' ' + z + '" width="' + w + '" height="' + h + '" depth="' + d + '"' +
      (o.rot ? ' rotation="' + o.rot + '"' : '') + (o.cls ? ' class="' + o.cls + '"' : '') + ' material="' + mat(c, o) + '"' + shd(o) + '></a-box>';
  }
  function C(x, y, z, r, h, c, o) {
    o = o || {};
    var geo = (o.rt == null)
      ? 'primitive:cylinder;radius:' + r + ';height:' + h + ';segmentsRadial:' + (o.seg || 20) + ';segmentsHeight:1'
      : 'primitive:cone;radiusBottom:' + r + ';radiusTop:' + o.rt + ';height:' + h + ';segmentsRadial:' + (o.seg || 20) + ';segmentsHeight:1';
    return '<a-entity position="' + x + ' ' + y + ' ' + z + '"' + (o.rot ? ' rotation="' + o.rot + '"' : '') +
      (o.cls ? ' class="' + o.cls + '"' : '') + ' geometry="' + geo + '" material="' + mat(c, o) + '"' + shd(o) + '></a-entity>';
  }
  function S(x, y, z, r, c, o) {
    o = o || {};
    return '<a-sphere position="' + x + ' ' + y + ' ' + z + '" radius="' + r + '"' + (o.sc ? ' scale="' + o.sc + '"' : '') +
      ' segments-width="16" segments-height="12" material="' + mat(c, { r: o.r == null ? 1 : o.r, emis: o.emis, ei: o.ei }) + '"' + shd(o) + '></a-sphere>';
  }
  function P(x, y, z, w, d, c, o) {   // horizontal plane
    o = o || {};
    return '<a-plane position="' + x + ' ' + y + ' ' + z + '" rotation="-90 0 0"' + (o.cls ? ' class="' + o.cls + '"' : '') + ' width="' + w + '" height="' + d + '" material="' + mat(c, o) + '"' + (o.ns ? ' shadow="cast:false;receive:false"' : ' shadow="receive:true"') + '></a-plane>';
  }

  /* wall along X at depth z, with openings [{c,w,y0,y1}]. t = thickness, cls = colour group */
  function wallX(z, x0, x1, ops, t, cls, col) {
    var out = '', cur = x0, k = { cls: cls || 'room-outside' }; t = t || .22; col = col || WALL;
    ops.slice().sort(function (a, b) { return a.c - b.c; }).forEach(function (o) {
      var a = o.c - o.w / 2, b = o.c + o.w / 2;
      if (a > cur) out += B((cur + a) / 2, 1.5, z, a - cur, 3, t, col, k);
      if (o.y0 > 0) out += B(o.c, o.y0 / 2, z, o.w, o.y0, t, col, k);
      if (o.y1 < 3) out += B(o.c, (o.y1 + 3) / 2, z, o.w, 3 - o.y1, t, col, k);
      cur = b;
    });
    if (x1 > cur) out += B((cur + x1) / 2, 1.5, z, x1 - cur, 3, t, col, k);
    return out;
  }
  /* wall along Z at x, with openings */
  function wallZ(x, z0, z1, ops, t, cls, col) {
    var out = '', cur = z0, k = { cls: cls || 'room-outside' }; t = t || .22; col = col || WALL;
    ops.slice().sort(function (a, b) { return a.c - b.c; }).forEach(function (o) {
      var a = o.c - o.w / 2, b = o.c + o.w / 2;
      if (a > cur) out += B(x, 1.5, (cur + a) / 2, t, 3, a - cur, col, k);
      if (o.y0 > 0) out += B(x, o.y0 / 2, o.c, t, o.y0, o.w, col, k);
      if (o.y1 < 3) out += B(x, (o.y1 + 3) / 2, o.c, t, 3 - o.y1, o.w, col, k);
      cur = b;
    });
    if (z1 > cur) out += B(x, 1.5, (cur + z1) / 2, t, 3, z1 - cur, col, k);
    return out;
  }
  /* window dressing: glass, teak frame, iron grill, chajja (sunshade). axis 'x' = wall runs along X; f = +1/-1 outward direction */
  function win(axis, fixed, c, w, y0, y1, f) {
    var o = '', m = (y0 + y1) / 2, hgt = y1 - y0, n = Math.round(w / .14), i, p;
    var G = { op: .22, ns: 1, r: .05, m: .5 };
    if (axis === 'x') {
      o += B(c, m, fixed, w, hgt, .04, '#bfe3ee', G);
      o += B(c, y1, fixed, w + .1, .07, .16, '#5b3a22') + B(c, y0, fixed, w + .1, .07, .16, '#5b3a22') + B(c, m, fixed, .06, hgt, .16, '#5b3a22');
      for (i = 1; i < n; i++) { p = c - w / 2 + i * w / n; o += B(p, m, fixed + f * .14, .018, hgt, .018, '#1b1b1d', { m: .5 }); }
      o += B(c, m + hgt * .22, fixed + f * .14, w, .02, .02, '#1b1b1d') + B(c, m - hgt * .22, fixed + f * .14, w, .02, .02, '#1b1b1d');
      o += B(c, y1 + .1, fixed + f * .32, w + .5, .08, .65, '#d9d3c8') + B(c, y0 - .04, fixed + f * .1, w + .3, .06, .3, '#cfc8bb');
    } else {
      o += B(fixed, m, c, .04, hgt, w, '#bfe3ee', G);
      o += B(fixed, y1, c, .16, .07, w + .1, '#5b3a22') + B(fixed, y0, c, .16, .07, w + .1, '#5b3a22') + B(fixed, m, c, .16, hgt, .06, '#5b3a22');
      for (i = 1; i < n; i++) { p = c - w / 2 + i * w / n; o += B(fixed + f * .14, m, p, .018, hgt, .018, '#1b1b1d', { m: .5 }); }
      o += B(fixed + f * .14, m + hgt * .22, c, .02, .02, w, '#1b1b1d') + B(fixed + f * .14, m - hgt * .22, c, .02, .02, w, '#1b1b1d');
      o += B(fixed + f * .32, y1 + .1, c, .65, .08, w + .5, '#d9d3c8') + B(fixed + f * .1, y0 - .04, c, .3, .06, w + .3, '#cfc8bb');
    }
    return o;
  }
  function fan(x, z) {
    var b = '';
    [0, 120, 240].forEach(function (a) { b += '<a-entity rotation="0 ' + a + ' 0">' + B(.5, 0, 0, .95, .02, .17, '#efe7d6', { ns: 1 }) + '</a-entity>'; });
    return B(x, 2.97, z, .05, .1, .05, '#444', { ns: 1 }) + '<a-entity position="' + x + ' 2.84 ' + z + '" animation="property:rotation;to:0 360 0;dur:800;loop:true;easing:linear">' + C(0, 0, 0, .1, .08, '#444', { ns: 1 }) + b + '</a-entity>';
  }
  function tube(x, z, len, rotY) { return B(x, 2.95, z, len, .05, .08, '#ffffff', { emis: '#fffbe8', ei: .9, ns: 1, rot: '0 ' + (rotY || 0) + ' 0' }); }
  function coconut(x, z, s, dir) {
    var o = '', i, cx, cy = 5.5 * s;
    for (i = 0; i < 6; i++) o += C(x + i * i * .012 * s * dir, (i + .5) * .95 * s, z, .2 * s - i * .014 * s, .96 * s, '#86684a', { seg: 10 });
    cx = x + 25 * .012 * s * dir;
    for (i = 0; i < 9; i++) o += '<a-entity position="' + cx + ' ' + cy + ' ' + z + '" rotation="0 ' + i * 40 + ' 0">' + B(1.15 * s, -.05, 0, 2.3 * s, .05, .5 * s, i % 2 ? '#3b7d3e' : '#2f6c35', { rot: '0 0 -20' }) + '</a-entity>';
    o += S(cx, cy - .25, z, .16 * s, '#6b4a2f') + S(cx + .22 * s, cy - .3, z + .1, .15 * s, '#7a5a38');
    return o;
  }
  function neem(x, z, s) {
    var g = ['#3f7a4a', '#4c8d57', '#35693f', '#58995f', '#2f5f38'];
    return C(x, 1.4 * s, z, .28 * s, 2.8 * s, '#6b4a2f', { rt: .2 * s, seg: 10 }) +
      S(x, 3.6 * s, z, 1.7 * s, g[0]) + S(x + 1.1 * s, 3.2 * s, z + .4 * s, 1.2 * s, g[1]) + S(x - 1.1 * s, 3.3 * s, z - .3 * s, 1.3 * s, g[2]) +
      S(x + .2 * s, 4.5 * s, z - .3 * s, 1.1 * s, g[3]) + S(x - .3 * s, 3.1 * s, z + 1 * s, 1.0 * s, g[4]);
  }
  function car(x, z) {
    var o = B(x, .58, z, 1.65, .6, 3.7, '#f4f4f2', { r: .25, m: .3 }) + B(x, 1.12, z - .15, 1.5, .5, 2.0, '#f4f4f2', { r: .25, m: .3 }) +
      B(x, 1.14, z - .15, 1.53, .36, 1.7, '#202c38', { r: .1, m: .6 }) + B(x, .3, z + 1.7, 1.5, .25, .3, '#2a2a2a') + B(x, .3, z - 1.7, 1.5, .25, .3, '#2a2a2a');
    [[-.62, 1.8], [.62, 1.8]].forEach(function (h) { o += B(x + h[0], .68, z + h[1], .35, .14, .06, '#fff6cc', { emis: '#fff2b0', ei: .8 }); });
    [[-.62, -1.86], [.62, -1.86]].forEach(function (h) { o += B(x + h[0], .68, z + h[1], .3, .12, .05, '#c01818', { emis: '#a01010', ei: .6 }); });
    [[-.83, 1.15], [.83, 1.15], [-.83, -1.15], [.83, -1.15]].forEach(function (w) { o += C(x + w[0], .3, z + w[1], .3, .2, '#141414', { rot: '0 0 90', seg: 16 }); });
    return o;
  }

  /* ================= the house ================= */
  var h = '';

  // ---- ground, road, paving
  h += P(0, 0, 0, 90, 90, '#ffffff', { src: 't_grass', rep: '45 45' });
  h += P(0, .01, 25, 90, 9, '#ffffff', { src: 't_road', rep: '30 3' });
  h += B(0, .06, 19.6, 90, .12, 1.4, '#b8b1a3');                                   // footpath
  [-30, -20, -10, 0, 10, 20, 30].forEach(function (x) { h += B(x, .012, 25, 3, .01, .16, '#f0e6b0', { ns: 1 }); }); // road centre dashes
  h += P(0, .02, 12.5, 3.4, 9.6, '#ffffff', { src: 't_paver', rep: '4 11' });       // path to porch
  h += P(-8.5, .02, 10.2, 4.2, 8.6, '#ffffff', { src: 't_paver', rep: '5 10' });    // car porch pad
  h += P(-5.2, .02, 14.4, 7, 3, '#ffffff', { src: 't_paver', rep: '9 4' });

  // ---- plinth, floor, roof slab
  h += B(0, .07, 0, 13.2, .14, 10.4, '#cdc5b4');
  h += P(0, .145, 0, 12, 9, '#ffffff', { src: 't_tile', rep: '20 15', r: .35 });
  h += B(0, 3.1, 0, 13, .22, 10.2, '#d8d3c8', { cls: 'roof-edge' });
  h += B(0, 2.98, 5.0, 13.1, .1, .12, '#7a4f2d');
  h += B(0, 3.17, 0, 13.3, .08, 10.5, '#b9b4a8', { cls: 'roof-edge' });                // cornice

  // ---- ceilings (one paint layer per room) + terrace floor layer
  var CEIL = '#d8d3c8';
  function ceilPanel(room, x0, x1, z0, z1) { return B((x0 + x1) / 2, 2.978, (z0 + z1) / 2, x1 - x0, .024, z1 - z0, CEIL, { cls: 'ceil-' + room, ns: 1 }); }
  h += ceilPanel('living', -5.86, 1.41, -4.36, 1.4) + ceilPanel('dining', -5.86, 1.41, 1.4, 4.36);
  h += ceilPanel('bedroom', 1.59, 5.86, -4.36, 1.0) + ceilPanel('kitchen', 1.59, 5.86, 1.0, 4.36);
  h += B(0, 2.94, 6.1, 7.5, .02, 3.2, CEIL, { cls: 'ceil-porch', ns: 1 });             // sit-out ceiling
  h += P(0, 3.222, 0, 12.8, 9.9, '#d8d3c8', { cls: 'terrace-floor', ns: 1 });          // terrace floor (rooftop)

  // ---- parapet
  h += B(0, 3.6, 5.05, 13.2, .8, .18, '#efe6d6', { cls: 'room-terrace' }) + B(0, 3.6, -5.05, 13.2, .8, .18, '#efe6d6', { cls: 'room-terrace' });
  h += B(6.55, 3.6, 0, .18, .8, 10.2, '#efe6d6', { cls: 'room-terrace' }) + B(-6.55, 3.6, 0, .18, .8, 10.2, '#efe6d6', { cls: 'room-terrace' });
  h += B(0, 4.04, 5.05, 13.4, .08, .3, '#dcd5c6', { cls: 'roof-edge' }) + B(0, 4.04, -5.05, 13.4, .08, .3, '#dcd5c6', { cls: 'roof-edge' });
  h += B(6.55, 4.04, 0, .3, .08, 10.4, '#dcd5c6', { cls: 'roof-edge' }) + B(-6.55, 4.04, 0, .3, .08, 10.4, '#dcd5c6', { cls: 'roof-edge' });

  // ---- outer walls with openings
  h += wallX(4.5, -6, 6, [
    { c: 0, w: 2.2, y0: 0, y1: 2.4 },
    { c: -3.6, w: 1.8, y0: .9, y1: 2.2 }, { c: 3.6, w: 1.8, y0: .9, y1: 2.2 }]);
  h += wallX(-4.5, -6, 6, [{ c: -3.6, w: 1.8, y0: .9, y1: 2.2 }, { c: 3.6, w: 1.8, y0: .9, y1: 2.2 }]);
  h += wallZ(-6, -4.5, 4.5, [{ c: -1.5, w: 1.6, y0: .9, y1: 2.2 }, { c: 2.8, w: 1.6, y0: .9, y1: 2.2 }]);
  h += wallZ(6, -4.5, 4.5, [{ c: -2.6, w: 1.6, y0: .9, y1: 2.2 }, { c: 2.6, w: 1.6, y0: .9, y1: 2.2 }]);
  // ---- interior wall skins: each room has its own paint layer (class room-<name>)
  var WIN = function (c, w) { return { c: c, w: w, y0: .9, y1: 2.2 }; };
  var DOORGAP = [{ c: -1.35, w: 1.5, y0: 0, y1: 2.2 }];
  function skX(room, z, x0, x1, ops) { return wallX(z, x0, x1, ops, .03, 'room-' + room, WALL); }
  function skZ(room, x, z0, z1, ops) { return wallZ(x, z0, z1, ops, .03, 'room-' + room, WALL); }
  h += skX('living', -4.375, -6, 1.5, [WIN(-3.6, 1.8)]) + skZ('living', -5.875, -4.5, 1.4, [WIN(-1.5, 1.6)]) + skZ('living', 1.395, -4.5, 1.0, DOORGAP);
  h += skZ('dining', -5.875, 1.4, 4.5, [WIN(2.8, 1.6)]) + skX('dining', 4.375, -6, 1.5, [{ c: 0, w: 2.2, y0: 0, y1: 2.4 }, WIN(-3.6, 1.8)]);
  h += skX('kitchen', 4.375, 1.5, 6, [WIN(3.6, 1.8)]) + skZ('kitchen', 5.875, 1.0, 4.5, [WIN(2.6, 1.6)]);
  h += skX('bedroom', -4.375, 1.5, 6, [WIN(3.6, 1.8)]) + skZ('bedroom', 5.875, -4.5, 1.0, [WIN(-2.6, 1.6)]) + skZ('bedroom', 1.605, -4.5, 1.0, DOORGAP);
  h += win('x', 4.5, -3.6, 1.8, .9, 2.2, 1) + win('x', 4.5, 3.6, 1.8, .9, 2.2, 1);
  h += win('x', -4.5, -3.6, 1.8, .9, 2.2, -1) + win('x', -4.5, 3.6, 1.8, .9, 2.2, -1);
  h += win('z', -6, -1.5, 1.6, .9, 2.2, -1) + win('z', -6, 2.8, 1.6, .9, 2.2, -1);
  h += win('z', 6, -2.6, 1.6, .9, 2.2, 1) + win('z', 6, 2.6, 1.6, .9, 2.2, 1);
  // exterior accent bands (navy plinth band + gold line)
  h += B(0, .3, 4.63, 12.3, .5, .05, '#1b3f6e') + B(0, .58, 4.64, 12.3, .04, .05, GOLD);
  h += B(-3.6, 1.6, 4.64, .04, 2.0, .04, '#e8e0cf', { ns: 1 });

  // ---- main door (double-leaf teak) in frame
  h += B(-1.13, 1.2, 4.5, .12, 2.45, .3, '#4a2e18') + B(1.13, 1.2, 4.5, .12, 2.45, .3, '#4a2e18') + B(0, 2.43, 4.5, 2.4, .12, .3, '#4a2e18');
  h += B(-.54, 1.2, 4.42, 1.04, 2.34, .07, TEAK, { src: 't_wood' }) + B(.54, 1.2, 4.42, 1.04, 2.34, .07, TEAK, { src: 't_wood' });
  [-.54, .54].forEach(function (x) { for (var r = 0; r < 3; r++) h += B(x, .55 + r * .75, 4.465, .8, .55, .02, '#b98652', { src: 't_wood' }); });
  h += C(-.1, 1.15, 4.49, .035, .3, GOLD, { m: .8, r: .3 }) + C(.1, 1.15, 4.49, .035, .3, GOLD, { m: .8, r: .3 });

  // ---- sit-out / porch
  h += B(0, .1, 6.05, 7.2, .2, 2.9, '#ffffff', { src: 't_granite', r: .3 });
  h += B(0, .06, 7.75, 4.6, .12, .45, '#d4cdbf') + B(0, .1, 7.5, 3.9, .2, .2, '#d4cdbf');
  h += '<a-plane position="0 .206 6.0" rotation="-90 0 0" width="2.5" height="2.5" material="src:#t_kolam;transparent:true;opacity:.95;roughness:.6" shadow="receive:true"></a-plane>';
  h += B(0, 3.05, 6.1, 7.6, .2, 3.3, '#d8d3c8', { cls: 'roof-edge' }) + B(0, 3.17, 6.1, 7.8, .06, 3.5, '#b9b4a8', { cls: 'roof-edge' });
  [-3.2, -1.1, 1.1, 3.2].forEach(function (x) {
    h += C(x, 1.62, 7.2, .17, 2.85, '#efe6d6', { seg: 18, cls: 'room-porch' }) + B(x, .24, 7.2, .5, .08, .5, CREAM) + B(x, 2.98, 7.2, .5, .1, .5, CREAM) + B(x, 2.86, 7.2, .32, .16, .32, '#d8cfbd');
  });
  h += B(0, 2.7, 7.78, 3.2, .42, .05, '#10294a') + '<a-text value="BHARATH ILLAM" align="center" color="#f2b53d" width="3.4" position="0 2.7 7.82"></a-text>';
  // thinnai-style swing (jhoola) on the porch
  h += B(-2.35, .72, 6.3, 1.7, .08, .62, '#8a5a34', { src: 't_wood' }) + B(-2.35, 1.15, 6.62, 1.7, .6, .06, '#8a5a34', { src: 't_wood' });
  h += C(-3.15, 1.85, 6.3, .012, 2.2, '#999', { m: .9 }) + C(-1.55, 1.85, 6.3, .012, 2.2, '#999', { m: .9 });
  h += B(-2.35, .82, 6.3, 1.5, .1, .5, '#8b2e2e');
  h += B(3.0, .5, 5.4, .5, .5, .5, '#8a5a34', { src: 't_wood' }) + C(3.0, .85, 5.4, .22, .3, '#a05a30', { seg: 14 }) + S(3.0, 1.2, 5.4, .28, '#3f7a4a');   // tulsi/planter

  // ---- interior partitions (bedroom on right-rear, door gap)
  h += B(1.5, 1.5, -3.3, .18, 3, 2.4, WALL) + B(1.5, 1.5, .2, .18, 3, 1.6, WALL) + B(1.5, 2.6, -1.35, .18, .8, 1.5, WALL);
  h += B(1.5, 1.2, -2.12, .2, 2.45, .08, '#4a2e18') + B(1.5, 1.2, -.58, .2, 2.45, .08, '#4a2e18');

  // ---- living room
  h += B(-3.5, .16, -2.0, 4.4, .02, 3.6, '#a23a3a') + B(-3.5, .165, -2.0, 4.0, .02, 3.2, '#c8923a', { ns: 1 }) + B(-3.5, .17, -2.0, 3.6, .02, 2.8, '#a23a3a', { ns: 1 });  // jute-style rug
  h += B(-3.5, .3, -.85, 3.0, .24, .95, '#5b3a22', { src: 't_wood' });                 // sofa frame
  h += B(-3.5, .52, -.85, 2.8, .22, .8, NAVY) + B(-3.5, .95, -.46, 2.9, .65, .22, NAVY) + B(-5.1, .55, -.85, .22, .5, .95, '#5b3a22', { src: 't_wood' }) + B(-1.9, .55, -.85, .22, .5, .95, '#5b3a22', { src: 't_wood' });
  h += B(-4.7, .86, -.85, .5, .4, .14, GOLD, { rot: '0 0 12' }) + B(-2.3, .86, -.85, .5, .4, .14, '#c8923a', { rot: '0 0 -12' });
  h += B(-0.9, .45, -2.2, .85, .8, .85, '#5b3a22', { src: 't_wood' }) + B(-0.9, .38, -2.2, .7, .3, .7, NAVY);   // single chair
  h += B(-3.5, .3, -2.4, 1.5, .08, .8, '#8a5a34', { src: 't_wood' }) + B(-4.1, .14, -2.4, .08, .28, .6, '#5b3a22') + B(-2.9, .14, -2.4, .08, .28, .6, '#5b3a22');
  h += B(-3.5, .42, -4.15, 2.8, .5, .5, '#4a2e18', { src: 't_wood' }) + B(-3.5, 1.5, -4.31, 1.9, 1.05, .05, '#0b0b0b', { emis: '#10202e', ei: .5, r: .2 });
  h += B(-3.5, 1.5, -4.34, 3.5, 2.5, .03, GOLD, { m: .3 });
  h += B(-5.55, .7, 0.9, .7, 1.4, .7, '#5b3a22', { src: 't_wood' }) + C(-5.55, 1.65, .9, .22, .5, '#d9d0bd', { seg: 12 }) + S(-5.55, 2.2, .9, .45, '#3f7a4a');

  // ---- dining + kitchen
  h += B(-3.2, .76, 2.8, 2.2, .07, 1.05, '#8a5a34', { src: 't_wood' }) + B(-3.2, .38, 2.8, 1.8, .74, .12, '#5b3a22', { src: 't_wood' });
  [[-4.0, 1.9], [-2.4, 1.9], [-4.0, 3.7], [-2.4, 3.7], [-4.45, 2.8], [-1.95, 2.8]].forEach(function (c) {
    h += B(c[0], .46, c[1], .46, .07, .46, NAVY) + B(c[0], .22, c[1], .4, .44, .4, '#5b3a22', { src: 't_wood' }) + B(c[0], .75, c[1] + (c[1] < 2.8 ? -.2 : .2), .46, .5, .07, '#5b3a22', { src: 't_wood' });
  });
  h += C(-3.2, .84, 2.8, .12, .1, '#c9c9c9', { m: .9, r: .3 });
  h += B(3.6, .5, 2.8, 2.6, 1.0, 1.0, NAVY) + B(3.6, 1.03, 2.8, 2.75, .06, 1.15, '#2a2a2c', { r: .25, m: .1 });
  [2.9, 3.6, 4.3].forEach(function (x) { h += C(x, .38, 3.55, .2, .05, '#e0a93a', { m: .6 }) + C(x, .18, 3.55, .03, .36, '#222'); });
  h += B(5.52, .45, 2.6, .85, .9, 3.4, NAVY) + B(5.52, .93, 2.6, .9, .06, 3.5, '#2a2a2c', { r: .25 });
  h += B(5.62, 2.15, 2.6, .5, .85, 3.4, '#e9e3d6') + B(5.62, 2.9, 2.2, .45, .35, .9, '#b8b8b8', { m: .8, r: .3 });     // overhead cabinets + chimney
  h += B(5.52, .99, 2.0, .5, .03, .5, '#111') + C(5.52, 1.02, 1.9, .06, .02, '#e0a93a') + C(5.52, 1.02, 2.1, .06, .02, '#e0a93a');
  h += C(5.5, 1.1, 3.3, .14, .2, '#d0d0d0', { m: .9, r: .25 }) + C(5.5, 1.08, 3.7, .16, .16, '#c0c0c0', { m: .9, r: .25 });

  // ---- master bedroom
  h += B(3.0, .165, -2.8, 2.6, .02, 3.2, '#c8b690', { ns: 1 });
  h += B(4.2, .3, -3.0, 2.1, .4, 2.3, '#5b3a22', { src: 't_wood' }) + B(4.2, .62, -3.0, 1.95, .24, 2.15, '#f2eee4') + B(4.2, .8, -2.35, 1.95, .06, 1.0, '#a23a3a');
  h += B(4.2, 1.1, -4.32, 2.35, 1.6, .14, '#5b3a22', { src: 't_wood' }) + B(3.6, .84, -3.9, .72, .14, .4, '#ffffff') + B(4.8, .84, -3.9, .72, .14, .4, '#ffffff');
  h += B(2.75, .3, -4.1, .5, .55, .5, '#5b3a22', { src: 't_wood' }) + B(5.65, .3, -4.1, .5, .55, .5, '#5b3a22', { src: 't_wood' });
  h += B(5.7, 1.2, -1.2, .55, 2.4, 1.7, '#8a5a34', { src: 't_wood' }) + B(5.42, 1.2, -1.2, .02, 2.2, .02, '#222');
  h += B(5.42, 1.2, -1.2, .03, .3, .03, GOLD);

  // ---- ceiling fans + tube lights
  h += fan(-3.5, -2.0) + fan(-3.2, 2.8) + fan(4.0, -2.5) + fan(3.6, 2.8);
  h += tube(-3.5, -3.8, 1.2, 0) + tube(-3.2, 3.9, 1.2, 0) + tube(4.0, -4.2, 1.2, 0) + tube(5.0, 2.0, .9, 90);

  // ---- terrace: water tank, mumty (stair room), planter
  h += B(4.5, 3.46, -2.5, 1.4, .5, 1.4, '#9a9a96') + B(4.5, 3.46, -2.5, 1.3, .25, 1.3, '#85857f') ;
  h += C(4.5, 4.4, -2.5, .62, 1.1, '#1c1c1e', { rt: .55, r: .5, seg: 24 }) + C(4.5, 5.0, -2.5, .35, .1, '#262628', { seg: 20 });
  h += C(4.5, 3.7, -2.5, .04, .5, '#555');
  h += B(-4.3, 4.5, -2.8, 2.4, 2.6, 2.2, WALL, { cls: 'room-terrace' }) + B(-4.3, 5.84, -2.8, 2.7, .12, 2.5, '#d8d3c8');
  h += B(-4.3, 4.0, -1.68, .9, 1.7, .06, '#4a2e18') + B(-4.3, 4.0, -1.67, .9, 1.7, .02, TEAK, { src: 't_wood' });
  h += B(-2.0, 3.5, 3.2, 3.2, .06, 1.1, '#b5835a') + B(-2.0, 3.65, 3.2, 3.2, .3, .08, NAVY);
  h += C(1.8, 3.45, 3.6, .3, .45, '#a05a30', { seg: 14 }) + S(1.8, 3.95, 3.6, .4, '#3f7a4a') + C(2.6, 3.45, 3.6, .3, .45, '#a05a30', { seg: 14 }) + S(2.6, 3.95, 3.6, .4, '#4c8d57');

  // ---- compound wall + gate (front has gate gap)
  function cw(x, z, w, d) { return B(x, .8, z, w, 1.6, d, '#e6dccb') + B(x, 1.66, z, w + .06, .1, d + .06, '#d4cbb9') + B(x, 1.25, z, w + .02, .14, d + .02, NAVY); }
  h += cw(-13, 2.5, .3, 29.6) + cw(13, 2.5, .3, 29.6) + cw(0, -12.1, 26.3, .3);
  h += cw(-7.6, 17, 10.8, .3) + cw(7.6, 17, 10.8, .3);
  [[-13, -12], [13, -12], [-13, 17], [13, 17], [-2.2, 17], [2.2, 17]].forEach(function (p) {
    h += B(p[0], 1.1, p[1], .6, 2.2, .6, '#e6dccb') + B(p[0], 2.28, p[1], .74, .14, .74, '#d4cbb9') + S(p[0], 2.55, p[1], .16, GOLD, { r: .3 });
  });
  function leaf(hx, rot, dir) {
    var o = '<a-entity position="' + hx + ' 0 17" rotation="0 ' + rot + ' 0">';
    o += B(dir * 1, .22, 0, 2, .08, .06, '#1b1b1d', { m: .6 }) + B(dir * 1, 1.5, 0, 2, .08, .06, '#1b1b1d', { m: .6 }) + B(dir * 1, 1.0, 0, 2, .05, .05, '#1b1b1d', { m: .6 });
    for (var i = 0; i < 12; i++) o += B(dir * (.1 + i * .17), .86, 0, .035, 1.28, .035, '#1b1b1d', { m: .6 });
    for (i = 0; i < 12; i++) o += S(dir * (.1 + i * .17), 1.52, 0, .035, GOLD, { r: .3 });
    return o + '</a-entity>';
  }
  h += leaf(-2.0, 70, 1) + leaf(2.0, -70, -1);

  // ---- landscape
  h += coconut(-9.5, 6, 1.1, 1) + coconut(-11, -3, 1.2, -1) + coconut(10, 4, 1.15, 1) + coconut(10.8, -6, 1.25, -1) + coconut(-9, 13, 1, 1);
  h += neem(9.5, 12, 1.1) + neem(-10, -8.5, 1.2) + neem(7, -9, 1);
  for (var m = 0; m < 9; m++) { h += S(-2.3, .18, 9 + m, .13, m % 2 ? '#f08a1c' : '#f6c335', { sc: '1 .8 1', ns: 1 }) + S(2.3, .18, 9 + m, .13, m % 2 ? '#f6c335' : '#f08a1c', { sc: '1 .8 1', ns: 1 }); }
  h += car(-8.5, 10);
  h += C(-6.0, .7, 8.0, .35, 1.4, '#6d4a2f', { rt: .25, seg: 12 }); // pillar-like gate lamp base
  h += S(-6.0, 1.55, 8.0, .22, '#fff0b0', { emis: '#ffe6a0', ei: 1.2, ns: 1 });

  /* ---- lights ---- */
  var SHADOW = /Mobi|Android/i.test(navigator.userAgent) ? 1024 : 2048;
  var lights =
    '<a-entity id="amb" light="type:ambient;color:#ffffff;intensity:.6"></a-entity>' +
    '<a-entity id="hemi" light="type:hemisphere;color:#dff0ff;groundColor:#8f7f66;intensity:.7"></a-entity>' +
    '<a-entity id="sun" position="12 18 14" light="type:directional;color:#fff0d2;intensity:1.15;castShadow:true;shadowCameraLeft:-24;shadowCameraRight:24;shadowCameraTop:24;shadowCameraBottom:-24;shadowCameraFar:70;shadowMapWidth:' + SHADOW + ';shadowMapHeight:' + SHADOW + ';shadowBias:-0.0006"></a-entity>' +
    '<a-entity id="moon" position="-10 14 -8" light="type:directional;color:#8fa8ff;intensity:0"></a-entity>' +
    [[-3.5, 2.7, -1.5], [-3.2, 2.7, 2.8], [3.8, 2.7, 2.5], [4.0, 2.7, -2.5], [0, 2.7, 6.2]].map(function (p) {
      return '<a-entity class="room-light" position="' + p.join(' ') + '" light="type:point;color:#ffd9a0;intensity:0;distance:9;decay:1.5"></a-entity>';
    }).join('');

  /* ---- scene ---- */
  AFRAME.registerComponent('thumb-move', {
    init: function () {
      var rig = document.getElementById('rig'), cam = document.getElementById('cam');
      this.el.addEventListener('thumbstickmoved', function (e) {
        var yaw = cam.object3D.rotation.y + rig.object3D.rotation.y, sp = 0.09;
        rig.object3D.position.x -= (Math.sin(yaw) * e.detail.y - Math.cos(yaw) * e.detail.x) * sp;
        rig.object3D.position.z += (Math.cos(yaw) * e.detail.y + Math.sin(yaw) * e.detail.x) * sp;
      });
    }
  });

  var scene =
    '<a-scene embedded vr-mode-ui="enabled:false" loading-screen="enabled:false" shadow="type:pcfsoft" renderer="antialias:true;colorManagement:true" fog="type:linear;color:#d6e6ec;near:45;far:130">' +
      assets +
      '<a-sky id="sky" src="#skyDay"></a-sky>' +
      '<a-entity id="rig" position="0 0 14.5">' +
        '<a-entity id="cam" camera="fov:75" look-controls wasd-controls="acceleration:38;fly:false;enabled:false" position="0 1.6 0"></a-entity>' +
        '<a-entity id="lhand" laser-controls="hand:left" thumb-move></a-entity>' +
        '<a-entity id="rhand" laser-controls="hand:right"></a-entity>' +
      '</a-entity>' +
      '<a-entity id="house">' + h + '</a-entity>' + lights +
    '</a-scene>';

  host.insertAdjacentHTML('afterbegin', scene);

  var sceneEl = host.querySelector('a-scene');
  var rig = host.querySelector('#rig');
  var cam = host.querySelector('#cam');

  sceneEl.addEventListener('loaded', function () {
    setTimeout(function () { document.getElementById('vrLoading').classList.add('hide'); }, 600);
  });

  // keys only work while the pointer is over the viewer (so the page can still scroll)
  host.addEventListener('mouseenter', function () { cam.setAttribute('wasd-controls', 'enabled', true); });
  host.addEventListener('mouseleave', function () { cam.setAttribute('wasd-controls', 'enabled', false); });

  /* ---------- room jump ---------- */
  var ROOMS = {
    outside: { x: 0, y: 0, z: 14.5, yaw: 0 },
    porch: { x: 1.8, y: .2, z: 6.5, yaw: 68 },
    living: { x: -0.4, y: 0, z: 0.9, yaw: 38 },
    dining: { x: -0.6, y: 0, z: 1.6, yaw: 114 },
    kitchen: { x: 2.0, y: 0, z: 1.3, yaw: -112 },
    bedroom: { x: 2.6, y: 0, z: -0.8, yaw: -30 },
    terrace: { x: 0, y: 3.2, z: 3.0, yaw: 0 }
  };
  var LABEL = { outside: 'Exterior walls', porch: 'Sit-out pillars', living: 'Living room walls', dining: 'Dining walls', kitchen: 'Kitchen walls', bedroom: 'Bedroom walls', terrace: 'Terrace parapet + stair room' };
  function goTo(name) {
    var r = ROOMS[name]; if (!r) return;
    cam.setAttribute('position', '0 1.6 0');
    try { var lc = cam.components['look-controls']; lc.pitchObject.rotation.x = 0; lc.yawObject.rotation.y = 0; } catch (e) { /* ignore */ }
    rig.removeAttribute('animation');
    rig.setAttribute('rotation', '0 ' + r.yaw + ' 0');
    rig.setAttribute('animation', { property: 'position', to: r.x + ' ' + r.y + ' ' + r.z, dur: 1400, easing: 'easeInOutCubic' });
  }

  /* ---------- wall colour: every room has its OWN colour ---------- */
  var PALETTE = [['Ivory', '#efe6d6'], ['Sage', '#cfd9cf'], ['Sand', '#e3c3a6'], ['Mist blue', '#aab7c4'], ['Peach', '#f1c9b0'], ['Butter', '#f3e2a5'], ['Rose', '#e8c4c4'], ['Teal', '#a8cfc9']];
  var group = 'outside', colours = {};
  var sw = document.getElementById('swatches'), swLabel = document.getElementById('swLabel');
  sw.innerHTML = PALETTE.map(function (p) { return '<button data-c="' + p[1] + '" style="--c:' + p[1] + '" aria-label="' + p[0] + '" title="' + p[0] + '"></button>'; }).join('') +
    '<input type="color" id="customColor" value="#000000" title="Custom colour" aria-label="Custom colour">';
  var picker = document.getElementById('customColor');
  // each room can paint two things: walls (or pillars / parapet) and its ceiling (or roof edge / terrace floor)
  var TARGETS = {
    outside: [['Walls', '.room-outside'], ['Roof edge', '.roof-edge']],
    porch: [['Pillars', '.room-porch'], ['Ceiling', '.ceil-porch']],
    living: [['Walls', '.room-living'], ['Ceiling', '.ceil-living']],
    dining: [['Walls', '.room-dining'], ['Ceiling', '.ceil-dining']],
    kitchen: [['Walls', '.room-kitchen'], ['Ceiling', '.ceil-kitchen']],
    bedroom: [['Walls', '.room-bedroom'], ['Ceiling', '.ceil-bedroom']],
    terrace: [['Parapet', '.room-terrace'], ['Terrace floor', '.terrace-floor']]
  };
  var CLABEL = { outside: 'Roof edge', porch: 'Sit-out ceiling', living: 'Living room ceiling', dining: 'Dining ceiling', kitchen: 'Kitchen ceiling', bedroom: 'Bedroom ceiling', terrace: 'Terrace floor' };
  var LOOK = { outside: .3, porch: .6, living: .75, dining: .75, kitchen: .75, bedroom: .75, terrace: -.6 };   // camera tilt when the 2nd target is chosen
  var tgt = 0, CEILCOL = '#d8d3c8';
  var pt = document.getElementById('paintTarget');
  function ckey() { return group + '|' + tgt; }
  function tilt(v) { try { cam.components['look-controls'].pitchObject.rotation.x = v; } catch (e) { /* ignore */ } }
  function markSwatch() {
    var c = (colours[ckey()] || (tgt ? CEILCOL : WALL)).toLowerCase();
    sw.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === c); });
    picker.value = colours[ckey()] || '#000000'; swLabel.textContent = (tgt ? CLABEL[group] : LABEL[group]) + ':';
    pt.innerHTML = TARGETS[group].map(function (t, i) { return '<button type="button" class="chip' + (i === tgt ? ' active' : '') + '" data-t="' + i + '">' + t[0] + '</button>'; }).join('');
  }
  function paintRoom(c) {
    colours[ckey()] = c;
    host.querySelectorAll(TARGETS[group][tgt][1]).forEach(function (el) { el.setAttribute('material', 'color', c); });
    markSwatch();
  }
  pt.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    tgt = +b.dataset.t; tilt(tgt ? LOOK[group] : 0); markSwatch();
  });
  sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) paintRoom(b.dataset.c); });
  picker.addEventListener('input', function () { paintRoom(picker.value); });

  var roomBar = document.getElementById('vrRooms');
  roomBar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    roomBar.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    b.classList.add('active'); group = b.dataset.room; tgt = 0; goTo(group); markSwatch();
  });
  markSwatch();

  /* ---------- day / night ---------- */
  var isDay = true, btnDay = document.getElementById('btnDay');
  function L(id, v) { host.querySelector(id).setAttribute('light', 'intensity', v); }
  btnDay.addEventListener('click', function () {
    isDay = !isDay;
    btnDay.textContent = isDay ? '☀ Day' : '🌙 Night';
    host.querySelector('#sky').setAttribute('src', isDay ? '#skyDay' : '#skyNight');
    sceneEl.setAttribute('fog', 'color', isDay ? '#d6e6ec' : '#0a1428');
    L('#amb', isDay ? .6 : .16); L('#hemi', isDay ? .7 : .12); L('#sun', isDay ? 1.15 : 0); L('#moon', isDay ? 0 : .35);
    host.querySelectorAll('.room-light').forEach(function (l) { l.setAttribute('light', 'intensity', isDay ? 0 : 1.2); });
  });

  /* ---------- enter VR headset mode ---------- */
  document.getElementById('btnEnterVR').addEventListener('click', function () {
    if (sceneEl.hasLoaded) sceneEl.enterVR();
    else sceneEl.addEventListener('loaded', function () { sceneEl.enterVR(); });
  });
})();