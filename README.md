# SIFAAIZ — The Birthday Issue

A one-copy birthday zine for **Sifa** (Assifa Niswa, 30 October), from **Faizan** (Fizuu).

Names on the site: **Faizan** where it's formal (parcel label, signatures, the prize, exam titles), **Fizuu** where it's playful (jokes, quiz questions, teasing). "Faiz" only survives in the SIFAAIZ formula (Sifaa + Faiz = SIFAAIZ), because that's how the word is made. Places are written as "here" and "there"; Indonesia appears once, on her field-guide card.
Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step, no trackers, no external requests. Fonts are self-hosted and it all works offline.

**All the writing is finished.** The only things left to add are your recordings:

| What | Put the file here |
|---|---|
| 🎬 Birthday video (the finale) | `assets/media/assifa-birthday-video.mp4` |
| 🖼️ Video poster (optional still before play) | `assets/photos/assifa-birthday-video-poster.jpg` |
| 🎙️ Voice note — "Happy birthday, sayang" | `assets/audio/voice-message.mp3` |

Music and sound effects are already in `assets/audio/` (see **Sound** below).

Drop a file in with exactly that name and refresh. That's it. Until a file exists, the site shows an intentional "on its way" card for it. Everything else works without them.
Setup hints with file paths are only shown when you open the site locally (`file://` or `localhost`), never on the hosted site.

## Run it

- **Easiest:** double-click `index.html`.
- **Local server (best for testing the video):** in this folder run

  ```
  powershell -ExecutionPolicy Bypass -File serve.ps1
  ```

  then open <http://localhost:8000> (`-Port 9000` for another port).
- **On your phone (same Wi-Fi as this PC):** run

  ```
  powershell -ExecutionPolicy Bypass -File serve-lan.ps1
  ```

  It prints the address to open on the phone (e.g. `http://192.168.1.10:8126`). The first time, Windows may ask whether to allow PowerShell through the firewall: tick **both** "Private" and "Public" networks and click **Allow**. It never serves `_backup/` or the scripts.
- **Online:** upload the whole folder to any static host (Netlify, GitHub Pages, Cloudflare Pages…).

Jump straight to a chapter while checking: `index.html?view=finale` (views: `parcel`, `cover`, `play`, `her`, `us`, `apart`, `party`, `finale`).

## Voice-note script

There's one voice note, on the distance chapter. Record it, export as **MP3** (or M4A, but then change the path in `js/data.js` → `voiceNotes`), and save it at the path above.
If you already recorded it from your own script, just save it with this name. Change its `title`/`note` in `js/data.js` → `voiceNotes` if the topic is different.

### `assets/audio/voice-message.mp3` — "Happy birthday, sayang"
*Shown note: "Press play first. Before the cake. I mean it."* — about 45–60 seconds.

> Sayanggg. Happy birthday! Happy birthday, my Sifaaa.
> Okay, I'm trying to sound normal, but I'm literally smiling like an idiot right now, so… yeah.
> Today is your day. Thirtieth of October. The day the world got its favourite little troublemaker. Hehe.
> Jokes aside, sayang — I'm really, really happy you were born. I hope today you feel celebrated, and spoiled, and loved, because you are. So much.
> I hope this year is good to you. Good days, good sleep, lots of laughing, and every dream you're carrying getting a little closer.
> Okay. Now go eat cake. And reply to my messages today, okay? It's your birthday, not a holiday from me.
> Happy birthday, sayang. I love you.

## The journey

