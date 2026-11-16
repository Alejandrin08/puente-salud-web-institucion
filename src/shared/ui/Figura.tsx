import { useId, useState, type ReactNode } from 'react'

/**
 * Gráfico o mapa con su alternativa accesible: un botón alterna entre la vista visual y una tabla.
 * La descripción (`resumen`) dice en una frase lo que el gráfico muestra.
 */
export function Figura({
  titulo,
  resumen,
  tabla,
  acciones,
  children,
}: {
  titulo: string
  resumen: string
  tabla: ReactNode
  acciones?: ReactNode
  children: ReactNode
}) {
  const [verTabla, setVerTabla] = useState(false)
  const id = useId()
  return (
    <figure className="figura" aria-labelledby={`${id}-t`} aria-describedby={`${id}-d`}>
      <div className="figura__cabeza">
        <div>
          <h2 className="titulo-s" id={`${id}-t`}>
            {titulo}
          </h2>
          <p className="figura__resumen" id={`${id}-d`}>
            {resumen}
          </p>
        </div>
        <div className="figura__acciones">
          {acciones}
          <button type="button" className="boton boton--chico boton--secundario" aria-pressed={verTabla} onClick={() => setVerTabla((v) => !v)}>
            {verTabla ? 'Ver gráfico' : 'Ver tabla'}
          </button>
        </div>
      </div>
      <div className="figura__cuerpo">{verTabla ? <div className="tabla-envoltura">{tabla}</div> : children}</div>
    </figure>
  )
}
