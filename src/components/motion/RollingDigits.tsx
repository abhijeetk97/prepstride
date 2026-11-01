const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Each digit rolls on a vertical strip instead of flicking. Non-digits (":") stay still. */
export function RollingDigits({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex ${className}`} aria-label={text} role="img">
      {Array.from(text).map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${text.length}-${i}`} className="roll-digit" aria-hidden>
            <span className="roll-strip" style={{ transform: `translateY(-${Number(ch) * 10}%)` }}>
              {DIGITS.map((d) => (
                <span key={d} style={{ height: '1em' }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${text.length}-${i}`} aria-hidden>
            {ch}
          </span>
        )
      )}
    </span>
  );
}
