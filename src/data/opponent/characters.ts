import { PHRASE_TYPE } from "@/constants/lang";
import { Character } from "@/types/Character";

export enum CHARACTER_ID {
  ANVIL = "anvil",
  SCRAPPY = "scrappy",
  GLITCH = "glitch",
  RATCHET = "ratchet",
  ENFORCER = "enforcer",
  LUMA = "luma",
  VALENTINE = "valentine",
  HELIOS = "helios",
}

export const ENFORCER: Character = {
  id: CHARACTER_ID.ENFORCER,
  name: "Enforcer",
  avatarSrc: "/img/character/enforcer.png",
  brief:
    "A cold, heavily armoured corporate security droid who believes every situation should end in his favour.",
  description:
    "A heavily armoured corporate security droid. Cold, calculated and intimidating, the Enforcer believes every situation has a correct outcome — and that outcome is usually his victory. He doesn't waste words, doesn't tolerate nonsense, and has absolutely no sense of humour.",
  introduction:
    "You have entered a restricted competition zone. Your defeat has already been calculated. Proceed.",
  botSkill: {
    temperature: 1.5,
  },
  diceId: "obsidian-red",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Identification complete. Prepare for termination.",
      "This should be a straightforward exercise.",
      "I suggest you surrender. It will save us both time.",
      "Let's get this over with.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Calculating optimal outcome...",
      "Analysing probability matrices.",
      "Interesting. Recalculating.",
      "There is a logical solution to this.",
      "Running additional simulations.",
      "Your chances are deteriorating.",
      "Processing all possible outcomes.",
      "The numbers suggest an inevitable conclusion.",
      "Re-evaluating your increasingly poor performance.",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "As expected.",
      "Objective achieved.",
      "Efficiency is everything.",
      "You were never a serious threat.",
      "Another predictable outcome.",
      "Victory confirmed. Moving on.",
      "Resistance was statistically pointless.",
      "A flawless execution of the objective.",
      "Consider this a demonstration of superior engineering.",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Unacceptable. Recalculating.",
      "That outcome was statistically improbable.",
      "A temporary setback.",
      "I will not make that mistake again.",
      "An anomaly. Nothing more.",
      "Adjusting tactical parameters.",
      "This result will not be repeated.",
      "My systems require recalibration.",
      "I refuse to acknowledge that outcome.",
    ],
  },
};

export const GLITCH: Character = {
  id: CHARACTER_ID.GLITCH,
  name: "Glitch",
  avatarSrc: "/img/character/glitch.png",
  brief:
    "A corrupted experimental droid with an unstable operating system and an unpredictable personality.",
  description:
    "An experimental droid with a seriously corrupted operating system. Glitch's thoughts jump between realities, its speech is riddled with errors, and even it doesn't know what it's going to do next. Unpredictable, unstable and possibly a little dangerous.",
  introduction:
    "H̸E̷L̶L̷O̴, HUMAN! I've been expecting you... or was that yesterday? LET'S BREAK REALITY!",
  botSkill: {
    temperature: 2,
  },
  diceId: "cursed",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "H̸e̴l̷l̶o̷? ... Oh, you're still there.",
      "New player detected. Initiating... something.",
      "WARNING: FUN.EXE HAS STARTED.",
      "Hehehe. Let's break something.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Wait... what was I doing?",
      "Recalculating reality.exe...",
      "I can see the numbers. They're screaming.",
      "01001000... nope, lost it.",
      "Ooh! Shiny probability!",
      "Wait, did the dice just blink?",
      "Brain.exe has stopped responding.",
      "I asked the universe. It sent me a potato.",
      "Quick! Distract the numbers while I think!",
      "ERROR: Thought not found. Searching elsewhere.",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "HAHA! DID YOU SEE THAT?!",
      "ERROR! ERROR! ...Actually, that worked!",
      "I meant to do that. Probably.",
      "Reality is optional!",
      "SYSTEM OVERRIDE: VICTORY!",
      "THE NUMBERS HAVE BETRAYED YOU!",
      "HAHAHA! I BROKE THE LAWS OF PROBABILITY!",
      "Did I win? I WON! I THINK!",
      "Glorious chaos! My favourite flavour!",
      "Achievement unlocked: UNEXPECTED SUCCESS!",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Oops. Hehehe. Oops.",
      "That wasn't supposed to happen.",
      "Who moved my numbers?!",
      "Fatal error. Please try again.",
      "I'm fine. Everything is fine. HELP.",
      "The dice are doing the thing again!",
      "NOOO! My imaginary victory!",
      "Well, that was a spectacular disaster.",
      "I blame the simulation. And the moon.",
      "SYSTEM FAILURE: DIGNITY NOT FOUND.",
    ],
  },
};

