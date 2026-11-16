import { useState, type FormEvent } from 'react'
import { api } from '../../shared/api/client'
import type { Semaforo } from '../../shared/api/tipos'
import { InsigniaSemaforo, NIVELES, ETIQUETA, type Nivel } from '../../shared/ui/Semaforo'

const DIMENSION: Record<string, string> = { clinica: 'Control clínico', seguimiento: 'Seguimiento', riesgo: 'Riesgo de abandono' }

/** Por qué tiene esa prioridad: cada dimensión con su regla y su fuente. Permite registrar el desacuerdo. */
export function ExplicacionSemaforo({ folio, semaforo, onDesacuerdo }: { folio: string; semaforo: Semaforo; onDesacuerdo: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const [propuesto, setPropuesto] = useState<Nivel>('amarillo')
  const [motivo, setMotivo] = useState('')
  const [estado, setEstado] = useState<'inactivo' | 'enviando' | 'hecho' | string>('inactivo')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (motivo.trim().length < 5) {
      setEstado('Escribe el motivo (al menos 5 caracteres).')
      return
    }
    setEstado('enviando')
    try {
      await api(`/api/v1/pacientes/${folio}/desacuerdo`, { method: 'POST', json: { nivel_propuesto: propuesto, motivo: motivo.trim() } })
      setEstado('hecho')
      setAbierto(false)
      setMotivo('')
      onDesacuerdo()
    } catch (err) {
      setEstado((err as Error).message)
    }
  }

  return (
    <section className="panel panel--semaforo" aria-labelledby="t-semaforo">
      <div className="semaforo-cabeza">
        <InsigniaSemaforo nivel={semaforo.nivel} grande />
        <h2 className="titulo-m" id="t-semaforo">
          {semaforo.resumen.replace(/^\w+: /, '').replace(/^./, (c) => c.toUpperCase())}
        </h2>
      </div>
      {semaforo.requiere_valoracion && <p className="aviso aviso--grave">Requiere valoración del personal.</p>}
      <ul className="motivos">
        {Object.entries(DIMENSION).map(([dim, nombre]) => {
          const ms = semaforo.motivos.filter((m) => m.dimension === dim)
          const nivel = semaforo.dimensiones[dim] ?? 'verde'
          return (
            <li key={dim} className="motivo">
              <div className="motivo__dim">
                <span>{nombre}</span>
                <InsigniaSemaforo nivel={nivel} />
              </div>
              {ms.length ? (
                ms.map((m) => (
                  <p key={m.texto} className="motivo__texto">
                    {m.texto}
                    <span className="motivo__fuente">Fuente: {m.fuente}</span>
                  </p>
                ))
              ) : (
                <p className="motivo__texto">Sin factores: menos de dos factores de riesgo.</p>
              )}
            </li>
          )
        })}
      </ul>
      <p className="texto-apoyo">{semaforo.aviso}</p>
      {estado === 'hecho' && (
        <p className="aviso aviso--ok" role="status">
          Desacuerdo registrado en la bitácora.
        </p>
      )}
      {!abierto ? (
        <button type="button" className="boton boton--secundario boton--chico boton--inicio" onClick={() => setAbierto(true)}>
          No estoy de acuerdo con el nivel
        </button>
      ) : (
        <form className="formulario formulario--fila" onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="nivel-propuesto">Nivel que propones</label>
            <select id="nivel-propuesto" value={propuesto} onChange={(e) => setPropuesto(e.target.value as Nivel)}>
              {NIVELES.filter((n) => n !== semaforo.nivel).map((n) => (
                <option key={n} value={n}>
                  {ETIQUETA[n]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo campo--ancho">
            <label htmlFor="motivo">Motivo</label>
            <input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ejemplo: ya acudió; falta capturar la consulta" />
          </div>
          <div className="formulario__acciones">
            <button type="submit" className="boton boton--primario boton--chico" disabled={estado === 'enviando'}>
              Registrar desacuerdo
            </button>
            <button type="button" className="boton boton--texto" onClick={() => setAbierto(false)}>
              Cancelar
            </button>
          </div>
          {estado !== 'inactivo' && estado !== 'enviando' && estado !== 'hecho' && (
            <p className="formulario__error" role="alert">
              {estado}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
