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

  // Local calendar day as a number. Same for everyone on the same date.
  P.dayNumber = function () {
    var d = new Date(P.now());
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  };

  // Rainy season is June to November. It rains more often than not.
  P.rainy = function () {
    var m = new Date(P.now()).getMonth();
    return m >= 5 && m <= 10 && P.dayNumber() % 3 !== 0;
  };
})();
