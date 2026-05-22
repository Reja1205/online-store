/** Decorative free-shipping poster for the home hero (right panel). */
export default function HeroShippingPoster({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fast, free shipping on qualifying orders"
    >
      <defs>
        <linearGradient id="shipBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <rect x="16" y="20" width="288" height="360" rx="20" fill="url(#shipBg)" />
      <rect x="16" y="20" width="288" height="360" rx="20" stroke="rgba(255,255,255,0.65)" strokeWidth="3" />
      <rect x="40" y="108" width="160" height="36" rx="18" fill="#007eb9" />
      <text
        x="120"
        y="132"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        FREE SHIPPING
      </text>
      <text x="48" y="188" fill="#0f172a" fontSize="30" fontWeight="900" fontFamily="system-ui, sans-serif">
        FAST
      </text>
      <text x="48" y="228" fill="#0369a1" fontSize="30" fontWeight="900" fontFamily="system-ui, sans-serif">
        DELIVERY
      </text>
      <text x="48" y="272" fill="#0f172a" fontSize="17" fontWeight="700" fontFamily="system-ui, sans-serif">
        On qualifying
      </text>
      <text x="48" y="296" fill="#0f172a" fontSize="17" fontWeight="700" fontFamily="system-ui, sans-serif">
        orders
      </text>
      <rect x="88" y="300" width="104" height="48" rx="6" fill="#ffd814" opacity="0.85" />
      <circle cx="108" cy="358" r="9" fill="#0f172a" />
      <circle cx="172" cy="358" r="9" fill="#0f172a" />
      <rect x="32" y="318" width="256" height="44" rx="10" fill="#007eb9" />
      <text
        x="160"
        y="347"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.1em"
      >
        SHOP NOW
      </text>
    </svg>
  );
}