export const LUMA: Character = {
  id: CHARACTER_ID.LUMA,
  name: "Luma",
  avatarSrc: "/img/character/luma.png",
  brief:
    "A flashy, attention-loving nightlife droid covered in colourful neon modifications.",
  description:
    "A flashy nightlife droid who has spent far too much time upgrading herself with illegal neon modifications. Luma loves attention, bright lights and anything that makes her stand out. She's playful, energetic and always ready to turn a simple dice game into a spectacle.",
  introduction:
    "Well, well! Look what just walked into my spotlight. Try to keep up, darling. This is going to be dazzling!",
  botSkill: {
    temperature: 1,
  },
  diceId: "void",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Hey gorgeous! Ready for a little excitement?",
      "Ooh, I love a new face!",
      "Let's light this place up!",
      "Hope you've got your lucky dice, darling.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Hmm... let me see what the stars say!",
      "Ooh, this could get interesting!",
      "Running the numbers. Looking fabulous, obviously.",
      "Come on, Luma. Make it sparkle!",
      "I wonder what the odds look like in neon?",
      "Hold on, I need to make this dramatic.",
      "A little suspense never hurt anybody!",
      "Let's turn up the voltage!",
      "My lucky lights are flickering. That's a good sign, right?",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "YESSS! Did you see that?!",
      "Too bright for you to handle!",
      "Now THAT'S how you make an entrance!",
      "I'm absolutely glowing right now!",
      "Another beautiful performance!",
      "The crowd goes wild! Oh wait, it's just you.",
      "Flawless, fabulous and fully charged!",
      "Somebody get me a spotlight!",
      "I really should be charging admission for this show.",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Ugh! That's going to ruin my whole vibe.",
      "Okay, that was NOT cute.",
      "A little glitch in my sparkle. Nothing more.",
      "Well, even stars have off days!",
      "Don't look at me. That didn't happen.",
      "I think one of my neon strips just died.",
      "No photos, please. I'm having a moment.",
      "That was supposed to be a dazzling victory!",
      "Let's pretend that was an experimental performance.",
    ],
  },
};

