import { useState, type FormEvent } from 'react'
import { hayError, vistaPrevia, type Valores } from '../features/paciente/vistaPrevia'
import { api } from '../shared/api/client'
import type { PacienteDetalle, Semaforo } from '../shared/api/tipos'
import { useApi } from '../shared/api/useApi'
import { fechaCorta, nombrePropio } from '../shared/lib/formato'
import { navegar } from '../shared/lib/router'
import { Enlace } from '../shared/ui/Enlace'
import { Cargando, ErrorEstado, Simulado } from '../shared/ui/Estados'
import { Icono } from '../shared/ui/Icono'
import { InsigniaSemaforo } from '../shared/ui/Semaforo'

type Resultado = { medicion_id: number; semaforo_anterior: Semaforo['nivel']; semaforo: Semaforo }
type Tipo = 'presion' | 'glucosa'

const PROGRAMAS = [
  { id: 'centros_rxii', nombre: 'Centro de salud' },
  { id: 'caravanas', nombre: 'Caravanas de Salud' },
  { id: 'ferias', nombre: 'Feria de salud' },
  { id: 'medicos_hogar', nombre: 'Médicas y Médicos en tu Hogar' },
  { id: 'casa_por_casa', nombre: 'Salud Casa por Casa' },
]

function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function num(v: string): number | undefined {
  const n = Number(v.replace(',', '.'))
  return v.trim() === '' || Number.isNaN(n) ? undefined : n
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <li className="paso-form">
      <h2 className="paso-form__titulo">
        <span className="paso-form__num" aria-hidden="true">
          {n}
        </span>
        <span className="solo-lector">Paso {n}: </span>
        {titulo}
      </h2>
      {children}
    </li>
  )
}

function CampoValor({ id, etiqueta, unidad, valor, onCambio, ayuda }: { id: string; etiqueta: string; unidad: string; valor: string; onCambio: (v: string) => void; ayuda?: string }) {
  return (
    <div className="valor">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="valor__caja">
        <input id={id} inputMode="decimal" autoComplete="off" value={valor} onChange={(e) => onCambio(e.target.value)} aria-describedby={`${id}-u`} />
        <span className="valor__unidad" id={`${id}-u`}>
          {unidad}
        </span>
      </div>
      {ayuda && <span className="campo__ayuda">{ayuda}</span>}
    </div>
  )
}

