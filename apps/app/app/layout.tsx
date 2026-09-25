import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { BRAND_NAME } from "@irossini/core";
import { RegisterServiceWorker } from "./register-sw";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Puntos y beneficios en tu red de estaciones de servicio.",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#78BE20",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Necesario para que env(safe-area-inset-bottom) devuelva algo distinto de 0
  // en iPhones con home indicator — si no, la barra inferior queda pegada
  // contra el borde del sistema.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
