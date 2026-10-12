import styles from "./WeatherIcon.module.scss";

interface WeatherIconProps {
  name: string;
  size: number;
  label?: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  animated?: boolean;
  className?: string;
}

// The animated or the still version of a weather icon
const iconPath = (name: string, animated: boolean) => `/icons/${animated ? "weather" : "weather-static"}/${name}.svg`;

// A weather icon, still when the effects are reduced
const WeatherIcon = ({
  name,
  size,
  label,
  loading = "lazy",
  priority = false,
  animated = true,
  className,
}: WeatherIconProps) => {
  // The icon itself, still or animated
  const image = (
    <img
      className={className}
      src={iconPath(name, animated)}
      width={size}
      height={size}
      alt={label ?? ""}
      loading={priority ? "eager" : loading}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
    />
  );
  if (!animated) return image;
  return (
    <picture className={styles.picture}>
      <source srcSet={iconPath(name, false)} media="(prefers-reduced-motion: reduce)" />
      {image}
    </picture>
  );
};

export default WeatherIcon;
