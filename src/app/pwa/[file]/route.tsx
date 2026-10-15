import { ImageResponse } from "next/og";

import { readAppIcon } from "@/features/seo/og/assets";

const ICONS = {
  "icon-192.png": { size: 192, maskable: false },
  "icon-512.png": { size: 512, maskable: false },
  "maskable-512.png": { size: 512, maskable: true },
} as const;

type IconFile = keyof typeof ICONS;

// Whether a file name is one of the manifest icons
const isIconFile = (file: string): file is IconFile => Object.hasOwn(ICONS, file);

// Prerenders every icon of the web app manifest
export const generateStaticParams = () => Object.keys(ICONS).map((file) => ({ file }));

// An icon of the web app manifest, drawn from the app icon
export const GET = async (_request: Request, { params }: RouteContext<"/pwa/[file]">) => {
  const { file } = await params;
  if (!isIconFile(file)) return new Response(null, { status: 404 });
  const { size, maskable } = ICONS[file];
  return new ImageResponse(<img src={await readAppIcon(maskable)} width={size} height={size} alt="" />, {
    width: size,
    height: size,
  });
};
