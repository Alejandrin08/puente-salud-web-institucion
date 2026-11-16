import { useState } from 'react'
import { api } from '../shared/api/client'
import type { PacienteFila } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Vacio } from '../shared/ui/Estados'
import { InsigniaSemaforo } from '../shared/ui/Semaforo'

/** Entrada a «Registrar medición»: elegir a la persona por nombre o folio. */
export function BuscarFolio() {
  const [q, setQ] = useState('')
  const { estado, reintentar } = useApi(
    () => (q.trim().length >= 2 ? api<PacienteFila[]>(`/api/v1/seguimiento/pacientes?q=${encodeURIComponent(q.trim())}`) : Promise.resolve(null)),
    [q],
  )
  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Registrar medición</h1>
          <p className="texto-apoyo">Busca a la persona por su nombre o su folio.</p>
        </div>
      </header>
      <section className="panel panel--angosto">
        <div className="campo">
          <label htmlFor="buscar-folio">Nombre o folio</label>
          <input id="buscar-folio" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ejemplo: PS081368 o Juana" autoFocus />
        </div>
        {estado.tipo === 'cargando' && <Cargando />}
        {estado.tipo === 'error' && <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />}
        {estado.tipo === 'listo' && estado.datos && (estado.datos.length ? (
          <ul className="resultados">
            {estado.datos.slice(0, 12).map((p) => (
              <li key={p.folio}>
                <Enlace a={`/pacientes/${p.folio}/medicion`} className="enlace-fuerte">
                  {p.nombre}
                </Enlace>
                <span className="sub tabular">{p.folio}</span>
                <InsigniaSemaforo nivel={p.nivel} />
              </li>
            ))}
          </ul>
        ) : (
          <Vacio>No encontramos a nadie con «{q}» en tu unidad.</Vacio>
        ))}
      </section>
    </>
  )
}
