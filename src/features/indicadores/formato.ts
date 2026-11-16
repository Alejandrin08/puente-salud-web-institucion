export const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(0)}%`)
export const dias = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(0)} días`)

/** Nombre corto del programa para ejes y leyendas. */
export const CORTO: Record<string, string> = {
  centros_rxii: 'Centros de salud',
  caravanas: 'Caravanas',
  ferias: 'Ferias de salud',
  medicos_hogar: 'Médicos en tu Hogar',
  casa_por_casa: 'Casa por Casa',
}

export function mes(m: string): string {
  const [y, mm] = m.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' }).format(new Date(y, mm - 1, 1)).replace('.', '')
}
