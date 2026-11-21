import Bot from "@/components/Bot";
import Button from "@/components/Button";
import GameChat from "@/components/GameChat";
import { TURNS_PER_GAME } from "@/engine/score";
import { reactionMap, type Character, type Mood } from "@/types/Character";

type OpponentPanelProps = {
  title: string;
  /** The character being played against, if any. */
  character?: Pick<Character, "name" | "avatarSrc" | "id"> | null;
  mood: Mood;
  turnsCompleted: number;
  messages: string[];
  /** Set when the robot couldn't load its value table. */
  error: string | null;
  onRetry: () => void;
};

/** The opponent's avatar, progress and chat, plus the robot's load error. */
const OpponentPanel = ({
  title,
  character,
  mood,
  turnsCompleted,
  messages,
  error,
  onRetry,
}: OpponentPanelProps) => (
  <>
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
      {/* <Bot mood={mood} avatarSrc={character?.avatarSrc} name={character?.name} /> */}
      <Bot
        mood={mood}
        avatarSrc={`/img/character/${character?.name}-${reactionMap[mood]}.png`}
        name={character?.name}
      />
      <div className="flex w-full flex-1 flex-col space-y-2">
        <p className="text-sm text-indigo-300">
          {title} • {turnsCompleted} of {TURNS_PER_GAME} turns played
        </p>
        <GameChat messages={messages} />
      </div>
    </div>

    {error && (
      <div
        role="alert"
        className="space-y-2 rounded-md bg-red-900/50 p-3 text-sm"
      >
        <p>The robot couldn&apos;t load its brain ({error}).</p>
        <Button variant="small" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )}
  </>
);

export default OpponentPanel;
