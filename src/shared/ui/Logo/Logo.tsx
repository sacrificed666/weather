import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

// The brand mark
const Logo = ({ size = 32, className }: LogoProps) => {
  const id = useId();
  const fill = `${id}-fill`;
  const sheen = `${id}-sheen`;
  return (
    <svg className={className} viewBox="0 0 512 512" width={size} height={size} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4fc4ff" />
          <stop offset="1" stopColor="#2160e8" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="144" fill={`url(#${fill})`} />
      <rect width="512" height="512" rx="144" fill={`url(#${sheen})`} />
      <g transform="translate(-10 8)">
        <circle cx="300" cy="190" r="70" fill="#ffd34e" />
        <path d="M176 376a68 68 0 0 1-8-135.5A96 96 0 0 1 350 226a76 76 0 0 1 2 150Z" fill="#fff" />
      </g>
    </svg>
  );
};

export default Logo;
