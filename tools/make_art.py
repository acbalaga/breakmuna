#!/usr/bin/env python3
"""Draws the Break Muna pixel art and writes indexed PNGs. Standard library only.

This is the art source, not a build step. Run it only when the art changes:
    python3 tools/make_art.py
"""
import os, struct, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 25-color palette (SPEC: limited palette of about 24 colors)
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
    "8c7c60",  # 24 floor shadow
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
W, H, g = 0, 0, []


def canvas(w, h, fill):
    global W, H, g
    W, H, g = w, h, [[fill] * w for _ in range(h)]


def R(x0, y0, x1, y1, c):
    for y in range(max(y0, 0), min(y1, H - 1) + 1):
        for x in range(max(x0, 0), min(x1, W - 1) + 1):
            g[y][x] = c


def P(x, y, c):
    R(x, y, x, y, c)


def box(x0, y0, x1, y1, fill, line=0):
    R(x0, y0, x1, y1, line)
    R(x0 + 1, y0 + 1, x1 - 1, y1 - 1, fill)


# 3x5 sign font (M and N are wider). Only the letters the art needs.
FONT = {
    "A": ["010", "101", "111", "101", "101"], "B": ["110", "101", "110", "101", "110"],
    "C": ["011", "100", "100", "100", "011"], "D": ["110", "101", "101", "101", "110"],
    "E": ["111", "100", "110", "100", "111"], "K": ["101", "101", "110", "101", "101"],
    "L": ["100", "100", "100", "100", "111"], "O": ["111", "101", "101", "101", "111"],
    "P": ["110", "101", "110", "100", "100"], "R": ["110", "101", "110", "101", "101"],
    "S": ["011", "100", "010", "001", "110"], "T": ["111", "010", "010", "010", "010"],
    "U": ["101", "101", "101", "101", "111"], "Y": ["101", "101", "010", "010", "010"],
    "M": ["10001", "11011", "10101", "10001", "10001"], "N": ["1001", "1101", "1011", "1001", "1001"],
    " ": ["00", "00", "00", "00", "00"],
}


def text(x, y, s, c, k=1):
    for ch in s:
        gl = FONT[ch]
        for j, row in enumerate(gl):
            for i, bit in enumerate(row):
                if bit == "1":
                    R(x + i * k, y + j * k, x + i * k + k - 1, y + j * k + k - 1, c)
        x += (len(gl[0]) + 1) * k


