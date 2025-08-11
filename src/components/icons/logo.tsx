import type { SVGProps } from "react";

export function CampusPulseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="CampusPulse Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <rect width="200" height="50" rx="5" fill="url(#logoGradient)" />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontFamily="var(--font-inter, Arial), sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
      >
        CampusPulse
      </text>
    </svg>
  );
}
