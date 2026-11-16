import { hayError, vistaPrevia } from './vistaPrevia'

describe('vista previa de la medición (Anexo D.1)', () => {
  it('meta de presión 140/90 y 130/80 con diabetes', () => {
    expect(vistaPrevia({ pas: 135, pad: 85 }, ['hipertension'])[0].tono).toBe('ok')
    expect(vistaPrevia({ pas: 135, pad: 85 }, ['hipertension', 'diabetes'])[0].tono).toBe('alerta')
  })
  it('crisis mayor de 180/110', () => {
    expect(vistaPrevia({ pas: 186, pad: 100 }, ['hipertension'])[0]).toMatchObject({ tono: 'grave' })
  })
  it('glucosa baja requiere valoración; HbA1c manda sobre la meta', () => {
    expect(vistaPrevia({ glucosa: 62 }, ['diabetes'])[0].texto).toContain('Requiere valoración')
    expect(vistaPrevia({ hba1c: 6.8 }, ['diabetes'])[0].tono).toBe('ok')
  })
  it('errores de captura', () => {
    expect(hayError(vistaPrevia({ pas: 140 }, ['hipertension']))).toBe(true)
    expect(hayError(vistaPrevia({ pas: 80, pad: 90 }, ['hipertension']))).toBe(true)
    expect(hayError(vistaPrevia({ glucosa: 900 }, ['diabetes']))).toBe(true)
    expect(hayError(vistaPrevia({ pas: 120, pad: 80 }, ['hipertension']))).toBe(false)
  })
})
