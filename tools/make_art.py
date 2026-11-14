#!/usr/bin/env python3
"""Draws the Break Muna pixel art and writes indexed PNGs. Standard library only.

This is the art source, not a build step. Run it only when the art changes:
    python3 tools/make_art.py
"""
import os, struct, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 24-color palette (SPEC: limited palette of about 24 colors)
PAL = [
    "1f1a24",  # 0 outline
    "e8dcc0",  # 1 wall
    "d4c4a0",  # 2 wall shade
    "b8a888",  # 3 floor A
    "a89878",  # 4 floor B
    "6b4a32",  # 5 wood dark
    "8f6642",  # 6 wood mid
    "b98a5a",  # 7 wood light
    "f4f0e6",  # 8 white
    "c8c8c8",  # 9 grey light
    "8c8c94",  # 10 grey mid
    "55555e",  # 11 grey dark
    "8cc4e8",  # 12 sky
    "4a8fd0",  # 13 water blue
    "2c4f8a",  # 14 deep blue
    "c8483c",  # 15 red
    "e08a3c",  # 16 orange
    "f0cc5a",  # 17 yellow
    "5a9a52",  # 18 green
    "c49a62",  # 19 cardboard
    "9a7444",  # 20 cardboard dark
    "b88454",  # 21 cork
    "e8b088",  # 22 skin
    "6a7a94",  # 23 building
]
CLEAR = len(PAL)  # transparent index


def write_png(path, grid, scale=1):
    h, w = len(grid), len(grid[0])
    raw = bytearray()
    for row in grid:
        line = bytearray()
        for v in row:
            line += bytes([v]) * scale
        for _ in range(scale):
            raw += b"\x00" + line

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

    plte = b"".join(bytes.fromhex(c) for c in PAL) + b"\x00\x00\x00"
    trns = b"\xff" * len(PAL) + b"\x00"
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w * scale, h * scale, 8, 3, 0, 0, 0))
           + chunk(b"PLTE", plte) + chunk(b"tRNS", trns)
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b""))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


# ---------------------------------------------------------------- room
W, H = 90, 130
g = [[1] * W for _ in range(H)]


def R(x0, y0, x1, y1, c):
    for y in range(max(y0, 0), min(y1, H - 1) + 1):
        for x in range(max(x0, 0), min(x1, W - 1) + 1):
            g[y][x] = c


def P(x, y, c):
    R(x, y, x, y, c)


def box(x0, y0, x1, y1, fill, line=0):
    R(x0, y0, x1, y1, line)
    R(x0 + 1, y0 + 1, x1 - 1, y1 - 1, fill)