| # | Chapter | Mood | What happens |
|---|---|---|---|
| – | **The parcel** | curiosity | A wrapped box with a shipping label. "Is this Sifa?" (saying *No* gets teased, with a boing). Pull the ribbon, optionally with music. |
| – | **Cover + Contents** | anticipation | "SIFAA — the birthday issue", with a sticker that counts down to 30 October in her time zone. The contents page stamps chapters *read* / *next*. The **Contents** button always returns here. |
| 01 | The warm-up round | laughing | The Official Sifa Exam: 6 biased questions about us, each answer with its own red-pen reaction. Then a scratch card (prize: one Faizan). |
| 02 | A field guide to Sifa | her | Her facts (name, 30 October, Indonesia…), an optional "today's birthday mood" pick, flip-able sticky notes, and a photo wall if photos exist. |
| 03 | How it started | affection | Diary entries, Sifaa + Faiz = SIFAAIZ, and a jar of reasons, one note per tap. |
| 04 | The distance | quiet, hopeful | Live clocks ("right now with you" / "right now here"), the "from here → to there" airmail route, the "Happy birthday, sayang" voice note, 12 open-when letters, the notebook of hopes, and one no-jokes letter. No effect sounds here except a soft chime when a letter opens. |
| 05 | Your birthday | joy | Cake in three steps (wish → blow each candle → party horn + confetti), then a present that opens one wish at a time, then "one more, please" compliments. |
| 06 | The last page | the finale | A short intro, "Okay, I'm ready", then the video with the lights dimmed. After it: the closing letter, SIFAA ♥ FAIZ merging into SIFAAIZ, and a soft fanfare. |

## Birthday extras (added 28 October)

All of these work off **her time zone**: from 00:00 on 30 October in Indonesia.

- **Birthday mode:** the cover sticker counts down ("2 days to go!", "Tomorrow!!") and switches to "Happy birthday!" at midnight. The cover also gets a "Birthday edition" stamp (on the 30th) or "Birthday week edition" (31 Oct – 5 Nov).
- **Birthday week:** seven boxes on the contents page, one unlocking per day from 30 October to 5 November. Each day is a different little game:

  | Day | Date | Game |
  |---|---|---|
  | 1 🎟️ | 30 Oct | Three birthday coupons she claims and screenshots to you |
  | 2 🤔 | 31 Oct | "You decide": she picks what you have to do (no take-backs) |
  | 3 🥠 | 1 Nov | A fortune cookie she cracks (same fortune all day) |
  | 4 ✉️ | 2 Nov | An envelope that only opens if she presses and holds: the sincere "I'm proud of you" |
  | 5 😈 | 3 Nov | Dare day: flip one of three cards (one re-flip allowed), then "I did it ✓" |
  | 6 🧩 | 4 Nov | A riddle (answer: SIFAAIZ) with a prize |
  | 7 🤍 | 5 Nov | The last letter: "Day 8 doesn't have a date yet…" |

  How it pulls her back each day:
  - Every box shows its emoji even while locked, and **tomorrow's box shows a teaser** ("something you have to crack open").
  - Every game ends with a preview of the next box.
  - A yellow chip, **"🎁 Day N is ready. Open it, lazy potato."**, floats at the bottom of every page until she opens it.

  Her answers, claims and fortunes are remembered on her phone. Coupons, the day-2 options and the dares are promises from you, so change any you wouldn't actually do: `js/data.js` → `birthdayWeek.days`.
- **The plane:** on the distance chapter, the paper plane on the route sits further along for every chapter she's read, glides there when she scrolls to it, and lands on "To there" once all six are read. Text in `js/data.js` → `route`.
- **Tell Fizuu you finished:** a button on the last page that opens WhatsApp with a ready-made message she can edit. To send it straight to your chat, put your number (country code, digits only, e.g. `923001234567`) in `js/data.js` → `whatsapp.number`. Left empty, WhatsApp asks her to pick a chat.
- **5 secrets**, counted on the contents page ("Secrets found: n / 5"), remembered on her phone:
  1. Tap the 🥔 on her field-guide card 5 times: potato storm.
  2. Press and hold the big **SIFAA** on the cover.
  3. Tap the two clocks 3 times quickly: "sayang o'clock".
  4. Keep tapping the round sticker on the cover until it gives up.
  5. Flip the sticky note that says "Don't flip this one."

  Finding all five shows a final message plus confetti. Text in `js/data.js` → `secrets`.

**Previewing a date while testing:** add `&today=YYYY-MM-DD` to the address, e.g. `index.html?view=cover&today=2026-10-30`. This only works when opened locally, never on the hosted site.

## Motion polish (added 28 October)

