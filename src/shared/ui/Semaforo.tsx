export type Nivel = 'rojo' | 'amarillo' | 'gris' | 'verde'

export const NIVELES: Nivel[] = ['rojo', 'amarillo', 'gris', 'verde']
export const ETIQUETA: Record<Nivel, string> = { rojo: 'Rojo', amarillo: 'Amarillo', gris: 'Gris', verde: 'Verde' }
export const SIGNIFICADO: Record<Nivel, string> = {
  rojo: 'Buscar primero',
  amarillo: 'Dar seguimiento',
  gris: 'Sin mediciones',
  verde: 'En control y al día',
}

/** Forma distinta por nivel: el semáforo nunca depende solo del color. */
function Forma({ nivel }: { nivel: Nivel }) {
  const comun = { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true as const, focusable: 'false' as const }
  if (nivel === 'rojo')
    return (
      <svg {...comun}>
        <path d="M8 1.5 14.5 8 8 14.5 1.5 8z" fill="currentColor" />
        <path d="M8 5v3.6M8 10.8v.1" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  if (nivel === 'amarillo')
    return (
      <svg {...comun}>
        <path d="M8 1.8 15 14H1z" fill="currentColor" />
        <path d="M8 6.2v3.4M8 11.6v.1" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  if (nivel === 'gris')
    return (
      <svg {...comun}>
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2.6 2" />
      </svg>
    )
  return (
    <svg {...comun}>
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="m4.8 8.2 2.1 2.1 4.3-4.4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function InsigniaSemaforo({ nivel, grande = false }: { nivel: Nivel; grande?: boolean }) {
  return (
    <span className={`semaforo semaforo--${nivel}${grande ? ' semaforo--grande' : ''}`}>
      <Forma nivel={nivel} />
      {ETIQUETA[nivel]}
    </span>
  )
}
