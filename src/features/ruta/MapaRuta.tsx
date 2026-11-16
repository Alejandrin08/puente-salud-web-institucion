import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { Ruta } from '../../shared/api/tipos'
import { crearMapa } from '../../shared/ui/mapaBase'
import { token } from '../../shared/lib/tokens'

/** Ruta de visitas: línea recta entre paradas, numeradas en orden. La lista de al lado es la vía accesible. */
export function MapaRuta({ ruta }: { ruta: Ruta }) {
  const caja = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!caja.current) return
    const marcadores: maplibregl.Marker[] = []
    const m = crearMapa(caja.current, (mm) => {
      const coords: [number, number][] = [[ruta.origen.lon ?? 0, ruta.origen.lat ?? 0], ...ruta.paradas.map((p) => [p.lon, p.lat] as [number, number])]
      mm.addSource('ruta', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } })
      mm.addLayer({
        id: 'ruta',
        type: 'line',
        source: 'ruta',
        paint: { 'line-color': token('color-night'), 'line-width': 3, 'line-dasharray': [2, 1.5] },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      })
      marcadores.forEach((x) => x.remove())
      const origen = document.createElement('div')
      origen.className = 'parada parada--origen'
      origen.setAttribute('aria-hidden', 'true')
      marcadores.push(new maplibregl.Marker({ element: origen }).setLngLat(coords[0]).addTo(mm))
      for (const p of ruta.paradas) {
        const el = document.createElement('div')
        el.className = `parada parada--${p.nivel}`
        el.textContent = String(p.orden)
        el.setAttribute('aria-hidden', 'true')
        marcadores.push(new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(mm))
      }
      const b = new maplibregl.LngLatBounds()
      coords.forEach((c) => b.extend(c))
      mm.fitBounds(b, { padding: 56, maxZoom: 15, duration: 0 })
    })
    return () => {
      marcadores.forEach((x) => x.remove())
      m?.remove()
    }
  }, [ruta])
  return <div ref={caja} className="mapa mapa--grande" role="region" aria-label={`Mapa de la ruta con ${ruta.paradas.length} visitas`} />
}
