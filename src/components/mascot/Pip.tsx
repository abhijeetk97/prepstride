import { useId } from 'react';
import { levelForXP } from '../../utils/gamification';

export type PipMood = 'cheer' | 'focus' | 'celebrate' | 'sleep' | 'wave';

const HAIR = '#3A2219';
const HAIR_STRAND = '#5E3B2B';
const GREEN = '#8DCB45';
const GREEN_SHADE = '#6FB43A';
const GREEN_DARK = '#62AA34';
const GREEN_LIGHT = '#A4D95C';
const CREAM = '#FCF3D9';
const BELLY = '#FBF1D4';
const EYE = '#2E1A10';
const IRIS = '#7A4322';
const BEAK = '#FBB12F';
const BEAK_SHADE = '#E8891A';
const FOOT = '#F6A623';

/** Left wing, drawn around its root at (64, 126). The right wing is the same group mirrored. */
function Wing() {
  return (
    <>
      <ellipse cx="42" cy="136" rx="25" ry="8.5" fill="#1EA4E0" transform="rotate(-26 42 136)" />
      <ellipse cx="33" cy="124" rx="29" ry="8.5" fill="#FBB52C" transform="rotate(-9 33 124)" />
      <ellipse cx="29" cy="110" rx="30" ry="9" fill="#F7616E" transform="rotate(10 29 110)" />
      <ellipse cx="46" cy="124" rx="24" ry="10" fill={GREEN_DARK} transform="rotate(20 46 124)" />
      <ellipse cx="35" cy="107" rx="35" ry="13" fill={GREEN} transform="rotate(34 35 107)" />
      <ellipse cx="27" cy="100" rx="21" ry="5" fill={GREEN_LIGHT} transform="rotate(34 27 100)" />
      <ellipse cx="62" cy="146" rx="12" ry="7" fill={GREEN_DARK} transform="rotate(-58 62 146)" />
    </>
  );
}

