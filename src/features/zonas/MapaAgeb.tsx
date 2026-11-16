import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { AgebFeature, UnidadMapa } from '../../shared/api/tipos'
import { crearMapa } from '../../shared/ui/mapaBase'
import { ESCALA_MAPA, token } from '../../shared/lib/tokens'

export type Clasificado = { clase: number | null; etiqueta: string }

/**
 * Coroplético por AGEB (234 AGEB reales de Tlaquepaque). Indicador visual: la tabla y el ranking
 * de la misma pantalla son la alternativa accesible.
 */
export function MapaAgeb({
  agebs,
  clasificar,
  unidades,
  seleccion,
  onSeleccionar,
  etiqueta,
}: {
  agebs: AgebFeature[]
  clasificar: (cvegeo: string) => Clasificado
  unidades: UnidadMapa[] | null
  seleccion: string | null
  onSeleccionar: (cvegeo: string) => void
  etiqueta: string
}) {
  const caja = useRef<HTMLDivElement>(null)
  const mapa = useRef<maplibregl.Map | null>(null)
  const listo = useRef(false)
  const datos = useRef({ agebs, clasificar, unidades, seleccion })
  datos.current = { agebs, clasificar, unidades, seleccion }

  function geo() {
    const { agebs: a, clasificar: c, seleccion: s } = datos.current
    return {
      type: 'FeatureCollection' as const,
      features: a.map((f) => {
        const k = c(f.id)
        return { ...f, properties: { ...f.properties, clase: k.clase ?? -1, sel: f.id === s ? 1 : 0, txt: k.etiqueta } }
      }),
    }
  }

  function geoUnidades() {
    return {
      type: 'FeatureCollection' as const,
      features: (datos.current.unidades ?? []).map((u) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [u.lon, u.lat] },
        properties: { nombre: u.nombre, folios: u.asigna_folios ? 1 : 0 },
      })),
    }
  }

  useEffect(() => {
    if (!caja.current) return
    const m = crearMapa(caja.current, (mm) => {
      const esc = ESCALA_MAPA()
      mm.addSource('ageb', { type: 'geojson', data: geo() })
      mm.addLayer({
        id: 'ageb-relleno',
        type: 'fill',
        source: 'ageb',
        paint: {
          'fill-color': ['match', ['get', 'clase'], 0, esc[0], 1, esc[1], 2, esc[2], 3, esc[3], 4, esc[4], token('mapa-sin-dato')],
          'fill-opacity': 0.78,
        },
      })
      mm.addLayer({ id: 'ageb-borde', type: 'line', source: 'ageb', paint: { 'line-color': token('color-surface'), 'line-width': 0.6 } })
      mm.addLayer({
        id: 'ageb-sel',
        type: 'line',
        source: 'ageb',
        filter: ['==', ['get', 'sel'], 1],
        paint: { 'line-color': token('color-night'), 'line-width': 3 },
      })
      mm.addSource('unidades', { type: 'geojson', data: geoUnidades() })
      mm.addLayer({
        id: 'unidades',
        type: 'circle',
        source: 'unidades',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'folios'], 1], 6, 4],
          'circle-color': token('color-surface'),
          'circle-stroke-color': token('color-night'),
          'circle-stroke-width': ['case', ['==', ['get', 'folios'], 1], 2.5, 1.5],
        },
      })
      listo.current = true
      const b = new maplibregl.LngLatBounds()
      datos.current.agebs.forEach((f) => b.extend([f.properties.centro_lon, f.properties.centro_lat]))
      if (!b.isEmpty()) mm.fitBounds(b, { padding: 24, duration: 0 })
    })
    if (!m) return
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'popup' })
    m.on('mousemove', 'ageb-relleno', (e) => {
      const f = e.features?.[0]
      if (!f) return
      m.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(e.lngLat).setText(`AGEB ${f.properties?.cve_ageb}: ${f.properties?.txt}`).addTo(m)
    })
    m.on('mouseleave', 'ageb-relleno', () => {
      m.getCanvas().style.cursor = ''
      popup.remove()
    })
    m.on('click', 'ageb-relleno', (e) => {
      const id = e.features?.[0]?.properties?.cvegeo
      if (id) onSeleccionar(String(id))
    })
    mapa.current = m
    return () => {
      listo.current = false
      m.remove()
      mapa.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = mapa.current
    if (!m || !listo.current) return
    ;(m.getSource('ageb') as maplibregl.GeoJSONSource | undefined)?.setData(geo())
    ;(m.getSource('unidades') as maplibregl.GeoJSONSource | undefined)?.setData(geoUnidades())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agebs, clasificar, unidades, seleccion])

  return <div ref={caja} className="mapa mapa--grande" role="region" aria-label={etiqueta} />
}
