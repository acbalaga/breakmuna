// Stations, background objects, tap icons and sound.
// Everything that moves is drawn on the #fx canvas, one art pixel at a time.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var $ = function (id) { return document.getElementById(id); };

  var C = {
    ink: "#1f1a24", white: "#f4f0e6", grey: "#c8c8c8", brown: "#6b4a32",
    red: "#c8483c", orange: "#e08a3c", yellow: "#f0cc5a", wood: "#b98a5a",
    blue: "#4a8fd0", dark: "#55555e", steel: "#8c8c94"
  };
  var COUNTS_KEY = "pantry.counts";
  var SOUND_KEY = "pantry.sound";
  var STIRS = 3;

  var fx, ctx;
  var frame = 0;
  var still = false;          // reduced motion: no stepped animation
  var counts = {};
  var used = {};              // line ids already shown this break
  var coffee = { step: 0, stirs: 0, pour: 0 };   // 0 empty, 1 sachet in, 2 water in, 3 done
  var coverUp = false;
  var watch = null;           // { start, base } while at the window
  var litWindows = 0;
  var parcelOpen = false;
  var soundOn = false;
  var audio = null;

  function active() { return document.body.dataset.view === "break"; }

  function save() { P.store.set(COUNTS_KEY, JSON.stringify(counts)); }
  function load() {
    try { counts = JSON.parse(P.store.get(COUNTS_KEY)) || {}; } catch (e) { counts = {}; }
  }

  // ---- copy ---------------------------------------------------------------

  // A random unused line. No line repeats within a single break.
  function line(pool, object) {
    var all = (window.PANTRY_COPY || []).filter(function (l) {
      return l.pool === pool && !l.when && (!object || l.object === object);
    });
    var fresh = all.filter(function (l) { return !used[l.id]; });
    if (!fresh.length) return null;
    var l = fresh[Math.floor(Math.random() * fresh.length)];
    used[l.id] = true;
    return l;
  }

  // Picked by date, so officemates see the same item on the same day.
  function meriendaOfTheDay() {
    var all = (window.PANTRY_COPY || []).filter(function (l) { return l.pool === "merienda" && !l.when; });
    return all.length ? all[P.dayNumber() % all.length] : null;
  }

  // ---- sound ----------------------------------------------------------------

  function blip(from, to, ms) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
      o.frequency.setValueAtTime(from, t);
      o.frequency.exponentialRampToValueAtTime(to, t + ms / 1000);
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + ms / 1000);
    } catch (e) {}
  }

  function setSound(on) {
    soundOn = on;
    var b = $("sound");
    b.setAttribute("aria-pressed", String(on));
    b.querySelector("img").src = "assets/sprites/" + (on ? "sound_on" : "sound_off") + ".png";
  }

  // ---- drawing ----------------------------------------------------------------

  function px(x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  function rect(x0, y0, x1, y1, c) { ctx.fillStyle = c; ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1); }

  function drawCover(dy) {
    var rows = [[88, 88, 16, 36], [85, 87, 17, 35], [83, 84, 19, 33], [82, 82, 22, 30]];
    rows.forEach(function (r) {
      for (var y = r[0]; y <= r[1]; y++) {
        for (var x = r[2]; x <= r[3]; x++) {
          px(x, y + dy, x === r[2] || x === r[3] ? C.ink : ((x + y) % 2 === 0 ? C.yellow : C.orange));
        }
      }
    });
    rect(22, 81 + dy, 30, 81 + dy, C.ink);
    rect(24, 78 + dy, 28, 81 + dy, C.ink);
    rect(25, 79 + dy, 27, 80 + dy, C.red);
  }

  function drawFood() {
    [[18, 24], [23, 29], [28, 34]].forEach(function (f) {
      rect(f[0] + 1, 85, f[1] - 1, 85, C.ink);
      rect(f[0], 86, f[1], 88, C.ink);
      rect(f[0] + 1, 86, f[1] - 1, 87, C.orange);
      px(f[0] + 2, 86, C.yellow);
    });
  }

  function drawCoffee() {
    // hint arrow over the next thing to tap
    var hint = null;
    if (coffee.step === 0 && !counts.coffee) hint = [18, 35];
    else if (coffee.step === 1) hint = [7, 27];
    else if (coffee.step === 2) hint = [27, 38];
    if (hint && !parcelOpen) {
      var y = hint[1] + (frame % 2);
      rect(hint[0] - 1, y, hint[0] + 1, y, C.red);
      px(hint[0], y + 1, C.red);
    }
    if (coffee.step === 1) { px(27, 43, C.brown); px(28, 43, C.brown); }
    if (coffee.step >= 2) rect(26, 44, 29, 44, C.brown);
    if (coffee.step === 2) {
      // spoon, leaning the other way on each stir
      var left = coffee.stirs % 2 === 1;
      for (var i = 0; i < 4; i++) px(left ? 26 - i : 29 + i, 43 - i, C.steel);
    }
    if (coffee.pour > 0) {
      // bubble rising in the bottle while the mug fills
      px(7, 37 - (4 - coffee.pour), C.white);
      px(5, 46, C.blue); px(5, 47, C.blue);
    }
    if (coffee.step === 3) {
      var f = still ? 0 : frame % 3;
      var steam = [
        [[26, 42], [27, 41], [26, 40], [29, 42], [28, 39]],
        [[27, 42], [26, 41], [27, 39], [29, 41], [28, 40]],
        [[26, 42], [27, 40], [26, 38], [29, 42], [29, 40]]
      ][f];
      steam.forEach(function (s) { px(s[0], s[1], C.grey); });
    }
  }

  var LIGHTS = [[35, 23], [37, 28], [41, 19], [43, 25], [40, 29], [49, 25], [50, 29], [54, 17], [57, 22], [53, 27], [56, 29], [34, 28]];

  function drawWindow() {
    // brake lights on a stalled EDSA
    if (!still && frame % 4 < 2) { px(35, 32, C.dark); px(51, 32, C.dark); }
    for (var i = 0; i < Math.min(litWindows, LIGHTS.length); i++) px(LIGHTS[i][0], LIGHTS[i][1], C.yellow);
    if (P.rainy()) {
      var f = still ? 0 : frame;
      for (var y = 9; y <= 30; y++) {
        for (var x = 33; x <= 58; x++) {
          if (x === 45 || x === 46) continue;
          if ((x * 7 + y * 3 + f * 3) % 31 === 0) { px(x, y, C.white); }
        }
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 90, 130);
    drawWindow();
    drawCoffee();
    if (coverUp) { drawFood(); drawCover(-13); } else drawCover(0);
  }

  // ---- stations -------------------------------------------------------------

  function tapCoffee(spot) {
    if (spot === "sachet" && (coffee.step === 0 || coffee.step === 3)) {
      coffee.step = 1; coffee.stirs = 0;
      blip(900, 500, 50);
    } else if (spot === "dispenser" && coffee.step === 1) {
      coffee.step = 2; coffee.pour = 4;
      blip(300, 180, 250);
    } else if (spot === "mug" && coffee.step === 2) {
      coffee.stirs++;
      blip(1400, 1200, 40);
      if (coffee.stirs >= STIRS) {
        coffee.step = 3;
        counts.coffee = (counts.coffee || 0) + 1;
        save();
        var l = line("coffee");
        if (l) P.say(l.text);
      }
    }
    draw();
  }

  function tapMerienda() {
    coverUp = !coverUp;
    if (coverUp) {
      var m = meriendaOfTheDay();
      if (m) {
        counts.merienda = m.item;
        save();
        P.say(m.item + ". " + m.text);
      }
    }
    blip(500, 700, 60);
    draw();
  }

  function tapWindow() {
    if (watch) { stopWatch(); return; }
    watch = { start: P.now(), base: counts.window || 0 };
    $("window-count").hidden = false;
    updateWatch();
  }

  function updateWatch() {
    if (!watch) return;
    var secs = Math.floor((P.now() - watch.start) / 1000);
    if (watch.base + secs !== counts.window) {
      counts.window = watch.base + secs;
      save();
    }
    litWindows = Math.floor(counts.window / 5);
    $("window-count").textContent = counts.window + " s";
  }

  function stopWatch() {
    if (!watch) return;
    updateWatch();
    watch = null;
    $("window-count").hidden = true;
  }

  function newSheet() {
    var grid = $("wrap-grid");
    grid.textContent = "";
    for (var i = 0; i < 35; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "bubble";
      b.setAttribute("aria-label", "Bubble");
      grid.appendChild(b);
    }
    var l = line("parcel");
    if (l) P.say(l.text);
  }

  function tapParcel() {
    parcelOpen = true;
    $("wrap").hidden = false;
    if (!$("wrap-grid").children.length) newSheet();
    draw();
  }

  function closeParcel() {
    parcelOpen = false;
    $("wrap").hidden = true;
    draw();
  }

  function pop(b) {
    if (b.disabled) return;
    b.disabled = true;
    b.setAttribute("aria-label", "Bubble, popped");
    counts.bubbles = (counts.bubbles || 0) + 1;
    save();
    blip(420 + Math.random() * 200, 110, 70);
    if (!$("wrap-grid").querySelector(".bubble:not(:disabled)")) {
      setTimeout(function () { if (parcelOpen) newSheet(); }, 500);
    }
  }

  function tapDetail(object) {
    var l = line("background", object);
    if (l) P.say(l.text);
  }

  // ---- taps ---------------------------------------------------------------------

  function tapIcon(e, name) {
    if (e.pointerType !== "touch" || !name) return;
    var img = document.createElement("img");
    img.className = "tap-icon";
    img.alt = "";
    img.src = "assets/cursors/" + name + ".png";
    img.style.left = e.clientX + "px";
    img.style.top = e.clientY + "px";
    document.body.appendChild(img);
    setTimeout(function () { img.remove(); }, 650);
  }

  function onSpot(e) {
    var b = e.currentTarget, spot = b.dataset.spot;
    if (!active()) return;
    if (spot !== "window") stopWatch();
    if (spot === "sachet" || spot === "dispenser" || spot === "mug") tapCoffee(spot);
    else if (spot === "merienda") tapMerienda();
    else if (spot === "parcel") tapParcel();
    else if (spot === "window") tapWindow();
    else tapDetail(spot);
  }

  function reset() {
    used = {};
    coffee = { step: 0, stirs: 0, pour: 0 };
    coverUp = false;
    watch = null;
    litWindows = 0;
    parcelOpen = false;
    $("wrap").hidden = true;
    $("wrap-grid").textContent = "";
    $("window-count").hidden = true;
  }

  function init() {
    fx = $("fx");
    ctx = fx.getContext("2d");
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    load();
    setSound(P.store.get(SOUND_KEY) === "1");

    var spots = document.querySelectorAll("#room .spot");
    for (var i = 0; i < spots.length; i++) {
      spots[i].addEventListener("click", onSpot);
      spots[i].addEventListener("pointerdown", function (e) { tapIcon(e, e.currentTarget.dataset.cursor); });
    }
    $("wrap-grid").addEventListener("click", function (e) {
      if (e.target.classList.contains("bubble") && active()) pop(e.target);
    });
    $("wrap-grid").addEventListener("pointerdown", function (e) {
      if (e.target.classList.contains("bubble")) tapIcon(e, "finger");
    });
    $("wrap-close").addEventListener("click", closeParcel);
    $("sound").addEventListener("click", function () {
      setSound(!soundOn);
      P.store.set(SOUND_KEY, soundOn ? "1" : "0");
      blip(600, 900, 80);
    });
    // Touching anything other than the window ends the quiet count.
    document.addEventListener("pointerdown", function (e) {
      if (watch && !(e.target.closest && e.target.closest('[data-spot="window"]'))) stopWatch();
    }, true);

    document.addEventListener("pantry:enter", function () { reset(); load(); draw(); });
    document.addEventListener("pantry:close", function () { reset(); });

    draw();
    setInterval(function () {
      if (!active()) return;
      updateWatch();
      if (coffee.pour > 0) coffee.pour--;
      if (!still) frame++;
      draw();
    }, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