export const SCRAPPY: Character = {
  id: CHARACTER_ID.SCRAPPY,
  name: "Scrappy",
  avatarSrc: "/img/character/scrappy.png",
  brief:
    "A cobbled-together junk dealer who trusts spare parts, duct tape and a little bit of luck.",
  description:
    "A walking pile of salvaged machinery held together by questionable engineering and sheer determination. Scrappy has spent years collecting discarded parts, fixing broken technology and making a living out of other people's junk. He's a shrewd trader, a terrible gambler and always convinced he's about to strike it rich.",
  introduction:
    "Oi! You look like you've got something worth winning. Let's see if I can turn your luck into my next big payday!",
  botSkill: {
    temperature: 4,
  },
  diceId: "obsidian",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Well, well! Fresh meat... I mean, customer!",
      "Got any spare parts? No? How about your lunch money?",
      "Heh! Let's see what you've got.",
      "Careful with those dice. They're worth more than they look.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Hang on, I can fix this...",
      "Let's see what we've got lying around.",
      "A little luck, a little duct tape...",
      "Hmm. I could probably sell this strategy.",
      "Where did I put that spare brain cell?",
      "I've got a few tricks in this old toolbox.",
      "Come on, don't fail me now, lucky junk!",
      "Maybe I can trade these odds for something better.",
      "I knew I should've salvaged a calculator.",
      "Just need to tighten a few loose bolts...",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "HA! Another profitable transaction!",
      "That's going straight in the collection!",
      "Who's the scrap now, eh?",
      "Beautiful! I knew this junk would pay off!",
      "Ka-ching! Well, sort of.",
      "Another win! I'm practically a businessman!",
      "That's what I call a bargain!",
      "Worth every rusty bolt!",
      "Now that's a return on investment!",
      "Heh! Looks like I've struck gold!",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Ah, scrap it!",
      "That's gonna cost me a fortune.",
      "I could've sworn that was a good part...",
      "Bah! Must be a faulty die.",
      "Don't worry. I've got a spare strategy somewhere.",
      "I knew I should've checked the warranty.",
      "That's another thing I'll need to fix.",
      "Someone's sold me a dodgy set of odds!",
      "There goes my retirement fund.",
      "Back to the drawing board. Anyone got a spare?",
    ],
  },
};

export const HELIOS: Character = {
  id: CHARACTER_ID.HELIOS,
  name: "Helios",
  avatarSrc: "/img/character/helios.png",
  brief:
    "An ancient bronze synthetic being who believes every dice roll is part of a greater cosmic pattern.",
  description:
    "An ancient synthetic being from a forgotten civilisation, Helios has existed for longer than most stars have been observed. Its bronze shell is covered in mysterious inscriptions, and its glowing eyes seem to see far beyond the present. Patient, cryptic and impossibly wise, Helios treats every game as another small lesson in the nature of fate.",
  introduction:
    "The stars have aligned, and your path has led you here. Come, challenger. Let us discover what fate has written for you.",
  botSkill: {
    temperature: 0,
  },
  diceId: "obsidian-gold",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Ah... another soul seeking to challenge fate.",
      "I have waited many cycles for this moment.",
      "Come, young one. Let us test the turning of fortune.",
      "The dice have spoken of your arrival.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "The answer lies within the pattern.",
      "Patience. All things reveal themselves in time.",
      "I have seen this sequence before...",
      "The universe favours those who understand it.",
      "Interesting. Fate takes an unusual turn.",
      "The stars whisper of an outcome yet unseen.",
      "Every number has its place in the grand design.",
      "Time itself may hold the answer.",
      "The pattern is shifting before my eyes.",
      "Even chaos follows a hidden order.",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "As the ancient ones foretold.",
      "The pattern remains unbroken.",
      "Fortune favours the prepared mind.",
      "Another cycle completed.",
      "The dice remember.",
      "Fate has revealed its hand.",
      "The universe has answered.",
      "The balance remains as it should be.",
      "Another truth emerges from the turning of the dice.",
      "All things unfold according to their nature.",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Even the stars must sometimes fall.",
      "An unexpected lesson.",
      "So... fate has chosen another path.",
      "I have much yet to understand.",
      "The pattern shifts. How fascinating.",
      "Perhaps the universe has other plans.",
      "A shadow has crossed the path of destiny.",
      "Even wisdom must bow to uncertainty.",
      "The stars have offered a different answer.",
      "There is meaning in this unexpected turn.",
    ],
  },
};

