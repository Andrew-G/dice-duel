import type { Mood } from "@/types/Character";

const imgByMood: Record<Mood, string> = {
  angry: "/img/bubloopack/angry.gif",
  barf: "/img/bubloopack/barf.gif",
  confused: "/img/bubloopack/confused.gif",
  cry: "/img/bubloopack/cry.gif",
  eyeroll: "/img/bubloopack/eyeroll.gif",
  heart: "/img/bubloopack/heart.gif",
  neutral: "/img/bubloopack/neutral.gif",
  think: "/img/bubloopack/think.gif",
  wink: "/img/bubloopack/wink.gif",
  ay: "/img/bubloopack/ay.gif",
  blush: "/img/bubloopack/blush.gif",
  cool: "/img/bubloopack/cool.gif",
  dying: "/img/bubloopack/dying.gif",
  happy: "/img/bubloopack/happy.gif",
  laugh: "/img/bubloopack/laugh.gif",
  sad: "/img/bubloopack/sad.gif",
  what: "/img/bubloopack/what.gif",
  woah: "/img/bubloopack/woah.gif",
};

type BotProps = {
  mood: Mood;
};

const Bot = ({ mood }: BotProps) => {
  return (
    <div className="relative flex items-center content-center w-40 h-40">
      <img
        src={imgByMood[mood]}
        alt={mood}
        className="absolute -top-1 right-0 w-14 opacity-90"
      />
      <img src="/img/droid.png" alt="droid" className="w-full" />
    </div>
  );
};

export default Bot;