/** Pantalla S3: captura en cuatro pasos con vista previa del semáforo y mediciones recibidas de otros programas. */
export function RegistrarMedicion({ folio }: { folio: string }) {
  const { estado, reintentar } = useApi(() => api<PacienteDetalle>(`/api/v1/pacientes/${folio}`), [folio])
  const [f, setF] = useState({ pas: '', pad: '', glucosa: '', hba1c: '' })
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const [programa, setPrograma] = useState('centros_rxii')
  const [fecha, setFecha] = useState(hoyISO())
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  if (estado.tipo === 'cargando') return <Cargando />
  if (estado.tipo === 'error') return <ErrorEstado mensaje={estado.error.message} onReintentar={reintentar} />
  const datos = estado.datos
  const p = datos.persona
  const dm = p.enfermedades.includes('diabetes')
  const hta = p.enfermedades.includes('hipertension')
  const tipos: Tipo[] = [...(hta ? (['presion'] as Tipo[]) : []), ...(dm ? (['glucosa'] as Tipo[]) : [])]
  const activo = tipo ?? tipos[0]
  const valores: Valores = { pas: num(f.pas), pad: num(f.pad), glucosa: num(f.glucosa), hba1c: num(f.hba1c) }
  const avisos = vistaPrevia(valores, p.enfermedades)
  const vacio = Object.values(valores).every((v) => v == null)
  const otros = datos.mediciones.filter((m) => m.otro_programa).slice(-3).reverse()
  const enf = p.enfermedades.map((e) => (e === 'diabetes' ? 'Diabetes' : 'Hipertensión')).join(' e ')
  const etapa = p.fecha_confirmacion ? 'en seguimiento' : 'por confirmar'
  const curp = `${p.curp_simulada.slice(0, 4)}••••••${p.curp_simulada.slice(-4)}`
  const unidad = nombrePropio(p.unidad.nombre)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (vacio || hayError(avisos)) return
    setEnviando(true)
    setError(null)
    try {
      setResultado(
        await api<Resultado>(`/api/v1/pacientes/${folio}/mediciones`, {
          method: 'POST',
          json: { ...valores, fecha, programa_id: programa, es_consulta: true },
        }),
      )
      setF({ pas: '', pad: '', glucosa: '', hba1c: '' })
      reintentar()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

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
          <h1 className="titulo-l titulo-l--grande">Registrar medición</h1>
          <p className="texto-apoyo">Captura una medición aquí o recíbela automáticamente desde el sistema de tu programa.</p>
        </div>
        <Simulado />
      </header>

      <div className="rejilla-medicion rejilla-medicion--pasos">
        <form className="panel formulario-pasos" onSubmit={enviar} noValidate>
          <ol className="pasos-form">
            <Paso n={1} titulo="Persona">
              <div className="persona-elegida">
                <span className="avatar" aria-hidden="true">
                  {iniciales(p.nombre)}
                </span>
                <div>
                  <p className="persona-elegida__nombre">{p.nombre}</p>
                  <p className="persona-elegida__datos tabular">
                    CURP {curp} · Folio {p.folio} · {enf} {etapa}
                  </p>
                </div>
                <Enlace a="/medicion" className="persona-elegida__cambiar">
                  Cambiar
                </Enlace>
              </div>
            </Paso>

            <Paso n={2} titulo="Tipo de medición">
              <div className="tipos" role="group" aria-label="Tipo de medición">
                {tipos.map((t) => (
                  <button key={t} type="button" className="tipo" aria-pressed={activo === t} onClick={() => setTipo(t)}>
                    <Icono nombre={activo === t ? 'check' : t === 'presion' ? 'latido' : 'gota'} tam={18} />
                    {t === 'presion' ? 'Presión arterial' : 'Glucosa'}
                  </button>
                ))}
              </div>
              {tipos.length > 1 && <p className="campo__ayuda">Puedes capturar ambas: los valores se conservan al cambiar de pestaña.</p>}
            </Paso>

            <Paso n={3} titulo="Valores">
              {activo === 'presion' ? (
                <div className="valores">
                  <CampoValor id="pas" etiqueta="Sistólica" unidad="mmHg" valor={f.pas} onCambio={(v) => setF({ ...f, pas: v })} />
                  <CampoValor id="pad" etiqueta="Diastólica" unidad="mmHg" valor={f.pad} onCambio={(v) => setF({ ...f, pad: v })} />
                </div>
              ) : (
                <div className="valores">
                  <CampoValor id="glucosa" etiqueta="Glucosa en ayuno" unidad="mg/dl" valor={f.glucosa} onCambio={(v) => setF({ ...f, glucosa: v })} />
                  <CampoValor id="hba1c" etiqueta="HbA1c" unidad="%" valor={f.hba1c} onCambio={(v) => setF({ ...f, hba1c: v })} ayuda="Opcional. Al menos una vez al año." />
                </div>
              )}
            </Paso>

            <Paso n={4} titulo="Dónde y cuándo">
              <div className="valores">
                <div className="campo">
                  <label htmlFor="programa">Programa y lugar</label>
                  <div className="select-icono">
                    <Icono nombre="pin" tam={18} />
                    <select id="programa" value={programa} onChange={(e) => setPrograma(e.target.value)}>
                      {PROGRAMAS.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.id === 'centros_rxii' ? unidad : x.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="fecha">Fecha</label>
                  <div className="select-icono">
                    <Icono nombre="calendario" tam={18} />
                    <input id="fecha" type="date" value={fecha} max={hoyISO()} onChange={(e) => setFecha(e.target.value)} />
                  </div>
                </div>
              </div>
            </Paso>
          </ol>

          {error && (
            <p className="formulario__error" role="alert">
              {error}
            </p>
          )}
          <div className="formulario__acciones">
            <button type="submit" className="boton boton--primario" disabled={enviando || vacio || hayError(avisos)}>
              {enviando ? 'Guardando…' : 'Guardar medición'}
            </button>
            <button type="button" className="boton boton--secundario" onClick={() => navegar(`/pacientes/${folio}`)}>
              Cancelar
            </button>
          </div>
        </form>

        <aside className="columna columna--lateral">
          <section className="panel-noche" aria-labelledby="t-previa" aria-live="polite">
            <h2 className="panel-noche__titulo" id="t-previa">
              <Icono nombre="chispa" tam={18} />
              {resultado ? 'Medición guardada' : 'Vista previa'}
            </h2>
            {resultado ? (
              <>
                <p className="panel-noche__nivel">
                  <InsigniaSemaforo nivel={resultado.semaforo_anterior} />
                  <Icono nombre="flecha" tam={16} />
                  <InsigniaSemaforo nivel={resultado.semaforo.nivel} />
                </p>
                <p>{resultado.semaforo.resumen}</p>
                <Enlace a={`/pacientes/${folio}`} className="panel-noche__enlace">
                  Volver al recorrido
                </Enlace>
              </>
            ) : (
              <>
                <p className="panel-noche__nivel">
                  Nivel actual <InsigniaSemaforo nivel={datos.semaforo.nivel} />
                </p>
                {vacio ? (
                  <p className="panel-noche__apoyo">Escribe los valores para ver si están en meta antes de guardar.</p>
                ) : (
                  <ul className="previa">
                    {avisos.map((a) => (
                      <li key={a.texto} className={`aviso aviso--${a.tono}`}>
                        {a.texto}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            <p className="panel-noche__nota">
              <Icono nombre="info" tam={16} />
              El semáforo se recalcula al guardar. Ordena y explica; decide el personal de salud.
            </p>
          </section>

          <section className="panel" aria-labelledby="t-recibidas">
            <h2 className="titulo-s titulo-con-icono" id="t-recibidas">
              <Icono nombre="sincronizar" tam={18} />
              Recibidas de otros programas
            </h2>
            <p className="texto-apoyo">Si tu programa envía mediciones, aparecen aquí sin volver a capturarlas.</p>
            {otros.length ? (
              <ul className="recibidas">
                {otros.map((m) => (
                  <li key={m.id ?? m.fecha}>
                    <span className="recibidas__marca" aria-hidden="true">
                      <Icono nombre="check" tam={14} />
                    </span>
                    <div>
                      <p className="recibidas__titulo">{m.programa}</p>
                      <p className="sub tabular">
                        {fechaCorta(m.fecha)} · {[m.pas && `${m.pas}/${m.pad} mmHg`, m.glucosa && `glucosa ${m.glucosa}`, m.hba1c && `HbA1c ${m.hba1c}%`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="texto-apoyo">Aún no hay mediciones de otros programas para esta persona.</p>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
