import type { ReactNode } from 'react'
import { navegar } from '../lib/router'

/** Enlace interno de la SPA (navega sin recargar, conserva clic con Ctrl/Cmd para nueva pestaña). */
export function Enlace({ a, children, className }: { a: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={a}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navegar(a)
      }}
    >
      {children}
    </a>
  )
}