def room():
    # wall and floor
    R(0, 0, 89, 1, 2)
    R(0, 70, 89, 73, 5)
    for y in range(74, H):
        for x in range(W):
            g[y][x] = 3 if ((x // 8) + ((y - 74) // 8)) % 2 == 0 else 4
    R(0, 74, 89, 74, 0)

    # aircon unit
    box(3, 3, 26, 11, 8)
    R(5, 7, 24, 7, 9)
    R(5, 9, 24, 9, 11)
    P(23, 5, 18)

    # bulletin board
    box(3, 14, 22, 30, 21, 5)
    R(5, 16, 9, 21, 8); R(6, 18, 8, 18, 10); R(6, 20, 8, 20, 10)
    R(11, 16, 16, 19, 17)
    R(18, 17, 20, 22, 8)
    R(6, 23, 12, 28, 8); R(7, 25, 11, 25, 10); R(7, 27, 10, 27, 10)
    R(14, 22, 19, 27, 16)
    for x, y, c in [(7, 16, 15), (13, 16, 15), (19, 17, 14), (9, 23, 15), (16, 22, 18)]:
        P(x, y, c)

    # window: sky, skyline, EDSA
    box(31, 7, 60, 35, 8)
    R(33, 9, 58, 33, 12)
    R(35, 11, 39, 12, 8); R(50, 12, 55, 13, 8)
    R(33, 22, 38, 30, 23); R(39, 18, 44, 30, 14)
    R(47, 24, 51, 30, 23); R(52, 16, 58, 30, 14)
    for x, y in [(34, 24), (36, 26), (40, 20), (42, 23), (41, 27), (48, 26), (50, 28),
                 (53, 18), (56, 20), (54, 23), (57, 26)]:
        P(x, y, 17)
    R(33, 31, 58, 33, 11)
    for x, c in [(35, 15), (38, 8), (41, 15), (44, 17), (48, 17), (51, 15), (55, 8)]:
        P(x, 32, c)
    R(45, 9, 46, 33, 8)
    box(30, 35, 61, 37, 9)

    # wall clock (hands are static here, the break engine draws the real ones)
    cx, cy = 76, 16
    for y in range(cy - 8, cy + 9):
        for x in range(cx - 8, cx + 9):
            d = (x - cx) ** 2 + (y - cy) ** 2
            if d <= 52:
                P(x, y, 0 if d > 38 else 8)
    for x, y in [(76, 10), (82, 16), (76, 22), (70, 16)]:
        P(x, y, 11)
    R(76, 11, 76, 16, 0)
    R(77, 16, 79, 16, 15)

    # counter
    R(0, 50, 63, 50, 8); R(0, 51, 63, 52, 9); R(0, 53, 63, 53, 0)
    R(0, 54, 62, 71, 6); R(0, 72, 62, 73, 5); R(63, 54, 63, 73, 0)
    for x in (15, 31, 47):
        R(x, 55, x, 71, 5)
    for x in (13, 17, 29, 33, 45, 49):
        P(x, 62, 17)

    # water dispenser
    box(4, 32, 10, 39, 13); R(5, 33, 5, 37, 12)
    R(6, 40, 8, 40, 14)
    box(3, 41, 11, 49, 8)
    P(5, 44, 15); P(9, 44, 13); P(5, 45, 11); P(9, 45, 11)
    R(4, 48, 10, 48, 10)

    # 3-in-1 sachet box
    R(15, 40, 17, 43, 7); R(18, 41, 20, 43, 8); P(15, 40, 5); P(18, 41, 9)
    box(14, 43, 22, 49, 15)
    R(16, 45, 20, 47, 17)

    # mug
    box(25, 44, 30, 49, 8)
    R(26, 46, 29, 46, 13)
    R(31, 45, 32, 45, 0); R(32, 46, 32, 47, 0); R(31, 48, 32, 48, 0)

    # microwave
    box(37, 39, 59, 49, 9)
    box(39, 41, 51, 47, 11)
    P(41, 45, 10); P(42, 44, 10); P(43, 43, 10)
    R(54, 41, 57, 42, 18)
    for x, y in [(54, 44), (56, 44), (54, 46), (56, 46)]:
        P(x, y, 10)

    # ref
    box(66, 30, 87, 79, 9)
    R(85, 31, 86, 78, 10)
    R(67, 45, 86, 45, 0)
    R(69, 38, 69, 43, 11); R(69, 48, 69, 58, 11)
    P(77, 34, 15); P(80, 36, 13)
    R(75, 50, 80, 56, 17); R(76, 52, 79, 52, 20); R(76, 54, 78, 54, 20)

    # table
    R(11, 97, 13, 118, 5); R(47, 97, 49, 118, 5)
    R(10, 97, 50, 99, 6)
    box(8, 92, 52, 96, 7)
    R(9, 93, 51, 93, 19)

    # merienda tray under its food cover
    box(15, 89, 37, 91, 10)
    for y0, y1, x0, x1 in [(88, 88, 16, 36), (85, 87, 17, 35), (83, 84, 19, 33), (82, 82, 22, 30)]:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                P(x, y, 0 if x in (x0, x1) else (17 if (x + y) % 2 == 0 else 16))
    R(22, 81, 30, 81, 0)
    box(24, 78, 28, 81, 15)

    # aircon remote
    box(41, 87, 49, 91, 8)
    R(43, 89, 44, 89, 13); P(46, 89, 15); P(47, 89, 10)

    # parcel pile
    box(58, 104, 77, 122, 19); R(67, 105, 69, 121, 7); R(60, 107, 64, 110, 8)
    box(61, 93, 74, 103, 20); R(62, 97, 73, 98, 7); R(69, 100, 72, 101, 8)
    box(76, 110, 88, 122, 20); R(81, 111, 83, 121, 7)
    box(77, 105, 87, 109, 9)
    for y in range(106, 109):
        for x in range(78, 87):
            if (x + y) % 2 == 0:
                P(x, y, 8)


# ---------------------------------------------------------------- cursors
KEY = {".": CLEAR, "k": 0, "w": 8, "g": 9, "d": 10, "s": 22, "n": 5, "b": 13, "r": 15}

CURSORS = {
    "mug": """
................
................
..kkkkkkkk......
.kwwwwwwwwk.....
.knnnnnnnnkkk...
.kwwwwwwwwkwwk..
.kwwwwwwwwk.kwk.
.ksssswwwwk.kwk.
kssssskwwwkkwk..
ksssssskwwwwk...
kssssskwwwkk....
.ksssswwwwk.....
.kwwwwwwwwk.....
..kkkkkkkk......
""",
    "spoon": """
.kkk............
kgwgk...........
kwggk...........
kgggk...........
.kkgdk..........
...kgdk.........
....kgdk........
.....kgdk.......
......kgdk......
.......kgdk.....
........kgdk....
.........kgdk...
..........kgdk..
...........kgdk.
............kkk.
""",
    "fork": """
..k.k.k.........
.kgkgkgk........
.kgkgkgk........
.kgkgkgk........
.kgkgkgk........
.kgggggk........
.kgggggk........
..kgggk.........
...kgk..........
...kgk..........
...kgk..........
...kgk..........
...kgk..........
...kgk..........
...kgk..........
....k...........
""",
    "finger": """
....kk..........
...kssk.........
...kssk.........
...kssk.........
...kssk.........
...ksskkk.......
...kssksskkk....
.kkkssksskssk...
ksskssssssssk...
kssssssssssssk..
kssssssssssssk..
.ksssssssssssk..
.kssssssssssk...
..ksssssssssk...
...kssssssssk...
...kkkkkkkkkk...
""",
    "eyes": """
................
................
................
..kkkk....kkkk..
.kwwwwk..kwwwwk.
kwwwwwwkkwwwwwwk
kwwkkwwkkwwkkwwk
kwwkkwwkkwwkkwwk
kwwwwwwkkwwwwwwk
.kwwwwk..kwwwwk.
..kkkk....kkkk..
""",
}


def cursor_grid(art):
    rows = [r.ljust(16, ".")[:16] for r in art.strip("\n").split("\n")]
    rows += ["." * 16] * (16 - len(rows))
    return [[KEY[ch] for ch in r] for r in rows]


if __name__ == "__main__":
    room()
    write_png(os.path.join(ROOT, "assets/sprites/room.png"), g)
    for name, art in CURSORS.items():
        write_png(os.path.join(ROOT, f"assets/cursors/{name}.png"), cursor_grid(art), scale=2)
    preview = os.environ.get("PREVIEW_DIR")
    if preview:
        write_png(os.path.join(preview, "room_x6.png"), g, scale=6)
        for name, art in CURSORS.items():
            write_png(os.path.join(preview, f"{name}_x12.png"), cursor_grid(art), scale=12)
