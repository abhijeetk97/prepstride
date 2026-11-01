import { useEffect, useRef, useState } from 'react';
import { countUpFrame } from '../../utils/motion';
import { currentMotion } from '../../hooks/useMotionPreference';

/**
 * Counts up to `value` once per mount (and from the old value on change). Screen readers
 * hear only the final number; under the Off tier the final number shows immediately.
 */
export function CountUp({
  value,
  format = (n) => String(n),
  duration = 900,
  changeDuration = 600,
  instant = false,
  className = ''
}: {
  value: number;
  format?: (n: number) => string;
  /** First count, from zero. */
  duration?: number;
  /** Later changes, from the old value (a save adding minutes). */
  changeDuration?: number;
  /** Start on the final value (Home after a plain tab switch). */
  instant?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(() => (instant || currentMotion() === 'off' ? value : 0));
  const from = useRef(shown);
  const counted = useRef(false);

  useEffect(() => {
    const ms = counted.current ? changeDuration : duration;
    counted.current = true;
    if (currentMotion() === 'off' || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / ms;
      const next = countUpFrame(origin, value, t);
      from.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // An interrupted count resumes from where it got to, so it still ends on the true value.
    return () => cancelAnimationFrame(raf);
  }, [value, duration, changeDuration]);

  return (
    <span className={className}>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
