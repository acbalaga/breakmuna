// Clock source, day, hour and season logic, and condition-aware copy picking.
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

  // Names of every condition active right now. Conditions stack.
  P.conditions = function () {
    var d = new Date(P.now());
    var day = d.getDay(), date = d.getDate(), month = d.getMonth();
    var mins = d.getHours() * 60 + d.getMinutes();
    var last = new Date(d.getFullYear(), month + 1, 0).getDate();
    var on = [];
    if (day === 1 && mins < 12 * 60) on.push("monday_morning");
    // no lunch rush in an empty office
    if (day !== 0 && day !== 6 && mins >= 11 * 60 + 45 && mins < 13 * 60) on.push("lunch_rush");
    if (mins >= 15 * 60 && mins < 16 * 60) on.push("merienda_hour");
    if (day === 5 && mins >= 16 * 60 + 30) on.push("friday_close");
    // overtime runs through the night, until the first commuters at 5:00
    if (mins >= 18 * 60 + 30 || mins < 5 * 60) on.push("overtime");
    if (date === 15 || date === last) on.push("payday");
    if ((date >= 12 && date <= 14) || (date >= last - 3 && date < last)) on.push("petsa_de_peligro");
    if ((month >= 8 && month <= 10) || (month === 11 && date <= 25)) on.push("ber_months");
    if (day === 0 || day === 6) on.push("weekend");
    if (P.rainy()) on.push("rainy_season");
    return on;
  };

  P.is = function (name) { return P.conditions().indexOf(name) !== -1; };

  // Lines that may be used right now: default lines plus lines whose conditions are all active.
  P.lines = function (test) {
    var on = P.conditions();
    return (window.PANTRY_COPY || []).filter(function (l) {
      if (l.when && !l.when.every(function (c) { return on.indexOf(c) !== -1; })) return false;
      return test(l);
    });
  };

  // Random unused line, leaning toward lines written for the current conditions.
  P.choose = function (lines, used) {
    var fresh = used ? lines.filter(function (l) { return !used[l.id]; }) : lines;
    if (!fresh.length) return null;
    var timely = fresh.filter(function (l) { return l.when; });
    var from = timely.length && (timely.length === fresh.length || Math.random() < 0.6) ? timely : fresh;
    var l = from[Math.floor(Math.random() * from.length)];
    if (used) used[l.id] = true;
    return l;
  };
})();
