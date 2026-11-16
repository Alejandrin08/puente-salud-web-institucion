import { lazy, Suspense, useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CAPAS, clasificador, leyenda, type Capa } from '../features/zonas/capas'
import { Exportar } from '../features/indicadores/Exportar'
import { pct } from '../features/indicadores/formato'
import { api } from '../shared/api/client'
import type { AgebFeature, IndicadorAgeb, IndicadoresAgeb, Mortalidad, UnidadMapa } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { ESCALA_MAPA, token } from '../shared/lib/tokens'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Figura } from '../shared/ui/Figura'

const MapaAgeb = lazy(() => import('../features/zonas/MapaAgeb').then((m) => ({ default: m.MapaAgeb })))

type Resumen = { poblacion: number; poblacion_18ymas: number; sin_afiliacion_18_est: number; con_discapacidad: number; unidades_publicas: number; rezago: Record<string, number> }

function FilaZona({ a, onVer, activa }: { a: IndicadorAgeb; onVer: () => void; activa: boolean }) {
  return (
    <tr aria-current={activa ? 'true' : undefined} className={activa ? 'fila-activa' : ''}>
      <td>
        <button type="button" className="boton-enlace tabular" onClick={onVer}>
          AGEB {a.cvegeo.slice(-4)}
        </button>
      </td>
      <td className="tabular">{a.prioridad?.toFixed(0)}</td>
      <td className="tabular">{pct(a.control_pct)}</td>
      <td>{a.factores.join(', ') || '—'}</td>
    </tr>
  )
}

