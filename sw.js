// Offline copy of the site. The network is tried first, so a deploy shows up on the
// next visit with no version to bump. The stored copy answers when the network does not.
var CACHE = "breakmuna";
var FILES = [
  "./",
  "css/pantry.css",
  "data/copy.js",
  "js/conditions.js", "js/receipt.js", "js/break.js", "js/sound.js", "js/toys.js", "js/room.js",
  "assets/sprites/room.png", "assets/sprites/door.png", "assets/sprites/sign.png",
  "assets/sprites/bubble.png", "assets/sprites/ref_items.png", "assets/sprites/exit.png",
  "assets/sprites/sound_on.png", "assets/sprites/sound_off.png",
  "assets/cursors/mug.png", "assets/cursors/spoon.png", "assets/cursors/fork.png",
  "assets/cursors/finger.png", "assets/cursors/eyes.png",
  "assets/favicon.png", "assets/icon-192.png", "assets/icon-512.png",
  "manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      // the page itself is stored once, whatever is after the question mark
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === "navigate" ? caches.match("./") : Response.error());
      });
    })
  );
});
