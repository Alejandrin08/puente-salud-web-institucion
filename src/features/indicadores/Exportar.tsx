import { useState } from 'react'
import { descargar } from '../../shared/api/client'
import { Icono } from '../../shared/ui/Icono'

export function Exportar({ por, texto }: { por: 'programa' | 'ageb'; texto?: string }) {
  const [estado, setEstado] = useState<'listo' | 'bajando' | string>('listo')
  return (
    <>
      <button
        type="button"
        className="boton boton--chico boton--secundario"
        disabled={estado === 'bajando'}
        onClick={async () => {
          setEstado('bajando')
          try {
            await descargar(`/api/v1/indicadores/export?por=${por}`, `puente-salud-indicadores-${por}.csv`)
            setEstado('listo')
          } catch (e) {
            setEstado((e as Error).message)
          }
        }}
      >
        <Icono nombre="descargar" tam={18} />
        {estado === 'bajando' ? 'Preparando…' : (texto ?? `Exportar CSV por ${por === 'ageb' ? 'AGEB' : 'programa'}`)}
      </button>
      {estado !== 'listo' && estado !== 'bajando' && (
        <span className="formulario__error" role="alert">
          {estado}
        </span>
      )}
    </>
  )
}
