import type { ReactNode } from 'react'
import { Icono } from './Icono'

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="estado" role="status" aria-live="polite">
      <span className="estado__puntos" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p>{texto}</p>
    </div>
  )
}

export function ErrorEstado({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="estado estado--error" role="alert">
      <Icono nombre="info" tam={28} />
      <p>{mensaje}</p>
      {onReintentar && (
        <button type="button" className="boton boton--secundario" onClick={onReintentar}>
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="estado" role="status">
      <p>{children}</p>
    </div>
  )
}

/** Rótulo obligatorio para todo dato simulado. */
export function Simulado({ texto = 'Datos simulados' }: { texto?: string }) {
  return (
    <span className="simulado">
      <Icono nombre="info" tam={16} />
      {texto}
    </span>
  )
}
