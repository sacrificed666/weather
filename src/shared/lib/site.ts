import packageJson from "../../../package.json" with { type: "json" };

export const SITE = {
  keywords: [
    "weather",
    "forecast",
    "hourly forecast",
    "7-day forecast",
    "air quality",
    "sunrise",
    "sunset",
    "wind",
    "OpenWeatherMap",
  ],
  author: { name: "Illia Movchko", url: "https://github.com/sacrificed666" },
  repository: "https://github.com/sacrificed666/weather",
  version: packageJson.version,
  changelog: "https://github.com/sacrificed666/weather/blob/main/CHANGELOG.md",
  themeColor: { light: "#dbe5f1", dark: "#0a1020" },
} as const;

type Environment = Readonly<Partial<Record<string, string>>>;

// The public address: SITE_URL, the Vercel domain or localhost
export const siteUrl = (env: Environment = process.env): URL => {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL(`http://localhost:${env.PORT ?? "3000"}`);
};

// Only production may be indexed: APP_ENV for Docker, VERCEL_ENV on Vercel
export const isIndexable = (env: Environment = process.env) => {
  const environment = env.APP_ENV ?? env.VERCEL_ENV;
  return environment === undefined || environment === "production";
};
