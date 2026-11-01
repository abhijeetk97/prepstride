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
  className = ''
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(() => (currentMotion() === 'off' ? value : 0));
  const from = useRef(shown);

  useEffect(() => {
    if (currentMotion() === 'off') {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      const next = countUpFrame(origin, value, t);
      from.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // An interrupted count still ends on the true value.
      from.current = value;
      setShown(value);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
