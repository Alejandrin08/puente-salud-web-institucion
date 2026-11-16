import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { token } from '../lib/tokens'

const ESTILO = (import.meta.env.VITE_MAP_STYLE as string | undefined) ?? 'https://tiles.openfreemap.org/styles/positron'

/** Crea un mapa centrado en Tlaquepaque. Si el mapa base no carga, cae a un fondo liso y las capas siguen. */
export function crearMapa(contenedor: HTMLElement, alCargarEstilo: (m: maplibregl.Map) => void): maplibregl.Map | null {
  let m: maplibregl.Map
  try {
    m = new maplibregl.Map({
      container: contenedor,
      style: ESTILO,
      center: [-103.33, 20.6],
      zoom: 11.6,
      attributionControl: { compact: true, customAttribution: '© OpenStreetMap · OpenFreeMap · INEGI' },
      cooperativeGestures: false,
    })
  } catch {
    return null
  }
  m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
  let respaldo = false
  m.on('error', (e) => {
    if (!respaldo && !m.isStyleLoaded() && /style|fetch|load/i.test(String(e.error?.message ?? ''))) {
      respaldo = true
      m.setStyle({ version: 8, sources: {}, layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': token('color-surface-2') } }] })
    }
  })
  m.on('style.load', () => alCargarEstilo(m))
  // El contenedor puede cambiar de tamaño después de crear el mapa (carga diferida, rejilla): se ajusta solo
  const ro = new ResizeObserver(() => m.resize())
  ro.observe(contenedor)
  m.once('remove', () => ro.disconnect())
  m.once('load', () => m.getContainer().querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show'))
  return m
}
