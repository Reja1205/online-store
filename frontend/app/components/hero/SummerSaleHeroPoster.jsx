/** Decorative summer sale poster for the home hero (right panel). */
export default function SummerSaleHeroPoster({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Summer sale — save on seasonal favorites"
    >
      <defs>
        <linearGradient id="posterBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7e6" />
          <stop offset="45%" stopColor="#ffe4a8" />
          <stop offset="100%" stopColor="#ffb347" />
        </linearGradient>
        <linearGradient id="sunGlow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffd814" />
          <stop offset="100%" stopColor="#ff9f1a" />
        </linearGradient>
      </defs>

      <rect x="16" y="20" width="288" height="360" rx="20" fill="url(#posterBg)" />
      <rect
        x="16"
        y="20"
        width="288"
        height="360"
        rx="20"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="3"
      />

      <circle cx="248" cy="72" r="36" fill="url(#sunGlow)" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="248"
          y1="72"
          x2={248 + Math.cos((deg * Math.PI) / 180) * 52}
          y2={72 + Math.sin((deg * Math.PI) / 180) * 52}
          stroke="#ff9f1a"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}

      <rect x="40" y="108" width="140" height="36" rx="18" fill="#e11d48" />
      <text
        x="110"
        y="132"
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        LIMITED TIME
      </text>

      <text
        x="48"
        y="178"
        fill="#0f172a"
        fontSize="34"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
      >
        SUMMER
      </text>
      <text x="48" y="218" fill="#007eb9" fontSize="34" fontWeight="900" fontFamily="system-ui, sans-serif">
        SALE
      </text>

      <text x="48" y="262" fill="#0f172a" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">
        Save on seasonal
      </text>
      <text x="48" y="286" fill="#0f172a" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">
        favorites
      </text>

      <path
        d="M200 250 l12 24 26 4 -19 18 5 26 -24 -13 -24 13 5 -26 -19 -18 26 -4z"
        fill="#ffd814"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
      <text
        x="200"
        y="258"
        textAnchor="middle"
        fill="#0f172a"
        fontSize="11"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        HOT
      </text>

      <rect x="32" y="318" width="256" height="44" rx="10" fill="#007eb9" />
      <text
        x="160"
        y="347"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.12em"
      >
        SHOP THE SALE
      </text>
    </svg>
  );
}
