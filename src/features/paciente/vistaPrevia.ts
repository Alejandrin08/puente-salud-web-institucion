/**
 * Vista previa de la medición antes de guardar (prevención de errores, Nielsen).
 * Replica los cortes del Anexo D.1; la regla que manda es la del servidor.
 */
export type Valores = { pas?: number; pad?: number; glucosa?: number; hba1c?: number }
export type Aviso = { tono: 'ok' | 'alerta' | 'grave' | 'error'; texto: string }

export function vistaPrevia(v: Valores, enfermedades: string[]): Aviso[] {
  const out: Aviso[] = []
  const conDm = enfermedades.includes('diabetes')
  const tienePa = v.pas != null || v.pad != null
  if (tienePa) {
    if (v.pas == null || v.pad == null) out.push({ tono: 'error', texto: 'Captura sistólica y diastólica.' })
    else if (v.pas <= v.pad) out.push({ tono: 'error', texto: 'La sistólica debe ser mayor que la diastólica.' })
    else if (v.pas < 50 || v.pas > 300 || v.pad < 30 || v.pad > 200) out.push({ tono: 'error', texto: 'Revisa la presión: valor fuera de rango.' })
    else if (v.pas > 180 || v.pad > 110) out.push({ tono: 'grave', texto: `Presión ${v.pas}/${v.pad}: mayor de 180/110 (NOM-030, 6.1). El semáforo la marcará en rojo.` })
    else {
      const [ms, md] = conDm ? [130, 80] : [140, 90]
      const ok = v.pas < ms && v.pad < md
      out.push({ tono: ok ? 'ok' : 'alerta', texto: `Presión ${v.pas}/${v.pad}: ${ok ? 'en meta' : 'fuera de meta'} (menor de ${ms}/${md}).` })
    }
  }
  if (v.hba1c != null) {
    if (v.hba1c < 3 || v.hba1c > 20) out.push({ tono: 'error', texto: 'Revisa la HbA1c: valor fuera de rango (3 a 20%).' })
    else out.push({ tono: v.hba1c < 7 ? 'ok' : 'alerta', texto: `HbA1c ${v.hba1c}%: ${v.hba1c < 7 ? 'en meta' : 'fuera de meta'} (menor de 7%).` })
  }
  if (v.glucosa != null) {
    if (v.glucosa < 20 || v.glucosa > 700) out.push({ tono: 'error', texto: 'Revisa la glucosa: valor fuera de rango.' })
    else if (v.glucosa < 70) out.push({ tono: 'grave', texto: `Glucosa ${v.glucosa} mg/dl: baja. Requiere valoración del personal.` })
    else {
      const ok = v.glucosa <= 130
      out.push({ tono: ok ? 'ok' : 'alerta', texto: `Glucosa en ayuno ${v.glucosa} mg/dl: ${ok ? 'en meta' : 'fuera de meta'} (70 a 130).` })
    }
  }
  return out
}

export const hayError = (a: Aviso[]) => a.some((x) => x.tono === 'error')
