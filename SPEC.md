# 5-Minute Pantry: Build Spec

Nov 14, 2026 · @Alfred Balaga

## Concept

A single-page office pantry that an office worker enters for five minutes, plays with, and is then sent back to work with a shareable break receipt. The door stays closed for 30 minutes after each break.

The name is a placeholder. "5-Minute Pantry" is used here until a name is chosen.

**Locked decisions**

| Decision | Choice |
| --- | --- |
| Lane | Fun, safe-for-work toy. Not a productivity tool. |
| Audience | Filipino office workers, reached through LinkedIn |
| Share hook | A laugh, carried by the break receipt image |
| Form | One pixel-art room, three stations and one quiet spot. No avatar. |
| Break length | 5:00, then the room closes |
| Cooldown | 30 minutes per device before re-entry |
| Language | English with Filipino office terms. No full Taglish. |
| Upkeep | Static site, no backend, no accounts |

**Why it is not another toy site.** Three things carry it: the room reads the clock and reacts to the day and hour, the break has a hard end that produces a receipt, and the writing is accurate about Filipino office life instead of reaching for punchlines.

## Scene and stations

The whole site is one pixel-art pantry in portrait orientation, drawn like a room in a 16-bit RPG. Every interactive thing is an object in the room. There are no menus, no levels, and no scores.

| Spot | What you do | What it gives back | Receipt line |
| --- | --- | --- | --- |
| Coffee corner | Tap the 3-in-1 sachet, fill from the water dispenser, stir | A cup that steams, plus one dry pantry notice per cup | Cups of coffee |
| Merienda tray | Lift the cover to see today's merienda (changes daily, same for everyone that day) | The item, with a one-line note attached | Merienda of the day |
| Parcel pile | Open a parcel left at reception, pop the bubble wrap | Popping, with sound if enabled | Bubbles popped |
| The window | Do nothing. Rain, a stalled EDSA, lights coming on. | A quiet counter of seconds spent not touching anything | Seconds at the window |

**Background details, not stations.** These are tappable for one line each and make the room feel inhabited: the microwave queue, the ref with someone's forgotten baon, the aircon remote, the bulletin board, and the wall clock that shows the break time remaining.

**Design rules**

- Nothing can be failed or lost. A break toy with a fail state is work.
- Each station is complete in 60 to 90 seconds, so three stations and the window fit in five minutes.
- The wall clock is the only timer on screen. No digital countdown until the last 30 seconds.

**Pixel style**

- Everything in the room sits on one pixel grid with a limited palette of about 24 colors.
- Animation is frame-stepped in two to four frames: rain, coffee steam, the microwave glow, the clock hands.
- Copy appears in an RPG dialog box at the bottom of the screen when an object is tapped.
- Dialog text uses a clean monospace font for legibility on phones. A pixel font is used for the title only.
- The break receipt is not pixel art. It stays crisp so it reads well as a shared image.

**Pointer, in place of an avatar**

- There is no character in the room. The visitor is the pointer.
- On desktop, the cursor is a pixel hand holding a coffee mug.
- The cursor changes over each station: a teaspoon at the coffee corner, a fork at the merienda tray, a pointing finger at the parcel pile, a pair of eyes at the window.
- Phones have no cursor. A tap shows the same pixel icon at the touch point for a moment, then it fades.
- The system cursor returns over the sound toggle, the exit button and the receipt buttons, so controls stay obvious.

## Timer, close and cooldown

The break lasts 5:00 from the moment the visitor taps the door, and the pantry then stays closed on that device for 30 minutes.

1. **Landing.** A closed pantry door and one line of copy. Nothing is running yet, so link previews and idle tabs do not burn a break.
2. **Enter.** Tapping the door stores a start time and opens the room.
3. **In break.** The wall clock runs. At 4:30 the lights flicker once and a small countdown appears.
4. **Early exit.** A "Balik na ako" button is always available. It ends the break and prints the receipt.
5. **Close.** At 5:00 the lights go off, the stations stop responding, and the receipt prints.
6. **Cooldown.** For 30 minutes the door shows a closed sign, the reopening time, a fresh line of copy, and the last receipt.
7. **Reopen.** After 30 minutes the door can be tapped again.

**Rules for edge cases**

- Time is measured from stored timestamps, not a running counter. Closing the tab or locking the phone does not pause the break.
- A visitor who returns mid-break lands back in the room with the correct time left. One who returns after 5:00 lands on the receipt.
- The cooldown starts when the break ends, whether at 5:00 or by early exit.
- State lives in the browser's local storage. If storage is unavailable, the site still works and simply has no cooldown.
- Incognito mode or clearing storage bypasses the cooldown. This is accepted. The closed door is a nudge and a joke, not a lock.
- First-time visitors always get in, so a LinkedIn click never meets a closed door.

## Time awareness

The room reads the device clock and changes its copy, lighting and merienda to match. This is the main differentiator and it needs no backend.

