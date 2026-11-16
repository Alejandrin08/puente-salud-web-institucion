import { useSyncExternalStore } from 'react'

/** Router mínimo sobre la History API (sin dependencias). */
const suscriptores = new Set<() => void>()

function avisar() {
  suscriptores.forEach((f) => f())
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', avisar)
}

export function navegar(ruta: string, opciones: { reemplazar?: boolean } = {}) {
  if (ruta === window.location.pathname) return
  if (opciones.reemplazar) window.history.replaceState(null, '', ruta)
  else window.history.pushState(null, '', ruta)
  window.scrollTo({ top: 0 })
  avisar()
}

export function useRuta(): string {
  return useSyncExternalStore(
    (f) => {
      suscriptores.add(f)
      return () => suscriptores.delete(f)
    },
    () => window.location.pathname,
    () => '/',
  )
}
