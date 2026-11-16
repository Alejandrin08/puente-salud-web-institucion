import { useState } from 'react'
import { api } from '../shared/api/client'
import type { PacienteFila, Resumen } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta, hora, nombrePropio } from '../shared/lib/formato'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Simulado, Vacio } from '../shared/ui/Estados'
import { InsigniaSemaforo, NIVELES, SIGNIFICADO, type Nivel } from '../shared/ui/Semaforo'

const TIPO: Record<string, string> = { confirmacion: 'Confirmación', control: 'Control', visita: 'Visita a domicilio' }
const ENF: Record<string, string> = { diabetes: 'Diabetes', hipertension: 'Hipertensión' }

function TablaPacientes({ filas, titulo }: { filas: PacienteFila[]; titulo: string }) {
  if (!filas.length) return <Vacio>No hay personas con este nivel.</Vacio>
  return (
    <div className="tabla-envoltura">
      <table className="tabla">
        <caption className="solo-lector">{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            <th scope="col">Persona</th>
            <th scope="col">Por qué</th>
            <th scope="col">Próxima cita</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((p) => (
            <tr key={p.folio}>
              <td>
                <InsigniaSemaforo nivel={p.nivel} />
              </td>
              <td>
                <Enlace a={`/pacientes/${p.folio}`} className="enlace-fuerte">
                  {p.nombre}
                </Enlace>
                <span className="sub tabular">
                  {p.folio} · {p.edad} años · {p.enfermedades.map((e) => ENF[e]).join(" e ")}
                </span>
              </td>
              <td className="celda-motivo">{p.resumen.replace(/^\w+: /, '').replace(/^./, (c) => c.toUpperCase())}</td>
              <td className="tabular">{p.proxima_cita ? `${fechaCorta(p.proxima_cita.fecha)} ${hora(p.proxima_cita.hora)}` : <span className="sub">Sin cita programada</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Pantalla S1: conteo por nivel, prioridades de la semana con motivo y agenda del día. */
export function Seguimiento() {
  const { estado, reintentar } = useApi(() => api<Resumen>('/api/v1/seguimiento/resumen'))
  const [filtro, setFiltro] = useState<Nivel | null>(null)
  const [q, setQ] = useState('')
  const lista = useApi(
    () =>
      filtro || q.trim().length >= 2
        ? api<PacienteFila[]>(`/api/v1/seguimiento/pacientes?${new URLSearchParams({ ...(filtro ? { nivel: filtro } : {}), ...(q.trim() ? { q: q.trim() } : {}) })}`)
        : Promise.resolve(null),
    [filtro, q],
  )

  if (estado.tipo === 'cargando') return <Cargando texto="Ordenando a tus pacientes…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const d = estado.datos

  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Seguimiento de pacientes</h1>
          <p className="texto-apoyo">
            {nombrePropio(d.unidad.nombre)} · {d.total} personas a cargo · corte {fechaCorta(d.fecha)}
          </p>
        </div>
        <Simulado />
      </header>

      <div className="conteos" role="group" aria-label="Filtrar por nivel del semáforo">
        {NIVELES.map((n) => (
          <button
            key={n}
            type="button"
            className={`conteo conteo--${n}`}
            aria-pressed={filtro === n}
            onClick={() => setFiltro((f) => (f === n ? null : n))}
          >
            <InsigniaSemaforo nivel={n} />
            <span className="conteo__num tabular">{d.conteo[n]}</span>
            <span className="conteo__txt">{SIGNIFICADO[n]}</span>
          </button>
        ))}
      </div>

      <div className="rejilla-seguimiento">
        <section className="panel" aria-labelledby="t-prioridades">
          <div className="panel__cabeza">
            <h2 className="titulo-s" id="t-prioridades">
              {filtro ? `Personas en ${filtro}` : q.trim().length >= 2 ? 'Resultados de la búsqueda' : 'Prioridades de la semana'}
            </h2>
            <label className="buscar">
              <span className="solo-lector">Buscar por nombre o folio</span>
              <input type="search" placeholder="Buscar nombre o folio" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>
          {!filtro && q.trim().length < 2 ? (
            <>
              <p className="texto-apoyo">El semáforo ordena y explica; tú decides a quién contactar.</p>
              <TablaPacientes filas={d.prioridades} titulo="Prioridades de la semana" />
            </>
          ) : lista.estado.tipo === 'cargando' ? (
            <Cargando />
          ) : lista.estado.tipo === 'error' ? (
            <ErrorEstado mensaje={lista.estado.error.message} onReintentar={lista.reintentar} />
          ) : (
            <TablaPacientes filas={lista.estado.datos ?? []} titulo="Personas filtradas" />
          )}
        </section>

        <section className="panel panel--agenda" aria-labelledby="t-agenda">
          <h2 className="titulo-s" id="t-agenda">
            Agenda de hoy
          </h2>
          {d.agenda.length ? (
            <ol className="agenda">
              {d.agenda.map((a) => (
                <li key={`${a.folio}-${a.tipo}`}>
                  <span className="agenda__hora tabular">{a.hora ? hora(a.hora) : 'Sin hora'}</span>
                  <div>
                    <Enlace a={`/pacientes/${a.folio}`} className="enlace-fuerte">
                      {a.nombre}
                    </Enlace>
                    <span className="sub">{TIPO[a.tipo] ?? a.tipo}</span>
                  </div>
                  <InsigniaSemaforo nivel={a.nivel} />
                </li>
              ))}
            </ol>
          ) : (
            <Vacio>No hay citas programadas para hoy.</Vacio>
          )}
        </section>
      </div>
    </>
  )
}
