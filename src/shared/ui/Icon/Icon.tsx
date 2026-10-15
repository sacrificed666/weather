import { icons, type IconName } from "./icons";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// An outline icon from the shared set, hidden from screen readers
const Icon = ({ name, size = 20, className }: IconProps) => {
  const paths: readonly string[] = icons[name];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
};

export default Icon;
