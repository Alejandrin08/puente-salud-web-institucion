import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './client'

export type Estado<T> =
  | { tipo: 'cargando' }
  | { tipo: 'error'; error: ApiError }
  | { tipo: 'listo'; datos: T }

/** Carga datos y expone estados de carga, error y reintento. */
export function useApi<T>(cargar: () => Promise<T>, deps: unknown[] = []) {
  const [estado, setEstado] = useState<Estado<T>>({ tipo: 'cargando' })
  const [vuelta, setVuelta] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = useCallback(cargar, deps)
  useEffect(() => {
    let vivo = true
    setEstado({ tipo: 'cargando' })
    fn()
      .then((datos) => vivo && setEstado({ tipo: 'listo', datos }))
      .catch((e: unknown) =>
        vivo && setEstado({ tipo: 'error', error: e instanceof ApiError ? e : new ApiError(0, 'Algo salió mal.') }),
      )
    return () => {
      vivo = false
    }
  }, [fn, vuelta])
  return { estado, reintentar: () => setVuelta((v) => v + 1) }
}
