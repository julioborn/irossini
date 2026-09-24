/**
 * Tokens de marca. Verde como color de acción principal, usado con mesura por ser
 * muy saturado — reservado para CTAs, estados activos y acentos, no para superficies
 * grandes. Escala derivada de la marca (#78BE20); ajustar si el logo final trae una
 * guía de estilo con valores exactos.
 */

export const brand = {
  white: "#FFFFFF",
  black: "#000000",
  green: {
    50: "#f4faec",
    100: "#e5f4d1",
    200: "#cce9a8",
    300: "#aedb76",
    400: "#94cf4a",
    500: "#78BE20", // primario de marca
    600: "#5f9a19",
    700: "#497314",
    800: "#34530f",
    900: "#22380a",
  },
  neutral: {
    50: "#fafafa",
    100: "#f2f2f2",
    200: "#e4e4e4",
    300: "#cbcbcb",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#3a3a3a",
    800: "#242424",
    900: "#141414",
  },
  // Tinta y verdeProfundo: no son "negro puro" ni "verde puro" — llevan un dejo
  // del otro para que el degradé del hero y las superficies elevadas no se
  // sientan genéricas. Usar con moderación, son extremos de gradiente, no fondos
  // de uso general.
  tinta: "#0A0B09",
  verdeProfundo: "#2E4A0C",
  // Blanco con un dejo verdoso, para filas de lista / superficies secundarias
  // en vez de un gris neutro sin relación con la marca.
  superficieMedia: "#F4F6F1",
} as const;

export const semantic = {
  action: brand.green[500],
  actionHover: brand.green[600],
  actionPressed: brand.green[700],
  background: brand.white,
  backgroundDark: brand.black,
  foreground: brand.black,
  foregroundDark: brand.white,
  success: brand.green[600],
  warning: "#C79A1E",
  danger: "#C7401E",
} as const;
