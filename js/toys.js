// What the room remembers between breaks, and the hands-on panels:
// the window, washing the mug, stirring the coffee, the ref door.
// Nothing here can be failed. js/room.js opens these and passes in `api`.
(function () {
  var P = (window.Pantry = window.Pantry || {});

  var C = {
    ink: "#1f1a24", white: "#f4f0e6", grey: "#c8c8c8", steel: "#8c8c94", dark: "#55555e",
    brown: "#6b4a32", mid: "#8f6642", wood: "#b98a5a", blue: "#4a8fd0", sky: "#8cc4e8",
    red: "#c8483c", orange: "#e08a3c", yellow: "#f0cc5a", green: "#5a9a52", navy: "#2c4f8a"
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  // A fixed scatter, so stains and powder look the same on every device.
  function hash(a, b) {
    var h = (a * 374761393 + b * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    return ((h ^ (h >>> 16)) >>> 0) % 100;
  }

  // ---- what the room remembers --------------------------------------------
  // One storage key, kept across breaks: how often the cat was petted, how often the
  // plant was watered, where the magnets are, what is on the sticky note.
  // No dates are kept, so there is no streak to lose.

  var HOME_KEY = "pantry.home";
  var MAG_W = 14, MAG_H = 11, NOTE = 12;
  var MAGNETS = [[6, 2], [9, 4], [2, 7], [11, 8], [3, 1], [7, 7]];
  var BLANK = new Array(NOTE * NOTE + 1).join("0");
  // a new note has two lines of someone's handwriting on it
  var WRITTEN = BLANK.split("").map(function (c, i) {
    var x = i % NOTE, y = Math.floor(i / NOTE);
    return (y === 3 && x >= 2 && x <= 9) || (y === 6 && x >= 2 && x <= 7) ? "1" : "0";
  }).join("");
  var home = null;

  function count(v) { return typeof v === "number" && isFinite(v) && v > 0 ? Math.min(9999, Math.floor(v)) : 0; }

  // Storage can be edited by hand, so everything read from it is checked and clamped.
  function loadHome() {
    var h = null;
    try { h = JSON.parse(P.store.get(HOME_KEY)); } catch (e) {}
    if (!h || typeof h !== "object") h = {};
    var m = Array.isArray(h.magnets) && h.magnets.length === MAGNETS.length ? h.magnets : MAGNETS;
    home = {
      cat: count(h.cat),
      plant: count(h.plant),
      magnets: m.map(function (p, i) {
        var ok = Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number" && isFinite(p[0]) && isFinite(p[1]);
        var s = ok ? p : MAGNETS[i];
        return [clamp(Math.round(s[0]), 0, MAG_W - 2), clamp(Math.round(s[1]), 0, MAG_H - 2)];
      }),
      note: typeof h.note === "string" && h.note.length === NOTE * NOTE && !/[^01]/.test(h.note) ? h.note : WRITTEN
    };
  }

  P.home = {
    get: function () { if (!home) loadHome(); return home; },
    save: function () { if (home) P.store.set(HOME_KEY, JSON.stringify(home)); },
    // 0 a stranger, 1 looks up when you come in, 2 joins you at the window
    catStage: function () { var n = P.home.get().cat; return n >= 5 ? 2 : n >= 2 ? 1 : 0; },
    // 0 to 4, by total waterings
    plantStage: function () { var n = P.home.get().plant; return n >= 30 ? 4 : n >= 14 ? 3 : n >= 7 ? 2 : n >= 3 ? 1 : 0; },
    MAGNET_COLORS: [C.red, C.blue, C.yellow, C.green, C.orange, C.navy],
    NOTE: NOTE
  };

  // ---- helpers ------------------------------------------------------------

  function canvas(w, h, cls) {
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    cv.className = cls;
    cv.setAttribute("aria-hidden", "true");
    return cv;
  }

  // Pointer position on a canvas, in the canvas's own pixels.
  // fn(x, y, phase), with phase "down", "move" or "up".
  function drag(cv, api, fn) {
    var down = false;
    function at(e) {
      var r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height];
    }
    cv.addEventListener("pointerdown", function (e) {
      if (!api.active()) return;
      down = true;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      var p = at(e);
      fn(p[0], p[1], "down");
      e.preventDefault();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!down || !api.active()) return;
      var p = at(e);
      fn(p[0], p[1], "move");
    });
    function end(e) {
      if (!down) return;
      down = false;
      var p = at(e);
      fn(p[0], p[1], "up");
    }
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
  }

  function painter(cv) {
    var ctx = cv.getContext("2d");
    return {
      ctx: ctx,
      px: function (x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); },
      rect: function (x0, y0, x1, y1, c) { ctx.fillStyle = c; ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1); }
    };
  }

  function frame(cls, cv) {
    var box = document.createElement("div");
    box.className = "toy " + cls;
    box.dataset.cols = cv.width;     // art pixels across, so js/scale.js can size it to whole device pixels
    box.appendChild(cv);
    return box;
  }

  P.toys = {};

  // ---- the window ------------------------------------------------------------
  // Nothing is required here. A pacer runs four seconds in, six out. Each breath out
  // fogs the glass, and a finger clears it. What is drawn fogs over again in a few breaths.

  var IN_MS = 4000, CYCLE_MS = 10000;
  var FW = 52, FH = 50;                 // fog grid, two cells per art pixel
  var win = null;

  // seen from behind, tail to the right. No outline, so it reads against a dark skyline too.
  var SILL_CAT = ["o...o...", "oo.oo...", "ooooo...", "ooooo...", ".ooo....", "ooboo...", "obobooo.", "obobo.oo", "ooooo..o"];

  // How foggy a cell may get: thickest low in the middle, where the breath lands.
  function fogCap(x, y) {
    if (x >= 24 && x <= 27) return 0;   // the mullion stays clear
    var dx = (x - 26) / 20, dy = (y - 32) / 16;
    return 0.16 + 0.62 * Math.exp(-(dx * dx + dy * dy));
  }

  function drawFog() {
    var ctx = win.fog.getContext("2d"), img = ctx.createImageData(FW, FH), d = img.data;
    for (var i = 0; i < FW * FH; i++) {
      d[i * 4] = 244; d[i * 4 + 1] = 240; d[i * 4 + 2] = 230;
      d[i * 4 + 3] = Math.round(win.mist[i] * 255);
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawView(api) {
    var p = painter(win.view), art = document.querySelector("#room .room-art");
    p.ctx.clearRect(0, 0, 26, 25);
    try {
      if (art && art.complete && art.naturalWidth) p.ctx.drawImage(art, 33, 9, 26, 25, 0, 0, 26, 25);
      p.ctx.drawImage(api.fx(), 33, 9, 26, 25, 0, 0, 26, 25);
    } catch (e) {}
    if (win.cat) {
      var ink = { k: C.ink, o: C.orange, b: C.brown };
      SILL_CAT.forEach(function (row, j) {
        for (var i = 0; i < row.length; i++) if (ink[row[i]]) p.px(2 + i, 16 + j, ink[row[i]]);
      });
    }
  }

  function wipe(x, y) {
    var cx = Math.round(x), cy = Math.round(y);
    for (var j = -3; j <= 3; j++) {
      for (var i = -3; i <= 3; i++) {
        var X = cx + i, Y = cy + j;
        if (i * i + j * j > 7 || X < 0 || Y < 0 || X >= FW || Y >= FH) continue;
        win.mist[Y * FW + X] = 0;
      }
    }
  }

  P.toys.window = {
    label: "At the window",
    build: function (body, api) {
      var view = canvas(26, 25, "toy-canvas"), fog = canvas(FW, FH, "toy-canvas fog");
      var box = frame("toy-window", view);
      box.appendChild(fog);
      var pacer = api.node("div", "pacer"), fill = api.node("div", "pacer-fill"), word = api.node("div", "pacer-word");
      pacer.appendChild(fill);
      body.appendChild(box); body.appendChild(pacer); body.appendChild(word);

      win = {
        view: view, fog: fog, fill: fill, word: word,
        mist: new Float32Array(FW * FH),
        start: P.now(),
        base: api.counts().breaths || 0,
        cat: P.home.catStage() === 2,
        last: null
      };
      // the glass is already a little fogged, so the first touch shows what it does
      for (var i = 0; i < FW * FH; i++) win.mist[i] = fogCap(i % FW, Math.floor(i / FW)) * 0.6;
      drag(fog, api, function (x, y, phase) {
        if (phase === "up") { win.last = null; return; }
        // join the dots, so a fast finger still leaves a line
        var from = win.last || [x, y], steps = Math.ceil(Math.max(Math.abs(x - from[0]), Math.abs(y - from[1]))) || 1;
        for (var s = 0; s <= steps; s++) wipe(from[0] + (x - from[0]) * s / steps, from[1] + (y - from[1]) * s / steps);
        win.last = [x, y];
        drawFog();
      });
      P.toys.window.tick(api);
    },
    tick: function (api) {
      if (!win) return;
      var gone = P.now() - win.start, t = gone % CYCLE_MS, out = t >= IN_MS;
      var part = out ? 1 - (t - IN_MS) / (CYCLE_MS - IN_MS) : t / IN_MS;
      win.fill.style.width = Math.round(part * 100) + "%";
      win.word.textContent = out ? "Breathe out" : "Breathe in";

      var breaths = win.base + Math.floor(gone / CYCLE_MS), counts = api.counts();
      if (breaths !== (counts.breaths || 0)) { counts.breaths = breaths; api.save(); }

      for (var i = 0; i < FW * FH; i++) {
        var cap = fogCap(i % FW, Math.floor(i / FW)), m = win.mist[i];
        win.mist[i] = out ? Math.min(cap, m + 0.014) : Math.max(0, m - 0.002);
      }
      drawView(api);
      drawFog();
    },
    close: function () { win = null; }
  };

  // ---- washing the mug ---------------------------------------------------------
  // Scrub the coffee off, then rinse the soap off. Drag, or use the two buttons.

  var MW = 18, MH = 24, MX = 11, MY = 8;   // the mug's body on the 40 by 34 canvas
  var wash = null;

  function stainAt(x, y, heavy) {
    var drip = hash(x, 7) % (heavy ? 14 : 8);            // drips down from the rim
    if (y < drip) return 1;
    if (y === MH - 3 && hash(x, 3) < 70) return 1;       // the ring at the bottom
    return hash(x, y) < (heavy ? 14 : 6) ? 1 : 0;
  }

  function left(a) { var n = 0; for (var i = 0; i < a.length; i++) n += a[i]; return n; }

  function drawWash() {
    var p = painter(wash.cv);
    p.rect(0, 0, 39, 33, C.steel);                        // the sink
    p.rect(0, 0, 39, 1, C.grey); p.rect(0, 32, 39, 33, C.dark);
    p.rect(17, 0, 22, 3, C.dark); p.rect(18, 4, 21, 5, C.ink);   // the tap
    p.rect(MX - 1, MY - 1, MX + MW, MY + MH, C.ink);
    p.rect(MX, MY, MX + MW - 1, MY + MH - 1, C.white);
    p.rect(MX, MY + 7, MX + MW - 1, MY + 10, C.blue);
    p.rect(MX + MW - 2, MY, MX + MW - 1, MY + MH - 1, C.grey);
    p.rect(MX + MW + 1, MY + 5, MX + MW + 5, MY + 6, C.ink);      // the handle
    p.rect(MX + MW + 1, MY + 15, MX + MW + 5, MY + 16, C.ink);
    p.rect(MX + MW + 4, MY + 5, MX + MW + 5, MY + 16, C.ink);
    for (var y = 0; y < MH; y++) {
      for (var x = 0; x < MW; x++) {
        var i = y * MW + x;
        if (wash.stain[i]) p.px(MX + x, MY + y, (x + y) % 3 ? C.brown : C.mid);
        else if (wash.foam[i]) p.px(MX + x, MY + y, hash(x, y + wash.n) < 55 ? C.sky : C.white);
      }
    }
    if (wash.rinse) {
      p.rect(19, 6, 20, MY - 1, C.sky);
      var row = MY + (wash.rinse - 1) * 6;
      p.rect(MX, row, MX + MW - 1, Math.min(row + 5, MY + MH - 1), C.sky);
    }
    if (wash.done && (wash.n % 2 === 0 || wash.still)) {
      [[MX + 3, MY + 3], [MX + 13, MY + 14], [MX + 6, MY + 19]].forEach(function (s) {
        p.px(s[0], s[1], C.yellow); p.px(s[0] - 1, s[1], C.yellow); p.px(s[0] + 1, s[1], C.yellow);
        p.px(s[0], s[1] - 1, C.yellow); p.px(s[0], s[1] + 1, C.yellow);
      });
    }
  }

  function scrubAt(x, y, r) {
    var cx = Math.round(x) - MX, cy = Math.round(y) - MY, hit = false;
    for (var j = -r; j <= r; j++) {
      for (var i = -r; i <= r; i++) {
        var X = cx + i, Y = cy + j;
        if (i * i + j * j > r * r + 1 || X < 0 || Y < 0 || X >= MW || Y >= MH) continue;
        wash.stain[Y * MW + X] = 0;
        wash.foam[Y * MW + X] = 1;
        hit = true;
      }
    }
    return hit;
  }

  P.toys.wash = {
    label: "The sink",
    build: function (body, api) {
      var cv = canvas(40, 34, "toy-canvas"), keys = api.node("div", "keys");
      var own = api.coffee().step === 3;
      wash = { cv: cv, stain: new Uint8Array(MW * MH), foam: new Uint8Array(MW * MH), rinse: 0, done: false, n: 0, band: 0, last: null, still: api.still() };
      for (var i = 0; i < MW * MH; i++) wash.stain[i] = stainAt(i % MW, Math.floor(i / MW), !own);
      wash.dirty = left(wash.stain);
      drag(cv, api, function (x, y, phase) {
        if (phase === "up") { wash.last = null; return; }
        if (wash.done || wash.rinse) return;
        // every pixel between two touches, so a fast sponge misses nothing
        var from = wash.last || [x, y], steps = Math.ceil(Math.max(Math.abs(x - from[0]), Math.abs(y - from[1]))) || 1, hit = false;
        for (var s = 0; s <= steps; s++) hit = scrubAt(from[0] + (x - from[0]) * s / steps, from[1] + (y - from[1]) * s / steps, 2) || hit;
        wash.last = [x, y];
        if (hit) { P.sound.scrub(); drawWash(); }
      });
      keys.appendChild(api.key("Scrub", "Scrub the mug", function () {
        if (wash.done || wash.rinse) return;
        // one band of the mug per press, top to bottom, then round again
        for (var x = 0; x < MW; x++) scrubAt(MX + x, MY + wash.band * 6 + 3, 3);
        wash.band = (wash.band + 1) % 4;
        P.sound.scrub();
        drawWash();
      }));
      keys.appendChild(api.key("Rinse", "Rinse the mug", function () {
        if (wash.done || wash.rinse) return;
        if (!left(wash.foam)) { api.say(api.copy("wash-dry")); return; }
        wash.rinse = 1;
        P.sound.rinse();
        drawWash();
      }));
      body.appendChild(frame("toy-wash", cv)); body.appendChild(keys);
      api.say(api.copy(own ? "wash-own" : "wash-soak"));
      drawWash();
    },
    tick: function (api) {
      if (!wash) return;
      wash.n++;
      if (wash.rinse) {
        var from = (wash.rinse - 1) * 6 * MW;
        for (var i = from; i < Math.min(from + 6 * MW, MW * MH); i++) wash.foam[i] = 0;
        if (++wash.rinse > 4) {
          wash.rinse = 0;
          // a few specks are let go. Only a mug that was barely touched goes back.
          if (left(wash.stain) > wash.dirty * 0.15) api.say(api.copy("wash-stain"));
          else {
            for (i = 0; i < MW * MH; i++) wash.stain[i] = 0;
            wash.done = true;
            api.washed();
          }
        }
      }
      drawWash();
    },
    close: function () { wash = null; }
  };

  // ---- stirring the coffee --------------------------------------------------------
  // The cup from above. Drag in circles, or press Stir. The powder goes when it goes.

  var stir = null;

  function drawStir() {
    var p = painter(stir.cv), part = Math.min(1, stir.turned / stir.need);
    p.ctx.clearRect(0, 0, 40, 40);
    p.rect(34, 17, 39, 22, C.ink); p.rect(34, 18, 38, 21, C.white);      // the handle
    for (var y = 0; y < 40; y++) {
      for (var x = 0; x < 40; x++) {
        var dx = x - 19.5, dy = y - 19.5, r = Math.sqrt(dx * dx + dy * dy);
        if (r > 17.5) continue;
        var c;
        if (r > 16.5 || (r > 13.5 && r <= 14.5)) c = C.ink;
        else if (r > 14.5) c = C.white;
        else {
          c = part < 0.5 ? C.wood : C.mid;
          if (hash(x, y) < 26 * (1 - part)) c = C.brown;                    // powder, not yet dissolved
          var arm = Math.sin(Math.atan2(dy, dx) * 2 - r * 0.45 - stir.angle * 2);
          if (arm > 0.8 && r > 2) c = part >= 1 ? C.white : part < 0.5 ? C.mid : C.wood;
        }
        p.px(x, y, c);
      }
    }
    // the spoon, from near the middle out past the rim
    var a = stir.spoon;
    for (var k = 4; k <= 20; k++) p.px(Math.round(19.5 + Math.cos(a) * k - 0.5), Math.round(19.5 + Math.sin(a) * k - 0.5), k > 15 ? C.dark : C.steel);
  }

  function turn(api, by) {
    if (stir.done) return;
    var before = Math.floor(stir.turned / Math.PI);
    stir.turned += Math.abs(by);
    stir.angle += by;
    if (Math.floor(stir.turned / Math.PI) !== before) api.blip(1400, 1200, 40);   // the spoon on the mug
    if (stir.turned >= stir.need) {
      stir.done = true;
      stir.wait = 5;
      api.brewed();
    }
  }

  P.toys.stir = {
    label: "Stir the coffee",
    build: function (body, api) {
      var cv = canvas(40, 40, "toy-canvas"), keys = api.node("div", "keys");
      stir = { cv: cv, turned: 0, need: api.stirs() * 2 * Math.PI, angle: 0, spoon: -0.8, last: null, done: false, wait: 0, coast: 0 };
      drag(cv, api, function (x, y, phase) {
        if (phase === "up") { stir.last = null; return; }
        var dx = x - 20, dy = y - 20;
        if (dx * dx + dy * dy < 9) return;               // too near the middle to tell which way
        var a = Math.atan2(dy, dx);
        if (stir.last !== null) {
          var d = a - stir.last;
          if (d > Math.PI) d -= 2 * Math.PI;
          if (d < -Math.PI) d += 2 * Math.PI;
          if (Math.abs(d) < 2) { turn(api, d); stir.coast = d > 0 ? 3 : -3; }
        }
        stir.last = a;
        stir.spoon = a;
        drawStir();
      });
      keys.appendChild(api.key("Stir", "Stir once", function () {
        stir.spoon += 2.1;
        stir.coast = 3;
        turn(api, 2 * Math.PI);
        drawStir();
      }));
      body.appendChild(frame("toy-stir", cv)); body.appendChild(keys);
      api.say(api.copy("stir-hint"));
      drawStir();
    },
    tick: function (api) {
      if (!stir) return;
      // the coffee keeps turning for a moment after the spoon stops
      if (stir.coast && !api.still()) {
        stir.angle += stir.coast > 0 ? 0.35 : -0.35;
        stir.coast += stir.coast > 0 ? -1 : 1;
      }
      drawStir();
      if (stir.done && --stir.wait <= 0) api.close();
    },
    close: function () { stir = null; }
  };

  // ---- the ref door ------------------------------------------------------------------
  // Magnets to move and a sticky note to draw on. Both stay where they were left.

  var door = null;

  function drawDoor() {
    var h = P.home.get(), p = painter(door.board);
    p.rect(0, 0, MAG_W + 1, MAG_H + 1, C.grey);
    p.rect(0, 0, 0, MAG_H + 1, C.white);
    p.rect(MAG_W + 1, 0, MAG_W + 1, MAG_H + 1, C.steel);
    h.magnets.forEach(function (m, i) {
      if (i === door.held) p.rect(m[0], m[1], m[0] + 3, m[1] + 3, C.white);
      p.rect(m[0] + 1, m[1] + 1, m[0] + 2, m[1] + 2, P.home.MAGNET_COLORS[i]);
    });
    var n = painter(door.note);
    n.rect(0, 0, NOTE + 1, NOTE + 1, C.yellow);
    n.rect(0, 0, NOTE + 1, 0, C.orange);                 // the sticky edge
    for (var i = 0; i < NOTE * NOTE; i++) if (h.note.charAt(i) === "1") n.px(1 + i % NOTE, 1 + Math.floor(i / NOTE), C.brown);
  }

  function ink(x, y) {
    var X = Math.floor(x) - 1, Y = Math.floor(y) - 1, h = P.home.get();
    if (X < 0 || Y < 0 || X >= NOTE || Y >= NOTE) return;
    var i = Y * NOTE + X;
    h.note = h.note.slice(0, i) + "1" + h.note.slice(i + 1);
  }

  P.toys.door = {
    label: "The ref door",
    build: function (body, api) {
      var board = canvas(MAG_W + 2, MAG_H + 2, "toy-canvas"), note = canvas(NOTE + 2, NOTE + 2, "toy-canvas");
      var row = api.node("div", "door-row"), keys = api.node("div", "keys");
      door = { board: board, note: note, held: -1, last: null };

      drag(board, api, function (x, y, phase) {
        var h = P.home.get();
        if (phase === "down") {
          var best = -1, near = 12;
          h.magnets.forEach(function (m, i) {
            var dx = m[0] + 2 - x, dy = m[1] + 2 - y, d = dx * dx + dy * dy;
            if (d < near) { near = d; best = i; }
          });
          door.held = best;
          if (best !== -1) api.blip(500, 600, 30);
        }
        if (door.held === -1) return;
        h.magnets[door.held] = [clamp(Math.round(x - 2), 0, MAG_W - 2), clamp(Math.round(y - 2), 0, MAG_H - 2)];
        if (phase === "up") {
          door.held = -1;
          api.blip(700, 500, 30);
          P.home.save();
        }
        drawDoor();
      });

      drag(note, api, function (x, y, phase) {
        if (phase === "up") { door.last = null; P.home.save(); return; }
        var from = door.last || [x, y], steps = Math.ceil(Math.max(Math.abs(x - from[0]), Math.abs(y - from[1])) * 2) || 1;
        for (var s = 0; s <= steps; s++) ink(from[0] + (x - from[0]) * s / steps, from[1] + (y - from[1]) * s / steps);
        door.last = [x, y];
        drawDoor();
      });

      keys.appendChild(api.key("Straighten", "Line the magnets up", function () {
        P.home.get().magnets = MAGNETS.map(function (m, i) { return [1 + i * 2, 4]; });
        P.home.save();
        api.blip(600, 800, 80);
        api.say(api.copy("magnet-straight"));
        drawDoor();
      }));
      keys.appendChild(api.key("New note", "Start a blank sticky note", function () {
        P.home.get().note = BLANK;
        P.home.save();
        api.blip(800, 500, 60);
        api.say(api.copy("note-new"));
        drawDoor();
      }));
      row.appendChild(frame("toy-board", board)); row.appendChild(frame("toy-note", note));
      body.appendChild(row); body.appendChild(keys);
      drawDoor();
    },
    tick: function () {},
    close: function () {
      if (door) P.home.save();
      door = null;
    }
  };
})();
