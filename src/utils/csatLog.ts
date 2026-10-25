const EVENT = 'prepstride:log-csat';

let pending = false;

/** Ask the Tests screen to open the CSAT form. Safe if that screen is not mounted yet. */
export function requestCsatLog(): void {
  pending = true;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCsatLog(open: () => void): () => void {
  if (pending) {
    pending = false;
    open();
  }
  const onEvent = () => {
    pending = false;
    open();
  };
  window.addEventListener(EVENT, onEvent);
  return () => window.removeEventListener(EVENT, onEvent);
}
