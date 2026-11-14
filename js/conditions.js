// Clock source for the whole site. Day, hour and season logic lands here later.
// Debug override: add ?now=2026-11-16T09:30 to the URL. Time keeps running from there.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var offset = 0;
  try {
    var q = new URLSearchParams(location.search).get("now");
    if (q) {
      var t = new Date(q).getTime();
      if (!isNaN(t)) offset = t - Date.now();
    }
  } catch (e) {}
  P.now = function () { return Date.now() + offset; };
})();
