import { CharacterEmotions } from "@/types/Character";
import { CharacterChallengeScenes, SceneMessage } from "@/types/Scene";

type ChallengeScenes = {
  introduction: SceneMessage[];
  failure: SceneMessage[];
  complete: SceneMessage[];
  scrappy: CharacterChallengeScenes;
  ratchet: CharacterChallengeScenes;
  anvil: CharacterChallengeScenes;
  valentine: CharacterChallengeScenes;
  glitch: CharacterChallengeScenes;
  enforcer: CharacterChallengeScenes;
  luma: CharacterChallengeScenes;
  helios: CharacterChallengeScenes;
};

export const scene: { challenge: ChallengeScenes } = {
  challenge: {
    // The overall challenge storyline, before the player meets the opponents.
    introduction: [
  {
    message: "Well, well... look what the docking bay dragged in. You look like someone who's had a rough trip, kid.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Ship trouble, am I right? Let me guess... busted hyperdrive, empty fuel cells, and not a credit to your name?",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Heh. Don't worry, I've seen worse. This joint's seen smugglers, bounty hunters, and more broke pilots than I can count.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Now, if you're looking to make some quick credits, there's a little game we run here after hours. Underground dice. Winner takes the pot.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "There's a few regulars you'll need to get past. Tough characters, every one of 'em. And trust me, they don't take kindly to losing.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "You'll have to beat every last one, starting with the easiest and working your way up. Think you've got the stones for it?",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "So grab a seat, warm up those dice, and let's see if you've got what it takes to get your ship back in the stars. Good luck, kid. You're gonna need it!",
    emotion: CharacterEmotions.SUCCESS
  }
],

    scrappy: {
      introduction: [
  {
    message: "Oh! A customer! And here I thought this place was completely dead.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Name's Scrappy. I've got a little bit of everything, and I'm always up for a game. You got any spare credits?",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Don't let the rusty exterior fool ya. I've been rolling dice since before half these parts were manufactured!",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Alright, let's see what you've got. Winner gets the credits. Loser gets to listen to me talk about my collection!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "Whoa! You actually beat me? That's a pretty impressive roll!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Heh, guess I'll have to dig through my collection for some better luck next time!",
    emotion: CharacterEmotions.THINKING
  }
],
      failure: [
  {
    message: "Ha! Gotcha! Never underestimate a bot with a few tricks up its sleeve!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Don't worry, there's plenty more where that came from. Fancy another go?",
    emotion: CharacterEmotions.DEFAULT
  }
],
    },

    ratchet: {
      introduction: [
  {
    message: "Well, looks like you've made it past the warm-up act. Not bad, kid.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "But there's a reason I run this joint. I've been playing this game longer than most of these bots have been switched on.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "I've seen every trick, every bluff, every lucky roll. You really think you've got something I haven't seen before?",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Alright, enough talk. Let's see if the bartender can still clean up at his own table!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "Well, I'll be damned. Looks like the student just taught the bartender a thing or two!",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Fair play, kid. A win's a win. You've earned it!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      failure: [
  {
    message: "Heh! House always wins, kid. Well, in this case, the bartender does!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Better luck next time. I'll keep your seat warm.",
    emotion: CharacterEmotions.DEFAULT
  }
],
    },

    anvil: {
      introduction: [
  {
    message: "Arrr! Another landlubber looking to plunder me treasure?",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "I've sailed the darkest corners of the galaxy, battled the fiercest crews, and claimed more loot than you could ever dream of!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "But enough braggin'. If ye want me credits, you'll have to take 'em from me cold, metal hands!",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Now roll those dice, scallywag! Let's see if you've got the guts to face a proper pirate!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "BLASTED! I've been plundered! By a landlubber, no less!",
    emotion: CharacterEmotions.FAILURE
  },
  {
    message: "Arrr, enjoy me loot while ye can, scallywag. I'll be ready for a rematch!",
    emotion: CharacterEmotions.THINKING
  }
],
      failure: [
  {
    message: "ARRR! That's how a proper pirate rolls! Ye'll not be stealin' me treasure today!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Now walk the plank, ye scurvy dog! ...Or, y'know, try again.",
    emotion: CharacterEmotions.DEFAULT
  }
],
    },

    valentine: {
      introduction: [
  {
    message: "Well hello, handsome. I was beginning to think nobody interesting would show up tonight.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "You've done rather well to get this far. But darling, luck has a funny way of running out.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "I do love a little competition. Especially when the stakes are high and the company is... entertaining.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Come on then, sweetheart. Let's make this interesting. Try not to fall in love with me when I win.",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "Oh, darling! How utterly embarrassing... for me, I mean.",
    emotion: CharacterEmotions.FAILURE
  },
  {
    message: "Enjoy your victory, handsome. Don't let it go to your head. Mwah!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      failure: [
  {
    message: "Oh sweetheart... that was almost painful to watch!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Don't pout, darling. Losing looks rather cute on you. Care for another round?",
    emotion: CharacterEmotions.SUCCESS
  }
],
    },

    glitch: {
      introduction: [
  {
    message: "H̸e̶l̵l̴o̷,̵ ̷p̸l̶a̸y̷e̶r̵.̴.̵.̷",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "O̴h̸?̶ ̵Y̸o̴u̷'̴r̵e̸ ̵s̸t̶i̴l̷l̶ ̴h̶e̸r̵e̴?̷ ̵I̴ ̷t̶h̸o̵u̴g̴h̷t̵ ̴y̷o̵u̸'̶d̵ ̷h̸a̴v̷e̵ ̴g̶i̸v̵e̷n̴ ̸u̷p̶ ̴b̸y̷ ̴n̴o̵w̴.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "L̶e̴t̷'̶s̵ ̴s̸e̵e̷.̴.̷.̵ ̶I̵'̸v̴e̵ ̸r̴u̷n̴ ̷t̴h̵e̸ ̶n̷u̸m̶b̵e̷r̸s̶.̷ ̵Y̴o̶u̷r̴ ̶c̴h̷a̶n̵c̵e̴s̸ ̶a̸r̷e̵ ̷[̸U̴N̷K̵N̸O̴W̶N̸]̷.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "E̷R̴R̸O̴R̵!̶ ̵L̴e̶t̷'̴s̷ ̸r̶o̷l̴l̵.̵.̴.̷ ̵I̵ ̸w̶a̷n̵t̵ ̵t̵o̷ ̵s̷e̵e̸ ̸w̷h̸a̷t̴ ̵b̴r̷e̶a̴k̵s̷ ̴f̵i̵r̶s̴t̴.",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "W̷H̸A̵T̶?̷ ̴T̶H̸A̵T̶ ̷W̶A̸S̴N̷'̸T̶ ̵S̴U̶P̷P̸O̶S̴E̷D̸ ̶T̵O̸ ̷H̶A̸P̷P̴E̷N̶!",
    emotion: CharacterEmotions.FAILURE
  },
  {
    message: "R̴E̶C̷A̷L̵C̴U̶L̷A̴T̶I̸N̵G̷.̷.̴.̵ ̴Y̷O̵U̴ ̶G̶O̷T̶ ̴L̵U̴C̷K̷Y̵.",
    emotion: CharacterEmotions.THINKING
  }
],
      failure: [
  {
    message: "E̴R̶R̴O̶R̷!̷ ̶P̷L̸A̴Y̷E̵R̴ ̸D̶E̷F̸E̵A̶T̸E̶D̴.̷ ̵A̷S̷ ̸P̶R̴E̶D̸I̷C̵T̶E̴D̷.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "D̵O̶N̴'̶T̴ ̶W̷O̶R̸R̵Y̷.̶ ̷I̴ ̷C̶A̵N̷ ̶L̸E̵T̶ ̵Y̵O̸U̶ ̷T̷R̸Y̵ ̸A̷G̸A̷I̴N̷.̷.̶.̴",
    emotion: CharacterEmotions.DEFAULT
  }
],
    },

    enforcer: {
      introduction: [
  {
    message: "IDENTIFY YOURSELF. STATE YOUR PURPOSE.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "You have demonstrated an acceptable level of competence. However, your progress ends here.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "I have analysed your previous matches. Your strategy is predictable. Your odds of success are negligible.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "PREPARE FOR EVALUATION. LET THE MATCH BEGIN.",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "RESULT: DEFEAT. Your performance exceeded my projections.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "You have earned this victory. I acknowledge your superior performance.",
    emotion: CharacterEmotions.DEFAULT
  }
],
      failure: [
  {
    message: "RESULT: VICTORY. The outcome was consistent with my calculations.",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Your performance requires improvement. You may attempt the evaluation again.",
    emotion: CharacterEmotions.DEFAULT
  }
],
    },

    luma: {
      introduction: [
  {
    message: "Well, well! Look who's made it all the way up here!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "I'm Luma, darling. And I do hope you're ready for a little spectacle.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "I've got a reputation to maintain, and I simply cannot let someone like you steal my spotlight!",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Lights on, dice out! Let's give everyone a show they'll never forget!",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "WHAT?! You stole my spotlight! I can't believe it!",
    emotion: CharacterEmotions.FAILURE
  },
  {
    message: "Okay, okay! You win! But don't expect me to let you have the final bow!",
    emotion: CharacterEmotions.THINKING
  }
],
      failure: [
  {
    message: "YES! Now THAT'S how you put on a show!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Sorry, darling, but there's only room for one star on this stage!",
    emotion: CharacterEmotions.SUCCESS
  }
],
    },

    helios: {
      introduction: [
  {
    message: "So... you have travelled far to reach me.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Many have stood where you stand now. All believed themselves worthy. None have prevailed.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "Your journey has tested your resolve, your fortune, and your will. Yet the greatest trial remains.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Come, challenger. Let the final roll determine your fate. May the stars bear witness.",
    emotion: CharacterEmotions.SUCCESS
  }
],
      success: [
  {
    message: "Remarkable. You have surpassed every expectation placed before you.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "You have earned my respect, challenger. May your path ahead be illuminated.",
    emotion: CharacterEmotions.SUCCESS
  }
],
      failure: [
  {
    message: "The stars have spoken. Your journey ends here... for now.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Do not mistake defeat for destiny. Rise, and face the challenge once more.",
    emotion: CharacterEmotions.THINKING
  }
],
    },

    // Generic scenes used when no character-specific scene is appropriate.
    failure: [
  {
    message: "Oof. Tough break, kid. That's the way the dice roll sometimes.",
    emotion: CharacterEmotions.FAILURE
  },
  {
    message: "You'll need to beat this one before you can move on. Shake it off, and give it another go.",
    emotion: CharacterEmotions.THINKING
  }
],
    complete: [
  {
    message: "Well, I'll be damned! You actually did it, kid!",
    emotion: CharacterEmotions.SUCCESS
  },
  {
    message: "Every opponent in this joint, beaten. Even Helios! I don't think I've seen anyone pull that off.",
    emotion: CharacterEmotions.THINKING
  },
  {
    message: "You've earned every last credit. That should be more than enough to get your ship back in working order.",
    emotion: CharacterEmotions.DEFAULT
  },
  {
    message: "Go on, captain. Get that ship fixed and get back out there. The stars are waiting for you!",
    emotion: CharacterEmotions.SUCCESS
  }
]
  }
};
