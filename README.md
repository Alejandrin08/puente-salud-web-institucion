<p align="center"><img src="public/logo.svg" alt="Logo de Puente Salud" width="72" /></p>

# Puente Salud · panel institucional

Panel web (escritorio primero, utilizable en tableta) con **un solo sistema y dos roles**: `personal_salud` y `autoridad`. Las rutas se protegen por rol en el frontend y el gateway vuelve a comprobar el rol en cada petición. Las instrucciones completas están en el [README principal del backend](../puente-salud-backend/README.md).

## Pantallas
| Rol | Pantalla | Ruta |
|---|---|---|
| Personal de salud | Seguimiento de pacientes (conteo por nivel, prioridades con motivo, agenda del día) | `/seguimiento` |
| Personal de salud | Recorrido del paciente (semáforo explicado con fuente, desacuerdo, evolución, surtido, bitácora) | `/pacientes/:folio` |
| Personal de salud | Registrar medición (vista previa contra la NOM, mediciones de otros programas) | `/medicion`, `/pacientes/:folio/medicion` |
| Personal de salud | Ruta de visitas (mapa, distancia en línea recta, tiempo aproximado) | `/ruta` |
| Autoridad | Panorama (4 indicadores, resultado por programa, evolución del control) | `/panorama` |
| Autoridad | Resultados por zona y contexto (mapa de 234 AGEB, capas, ranking, mortalidad) | `/zonas` |
| Autoridad | Comparativo por programas (permanencia y tiempo a la primera consulta) | `/comparativo` |

Todos los gráficos y mapas tienen alternativa en tabla («Ver tabla») y exportación CSV.

## Cuentas de demostración
| Usuario | Contraseña | Rol |
|---|---|---|
| `enfermeria.tateposco` | `demo-salud` | Personal de salud (C. S. San José Tateposco) |
| `medicina.lasjuntas` | `demo-salud` | Personal de salud (C. S. Las Juntas) |
| `autoridad.rxii` | `demo-autoridad` | Autoridad (Región Sanitaria XII) |

## Desarrollo y pruebas
```
cp .env.example .env
npm install
npm run dev          # http://localhost:5174
npm test             # unitarias (Vitest)
npm run test:e2e     # Playwright + axe, con el sistema levantado
```

## Despliegue (Vercel)
`VITE_API_URL` = URL pública del gateway. `vercel.json` reescribe las rutas de la SPA. Ver `docs/despliegue.md` en el backend.
