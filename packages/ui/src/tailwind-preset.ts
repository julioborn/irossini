import type { Config } from "tailwindcss";
import { brand } from "./tokens";

/**
 * Preset de Tailwind compartido por las apps del monorepo. Consumir con:
 *   presets: [require("@irossini/ui/src/tailwind-preset").irossiniPreset]
 */
export const irossiniPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          white: brand.white,
          black: brand.black,
          green: brand.green,
          tinta: brand.tinta,
          verdeProfundo: brand.verdeProfundo,
        },
        neutral: brand.neutral,
        superficieMedia: brand.superficieMedia,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gauge": `linear-gradient(160deg, ${brand.green[500]} 0%, ${brand.verdeProfundo} 65%, ${brand.tinta} 100%)`,
      },
    },
  },
};

export default irossiniPreset;
