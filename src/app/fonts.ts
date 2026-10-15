import { Montserrat } from "next/font/google";

// Montserrat, self-hosted at build time; only Latin is preloaded
export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});
