import type { Nivel } from '../ui/Semaforo'

export type Cita = { fecha: string; hora: string | null; tipo: string; estado: string }

export type PacienteFila = {
  folio: string
  nombre: string
  edad: number
  sexo: string
  enfermedades: string[]
  programa: string
  nivel: Nivel
  resumen: string
  dias_vencida: number
  proxima_cita: Cita | null
}

export type Unidad = { clues: string; nombre: string; institucion?: string | null; lat: number | null; lon: number | null }

export type Resumen = {
  fecha: string
  unidad: Unidad
  total: number
  conteo: Record<Nivel, number>
  prioridades: PacienteFila[]
  agenda: { hora: string | null; folio: string; nombre: string; tipo: string; nivel: Nivel; resumen: string }[]
}

export type Motivo = { dimension: 'clinica' | 'seguimiento' | 'riesgo'; nivel: Nivel; texto: string; fuente: string; dato: string | null }

export type Semaforo = {
  nivel: Nivel
  resumen: string
  motivos: Motivo[]
  dimensiones: Record<string, Nivel>
  requiere_valoracion: boolean
  factores_riesgo: string[]
  dias_vencida: number
  aviso: string
}

export type Medicion = {
  id: number | null
  fecha: string
  pas: number | null
  pad: number | null
  glucosa: number | null
  hba1c: number | null
  programa_id: string | null
  programa: string | null
  otro_programa: boolean
  en_control: boolean | null
}

export type Etapa = { paso: number; clave: string; titulo: string; completada: boolean; fecha: string | null; detalle: string }

export type PacienteDetalle = {
  persona: {
    folio: string
    nombre: string
    curp_simulada: string
    edad: number
    sexo: string
    enfermedades: string[]
    seguridad_social: string | null
    programa_origen: string
    programa_nombre: string
    unidad: Unidad
    cvegeo: string
    rezago: string
    red_apoyo: string | null
    dependencia_social: boolean
    telefono_simulado: string | null
    fecha_deteccion: string
    fecha_confirmacion: string | null
  }
  semaforo: Semaforo
  etapas: Etapa[]
  mediciones: Medicion[]
  tratamientos: { fecha_inicio: string; medicamento: string; indicacion: string }[]
  adherencia: {
    registros: { fecha: string; medicamento: string; dias: number; completo: boolean }[]
    porcentaje_completo: number | null
    dias_desde_ultimo: number | null
    cubierto_hoy: boolean
  }
  citas: Cita[]
  desacuerdos: { id: number; fecha: string; usuario: string; nivel_sugerido: string; nivel_propuesto: string; motivo: string }[]
  consultas_registradas: number
  bitacora: { id: number; fecha: string; usuario: string; rol: string; accion: string; folio: string | null; detalle: Record<string, unknown> }[]
}

export type Parada = {
  orden: number
  folio: string
  nombre: string
  nivel: Nivel
  resumen: string
  lat: number
  lon: number
  distancia_km: number
  minutos_traslado: number
  visita_programada: boolean
}

export type Ruta = {
  fecha: string
  origen: Unidad
  paradas: Parada[]
  distancia_km: number
  minutos_traslado: number
  minutos_total: number
  nota: string
}

export type Cuatro = {
  detectadas: number
  confirmacion_pct: number | null
  confirmacion_num: number
  confirmacion_den: number
  dias_primera_consulta_mediana: number | null
  dias_primera_consulta_n: number
  dias_primera_consulta_p25: number | null
  dias_primera_consulta_p75: number | null
  retencion_6_pct: number | null
  retencion_6_num: number
  retencion_6_den: number
  retencion_12_pct: number | null
  retencion_12_num: number
  retencion_12_den: number
  control_pct: number | null
  control_num: number
  control_den: number
}

export type IndicadoresPrograma = Cuatro & { programa_id: string; programa: string; ambito: string }

export type Indicadores = { fecha_corte: string; total: Cuatro; por_programa: IndicadoresPrograma[]; definiciones: Record<string, string> }

export type PuntoEvolucion = { mes: string; control_pct: number | null; num: number; den: number }

export type Evolucion = { total: PuntoEvolucion[]; por_programa: Record<string, PuntoEvolucion[]>; programas: Record<string, string> }

export type IndicadorAgeb = {
  cvegeo: string
  detectadas: number
  confirmadas: number
  control_pct: number | null
  control_num: number
  confirmacion_pct: number | null
  rezago: string
  pct_sinder: number | null
  prioridad: number | null
  factores: string[]
  suficiente: boolean
}

export type IndicadoresAgeb = { fecha_corte: string; minimo_casos: number; agebs: IndicadorAgeb[]; zonas_prioritarias: IndicadorAgeb[]; nota: string }

export type AgebFeature = {
  type: 'Feature'
  id: string
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] }
  properties: {
    cvegeo: string
    cve_ageb: string
    pobtot: number | null
    p_18ymas: number | null
    psinder_18_est: number | null
    pct_sinder: number | null
    pcon_disc: number | null
    rezago: string
    centro_lat: number
    centro_lon: number
  }
}

export type UnidadMapa = { clues: string; nombre: string; institucion: string; lat: number; lon: number; publica: boolean; asigna_folios: boolean }

export type Mortalidad = {
  series: { causa: 'diabetes' | 'hipertension'; etiqueta: string; serie: { anio: number; defunciones: number; tasa_100k: number | null }[]; por_sexo: Record<string, number>; variacion_pct: number | null; tendencia: 'sube' | 'baja' | 'estable' }[]
  total_defunciones_ultimo_anio: number
  ultimo_anio: number
  poblacion_ref: number
  fuente: string
  nota: string
}