/** Pantalla A2: mapa por AGEB (resultados y contexto) y mortalidad municipal. */
export function Zonas() {
  const { estado, reintentar } = useApi(() =>
    Promise.all([
      api<{ features: AgebFeature[] }>('/api/v1/geo/ageb'),
      api<IndicadoresAgeb>('/api/v1/indicadores/ageb'),
      api<UnidadMapa[]>('/api/v1/unidades?tipo=todas'),
      api<Mortalidad>('/api/v1/contexto/mortalidad'),
      api<Resumen>('/api/v1/geo/resumen'),
    ]),
  )
  const [capa, setCapa] = useState<Capa>('control')
  const [verUnidades, setVerUnidades] = useState(true)
  const [sel, setSel] = useState<string | null>(null)
  const [todas, setTodas] = useState(false)

  const listo = estado.tipo === 'listo' ? estado.datos : null
  const clasificar = useMemo(() => (listo ? clasificador(capa, listo[0].features, listo[1].agebs) : () => ({ clase: null, etiqueta: '' })), [listo, capa])

  if (estado.tipo === 'cargando') return <Cargando texto="Cargando las 234 AGEB…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const [geo, ind, unidades, mort, res] = estado.datos
  const infoCapa = CAPAS.find((c) => c.id === capa)!
  const escala = ESCALA_MAPA()
  const etiquetas = leyenda(capa)
  const zonaSel = sel ? ind.agebs.find((a) => a.cvegeo === sel) : null
  const propSel = sel ? geo.features.find((f) => f.id === sel)?.properties : null
  const ejes = { fill: token('color-text-muted'), fontSize: 12 }
  const anios = mort.series[0].serie.map((p, i) => ({
    anio: String(p.anio),
    diabetes: p.defunciones,
    hipertension: mort.series[1].serie[i]?.defunciones,
  }))
  const dm = mort.series[0]
  const ht = mort.series[1]
  const ultimoDm = dm.serie[dm.serie.length - 1]
  const ultimoHt = ht.serie[ht.serie.length - 1]
  const TEND = { sube: 'sube', baja: 'baja', estable: 'se mantiene' }

  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Resultados por zona y contexto</h1>
          <p className="texto-apoyo">234 AGEB urbanas · {res.poblacion.toLocaleString('es-MX')} habitantes en ellas (municipio: 687,127; Censo 2020)</p>
        </div>
        <div className="encabezado__acciones">
          <Exportar por="ageb" />
        </div>
      </header>

      <div className="rejilla-zonas">
        <Figura
          titulo="Mapa por AGEB"
          resumen={`Capa: ${infoCapa.nombre}. Fuente: ${infoCapa.fuente}. Selecciona una AGEB en el mapa o en el ranking.`}
          tabla={
            <table className="tabla tabla--compacta">
              <caption className="solo-lector">Todas las AGEB</caption>
              <thead>
                <tr>
                  <th scope="col">AGEB</th>
                  <th scope="col">Rezago</th>
                  <th scope="col">Sin afiliación</th>
                  <th scope="col">Confirmadas</th>
                  <th scope="col">En control</th>
                </tr>
              </thead>
              <tbody>
                {ind.agebs.map((a) => (
                  <tr key={a.cvegeo}>
                    <th scope="row" className="tabular">
                      {a.cvegeo}
                    </th>
                    <td>{a.rezago}</td>
                    <td className="tabular">{a.pct_sinder == null ? 'sin dato' : `${a.pct_sinder}%`}</td>
                    <td className="tabular">{a.confirmadas}</td>
                    <td className="tabular">{a.suficiente ? pct(a.control_pct) : 'pocos casos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div className="controles-mapa">
            <fieldset className="capas">
              <legend className="solo-lector">Capa del mapa</legend>
              {CAPAS.map((c) => (
                <label key={c.id} className={`capa${capa === c.id ? ' capa--activa' : ''}`}>
                  <input type="radio" name="capa" value={c.id} checked={capa === c.id} onChange={() => setCapa(c.id)} />
                  {c.nombre}
                </label>
              ))}
            </fieldset>
            <label className="interruptor">
              <input type="checkbox" checked={verUnidades} onChange={(e) => setVerUnidades(e.target.checked)} />
              Unidades de salud
            </label>
          </div>
          <Suspense fallback={<Cargando texto="Cargando el mapa…" />}>
            <MapaAgeb
              agebs={geo.features}
              clasificar={clasificar}
              unidades={verUnidades ? unidades : []}
              seleccion={sel}
              onSeleccionar={setSel}
              etiqueta={`Mapa de AGEB de Tlaquepaque coloreado por ${infoCapa.nombre}`}
            />
          </Suspense>
          <div className="leyenda" aria-label={`Leyenda: ${infoCapa.nombre}`}>
            {etiquetas.map((e, i) => (
              <span key={e} className="leyenda__item">
                <i style={{ background: escala[i] }} aria-hidden="true" />
                {e}
              </span>
            ))}
            <span className="leyenda__item">
              <i className="leyenda__sin" aria-hidden="true" />
              {capa === 'control' ? `pocos casos (menos de ${ind.minimo_casos})` : 'sin dato'}
            </span>
            {verUnidades && (
              <span className="leyenda__item">
                <i className="leyenda__unidad" aria-hidden="true" />
                unidad de salud (ubicación simulada)
              </span>
            )}
          </div>
          {infoCapa.simulada && <Simulado texto="% en control calculado con datos simulados" />}
        </Figura>

        <aside className="columna columna--lateral">
          <section className="panel" aria-labelledby="t-zona" aria-live="polite">
            <h2 className="titulo-s" id="t-zona">
              {zonaSel ? `AGEB ${zonaSel.cvegeo.slice(-4)}` : 'Zona seleccionada'}
            </h2>
            {zonaSel && propSel ? (
              <dl className="datos">
                <dt>Población de 18 años y más</dt>
                <dd className="tabular">{propSel.p_18ymas?.toLocaleString('es-MX') ?? 'dato reservado'}</dd>
                <dt>Sin afiliación (18+, estimado)</dt>
                <dd className="tabular">
                  {propSel.psinder_18_est?.toLocaleString('es-MX') ?? '—'} ({propSel.pct_sinder ?? '—'}%)
                </dd>
                <dt>Rezago social</dt>
                <dd>{propSel.rezago}</dd>
                <dt>Detectadas · confirmadas</dt>
                <dd className="tabular">
                  {zonaSel.detectadas} · {zonaSel.confirmadas}
                </dd>
                <dt>En control (simulado)</dt>
                <dd className="tabular">{zonaSel.suficiente ? pct(zonaSel.control_pct) : 'pocos casos para calcularlo'}</dd>
              </dl>
            ) : (
              <p className="texto-apoyo">Elige una AGEB en el mapa o en el ranking para ver su detalle.</p>
            )}
          </section>
          <section className="panel" aria-labelledby="t-ranking">
            <h2 className="titulo-s" id="t-ranking">
              Zonas prioritarias
            </h2>
            <p className="texto-apoyo">Prioridad (0 a 100): 50% brecha de control, 30% rezago social y 20% sin afiliación.</p>
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Zona</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Control</th>
                  <th scope="col">Por qué</th>
                </tr>
              </thead>
              <tbody>
                {ind.zonas_prioritarias.slice(0, todas ? 10 : 5).map((a) => (
                  <FilaZona key={a.cvegeo} a={a} activa={a.cvegeo === sel} onVer={() => setSel(a.cvegeo)} />
                ))}
              </tbody>
            </table>
            <button type="button" className="boton boton--texto" aria-expanded={todas} onClick={() => setTodas((v) => !v)}>
              {todas ? 'Ver solo las 5 primeras' : `Ver las ${ind.zonas_prioritarias.length}`}
            </button>
          </section>
        </aside>
      </div>

      <section className="contexto" aria-labelledby="t-contexto">
        <h2 className="titulo-m" id="t-contexto">
          Contexto: mortalidad municipal
        </h2>
        <p className="texto-apoyo">{mort.nota}</p>
        <div className="rejilla-dos">
          <section className="panel" aria-labelledby="t-cifras">
            <h3 className="titulo-s" id="t-cifras">
              Cifras de {ultimoDm.anio}
            </h3>
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Indicador</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Muertes por diabetes</th>
                  <td className="indicador__valor tabular">{ultimoDm.defunciones}</td>
                  <td className="tabular">
                    {ultimoDm.tasa_100k} por 100 mil · {TEND[dm.tendencia]} desde {dm.serie[0].anio} ({dm.variacion_pct! > 0 ? '+' : ''}
                    {dm.variacion_pct}%)
                  </td>
                </tr>
                <tr>
                  <th scope="row">Muertes por enfermedades hipertensivas</th>
                  <td className="indicador__valor tabular">{ultimoHt.defunciones}</td>
                  <td className="tabular">
                    {ultimoHt.tasa_100k} por 100 mil · {TEND[ht.tendencia]} desde {ht.serie[0].anio} ({ht.variacion_pct! > 0 ? '+' : ''}
                    {ht.variacion_pct}%)
                  </td>
                </tr>
                <tr>
                  <th scope="row">Adultos sin afiliación (estimado)</th>
                  <td className="indicador__valor tabular">{res.sin_afiliacion_18_est.toLocaleString('es-MX')}</td>
                  <td className="tabular">
                    de {res.poblacion_18ymas.toLocaleString('es-MX')} adultos · {res.unidades_publicas} unidades públicas en operación
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <Figura
            titulo="Tendencia de la mortalidad"
            resumen={`Diabetes: ${dm.serie.map((p) => p.defunciones).join(', ')}. Hipertensivas: ${ht.serie.map((p) => p.defunciones).join(', ')} (${dm.serie[0].anio}–${ultimoDm.anio}).`}
            tabla={
              <table className="tabla tabla--compacta">
                <thead>
                  <tr>
                    <th scope="col">Año</th>
                    <th scope="col">Diabetes</th>
                    <th scope="col">Hipertensivas</th>
                  </tr>
                </thead>
                <tbody>
                  {anios.map((a) => (
                    <tr key={a.anio}>
                      <th scope="row">{a.anio}</th>
                      <td className="tabular">{a.diabetes}</td>
                      <td className="tabular">{a.hipertension}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <div aria-hidden="true">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={anios} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={token('chart-grid')} vertical={false} />
                  <XAxis dataKey="anio" tick={ejes} tickLine={false} axisLine={{ stroke: token('chart-grid') }} />
                  <YAxis domain={[0, 'auto']} tick={ejes} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="diabetes" name="Diabetes" stroke={token('chart-1')} strokeWidth={2.5} isAnimationActive={false} />
                  <Line dataKey="hipertension" name="Hipertensivas" stroke={token('chart-3')} strokeWidth={2.5} strokeDasharray="6 3" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Figura>
        </div>
        <p className="nota-metodo">Fuente: {mort.fuente}. Unidades: Catálogo CLUES 2024 (DGIS).</p>
      </section>
    </>
  )
}
