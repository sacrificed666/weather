import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const fontDirectory = join(process.cwd(), "src/shared/assets/fonts");

const subsets = ["latin", "latin-ext", "cyrillic"] as const;
const weights = [600, 800] as const;

export const OG_FONTS = await Promise.all(
  subsets.flatMap((subset) =>
    weights.map(async (weight) => ({
      name: "Montserrat",
      data: await readFile(join(fontDirectory, `montserrat-${subset}-${weight}.woff`)),
      weight,
      style: "normal" as const,
    })),
  ),
);

// The app icon as a data URL; a maskable one has a smaller glyph
export const readAppIcon = async (maskable = false) => {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8");
  const icon = maskable
    ? svg
        .replaceAll(' rx="144"', "")
        .replace('<g transform="', '<g transform="translate(256 256) scale(0.8) translate(-256 -256) ')
    : svg;
  return `data:image/svg+xml;base64,${Buffer.from(icon).toString("base64")}`;
};
