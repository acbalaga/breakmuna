// Stations, background objects, tap icons and sound.
// Everything that moves is drawn on the #fx canvas, one art pixel at a time.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var $ = function (id) { return document.getElementById(id); };

  var C = {
    ink: "#1f1a24", white: "#f4f0e6", grey: "#c8c8c8", brown: "#6b4a32",
    red: "#c8483c", orange: "#e08a3c", yellow: "#f0cc5a", wood: "#b98a5a",
    blue: "#4a8fd0", dark: "#55555e", steel: "#8c8c94", sky: "#8cc4e8", wall: "#e8dcc0", green: "#5a9a52"
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
  var coverDy = 0;            // food cover offset, steps toward 0 or -13
  var shake = 0;              // frames left of the sachet being emptied
  var mwave = 0;              // frames left of the microwave running
  var spark = null;           // { x, y, n } tap flash on a background object
  var mini = null;            // which mini panel is open: aircon, ref, bulletin, microwave
  var ac = { temp: 18, idle: 0 };
  var mw = { set: 0, secs: 0, endAt: 0, queue: 0, queueAt: 0, item: "bread" };
  var secret = { code: false, taken: false, slip: false, ring: false, key: false };
  var cab = [false, false, false, false];   // which cabinets are open
  var catAwake = 0;                         // frames the cat stays awake after a tap   // the hidden case, see the secret pool in data/copy.js
  var watch = null;           // { start, base } while at the window
  var litWindows = 0;
  var parcelOpen = false;
  var soundOn = false;
  var audio = null;
  var cond = {};
  var stirsNeeded = STIRS;

  function active() { return document.body.dataset.view === "break"; }

  function save() { P.store.set(COUNTS_KEY, JSON.stringify(counts)); }
  function load() {
    try { counts = JSON.parse(P.store.get(COUNTS_KEY)) || {}; } catch (e) { counts = {}; }
  }

  // ---- copy ---------------------------------------------------------------

  // A random unused line for a station or object. No line repeats within a single break.
  // Condition lines tagged with the same object join in while their condition is active.
  function line(pool, object) {
    var key = object || pool;
    return P.choose(P.lines(function (l) {
      if (l.pool === "condition") return l.object === key;
      return l.pool === pool && (!object || l.object === object);
    }), used);
  }

  // Picked by date, so officemates see the same item on the same day.
  // Payday and petsa de peligro swap in their own items.
  function meriendaOfTheDay() {
    var all = P.lines(function (l) { return l.pool === "merienda"; });
    var timely = all.filter(function (l) { return l.when; });
    var from = timely.length ? timely : all;
    return from.length ? from[P.dayNumber() % from.length] : null;
  }

  // Said once on entering the room, when the day or hour has something to say.
  function greet() {
    var lines = P.lines(function (x) { return x.pool === "condition" && !x.object; });
    // on a weekend the pantry always says why you are here
    var weekend = lines.filter(function (x) { return x.when.indexOf("weekend") !== -1 && !used[x.id]; });
    var l = P.choose(weekend.length ? weekend : lines, used);
    if (l) P.say(l.text);
  }

  // Lighting follows the clock.
  function applyConditions() {
    var room = $("room"), on = P.conditions();
    function has(c) { return on.indexOf(c) !== -1; }
    room.classList.toggle("subdued", has("monday_morning") || has("weekend"));
    room.classList.toggle("half-lit", has("overtime"));
    var d = new Date(P.now()), mins = d.getHours() * 60 + d.getMinutes();
    cond = { lunch: has("lunch_rush"), merienda: has("merienda_hour"), night: has("overtime"), parol: has("ber_months"),
             dusk: mins >= 17 * 60 && mins < 18 * 60 + 30 };
    stirsNeeded = has("monday_morning") ? 5 : STIRS;
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
    if (hint && !parcelOpen && !mini) {
      var y = hint[1] + (frame % 2);
      rect(hint[0] - 1, y, hint[0] + 1, y, C.red);
      px(hint[0], y + 1, C.red);
    }
    if (shake > 0) {
      // sachet tipped over the mug, powder falling
      rect(26, 37, 29, 40, C.ink); rect(27, 38, 28, 39, C.wood);
      px(27 + (shake % 2), 41, C.brown); px(28 - (shake % 2), 42, C.brown);
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

  function drawNight() {
    rect(33, 9, 58, 30, "#2c4f8a");
    [[33, 22, 38, 30], [39, 18, 44, 30], [47, 24, 51, 30], [52, 16, 58, 30]].forEach(function (b) {
      rect(b[0], b[1], b[2], b[3], C.ink);
    });
    [[34, 24], [36, 26], [37, 23], [40, 20], [42, 23], [41, 27], [43, 19], [40, 25], [48, 26], [50, 28],
     [49, 25], [53, 18], [56, 20], [54, 23], [57, 26], [55, 28], [57, 17], [53, 21]].forEach(function (w, i) {
      if (still || (i + (frame >> 3)) % 7) px(w[0], w[1], C.yellow);
    });
    // night traffic: tail lights one way, headlights the other, barely moving
    rect(33, 31, 58, 33, C.ink);
    var shift = still ? 0 : (frame >> 2) % 3;
    for (var x = 33; x <= 58; x++) {
      if ((x + shift) % 3 === 0) px(x, 31, C.red);
      if ((x + 3 - shift) % 4 === 0) px(x, 33, C.white);
    }
    rect(45, 9, 46, 33, C.white);
  }

  function drawParol() {
    px(52, 9, C.ink);
    [[52, 10, C.red], [51, 11, C.red], [52, 11, C.yellow], [53, 11, C.red],
     [50, 12, C.red], [51, 12, C.yellow], [52, 12, C.white], [53, 12, C.yellow], [54, 12, C.red],
     [51, 13, C.red], [52, 13, C.yellow], [53, 13, C.red], [52, 14, C.red],
     [51, 15, C.yellow], [53, 15, C.yellow], [51, 16, C.yellow], [53, 16, C.yellow]].forEach(function (p) {
      px(p[0], p[1], p[2]);
    });
  }

  // Lunch rush: baon containers waiting on top of the microwave.
  function drawQueue() {
    [[39, 35, 45, C.blue], [47, 35, 53, C.red], [55, 35, 58, C.yellow], [41, 32, 47, C.red], [49, 32, 55, C.blue]].forEach(function (b) {
      rect(b[0], b[1], b[2], b[1] + 3, C.ink);
      rect(b[0] + 1, b[1] + 1, b[2] - 1, b[1] + 2, C.white);
      rect(b[0] + 1, b[1] + 1, b[2] - 1, b[1] + 1, b[3]);
    });
  }

  // Merienda hour: the tray is the lit object in the room.
  function drawSparkle() {
    var pts = [[13, 80], [39, 79], [11, 87], [41, 86], [26, 74]];
    pts.forEach(function (p, i) {
      if (!still && (i + frame) % 2) return;
      px(p[0], p[1], C.white);
      px(p[0] - 1, p[1], C.yellow); px(p[0] + 1, p[1], C.yellow);
      px(p[0], p[1] - 1, C.yellow); px(p[0], p[1] + 1, C.yellow);
    });
  }

  // The hour before overtime: the sky goes orange and the towers go dark blue.
  function drawDusk() {
    rect(33, 9, 58, 14, C.orange); rect(33, 15, 58, 19, C.yellow); rect(33, 20, 58, 30, C.white);
    px(49, 17, C.white); px(50, 17, C.white); px(49, 18, C.white); px(50, 18, C.white);   // low sun
    [[33, 22, 38, 30], [39, 18, 44, 30], [47, 24, 51, 30], [52, 16, 58, 30]].forEach(function (b, i) {
      rect(b[0], b[1], b[2], b[3], i % 2 ? "#2c4f8a" : "#6a7a94");
    });
    [[34, 24], [40, 20], [42, 23], [48, 26], [53, 18], [56, 20], [54, 23], [57, 26]].forEach(function (w) { px(w[0], w[1], C.yellow); });
    rect(45, 9, 46, 33, C.white);
  }

  // A small plant on the windowsill. It leans a little, now and then.
  function drawPlant() {
    var lean = still ? 0 : [0, 0, 0, 1, 0, 0, 0, -1][(frame >> 2) % 8];
    rect(55, 32, 58, 33, C.ink); rect(56, 32, 57, 33, C.red);
    px(56, 31, C.green); px(57, 31, C.green);
    px(56 + lean, 30, C.green); px(57 + lean, 29, C.green); px(55 + lean, 29, C.green);
    px(56 + lean, 28, C.green);
  }

  function drawWindow() {
    if (cond.night) drawNight();
    else if (cond.dusk) drawDusk();
    if (!cond.night && !still) {
      if (!cond.dusk) {
      // clouds drift across both panes
      rect(35, 11, 39, 12, C.sky); rect(50, 12, 55, 13, C.sky);
      var drift = (frame >> 3) % 26;
      [[35, 11, 5], [50, 12, 6]].forEach(function (c) {
        for (var i = 0; i < c[2]; i++) {
          var x = 33 + (c[0] - 33 + i + drift) % 26;
          px(x, c[1], C.white); px(x, c[1] + 1, C.white);
        }
      });
      }
      // a stalled EDSA: cars creep one pixel at a time, brake lights blinking
      rect(33, 31, 58, 33, C.dark);
      var creep = Math.floor(frame / 10) % 26;
      [[35, C.red], [38, C.white], [41, C.red], [44, C.yellow], [48, C.yellow], [51, C.red], [55, C.white]].forEach(function (c, i) {
        var braking = c[1] === C.red && (frame + i * 3) % 8 < 2;
        px(33 + (c[0] - 33 + creep) % 26, 32, braking ? C.ink : c[1]);
      });
      rect(45, 9, 46, 33, C.white);
    }
    for (var i = 0; i < Math.min(litWindows, LIGHTS.length); i++) px(LIGHTS[i][0], LIGHTS[i][1], C.yellow);
    drawPlant();
    if (cond.parol) {
      drawParol();
      if (!still && frame % 6 < 3) px(52, 12, C.yellow);
    }
    if (P.rainy()) {
      // rain falls: short streaks sliding down every third column
      var f = still ? 0 : frame;
      for (var x = 33; x <= 58; x += 3) {
        if (x === 45) continue;
        for (var k = 0; k < 2; k++) {
          var y = 9 + (x * 13 + k * 11 + f * 3) % 22;
          px(x, y, C.grey);
          if (y < 30) px(x, y + 1, C.white);
        }
      }
    }
  }

  // Cabinets under the counter. An open one shows what is inside.
  var CABS = [[1, 14], [16, 30], [32, 46], [48, 62]];
  function drawCabinets() {
    CABS.forEach(function (c, i) {
      if (!cab[i]) return;
      rect(c[0], 55, c[1], 71, C.ink);
      rect(c[0], 55, c[0] + 1, 71, C.wood);                 // the door, swung open
      rect(c[0] + 2, 63, c[1], 63, C.brown);                // shelf
      var x = c[0] + 4;
      if (i === 0) {
        rect(x, 57, x + 1, 62, C.green); rect(x + 3, 58, x + 4, 62, C.blue); px(x, 56, C.white); px(x + 3, 57, C.white);
        rect(x + 6, 66, x + 9, 70, C.white); rect(x + 7, 67, x + 8, 67, C.steel); rect(x + 7, 69, x + 8, 69, C.steel);
      } else if (i === 1) {
        [C.blue, C.red, C.white, C.green, C.orange].forEach(function (col, k) { rect(x, 61 - k, x + 6, 61 - k, col); });
        [C.white, C.blue, C.red].forEach(function (col, k) { rect(x + 2, 70 - k * 2, x + 9, 70 - k * 2, col); });
      } else if (i === 2) {
        rect(x + 1, 66, x + 8, 70, C.white); rect(x + 2, 65, x + 7, 65, C.grey); px(x + 4, 64, C.grey); px(x + 5, 64, C.white);
        px(x + 3, 68, C.grey); px(x + 6, 67, C.grey);
        rect(x, 59, x + 4, 62, C.grey); px(x + 2, 58, C.white);
      } else {
        for (var k = 0; k < 3; k++) { rect(x + k * 4, 58, x + k * 4 + 2, 62, C.red); px(x + k * 4 + 1, 60, C.yellow); }
        for (k = 0; k < 4; k++) rect(x + k * 3, 65, x + k * 3, 70, C.white);
        rect(x + 12 - 12, 71, x + 10, 71, C.steel);
      }
    });
    if (!counts.solved2) {
      // padlock on the supply cabinet
      rect(48, 60, 50, 60, C.ink); px(48, 61, C.ink); px(50, 61, C.ink);
      rect(47, 62, 51, 65, C.ink); rect(48, 63, 50, 64, secret.key ? C.green : C.yellow);
      if (secret.slip && !secret.key) {
        // the slip on the counter, with its coffee ring once it has one
        rect(33, 48, 36, 49, C.white);
        if (secret.ring) px(34, 48, C.brown);
      }
      if (secret.key) { rect(33, 49, 36, 49, C.yellow); px(33, 48, C.yellow); px(36, 48, C.ink); }
    }
  }

  // The building cat, asleep on the floor. It breathes, and wakes for a moment when touched.
  function drawCat() {
    var breath = !still && !catAwake && (frame >> 2) % 2;
    rect(35, 122, 47, 127, C.ink); rect(36, 123, 46, 126, C.orange);          // body
    rect(37, 121 - breath, 45, 121 - breath, C.ink);
    if (breath) rect(37, 121, 45, 121, C.orange);
    px(39, 123, C.brown); px(42, 123, C.brown); px(45, 123, C.brown);         // stripes
    rect(30, 121, 36, 127, C.ink); rect(31, 122, 35, 126, C.orange);          // head
    px(31, 120, C.ink); px(35, 120, C.ink);
    px(33, 125, C.ink);                                                        // nose
    if (catAwake) {
      px(32, 123, C.green); px(34, 123, C.green);
      var up = (frame % 2);
      rect(48, 124 - up * 2, 48, 126, C.ink); px(49, 124 - up * 2, C.ink);    // tail flick
    } else {
      rect(32, 124, 32, 124, C.ink); px(34, 124, C.ink);                      // eyes shut
      rect(48, 126, 50, 126, C.ink);                                           // tail at rest
      if (!still) {
        var z = (frame >> 2) % 3;
        px(28 - z, 118 - z * 2, C.steel); px(29 - z, 118 - z * 2, C.steel); px(28 - z, 119 - z * 2, C.steel);
      }
    }
  }

  // Small things that keep the room alive between taps.
  function drawAmbient() {
    if (still) return;
    // aircon: LED blink and air coming off the louver
    if (frame % 12 === 0) px(23, 5, C.white);
    var a = frame % 4;
    px(7 + a * 2, 12, C.grey); px(15 + a * 2, 13, C.grey); px(21 - a, 12, C.grey);
    // water dispenser: a bubble rises in the bottle now and then
    var b = frame % 36;
    if (b < 4 && coffee.pour === 0) px(7, 38 - b, C.white);
    // microwave: running during lunch rush, or for a few seconds after a tap
    if (mwave > 0 || cond.lunch) {
      rect(40, 42, 50, 46, frame % 2 ? C.yellow : C.orange);
      var plate = [0, 1, 2, 1][frame % 4];
      rect(43 + plate, 45, 46 + plate, 45, C.ink);
      rect(44 + plate, 44, 45 + plate, 44, C.brown);
      rect(54, 41, 57, 42, frame % 4 < 2 ? C.green : C.white);
    }
  }

  // Tap flash on a background object: a plus sign that opens out, two frames.
  function drawSpark() {
    if (!spark) return;
    var r = spark.n === 2 ? 2 : 4, c = spark.n === 2 ? C.white : C.yellow;
    px(spark.x - r, spark.y, c); px(spark.x + r, spark.y, c);
    px(spark.x, spark.y - r, c); px(spark.x, spark.y + r, c);
    if (spark.n === 1) { px(spark.x - 3, spark.y - 3, c); px(spark.x + 3, spark.y - 3, c); px(spark.x - 3, spark.y + 3, c); px(spark.x + 3, spark.y + 3, c); }
  }

  var CENTER = { microwave: [48, 44], ref: [76, 55], aircon: [45, 89], bulletin: [12, 22], clock: [76, 16] };

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 90, 130);
    drawWindow();
    drawCabinets();
    drawCat();
    if (cond.lunch) drawQueue();
    if (cond.merienda && coverDy === 0) drawSparkle();
    drawCoffee();
    if (coverDy < 0) drawFood();
    drawCover(coverDy);
    drawAmbient();
    drawSpark();
  }

  // ---- stations -------------------------------------------------------------

  function tapCoffee(spot) {
    if (spot === "sachet" && (coffee.step === 0 || coffee.step === 3)) {
      coffee.step = 1; coffee.stirs = 0; shake = still ? 0 : 3;
      blip(900, 500, 50);
    } else if (spot === "dispenser" && coffee.step === 1) {
      coffee.step = 2; coffee.pour = 4;
      blip(300, 180, 250);
    } else if (spot === "mug" && coffee.step === 2) {
      coffee.stirs++;
      blip(1400, 1200, 40);
      if (coffee.stirs >= stirsNeeded) {
        coffee.step = 3;
        counts.coffee = (counts.coffee || 0) + 1;
        save();
        if (secret.slip && !secret.ring && !counts.solved2) {
          // the mug goes down on the slip
          secret.ring = true;
          blip(500, 900, 200);
          P.say(copyById("secret2-ring"));
        } else {
          var l = line("coffee");
          if (l) P.say(l.text);
        }
      }
    }
    draw();
  }

  function tapMerienda() {
    coverUp = !coverUp;
    if (still) coverDy = coverUp ? -13 : 0;
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
    if (secret.ring && !secret.key && !counts.solved2 && secs >= 20) {
      // the slip is processed while nobody is looking
      secret.key = true;
      blip(900, 1300, 200);
      P.say(copyById("secret2-key"));
      draw();
    }
  }

  function stopWatch() {
    if (!watch) return;
    updateWatch();
    watch = null;
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
    closeMini();
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
      // a whole sheet popped: a requisition slip for the supply key was taped underneath
      var found = !secret.slip && !counts.solved2;
      if (found) secret.slip = true;
      setTimeout(function () {
        if (parcelOpen) newSheet();
        if (found) { blip(900, 1300, 200); P.say(copyById("secret2-slip")); draw(); }
      }, 500);
    }
  }

  function tapCat() {
    catAwake = still ? 1 : 10;
    blip(180, 150, 400);
    var l = P.choose(P.lines(function (x) { return x.pool === "cat"; }), used);
    if (l) P.say(l.text);
    draw();
  }

  function tapCabinet(i) {
    if (i === 3 && !counts.solved2) {
      if (!secret.key) {
        blip(200, 180, 80);
        P.say(copyById(secret.ring ? "cab-4-wait" : secret.slip ? "cab-4-slip" : "cab-4-locked"));
        return;
      }
      counts.solved2 = true;
      save();
      cab[3] = true;
      blip(600, 1200, 300);
      P.say(copyById("secret2-solved"));
      draw();
      return;
    }
    cab[i] = !cab[i];
    blip(cab[i] ? 260 : 200, cab[i] ? 320 : 160, 70);
    if (cab[i]) P.say(copyById(i === 3 ? "cab-4-open" : "cab-" + (i + 1)));
    draw();
  }

  function tapDetail(object) {
    if (!still && CENTER[object]) spark = { x: CENTER[object][0], y: CENTER[object][1], n: 2 };
    draw();
    if (MINI[object]) openMini(object);
    if (object === "bulletin") return;      // the notices speak for the board
    var l = line("background", object);
    if (l) P.say(l.text);
  }

  // ---- mini panels ----------------------------------------------------------

  function node(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    if (tag === "button") n.type = "button";
    return n;
  }
  function key(text, label, fn) {
    var b = node("button", "ctl", text);
    b.setAttribute("aria-label", label);
    b.addEventListener("click", function () { if (active()) fn(); });
    return b;
  }
  function mmss(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  var MINI = {
    // Change the temperature. Someone unseen sets it back to 18.
    aircon: {
      label: "Aircon remote",
      build: function (body) {
        var remote = node("div", "remote"), lcd = node("div", "lcd"), keys = node("div", "keys");
        lcd.id = "ac-lcd";
        function press(d) {
          ac.temp = Math.max(16, Math.min(30, ac.temp + d));
          ac.idle = 0;
          blip(d > 0 ? 700 : 500, d > 0 ? 800 : 400, 50);
          MINI.aircon.show();
        }
        keys.appendChild(key("\u25BC", "Cooler", function () { press(-1); }));
        keys.appendChild(key("\u25B2", "Warmer", function () { press(1); }));
        remote.appendChild(lcd); remote.appendChild(keys); body.appendChild(remote);
        MINI.aircon.show();
      },
      show: function () { var l = $("ac-lcd"); if (l) l.textContent = ac.temp + "\u00B0C"; },
      tick: function () {
        if (ac.temp === 18) return;
        ac.idle++;
        if (ac.temp === 25 && ac.idle === 5 && !secret.code && mini === "aircon") {
          secret.code = true;
          blip(300, 900, 200);
          P.say(copyById("secret-code"));
        }
        if (ac.idle < 12) return;
        ac.temp += ac.temp > 18 ? -1 : 1;
        MINI.aircon.show();
        if (ac.temp === 18) {
          blip(500, 400, 120);
          if (mini === "aircon") P.say(copyById("bg-14"));
        }
      }
    },

    // Open the ref. Each thing inside opens for a moment and reads its label.
    ref: {
      label: "Inside the ref",
      build: function (body) {
        var inside = node("div", "ref-inside");
        var items = P.lines(function (x) { return x.pool === "ref_item"; });
        [[0, 5, 1, 3], [4, 2, 6, 7]].forEach(function (row) {
          var shelf = node("div", "shelf");
          row.forEach(function (n) {
            var it = items.filter(function (x) { return x.sprite === n; })[0];
            var b = node("button", "baon");
            b.style.setProperty("--row", n);
            b.setAttribute("aria-label", it ? it.text : "Container");
            var october = n === 2;
            if (october && secret.taken) b.classList.add("gone");
            if (october && secret.code && !secret.taken && !counts.solved) b.classList.add("glint");
            b.addEventListener("click", function () {
              if (!active()) return;
              if (october && secret.code && !secret.taken && !counts.solved) {
                secret.taken = true;
                if (!mw.endAt && !mw.queue) mw.item = "october";
                b.classList.remove("glint");
                b.classList.add("gone");
                blip(400, 700, 120);
                P.say(copyById("secret-take"));
                return;
              }
              b.classList.remove("open");
              void b.offsetWidth;            // restart the hop
              b.classList.add("open");
              clearTimeout(b._t);
              b._t = setTimeout(function () { b.classList.remove("open"); }, 1400);
              blip(300, 260, 60);
              if (it) P.say(it.text);
            });
            shelf.appendChild(b);
          });
          inside.appendChild(shelf);
        });
        for (var i = 0; i < 3; i++) inside.appendChild(node("span", "mist m" + i));
        body.appendChild(inside);
      }
    },

    // Unpin the notices one at a time. Each pile is two deep.
    // Under the first pile there is always a handwritten scrap.
    bulletin: {
      label: "Bulletin board",
      build: function (body) {
        var board = node("div", "board");
        var left = P.lines(function (l) {
          return (l.pool === "background" || l.pool === "condition") && l.object === "bulletin" && !used[l.id];
        }).length;
        var total = Math.min(8, left), n = 0;
        for (var i = 0; i < 4; i++) {
          var pile = node("div", "pile");
          var deep = Math.min(2, Math.ceil((total - i) / 4));
          for (var d = deep - 1; d >= 0; d--) {
            var note = node("button", "note n" + (n++ % 3) + (d ? " under" : ""));
            note.setAttribute("aria-label", "Notice");
            note.addEventListener("click", function (e) {
              if (!active()) return;
              var t = e.currentTarget, p = t.parentNode;
              t.remove();
              if (p.lastChild) p.lastChild.classList.remove("under");
              blip(800, 500, 60);
              var l = line("background", "bulletin");
              if (l) P.say(l.text);
            });
            pile.insertBefore(note, pile.firstChild);
          }
          if (i === 0) {
            var scrap = node("button", "note scrap");
            scrap.setAttribute("aria-label", "Handwritten scrap");
            scrap.addEventListener("click", function () {
              if (!active()) return;
              blip(500, 600, 60);
              P.say(copyById("secret-note"));
            });
            pile.insertBefore(scrap, pile.firstChild);
          }
          board.appendChild(pile);
        }
        body.appendChild(board);
      }
    },

    // Pick what goes in, set a time, press start, wait for the ding.
    // At lunch there is a queue first.
    microwave: {
      label: "Microwave",
      build: function (body) {
        var items = node("div", "mw-items");
        var m = meriendaOfTheDay();
        var choices = [["bread", "Bread"], ["merienda", m ? m.item : "Merienda"]];
        if (secret.taken && !counts.solved) choices.push(["october", "October baon"]);
        choices.forEach(function (c) {
          var b = key(c[1], "Heat: " + c[1], function () {
            if (mw.endAt || mw.queue) return;
            mw.item = c[0];
            blip(700, 700, 40);
            MINI.microwave.show();
          });
          b.dataset.item = c[0];
          items.appendChild(b);
        });
        var box = node("div", "mw"), win = node("div", "mw-window"), side = node("div", "mw-side"), lcd = node("div", "lcd");
        win.id = "mw-window"; lcd.id = "mw-lcd";
        var food = node("div", "mw-food"); food.id = "mw-food";
        win.appendChild(food);
        win.appendChild(node("div", "mw-plate"));
        side.appendChild(lcd);
        side.appendChild(key("+10 s", "Add ten seconds", function () {
          if (mw.endAt || mw.queue) return;
          mw.set = Math.min(120, mw.set + 10);
          blip(900, 900, 40);
          MINI.microwave.show();
        }));
        side.appendChild(key("Start", "Start", function () {
          if (mw.endAt || mw.queue || !mw.set) return;
          blip(600, 600, 60);
          mw.secs = mw.set;
          if (cond.lunch) { mw.queue = 3; mw.queueAt = P.now(); }
          else mw.endAt = P.now() + mw.set * 1000;
          MINI.microwave.show();
        }));
        box.appendChild(win); box.appendChild(side);
        body.appendChild(items); body.appendChild(box);
        MINI.microwave.show();
      },
      show: function () {
        var lcd = $("mw-lcd"), win = $("mw-window");
        if (!lcd) return;
        if (mw.queue) lcd.textContent = "Queue " + mw.queue;
        else lcd.textContent = mmss(mw.endAt ? Math.max(0, Math.ceil((mw.endAt - P.now()) / 1000)) : mw.set);
        win.classList.toggle("running", !!mw.endAt);
        $("mw-food").className = "mw-food " + mw.item;
        var bs = document.querySelectorAll(".mw-items .ctl");
        for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", String(bs[i].dataset.item === mw.item));
      }
    }
  };

  function copyById(id) {
    var l = (window.PANTRY_COPY || []).filter(function (x) { return x.id === id; })[0];
    return l ? l.text : "";
  }

  // What the microwave says when it is done, by what went in and for how long.
  function microwaveDone() {
    if (mw.item === "october") {
      if (mw.secs === 50) {
        counts.solved = true;
        save();
        mw.item = "bread";
        blip(600, 1200, 300);
        P.say(copyById("secret-solved"));
        if (mini === "microwave") openMini("microwave");
      } else P.say(copyById("secret-wrong"));
      return;
    }
    var l = P.lines(function (x) {
      return x.pool === "microwave_result" && x.item === mw.item && mw.secs >= x.min && mw.secs <= x.max;
    })[0];
    if (l) P.say(l.text);
  }

  // Runs every frame whether or not the panel is open, so a started microwave still finishes.
  function tickMini() {
    MINI.aircon.tick();
    if (mw.queue && P.now() - mw.queueAt >= 2000) {
      mw.queueAt = P.now();
      if (--mw.queue === 0) mw.endAt = P.now() + mw.set * 1000;
    }
    if (mw.endAt) {
      mwave = 2;
      if (P.now() >= mw.endAt) {
        mw.endAt = 0; mw.set = 0; mwave = 0;
        blip(1500, 1400, 180);   // ding
        microwaveDone();
      }
    }
    MINI.microwave.show();
  }

  function openMini(kind) {
    closeParcel();
    mini = kind;
    var body = $("mini-body");
    body.textContent = "";
    $("mini").setAttribute("aria-label", MINI[kind].label);
    MINI[kind].build(body);
    $("mini").hidden = false;
    draw();
  }

  function closeMini() {
    mini = null;
    $("mini").hidden = true;
    $("mini-body").textContent = "";
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
    else if (spot === "cat") tapCat();
    else if (spot.indexOf("cab") === 0) tapCabinet(+spot.charAt(3) - 1);
    else tapDetail(spot);
  }

  function reset() {
    used = {};
    coffee = { step: 0, stirs: 0, pour: 0 };
    coverUp = false;
    coverDy = 0; shake = 0; mwave = 0; spark = null;
    closeMini();
    ac = { temp: 18, idle: 0 };
    mw = { set: 0, secs: 0, endAt: 0, queue: 0, queueAt: 0, item: "bread" };
    secret = { code: false, taken: false, slip: false, ring: false, key: false };
    cab = [false, false, false, false];
    catAwake = 0;
    watch = null;
    litWindows = 0;
    parcelOpen = false;
    $("wrap").hidden = true;
    $("wrap-grid").textContent = "";
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
    $("mini-close").addEventListener("click", closeMini);
    $("sound").addEventListener("click", function () {
      setSound(!soundOn);
      P.store.set(SOUND_KEY, soundOn ? "1" : "0");
      blip(600, 900, 80);
    });
    // Touching anything other than the window ends the quiet count.
    document.addEventListener("pointerdown", function (e) {
      if (watch && !(e.target.closest && e.target.closest('[data-spot="window"]'))) stopWatch();
    }, true);

    document.addEventListener("pantry:enter", function () { reset(); load(); applyConditions(); greet(); draw(); });
    document.addEventListener("pantry:close", function () { reset(); });

    applyConditions();
    draw();
    setInterval(function () {
      if (!active()) return;
      if (frame % 8 === 0) applyConditions();
      updateWatch();
      if (coffee.pour > 0) coffee.pour--;
      if (shake > 0) shake--;
      tickMini();
      if (catAwake > 0) catAwake--;
      if (spark && --spark.n < 0) spark = null;
      var goal = coverUp ? -13 : 0;
      if (coverDy !== goal) coverDy = coverUp ? Math.max(goal, coverDy - 5) : Math.min(goal, coverDy + 5);
      if (!still) frame++;
      draw();
    }, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
