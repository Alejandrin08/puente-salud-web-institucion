import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function sinViolacionesGraves(page: Page, pantalla: string) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  )
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(graves.map((v) => `${pantalla}: ${v.id} (${v.nodes.length}) ${v.help} → ${v.nodes[0]?.target}`)).toEqual([])
}

async function entrar(page: Page, usuario: string, password: string) {
  await page.goto('/entrar')
  await page.getByLabel('Usuario').fill(usuario)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

const nav = (page: Page) => page.getByRole('navigation', { name: 'Secciones' })

test('personal de salud: lista ordenada, recorrido explicado, desacuerdo, medición y ruta', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/entrar$/)
  await sinViolacionesGraves(page, 'entrar')
  await entrar(page, 'enfermeria.tateposco', 'equivocada')
  await expect(page.getByRole('alert')).toContainText('incorrectos')

  await entrar(page, 'enfermeria.tateposco', 'demo-salud')
  await expect(page.getByRole('heading', { name: 'Seguimiento de pacientes' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Agenda de hoy' })).toBeVisible()
  await expect(page.locator('.tabla tbody tr').first()).toBeVisible()
  await sinViolacionesGraves(page, 'seguimiento')

  // filtro por nivel desde los conteos
  await page.getByRole('button', { name: /Verde/ }).click()
  await expect(page.getByRole('heading', { name: 'Personas en verde' })).toBeVisible()
  await expect(page.locator('.tabla tbody .semaforo--verde').first()).toBeVisible()
  await page.getByRole('button', { name: /Verde/ }).click()

  // recorrido del paciente
  await page.locator('.tabla tbody a').first().click()
  await expect(page).toHaveURL(/\/pacientes\/PS\d{6}$/)
  await expect(page.getByText('Control clínico')).toBeVisible()
  await expect(page.getByText(/Fuente: /).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Evolución del padecimiento' })).toBeVisible()
  await sinViolacionesGraves(page, 'paciente')
  await page.getByRole('button', { name: 'Ver tabla' }).click()
  await expect(page.locator('.figura table')).toBeVisible()

  // desacuerdo queda en bitácora
  await page.getByRole('button', { name: 'No estoy de acuerdo con el nivel' }).click()
  await page.getByLabel('Motivo').fill('Prueba e2e: la persona ya acudió a su unidad')
  await page.getByRole('button', { name: 'Registrar desacuerdo' }).click()
  await expect(page.getByText(/desacuerdo\(s\) registrado/)).toBeVisible()
  await expect(page.getByText('Desacuerdo con el semáforo').first()).toBeVisible()

  // registrar medición con vista previa
  await page.getByRole('button', { name: 'Registrar medición' }).click()
  await expect(page.getByRole('heading', { name: 'Registrar medición' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Paso 1: Persona/ })).toBeVisible()
  const pas = page.getByLabel('Sistólica', { exact: true })
  if (await pas.count()) {
    await pas.fill('150')
    await expect(page.getByText('Captura sistólica y diastólica.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar medición' })).toBeDisabled()
    await page.getByLabel('Diastólica', { exact: true }).fill('95')
  } else {
    await page.getByLabel('Glucosa en ayuno').fill('150')
  }
  await page.getByLabel('Programa y lugar').selectOption('ferias')
  await expect(page.getByText(/fuera de meta/).first()).toBeVisible()
  await sinViolacionesGraves(page, 'medicion')
  await page.getByRole('button', { name: 'Guardar medición' }).click()
  await expect(page.getByRole('heading', { name: 'Medición guardada' })).toBeVisible()

  // ruta de visitas
  await nav(page).getByRole('link', { name: 'Ruta de visitas' }).click()
  await expect(page.getByRole('heading', { name: 'Ruta de visitas' })).toBeVisible()
  await expect(page.locator('.paradas li').first()).toBeVisible()
  await expect(page.getByText(/en línea recta/).first()).toBeVisible()
  await sinViolacionesGraves(page, 'ruta')

  // buscador de folio
  await nav(page).getByRole('link', { name: 'Registrar medición' }).click()
  await page.getByLabel('Nombre o folio').fill('PS0')
  await expect(page.locator('.resultados li').first()).toBeVisible()

  // ruta protegida por rol
  await page.goto('/medicamentos')
  await expect(page.getByText(/no tiene acceso a esta sección/)).toBeVisible()
  await page.goto('/panorama')
  await expect(page.getByText(/no tiene acceso a esta sección/)).toBeVisible()
})

test('autoridad: panorama, zonas con mapa y mortalidad, comparativo y exportación', async ({ page }) => {
  await entrar(page, 'autoridad.rxii', 'demo-autoridad')
  await expect(page.getByRole('heading', { name: 'Panorama de resultados' })).toBeVisible()
  await expect(page.getByText(/llegaron al control/)).toBeVisible()
  await expect(page.getByText('Confirmación del diagnóstico')).toBeVisible()
  await expect(page.getByText('Retención en tratamiento')).toBeVisible()
  await sinViolacionesGraves(page, 'panorama')
  await page.getByRole('button', { name: 'Ver por programa' }).click()
  await expect(page.getByRole('button', { name: 'Ver total' })).toBeVisible()

  const descarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar CSV por programa' }).click()
  expect((await descarga).suggestedFilename()).toBe('puente-salud-indicadores-programa.csv')

  await nav(page).getByRole('link', { name: 'Zonas y contexto' }).click()
  await expect(page.getByRole('heading', { name: 'Resultados por zona y contexto' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Zonas prioritarias' })).toBeVisible()
  await page.locator('label.capa', { hasText: 'Grado de rezago social' }).click()
  await expect(page.getByRole('radio', { name: 'Grado de rezago social' })).toBeChecked()
  await expect(page.getByText('Muy alto', { exact: true })).toBeVisible()
  await page.locator('.tabla tbody .boton-enlace').first().click()
  await expect(page.getByText('Población de 18 años y más')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cifras de 2025' })).toBeVisible()
  await expect(page.getByRole('rowheader', { name: 'Muertes por diabetes' })).toBeVisible()
  await expect(page.getByText('374', { exact: true })).toBeVisible()
  await sinViolacionesGraves(page, 'zonas')
  const agebCsv = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar CSV por AGEB' }).click()
  expect((await agebCsv).suggestedFilename()).toBe('puente-salud-indicadores-ageb.csv')

  await nav(page).getByRole('link', { name: 'Comparativo' }).click()
  await expect(page.getByRole('heading', { name: 'Permanencia en tratamiento' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tiempo a la primera consulta' })).toBeVisible()
  await sinViolacionesGraves(page, 'comparativo')

  // numeralia de medicamentos (informativa)
  await nav(page).getByRole('link', { name: 'Medicamentos' }).click()
  await expect(page.getByRole('heading', { name: 'Medicamentos', level: 1 })).toBeVisible()
  await expect(page.getByText(/no tienen su medicamento cubierto hoy/)).toBeVisible()
  await expect(page.getByRole('rowheader', { name: /Metformina 850 mg/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dónde reforzar el abasto' })).toBeVisible()
  await expect(page.getByRole('rowheader', { name: /San Martín de Las Flores/ })).toBeVisible()
  await sinViolacionesGraves(page, 'medicamentos')
  const medCsv = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar CSV' }).click()
  expect((await medCsv).suggestedFilename()).toBe('puente-salud-medicamentos.csv')

  // la autoridad no ve personas
  await page.goto('/seguimiento')
  await expect(page.getByText(/no tiene acceso a esta sección/)).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/entrar$/)
})