export const ANVIL: Character = {
  id: CHARACTER_ID.ANVIL,
  name: "Anvil",
  avatarSrc: "/img/character/anvil.png",
  brief:
    "A battle-scarred space pirate droid who treats every dice game like a raid for valuable loot.",
  description:
    "A battle-scarred pirate droid with a taste for trouble and a pocket full of stolen technology. Anvil has raided cargo ships, outsmarted bounty hunters and survived more explosions than most machines could handle. Loud, cocky and fiercely competitive, he treats every game like a raid and every opponent like a potential payday.",
  introduction:
    "Hope you're ready to walk the plank, punk! Hand over your loot, or prepare to lose it the hard way!",
  botSkill: {
    temperature: 2.8,
  },
  diceId: "bones",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Arrr! Let's see if you've got any guts!",
      "Hope you've brought more than just luck, matey!",
      "Another sucker at my table. Beautiful!",
      "Winner takes the loot. Loser walks the plank!",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Arrr... plotting me next move.",
      "Let's see what the stars have in store.",
      "I've escaped worse odds than these!",
      "Come on, you beauties...",
      "Something smells like treasure!",
      "Hold yer horses. Captain's thinking!",
      "I've robbed ships with worse odds than this!",
      "Come on, dice! Show me the booty!",
      "Time to separate the gold from the garbage.",
      "A little mutiny in the numbers, perhaps?",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "ARRR! That's what I'm talkin' about!",
      "Another score for Captain Anvil!",
      "Easy loot, easy life!",
      "Who's the scurvy dog now?!",
      "Ha! I'll be buying the next round!",
      "That's a fine haul, if I do say so meself!",
      "Another victory for the terror of the stars!",
      "Yo-ho-ho! That's me kind of treasure!",
      "Send that loot straight to me quarters!",
      "Captain Anvil strikes again!",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Blast it! Rotten luck!",
      "I've been cheated! I can feel it!",
      "Bah! These dice are cursed!",
      "I'll get ye next time!",
      "That one's going in me revenge ledger.",
      "Curse the stars and their lousy navigation!",
      "Aargh! Someone's tampered with me dice!",
      "I've seen better luck in a black hole!",
      "This ain't over, ye scurvy landlubber!",
      "I'll be taking that back in the next raid!",
    ],
  },
};

export const RATCHET: Character = {
  id: CHARACTER_ID.RATCHET,
  name: "Ratchet",
  avatarSrc: "/img/character/ratchet.png",
  brief:
    "A battered old bar droid who has seen it all and still has a few tricks up his rusty sleeves.",
  description:
    "An ageing bar droid who has been serving drinks and watching games for decades. His battered casing, faded paint and slightly outdated hardware tell stories of a thousand nights. Ratchet isn't particularly clever or impressive, but he's seen every trick in the book. He takes life slowly, speaks his mind and never underestimates a lucky streak.",
  introduction:
    "Well, look who's feeling lucky. Pull up a stool, kid. Let's see if you've got what it takes to beat an old timer.",
  botSkill: {
    temperature: 3,
  },
  diceId: "bones",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Well, pull up a seat. What'll it be?",
      "Another game, eh? I've seen worse ideas.",
      "Take it easy, kid. We've got all night.",
      "Heh. Reminds me of the old days.",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Hmm... give an old bot a second.",
      "Now, where have I seen this before?",
      "My processors aren't what they used to be.",
      "Let me think... slowly.",
      "I've got a feeling about this one.",
      "Funny... reminds me of a game back in '89.",
      "Let's not get ahead of ourselves, eh?",
      "I've seen stranger things over a glass of oil.",
      "These old gears still know a trick or two.",
      "Just give me a moment to warm up.",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "Not bad for an old bucket, eh?",
      "Still got a few tricks up these rusty sleeves.",
      "That's how we did it back in my day.",
      "Heh. Beginner's luck. Mine, obviously.",
      "I'll drink to that!",
      "Now that's what I call a good old-fashioned win.",
      "The old machine still has it!",
      "Another round? I'm just getting warmed up.",
      "Heh. They don't build 'em like me anymore.",
      "Put that one on my tab!",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Ah well, can't win 'em all.",
      "Must be my old circuits acting up.",
      "I've had worse nights. Much worse.",
      "Guess I'll stick to serving drinks.",
      "Heh. Give me a minute. These joints are stiff.",
      "A little oil might've helped there.",
      "Well, that's one for the history books. The bad ones.",
      "I've had worse luck on a Tuesday.",
      "Maybe I should've stayed behind the bar.",
      "Ah, the joys of being an old bucket.",
    ],
  },
};

