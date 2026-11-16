export type Rol = 'personal_salud' | 'autoridad'

export type Sesion = {
  token: string
  expira: number
  usuario: string
  rol: Rol
  nombre: string
  clues: string | null
}

const CLAVE = 'puente-salud-institucion:sesion'
let memoria: Sesion | null = null

export function sesionActual(): Sesion | null {
  try {
    const raw = window.sessionStorage.getItem(CLAVE)
    const s = raw ? (JSON.parse(raw) as Sesion) : memoria
    if (s && s.expira * 1000 < Date.now()) {
      borrarSesion()
      return null
    }
    return s
  } catch {
    return memoria
  }
}

export function guardarSesion(s: Sesion) {
  memoria = s
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(s))
  } catch {
    /* solo en memoria */
  }
}

export function borrarSesion() {
  memoria = null
  try {
    window.sessionStorage.removeItem(CLAVE)
  } catch {
    /* sin almacenamiento */
  }
}
