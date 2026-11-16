import { useState, type FormEvent } from 'react'
import { hayError, vistaPrevia, type Valores } from '../features/paciente/vistaPrevia'
import { api } from '../shared/api/client'
import type { PacienteDetalle, Semaforo } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta } from '../shared/lib/formato'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Simulado, Vacio } from '../shared/ui/Estados'
import { InsigniaSemaforo } from '../shared/ui/Semaforo'

type Resultado = { medicion_id: number; semaforo_anterior: Semaforo['nivel']; semaforo: Semaforo }

function num(v: string): number | undefined {
  const n = Number(v.replace(',', '.'))
  return v.trim() === '' || Number.isNaN(n) ? undefined : n
}

/** Pantalla S3: captura de valores con vista previa y mediciones registradas desde otros programas. */
export function RegistrarMedicion({ folio }: { folio: string }) {
  const { estado, reintentar } = useApi(() => api<PacienteDetalle>(`/api/v1/pacientes/${folio}`), [folio])
  const [f, setF] = useState({ pas: '', pad: '', glucosa: '', hba1c: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  if (estado.tipo === 'cargando') return <Cargando />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const p = estado.datos.persona
  const dm = p.enfermedades.includes('diabetes')
  const hta = p.enfermedades.includes('hipertension')
  const valores: Valores = { pas: num(f.pas), pad: num(f.pad), glucosa: num(f.glucosa), hba1c: num(f.hba1c) }
  const avisos = vistaPrevia(valores, p.enfermedades)
  const vacio = Object.values(valores).every((v) => v == null)
  const otros = estado.datos.mediciones.filter((m) => m.otro_programa)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (vacio || hayError(avisos)) return
    setEnviando(true)
    setError(null)
    try {
      setResultado(await api<Resultado>(`/api/v1/pacientes/${folio}/mediciones`, { method: 'POST', json: { ...valores, es_consulta: true } }))
      setF({ pas: '', pad: '', glucosa: '', hba1c: '' })
      reintentar()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (k: keyof typeof f, etiqueta: string, ayuda: string) => (
    <div className="campo">
      <label htmlFor={k}>{etiqueta}</label>
      <input id={k} inputMode="decimal" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-describedby={`${k}-ayuda`} />
      <span className="campo__ayuda" id={`${k}-ayuda`}>
        {ayuda}
      </span>
    </div>
  )

  return (
    <>
      <nav aria-label="Ruta de navegación" className="migas">
        <Enlace a="/seguimiento">Seguimiento</Enlace>
        <span aria-hidden="true">/</span>
        <Enlace a={`/pacientes/${folio}`}>{p.nombre}</Enlace>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Registrar medición</span>
      </nav>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Registrar medición</h1>
          <p className="texto-apoyo">
            {p.nombre} · {p.folio} · nivel actual <InsigniaSemaforo nivel={estado.datos.semaforo.nivel} />
          </p>
        </div>
        <Simulado />
      </header>
      <div className="rejilla-medicion">
        <section className="panel" aria-labelledby="t-captura">
          <h2 className="titulo-s" id="t-captura">
            Valores de hoy
          </h2>
          <form className="formulario" onSubmit={enviar} noValidate>
            <div className="campos-fila">
              {hta && campo('pas', 'Sistólica (mmHg)', 'Ejemplo: 128')}
              {hta && campo('pad', 'Diastólica (mmHg)', 'Ejemplo: 82')}
              {dm && campo('glucosa', 'Glucosa en ayuno (mg/dl)', 'Ejemplo: 110')}
              {dm && campo('hba1c', 'HbA1c (%)', 'Opcional. Al menos una vez al año')}
            </div>
            <div className="vista-previa" aria-live="polite">
              <h3 className="titulo-xs">Vista previa</h3>
              {vacio ? (
                <p className="texto-apoyo">Escribe los valores para ver si están en meta antes de guardar.</p>
              ) : (
                <ul>
                  {avisos.map((a) => (
                    <li key={a.texto} className={`aviso aviso--${a.tono}`}>
                      {a.texto}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error && (
              <p className="formulario__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="boton boton--primario" disabled={enviando || vacio || hayError(avisos)}>
              {enviando ? 'Guardando…' : 'Guardar medición y consulta'}
            </button>
          </form>
          {resultado && (
            <div className="resultado" role="status">
              <p>
                Medición guardada. Semáforo: <InsigniaSemaforo nivel={resultado.semaforo_anterior} /> →{' '}
                <InsigniaSemaforo nivel={resultado.semaforo.nivel} />
              </p>
              <p className="texto-apoyo">{resultado.semaforo.resumen}</p>
              <Enlace a={`/pacientes/${folio}`} className="enlace-fuerte">
                Volver al recorrido
              </Enlace>
            </div>
          )}
        </section>
        <section className="panel" aria-labelledby="t-otros">
          <h2 className="titulo-s" id="t-otros">
            Registradas desde otros programas
          </h2>
          {otros.length ? (
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Programa</th>
                  <th scope="col">Valores</th>
                </tr>
              </thead>
              <tbody>
                {[...otros].reverse().map((m) => (
                  <tr key={m.id ?? m.fecha}>
                    <td className="tabular">{fechaCorta(m.fecha)}</td>
                    <td>{m.programa}</td>
                    <td className="tabular">
                      {[m.pas && `${m.pas}/${m.pad} mmHg`, m.glucosa && `glucosa ${m.glucosa}`, m.hba1c && `HbA1c ${m.hba1c}%`].filter(Boolean).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Vacio>Ningún otro programa ha registrado mediciones de esta persona.</Vacio>
          )}
        </section>
      </div>
    </>
  )
}
