import { ExplicacionSemaforo } from '../features/paciente/ExplicacionSemaforo'
import { GraficoEvolucion } from '../features/paciente/GraficoEvolucion'
import { api } from '../shared/api/client'
import type { PacienteDetalle } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta, hora, nombrePropio } from '../shared/lib/formato'
import { navegar } from '../shared/lib/router'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Icono } from '../shared/ui/Icono'

const ENF: Record<string, string> = { diabetes: 'Diabetes', hipertension: 'Hipertensión' }
const ACCION: Record<string, string> = {
  consultar_recorrido: 'Consultó el recorrido',
  sugerencia_semaforo: 'Sugerencia del semáforo',
  registrar_medicion: 'Registró una medición',
  desacuerdo_semaforo: 'Desacuerdo con el semáforo',
  consentimiento: 'Consentimiento',
  acceso_persona: 'La persona entró a su app',
}
const TIPO_CITA: Record<string, string> = { confirmacion: 'Confirmación', control: 'Control', visita: 'Visita a domicilio' }
const ESTADO_CITA: Record<string, string> = { atendida: 'Atendida', perdida: 'Perdida', programada: 'Programada' }

/** Pantalla S2: por qué tiene esa prioridad, evolución y surtido del medicamento. */
export function Paciente({ folio }: { folio: string }) {
  const { estado, reintentar } = useApi(() => api<PacienteDetalle>(`/api/v1/pacientes/${folio}`), [folio])
  if (estado.tipo === 'cargando') return <Cargando texto="Cargando el recorrido…" />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const { persona: p, semaforo, mediciones, adherencia, citas, desacuerdos, bitacora, etapas, tratamientos, consultas_registradas } = estado.datos

  return (
    <>
      <nav aria-label="Ruta de navegación" className="migas">
        <Enlace a="/seguimiento">Seguimiento</Enlace>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.folio}</span>
      </nav>
      <header className="encabezado">
        <div>
          <h1 className="titulo-l">{p.nombre}</h1>
          <p className="texto-apoyo tabular">
            {p.folio} · {p.edad} años · {p.sexo === 'M' ? 'Mujer' : 'Hombre'} · {p.enfermedades.map((e) => ENF[e]).join(' e ')}
          </p>
        </div>
        <div className="encabezado__acciones">
          <Simulado />
          <button type="button" className="boton boton--primario" onClick={() => navegar(`/pacientes/${p.folio}/medicion`)}>
            <Icono nombre="cruz" tam={20} />
            Registrar medición
          </button>
        </div>
      </header>

      <div className="rejilla-paciente">
        <div className="columna">
          <ExplicacionSemaforo folio={p.folio} semaforo={semaforo} onDesacuerdo={reintentar} />
          <GraficoEvolucion mediciones={mediciones} enfermedades={p.enfermedades} />

          <section className="panel" aria-labelledby="t-surtido">
            <h2 className="titulo-s" id="t-surtido">
              Surtido del medicamento
            </h2>
            {adherencia.registros.length ? (
              <>
                <p className="dato-linea">
                  <strong className="tabular">{adherencia.porcentaje_completo?.toFixed(0)}%</strong> de surtidos completos ·{' '}
                  {adherencia.cubierto_hoy ? 'tiene medicamento para hoy' : `sin medicamento cubierto: último surtido hace ${adherencia.dias_desde_ultimo} días`}
                </p>
                <ul className="tratamientos">
                  {tratamientos.map((t) => (
                    <li key={t.medicamento}>
                      <strong>{t.medicamento}</strong> · {t.indicacion} · desde {fechaCorta(t.fecha_inicio)}
                    </li>
                  ))}
                </ul>
                <table className="tabla tabla--compacta">
                  <caption className="solo-lector">Últimos surtidos</caption>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Medicamento</th>
                      <th scope="col">Días</th>
                      <th scope="col">Surtido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...adherencia.registros].reverse().slice(0, 6).map((s, i) => (
                      <tr key={`${s.fecha}-${s.medicamento}-${i}`}>
                        <td className="tabular">{fechaCorta(s.fecha)}</td>
                        <td>{s.medicamento}</td>
                        <td className="tabular">{s.dias}</td>
                        <td>{s.completo ? 'Completo' : 'Incompleto'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="texto-apoyo">Sin tratamiento ni surtidos registrados.</p>
            )}
          </section>
        </div>

        <aside className="columna columna--lateral">
          <section className="panel" aria-labelledby="t-datos">
            <h2 className="titulo-s" id="t-datos">
              Datos del folio
            </h2>
            <dl className="datos">
              <dt>CURP (simulada)</dt>
              <dd className="tabular">{p.curp_simulada}</dd>
              <dt>Programa que detectó</dt>
              <dd>{p.programa_nombre}</dd>
              <dt>Unidad</dt>
              <dd>{nombrePropio(p.unidad.nombre)}</dd>
              <dt>Seguridad social</dt>
              <dd>{p.seguridad_social ?? 'Sin afiliación'}</dd>
              <dt>Rezago social de su AGEB</dt>
              <dd>{p.rezago}</dd>
              <dt>Red de apoyo</dt>
              <dd>{p.red_apoyo ?? 'No registrada'}</dd>
              <dt>Teléfono (simulado)</dt>
              <dd className="tabular">{p.telefono_simulado}</dd>
            </dl>
          </section>
          <section className="panel" aria-labelledby="t-etapas">
            <h2 className="titulo-s" id="t-etapas">
              Recorrido
            </h2>
            <ol className="pasos">
              {etapas.map((e) => (
                <li key={e.clave} className={e.completada ? 'pasos__hecho' : ''}>
                  <span className="pasos__marca" aria-hidden="true">
                    {e.completada ? <Icono nombre="check" tam={14} /> : e.paso}
                  </span>
                  {e.titulo}
                  <span className="sub tabular">{e.fecha ? fechaCorta(e.fecha) : e.completada ? '' : 'pendiente'}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel" aria-labelledby="t-citas">
            <h2 className="titulo-s" id="t-citas">
              Citas
            </h2>
            <ul className="lista-simple">
              {[...citas].reverse().slice(0, 6).map((c, i) => (
                <li key={`${c.fecha}-${i}`}>
                  <span className="tabular">
                    {fechaCorta(c.fecha)} {hora(c.hora)}
                  </span>
                  <span>
                    {TIPO_CITA[c.tipo] ?? c.tipo} · {ESTADO_CITA[c.estado]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel" aria-labelledby="t-bitacora">
            <h2 className="titulo-s" id="t-bitacora">
              Bitácora
            </h2>
            {desacuerdos.length > 0 && (
              <p className="texto-apoyo">
                {desacuerdos.length} desacuerdo(s) registrado(s). Último: «{desacuerdos[0].motivo}» ({desacuerdos[0].nivel_sugerido} → {desacuerdos[0].nivel_propuesto}).
              </p>
            )}
            <p className="texto-apoyo tabular">{consultas_registradas} consultas del recorrido y sugerencias del semáforo registradas para auditoría.</p>
            <ul className="lista-simple">
              {bitacora.slice(0, 8).map((b) => (
                <li key={b.id}>
                  <span className="tabular">{new Date(b.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span>
                    {ACCION[b.accion] ?? b.accion} · {b.usuario}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  )
}
