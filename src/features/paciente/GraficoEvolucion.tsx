import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Medicion } from '../../shared/api/tipos'
import { fechaCorta } from '../../shared/lib/formato'
import { token } from '../../shared/lib/tokens'
import { Figura } from '../../shared/ui/Figura'

/** Evolución de presión o glucosa con la línea de meta de la NOM. Alternativa en tabla. */
export function GraficoEvolucion({ mediciones, enfermedades }: { mediciones: Medicion[]; enfermedades: string[] }) {
  const dm = enfermedades.includes('diabetes')
  const hta = enfermedades.includes('hipertension')
  const datos = mediciones.slice(-12).map((m) => ({ ...m, f: fechaCorta(m.fecha), t: new Date(`${m.fecha}T12:00:00`).getTime() }))
  const ejeX = { dataKey: 't', type: 'number' as const, scale: 'time' as const, domain: ['dataMin - 86400000', 'dataMax + 86400000'] as [string, string], tickFormatter: (v: number) => fechaCorta(new Date(v).toISOString().slice(0, 10)), tickCount: 5 }
  const ultima = datos[datos.length - 1]
  const meta = dm ? [130, 80] : [140, 90]
  const resumen = ultima
    ? `${datos.length} ${datos.length === 1 ? 'medición' : 'mediciones'}; la última (${ultima.f}) está ${ultima.en_control ? 'en meta' : 'fuera de meta'}.`
    : 'Sin mediciones registradas.'
  const ejes = { stroke: token('color-text-muted'), fontSize: 12 }
  const grid = token('chart-grid')

  return (
    <Figura
      titulo="Evolución del padecimiento"
      resumen={resumen}
      tabla={
        <table className="tabla tabla--compacta">
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {hta && <th scope="col">Presión (mmHg)</th>}
              {dm && <th scope="col">Glucosa (mg/dl)</th>}
              {dm && <th scope="col">HbA1c (%)</th>}
              <th scope="col">Estado</th>
              <th scope="col">Registró</th>
            </tr>
          </thead>
          <tbody>
            {[...datos].reverse().map((m, i) => (
              <tr key={`${m.fecha}-${i}`}>
                <td className="tabular">{m.f}</td>
                {hta && <td className="tabular">{m.pas ? `${m.pas}/${m.pad}` : '—'}</td>}
                {dm && <td className="tabular">{m.glucosa ?? '—'}</td>}
                {dm && <td className="tabular">{m.hba1c ?? '—'}</td>}
                <td>{m.en_control == null ? '—' : m.en_control ? 'En meta' : 'Fuera de meta'}</td>
                <td>{m.programa ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {datos.length === 0 ? (
        <p className="texto-apoyo">Sin mediciones registradas.</p>
      ) : (
        <div className="graficos-par">
          {hta && (
            <div className="grafico" aria-hidden="true">
              <p className="grafico__titulo">Presión arterial (mmHg) · meta menor de {meta.join('/')}</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={datos} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={grid} vertical={false} />
                  <XAxis {...ejeX} tick={ejes} tickLine={false} axisLine={{ stroke: grid }} />
                  <YAxis domain={[60, 200]} tick={ejes} tickLine={false} axisLine={false} />
                  <Tooltip labelFormatter={(v: number) => fechaCorta(new Date(v).toISOString().slice(0, 10))} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <ReferenceLine y={meta[0]} stroke={token('chart-meta')} strokeDasharray="5 4" />
                  <ReferenceLine y={meta[1]} stroke={token('chart-meta')} strokeDasharray="5 4" />
                  <Line type="monotone" dataKey="pas" name="Sistólica" stroke={token('chart-1')} strokeWidth={2.5} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                  <Line type="monotone" dataKey="pad" name="Diastólica" stroke={token('chart-3')} strokeWidth={2.5} dot={{ r: 3, strokeDasharray: '' }} strokeDasharray="6 3" connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {dm && (
            <div className="grafico" aria-hidden="true">
              <p className="grafico__titulo">Glucosa en ayuno (mg/dl) · meta de 70 a 130</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={datos} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={grid} vertical={false} />
                  <XAxis {...ejeX} tick={ejes} tickLine={false} axisLine={{ stroke: grid }} />
                  <YAxis domain={[40, (max: number) => Math.max(160, Math.ceil(max / 20) * 20 + 20)]} tick={ejes} tickLine={false} axisLine={false} />
                  <Tooltip labelFormatter={(v: number) => fechaCorta(new Date(v).toISOString().slice(0, 10))} />
                  <ReferenceLine y={130} stroke={token('chart-meta')} strokeDasharray="5 4" />
                  <ReferenceLine y={70} stroke={token('chart-meta')} strokeDasharray="5 4" />
                  <Line type="monotone" dataKey="glucosa" name="Glucosa" stroke={token('chart-2')} strokeWidth={2.5} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Figura>
  )
}
