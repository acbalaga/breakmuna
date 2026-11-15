// Break receipt: contents, thermal-slip image (1080 by 1350 PNG), share, download, caption.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var $ = function (id) { return document.getElementById(id); };

  var W = 1080, H = 1350;
  var SITE_URL = "";   // set once the domain is chosen. Falls back to the page's own address.
  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", "Courier New", monospace';

  var blob = null;     // PNG of the receipt on screen, ready before the share tap
  var shown = "";      // address of that PNG while it is on screen
  var canvas = null;   // drawn on, never shown: the slip on screen is an image of it

  function clock(ms) {
    return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  function duration(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  function siteUrl() {
    if (SITE_URL) return SITE_URL;
    if (!location.host) return "";
    return (location.host + location.pathname).replace(/\/(index\.html)?$/, "");
  }
  function pick(pool) {
    return P.choose(P.lines(function (l) { return l.pool === pool; }));
  }

  P.formatClock = clock;

  // Called once when a break ends. Adds the lines that are chosen, not counted,
  // so the stored receipt reads the same every time it is reopened.
  P.completeReceipt = function (r) {
    var extra = pick("unearned"), closing = pick("receipt");
    r.extra = extra ? { label: extra.label, value: extra.value } : null;
    r.closing = closing ? closing.text : "";
    return r;
  };

  // Every row of the receipt, in order. Both the image and the text version read from this.
  function rows(r) {
    var c = r.counts || {};
    var items = [
      ["Cups of coffee", String(c.coffee || 0)],
      ["Merienda of the day", c.merienda || "unclaimed"],
      ["Bubbles popped", String(c.bubbles || 0)],
      ["Seconds at the window", String(c.window || 0)]
    ];
    // lines that only print when they happened
    if (c.breaths > 0) items.push(["Slow breaths", String(c.breaths)]);
    if (c.washed > 0) items.push(["Mugs washed", String(c.washed)]);
    if (c.watered) items.push(["Sill plant", "Watered"]);
    if (typeof c.cat === "string" && c.cat) items.push(["Cat's assessment", c.cat.slice(0, 16)]);
    if (r.extra) items.push([r.extra.label, String(r.extra.value)]);
    return {
      head: [
        ["Date", new Date(r.start).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })],
        ["Time in", clock(r.start)],
        ["Time out", clock(r.end)],
        ["Duration", duration(r.end - r.start)]
      ],
      items: items,
      closing: r.closing || "",
      reopen: "Pantry reopens at " + clock(r.reopen),
      url: siteUrl()
    };
  }

  // Hidden cases solved during the break.
  function cases(r) {
    var c = r.counts || {}, out = [];
    if (c.solved) out.push("THE OCTOBER BAON");
    if (c.solved2) out.push("THE SUPPLY CABINET");
    return out;
  }

  P.receiptText = function (r) {
    var d = rows(r), rule = "------------------------------";
    function row(p) { return p[0] + ": " + p[1]; }
    var out = ["BREAK MUNA", "Official Break Receipt", rule]
      .concat(d.head.map(row), [rule], d.items.map(row), [rule]);
    if (d.closing) out.push(d.closing, rule);
    var done = cases(r);
    if (done.length) out.push("Stamped: " + (done.length > 1 ? "2 CASES CLOSED. " : "CASE CLOSED. ") + done.join(" + ") + ".", rule);
    out.push(d.reopen);
    if (d.url) out.push(d.url);
    return out.join("\n");
  };

  // ---- image ---------------------------------------------------------------

  function wrap(ctx, text, max) {
    var words = text.split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(t).width > max) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function drawReceipt(canvas, r) {
    var ctx = canvas.getContext("2d"), d = rows(r);
    var L = 150, R = W - 150, PAD = 56, cx = W / 2;
    var ink = "#1f1a24", soft = "#55555e";

    ctx.fillStyle = "#b8a888";
    ctx.fillRect(0, 0, W, H);

    // paper slip with torn top and bottom edges
    var top = 70, bottom = H - 70, tooth = 20;
    function slip(dx, dy, fill) {
      ctx.beginPath();
      ctx.moveTo(L + dx, top + dy);
      for (var x = L; x < R; x += tooth) { ctx.lineTo(x + tooth / 2 + dx, top + 10 + dy); ctx.lineTo(Math.min(x + tooth, R) + dx, top + dy); }
      ctx.lineTo(R + dx, bottom + dy);
      for (x = R; x > L; x -= tooth) { ctx.lineTo(x - tooth / 2 + dx, bottom - 10 + dy); ctx.lineTo(Math.max(x - tooth, L) + dx, bottom + dy); }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    slip(10, 12, "rgba(31,26,36,0.25)");
    slip(0, 0, "#fbfaf6");

    function text(s, x, y, size, opts) {
      opts = opts || {};
      ctx.font = (opts.bold ? "bold " : "") + size + "px " + MONO;
      ctx.fillStyle = opts.color || ink;
      ctx.textAlign = opts.align || "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(s, x, y);
    }
    function rule(y) {
      ctx.strokeStyle = soft;
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(L + PAD, y); ctx.lineTo(R - PAD, y); ctx.stroke();
      ctx.setLineDash([]);
    }
    // A full receipt has nine line items. The rows close up so the slip stays one page.
    var many = d.items.length > 6;
    var step = Math.min(52, Math.floor((many ? 512 : 470) / (d.head.length + d.items.length)));
    function row(pair, y) {
      var size = step < 46 ? 28 : 32, max = R - L - PAD * 2;
      ctx.font = size + "px " + MONO;
      // shrink a long row instead of letting it collide
      while (size > 20 && ctx.measureText(pair[0] + "  " + pair[1]).width > max) {
        size -= 2;
        ctx.font = size + "px " + MONO;
      }
      text(pair[0], L + PAD, y, size);
      text(pair[1], R - PAD, y, size, { align: "right", bold: true });
    }

    var y = 190;
    text("BREAK MUNA", cx, y, 76, { align: "center", bold: true });
    text("Official Break Receipt", cx, y += 56, 30, { align: "center", color: soft });
    rule(y += 46);
    y += 8;
    d.head.forEach(function (p) { row(p, y += step); });
    rule(y += 40);
    y += 8;
    d.items.forEach(function (p) { row(p, y += step); });
    rule(y += 40);

    if (d.closing) {
      // a long line gets smaller type, so it is never cut off mid-sentence
      var room = many ? 2 : 3, size = 30, lines;
      do {
        ctx.font = size + "px " + MONO;
        lines = wrap(ctx, d.closing, R - L - PAD * 2);
      } while (lines.length > room && (size -= 2) >= 20);
      lines = lines.slice(0, room);
      y += 14;
      lines.forEach(function (l) { text(l, cx, y += 42, size, { align: "center" }); });
      rule(y += 44);
    }

    text(d.reopen, cx, y += 62, 34, { align: "center", bold: true });
    var done = cases(r);
    if (d.url) text(d.url, cx, y += done.length ? 38 : 46, 26, { align: "center", color: soft });

    if (done.length) {
      // stamp for the hidden case, in place of the barcode
      ctx.save();
      ctx.translate(cx, bottom - 80);
      ctx.rotate(-0.07);
      ctx.strokeStyle = "#c8483c";
      ctx.lineWidth = 6;
      ctx.strokeRect(-250, -44, 500, 88);
      ctx.lineWidth = 2;
      ctx.strokeRect(-240, -35, 480, 70);
      text(done.length > 1 ? "2 CASES CLOSED" : "CASE CLOSED", 0, 2, 42, { align: "center", bold: true, color: "#c8483c" });
      text(done.join(" + "), 0, 27, done.length > 1 ? 17 : 20, { align: "center", color: "#c8483c" });
      ctx.restore();
      return;
    }

    // barcode, decorative, derived from the break start time
    var seed = Math.floor(r.start / 1000) || 1, bx = L + PAD + 60, by = bottom - 110;
    ctx.fillStyle = ink;
    while (bx < R - PAD - 60) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var w = 3 + (seed >> 8) % 3 * 3;
      if ((seed >> 4) % 3) ctx.fillRect(bx, by, w, 56);
      bx += w + 3;
    }
  }

  // ---- overlay ----------------------------------------------------------------

  function canShareFile(file) {
    try { return !!(navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { return false; }
  }
  function file() {
    try { return blob ? new File([blob], "break-muna-receipt.png", { type: "image/png" }) : null; } catch (e) { return null; }
  }

  function coarse() {
    try { return window.matchMedia("(pointer: coarse)").matches; } catch (e) { return false; }
  }

  function download() {
    if (!blob) return;
    // some in-app browsers ignore downloads, so say what else works
    if (coarse()) $("receipt-hint").hidden = false;
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "break-muna-receipt.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }

  function share() {
    var f = file();
    if (f && canShareFile(f)) {
      navigator.share({ files: [f] }).catch(function (e) {
        if (!e || e.name !== "AbortError") download();
      });
    } else download();
  }

  // The receipt itself onto the clipboard, to paste straight into a post. This is the
  // short way on a desktop, where there is no share sheet.
  function canCopyImage() {
    try { return !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write); } catch (e) { return false; }
  }
  function copyImage() {
    var b = $("receipt-copy");
    if (!blob || !canCopyImage()) return;
    function say(t) {
      b.textContent = t;
      setTimeout(function () { b.textContent = "Copy image"; }, 1500);
    }
    try {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        .then(function () { say("Copied"); }, function () { say("Not copied"); });
    } catch (e) { say("Not copied"); }
  }

  var captionsUsed = {};
  function copyCaption() {
    var b = $("receipt-caption");
    // a different line on each press, until the pool runs out
    var lines = P.lines(function (l) { return l.pool === "caption"; });
    var line = P.choose(lines, captionsUsed);
    if (!line) { captionsUsed = {}; line = P.choose(lines, captionsUsed); }
    if (!line) return;
    function done() {
      b.textContent = "Copied";
      setTimeout(function () { b.textContent = "Copy caption"; }, 1500);
    }
    function fallback() {
      var t = document.createElement("textarea");
      t.value = line.text;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try { if (document.execCommand("copy")) done(); } catch (e) {}
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(line.text).then(done, fallback);
    else fallback();
  }

  // Draws the receipt into the overlay. break.js shows and hides the overlay.
  // The slip on screen is an <img>, so where there is no share sheet and downloads are
  // ignored (in-app browsers), press and hold still saves it.
  P.renderReceipt = function (r) {
    var img = $("receipt-img"), shareBtn = $("receipt-share"), hint = $("receipt-hint");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
    }
    $("receipt-text").textContent = P.receiptText(r);
    drawReceipt(canvas, r);
    blob = null;
    shareBtn.textContent = "Save image";
    hint.hidden = true;
    canvas.toBlob(function (b) {
      blob = b;
      if (!b) return;
      if (shown) URL.revokeObjectURL(shown);
      shown = URL.createObjectURL(b);
      img.src = shown;
      var f = file(), sheet = !!(f && canShareFile(f));
      if (sheet) shareBtn.textContent = "Share";
      // touch screens without a share sheet: say that the image itself can be saved
      hint.hidden = sheet || !coarse();
      // on a phone with a share sheet the sheet already offers Copy, so the row stays short
      $("receipt-copy").hidden = !canCopyImage() || (sheet && coarse());
    }, "image/png");
  };

  function init() {
    $("receipt-share").addEventListener("click", share);
    $("receipt-copy").addEventListener("click", copyImage);
    $("receipt-caption").addEventListener("click", copyCaption);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