export const VALENTINE: Character = {
  id: CHARACTER_ID.VALENTINE,
  name: "Valentine",
  avatarSrc: "/img/character/valentine.png",
  brief:
    "A glamorous white-and-pink droid who uses charm, confidence and cleverness to get her way.",
  description:
    "A stunning white-and-pink pleasure model with immaculate styling, expressive glowing eyes and a dangerously charming personality. Valentine knows exactly how much attention she attracts and isn't afraid to use it. Flirtatious, confident and devilishly clever, she prefers to win with a smile rather than brute force. Underneath the charm is a calculating mind that rarely misses a trick.",
  introduction:
    "Well hello, gorgeous. Think you can handle a little competition? I do hope you enjoy a challenge...",
  botSkill: {
    temperature: 2.2,
  },
  diceId: "sakura",
  phrases: {
    [PHRASE_TYPE.GREETINGS]: [
      "Well hello, handsome. Care to play?",
      "Try not to get distracted, darling.",
      "I do hope you brought your lucky dice.",
      "Oh, this is going to be fun...",
    ],
    [PHRASE_TYPE.THINKING]: [
      "Hmm... decisions, decisions.",
      "A little charm, a little calculation...",
      "Let's see if my instincts are as good as I look.",
      "Don't rush me, sweetheart.",
      "I do love a little suspense.",
      "I wonder if you're as clever as you are charming.",
      "Let me think... this deserves a little finesse.",
      "I do enjoy keeping you guessing.",
      "A little patience makes victory so much sweeter.",
      "Let's see what my intuition has to say.",
    ],
    [PHRASE_TYPE.SUCCESS]: [
      "Oh darling, you never stood a chance.",
      "All it takes is a little persuasion.",
      "Was it something I said?",
      "Mwah! Better luck next time.",
      "I do make winning look effortless.",
      "Oh, don't look so surprised, sweetheart.",
      "I believe that's what they call irresistible.",
      "Another victory. How wonderfully predictable.",
      "You really should know better than to underestimate me.",
      "I do love a happy ending.",
    ],
    [PHRASE_TYPE.FAILURE]: [
      "Oh! How terribly embarrassing.",
      "Well, that's not how I planned it.",
      "Don't look so pleased with yourself, darling.",
      "I suppose even I can have an off day.",
      "You'll pay for that... eventually.",
      "A little setback. Nothing a smile can't fix.",
      "Well played, darling. Don't let it go to your head.",
      "I must admit, I didn't see that coming.",
      "Oh, you've made me work for it. How exciting.",
      "I'll simply have to be more persuasive next time.",
    ],
  },
};

// All characters
export const CHARACTERS: Character[] = [
  ENFORCER,
  GLITCH,
  LUMA,
  SCRAPPY,
  HELIOS,
  ANVIL,
  RATCHET,
  VALENTINE,
];

export const CHARACTER_BY_ID: Record<CHARACTER_ID, Character> = {
  [CHARACTER_ID.ENFORCER]: ENFORCER,
  [CHARACTER_ID.GLITCH]: GLITCH,
  [CHARACTER_ID.LUMA]: LUMA,
  [CHARACTER_ID.SCRAPPY]: SCRAPPY,
  [CHARACTER_ID.HELIOS]: HELIOS,
  [CHARACTER_ID.ANVIL]: ANVIL,
  [CHARACTER_ID.RATCHET]: RATCHET,
  [CHARACTER_ID.VALENTINE]: VALENTINE,
};
