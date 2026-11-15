// Pixel snapping. Every art pixel should land on a whole number of device pixels,
// or some are one device pixel wider than their neighbours and rain, fog and the
// clock hands look uneven. CSS cannot see devicePixelRatio, so this sets --room-w
// from script. The CSS min() in pantry.css is the fallback if this does not run.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var root = document.documentElement;
  var ART_W = 90, ART_H = 130, MAX_W = 540;

  function dpr() { return window.devicePixelRatio || 1; }

  // Largest CSS size, at most css, that is a whole number of device pixels per cell.
  function snap(css, cols) {
    var cell = Math.floor(css * dpr() / cols);
    return cell > 0 ? cell / dpr() : css / cols;
  }

  function room() {
    var dialog = parseFloat(getComputedStyle(root).getPropertyValue("--dialog-h")) || 96;
    var byWidth = Math.min(root.clientWidth, MAX_W);
    var byHeight = (window.innerHeight - dialog) * ART_W / ART_H;
    var w = Math.min(byWidth, byHeight);
    if (!(w > 0)) return;
    var cell = snap(w, ART_W);
    root.style.setProperty("--room-w", cell * ART_W + "px");
  }

  // Hands-on panels: each .toy is cols art pixels wide. Boxes that share a parent
  // (the ref door's board and note) get one common cell so they line up.
  function toys() {
    var boxes = document.querySelectorAll(".toy[data-cols]"), seen = [], i, j;
    for (i = 0; i < boxes.length; i++) {
      var parent = boxes[i].parentNode;
      if (seen.indexOf(parent) >= 0) continue;
      seen.push(parent);
      var kids = [], sum = 0, limit = Infinity, edge = 0, gap = 0;
      for (j = 0; j < parent.children.length; j++) {
        var k = parent.children[j];
        if (!k.dataset || !k.dataset.cols) continue;
        var cs = getComputedStyle(k), cols = +k.dataset.cols;
        var b = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
        var max = parseFloat(cs.maxWidth);
        k.style.flex = "none";
        k.style.width = "";
        kids.push({ el: k, cols: cols, b: b });
        sum += cols; edge += b;
        if (isFinite(max)) limit = Math.min(limit, (max - b) / cols);
      }
      if (!kids.length) continue;
      var pcs = getComputedStyle(parent);
      gap = parseFloat(pcs.columnGap) || 0;
      var avail = parent.clientWidth - parseFloat(pcs.paddingLeft || 0) - parseFloat(pcs.paddingRight || 0) - gap * (kids.length - 1) - edge;
      if (avail > 0) limit = Math.min(limit, avail / sum);
      if (!isFinite(limit) || limit <= 0) continue;
      var cell = snap(limit, 1);
      kids.forEach(function (o) { o.el.style.width = o.cols * cell + o.b + "px"; });
    }
  }

  function all() { room(); toys(); }
  P.scale = { room: room, toys: toys, all: all };

  all();
  window.addEventListener("resize", all);
  window.addEventListener("orientationchange", all);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", all);
})();
