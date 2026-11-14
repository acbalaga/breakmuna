// Break engine: door, 5:00 timer, close, 30-minute cooldown, storage.
// Time is always derived from stored timestamps, never from a running counter.
(function () {
  var P = (window.Pantry = window.Pantry || {});

  var BREAK_MS = 300 * 1000;
  var WARN_MS = 270 * 1000;
  var COOLDOWN_MS = 1800 * 1000;
  var KEY = {
    start: "pantry.breakStart",
    end: "pantry.breakEnd",
    counts: "pantry.counts",
    last: "pantry.lastReceipt"
  };

  // Storage wrapper. Falls back to memory when storage is blocked, so the
  // site still works and simply forgets the cooldown on reload.
  var mem = {};
  var store = (P.store = {
    get: function (k) {
      if (k in mem) return mem[k];
      try { return localStorage.getItem(k); } catch (e) { return null; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, String(v)); delete mem[k]; } catch (e) { mem[k] = String(v); }
    },
    remove: function (k) {
      delete mem[k];
      try { localStorage.removeItem(k); } catch (e) {}
    }
  });

  function num(k) {
    var v = parseInt(store.get(k), 10);
    return isFinite(v) ? v : null;
  }
  function json(k) {
    try { return JSON.parse(store.get(k)); } catch (e) { return null; }
  }

  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  var view = null;       // "landing" | "break" | "closing" | "cooldown"
  var warned = false;
  var lastElapsed = 0;
  var lastSecond = -1;

  // Where the stored timestamps say we are.
  function phase() {
    var now = P.now(), s = num(KEY.start), e = num(KEY.end);
    if (s === null || now < s) return { name: "landing" };
    if (e === null) {
      if (now - s < BREAK_MS) return { name: "break", elapsed: now - s };
      return { name: "overdue", end: s + BREAK_MS };
    }
    if (now < e + COOLDOWN_MS) return { name: "cooldown", reopen: e + COOLDOWN_MS };
    return { name: "landing" };
  }

  function pick(pool) {
    var lines = (window.PANTRY_COPY || []).filter(function (l) { return l.pool === pool && !l.when; });
    return lines.length ? lines[Math.floor(Math.random() * lines.length)].text : "";
  }

  function say(text) {
    el.dialog.textContent = text;
    el.dialog.hidden = !text;
  }
  P.say = say;

  function show(name) {
    view = name;
    var inRoom = name === "break" || name === "closing";
    el.room.hidden = !inRoom;
    el.door.hidden = inRoom;
    document.body.dataset.view = name;
  }

  // ---- landing and cooldown -------------------------------------------

  function showLanding() {
    show("landing");
    el.sign.hidden = true;
    el.lastReceipt.hidden = true;
    el.doorBtn.disabled = false;
    el.doorBtn.setAttribute("aria-label", "Pantry door. Tap to start a five minute break.");
    say(pick("landing"));
  }

  function showCooldown(reopen) {
    show("cooldown");
    el.sign.hidden = false;
    el.doorBtn.disabled = true;
    el.doorBtn.setAttribute("aria-label", "Pantry door, closed.");
    el.lastReceipt.hidden = !json(KEY.last);
    var line = pick("door");
    say((line ? line + "\n" : "") + "Pantry reopens at " + P.formatClock(reopen) + ".");
  }

  // ---- break ------------------------------------------------------------

  function enter() {
    if (phase().name !== "landing") return;
    store.set(KEY.start, P.now());
    store.remove(KEY.end);
    store.set(KEY.counts, "{}");
    startBreakView();
    document.dispatchEvent(new CustomEvent("pantry:enter"));
  }

  function startBreakView() {
    warned = false;
    lastElapsed = 0;
    lastSecond = -1;
    el.room.classList.remove("lights-off", "flicker");
    el.countdown.hidden = true;
    setSpots(true);
    say("");
    show("break");
    tick();
  }

  function setSpots(on) {
    var spots = el.room.querySelectorAll(".spot");
    for (var i = 0; i < spots.length; i++) spots[i].disabled = !on;
    el.exit.disabled = !on;
    $("sound").disabled = !on;
  }

  // Ends the break at the given time, stores the receipt, shows the closed door.
  function finish(end) {
    var s = num(KEY.start);
    if (s === null) return;
    var receipt = { start: s, end: end, reopen: end + COOLDOWN_MS, counts: json(KEY.counts) || {} };
    store.set(KEY.end, end);
    store.set(KEY.last, JSON.stringify(receipt));
    document.dispatchEvent(new CustomEvent("pantry:close", { detail: receipt }));
    showCooldown(receipt.reopen);
    openReceipt();
  }

  function lightsOut() {
    show("closing");
    setSpots(false);
    el.countdown.hidden = true;
    el.room.classList.add("lights-off");
    drawHands(BREAK_MS);
    var end = num(KEY.start) + BREAK_MS;
    setTimeout(function () { finish(end); }, 1400);
  }

  // ---- wall clock ---------------------------------------------------------

  function line(ctx, x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy;
    for (;;) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  // Long hand: one full turn over the break. Short red hand: seconds.
  function drawHands(elapsed) {
    var ctx = el.hands.getContext("2d");
    ctx.clearRect(0, 0, 17, 17);
    var secs = Math.floor(elapsed / 1000);
    var a = (secs % 60) / 60 * 2 * Math.PI;
    ctx.fillStyle = "#c8483c";
    line(ctx, 8, 8, 8 + Math.round(Math.sin(a) * 3), 8 - Math.round(Math.cos(a) * 3));
    a = Math.min(elapsed, BREAK_MS) / BREAK_MS * 2 * Math.PI;
    ctx.fillStyle = "#1f1a24";
    line(ctx, 8, 8, 8 + Math.round(Math.sin(a) * 5), 8 - Math.round(Math.cos(a) * 5));
  }

  // ---- tick ---------------------------------------------------------------

  function tick() {
    var p = phase();

    if (view === "break") {
      if (p.name !== "break") { lightsOut(); return; }
      var second = Math.floor(p.elapsed / 1000);
      if (second !== lastSecond) {
        lastSecond = second;
        drawHands(p.elapsed);
        if (p.elapsed >= WARN_MS) {
          var left = Math.max(0, Math.ceil((BREAK_MS - p.elapsed) / 1000));
          el.countdown.textContent = "0:" + String(left).padStart(2, "0");
          el.countdown.hidden = false;
        }
      }
      if (p.elapsed >= WARN_MS && !warned) {
        warned = true;
        // Flicker once, and only if the warning point was crossed while watching.
        if (lastElapsed > 0 && lastElapsed < WARN_MS) {
          el.room.classList.add("flicker");
          document.dispatchEvent(new CustomEvent("pantry:warning"));
        }
      }
      lastElapsed = p.elapsed;
      return;
    }

    if (view === "cooldown" && p.name === "landing") {
      closeReceipt();
      showLanding();
    }
  }

  // ---- receipt slip ---------------------------------------------------------

  function openReceipt() {
    var r = json(KEY.last);
    if (!r) return;
    el.receiptText.textContent = P.receiptText(r);
    el.receipt.hidden = false;
    el.receiptClose.focus();
  }
  function closeReceipt() {
    el.receipt.hidden = true;
  }

  // ---- init -------------------------------------------------------------------

  function init() {
    ["room", "door", "dialog", "sign", "countdown", "exit", "hands", "receipt"].forEach(function (id) { el[id] = $(id); });
    el.doorBtn = $("door-btn");
    el.lastReceipt = $("last-receipt");
    el.receiptText = $("receipt-text");
    el.receiptClose = $("receipt-close");

    el.doorBtn.addEventListener("click", enter);
    el.exit.addEventListener("click", function () {
      if (view === "break" && phase().name === "break") finish(P.now());
    });
    el.lastReceipt.addEventListener("click", openReceipt);
    el.receiptClose.addEventListener("click", closeReceipt);

    var p = phase();
    if (p.name === "break") startBreakView();
    else if (p.name === "overdue") finish(p.end);   // came back after 5:00: land on the receipt
    else if (p.name === "cooldown") showCooldown(p.reopen);
    else showLanding();

    setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
