export default function Logo({ className = "h-8 w-auto", light = false }) {
  const wordmarkFill = light ? '#FFFFFF' : '#2B2B24';
  const subtitleFill = light ? 'rgba(255,255,255,0.7)' : '#78766B';
  const mountainDark = light ? '#FFFFFF' : '#2D6A4F';
  const mountainStroke = light ? 'rgba(255,255,255,0.6)' : '#1B4332';
  const mountainLight = light ? 'rgba(255,255,255,0.85)' : '#52B788';
  const sunFill = light ? '#D4A373' : '#D4A373';
  const riverStroke = light ? 'rgba(255,255,255,0.5)' : '#D4A373';

  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mountain icon (left) */}
      <g transform="translate(0, 10)">
        <path
          d="M30 80 L55 35 L80 80 L30 80Z"
          fill={mountainDark}
          stroke={mountainStroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M55 35 L75 65 L60 65 L55 55 L50 65 L35 65 L55 35Z"
          fill={mountainLight}
          stroke="none"
        />
        <circle cx="55" cy="28" r="4" fill={sunFill} />
        {/* River line */}
        <path
          d="M30 80 L55 80 L80 80"
          stroke={riverStroke}
          strokeWidth="2"
          strokeDasharray="2 2"
        />
      </g>

      {/* Wordmark */}
      <g transform="translate(95, 30)">
        <text
          x="0"
          y="0"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="700"
          fontSize="36"
          fill={wordmarkFill}
        >
          Hpa‑An
        </text>
        <text
          x="0"
          y="26"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="500"
          fontSize="14"
          fill={subtitleFill}
          letterSpacing="2"
        >
          TRAVEL
        </text>
      </g>
    </svg>
  );
}
