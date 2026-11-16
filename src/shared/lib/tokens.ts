/** Lee un token de color de tokens.css (para SVG de gráficos y capas de mapa, que no resuelven var()). */
export function token(nombre: string, respaldo = '#13233F'): string {
  if (typeof window === 'undefined') return respaldo
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${nombre}`).trim()
  return v || respaldo
}

export const SERIES = () => [1, 2, 3, 4, 5].map((i) => token(`chart-${i}`))
export const ESCALA_MAPA = () => [1, 2, 3, 4, 5].map((i) => token(`mapa-${i}`))
