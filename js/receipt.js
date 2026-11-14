// Break receipt. Text slip only for now. Layout, PNG export and share come in the receipt step.
(function () {
  var P = (window.Pantry = window.Pantry || {});

  function clock(ms) {
    return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  function duration(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  P.formatClock = clock;

  // r: { start, end, reopen, counts }
  P.receiptText = function (r) {
    var date = new Date(r.start).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return [
      "BREAK MUNA",
      "Official Break Receipt",
      "------------------------",
      "Date      " + date,
      "Time in   " + clock(r.start),
      "Time out  " + clock(r.end),
      "Duration  " + duration(r.end - r.start),
      "------------------------",
      "Pantry reopens at " + clock(r.reopen)
    ].join("\n");
  };
})();
