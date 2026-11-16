import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Exportar } from '../features/indicadores/Exportar'
import { CORTO, dias, pct } from '../features/indicadores/formato'
import { api } from '../shared/api/client'
import type { Indicadores } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta } from '../shared/lib/formato'
import { token } from '../shared/lib/tokens'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Figura } from '../shared/ui/Figura'

/** Pantalla A3: permanencia en tratamiento y tiempo a la primera consulta, por programa. */
export function Comparativo() {
  const { estado, reintentar } = useApi(() => api<Indicadores>('/api/v1/indicadores'))
  if (estado.tipo === 'cargando') return <Cargando />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const ind = estado.datos
  const ejes = { fill: token('color-text-muted'), fontSize: 12 }
  const grid = token('chart-grid')
  const progs = [...ind.por_programa].sort((a, b) => (b.retencion_12_pct ?? 0) - (a.retencion_12_pct ?? 0))
  const ret = progs.map((p) => ({ nombre: CORTO[p.programa_id], r6: p.retencion_6_pct, r12: p.retencion_12_pct }))
  const tiempos = [...ind.por_programa]
    .sort((a, b) => (a.dias_primera_consulta_mediana ?? 0) - (b.dias_primera_consulta_mediana ?? 0))
    .map((p) => ({
      nombre: CORTO[p.programa_id],
      base: p.dias_primera_consulta_p25 ?? 0,
      rango: (p.dias_primera_consulta_p75 ?? 0) - (p.dias_primera_consulta_p25 ?? 0),
      mediana: p.dias_primera_consulta_mediana,
    }))
  const mejor = progs[0]
  const peor = progs[progs.length - 1]

  return (
    <>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">Comparativo por programas</h1>
          <p className="texto-apoyo">¿Qué programa logra que la gente siga en tratamiento? · corte {fechaCorta(ind.fecha_corte)}</p>
        </div>
        <div className="encabezado__acciones">
          <Simulado />
          <Exportar por="programa" />
        </div>
      </header>

      <div className="rejilla-dos">
        <Figura
          titulo="Permanencia en tratamiento"
          resumen={`A 12 meses sigue en tratamiento el ${pct(mejor.retencion_12_pct)} en ${CORTO[mejor.programa_id]} y el ${pct(peor.retencion_12_pct)} en ${CORTO[peor.programa_id]}.`}
          tabla={
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Programa</th>
                  <th scope="col">A 6 meses</th>
                  <th scope="col">A 12 meses</th>
                </tr>
              </thead>
              <tbody>
                {progs.map((p) => (
                  <tr key={p.programa_id}>
                    <th scope="row">{p.programa}</th>
                    <td className="tabular">
                      {pct(p.retencion_6_pct)} ({p.retencion_6_num}/{p.retencion_6_den})
                    </td>
                    <td className="tabular">
                      {pct(p.retencion_12_pct)} ({p.retencion_12_num}/{p.retencion_12_den})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ret} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke={grid} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={ejes} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" width={150} tick={{ ...ejes, fill: token('color-text') }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="r6" name="A 6 meses" fill={token('chart-2')} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
                <Bar dataKey="r12" name="A 12 meses" fill={token('chart-5')} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
                  <LabelList dataKey="r12" position="right" formatter={(v: number) => `${v.toFixed(0)}%`} style={{ fill: token('color-text'), fontSize: 12, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Figura>

        <Figura
          titulo="Tiempo a la primera consulta"
          resumen="Días desde la detección hasta la primera consulta: la barra cubre a la mitad central de las personas y la etiqueta dice la mediana."
          tabla={
            <table className="tabla tabla--compacta">
              <thead>
                <tr>
                  <th scope="col">Programa</th>
                  <th scope="col">Mediana</th>
                  <th scope="col">Mitad central</th>
                  <th scope="col">Personas</th>
                </tr>
              </thead>
              <tbody>
                {ind.por_programa.map((p) => (
                  <tr key={p.programa_id}>
                    <th scope="row">{p.programa}</th>
                    <td className="tabular">{dias(p.dias_primera_consulta_mediana)}</td>
                    <td className="tabular">
                      {p.dias_primera_consulta_p25} a {p.dias_primera_consulta_p75} días
                    </td>
                    <td className="tabular">{p.dias_primera_consulta_n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tiempos} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={grid} horizontal={false} />
                <XAxis type="number" domain={[0, 60]} tick={ejes} tickFormatter={(v) => `${v} d`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" width={150} tick={{ ...ejes, fill: token('color-text') }} axisLine={false} tickLine={false} />
                <Bar dataKey="base" stackId="t" fill="transparent" isAnimationActive={false} />
                <Bar dataKey="rango" stackId="t" name="Mitad central" fill={token('chart-1')} radius={6} barSize={16} isAnimationActive={false}>
                  <LabelList dataKey="mediana" position="right" formatter={(v: number) => `${v} d`} style={{ fill: token('color-text'), fontSize: 12, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Figura>
      </div>
      <p className="nota-metodo">
        Retención: {ind.definiciones.retencion} Las diferencias entre programas provienen de datos simulados parametrizados con tasas publicadas; sirven para demostrar el tablero, no para evaluar programas reales.
      </p>
    </>
  )
}
