import { useEffect, useState } from 'react';
import type { MotionSetting } from '../types';

export type MotionLevel = 'full' | 'calm' | 'off';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Resolve the Settings choice against the OS preference: reduced motion picks Calm under 'system'. */
export function resolveMotion(setting: MotionSetting | undefined, osReduce: boolean): MotionLevel {
  const s = setting ?? 'system';
  return s === 'system' ? (osReduce ? 'calm' : 'full') : s;
}

/** Current tier for code that cannot use the hook (rAF loops, View Transitions). */
export function currentMotion(): MotionLevel {
  const level = typeof document !== 'undefined' ? document.documentElement.dataset.motion : undefined;
  return level === 'calm' || level === 'off' ? level : 'full';
}

/** Applies the tier to <html data-motion> and pauses CSS animations while the app is hidden. */
export function useMotionPreference(setting: MotionSetting | undefined): MotionLevel {
  const [osReduce, setOsReduce] = useState(() => typeof matchMedia === 'function' && matchMedia(QUERY).matches);

  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(QUERY);
    const onChange = () => setOsReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const level = resolveMotion(setting, osReduce);

  useEffect(() => {
    document.documentElement.dataset.motion = level;
  }, [level]);

  useEffect(() => {
    const root = document.documentElement;
    const onVisibility = () => {
      if (document.hidden) root.dataset.hidden = '';
      else delete root.dataset.hidden;
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return level;
}