def floor(top):
    for y in range(top, H):
        for x in range(W):
            g[y][x] = 3 if ((x // 8) + ((y - top) // 8)) % 2 == 0 else 4
    R(0, top, W - 1, top, 0)


# The pantry door with its frame. ox, oy is the offset from its place in door.png.
def draw_door(ox, oy):
    def b(x0, y0, x1, y1, fill, line=0):
        box(x0 + ox, y0 + oy, x1 + ox, y1 + oy, fill, line)

    def r(x0, y0, x1, y1, c):
        R(x0 + ox, y0 + oy, x1 + ox, y1 + oy, c)

    r(67, 24, 68, 95, 2)                          # frame shadow on the wall
    b(23, 22, 66, 100, 5)
    r(24, 23, 65, 23, 6)
    b(26, 25, 63, 100, 6)
    r(27, 26, 27, 99, 7); r(62, 26, 62, 99, 5)    # lit edge, shaded edge
    r(27, 45, 28, 46, 10); r(27, 84, 28, 85, 10)  # hinges
    b(32, 31, 57, 55, 17)
    r(33, 54, 56, 54, 16)
    for i in range(6):
        r(36 + i, 42 - i, 36 + i, 42 - i, 8); r(44 + i, 50 - i, 44 + i, 50 - i, 8)
    b(30, 60, 59, 68, 8)
    text(33 + ox, 62 + oy, "PANTRY", 0)
    b(56, 70, 61, 76, 10)                         # knob plate
    b(57, 71, 60, 74, 17); r(58, 72, 58, 72, 8)
    b(31, 78, 58, 95, 7, 5)
    r(32, 79, 57, 79, 19); r(32, 94, 57, 94, 6)


def door():
    canvas(90, 130, 1)
    R(0, 0, 89, 1, 2)
    R(0, 96, 89, 99, 5)
    R(0, 96, 89, 96, 6)
    floor(100)
    text(4, 6, "BREAK MUNA", 0, 2)
    # biometric scanner beside the door
    R(81, 49, 81, 59, 2); R(73, 60, 81, 60, 2)
    box(72, 48, 80, 59, 11)
    R(74, 50, 78, 53, 18); P(75, 51, 8)
    R(75, 55, 77, 57, 9); P(79, 50, 15)
    # potted plant
    R(7, 100, 17, 101, 24)
    box(7, 90, 15, 99, 15); R(8, 91, 14, 91, 16); R(7, 90, 15, 90, 0)
    for x, y in [(11, 78), (10, 79), (11, 79), (12, 80), (11, 80), (11, 81), (10, 82), (11, 82),
                 (7, 82), (8, 83), (9, 84), (10, 85), (14, 81), (13, 82), (15, 80), (13, 83), (12, 84),
                 (6, 86), (7, 86), (8, 87), (9, 88), (15, 85), (16, 84), (14, 86), (13, 87),
                 (11, 83), (11, 84), (11, 85), (11, 86), (11, 87), (11, 88), (11, 89), (10, 89), (12, 89), (12, 88), (10, 87)]:
        P(x, y, 18)
    # doormat
    R(27, 110, 64, 110, 24)
    box(26, 102, 63, 109, 15); R(28, 104, 61, 107, 16); R(28, 104, 61, 104, 15); R(28, 107, 61, 107, 15)
    draw_door(0, 0)


# Link preview, 1200 by 630 at 6 px per art pixel.
def og():
    canvas(200, 105, 1)
    R(0, 0, 199, 1, 2)
    R(0, 81, 199, 84, 5)
    R(0, 81, 199, 81, 6)
    floor(85)
    draw_door(8, -15)
    text(96, 26, "BREAK MUNA", 0, 2)
    text(97, 44, "PANTRY OPEN", 11)


def sign():
    canvas(29, 17, CLEAR)
    P(14, 0, 0)
    for i in range(6):
        P(13 - i * 2, 1 + i, 0); P(12 - i * 2, 1 + i, 0)
        P(15 + i * 2, 1 + i, 0); P(16 + i * 2, 1 + i, 0)
    box(0, 7, 28, 16, 8)
    text(3, 10, "CLOSED", 15)


def lidbox(ox, oy, op, lid, body, content):
    box(ox + 2, oy + 8, ox + 13, oy + 14, body)
    if op:
        R(ox + 3, oy + 9, ox + 12, oy + 9, content)
        box(ox + 4, oy + 2, ox + 15, oy + 4, lid)
    else:
        box(ox + 1, oy + 6, ox + 14, oy + 8, lid)


# Eight things in the ref, 16x16 each. Left column closed, right column open.
def ref_items():
    canvas(32, 128, CLEAR)
    for op in (0, 1):
        ox = op * 16
        # 0 DO NOT EAT
        oy = 0
        lidbox(ox, oy, op, 15, 8, 5)
        R(ox + 4, oy + 10, ox + 11, oy + 12, 17); R(ox + 5, oy + 11, ox + 10, oy + 11, 15)
        # 1 adobo, no label
        oy = 16
        lidbox(ox, oy, op, 13, 7, 5)
        for x, y in [(5, 11), (9, 12), (7, 13), (11, 10)]:
            P(ox + x, oy + y, 5)
        # 2 a name and a date from October
        oy = 32
        lidbox(ox, oy, op, 18, 8, 16)
        R(ox + 4, oy + 10, ox + 8, oy + 13, 17); R(ox + 5, oy + 11, ox + 7, oy + 11, 20); P(ox + 5, oy + 12, 20)
        # 3 cake box
        oy = 48
        if op:
            box(ox + 1, oy + 8, ox + 14, oy + 14, 8)
            box(ox + 1, oy + 1, ox + 14, oy + 3, 9)
            R(ox + 6, oy + 6, ox + 9, oy + 7, 17); R(ox + 7, oy + 5, ox + 8, oy + 5, 17); P(ox + 8, oy + 4, 15)
            R(ox + 7, oy + 9, ox + 8, oy + 13, 16)
        else:
            box(ox + 1, oy + 5, ox + 14, oy + 14, 8)
            R(ox + 7, oy + 6, ox + 8, oy + 13, 16); R(ox + 2, oy + 9, ox + 13, oy + 9, 16)
            R(ox + 6, oy + 4, ox + 9, oy + 5, 16)
        # 4 FINANCE
        oy = 64
        lidbox(ox, oy, op, 11, 9, 20)
        R(ox + 4, oy + 10, ox + 11, oy + 12, 8)
        for x in (5, 7, 9):
            P(ox + x, oy + 11, 0)
        # 5 water bottle with masking tape
        oy = 80
        box(ox + 5, oy + 4, ox + 10, oy + 14, 13)
        R(ox + 6, oy + 6, ox + 6, oy + 12, 12)
        R(ox + 5, oy + 8, ox + 10, oy + 10, 8); R(ox + 7, oy + 9, ox + 8, oy + 9, 0)
        if op:
            box(ox + 11, oy + 11, ox + 14, oy + 14, 8)
            R(ox + 7, oy + 3, ox + 8, oy + 3, 0)
        else:
            box(ox + 6, oy + 1, ox + 9, oy + 4, 8)
        # 6 ice cream tub
        oy = 96
        box(ox + 2, oy + 7, ox + 13, oy + 14, 17)
        R(ox + 3, oy + 10, ox + 12, oy + 11, 15)
        if op:
            box(ox + 4, oy + 0, ox + 15, oy + 2, 8)
            R(ox + 6, oy + 5, ox + 8, oy + 7, 23); P(ox + 5, oy + 4, 23); P(ox + 9, oy + 4, 23); P(ox + 7, oy + 4, 14)
        else:
            box(ox + 1, oy + 5, ox + 14, oy + 7, 8)
        # 7 someone's lunch, still warm
        oy = 112
        lidbox(ox, oy, op, 16, 8, 7)
        steam = [(5, 5), (6, 3), (8, 6), (7, 1), (10, 6)] if op else [(5, 4), (6, 2), (10, 4), (9, 3)]
        for x, y in steam:
            P(ox + x, oy + y, 9)


def room():
    canvas(90, 130, 1)
    # wall and floor
    R(0, 0, 89, 1, 2)
    R(0, 70, 89, 73, 5)
    R(0, 70, 89, 70, 6)
    floor(74)

    # tile backsplash behind the counter
    R(0, 38, 63, 38, 2); R(0, 44, 63, 44, 2)
    for x in range(0, 64, 6):
        R(x, 39, x, 43, 2)
        R(x + 3, 45, x + 3, 49, 2)

    # aircon unit
    R(4, 12, 27, 12, 2); R(27, 4, 27, 12, 2)
    box(3, 3, 26, 11, 8)
    R(4, 10, 25, 10, 9)
    R(5, 7, 24, 7, 9)
    R(5, 9, 24, 9, 11)
    P(23, 5, 18)

    # bulletin board
    R(4, 31, 23, 31, 2); R(23, 15, 23, 31, 2)
    box(3, 14, 22, 30, 21, 5)
    R(5, 16, 9, 21, 8); R(6, 18, 8, 18, 10); R(6, 20, 8, 20, 10)
    R(11, 16, 16, 19, 17)
    R(18, 17, 20, 22, 8)
    R(6, 23, 12, 28, 8); R(7, 25, 11, 25, 10); R(7, 27, 10, 27, 10)
    R(14, 22, 19, 27, 16)
    for x, y, c in [(7, 16, 15), (13, 16, 15), (19, 17, 14), (9, 23, 15), (16, 22, 18)]:
        P(x, y, c)

    # window: sky, skyline, EDSA
    R(61, 8, 62, 34, 2); R(31, 38, 62, 38, 2)
    box(31, 7, 60, 35, 8)
    R(32, 34, 59, 34, 9); R(59, 8, 59, 34, 9)
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

    # wall clock (face only, js/break.js draws the hands)
    cx, cy = 76, 16
    for y in range(cy - 8, cy + 11):
        for x in range(cx - 8, cx + 11):
            if (x - 1 - cx) ** 2 + (y - 2 - cy) ** 2 <= 52:
                P(x, y, 2)                      # shadow on the wall
    for y in range(cy - 8, cy + 9):
        for x in range(cx - 8, cx + 9):
            d = (x - cx) ** 2 + (y - cy) ** 2
            if d <= 52:
                P(x, y, 0 if d > 38 else 8)
    for x, y in [(76, 10), (82, 16), (76, 22), (70, 16)]:
        P(x, y, 11)

    # counter
    R(0, 50, 63, 50, 8); R(0, 51, 63, 52, 9); R(0, 53, 63, 53, 0)
    R(0, 54, 62, 71, 6); R(0, 72, 62, 73, 5); R(63, 54, 63, 73, 0)
    for x in (15, 31, 47):
        R(x, 55, x, 71, 5)
    for x0, x1 in [(1, 14), (16, 30), (32, 46), (48, 62)]:     # door panels
        R(x0 + 2, 57, x1 - 2, 57, 7); R(x0 + 2, 57, x0 + 2, 69, 7)
        R(x0 + 2, 69, x1 - 2, 69, 5); R(x1 - 2, 57, x1 - 2, 69, 5)
    for x in (13, 17, 29, 33, 45, 49):
        P(x, 62, 17)

    # water dispenser
    box(4, 32, 10, 39, 13); R(5, 33, 5, 37, 12); R(9, 34, 9, 38, 14)
    R(6, 40, 8, 40, 14)
    box(3, 41, 11, 49, 8)
    P(5, 44, 15); P(9, 44, 13); P(5, 45, 11); P(9, 45, 11)
    R(4, 48, 10, 48, 10); R(10, 42, 10, 47, 9)

    # 3-in-1 sachet box
    R(15, 40, 17, 43, 7); R(18, 41, 20, 43, 8); P(15, 40, 5); P(18, 41, 9)
    box(14, 43, 22, 49, 15)
    R(16, 45, 20, 47, 17); R(17, 46, 19, 46, 5)

    # mug
    box(25, 44, 30, 49, 8)
    R(26, 46, 29, 46, 13)
    R(31, 45, 32, 45, 0); R(32, 46, 32, 47, 0); R(31, 48, 32, 48, 0)

    # microwave
    box(37, 39, 59, 49, 9)
    R(38, 40, 58, 40, 8); R(58, 41, 58, 48, 10)
    box(39, 41, 51, 47, 11)
    P(41, 45, 10); P(42, 44, 10); P(43, 43, 10)
    R(54, 41, 57, 42, 18)
    for x, y in [(54, 44), (56, 44), (54, 46), (56, 46)]:
        P(x, y, 10)

    # ref
    R(66, 80, 89, 81, 24); R(88, 76, 89, 79, 24)
    box(66, 30, 87, 79, 9)
    R(85, 31, 86, 78, 10); R(67, 31, 67, 78, 8)
    R(67, 44, 86, 44, 10); R(67, 78, 86, 78, 10)
    R(67, 45, 86, 45, 0)
    R(69, 38, 69, 43, 11); R(69, 48, 69, 58, 11)
    # the magnets and the sticky note on the door are drawn by js/room.js, since they move

    # loaf of bread on top of the ref
    box(69, 25, 82, 30, 7)
    R(70, 26, 81, 26, 19)
    for x in (72, 75, 78):
        R(x, 27, x, 29, 20)
    R(81, 27, 82, 29, 8)

    R(0, 75, 63, 75, 24)

    # the new water bottle, delivered and still on the floor
    R(1, 91, 8, 92, 24)
    box(0, 79, 7, 90, 13); R(1, 80, 1, 89, 12); R(6, 81, 6, 89, 14)
    R(1, 83, 6, 83, 14)
    box(2, 76, 5, 79, 13); R(2, 76, 5, 76, 0); R(3, 77, 4, 77, 8)

    # table
    R(9, 119, 51, 120, 24)
    R(11, 97, 13, 118, 5); R(47, 97, 49, 118, 5)
    R(11, 100, 11, 118, 6); R(47, 100, 47, 118, 6)
    R(10, 97, 50, 99, 6)
    box(8, 92, 52, 96, 7)
    R(9, 93, 51, 93, 19)

    # merienda tray
    box(15, 89, 37, 91, 10)
    # the food cover is drawn by js/room.js so it can lift

    # aircon remote
    box(41, 87, 49, 91, 8)
    R(43, 89, 44, 89, 13); P(46, 89, 15); P(47, 89, 10)

    # parcel pile
    R(57, 123, 89, 124, 24)
    box(58, 104, 77, 122, 19); R(67, 105, 69, 121, 7); R(60, 107, 64, 110, 8)
    R(61, 108, 63, 108, 10); R(74, 105, 76, 121, 20)
    box(61, 93, 74, 103, 20); R(62, 97, 73, 98, 7); R(69, 100, 72, 101, 8); R(62, 94, 73, 94, 19)
    box(76, 110, 88, 122, 20); R(81, 111, 83, 121, 7); R(77, 111, 87, 111, 19)
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


ICONS = {
    "exit": """
................
.......kkkkkkkk.
.......kwwwwwwk.
....k..kwwwwwwk.
...kk..kwwwwwwk.
..krkkkkkkwwwwk.
.krrrrrrrkwwwwk.
krrrrrrrrkwwnwk.
.krrrrrrrkwwwwk.
..krkkkkkkwwwwk.
...kk..kwwwwwwk.
....k..kwwwwwwk.
.......kwwwwwwk.
.......kkkkkkkk.
""",
    "sound_on": """
................
................
......k.........
.....kk....k....
....kwk.....k...
.kkkwwk..k..k...
.kwwwwk...k..k..
.kwwwwk...k..k..
.kwwwwk...k..k..
.kkkwwk..k..k...
....kwk.....k...
.....kk....k....
......k.........
""",
    "sound_off": """
................
................
......k.........
.....kk.........
....kwk.........
.kkkwwk..r...r..
.kwwwwk...r.r...
.kwwwwk....r....
.kwwwwk...r.r...
.kkkwwk..r...r..
....kwk.........
.....kk.........
......k.........
""",
}

FAVICON = """
................
.....g..g.......
....g..g........
.....g..g.......
................
..kkkkkkkkk.....
..kwwwwwwwkkk...
..kwwwwwwwk.kk..
..kbbbbbbbk..k..
..kwwwwwwwk.kk..
..kwwwwwwwkkk...
..kwwwwwwwk.....
..kkkkkkkkk.....
................
"""

BUBBLE = """
..dddd..........
.dwwggd...dddd..
dwwggggd.d....d.
dwgggggd.d.dd.d.
dggggggd.d.d..d.
dggggggd.d....d.
.dggggd...dddd..
..dddd..........
"""


def cursor_grid(art):
    rows = [r.ljust(16, ".")[:16] for r in art.strip("\n").split("\n")]
    rows += ["." * 16] * (16 - len(rows))
    return [[KEY[ch] for ch in r] for r in rows]


if __name__ == "__main__":
    room()
    write_png(os.path.join(ROOT, "assets/sprites/room.png"), g)
    for name, art in CURSORS.items():
        write_png(os.path.join(ROOT, f"assets/cursors/{name}.png"), cursor_grid(art), scale=2)
    for name, art in ICONS.items():
        write_png(os.path.join(ROOT, f"assets/sprites/{name}.png"), cursor_grid(art), scale=2)
    write_png(os.path.join(ROOT, "assets/sprites/bubble.png"),
              [[KEY[ch] for ch in r.ljust(16, ".")] for r in BUBBLE.strip("\n").split("\n")])
    write_png(os.path.join(ROOT, "assets/favicon.png"), cursor_grid(FAVICON), scale=2)
    # home screen icons: the same mug on the wall color
    icon = [[1 if v == CLEAR else v for v in row] for row in cursor_grid(FAVICON)]
    icon = [icon[-1]] + icon[:-1]          # one row down, to sit in the middle
    write_png(os.path.join(ROOT, "assets/icon-192.png"), icon, scale=12)
    write_png(os.path.join(ROOT, "assets/icon-512.png"), icon, scale=32)
    ref_items()
    write_png(os.path.join(ROOT, "assets/sprites/ref_items.png"), g)
    preview = os.environ.get("PREVIEW_DIR")
    door()
    write_png(os.path.join(ROOT, "assets/sprites/door.png"), g)
    og()
    write_png(os.path.join(ROOT, "assets/og.png"), g, scale=6)
    sign()
    write_png(os.path.join(ROOT, "assets/sprites/sign.png"), g)
    room()
    if preview:
        write_png(os.path.join(preview, "room_x6.png"), g, scale=6)
        for name, art in CURSORS.items():
            write_png(os.path.join(preview, f"{name}_x12.png"), cursor_grid(art), scale=12)