function OpenEye({ cx }: { cx: number }) {
  const outer = cx < 100 ? -1 : 1;
  return (
    <>
      <circle cx={cx} cy="84" r="12" fill={EYE} />
      <circle cx={cx} cy="85" r="9.4" fill={IRIS} />
      <circle cx={cx} cy="86" r="5.2" fill={EYE} />
      <circle cx={cx + 3.8} cy="80.2" r="3.6" fill="#fff" />
      <circle cx={cx - 3.6} cy="89.4" r="1.5" fill="#fff" />
      <path
        d={`M${cx + 12 * outer} 81 Q${cx + 9.5 * outer} 72.5 ${cx} 72 Q${cx - 8.5 * outer} 72 ${cx - 12 * outer} 79`}
        stroke={EYE}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${cx + 11.5 * outer} 80 L${cx + 16.5 * outer} 76.5 M${cx + 11 * outer} 83.5 L${cx + 16.5 * outer} 82.5`}
        stroke={EYE}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </>
  );
}

function ClosedEye({ cx }: { cx: number }) {
  const outer = cx < 100 ? -1 : 1;
  return (
    <path
      d={`M${cx - 10} 84 Q${cx} 92 ${cx + 10} 84 M${cx + 10 * outer} 84 L${cx + 14 * outer} 81`}
      stroke={EYE}
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Spectacles() {
  return (
    <g fill="rgb(255 255 255 / .18)" stroke="#4A3424" strokeWidth="2.6">
      <circle cx="82" cy="85" r="14.5" />
      <circle cx="118" cy="85" r="14.5" />
      <path d="M96.5 83 Q100 80 103.5 83 M67.5 82 L58 78 M132.5 82 L142 78" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Rank accessories (PRD Module 12.1), drawn in place of the old emoji badges. Rank 1 has none. */
function Accessory({ level }: { level: number }) {
  switch (level) {
    case 2: // scarf
      return (
        <g className="pip-accessory">
          <path d="M62 108 Q100 124 138 108 L139 119 Q100 136 61 119 Z" fill="#E2574C" />
          <path d="M118 122 L130 146 L117 145 L111 124 Z" fill="#C9443A" />
          <path d="M70 114 Q100 126 130 114" stroke="#F3897F" strokeWidth="2" fill="none" />
        </g>
      );
    case 3: // notebook
      // The animated group stays separate from the rotated one: a CSS transform would replace the attribute.
      return (
        <g className="pip-accessory">
          <g transform="rotate(-10 128 150)">
            <rect x="110" y="134" width="36" height="28" rx="3.5" fill="#4D7CC2" />
            <rect x="115" y="138" width="27" height="20" rx="1.5" fill="#FDFBF4" />
            <path d="M119 144 H138 M119 149 H136 M119 154 H132" stroke="#B9C7DE" strokeWidth="1.6" />
          </g>
        </g>
      );
    case 4:
      return (
        <g className="pip-accessory">
          <Spectacles />
        </g>
      );
    case 5: // quill tucked into the hair
      return (
        <g className="pip-accessory">
          <g transform="rotate(32 150 34)">
            <ellipse cx="150" cy="30" rx="7" ry="20" fill="#F4EFE3" />
            <path d="M150 12 L150 56" stroke="#9A8E7A" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M146 22 L150 26 M154 20 L150 24 M146 32 L150 36 M154 30 L150 34" stroke="#D8CFBD" strokeWidth="1.2" />
          </g>
        </g>
      );
    case 6: // badge pinned on the chest
      return (
        <g className="pip-accessory">
          <path d="M111 124 L116 140 L121 132 L126 140 L131 124 Z" fill="#3D6FB6" />
          <circle cx="121" cy="144" r="8" fill="#E7B73A" stroke="#C99A24" strokeWidth="1.6" />
          <path d="M121 139.5 L122.4 142.6 L125.6 142.9 L123.2 145 L123.9 148.2 L121 146.5 L118.1 148.2 L118.8 145 L116.4 142.9 L119.6 142.6 Z" fill="#FFF3C4" />
        </g>
      );
    case 7: // golden sash
      return (
        <g className="pip-accessory">
          <path d="M66 116 L78 112 L136 162 L124 166 Z" fill="#E7B73A" />
          <path d="M70 117 L78 114.5 L131 160" stroke="#FFE08A" strokeWidth="1.6" fill="none" />
          <circle cx="104" cy="139" r="5" fill="#C99A24" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Pip the Stride Bird: an inline SVG drawn from the official artwork, built from named
 * parts so CSS can animate real poses (see src/styles/motion.css). The PNG stays for the
 * PWA icon and the share card.
 */
export function Pip({
  mood = 'cheer',
  xp,
  size = 96,
  accessoryDrop = false,
  className = ''
}: {
  mood?: PipMood;
  xp?: number;
  size?: number;
  /** Drop the rank accessory in from above (once, on a new rank). */
  accessoryDrop?: boolean;
  className?: string;
}) {
  const id = useId();
  const level = xp !== undefined ? levelForXP(xp).level : 1;
  // Spread blinks so several Pips on screen never blink in sync.
  const seed = Array.from(id).reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const blinkDelay = `-${(seed % 9) * 0.53}s`;
  const eyesOpen = mood !== 'sleep';
  const beakOpen = mood === 'cheer' || mood === 'wave' || mood === 'celebrate';
  const glasses = mood === 'focus' && level !== 4;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Pip the Stride Bird"
      className={`pip pip-${mood} shrink-0 ${accessoryDrop ? 'pip-accessory-drop' : ''} ${className}`}
    >
      <g className="pip-hop">
        {/* feet stay planted while the body breathes */}
        <g fill={FOOT}>
          <rect x="77" y="160" width="8" height="18" rx="3" />
          <rect x="115" y="160" width="8" height="18" rx="3" />
          <ellipse cx="81" cy="179" rx="12" ry="6" />
          <ellipse cx="70" cy="183" rx="7" ry="5" />
          <ellipse cx="81" cy="185" rx="7" ry="5.5" />
          <ellipse cx="92" cy="183" rx="7" ry="5" />
          <ellipse cx="119" cy="179" rx="12" ry="6" />
          <ellipse cx="108" cy="183" rx="7" ry="5" />
          <ellipse cx="119" cy="185" rx="7" ry="5.5" />
          <ellipse cx="130" cy="183" rx="7" ry="5" />
        </g>

        <g className="pip-body">
          {/* hair, back layer */}
          <path
            fill={HAIR}
            d="M58 126 C51 131 42 129 40 122 C33 121 28 113 32 106 C27 104 23 97 25 90 C19 84 18 72 25 66 C21 58 24 48 33 43 C36 34 46 28 56 29 C61 21 71 17 80 19 C86 13 95 12 101 16 C108 11 117 11 122 16 C130 14 139 18 141 25 C150 25 157 33 156 42 C163 48 165 59 160 66 C166 74 164 85 157 90 C161 98 157 106 149 107 C149 113 144 117 138 114 L140 80 L62 80 Z"
          />
          <path
            fill="none"
            stroke={HAIR_STRAND}
            strokeWidth="2.4"
            strokeLinecap="round"
            d="M37 62 C33 72 35 82 42 88 M35 92 C34 102 39 109 47 112 M48 44 C42 50 40 58 42 64 M146 41 C152 48 153 56 150 62 M151 70 C156 78 155 86 150 91 M78 27 C85 21 93 19 100 21"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
            opacity=".6"
            d="M27 66 C25 71 25 76 27 80 M30 92 C29 96 30 100 33 103 M42 122 C45 126 50 128 54 127 M156 66 C158 70 158 75 156 79"
          />
          <path fill="none" stroke={HAIR} strokeWidth="4.5" strokeLinecap="round" d="M104 16 C100 9 104 4 111 4 M114 16 C116 9 122 7 127 10" />
          {level === 5 && <Accessory level={5} />}

          {/* head and body */}
          <g fill={GREEN_SHADE}>
            <circle cx="100" cy="82" r="45" />
            <ellipse cx="100" cy="134" rx="42" ry="34" />
          </g>
          <g fill={GREEN}>
            <circle cx="100" cy="81" r="43" />
            <ellipse cx="100" cy="130" rx="39.5" ry="31" />
          </g>

          <g className="pip-wing pip-wing-l">
            <Wing />
          </g>
          <g transform="matrix(-1 0 0 1 200 0)">
            <g className="pip-wing pip-wing-r">
              <Wing />
            </g>
          </g>

          <ellipse cx="101" cy="140" rx="30" ry="25" fill={BELLY} />
          <ellipse cx="106" cy="132" rx="15" ry="8" fill="#F3E2B8" opacity=".5" />

          {/* face */}
          <g fill={CREAM}>
            <ellipse cx="81" cy="84" rx="17" ry="17" />
            <ellipse cx="119" cy="84" rx="17" ry="17" />
            <ellipse cx="100" cy="100" rx="39" ry="19" />
          </g>
          <ellipse cx="81" cy="76" rx="13" ry="8" fill="#E2EEBB" opacity=".75" />
          <ellipse cx="119" cy="76" rx="13" ry="8" fill="#E2EEBB" opacity=".75" />
          <path
            fill="#9ED653"
            d="M68 113 L132 113 C134 122 127 127 122 123 C121 131 112 132 109 126 C106 134 95 134 92 126 C88 132 79 131 78 123 C73 127 66 122 68 113 Z"
          />
          <ellipse cx="70" cy="101" rx="8.5" ry="5.8" fill="#F7A3A0" opacity=".85" />
          <ellipse cx="130" cy="101" rx="8.5" ry="5.8" fill="#F7A3A0" opacity=".85" />
          <path d="M72 63 Q79 58 87 61 M113 61 Q121 58 128 63" stroke={HAIR} strokeWidth="2.8" fill="none" strokeLinecap="round" />

          <g className="pip-eyes" style={{ animationDelay: blinkDelay }}>
            {eyesOpen ? (
              <>
                <OpenEye cx={82} />
                <OpenEye cx={118} />
              </>
            ) : (
              <>
                <ClosedEye cx={82} />
                <ClosedEye cx={118} />
              </>
            )}
          </g>

          {/* beak */}
          {beakOpen ? (
            <>
              <path fill={BEAK_SHADE} d="M90 95 Q100 91 110 95 Q108 113 100 114 Q92 113 90 95 Z" />
              <path fill="#C93A4A" d="M93 97 Q100 95 107 97 Q106 110 100 111 Q94 110 93 97 Z" />
              <ellipse cx="100" cy="106.5" rx="5" ry="3.6" fill="#F58A98" />
            </>
          ) : (
            <path fill={BEAK_SHADE} d="M91 96 Q100 99 109 96 Q106 104 100 105 Q94 104 91 96 Z" />
          )}
          <path fill={BEAK} d="M87 93 Q100 83 113 93 Q107 100.5 100 101 Q93 100.5 87 93 Z" />
          <path fill="#FDCB5E" d="M93 91 Q100 87 107 91 Q100 93 93 91 Z" opacity=".8" />

          {/* hair, fringe */}
          <path
            fill={HAIR}
            d="M51 96 C46 73 56 52 72 42 C84 34 96 33 104 36 C116 32 133 36 143 47 C152 57 153 73 147 88 C145 74 140 63 131 56 C123 49 113 45 104 43 C94 45 82 48 72 56 C62 64 56 78 51 96 Z"
          />
          <path fill="none" stroke={HAIR_STRAND} strokeWidth="2" strokeLinecap="round" d="M60 64 C68 52 80 46 94 43 M114 41 C126 43 136 51 142 63" />

          {glasses && <Spectacles />}
          {level !== 5 && <Accessory level={level} />}
        </g>

        {mood === 'sleep' && (
          <g className="pip-zzz" fill="rgb(var(--c-ink-soft))" fontWeight="800" fontFamily="system-ui, sans-serif" aria-hidden>
            <text x="150" y="44" fontSize="18" className="pip-z">z</text>
            <text x="164" y="26" fontSize="13" className="pip-z" style={{ animationDelay: '1s' }}>z</text>
          </g>
        )}
      </g>
    </svg>
  );
}
