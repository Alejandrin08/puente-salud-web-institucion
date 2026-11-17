/** Íconos propios: trazo 2px, esquinas redondeadas, 24×24. Decorativos por defecto (aria-hidden). */
const TRAZOS: Record<string, string> = {
  inicio: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z',
  recorrido: 'M5 19c0-8 14-8 14-14M5 19h0M19 5h0M5 19a1.6 1.6 0 1 0 0 .01M19 5a1.6 1.6 0 1 0 0 .01',
  mapa: 'M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14',
  alarma: 'M12 4.5 2.8 19.5h18.4zM12 10v4.5M12 17.3v.2',
  telefono: 'M5 4h3.5l1.5 4-2.2 1.4a11 11 0 0 0 6.8 6.8L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  atras: 'M19 12H5M11 6l-6 6 6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.6v.2',
  lista: 'M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0',
  salir: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10',
  calendario: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  texto: 'M4 18 8.5 6 13 18M5.6 14h5.8M15 18l2.8-7.5L20.6 18M16 15.8h3.6',
  hospital: 'M4 21V7l8-4 8 4v14M9.5 21v-5h5v5M12 7.5v5M9.5 10h5',
  cruz: 'M12 5v14M5 12h14',
  descargar: 'M12 4v11M7 10.5l5 5 5-5M5 19.5h14',
  semaforo: 'M8 3h8v18H8zM12 7.2v.1M12 12v.1M12 16.8v.1',
  ruta: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h6M18 9v6a4 4 0 0 1-4 4H8',
  tablero: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  comparar: 'M4 7h10M4 12h16M4 17h7',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  gota: 'M12 3.5s6 6.6 6 10.9a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5z',
  latido: 'M3 12h4l2-5 4 10 2-5h6',
  sincronizar: 'M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4',
  pastilla: 'M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7zM7 10l7 7',
  chispa: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  escudo: 'M12 3.5 5 6v5.5c0 4.3 3 7.8 7 9 4-1.2 7-4.7 7-9V6zM9 12l2.2 2.2L15.5 10',
}

export function Icono({ nombre, tam = 24, titulo }: { nombre: keyof typeof TRAZOS | string; tam?: number; titulo?: string }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      focusable="false"
      className="icono"
    >
      <path d={TRAZOS[nombre] ?? TRAZOS.info} />
    </svg>
  )
}
