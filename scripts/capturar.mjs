// Capturas de revisión visual (no son pruebas). Uso: node scripts/capturar.mjs [url-base] [carpeta] [ancho]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:5174'
const OUT = process.argv[3] ?? 'capturas'
const ANCHO = Number(process.argv[4] ?? 1440)
mkdirSync(OUT, { recursive: true })

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: ANCHO, height: 900 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
const ir = async (ruta, espera = 800) => {
  await page.evaluate((r) => {
    window.history.pushState(null, '', r)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, ruta)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(espera)
}
const foto = (n) => page.screenshot({ path: `${OUT}/${ANCHO}-${n}.png`, fullPage: true })
const entrar = async (u, p) => {
  await page.goto(`${BASE}/entrar`)
  await page.getByLabel('Usuario').fill(u)
  await page.getByLabel('Contraseña').fill(p)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
}

await page.goto(`${BASE}/entrar`)
await foto('0-entrar')
await entrar('enfermeria.tateposco', 'demo-salud')
await foto('1-seguimiento')
const folio = (await page.locator('.tabla tbody a').first().getAttribute('href')).split('/').pop()
await ir(`/pacientes/${folio}`)
await foto('2-paciente')
await ir(`/pacientes/${folio}/medicion`)
await page.getByLabel('Sistólica', { exact: true }).fill('172').catch(() => {})
await page.getByLabel('Diastólica', { exact: true }).fill('101').catch(() => {})
await page.getByLabel('Glucosa en ayuno').fill('112').catch(() => {})
await foto('3-medicion')
await ir('/ruta', 3000)
await foto('4-ruta')
await page.getByRole('button', { name: 'Cerrar sesión' }).click()
await entrar('autoridad.rxii', 'demo-autoridad')
await foto('5-panorama')
await ir('/zonas', 3500)
await foto('6-zonas')
await ir('/comparativo')
await foto('7-comparativo')
await ir('/medicamentos', 1200)
await foto('8-medicamentos')
await b.close()
console.log('capturas en', OUT, 'folio', folio)