| Condition | Trigger | What changes |
| --- | --- | --- |
| Monday morning | Mon, before 12:00 | Subdued lighting, slower coffee, Monday notices |
| Lunch rush | Daily, 11:45 to 13:00 | Microwave queue at its longest, queue lines |
| Merienda hour | Daily, 15:00 to 16:00 | Merienda tray is the lit object in the room |
| Friday close | Fri, after 16:30 | Late meeting invite lines, lighter mood |
| Overtime | Any day, after 18:30 | Half the lights off, window shows night traffic |
| Payday | 15th and last day of month | Better merienda, payday lines |
| Petsa de peligro | 3 days before each payday | Merienda downgrades, budget lines |
| Ber months | Sept 1 to Dec 25 | Christmas party committee notices, parol on the window |
| Weekend | Sat and Sun | Empty office, one line asking why you are here |
| Rainy season | June to Nov | Rain on the window more often than not |

**Rules**

- Conditions stack. A payday Friday afternoon draws from all three pools.
- Every pool has a default set, so no hour of the week is empty.
- The daily merienda is picked by date, so two officemates see the same item and can talk about it.
- A debug query parameter overrides the date and time for testing.

## Voice and copy pool

The voice is a dry office notice that happens to be accurate. The humor comes from recognition, never from a punchline.

**Rules**

- Write observations in the register of a memo, a sign, or a system message.
- One or two short sentences per line. If it needs a setup, cut it.
- Use Filipino office terms as plain vocabulary (baon, merienda, pantry, ref, pa-approve, petsa de peligro). Do not explain or italicize them.
- Specific beats general. "The cold side of the dispenser" beats "office appliances."

**Banned**

- Puns, hugot lines, meme phrases, and "charot"-style tags
- Exclamation marks and emoji
- Jokes about named companies, real people, politics, religion, pay amounts, or looks
- Jokes at the expense of guards, utility staff, or junior employees
- Anything that reads as complaining about a boss. The target is the office, not a person.

**Sample lines (voice check)**

- Microwave queue: 6 persons. Estimated wait: your entire lunch.
- Water dispenser advisory. The hot side works. The cold side is a rumor.
- The aircon is set to 18. Nobody has claimed responsibility.
- A baon has been in the ref since October. It has seniority now.
- Coffee: 3-in-1. The sugar has already been decided for you.
- The Christmas party committee still needs volunteers. Avoid eye contact.
- Friday, 4:58 PM. A meeting invite has entered the building.
- This parcel has been at reception longer than the intern.
- Payday is in two days. Today's merienda is water.
- It is Saturday. The pantry would like to know why you are here.

**Pool sizes for launch**

| Pool | Lines |
| --- | --- |
| Coffee corner notices | 30 |
| Merienda items with notes | 31 |
| Parcel labels | 20 |
| Background objects (5 objects) | 25 |
| Time-condition lines (10 conditions) | 40 |
| Closed-door lines | 15 |
| Receipt closing lines | 20 |
| **Total** | **181** |

All copy lives in one data file, each line tagged by station and condition, so the writing can be reviewed and edited without touching code.

## Break receipt

The receipt is the share object, so it is the one feature that cannot be cut. It prints at the end of every break as a thermal-paper slip and exports as an image in one tap.

**Contents, top to bottom**

1. Site name and "Official Break Receipt"
2. Date, time in, time out, duration
3. Line items from the stations: cups of coffee, merienda of the day, bubbles popped, seconds at the window
4. One line item the visitor did not earn, drawn from the day's conditions (for example "Meetings avoided: 1")
5. One closing line from the receipt pool
6. "Pantry reopens at 3:42 PM"
7. Site URL

**Export and share**

- Rendered to a canvas and saved as a PNG at 1080 by 1350 pixels, the portrait ratio LinkedIn shows without cropping.
- On phones, the share button opens the native share sheet with the image attached. Where that is unsupported, it downloads the file.
- A "copy caption" button gives one optional line of post text. No hashtags, no call to action.
- The link preview uses a fixed image of the closed pantry door, since a static site cannot generate one per visitor.

**Rules**

- The receipt holds no name, no employer, and no location. Nothing on it identifies the visitor.
- A break with zero interaction still prints a full receipt. Doing nothing is a valid break.
- Numbers are real counts from the session. Only the one unearned line item is invented.

## Tech constraints

The site is static files on a free static host, with no server, no database, no accounts, and no build step that needs maintaining.

