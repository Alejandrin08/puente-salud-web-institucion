import { distancia, fechaCorta, fechaLarga, hora, nombrePropio } from './formato'

describe('formato', () => {
  it('nombrePropio respeta artículos y siglas', () => {
    expect(nombrePropio('CENTRO DE SALUD SAN JOSÉ TATEPOSCO')).toBe('Centro de Salud San José Tateposco')
    expect(nombrePropio('UMF 54 TLAQUEPAQUE')).toBe('UMF 54 Tlaquepaque')
  })
  it('fechas en español de México sin desfase de zona horaria', () => {
    expect(fechaLarga('2026-11-19')).toBe('jueves, 19 de noviembre')
    expect(fechaCorta('2026-05-10')).toMatch(/^10 may 2026$/)
  })
  it('hora y distancia', () => {
    expect(hora('09:30:00')).toBe('09:30')
    expect(hora(null)).toBe('')
    expect(distancia(0.42)).toBe('420 m')
    expect(distancia(3.456)).toBe('3.5 km')
  })
})
