import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { useTypewriter } from "@/hooks/useTypewriter";
import type { Character, CharacterEmotions } from "@/types/Character";
import type { SceneMessage } from "@/types/Scene";

type SceneViewProps = {
  /** The lines to play, one after another. */
  messages: SceneMessage[];
  /** Who is speaking: their portrait is shown, in each message's emotion. */
  character: Character;
  /** Called after the player continues past the last message. */
  onComplete: () => void;
  /**
   * Called once the first portrait has fully loaded. Until then the lines
   * don't start, so a parent can keep a cover over the scene meanwhile.
   */
  onReady?: () => void;
};

const emotionSrc = (character: Character, emotion: CharacterEmotions) =>
  `/img/character/${character.id}-${emotion}.png`;

/**
 * Plays a scene: a character portrait whose expression follows the script,
 * and their lines typed out one at a time. Continue skips ahead to the end of
 * the line that's being typed, then moves on to the next one.
 *
 * Its state lives and dies with the scene, so mount it with a new `key` for
 * each new scene.
 */
const SceneView = ({
  messages,
  character,
  onComplete,
  onReady,
}: SceneViewProps) => {
  const [index, setIndex] = useState(0);
  const [missingSrc, setMissingSrc] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const current = messages[index];
  const isLast = index >= messages.length - 1;
  const firstSrc = messages[0]
    ? emotionSrc(character, messages[0].emotion)
    : "";
  // Nothing is typed until the first portrait is there to go with it.
  const { displayed, isDone, finish } = useTypewriter(
    isReady ? (current?.message ?? "") : ""
  );

  // Wait for the first portrait to be fully loaded and decoded. If that
  // expression is missing, wait for the plain portrait it falls back to.
  useEffect(() => {
    if (!firstSrc) return;
    let isCancelled = false;
    const load = (src: string) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    };
    const done = () => {
      if (!isCancelled) setIsReady(true);
    };
    load(firstSrc)
      .catch(() => load(character.avatarSrc))
      .then(done, done);
    return () => {
      isCancelled = true;
    };
  }, [firstSrc, character.avatarSrc]);

  useEffect(() => {
    if (isReady) onReady?.();
  }, [isReady, onReady]);

  // Load every expression up front so the portrait never flickers on a swap.
  useEffect(() => {
    messages.forEach(({ emotion }) => {
      new Image().src = emotionSrc(character, emotion);
    });
  }, [messages, character]);

  // An empty scene has nothing to show, so move straight on.
  useEffect(() => {
    if (messages.length === 0) onComplete();
  }, [messages.length, onComplete]);

  if (!current) return null;

  const src = emotionSrc(character, current.emotion);
  // Fall back to the plain portrait if an expression's image is missing.
  const portrait = missingSrc === src ? character.avatarSrc : src;

  const next = () => {
    if (!isReady) return;
    if (!isDone) return finish();
    if (isLast) return onComplete();
    setIndex(index + 1);
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <img
        src={portrait}
        alt={`${character.name}, ${current.emotion}`}
        onError={() => setMissingSrc(src)}
        className="h-64 w-64 object-contain drop-shadow-[0_0_18px_rgba(129,140,248,0.35)]"
      />

      <section
        aria-label={`${character.name} says`}
        className="w-full space-y-3 rounded-lg border border-white/10 bg-white/5 p-4"
      >
        <p className="text-sm font-bold text-indigo-300">{character.name}</p>

        {/* Screen readers get the whole line once, not letter by letter. */}
        <p className="sr-only" aria-live="polite">
          {current.message}
        </p>
        {/* The full line is laid out invisibly underneath, so the box keeps
            its final size and nothing jumps while the text types in. */}
        <div aria-hidden="true" className="grid text-white/90">
          <p className="invisible col-start-1 row-start-1">{current.message}</p>
          <p className="col-start-1 row-start-1">{displayed}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">
            {index + 1} / {messages.length}
          </span>
          <Button onClick={next} disabled={!isReady}>
            Continue
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SceneView;
