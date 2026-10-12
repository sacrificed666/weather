import { ImageResponse } from "next/og";

import { readAppIcon } from "@/features/seo/og/assets";

export const size = { width: 180, height: 180 };

export const contentType = "image/png";

// Home screen icon for iOS, drawn from the app icon
const AppleIcon = async () =>
  new ImageResponse(<img src={await readAppIcon()} width={size.width} height={size.height} alt="" />, size);

export default AppleIcon;
