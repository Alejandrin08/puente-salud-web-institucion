import type { AgebFeature, IndicadorAgeb } from '../../shared/api/tipos'
import { claseNumerica, clasificador, leyenda } from './capas'

const ageb = (id: string, rezago: string, pct: number | null) =>
  ({ id, properties: { cvegeo: id, cve_ageb: id.slice(-4), rezago, pct_sinder: pct } }) as unknown as AgebFeature
const ind = (cvegeo: string, control: number | null, suficiente: boolean, confirmadas = 4) =>
  ({ cvegeo, control_pct: control, suficiente, confirmadas }) as IndicadorAgeb

describe('capas del mapa', () => {
  it('claseNumerica con cortes fijos', () => {
    expect(claseNumerica(10, [30, 40, 50, 60])).toBe(0)
    expect(claseNumerica(30, [30, 40, 50, 60])).toBe(1)
    expect(claseNumerica(75, [30, 40, 50, 60])).toBe(4)
    expect(claseNumerica(null, [30])).toBeNull()
  })

  it('el % en control solo se pinta si hay casos suficientes', () => {
    const c = clasificador('control', [], [ind('A', 55, true), ind('B', 90, false, 1)])
    expect(c('A')).toEqual({ clase: 3, etiqueta: '55% en control (4 confirmadas)' })
    expect(c('B').clase).toBeNull()
    expect(c('B').etiqueta).toContain('pocos casos')
  })

  it('rezago ordinal y sin dato', () => {
    const c = clasificador('rezago', [ageb('A', 'Alto', 30), ageb('B', 'Sin dato', null)], [])
    expect(c('A').clase).toBe(3)
    expect(c('B').clase).toBeNull()
  })

  it('leyendas de 5 clases', () => {
    expect(leyenda('control')).toHaveLength(5)
    expect(leyenda('sin_afiliacion')[4]).toBe('50% o más')
    expect(leyenda('rezago')[0]).toBe('Muy bajo')
  })
})
