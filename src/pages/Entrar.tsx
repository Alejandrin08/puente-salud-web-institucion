import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../shared/api/client'
import { guardarSesion, type Sesion } from '../shared/api/sesion'

const DEMO = [
  { usuario: 'enfermeria.tateposco', password: 'demo-salud', rol: 'Personal de salud', unidad: 'C. S. San José Tateposco' },
  { usuario: 'medicina.lasjuntas', password: 'demo-salud', rol: 'Personal de salud', unidad: 'C. S. Las Juntas' },
  { usuario: 'autoridad.rxii', password: 'demo-autoridad', rol: 'Autoridad', unidad: 'Región Sanitaria XII' },
]

export function Entrar({ onEntrar }: { onEntrar: (s: Sesion) => void }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const s = await api<Sesion>('/api/v1/auth/login', { method: 'POST', json: { usuario: usuario.trim(), password } })
      guardarSesion(s)
      onEntrar(s)
    } catch (err) {
      setError(err instanceof ApiError && err.estado === 401 ? 'Usuario o contraseña incorrectos.' : (err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="entrar" id="contenido">
      <section className="entrar__marca" aria-hidden="true">
        <img src="/logo.svg" alt="" width={64} height={64} />
        <svg className="entrar__arco" viewBox="0 0 400 250" focusable="false">
          <path d="M40 200 A160 160 0 0 1 360 200" className="entrar__arco-base" />
          <path d="M40 200 A160 160 0 0 1 200 40" className="entrar__arco-hecho" />
          <circle cx="40" cy="200" r="14" className="entrar__punto-inicio" />
          <circle cx="360" cy="200" r="16" className="entrar__punto-meta" />
          <text x="40" y="244" textAnchor="middle">detección</text>
          <text x="360" y="244" textAnchor="middle">control</text>
        </svg>
        <p className="entrar__frase">De cuántas personas se atendieron a cuántas llegaron al control.</p>
      </section>
      <section className="entrar__panel">
        <h1 className="titulo-l">Puente Salud · Panel institucional</h1>
        <p className="texto-apoyo">Personal de salud y autoridad de la Región Sanitaria XII, Tlaquepaque.</p>
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor="usuario">Usuario</label>
            <input id="usuario" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} aria-invalid={!!error} />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} />
          </div>
          {error && (
            <p className="formulario__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="boton boton--primario" disabled={enviando || !usuario || !password}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <div className="demo">
          <h2 className="titulo-s">Cuentas de demostración</h2>
          <ul>
            {DEMO.map((d) => (
              <li key={d.usuario}>
                <button
                  type="button"
                  className="demo__cuenta"
                  onClick={() => {
                    setUsuario(d.usuario)
                    setPassword(d.password)
                  }}
                >
                  <strong>{d.rol}</strong>
                  <span>
                    {d.unidad} · <code>{d.usuario}</code>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
