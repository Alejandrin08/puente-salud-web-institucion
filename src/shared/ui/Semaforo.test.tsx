import { render } from '@testing-library/react'
import { InsigniaSemaforo, NIVELES } from './Semaforo'

describe('InsigniaSemaforo', () => {
  it.each(NIVELES)('nivel %s lleva texto y forma, no solo color', (nivel) => {
    const { container } = render(<InsigniaSemaforo nivel={nivel} />)
    const el = container.querySelector('.semaforo')!
    expect(el.textContent).toMatch(/Rojo|Amarillo|Gris|Verde/)
    expect(el.querySelector('svg')).not.toBeNull()
    expect(el.className).toContain(`semaforo--${nivel}`)
  })
  it('cada nivel usa una forma distinta', () => {
    const formas = NIVELES.map((n) => render(<InsigniaSemaforo nivel={n} />).container.querySelector('svg')!.innerHTML)
    expect(new Set(formas).size).toBe(4)
  })
})
