export function HeroIllustration() {
  return (
    <div className="relative mx-auto -mt-6 w-full max-w-[580px] sm:-mt-10 lg:-mt-8">
      <div className="absolute -bottom-6 left-1/2 h-36 w-[80%] -translate-x-1/2 rounded-full bg-[#12c8b0]/35 blur-3xl" />
      <svg
        viewBox="0 0 680 540"
        className="relative w-full"
        role="img"
        aria-label="Isometric illustration of software, servers and IT infrastructure"
      >
        <defs>
          <linearGradient id="board" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#1ad4bc" />
            <stop offset="100%" stopColor="#0ea89a" />
          </linearGradient>
          <linearGradient id="chipFace" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#9ffbef" />
            <stop offset="100%" stopColor="#2ee9d0" />
          </linearGradient>
          <linearGradient id="screenA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#124055" />
            <stop offset="100%" stopColor="#071820" />
          </linearGradient>
          <filter id="soft">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#12c8b0" floodOpacity="0.25" />
          </filter>
        </defs>

        <g transform="translate(70 230)" filter="url(#soft)">
          <path d="M40 110 L210 20 L380 110 L210 200 Z" fill="url(#board)" />
          <path d="M40 110 L40 128 L210 218 L210 200 Z" fill="#0b8f82" />
          <path d="M380 110 L380 128 L210 218 L210 200 Z" fill="#08756b" />
          <path
            d="M90 108 L150 76 M120 130 L190 92 M270 76 L330 108 M230 92 L300 130"
            stroke="#063a36"
            strokeWidth="3"
            opacity="0.35"
          />
          <path d="M150 100 L210 68 L270 100 L210 132 Z" fill="url(#chipFace)" />
          <path d="M168 100 L210 78 L252 100 L210 122 Z" fill="#063a36" opacity="0.2" />
          <path d="M186 100 L210 88 L234 100 L210 112 Z" fill="#7dffe9" />
        </g>

        <g transform="translate(18 70)">
          <path d="M20 150 L150 80 L280 150 L150 220 Z" fill="#f3f6f9" />
          <path d="M36 148 L150 92 L264 148 L150 204 Z" fill="url(#screenA)" />
          <path d="M70 130h50M70 146h78M70 162h60" stroke="#5ff5de" strokeWidth="5" />
          <path d="M70 182h70" stroke="#2c6674" strokeWidth="4" />
          <path d="M20 150 L20 166 L150 236 L150 220 Z" fill="#c9d1da" />
          <path d="M280 150 L280 166 L150 236 L150 220 Z" fill="#8e99a4" />
          <path d="M132 232 L150 242 L168 232 L150 222 Z" fill="#dde3ea" />
          <path d="M144 240 L150 258 L156 240" fill="#b7c0c9" />
        </g>

        <g transform="translate(310 18)">
          <path d="M30 170 L200 80 L370 170 L200 260 Z" fill="#f7f9fb" />
          <path d="M50 168 L200 96 L350 168 L200 240 Z" fill="url(#screenA)" />
          <path d="M90 142h70M90 160h110M90 178h86" stroke="#7dffe9" strokeWidth="6" />
          <path d="M90 202h96M90 218h70" stroke="#2c6674" strokeWidth="4" />
          <path d="M30 170 L30 188 L200 278 L200 260 Z" fill="#cdd4dc" />
          <path d="M370 170 L370 188 L200 278 L200 260 Z" fill="#8b959f" />
          <path d="M176 274 L200 288 L224 274 L200 260 Z" fill="#e4e9ee" />
          <path d="M192 286 L200 312 L208 286" fill="#b4bcc5" />
        </g>

        <g transform="translate(430 268)">
          <ellipse cx="78" cy="168" rx="70" ry="18" fill="#12c8b0" opacity="0.28" />
          <path d="M8 78 C8 58 40 42 78 42 C116 42 148 58 148 78 L148 168 C148 188 116 204 78 204 C40 204 8 188 8 168 Z" fill="#f4f7fa" />
          <ellipse cx="78" cy="78" rx="70" ry="20" fill="#ffffff" />
          <ellipse cx="78" cy="78" rx="48" ry="12" fill="#12c8b0" />
          <path d="M8 108 C28 122 128 122 148 108" stroke="#d4dae2" fill="none" />
          <path d="M8 134 C28 148 128 148 148 134" stroke="#d4dae2" fill="none" />
          <text x="58" y="34" fill="#7dffe9" fontSize="18" fontFamily="monospace">
            01
          </text>
        </g>

        <g transform="translate(538 210)">
          <path d="M10 60 C10 44 36 32 64 32 C92 32 118 44 118 60 L118 132 C118 148 92 160 64 160 C36 160 10 148 10 132 Z" fill="#eef2f6" />
          <ellipse cx="64" cy="60" rx="54" ry="16" fill="#ffffff" />
          <ellipse cx="64" cy="60" rx="34" ry="9" fill="#12c8b0" />
          <text x="88" y="28" fill="#5ff5de" fontSize="16" fontFamily="monospace">
            10
          </text>
        </g>
      </svg>
    </div>
  );
}
