import { lazy, Suspense } from 'react'
import { api } from '../shared/api/client'
import type { Ruta } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { distancia, fechaCorta, nombrePropio } from '../shared/lib/formato'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Simulado, Vacio } from '../shared/ui/Estados'
import { InsigniaSemaforo } from '../shared/ui/Semaforo'

const MapaRuta = lazy(() => import('../features/ruta/MapaRuta').then((m) => ({ default: m.MapaRuta })))

function minutos(m: number) {
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`
}

/** Pantalla S4: visitas domiciliarias ordenadas por prioridad, distancia en línea recta y tiempo aproximado. */
export function RutaVisitas() {
  const { estado, reintentar } = useApi(() => api<Ruta>('/api/v1/visitas/ruta'))
  if (estado.tipo === 'cargando') return <Cargando texto="Calculando la ruta…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const r = estado.datos
  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Ruta de visitas</h1>
          <p className="texto-apoyo">
            Sale de {nombrePropio(r.origen.nombre)} · {fechaCorta(r.fecha)}
          </p>
        </div>
        <Simulado texto="Domicilios simulados" />
      </header>
      {r.paradas.length === 0 ? (
        <Vacio>No hay visitas pendientes esta semana.</Vacio>
      ) : (
        <div className="rejilla-ruta">
          <section className="panel panel--mapa" aria-label="Mapa de la ruta">
            <Suspense fallback={<Cargando texto="Cargando el mapa…" />}>
              <MapaRuta ruta={r} />
            </Suspense>
            <p className="texto-apoyo">{r.nota}</p>
          </section>
          <section className="panel" aria-labelledby="t-visitas">
            <h2 className="titulo-s" id="t-visitas">
              {r.paradas.length} visitas
            </h2>
            <p className="totales">
              <span>
                <strong className="tabular">{distancia(r.distancia_km)}</strong> en línea recta
              </span>
              <span>
                <strong className="tabular">{minutos(r.minutos_total)}</strong> aprox. con visitas
              </span>
            </p>
            <ol className="paradas">
              {r.paradas.map((p) => (
                <li key={p.folio}>
                  <span className={`parada parada--${p.nivel} parada--lista`} aria-hidden="true">
                    {p.orden}
                  </span>
                  <div>
                    <Enlace a={`/pacientes/${p.folio}`} className="enlace-fuerte">
                      {p.nombre}
                    </Enlace>
                    <span className="sub">{p.resumen.replace(/^\w+: /, '').replace(/^./, (c) => c.toUpperCase())}</span>
                    <span className="sub tabular">
                      {distancia(p.distancia_km)} · {minutos(p.minutos_traslado)} de traslado{p.visita_programada ? ' · visita programada' : ''}
                    </span>
                  </div>
                  <InsigniaSemaforo nivel={p.nivel} />
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </>
  )
}