A "magazine in motion" layer, all in one block at the end of `css/style.css` ("MOTION POLISH"):
- **Titles:** they arrive word by word (rise and un-blur). The big **SIFAA** masthead drops in letter by letter, and the cover polaroid is dropped onto the page and settles at its tilt.
- **The parcel:** pulling the ribbon makes the magazine rise out of the box.
- **Page turns:** the coloured sheet swings in from a corner, and the chapter name stamps onto it.
- **Photos:** real photos "develop" like a polaroid, from washed-out white to full colour.
- **Paper details:** tape strips press on, the "very loved" stamp and the postmarks thump down, and on a computer the polaroids, ticket, present and notebook lean toward the mouse.
- **Taps:** every button press throws a small pinch of coloured paper dots.
- **Reading ribbon:** a thin ribbon at the top of each chapter fills as she scrolls.
- **Birthday chapter:** seven balloons float up once when she arrives.
- **Finale:** after the video, slow paper snow drifts down over the closing words.

Phones with "reduce motion" switched on get a calm, still version with everything shown immediately.

**Reverting:** earlier versions are saved in `_backup/` (newest first: `2026-10-28-before-motion-polish/`). Copying a backup's `index.html`, `css/` and `js/` back over the current ones restores it exactly; media files aren't affected.
- `_backup/2026-10-28-week-v1-with-extras/`: extras with the simple text-only birthday week
- `_backup/2026-10-28-before-extras/`: before birthday week, plane, WhatsApp and secrets
- `_backup/2026-10-24-before-redesign/`: the original black-and-gold site

## Sound

