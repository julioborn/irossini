interface IconProps {
  color?: string;
  size?: number;
}

const base = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconFuel({ color = "currentColor", size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M4 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M4 11h10" />
      <path d="M15 8.5 18.5 12a1.5 1.5 0 0 1 .5 1.1V18a1.5 1.5 0 0 0 3 0v-6l-2.5-2.5" />
    </svg>
  );
}

export function IconHistory({ color = "currentColor", size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconScan({ color = "currentColor", size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function IconGift({ color = "currentColor", size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="4" y="9" width="16" height="11" rx="1.2" />
      <path d="M4 13h16" />
      <path d="M12 9v11" />
      <path d="M12 9c-1-2.5-3-3.5-4.3-3-1.3.5-1.2 2.4.3 3z" />
      <path d="M12 9c1-2.5 3-3.5 4.3-3 1.3.5 1.2 2.4-.3 3z" />
    </svg>
  );
}
