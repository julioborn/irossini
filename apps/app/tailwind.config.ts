import type { Config } from "tailwindcss";
import { irossiniPreset } from "@irossini/ui/src/tailwind-preset";

const config: Config = {
  presets: [irossiniPreset as Config],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "media",
};

export default config;
