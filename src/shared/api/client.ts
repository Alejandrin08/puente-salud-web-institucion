import { borrarSesion, sesionActual } from './sesion'

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public estado: number,
    mensaje: string,
  ) {
    super(mensaje)
  }
}

async function mensajeDe(r: Response): Promise<string> {
  try {
    const d = await r.json()
    if (typeof d.detail === 'string') return d.detail
    if (Array.isArray(d.detail)) return d.detail.map((x: { msg: string }) => x.msg.replace(/^Value error, /, '')).join('. ')
  } catch {
    /* respuesta sin JSON */
  }
  return 'Algo salió mal. Intenta de nuevo.'
}

export async function api<T>(ruta: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const s = sesionActual()
  if (s) headers.Authorization = `Bearer ${s.token}`
  if (init.json !== undefined) headers['Content-Type'] = 'application/json'
  let r: Response
  try {
    r = await fetch(`${API_URL}${ruta}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    })
  } catch {
    throw new ApiError(0, 'No hay conexión con el servicio. Revisa tu internet e intenta de nuevo.')
  }
  if (!r.ok) {
    if (r.status === 401 && s) borrarSesion()
    throw new ApiError(r.status, await mensajeDe(r))
  }
  return (await r.json()) as T
}

/** Descarga autenticada (el token va en la cabecera, no en la URL). */
export async function descargar(ruta: string, nombre: string): Promise<void> {
  const s = sesionActual()
  const r = await fetch(`${API_URL}${ruta}`, { headers: s ? { Authorization: `Bearer ${s.token}` } : {} })
  if (!r.ok) throw new ApiError(r.status, await mensajeDe(r))
  const url = URL.createObjectURL(await r.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