All audio is local, in `assets/audio/`, downloaded from Pixabay (free to use under the [Pixabay Content License](https://pixabay.com/service/license-summary/); no attribution required). Two separate controls sit in the top-right corner: **♪ music** and **🔊 FX**.

### Music (one ♪ button for all tracks)

| File | Track (Pixabay) |
|---|---|
| `assets/audio/happy-birthday.mp3` | *Happy Birthday* — andriih (smooth jazz instrumental) |
| `assets/audio/her.mp3` | *her* — JVKE (your own copy; shown as **"HER"** on the music button) |
| `assets/audio/emotional-piano.mp3` | *Emotional Soft Piano Inspiring* — DELOSound |

Which track plays where (`js/data.js` → `music.views`):

| Page | Track |
|---|---|
| Parcel (opening) · Cover & contents · 01 Warm-up | 🎂 Happy Birthday |
| 02 Field guide · 03 How it started | 🎹 HER (JVKE) |
| 04 The distance | 🎼 Soft piano |
| 05 Your birthday | 🎂 Happy Birthday (soft piano while she reads the present's wishes, then back) |
| 06 Last page, before the video | 🎹 HER (JVKE) |
| During the video | 🔇 silence |
| After the video | 🎂 Happy Birthday returns for the ending |

- **Never autoplays:** she starts it with *"Play our song while you read"* on the parcel, or the ♪ button. After a refresh it honestly shows *"Paused · tap to resume"*.
- **Song changes are a little scene, not a crossfade.** When a new page has a different song:
  1. The old song fades out under the page turn (about 1 s), and the ♪ button's note turns like a record ("Changing the song…").
  2. A breath of quiet with a soft harp sparkle (the harp follows the FX button).
  3. The new song blooms in slowly (about 2.6 s), and a "♪ now playing · HER" ribbon slides out under the button.

  Two songs never overlap. Each song keeps its own position, so nothing restarts. Flipping quickly back to the same page simply brings the song back.
- **Volumes are low:** 0.24–0.32; Happy Birthday is a bit lower because it's mastered louder. The button shows which track is playing, and the equalizer only moves while sound is really playing.
- **Voice notes and the video:** all music fades out completely, then fades back in afterwards.
- **Replace a track:** drop a new MP3 with the same file name, or change `music.tracks.<name>.src` / `title` / `volume`. To change which page uses which track, edit `music.views`.
- **If a track is missing:** a missing main track makes the button say *"Not added yet"*. Any other missing track falls back to the main song.
- `assets/audio/birthday-celebration.mp3` (*Birthday* — The_Mountain) and `assets/audio/background-music.mp3` (the previous "Our song", *Sentimental Piano with Acoustic Guitar*) are no longer used. Keep them as spares or delete them.
- **About "her" by JVKE:** it's a commercial, copyrighted song. Using your own copy in a private gift is between you and Sifa, but if you put the site online, keep the link private (don't post it publicly).

### Sound effects (🔊 FX button, independent of the music)

| File | Sound (Pixabay) | Used for |
|---|---|---|
| `assets/audio/pop-click.mp3` | *Pop Click* — SoundReality | Flipping a sticky note, taking a note from the reasons jar, mood picks, "Yes, it's me", "I've made my wish", compliments, sweet quiz answers |
| `assets/audio/funny-boing.mp3` | *Funny Cartoon Jump* — KoiRoylers | Funny quiz answers (incl. "My ungrateful potato 🥔"), "No, I'm someone else", tapping the parcel or a candle too early, "Annoy Fizuu all day" |
| `assets/audio/magic-reveal.mp3` | *Magic Surprise* — Universfield | Only 3 times: pulling the ribbon, opening the present, the reveal after the video |
| `assets/audio/birthday-cheer.mp3` | *Crowd Cheer and Applause* — DRAGON-STUDIO | Once, when the last candle goes out |

There are also a few tiny sounds made in the browser (no files): a soft chime when a letter opens, a candle puff, a sad trombone on the two wrong answers, a ding when the scratch card or exam is done, and a paper swoosh when turning between playful chapters.

Rules built in:
- A sound only plays after she taps something.
- A new sound cuts off the previous one, so they never stack. Pops are at least 0.26 s apart and boings 0.7 s, so quick tapping doesn't machine-gun.
- Nothing plays during a voice note or the video.
- The distance chapter gets only the soft letter chime.

Change or replace an effect in `js/data.js` → `sounds.files` (paths) and `sounds.volumes` (per-sound loudness). A missing file falls back to a built-in sound. `sounds.enabled: false` removes effects entirely.

## Photos (optional)

The site is complete without photos. Missing photos are simply not shown. The cover and her field-guide card show a little handwritten note instead. To add photos, use these names in `assets/photos/` (or change paths in `js/data.js`):

- **Cover photo:** `assets/photos/cover.jpg`
- **Field-guide polaroid** (next to her facts): `assets/photos/field-guide.jpg`

  Both also accept `.jpeg`, `.png` or `.webp` with the same name. Both sit in a portrait 4:5 frame and are cropped to fill, so a portrait photo works best.
- Optional extras: `gallery-1.jpg` … `gallery-6.jpg` · `story-1.jpg` … `story-3.jpg` · `birthday-1.jpg` … `birthday-3.jpg`

About 1600px on the long edge, JPEG ~75–80. Gallery captions are already written ("exhibit B — innocent face (lies)" …).

## Video tips
- Export **MP4 (H.264 + AAC)**, 720p or 1080p, ideally under ~60 MB.
- Vertical phone video is fine: set `video.aspect` to `"9 / 16"` (the real size is detected automatically anyway).
- All text around the video is in `js/data.js` → `video`.

## Editing the words

Every line lives in `js/data.js`, grouped by chapter: parcel, cover, chapters, quiz (`correct` = an index, an array of indexes, or `"any"`; `sound` = `sting`/`pop`/`sad`), scratch card, facts, moods, notes, captions, story, reasons, places, voice notes, letters (`\n\n` between paragraphs, signed "— Faizan" automatically), notebook, letter, cake, present, video, music, sounds.

## Structure

```
index.html          all chapters (markup)
css/style.css       the visual identity, per-chapter palettes, reduced-motion mode
js/data.js          ✏️ all words and media paths
js/animations.js    scroll reveals, page-turn wipe, confetti, name merge
js/interactions.js  components: photos, exam, scratch card, notes, jar, sound effects, music,
                    voice notes, letters, notebook, clocks, cake, present, birthday video
js/app.js           story flow, parcel, contents, chapter navigation
serve.ps1           tiny local server (supports video seeking)
assets/             fonts, photos, audio, media (video), icons
_backup/            the old black-and-gold version, untouched
```

## Notes
- The browser console lists a harmless 404 for each media file that isn't there yet.
- Respects `prefers-reduced-motion`. Every action has visible feedback, so nothing relies on sound alone.
- Controls are real buttons with focus styles, keyboard access and ≥44px touch targets. Letters and photos use native `<dialog>` (Esc closes).
- Progress (opened parcel, chapters read, letters opened, mood, music/FX choice) lasts for the browser session.
