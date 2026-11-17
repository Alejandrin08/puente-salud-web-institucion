import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { mes, pct } from '../features/indicadores/formato'
import { api, descargar } from '../shared/api/client'
import type { Medicamentos as Datos, ReferenciaSurtido } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta, nombrePropio } from '../shared/lib/formato'
import { token } from '../shared/lib/tokens'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Figura } from '../shared/ui/Figura'
import { Icono } from '../shared/ui/Icono'
import { InsigniaSemaforo } from '../shared/ui/Semaforo'

const ENF: Record<string, string> = { diabetes: 'Diabetes', hipertension: 'Hipertensión' }
const miles = (n: number) => n.toLocaleString('es-MX')

/** Pantalla A4 (informativa): surtido de medicamentos, demanda según el semáforo y dónde reforzar el abasto. */
export function Medicamentos() {
  const { estado, reintentar } = useApi(() => api<Datos>('/api/v1/medicamentos'))
  const ref = useApi(() => api<ReferenciaSurtido>('/api/v1/contexto/surtido'))
  const [todas, setTodas] = useState(false)
  const [bajando, setBajando] = useState<string | null>(null)
  if (estado.tipo === 'cargando') return <Cargando texto="Calculando el abasto…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const d = estado.datos
  const r = d.resumen
  const urg = r.sin_cobertura_por_nivel.rojo + r.sin_cobertura_por_nivel.amarillo
  const peor = [...d.medicamentos].sort((a, b) => (a.surtido_completo_pct ?? 100) - (b.surtido_completo_pct ?? 100))[0]
  const ejes = { fill: token('color-text-muted'), fontSize: 12 }
  const evo = d.evolucion.map((e) => ({ ...e, m: mes(e.mes) }))
  const primero = evo[0]?.surtido_completo_pct
  const ultimo = evo[evo.length - 1]?.surtido_completo_pct
  const filasRef = ref.estado.tipo === 'listo' ? ref.estado.datos.filas : []
  const refJal = filasRef.find((f) => f.ambito === 'estatal')

  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Medicamentos</h1>
          <p className="texto-apoyo">Surtido y demanda según el semáforo · corte {fechaCorta(d.fecha_corte)} · solo informativo</p>
        </div>
        <div className="encabezado__acciones">
          <Simulado />
          <button
            type="button"
            className="boton boton--chico boton--secundario"
            disabled={bajando === 'bajando'}
            onClick={async () => {
              setBajando('bajando')
              try {
                await descargar('/api/v1/medicamentos/export', 'puente-salud-medicamentos.csv')
                setBajando(null)
              } catch (e) {
                setBajando((e as Error).message)
              }
            }}
          >
            <Icono nombre="descargar" tam={18} />
            {bajando === 'bajando' ? 'Preparando…' : 'Exportar CSV'}
          </button>
          {bajando && bajando !== 'bajando' && (
            <span className="formulario__error" role="alert">
              {bajando}
            </span>
          )}
        </div>
      </header>

      <section className="titular" aria-label="Resultado principal">
        <p className="titular__frase">
          De <strong className="tabular">{miles(r.personas_tratamiento)}</strong> personas en tratamiento,{' '}
          <strong className="titular__cifra tabular">{miles(r.personas_sin_cobertura)}</strong> no tienen su medicamento cubierto hoy;{' '}
          <strong className="tabular">{miles(urg)}</strong> de ellas están en rojo o amarillo.
        </p>
      </section>

      <table className="tabla tabla--indicadores">
        <caption className="solo-lector">Medicamentos: surtido, cobertura y necesidad mensual</caption>
        <thead>
          <tr>
            <th scope="col">Medicamento</th>
            <th scope="col">Surtido completo</th>
            <th scope="col">Sin cobertura hoy</th>
            <th scope="col">Necesidad mensual</th>
            <th scope="col">Faltante mensual</th>
          </tr>
        </thead>
        <tbody>
          {d.medicamentos.map((m) => (
            <tr key={m.medicamento}>
              <th scope="row">
                {m.medicamento}
                <span className="sub">
                  {ENF[m.enfermedad]} · {miles(m.personas_tratamiento)} en tratamiento
                </span>
              </th>
              <td className="indicador__valor tabular">{pct(m.surtido_completo_pct)}</td>
              <td className="tabular">
                <strong>{miles(m.sin_cobertura)}</strong>
                <span className="sin-cobertura">
                  <InsigniaSemaforo nivel="rojo" /> {m.sin_cobertura_rojo}
                  <InsigniaSemaforo nivel="amarillo" /> {m.sin_cobertura_amarillo}
                </span>
              </td>
              <td className="tabular">{miles(m.necesidad_mensual_tabletas)} tabletas</td>
              <td className="tabular">{miles(m.faltante_mensual_tabletas)} tabletas</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rejilla-dos">
        <section className="panel" aria-labelledby="t-reforzar">
          <h2 className="titulo-s" id="t-reforzar">
            Dónde reforzar el abasto
          </h2>
          <p className="texto-apoyo">Unidades ordenadas por personas sin medicamento cubierto, con más peso a quienes están en rojo. Es una sugerencia para planear, no una orden de envío.</p>
          <table className="tabla tabla--compacta">
            <thead>
              <tr>
                <th scope="col">Unidad</th>
                <th scope="col">Sin cobertura</th>
                <th scope="col">Surtido</th>
                <th scope="col">Qué falta más</th>
              </tr>
            </thead>
            <tbody>
              {d.unidades.slice(0, todas ? d.unidades.length : 6).map((u) => (
                <tr key={u.clues}>
                  <th scope="row">
                    {nombrePropio(u.nombre)}
                    <span className="sub tabular">
                      {u.clues} · prioridad {u.prioridad}
                    </span>
                  </th>
                  <td className="tabular">
                    {u.sin_cobertura} de {u.personas_tratamiento}
                    <span className="sub">
                      {u.sin_cobertura_rojo} en rojo · {u.sin_cobertura_amarillo} en amarillo
                    </span>
                  </td>
                  <td className="tabular">{pct(u.surtido_completo_pct)}</td>
                  <td>{u.medicamentos_faltantes.map((x) => `${x.medicamento.split(' ')[0]} (${x.personas})`).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.unidades.length > 6 && (
            <button type="button" className="boton boton--texto" aria-expanded={todas} onClick={() => setTodas((v) => !v)}>
              {todas ? 'Ver solo las 6 primeras' : `Ver las ${d.unidades.length} unidades`}
            </button>
          )}
        </section>

        <Figura
          titulo="Recetas surtidas completas por mes"
          resumen={`Pasó de ${pct(primero)} a ${pct(ultimo)} en 12 meses. El medicamento con menor surtido completo es ${peor?.medicamento} (${pct(peor?.surtido_completo_pct)}).`}
          tabla={
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Mes</th>
                  <th scope="col">Surtido completo</th>
                  <th scope="col">Recetas</th>
                </tr>
              </thead>
              <tbody>
                {evo.map((e) => (
                  <tr key={e.mes}>
                    <th scope="row">{e.m}</th>
                    <td className="tabular">{pct(e.surtido_completo_pct)}</td>
                    <td className="tabular">{e.recetas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evo} margin={{ top: 8, right: 36, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={token('chart-grid')} vertical={false} />
                <XAxis dataKey="m" tick={ejes} interval={1} tickLine={false} axisLine={{ stroke: token('chart-grid') }} />
                <YAxis domain={[50, 100]} tick={ejes} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                {refJal && (
                  <ReferenceLine y={refJal.completas_pct} stroke={token('chart-meta')} strokeDasharray="5 4" label={{ value: `ISSSTE Jal. ${refJal.completas_pct}%`, position: 'insideBottomRight', fill: token('color-text-muted'), fontSize: 11 }} />
                )}
                <Line dataKey="surtido_completo_pct" name="Surtido completo" stroke={token('chart-1')} strokeWidth={3} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Figura>
      </div>

      <section className="panel" aria-labelledby="t-referencia">
        <h2 className="titulo-s" id="t-referencia">
          Referencia real: recetas surtidas del ISSSTE
        </h2>
        {ref.estado.tipo === 'cargando' && <Cargando />}
        {ref.estado.tipo === 'error' && <ErrorEstado mensaje={ref.estado.error.message} onReintentar={ref.reintentar} />}
        {ref.estado.tipo === 'listo' && (
          <>
            <p className="texto-apoyo">
              {ref.estado.datos.nota} Periodo: {filasRef[0]?.periodo}.
            </p>
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Ámbito</th>
                  <th scope="col">Recetas</th>
                  <th scope="col">Completas</th>
                  <th scope="col">Parciales</th>
                  <th scope="col">Negadas</th>
                </tr>
              </thead>
              <tbody>
                <tr className="fila-simulada">
                  <th scope="row">
                    Unidades de Tlaquepaque en este tablero
                    <span className="sub">simulado · últimos 12 meses</span>
                  </th>
                  <td className="tabular">{miles(r.recetas_12m)}</td>
                  <td className="tabular">{pct(r.surtido_completo_pct)}</td>
                  <td colSpan={2}>incompletas: {miles(r.recetas_incompletas_12m)}</td>
                </tr>
                {filasRef.map((f) => (
                  <tr key={f.nombre}>
                    <th scope="row">
                      {f.nombre}
                      <span className="sub">{f.ambito === 'unidad' ? `CLUES ${f.clues}` : `${miles(f.unidades)} unidades`}</span>
                    </th>
                    <td className="tabular">{miles(f.recetas)}</td>
                    <td className="tabular">{f.completas_pct}%</td>
                    <td className="tabular">{f.parciales_pct}%</td>
                    <td className="tabular">{f.negadas_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="nota-metodo">Fuente: {ref.estado.datos.fuente}.</p>
          </>
        )}
      </section>

      <details className="definicion definicion--bloque">
        <summary>Cómo se calcula</summary>
        <ul>
          {Object.values(d.definiciones).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>
          La línea punteada del gráfico es el surtido completo real del ISSSTE en Jalisco (dato abierto). Los surtidos de las unidades de Tlaquepaque en este tablero son simulados; la Secretaría de Salud Jalisco declaró 85% en primer nivel y mediciones independientes reportan cifras menores.
        </p>
      </details>
    </>
  )
}
