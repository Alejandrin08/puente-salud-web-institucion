import { useEffect, useState, type ReactNode } from 'react'
import { BuscarFolio } from './pages/BuscarFolio'
import { Comparativo } from './pages/Comparativo'
import { Medicamentos } from './pages/Medicamentos'
import { Entrar } from './pages/Entrar'
import { Paciente } from './pages/Paciente'
import { Panorama } from './pages/Panorama'
import { RegistrarMedicion } from './pages/RegistrarMedicion'
import { RutaVisitas } from './pages/RutaVisitas'
import { Seguimiento } from './pages/Seguimiento'
import { Zonas } from './pages/Zonas'
import { borrarSesion, sesionActual, type Rol, type Sesion } from './shared/api/sesion'
import { navegar, useRuta } from './shared/lib/router'
import { Enlace } from './shared/ui/Enlace'
import { Icono } from './shared/ui/Icono'

type Ruta = { patron: RegExp; rol: Rol; titulo: string; pagina: (m: RegExpMatchArray) => ReactNode }

const RUTAS: Ruta[] = [
  { patron: /^\/seguimiento$/, rol: 'personal_salud', titulo: 'Seguimiento', pagina: () => <Seguimiento /> },
  { patron: /^\/pacientes\/(PS\d{6})$/i, rol: 'personal_salud', titulo: 'Recorrido del paciente', pagina: (m) => <Paciente folio={m[1].toUpperCase()} /> },
  { patron: /^\/pacientes\/(PS\d{6})\/medicion$/i, rol: 'personal_salud', titulo: 'Registrar medición', pagina: (m) => <RegistrarMedicion folio={m[1].toUpperCase()} /> },
  { patron: /^\/medicion$/, rol: 'personal_salud', titulo: 'Registrar medición', pagina: () => <BuscarFolio /> },
  { patron: /^\/ruta$/, rol: 'personal_salud', titulo: 'Ruta de visitas', pagina: () => <RutaVisitas /> },
  { patron: /^\/panorama$/, rol: 'autoridad', titulo: 'Panorama', pagina: () => <Panorama /> },
  { patron: /^\/zonas$/, rol: 'autoridad', titulo: 'Resultados por zona', pagina: () => <Zonas /> },
  { patron: /^\/comparativo$/, rol: 'autoridad', titulo: 'Comparativo por programas', pagina: () => <Comparativo /> },
  { patron: /^\/medicamentos$/, rol: 'autoridad', titulo: 'Medicamentos', pagina: () => <Medicamentos /> },
]

const NAV: Record<Rol, { a: string; texto: string; icono: string }[]> = {
  personal_salud: [
    { a: '/seguimiento', texto: 'Seguimiento', icono: 'semaforo' },
    { a: '/medicion', texto: 'Registrar medición', icono: 'cruz' },
    { a: '/ruta', texto: 'Ruta de visitas', icono: 'ruta' },
  ],
  autoridad: [
    { a: '/panorama', texto: 'Panorama', icono: 'tablero' },
    { a: '/zonas', texto: 'Zonas y contexto', icono: 'mapa' },
    { a: '/comparativo', texto: 'Comparativo', icono: 'comparar' },
    { a: '/medicamentos', texto: 'Medicamentos', icono: 'pastilla' },
  ],
}
const INICIO: Record<Rol, string> = { personal_salud: '/seguimiento', autoridad: '/panorama' }
const ROL: Record<Rol, string> = { personal_salud: 'Personal de salud', autoridad: 'Autoridad' }

export default function App() {
  const ruta = useRuta()
  const [sesion, setSesion] = useState<Sesion | null>(() => sesionActual())
  const coincide = RUTAS.map((r) => ({ r, m: ruta.match(r.patron) })).find((x) => x.m)

  useEffect(() => {
    if (!sesion && ruta !== '/entrar') navegar('/entrar', { reemplazar: true })
    if (sesion && (ruta === '/' || ruta === '/entrar')) navegar(INICIO[sesion.rol], { reemplazar: true })
  }, [sesion, ruta])

  useEffect(() => {
    document.title = `${coincide?.r.titulo ?? 'Entrar'} · Puente Salud`
  }, [coincide])

  if (!sesion || ruta === '/entrar') return <Entrar onEntrar={(s) => setSesion(s)} />

  let contenido: ReactNode
  if (!coincide) contenido = <p className="texto-apoyo">Esta página no existe.</p>
  else if (coincide.r.rol !== sesion.rol)
    contenido = (
      <div className="estado" role="alert">
        <p>Tu rol ({ROL[sesion.rol]}) no tiene acceso a esta sección.</p>
        <Enlace a={INICIO[sesion.rol]} className="enlace-fuerte">
          Ir a mi inicio
        </Enlace>
      </div>
    )
  else contenido = coincide.r.pagina(coincide.m!)

  return (
    <div className="panel-app">
      <a href="#contenido" className="saltar">
        Ir al contenido
      </a>
      <aside className="lateral">
        <div className="lateral__marca">
          <img src="/logo.svg" alt="" width={36} height={36} />
          <span>Puente Salud</span>
        </div>
        <nav aria-label="Secciones">
          <ul>
            {NAV[sesion.rol].map((n) => (
              <li key={n.a}>
                <Enlace a={n.a} className={`lateral__item${ruta === n.a || (n.a === '/seguimiento' && ruta.startsWith('/pacientes') && !ruta.endsWith('/medicion')) || (n.a === '/medicion' && ruta.endsWith('/medicion')) ? ' lateral__item--activo' : ''}`}>
                  <Icono nombre={n.icono} tam={20} />
                  {n.texto}
                </Enlace>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lateral__usuario">
          <p className="lateral__nombre">{sesion.nombre}</p>
          <p className="lateral__rol">
            {ROL[sesion.rol]}
            {sesion.clues && <> · {sesion.clues}</>}
          </p>
          <button
            type="button"
            className="lateral__salir"
            onClick={() => {
              borrarSesion()
              setSesion(null)
              navegar('/entrar', { reemplazar: true })
            }}
          >
            <Icono nombre="salir" tam={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="principal" id="contenido" tabIndex={-1}>
        {contenido}
      </main>
    </div>
  )
}

