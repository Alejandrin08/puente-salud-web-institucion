import type { AgebFeature, IndicadorAgeb } from '../../shared/api/tipos'

export type Capa = 'control' | 'sin_afiliacion' | 'rezago'

export const CAPAS: { id: Capa; nombre: string; fuente: string; simulada: boolean }[] = [
  { id: 'control', nombre: '% en control', fuente: 'Folio Único de Seguimiento (datos simulados)', simulada: true },
  { id: 'sin_afiliacion', nombre: '% sin afiliación a servicios de salud', fuente: 'INEGI, Censo 2020', simulada: false },
  { id: 'rezago', nombre: 'Grado de rezago social', fuente: 'CONEVAL 2020', simulada: false },
]

export const REZAGOS = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'] as const

/** Cortes fijos (no cuantiles) para que el mapa se lea igual entre cortes de fecha. */
export const CORTES: Record<Exclude<Capa, 'rezago'>, number[]> = {
  control: [30, 40, 50, 60],
  sin_afiliacion: [20, 30, 40, 50],
}

export function claseNumerica(v: number | null | undefined, cortes: number[]): number | null {
  if (v == null || Number.isNaN(v)) return null
  const i = cortes.findIndex((c) => v < c)
  return i === -1 ? cortes.length : i
}

export function leyenda(capa: Capa): string[] {
  if (capa === 'rezago') return [...REZAGOS]
  const c = CORTES[capa]
  return [`menos de ${c[0]}%`, `${c[0]} a ${c[1]}%`, `${c[1]} a ${c[2]}%`, `${c[2]} a ${c[3]}%`, `${c[3]}% o más`]
}

export function clasificador(capa: Capa, agebs: AgebFeature[], indicadores: IndicadorAgeb[]) {
  const ind = new Map(indicadores.map((i) => [i.cvegeo, i]))
  const props = new Map(agebs.map((a) => [a.id, a.properties]))
  return (cvegeo: string): { clase: number | null; etiqueta: string } => {
    if (capa === 'rezago') {
      const r = props.get(cvegeo)?.rezago ?? 'Sin dato'
      const k = REZAGOS.indexOf(r as (typeof REZAGOS)[number])
      return { clase: k === -1 ? null : k, etiqueta: `rezago ${r.toLowerCase()}` }
    }
    if (capa === 'sin_afiliacion') {
      const v = props.get(cvegeo)?.pct_sinder ?? null
      return { clase: claseNumerica(v, CORTES.sin_afiliacion), etiqueta: v == null ? 'sin dato' : `${v.toFixed(1)}% sin afiliación` }
    }
    const i = ind.get(cvegeo)
    const v = i?.suficiente ? i.control_pct : null
    return {
      clase: claseNumerica(v, CORTES.control),
      etiqueta: v == null ? `pocos casos (${i?.confirmadas ?? 0} confirmadas)` : `${v.toFixed(0)}% en control (${i!.confirmadas} confirmadas)`,
    }
  }
}
