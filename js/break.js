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
  // The stored receipt, or null when it is missing or not shaped like one.
  // Storage can be edited by hand, so nothing read from it is trusted to have the right types.
  function lastReceipt() {
    var r = json(KEY.last);
    if (!r || typeof r !== "object") return null;
    if (![r.start, r.end, r.reopen].every(function (n) { return typeof n === "number" && isFinite(n); })) return null;
    if (!r.counts || typeof r.counts !== "object") r.counts = {};
    return r;
  }

  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  var view = null;       // "landing" | "break" | "closing" | "cooldown"
  var warned = false;
  var lastElapsed = 0;
  var lastSecond = -1;
  var still = false;     // reduced motion: no second hand
  var opener = null;     // what had focus before the receipt opened

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
    var l = P.choose(P.lines(function (x) { return x.pool === pool; }));
    return l ? l.text : "";
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
    // a line written for today wins over the default
    var lines = P.lines(function (x) { return x.pool === "landing"; });
    var timely = lines.filter(function (x) { return x.when; });
    var l = (timely.length ? timely : lines)[0];
    say(l ? l.text : "");
  }

  function showCooldown(reopen) {
    show("cooldown");
    el.sign.hidden = false;
    el.doorBtn.disabled = true;
    el.doorBtn.setAttribute("aria-label", "Pantry door, closed.");
    el.lastReceipt.hidden = !lastReceipt();
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
    P.completeReceipt(receipt);
    store.set(KEY.end, end);
    store.set(KEY.last, JSON.stringify(receipt));
    document.dispatchEvent(new CustomEvent("pantry:close", { detail: receipt }));
    showCooldown(receipt.reopen);
    openReceipt();
  }

  function lightsOut() {
    show("closing");
    setSpots(false);
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

  // The hands show the real time of day. The rim fills red, clockwise from 12,
  // as the break runs out: a full red rim is 5:00.
  function drawHands(elapsed) {
    var ctx = el.hands.getContext("2d");
    ctx.clearRect(0, 0, 17, 17);

    var part = Math.min(elapsed, BREAK_MS) / BREAK_MS * 2 * Math.PI;
    ctx.fillStyle = "#c8483c";
    for (var y = 0; y < 17; y++) {
      for (var x = 0; x < 17; x++) {
        var d = (x - 8) * (x - 8) + (y - 8) * (y - 8);
        if (d <= 38 || d > 52) continue;                 // rim pixels only
        var a = Math.atan2(x - 8, 8 - y);
        if (a < 0) a += 2 * Math.PI;
        if (a <= part && elapsed > 0) ctx.fillRect(x, y, 1, 1);
      }
    }

    var now = new Date(P.now());
    var mins = now.getMinutes() + now.getSeconds() / 60;
    var hm = mins / 60 * 2 * Math.PI;
    var hh = ((now.getHours() % 12) + mins / 60) / 12 * 2 * Math.PI;
    ctx.fillStyle = "#1f1a24";
    line(ctx, 8, 8, 8 + Math.round(Math.sin(hm) * 5), 8 - Math.round(Math.cos(hm) * 5));
    ctx.fillStyle = "#55555e";
    line(ctx, 8, 8, 8 + Math.round(Math.sin(hh) * 3), 8 - Math.round(Math.cos(hh) * 3));
    ctx.fillStyle = "#1f1a24";
    ctx.fillRect(8, 8, 1, 1);

    if (still || view !== "break") return;
    // Second hand: one red dot inside the rim. It hesitates at 9, then recovers.
    var sec = now.getSeconds();
    if (sec === 46) sec = 45;
    var sa = sec / 60 * 2 * Math.PI;
    ctx.fillStyle = "#c8483c";
    ctx.fillRect(8 + Math.round(Math.sin(sa) * 5), 8 - Math.round(Math.cos(sa) * 5), 1, 1);
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
    var r = lastReceipt();
    if (!r) return;
    P.renderReceipt(r);
    opener = document.activeElement;
    el.receipt.hidden = false;
    el.receiptClose.focus();
  }
  function closeReceipt() {
    if (el.receipt.hidden) return;
    el.receipt.hidden = true;
    if (opener && opener.focus && !opener.disabled) opener.focus();
    opener = null;
  }
  // The slip is a modal: Escape closes it and Tab stays inside it.
  function receiptKeys(e) {
    if (el.receipt.hidden) return;
    if (e.key === "Escape") { closeReceipt(); return; }
    if (e.key !== "Tab") return;
    var b = el.receipt.querySelectorAll("button"), first = b[0], last = b[b.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ---- init -------------------------------------------------------------------

  function init() {
    ["room", "door", "dialog", "sign", "exit", "hands", "receipt"].forEach(function (id) { el[id] = $(id); });
    el.doorBtn = $("door-btn");
    el.lastReceipt = $("last-receipt");
    el.receiptClose = $("receipt-close");

    el.doorBtn.addEventListener("click", enter);
    el.exit.addEventListener("click", function () {
      if (view === "break" && phase().name === "break") finish(P.now());
    });
    el.lastReceipt.addEventListener("click", openReceipt);
    el.receiptClose.addEventListener("click", closeReceipt);
    document.addEventListener("keydown", receiptKeys);
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    var p = phase();
    if (p.name === "break") startBreakView();
    else if (p.name === "overdue") finish(p.end);   // came back after 5:00: land on the receipt
    else if (p.name === "cooldown") showCooldown(p.reopen);
    else showLanding();

    setInterval(tick, 250);
    // Keeps a copy of the site on the device, so the pantry opens from the home screen without a signal.
    try {
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
    } catch (e) {}
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
