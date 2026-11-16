import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Exportar } from '../features/indicadores/Exportar'
import { CORTO, dias, mes, pct } from '../features/indicadores/formato'
import { api } from '../shared/api/client'
import type { Evolucion, Indicadores } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta } from '../shared/lib/formato'
import { SERIES, token } from '../shared/lib/tokens'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Figura } from '../shared/ui/Figura'

/** Pantalla A1: cuatro indicadores, resultado por programa y evolución del control. */
export function Panorama() {
  const { estado, reintentar } = useApi(() => Promise.all([api<Indicadores>('/api/v1/indicadores'), api<Evolucion>('/api/v1/indicadores/evolucion')]))
  const [porPrograma, setPorPrograma] = useState(false)
  if (estado.tipo === 'cargando') return <Cargando texto="Calculando indicadores…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const [ind, ev] = estado.datos
  const t = ind.total
  const series = SERIES()
  const ejes = { fill: token('color-text-muted'), fontSize: 12 }
  const grid = token('chart-grid')
  const barras = ind.por_programa.map((p) => ({ nombre: CORTO[p.programa_id] ?? p.programa, control: p.control_pct, conf: p.confirmacion_pct }))
  const ids = Object.keys(ev.programas)
  const lineas = ev.total.map((p, i) => ({
    mes: mes(p.mes),
    total: p.control_pct,
    ...Object.fromEntries(ids.map((id) => [id, ev.por_programa[id][i]?.control_pct ?? null])),
  }))
  const primero = ev.total[0]?.control_pct ?? 0
  const ultimo = ev.total[ev.total.length - 1]?.control_pct ?? 0
  const mejor = ind.por_programa[0]
  const peor = ind.por_programa[ind.por_programa.length - 1]

  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Panorama de resultados</h1>
          <p className="texto-apoyo">Región Sanitaria XII · Tlaquepaque · corte {fechaCorta(ind.fecha_corte)}</p>
        </div>
        <div className="encabezado__acciones">
          <Simulado />
          <Exportar por="programa" />
        </div>
      </header>

      <section className="titular" aria-label="Resultado principal">
        <p className="titular__frase">
          De <strong className="tabular">{t.detectadas.toLocaleString('es-MX')}</strong> personas detectadas,{' '}
          <strong className="tabular">{t.control_num}</strong> llegaron al control: el{' '}
          <strong className="titular__cifra tabular">{pct(t.control_pct)}</strong> de quienes confirmaron su diagnóstico.
        </p>
      </section>

      <table className="tabla tabla--indicadores">
        <caption className="solo-lector">Los cuatro indicadores de éxito, total de los cinco programas</caption>
        <thead>
          <tr>
            <th scope="col">Indicador</th>
            <th scope="col">Valor</th>
            <th scope="col">Base</th>
            <th scope="col">Cómo se calcula</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Confirmación del diagnóstico', pct(t.confirmacion_pct), `${t.confirmacion_num} de ${t.confirmacion_den} en 30 días`, ind.definiciones.confirmacion],
            ['Tiempo a la primera consulta', dias(t.dias_primera_consulta_mediana), `mediana; la mitad entre ${t.dias_primera_consulta_p25} y ${t.dias_primera_consulta_p75} días`, ind.definiciones.dias_primera_consulta],
            ['Retención en tratamiento', `${pct(t.retencion_6_pct)} · ${pct(t.retencion_12_pct)}`, 'a 6 meses · a 12 meses', ind.definiciones.retencion],
            ['Personas en control', pct(t.control_pct), `${t.control_num} de ${t.control_den} confirmadas`, ind.definiciones.control],
          ].map(([nombre, valor, base, def]) => (
            <tr key={nombre}>
              <th scope="row">{nombre}</th>
              <td className="indicador__valor tabular">{valor}</td>
              <td className="tabular">{base}</td>
              <td>
                <details className="definicion">
                  <summary>Ver fórmula</summary>
                  <p>{def}</p>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rejilla-dos">
        <Figura
          titulo="Personas en control por programa"
          resumen={`${CORTO[mejor.programa_id]} lleva más personas al control (${pct(mejor.control_pct)}); ${CORTO[peor.programa_id]}, menos (${pct(peor.control_pct)}).`}
          tabla={
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Programa</th>
                  <th scope="col">Detectadas</th>
                  <th scope="col">Confirmación</th>
                  <th scope="col">En control</th>
                </tr>
              </thead>
              <tbody>
                {ind.por_programa.map((p) => (
                  <tr key={p.programa_id}>
                    <th scope="row">{p.programa}</th>
                    <td className="tabular">{p.detectadas}</td>
                    <td className="tabular">{pct(p.confirmacion_pct)}</td>
                    <td className="tabular">
                      {pct(p.control_pct)} ({p.control_num}/{p.control_den})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barras} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={grid} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={ejes} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" width={150} tick={{ ...ejes, fill: token('color-text') }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="control" name="En control" fill={token('chart-1')} radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false}>
                  <LabelList dataKey="control" position="right" formatter={(v: number) => `${v.toFixed(0)}%`} style={{ fill: token('color-text'), fontSize: 12, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Figura>

        <Figura
          titulo="Evolución del control"
          resumen={`El porcentaje en control pasó de ${pct(primero)} a ${pct(ultimo)} en los últimos 12 meses.`}
          acciones={
            <button type="button" className="boton boton--chico boton--secundario" aria-pressed={porPrograma} onClick={() => setPorPrograma((v) => !v)}>
              {porPrograma ? 'Ver total' : 'Ver por programa'}
            </button>
          }
          tabla={
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Mes</th>
                  <th scope="col">Total</th>
                  {ids.map((id) => (
                    <th scope="col" key={id}>
                      {CORTO[id]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.mes}>
                    <th scope="row">{l.mes}</th>
                    <td className="tabular">{pct(l.total)}</td>
                    {ids.map((id) => (
                      <td className="tabular" key={id}>
                        {pct((l as unknown as Record<string, number | null>)[id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineas} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="mes" tick={ejes} interval={1} tickLine={false} axisLine={{ stroke: grid }} />
                <YAxis domain={[0, 100]} tick={ejes} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                {porPrograma ? (
                  <>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {ids.map((id, i) => (
                      <Line key={id} dataKey={id} name={CORTO[id]} stroke={series[i]} strokeWidth={2} dot={false} strokeDasharray={['', '6 3', '2 3', '10 4', '1 0'][i]} isAnimationActive={false} />
                    ))}
                  </>
                ) : (
                  <Line dataKey="total" name="Total" stroke={token('chart-1')} strokeWidth={3} dot={{ r: 3 }} isAnimationActive={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Figura>
      </div>
    </>
  )
}
