/** Decorative new arrivals poster for the home hero (right panel). */
export default function HeroNewArrivalsPoster({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="New arrivals in Women's, Men's and Kids"
    >
      <defs>
        <linearGradient id="newBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="50%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>
      <rect x="16" y="20" width="288" height="360" rx="20" fill="url(#newBg)" />
      <rect x="16" y="20" width="288" height="360" rx="20" stroke="rgba(255,255,255,0.65)" strokeWidth="3" />
      <rect x="40" y="108" width="120" height="36" rx="18" fill="#be185d" />
      <text
        x="100"
        y="132"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        NEW IN
      </text>
      <text x="48" y="182" fill="#0f172a" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif">
        {"WOMEN'S"}
      </text>
      <text x="48" y="218" fill="#007eb9" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif">
        {"MEN'S"}
      </text>
      <text x="48" y="254" fill="#be185d" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif">
        &amp; KIDS
      </text>
      <text x="48" y="292" fill="#0f172a" fontSize="16" fontWeight="700" fontFamily="system-ui, sans-serif">
        Fresh styles
      </text>
      <text x="48" y="314" fill="#0f172a" fontSize="16" fontWeight="700" fontFamily="system-ui, sans-serif">
        this season
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
        letterSpacing="0.1em"
      >
        EXPLORE
      </text>
    </svg>
  );
}
