/* =========================================================================
   SIFAAIZ — ALL THE WORDS  ·  "The Birthday Issue"
   -------------------------------------------------------------------------
   Every personal line on the site lives in this file. Change text, swap
   photos or audio here — no need to touch the HTML, CSS or other JS.

   MEDIA STILL TO ADD (everything else is finished):
     assets/media/assifa-birthday-video.mp4          the birthday video
     assets/photos/assifa-birthday-video-poster.jpg  optional poster
     assets/audio/voice-message.mp3                  the voice note
     assets/audio/background-music.mp3               optional song
   Scripts for the voice notes are in README.md.

   PHOTOS (optional)
     Drop files into /assets/photos/ with the names below and they appear.
     Missing photos simply aren't shown (the cover and her field-guide
     card show a little drawn note instead), so nothing looks broken.
   ========================================================================= */

window.SIFAAIZ_DATA = {
  name: "Assifa Niswa",
  nickname: "Sifa",
  partner: "Faizan",
  coupleName: "SIFAAIZ",
  /* Her date of birth. Her age, the number candles, "Issue No. 19" and the
     odometer are all worked out from this (in her time zone), so they're
     always right. Anywhere in the text, {age} becomes her age and {ordinal}
     becomes "19th". */
  birthday: { month: 10, day: 30, year: 2007, label: "30 October" },

  /* THE SIFA ODOMETER — top of the birthday chapter. Numbers count up when
     she arrives; the seconds keep ticking while she watches. */
  odometer: {
    title: "The Sifa odometer",
    unit: "years of Sifa",
    stats: [
      { key: "days",    label: "days of being adorable" },
      { key: "hours",   label: "hours of being a troublemaker" },
      { key: "beats",   label: "heartbeats (roughly)" },
      { key: "replies", label: "times you made me wait for a reply" }
    ],
    live: "…and {seconds} seconds. Still counting. ⏱️",
    note: "Level {age} unlocked. New abilities: even more annoying, even more loved. 🎮"
  },

  /* Shown on the loader while the page gets ready. */
  loading: { first: "Hold on sayang, wrapping your present…", again: "Welcome back, troublemaker…" },

  /* ---------------------------------------------------------------------
     THE PARCEL (opening)
     --------------------------------------------------------------------- */
  parcel: {
    contents: "One birthday. Handmade by Fizuu. Slightly over-engineered.",
    handling: "With care. Recipient is a troublemaker.",
    wrongTap: "patience, troublemaker. security check first ↓",
    ready: "go on. pull it.",
    /* When she insists she is NOT Sifa. One line per tap. */
    notMe: [
      "Hm. The label says Sifa. The label has never been wrong.",
      "Sayanggg. You're saying no just to annoy me, aren't you? 😂"
    ]
  },

  /* ---------------------------------------------------------------------
     THE COVER
     --------------------------------------------------------------------- */
  cover: {
    issue: "The Birthday Issue",
    /* COVER PHOTO → save as assets/photos/cover.jpg (.jpeg / .png / .webp also work).
       It's shown in a portrait 4:5 frame and cropped to fill, so a portrait photo looks best. */
    photo: { src: ["assets/photos/cover.jpg", "assets/photos/cover.jpeg", "assets/photos/cover.png", "assets/photos/cover.webp"],
             alt: "Sifa on the cover of her birthday issue", width: 1200, height: 1500 },
    noPhoto: "Cover model: Sifa. Photo not included — you already know what you look like, sayang. 😌",
    /* Handwritten line on the cover polaroid's white strip, under the crown. */
    photoCaption: "the birthday queen · 30.10",
    lines: [
      { kicker: "Exclusive", text: "Fizuu admits who really wins our arguments" },
      { kicker: "Inside", text: "An exam you can't fail. I checked. Twice." },
      { kicker: "Also", text: "Cake, candles, and one very suspicious present." }
    ],
    /* The round sticker on the cover counts down to her birthday (her time zone). */
    sticker: { before: "{n} days to go!", tomorrow: "Tomorrow!!", today: "Happy birthday!", after: "Still your birthday week." },
    contentsNote: "read in order, sayang. skipping straight to the cake is allowed, but I will know. 👀",
    start: { first: "Start reading, sayang", next: "Keep reading · {title}", again: "Read it all again" }
  },

  /* ---------------------------------------------------------------------
     BIRTHDAY MODE — from 00:00 on 30 October (her time zone) the cover
     wears a stamp, and the birthday week below starts unlocking.
     --------------------------------------------------------------------- */
  edition: { birthday: "Birthday edition", week: "Birthday week edition" },

  /* BIRTHDAY WEEK — one note unlocks every day, starting on her birthday
     (day 1 = 30 October, day 7 = 5 November, her time). Shown on the
     contents page; each note opens like a letter. */
  /* Every day is a different little game. "icon" shows on the box even
     while it's locked; "teaser" shows on tomorrow's box, so she always
     knows something good is coming but not what.
     Types: coupons · choice · fortune · hold · dare · riddle · letter.
     Coupons, the "would you rather" and the dares are little promises from
     you. Change any you wouldn't actually do. */
  birthdayWeek: {
    title: "Birthday week",
    hint: "A new surprise unlocks every day until 5 November. Each one is different. Don't skip a day, sayang. 👀",
    before: "Opens on your birthday. No peeking. 👀",
    locked: "not yet",
    nudge: "🎁 Day {n} is ready. Open it, lazy potato.",
    nextUp: "Tomorrow's box: {teaser}",
    days: [
      { type: "coupons", icon: "🎟️", title: "Day one · Birthday coupons",
        teaser: "three tickets with your name on them",
        intro: "It's officially your birthday, sayang. 🎂\n\nIf you're reading this right at midnight, that's because I sent it at exactly 00:00 your time. Yes, I timed it. Yes, I'm that guy.\n\nPresent number one: three coupons. Tap one to claim it, screenshot it, send it to me. Once you send it, I'm legally bound. 😌",
        coupons: [
          { icon: "🎤", text: "One \"Happy Birthday\" song, sung by me on a call. Badly. Very badly." },
          { icon: "🏳️", text: "One \"You were right, I was wrong.\" No arguing allowed. (I'll hate every second.)" },
          { icon: "📞", text: "One call where you pick every topic, and I'm not allowed to say \"sayang, sleep\"." }
        ],
        claimed: "CLAIMED · send me the screenshot",
        outro: "Happy birthday, my Sifaaa. Tomorrow's box is already waiting. Don't be lazy. 🥔" },

      { type: "choice", icon: "🤔", title: "Day two · You decide",
        teaser: "a decision only you can make",
        intro: "Birthday's over? Says who. Birthday-week rules: you're still the main character until 5 November.\n\nSo today you get to pick what I have to do. Choose wisely. Or chaotically. Your call.",
        options: [
          { text: "Fizuu sends me a voice note singing (badly)", reaction: "Noted. Expect it. Don't laugh. (You'll laugh.) 🎶" },
          { text: "Fizuu writes me a 10-line poem", reaction: "A poem?? Okay… give me 24 hours and zero judgment. 😭" },
          { text: "Fizuu agrees with everything I say for one hour", reaction: "Dangerous choice. I respect it. One hour, starting the moment you text me \"now\"." }
        ],
        outro: "Screenshot your choice and send it. No take-backs. 🤝" },

      { type: "fortune", icon: "🥠", title: "Day three · Fortune cookie",
        teaser: "something you have to crack open",
        intro: "Tap the cookie. It knows things. (It's the same fortune all day, so choose your moment.)",
        button: "Crack it",
        fortunes: [
          "You will receive a message from a very handsome man in Pakistan today. Lucky you. 😌",
          "Your lucky number is how many hours you take to reply. So… 3. 🥔",
          "Something you're worrying about will turn out fine. The cookie is sure. So am I.",
          "Great things are coming your way this year. At least one of them is me.",
          "Today you will smile at your phone for no reason. (The reason is me.)"
        ],
        outro: "Screenshot your fortune. If it comes true, the cookie gets the credit. If it doesn't, blame the cookie." },

      { type: "hold", icon: "✉️", title: "Day four · Hold to open",
        teaser: "an envelope that only opens if you hold it",
        intro: "No jokes today. Press and hold the envelope until it opens.",
        hold: "Keep holding…",
        text: "I'm proud of you, Sifa.\n\nOf the person you are, and the one you're becoming. Not because of anything you did this week. Just because you're you.\n\nThat's the whole note. ❤️" },

      { type: "dare", icon: "😈", title: "Day five · Dare day",
        teaser: "a dare. are you brave enough? 😈",
        intro: "Three cards. Flip one. Whatever it says, you have to do it today. No re-flipping. (Okay, one re-flip. Birthday week.)",
        dares: [
          "Send me a voice note saying \"Fizuu is always right.\" Exactly like that. 😌",
          "Reply to my next 5 messages within 5 minutes each. For science. 🥔",
          "Send me a selfie with your most innocent face. I'll rate it out of 10. (It'll be a 10.)"
        ],
        done: "I did it ✓",
        doneStamp: "Dare completed (allegedly) 😏",
        outro: "Proof goes to WhatsApp. I'm waiting. 👀" },

      { type: "riddle", icon: "🧩", title: "Day six · A riddle",
        teaser: "a riddle only you can solve",
        question: "I'm two names glued together. I'm the title of this whole thing. I'm basically us. What am I?",
        options: [
          { text: "Sayang", wrong: "Close. Sweet. Wrong. 😂" },
          { text: "SIFAAIZ", right: true },
          { text: "A potato", wrong: "You're the potato. Try again. 🥔" }
        ],
        solved: "Correct, smart girl. 🧠\n\nYour prize: go back to The distance and open one letter you haven't opened yet. You know the one. 👀\n\nTomorrow is the last box. Make it count." },

      { type: "letter", icon: "🤍", title: "Day seven · The last one",
        teaser: "the last one. don't miss it. 🤍",
        text: "Birthday week is officially over. Tragic. 😔\n\nBut here's the secret: you don't stop being my favourite person when the week ends. I'll see you in all the ordinary days after this one, sayang. The good mornings, the late nights, the three-hour replies. All of it.\n\nAnd there's a Day 8. It just doesn't have a date yet. It's the day I finally get to see you in person.\n\nNext issue: in person. 🤍" }
    ]
  },

  /* EASTER EGGS — five hidden things. The counter sits on the contents page.
     Where they are: tap the 🥔 on her field-guide card 5×, press and hold
     the big SIFAA on the cover, tap the two clocks 3×, keep tapping the
     round sticker on the cover, flip the "Don't flip this one." note. */
  secrets: {
    total: 5,
    hint: "There are 5 secrets hidden in this issue. Good luck, troublemaker.",
    count: "Secrets found: {n} / {total}",
    found: "Secret {n} of {total} found 🕵️‍♀️",
    all: "All 5 secrets found. You're officially too nosy. I love it. 🥹",
    messages: {
      potato: "Potato storm unlocked. 🥔 You tapped it five times. Of course you did.",
      masthead: "You held it long enough to find this: I hid little things everywhere because I knew you'd poke around.",
      clock: "It's always sayang o'clock over here. ⏰",
      sticker: "Okay okay, the sticker gives up. You win. You always win.",
      note: "Rule-breaker detected. 🚨 Noted for the record, troublemaker."
    },
    sticker: ["hey.", "stop poking me.", "I'm a sticker, not a button.", "fine. 🙄"],
    clock: "sayang o'clock"
  },

  /* ---------------------------------------------------------------------
     THE CONTENTS — one entry per chapter (ids must match index.html).
     --------------------------------------------------------------------- */
  chapters: [
    { id: "play",   title: "The warm-up round",      note: "An exam, a scratch card, zero pressure. Promise." },
    { id: "her",    title: "A field guide to Sifa",  note: "Notes on one very specific troublemaker." },
    { id: "us",     title: "How it started",         note: "Two people, two countries, too many late-night talks." },
    { id: "apart",  title: "The distance",           note: "The quiet part. Read this one slowly, sayang." },
    { id: "party",  title: "Your birthday",          note: "Cake, candles, wishes. Your day, your rules." },
    { id: "finale", title: "The last page",          note: "Save this one for last. I mean it. 👀" }
  ],

  /* ---------------------------------------------------------------------
     01 · THE WARM-UP — the exam
     correct: index of the right option, an array of indexes, or "any"
              (every answer counts — most questions here are biased anyway).
     Each option has its own red-pen reaction. sound: "boing" | "pop" | "sad"
     --------------------------------------------------------------------- */
  quiz: [
    {
      question: "Who's the biggest troublemaker in this relationship?",
      correct: "any",
      options: [
        { text: "Obviously Sifa.", reaction: "Finally, some honesty. I'm proud of you. 😌", sound: "boing" },
        { text: "Still Sifa. Don't try to escape.", reaction: "Correct. There is no escape. The court has spoken.", sound: "boing" },
        { text: "Fizuu, according to Sifa's court.", reaction: "Objection! …overruled, because it's your birthday. Fine. 🙄", sound: "boing" }
      ]
    },
    {
      question: "What is Sifa's official birthday title?",
      correct: "any",
      options: [
        { text: "Princess of being adorable", reaction: "Accurate. Annoyingly accurate.", sound: "pop" },
        { text: "CEO of annoying Fizuu", reaction: "Twelve months of hard work. You've earned the promotion. 😂", sound: "boing" },
        { text: "Chief Unpaid Manager of Faizan's Heart", reaction: "Unpaid, overworked, and still somehow the boss. Yeah, that's you.", sound: "pop" }
      ]
    },
    {
      question: "Fizuu sends \"sayanggg\" and hears nothing for three hours. What is Sifa doing?",
      correct: "any",
      options: [
        { text: "Very important business.", reaction: "Sure. Very important. I believe you. (I don't.)", sound: "boing" },
        { text: "Saw it. Smiled. Replied later on purpose.", reaction: "I KNEW it. My ungrateful potato. 🥔", sound: "boing" },
        { text: "Crafting the perfect reply.", reaction: "Three hours for \"hehe\"? A masterpiece. Truly worth the wait.", sound: "boing" }
      ]
    },
    {
      question: "What does SIFAAIZ actually mean?",
      correct: 1,
      options: [
        { text: "A random word", reaction: "Random?! I'm offended. Deeply. Personally. 😤", sound: "sad" },
        { text: "Sifaa + Faiz", reaction: "Exactly. Your name first, obviously. I know my place.", sound: "pop" },
        { text: "A medicine brand", reaction: "It does sound like one. Take twice daily for happiness. Still wrong though. 😂", sound: "sad" }
      ]
    },
    {
      question: "How many times does Fizuu say \"sayang\" in one day?",
      correct: "any",
      options: [
        { text: "A normal amount.", reaction: "Hehe. Define normal.", sound: "boing" },
        { text: "Way too many.", reaction: "There's no such thing as too many. Complaint rejected, sayang.", sound: "boing" },
        { text: "Is there a limit?", reaction: "No. Next question.", sound: "boing" }
      ]
    },
    {
      question: "Who's the main character today?",
      correct: 1,
      options: [
        { text: "Faizan", reaction: "Not today. Today I'm just the guy holding the cake.", sound: "sad" },
        { text: "Sifa", reaction: "Obviously. 30 October belongs to you.", sound: "pop" },
        { text: "The cake", reaction: "The cake is a supporting character at best. Don't give it ideas.", sound: "sad" }
      ]
    }
  ],
  quizResult: {
    perfect: "Full marks, dumb girl. Okay okay — smart girl. Just for today. 😌",
    curved: "Birthday curve applied. Everyone gets an A+ today. Especially you.",
    retake: "Retake the exam (why though)"
  },

  /* 01 · THE WARM-UP — scratch card */
  scratch: {
    title: "Birthday scratch card",
    foil: "SCRATCH ME  ✶  GO ON",
    prize: "One (1) Faizan.",
    detail: "Lifetime supply. Already yours, sayang.",
    fine: "No returns. No exchanges. Annoying you is included at no extra cost.",
    reveal: "Can't scratch? Just reveal it, lazy potato 🥔"
  },

  /* ---------------------------------------------------------------------
     02 · A FIELD GUIDE TO SIFA
     --------------------------------------------------------------------- */
  facts: [
    { label: "Full name",     value: "Assifa Niswa" },
    { label: "Goes by",       value: "Sifa, Sifaa, sayang" },
    { label: "Birthday",      value: "30 October 2007" },
    { label: "Level",         value: "{age} 🎮 (just unlocked)" },
    { label: "Habitat",       value: "Indonesia" },
    { label: "Distance from Fizuu", value: "From Pakistan to Indonesia. Way too far." },
    { label: "Also known as", value: "my little troublemaker, my ungrateful potato 🥔" },
    { label: "Special skill", value: "Making me wait for replies" }
  ],
  /* FIELD-GUIDE PHOTO (the tilted polaroid next to her facts)
     → save as assets/photos/field-guide.jpg (.jpeg / .png / .webp also work).
     NOT .HEIC: iPhone HEIC photos only show in Safari. Convert to JPG first.
     width/height = the photo's real size; it sets the frame's shape.
     A landscape photo (wider than tall) gets a wider polaroid automatically. */
  fieldGuidePhoto: { src: ["assets/photos/field-guide.jpg", "assets/photos/field-guide.jpeg", "assets/photos/field-guide.png", "assets/photos/field-guide.webp"],
                     alt: "Sifa, the specimen herself", width: 1280, height: 720 },
  noPhoto: "Specimen photo: not needed. I'd recognise this troublemaker anywhere.",
  /* Handwritten line on the polaroid's white strip (the crown sits on top). */
  fieldGuideCaption: "rare specimen · certified queen 👑",

  /* An optional, playful choice (nothing is saved anywhere but her browser). */
  moods: {
    title: "Today's birthday mood",
    hint: "Pick one. Or don't. I'm taking notes either way. 📝",
    options: [
      { text: "Princess mode. Treat me accordingly. 👑", reaction: "Noted, Your Highness. I'll behave. Mostly." },
      { text: "Sleep till noon, then cake.", reaction: "Honestly? The most reasonable birthday plan I've ever heard." },
      { text: "Annoy Fizuu all day.", reaction: "So… a normal day, then? 😂 Fine. Birthday rules.", sound: "boing" },
      { text: "Soft and emotional, don't ask.", reaction: "Okay sayang. Then the later pages are for you. Take your time with them. ❤️", quiet: true }
    ]
  },

  /* The little things — sticky notes she can flip. */
  littleThings: [
    { title: "Your smile",
      message: "Sayang, your smile is honestly unfair. I can be fully ready to complain about something, and then you smile and I forget what I was even annoyed about." },
    { title: "Your voice",
      message: "Some days your voice is the softest part of my whole day. Even when you're using it to argue with me." },
    { title: "Your innocent face",
      message: "You act so innocent, Sifaaa. Who do you think you're fooling, huh? I know that face. That's the \"I'm about to annoy Fizuu\" face. 😂" },
    { title: "Your little efforts",
      message: "You never make a big deal out of the small things you do. I notice them anyway. Every single one." },
    { title: "Your weirdness",
      message: "Your weirdness and my weirdness get along suspiciously well. I wouldn't trade a single strange part of you." },
    { title: "The way you say my name",
      message: "Lots of people say my name. It only sounds like that when it's you." },
    { title: "Your slow replies",
      message: "You make me wait for your replies like I'm waiting for exam results. And there I am anyway, checking my phone like a fool. Hehe." },
    { title: "How you became my everyday",
      message: "Somewhere along the way you stopped being someone I talk to and became part of how my days work. Good morning, good night, and every annoying thing in between." },
    { title: "Your dreams",
      message: "The way you think about your future is one of my favourite things about you. Go after every single dream this year. I'll be the one cheering way too loud." },
    { title: "Don't flip this one.", secret: "note",
      message: "You flipped it. Of course you did. That's exactly why I like you. 😌" }
  ],

  /* The photo wall (opens in a viewer). Empty list = the whole wall is
     hidden. To use it, add the photos to assets/photos/ and uncomment. */
  gallery: [
    // { src: "assets/photos/gallery-1.jpg", alt: "Sifa", caption: "exhibit A — suspiciously cute", width: 1200, height: 1500 },
    // { src: "assets/photos/gallery-2.jpg", alt: "Sifa", caption: "exhibit B — innocent face (lies)", width: 1200, height: 1200 },
    // { src: "assets/photos/gallery-3.jpg", alt: "Sifa", caption: "exhibit C — my favourite", width: 1200, height: 1600 },
    // { src: "assets/photos/gallery-4.jpg", alt: "Sifa", caption: "exhibit D — birthday girl energy", width: 1200, height: 1200 },
    // { src: "assets/photos/gallery-5.jpg", alt: "Sifa", caption: "exhibit E — the potato in her natural habitat", width: 1200, height: 1500 },
    // { src: "assets/photos/gallery-6.jpg", alt: "Sifa", caption: "exhibit F — no comment, just staring", width: 1200, height: 1500 }
  ],

  /* ---------------------------------------------------------------------
     03 · HOW IT STARTED
     Themes, no dates. Photos are optional and hide if missing.
     --------------------------------------------------------------------- */
  howItStarted: {
    moments: [
      { title: "Late-night talks",
        text: "The ones that were supposed to be \"just five more minutes\". They never were. Not even once." },
        // optional photo: photo: { src: "assets/photos/story-1.jpg", alt: "", caption: "", width: 1200, height: 1500 }
      { title: "Laughing together",
        text: "At some point the best part of my day just quietly became you." },
      { title: "Roasting each other",
        text: "Nobody wins. Everybody laughs. You cheat, obviously, but I let it slide." },
      { title: "Little efforts",
        text: "Small things, done quietly, that said more than any big speech could." },
      { title: "Small moments that started meaning everything",
        text: "None of them felt big at the time. Now I can't imagine my days without them." }
    ]
  },

  /* The jar of reasons — one folded note per tap. */
  whyYou: [
    "Because talking to you never feels like effort. Even when you're being difficult. Especially then.",
    "Because you can roast me and make me feel loved in the same sentence. That's a rare talent, sayang.",
    "Because with you I don't have to pretend to be anyone. I just get to be me.",
    "Because you care in quiet ways most people wouldn't even notice. I notice.",
    "Because you make a few thousand kilometres feel a lot smaller than they are.",
    "Because even my most boring day gets better the second your name pops up on my screen.",
    "Because you're soft and strong at the same time, and you don't even realise it."
  ],
  reasonsEnd: [
    "I could keep going, honestly. The jar's just too small.",
    "But you know what? I don't love you because of a list, sayang."
  ],
  reasonsBig: "I love you because you're you.",

  /* ---------------------------------------------------------------------
     04 · THE DISTANCE
     --------------------------------------------------------------------- */
  places: {
    mine: "From here", myZone: "Asia/Karachi", myLabel: "Right now here",
    yours: "To there", yourZone: "Asia/Jakarta", yourLabel: "Right now with you",
    note: "You're two hours ahead of me, so technically your birthday starts before mine does. Unfair."
  },
  /* The paper plane on the route flies a little further with every chapter
     she reads, and lands once she's read them all. */
  route: {
    progress: "{n} of {total} pages read. The plane gets a little closer every page.",
    landed: "Landed. Next issue: in person. ✈️"
  },
  apartText: "From Pakistan to Indonesia. A few thousand kilometres, two time zones, and too many goodnights through a screen. And somehow, you're still the person closest to me.",

  /* The voice note. Record the script in README.md and save the file at
     this path. Until the file exists, its card says it's on the way. */
  voiceNotes: [
    { src: "assets/audio/voice-message.mp3",
      title: "Happy birthday, sayang",
      note: "Press play first. Before the cake. I mean it." }
  ],
  voiceMissing: "Still recording this one for you. It'll be right here soon 🎙️",

  /* Open-when letters (airmail envelopes). Use \n\n between paragraphs.
     Every letter is signed "— Faizan" automatically. */
  openWhen: [
    { label: "it's your birthday",
      message: "Happy birthday, sayang! 🎂\n\nToday you're not allowed to be stressed, busy, or responsible for anything. Today you just get to be celebrated. Eat something nice. Say yes to cake. Let people spoil you a little.\n\nAnd if anyone annoys you today, tell me. I'll be dramatic about it on your behalf. That's my job.\n\nHappy birthday, my Sifaaa. ❤️" },
    { label: "you're sad",
      message: "Hey, sayang.\n\nYou don't have to explain why you're sad. You don't have to fix it right now either. Some feelings just need a little time, and that's okay.\n\nTake a slow breath. Drink some water. Wrap yourself in a blanket if you want. And whenever you feel like talking, I'm here. Even if all you want to send me is a sad face and nothing else, that's allowed too.\n\nYou're not too much, and you're not alone in this. I've got you." },
    { label: "you've had a bad day",
      message: "Okay. Bad day. Tell me who did this. 😤\n\nSeriously though, I'm sorry today was rough. Some days go wrong from the moment they start, and it isn't your fault.\n\nHere's the plan: get comfortable, eat something, and then complain to me. Properly. Every detail. I'll listen, I'll agree with you, and I'll be on your side, even if you're a tiny bit wrong. Hehe.\n\nTomorrow gets a fresh start. Today doesn't get to keep you." },
    { label: "you miss me",
      message: "I miss you too. Probably more. Don't argue. 😌\n\nIt's a long way from here to there, and I hate that I can't just show up at your door. But I think about the day we finally meet in person all the time. Seeing you properly. Walking next to you. Making memories that don't need a screen.\n\nAnd honestly? I already know that even when I'm standing right in front of you, you'll still find ways to annoy me. I'm looking forward to that part too.\n\nUntil then, close your eyes for a second. I'm right there with you." },
    { label: "you feel alone",
      message: "Sayang, read this one slowly.\n\nYou're not alone. Not when it's quiet, not when everyone seems busy, not even when I'm far away. Somewhere far away there's someone thinking about you right now, and probably checking his phone to see if you replied.\n\nYou can message me anytime. You don't need a reason. \"Hi\" is enough.\n\nYou matter to me more than I can fit in a letter." },
    { label: "you're angry at me",
      message: "Okay. You're angry at me. 😅\n\nFirst: I'm sorry. Whatever happened, I don't want you to feel hurt or unheard, and if I caused that, I want to make it right.\n\nSo much of us happens through a screen, and sometimes things come out wrong or get read the wrong way. It happens to both of us. What matters to me is that we talk about it properly and kindly, when you're ready. Not before.\n\nTake the time you need, sayang. I'm not going anywhere.\n\n(And if it turns out I was right… we can discuss that later. Much later.)" },
    { label: "you can't sleep",
      message: "Why are you still awake, troublemaker? 👀\n\nOkay, okay. No lecture. Get comfortable. Turn your phone brightness down. Pull the blanket up to your chin like a little burrito.\n\nNow imagine I'm right there on a call, half asleep, saying \"sayang, sleep\" every two minutes and then talking for another hour anyway. Classic me.\n\nYour brain is allowed to slow down now. Whatever it's thinking about can wait until morning. Breathe in… and out. One more time.\n\nGoodnight, my Sifaaa. Dream of something nice. Maybe me. Just saying." },
    { label: "you need to laugh",
      message: "Emergency laughing letter. Please read with a very serious face. 🥔\n\nDear ungrateful potato,\n\nIt has come to my attention that you are currently not laughing. This is unacceptable. You annoy me every single day. You make me wait for your replies. You act innocent when you are clearly guilty. And somehow I STILL miss you. Do you know how embarrassing that is for me? Very.\n\nSo here's your punishment: you have to smile. Right now. Yes, I can tell you're trying not to. Stop it. 😂\n\nThere. Better.\n\nSincerely annoyed, and still missing you," },
    { label: "you doubt yourself",
      message: "Sayang, listen to me for a second.\n\nThat voice in your head telling you you're not good enough? It's lying. It's loud, but it's lying.\n\nYou keep going even on the days you don't feel like it, and that counts for so much more than you give yourself credit for. Your studies, your goals, the person you're growing into — you're building all of it one day at a time.\n\nYou don't have to be perfect. You just have to keep going. And on the days you can't believe in yourself, I'll do it for you. I'm really proud of you, Sifa." },
    { label: "you want to feel loved",
      message: "This one's just for you. No jokes.\n\nI love the way your mind works. I love how you get excited about the things you care about, and how you keep your own little world going even on busy days. I love that you're your own person, with your own dreams, and that I get to watch you chase them.\n\nYou're not loved because of what you do for anyone. You're loved because you're Sifa. Exactly as you are — on good days, messy days, and everything in between.\n\nSo whenever you wonder, come back and read this again. The answer doesn't change." },
    { label: "you think I don't love you",
      message: "Then read this very slowly, sayang:\n\nI. Do.\n\nOn quiet days. On busy days. On days I'm tired and bad at showing it. On days we argue. On days you take three hours to reply. I still do.\n\nAnd if I ever make you feel otherwise, tell me. I'd rather hear it than have you wonder. You deserve to feel sure, not to guess." },
    { label: "you need motivation",
      message: "Okay, up. Let's go, sayang. 💪\n\nI know you're tired. I know it feels like a lot right now. But you've done hard things before, and you'll do this one too.\n\nStart small. One task. Then the next one. You don't have to finish everything today, you just have to start.\n\nAnd when you're done, I want a full report. I'll be over here cheering way too loud for you, as usual. Go show them, my Sifaaa." }
  ],

  /* The notebook — hopes and dreams, not promises. */
  future: {
    cover: "pages we haven't written yet",
    pages: [
      { kicker: "Page 01", title: "Where it all began",
        text: "Two people, two countries, a lot of late-night talks and even more roasting. The pages we already have. Some of my favourites." },
      { kicker: "Page 02", title: "Still blank…",
        text: "Everything after this is empty. Not empty-empty, sayang. Just waiting for us.", typing: true },
      { kicker: "First, a wish", title: "Your dreams",
        text: "Whatever you're dreaming about this year, I hope you get it. And I hope I'm there to annoy you while you celebrate." },
      { kicker: "A hope", title: "Meeting you in person",
        text: "The day the distance finally loses. I think about this one the most." },
      { kicker: "A hope", title: "The first hug",
        text: "The one that makes up for every goodbye we've ever said through a screen." },
      { kicker: "A hope", title: "A birthday together",
        text: "Same room, same cake, no time zones. One day, sayang." },
      { kicker: "A hope", title: "Our families meeting",
        text: "Two families, one table, a lot of curious questions. I'm nervous already." },
      { kicker: "A hope", title: "Our nikkah",
        text: "If Allah writes it for us. That's the page I pray for." },
      { kicker: "A hope", title: "A home",
        text: "Somewhere with a door that's ours, and a light left on." },
      { kicker: "A hope", title: "Our life",
        text: "Not perfect. Just ours." }
    ],
    ending: "I don't know exactly how every page will look. But I know who I want beside me while we write them."
  },

  /* The letter at the end of "The distance". */
  finalMessage: "Sayang,\n\nI wanted at least one page in this whole thing without a single joke on it, so here it is.\n\nBeing long-distance isn't easy. There are days I wish I could just sit next to you instead of typing, days when a screen feels like nowhere near enough. But even on those days, I've never once wondered whether you were worth it. You are. Every bit of it.\n\nYou've become such a big part of my life without even trying. My mornings, my nights, the random thoughts in the middle of my day — somehow they all lead back to you.\n\nI don't know exactly when we'll finally meet, but I want that day more than almost anything. And until it comes, I'll keep showing up for you from here, in every way I can.\n\nThank you for being you, Sifa. And thank you for choosing me back.",

  /* ---------------------------------------------------------------------
     05 · YOUR BIRTHDAY
     Photos are optional; the photo booth hides itself if none exist.
     --------------------------------------------------------------------- */
  birthdayPhotos: [
    // { src: "assets/photos/birthday-1.jpg", alt: "Sifa", caption: "", width: 1200, height: 1500 },
    // { src: "assets/photos/birthday-2.jpg", alt: "Sifa", caption: "", width: 1200, height: 1500 },
    // { src: "assets/photos/birthday-3.jpg", alt: "Sifa", caption: "", width: 1200, height: 1500 }
  ],

  cake: {
    candles: 5,            // only used if numerals is false
    numerals: true,        // number candles showing her age: "1" and "9"
    title: "First, close your eyes and make a wish.",
    hint: "I'm not looking. Promise. 🙈",
    wishButton: "I've made my wish ✨",
    wishFirst: "Sayang. Wish first. Eyes closed. I'm waiting. 👀",
    blowTitle: "Now blow! Tap each candle.",
    blowHint: "(or one big breath. no judgment.)",
    blowAll: "One big breath (all of them)",
    left: "{n} to go.",
    lastOne: "one left. the stubborn one.",
    doneTitle: "Happy {ordinal} birthday, my Sifaaa! 🎂",
    afterWish: "Wish received.",
    reply: "I didn't peek, I promise. But whatever you wished for, sayang, I hope it finds you this year."
  },

  /* The present — opened in stages. Wishes are sincere, compliments are not always. */
  treasure: {
    tag: "For Sifa. Open carefully. Or don't, it's only paper. 🥔",
    hint: "tap to open",
    lead: "A few birthday wishes. Real ones. No jokes in these, I promise.",
    next: "Pull out the next one ({n} left)",
    wishes: [
      "May this year be gentle with you, and give you far more good days than hard ones.",
      "May you laugh so much this year that your cheeks actually hurt.",
      "May every dream you're carrying get a little closer, one day at a time.",
      "May Allah keep you healthy, happy, and surrounded by people who love you.",
      "And may this be the year we finally get a little closer to celebrating in person. In shaa Allah."
    ],
    complimentButton: "One more, please",
    complimentAgain: "Greedy. Okay, from the top.",
    compliments: [
      "You make ordinary days feel softer. Even the boring ones.",
      "You're cute. That's it. That's the compliment.",
      "You're smarter than you give yourself credit for. Yes, even when I call you dumb. Especially then. 😌",
      "You're allowed to be proud of yourself today. I'm proud of you.",
      "Honestly? The world is better with you in it, potato.",
      "Okay, last one. You're my favourite person. Don't let it go to your head."
    ]
  },

  /* ---------------------------------------------------------------------
     06 · THE LAST PAGE — PERSONAL BIRTHDAY VIDEO
       assets/media/assifa-birthday-video.mp4          (the video)
       assets/photos/assifa-birthday-video-poster.jpg  (optional poster)
     src may also be an array, e.g. ["…/video.webm", "…/video.mp4"].
     aspect: "16 / 9" landscape, "9 / 16" vertical (auto-corrects anyway).
     --------------------------------------------------------------------- */
  video: {
    // 720p web copy (21 MB) made from the 303 MB original, so it loads quickly
    // on her phone and fits GitHub's 25 MB upload limit. The original stays in
    // assets/media/assifa-birthday-video.mp4 (not part of the upload folder).
    src: "assets/media/birthday-video-web.mp4",
    poster: { src: "assets/photos/assifa-birthday-video-poster.jpg", alt: "", width: 1672, height: 941 },
    aspect: "16 / 9",
    title: "One more thing.",
    intro: [
      "Okay sayang, you made it to the last page.",
      "I could've typed this part too, but some things I wanted to say to your face. Well — as close to your face as I can get from all the way over here."
    ],
    ready: "Find a quiet spot. Turn the sound up. Take your time — I'll wait.",
    readyButton: "Okay, I'm ready",
    button: "Play my birthday message",
    frameCaption: "for Sifa, from Fizuu",
    missingTitle: "My birthday video for you lands right here. 🎬",
    missingText: "It's on its way, sayang. The rest of your birthday is already here.",
    skip: "Show me the ending",
    done: "I've watched it",
    afterMessage: "Happy birthday, sayang.\n\nThank you for reading every page of this silly little magazine. Every joke, every letter, every tiny button — I made all of it imagining you smiling at your screen.\n\nI hope this year treats you gently. I hope you laugh a lot, sleep well, chase your dreams, and feel proud of yourself. And I hope that one day soon, I get to say all of this in person instead of through a screen.\n\nUntil then, I'm right here. Annoying you. Loving you. Both, always.",
    closing: "Happy {ordinal} birthday, Assifa Niswa.",
    signature: "— Faizan ❤️",
    backCover: "The end of the birthday issue.",
    nextIssue: "Next issue: in person.",
    replay: "Watch it again",
    toContents: "Back to the contents"
  },

  /* ---------------------------------------------------------------------
     "TELL FIZUU YOU FINISHED" — a button on the last page that opens
     WhatsApp with this message ready (she can edit it before sending).
     number: your WhatsApp number with country code, digits only,
     e.g. "923001234567". Leave "" and WhatsApp asks her who to send it to.
     --------------------------------------------------------------------- */
  whatsapp: {
    number: "923272083929",
    button: "Tell Fizuu you finished 💬",
    note: "opens WhatsApp. you can edit it before sending.",
    message: "Fizuuu!! I finished my whole birthday issue 🎂🥹\n\nok fine. it was cute. 🥔"
  },

  /* ---------------------------------------------------------------------
     BACKGROUND MUSIC  (tracks from Pixabay, Pixabay Content License)
     One on/off button controls all of them. It never autoplays.
       birthday   "Happy Birthday" (jazz instrumental): the celebration pages
       main       the romantic song: her field guide, the love story, the
                  build-up before the video
       emotional  soft piano: the distance chapter, and while she reads the
                  heartfelt wishes inside the present
     views: which track plays on which page. Moving between pages
     crossfades, and each track continues where it left off.
     After the video ends, the birthday track comes back for the ending.
     To replace a track, drop a new MP3 at the same path (or change src).
     If a track is missing, the main one is used instead.
     --------------------------------------------------------------------- */
  music: {
    tracks: {
      birthday:  { src: "assets/audio/happy-birthday.mp3",  title: "Happy Birthday", volume: 0.24 },
      main:      { src: "assets/audio/her.mp3",              title: "HER",            volume: 0.3 },   // JVKE – "her"
      emotional: { src: "assets/audio/emotional-piano.mp3",  title: "Soft piano",     volume: 0.3 }
    },
    views: {
      parcel: "birthday",   // the opening, at 00:00 on her birthday
      cover:  "birthday",   // cover + contents
      play:   "birthday",   // 01 · the warm-up round (exam, scratch card)
      her:    "main",       // 02 · field guide to Sifa
      us:     "main",       // 03 · how it started
      apart:  "emotional",  // 04 · the distance
      party:  "birthday",   // 05 · your birthday (cake, present)
      finale: "main"        // 06 · the last page (birthday returns after the video)
    }
  },

  /* ---------------------------------------------------------------------
     SOUND EFFECTS  (one FX on/off button, separate from the music)
     Sounds with a file below use it; the rest are tiny sounds made in the
     browser. A missing file falls back to a built-in sound.
     volumes: per-sound loudness (0–1) on top of the overall volume.
     Set enabled: false to remove effects entirely.
     --------------------------------------------------------------------- */
  sounds: {
    enabled: true,
    volume: 0.6,
    files: {
      pop:   "assets/audio/pop-click.mp3",      // opening notes, reasons, moods, compliments
      boing: "assets/audio/funny-boing.mp3",    // funny quiz answers, potato jokes, "No" on the parcel
      magic: "assets/audio/magic-reveal.mp3",   // parcel opening, the present, after the video
      cheer: "assets/audio/birthday-cheer.mp3"  // once, when the last candle goes out
    },
    volumes: { pop: 0.55, boing: 0.5, magic: 0.6, cheer: 0.55 }
  }
};
