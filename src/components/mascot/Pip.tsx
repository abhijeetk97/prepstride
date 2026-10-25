import { levelForXP } from '../../utils/gamification';

export type PipMood = 'cheer' | 'focus' | 'celebrate' | 'sleep' | 'wave';

const MOOD_BADGE: Record<PipMood, string> = {
  cheer: '',
  focus: '🤓',
  celebrate: '🎉',
  sleep: '😴',
  wave: '👋'
};

/**
 * Pip the Stride Bird — official mascot.
 * Base artwork + mood effects + rank accessories (evolution per PRD Module 12.1).
 */
export function Pip({
  mood = 'cheer',
  xp,
  size = 96,
  className = ''
}: {
  mood?: PipMood;
  xp?: number;
  size?: number;
  className?: string;
}) {
  const tier = xp !== undefined ? levelForXP(xp) : undefined;

  return (
    <div className={`relative inline-block ${mood === 'celebrate' ? 'animate-wiggle' : mood === 'cheer' || mood === 'wave' ? 'animate-float' : ''} ${className}`} style={{ width: size, height: size }}>
      <img
        src="assets/mascot.png"
        alt="Pip the Stride Bird"
        width={size}
        height={size}
        draggable={false}
        className={`h-full w-full rounded-full object-cover shadow-sm ring-2 ring-white/70 ${mood === 'sleep' ? 'opacity-70 saturate-50' : ''}`}
      />
      {/* Mood effect */}
      {MOOD_BADGE[mood] && (
        <span className="absolute -right-1 -top-1 select-none text-xl drop-shadow" aria-hidden>
          {MOOD_BADGE[mood]}
        </span>
      )}
      {mood === 'sleep' && (
        <span className="absolute -right-2 top-0 select-none animate-bounce-soft text-lg" aria-hidden>
          💤
        </span>
      )}
      {mood === 'focus' && (
        <span className="absolute -left-2 bottom-1 select-none text-sm" aria-hidden>
          🍃
        </span>
      )}
      {/* Rank accessory (Pip evolution) */}
      {tier && tier.level >= 2 && (
        <span
          className="absolute -bottom-1 -left-1 select-none rounded-full bg-surface px-1 text-sm shadow"
          title={tier.title}
          aria-hidden
        >
          {tier.accessoryEmoji}
        </span>
      )}
    </div>
  );
}