| Area | Constraint |
| --- | --- |
| Stack | Plain HTML, CSS and JavaScript. No framework. |
| Scene | Pixel-art sprite sheets (PNG) scaled up with pixelated rendering, animated in stepped frames |
| Copy | One data file, lines tagged by station and condition |
| State | Local storage: break start, break end, session counts, last receipt |
| Sound | Web Audio, off by default, one visible toggle |
| Page weight | Under 500 KB total, usable on mobile data |
| Layout | Mobile-first portrait from 360 px wide. Desktop shows the same room centered. |
| Motion | Honors the reduced-motion setting. No flashing beyond the single light flicker. |
| Accessibility | Every station is a real button with a label. Receipt text is also available as text. |
| Privacy | No cookies, no tracking scripts, no personal data collected |
| Analytics | Optional cookieless page counter only |
| Hosting | Any static host with a custom domain and HTTPS |

**Safe-for-work checks**

- No sound without consent, since most visitors are at a desk.
- No content that would embarrass someone if a manager glanced at the screen.
- The page title and tab icon are neutral.

## Weekend build plan

The build runs in six steps over Saturday afternoon and Sunday, with the voice approved before any code is written.

1. **Voice gate (Sat afternoon).** Write 30 lines across all pools. Fred approves or corrects the voice. Nothing else starts until this passes.
2. **Scene (Sat afternoon).** Draw the pantry as pixel art with all objects in place, static, plus the five cursor icons.
3. **Break engine (Sat evening).** Door, 5:00 timer, close, 30-minute cooldown, and all edge cases from the timer section.
4. **Stations (Sat evening to Sun morning).** Coffee corner, merienda tray, window, then parcel pile.
5. **Receipt (Sun morning).** Layout, image export, share sheet, download fallback.
6. **Fill and ship (Sun afternoon).** Time-condition logic, full copy pool to 181 lines, phone testing, deploy, launch post draft.

**Cut line if Sunday runs short, in this order**

1. Sound
2. Parcel pile station
3. Time conditions beyond lunch rush, merienda hour, Friday close and payday
4. Copy pool down to 100 lines

The receipt, the timer and cooldown, and the voice are never cut.

## Open decisions and acceptance checks

Four decisions are still open, and the name is the only one that blocks launch.

**Open decisions**

- [ ] Name and domain. Needed before the receipt and link preview are final.
- [ ] Host. Any static host works. Pick the one already in use for other side sites.
- [ ] Attribution. Whether the footer carries a "made by" credit or stays anonymous.
- [ ] Analytics. A cookieless counter, or nothing.

**Acceptance checks before launch**

- [ ] A first-time visitor on a phone gets from link to inside the pantry in two taps.
- [x] The break ends at 5:00 even if the tab was closed or the phone was locked.
- [x] The door stays closed for 30 minutes and shows the correct reopening time.
- [ ] The receipt image saves and shares correctly on Android Chrome and iPhone Safari.
- [ ] The receipt reads correctly in a LinkedIn post preview on a phone.
- [x] Ten breaks in a row show no repeated line within a single break.
- [x] Every time condition has been checked with the debug override.
- [x] Sound is off on first load.
- [ ] Every line in the copy pool passes the banned list.
- [x] Total page weight is under 500 KB.

## Handoff notes for Claude Code

This section tells a coding agent how to build from this spec. Save the document as `SPEC.md` at the repo root and treat it as the source of truth.

**Repo layout**

```
index.html          the single page
css/pantry.css      layout, pixel rendering, dialog box, receipt
js/break.js         door, timer, close, cooldown, storage
js/room.js          stations, background objects, cursor, tap icons
js/conditions.js    day, hour and season logic, debug override
js/receipt.js       receipt layout, PNG export, share and download
data/copy.js        every line of copy, tagged
assets/sprites/     pixel sprite sheets (PNG)
assets/cursors/     the five cursor icons (PNG)
assets/og.png       link preview image of the closed door
SPEC.md             this document
```

**Constants**

| Name | Value |
| --- | --- |
| Break length | 300 seconds |
| Warning point | 270 seconds |
| Cooldown | 1,800 seconds |
| Receipt image | 1080 by 1350 px |
| Pixel grid | 4 CSS px per art pixel at 360 px wide |
| Page weight budget | 500 KB |

**Copy data shape**

Each line is one object: `id`, `pool` (coffee, merienda, parcel, background, condition, door, receipt), `text`, an optional `object` for background lines, and an optional `when` list of condition names. A line with no `when` is a default line.

**Storage keys**

`pantry.breakStart`, `pantry.breakEnd`, `pantry.counts`, `pantry.lastReceipt`, `pantry.sound`. All reads and writes are wrapped so the site still works when storage is blocked.

**Working rules for the agent**

1. Build in the order of the weekend build plan. Do not start the scene before the 30-line voice sample is approved.
2. No frameworks, no build step, no package dependencies. Plain files that open from a static host.
3. Do not write copy that breaks the voice rules or the banned list. When unsure, write fewer lines.
4. Do not add features that are not in this spec. Scores, accounts, leaderboards and streaks are out of scope.
5. Check each step on a 360 px wide viewport before moving to the next.
6. Use the debug override to verify every time condition instead of waiting for the clock.
7. Tick the acceptance checks in this document only after testing them.
