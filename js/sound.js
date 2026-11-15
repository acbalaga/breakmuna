// Sound: the room's ambience and the small effects. Everything is synthesized
// with Web Audio, so there are no audio files. Off until the visitor turns it on.
(function () {
  var P = (window.Pantry = window.Pantry || {});
  var AC = window.AudioContext || window.webkitAudioContext;

  var ac = null;
  var g = null;            // the ambience graph, built on first use
  var on = false;          // the visitor's toggle
  var playing = false;     // ambience is meant to be heard right now
  var scene = {};
  var lastScrub = 0;

  // Four seconds of white noise, from a fixed seed so every visit sounds the same.
  function noiseBuffer(c) {
    var len = Math.floor(c.sampleRate * 4), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    var s = 22222;
    for (var i = 0; i < len; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
    return buf;
  }

  // The whole ambience on one context: aircon hum, rain, the city, the microwave, the cat.
  // Each layer is filtered noise or a low oscillator behind its own gain, all starting silent.
  // Also used with an offline context to check levels.
  function build(c) {
    var out = c.createGain();
    out.gain.value = 0;
    out.connect(c.destination);
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    src.start();

    function filter(type, hz) {
      var f = c.createBiquadFilter();
      f.type = type; f.frequency.value = hz; f.Q.value = 0.7;
      return f;
    }
    function tone(type, hz) {
      var o = c.createOscillator();
      o.type = type; o.frequency.value = hz; o.start();
      return o;
    }
    // noise through the filters, then a gain that drifts a little so nothing sounds like a loop
    function layer(filters, driftHz) {
      var gain = c.createGain(), drift = c.createGain(), n = src;
      gain.gain.value = 0;
      filters.forEach(function (f) { n.connect(f); n = f; });
      n.connect(gain); gain.connect(drift); drift.connect(out);
      if (driftHz) {
        var depth = c.createGain();
        depth.gain.value = 0.22;
        tone("sine", driftHz).connect(depth);
        depth.connect(drift.gain);
      }
      return gain;
    }

    var hum = layer([filter("lowpass", 320)], 0);
    var compressor = c.createGain();
    compressor.gain.value = 0.06;
    tone("sine", 100).connect(compressor);
    compressor.connect(hum);

    var rain = layer([filter("highpass", 1100), filter("lowpass", 7000)], 0.13);
    var city = layer([filter("lowpass", 150)], 0.07);

    var mw = c.createGain(), mwTone = filter("lowpass", 380);
    mw.gain.value = 0;
    tone("sawtooth", 120).connect(mwTone);
    mwTone.connect(mw); mw.connect(out);

    // purr: low noise, switched on and off about 23 times a second
    var purr = c.createGain(), flutter = c.createGain(), depth = c.createGain(), low = filter("lowpass", 240);
    purr.gain.value = 0; flutter.gain.value = 0.5; depth.gain.value = 0.5;
    tone("sine", 23).connect(depth);
    depth.connect(flutter.gain);
    src.connect(low); low.connect(flutter); flutter.connect(purr); purr.connect(out);

    return { out: out, src: src, hum: hum, rain: rain, city: city, mw: mw, purr: purr };
  }

  // Layer levels for a scene. At the window the outside comes forward and the aircon drops back.
  function levels(s) {
    return {
      hum: s.window ? 0.14 : 0.3,
      rain: s.rain ? (s.window ? 0.13 : 0.05) : 0,
      city: s.window ? 0.5 : 0.2,
      mw: s.microwave ? 0.05 : 0
    };
  }

  function apply() {
    if (!g || !playing) return;
    var l = levels(scene), t = ac.currentTime;
    ["hum", "rain", "city", "mw"].forEach(function (k) { g[k].gain.setTargetAtTime(l[k], t, 0.8); });
  }

  function context() {
    if (!AC) return null;
    try {
      ac = ac || new AC();
      if (ac.state === "suspended" && !document.hidden) ac.resume();
    } catch (e) { ac = null; }
    return ac;
  }

  function inBreak() { return document.body.dataset.view === "break"; }

  function start() {
    if (!on || !inBreak() || !context()) return;
    try {
      g = g || build(ac);
      playing = true;
      g.out.gain.setTargetAtTime(1, ac.currentTime, 0.6);
      apply();
    } catch (e) {}
  }

  function stop() {
    playing = false;
    if (!g) return;
    try {
      g.out.gain.setTargetAtTime(0, ac.currentTime, 0.25);
      g.purr.gain.setTargetAtTime(0, ac.currentTime, 0.1);
    } catch (e) {}
  }

  // A short falling or rising tone. The room's taps, pops and dings.
  function blip(from, to, ms) {
    if (!on || !context()) return;
    try {
      var t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
      o.frequency.setValueAtTime(from, t);
      o.frequency.exponentialRampToValueAtTime(to, t + ms / 1000);
      v.gain.setValueAtTime(0.15, t);
      v.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.connect(v); v.connect(ac.destination);
      o.start(t); o.stop(t + ms / 1000);
    } catch (e) {}
  }

  // A burst of filtered noise: the sponge on the mug, water from the tap.
  function hiss(hz, ms, level) {
    if (!on || !context()) return;
    try {
      g = g || build(ac);
      var t = ac.currentTime, f = ac.createBiquadFilter(), v = ac.createGain();
      f.type = "bandpass"; f.frequency.value = hz; f.Q.value = 1.2;
      v.gain.setValueAtTime(0.0001, t);
      v.gain.exponentialRampToValueAtTime(level, t + 0.02);
      v.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      g.src.connect(f); f.connect(v); v.connect(ac.destination);
      setTimeout(function () { try { g.src.disconnect(f); v.disconnect(); } catch (e) {} }, ms + 100);
    } catch (e) {}
  }

  P.sound = {
    graph: build,
    levels: levels,
    blip: blip,
    isOn: function () { return on; },
    on: function (v) {
      on = !!v;
      if (on) start(); else stop();
    },
    // What the room sounds like right now: { rain, window, microwave }.
    scene: function (s) {
      if (s.rain === scene.rain && s.window === scene.window && s.microwave === scene.microwave) return;
      scene = s;
      apply();
    },
    // The dispenser: a few bubbles going up the bottle.
    gurgle: function () {
      [0, 90, 170, 280].forEach(function (ms, i) {
        setTimeout(function () { blip(170 + i * 25, 330 + i * 30, 90); }, ms);
      });
    },
    scrub: function () {
      var now = Date.now();
      if (now - lastScrub < 110) return;
      lastScrub = now;
      hiss(2600 + Math.random() * 900, 90, 0.07);
    },
    rinse: function () { hiss(3800, 1100, 0.08); },
    // The cat, for a few seconds.
    purr: function (secs) {
      if (!g || !playing) return;
      try {
        var t = ac.currentTime;
        g.purr.gain.cancelScheduledValues(t);
        g.purr.gain.setTargetAtTime(0.7, t, 0.25);
        g.purr.gain.setTargetAtTime(0, t + secs, 0.5);
      } catch (e) {}
    }
  };

  document.addEventListener("pantry:enter", start);
  document.addEventListener("pantry:close", stop);
  // Browsers hold audio until a gesture, so a reload mid-break starts on the first touch.
  document.addEventListener("pointerdown", function () {
    try { if (playing && ac && ac.state === "suspended") ac.resume(); } catch (e) {}
  }, true);
  // No sound from a tab nobody is looking at.
  document.addEventListener("visibilitychange", function () {
    if (!ac) return;
    try {
      if (document.hidden) ac.suspend();
      else if (on) ac.resume();
    } catch (e) {}
  });
})();
