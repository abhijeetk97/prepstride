import { currentMotion } from '../hooks/useMotionPreference';

// Short vibration pulses where the browser supports them (Android Chrome). iOS Safari has no
// vibrate API and stays silent. Off when the motion tier is Off or the user turns it off.

let enabled = true;

export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}

export function hapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function haptic(ms = 12): void {
  if (!enabled || !hapticsSupported() || currentMotion() === 'off') return;
  try {
    navigator.vibrate(ms);
  } catch {
    // Some browsers throw before the first user gesture; a missed pulse is harmless.
  }
}
