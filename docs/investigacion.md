# Puente Salud

## Resumen

En Jalisco, la mortalidad por diabetes alcanza 64.3 por cada 100 mil habitantes y, en México, solo una de cada cuatro personas diagnosticadas logra controlarla. En Tlaquepaque, varios programas detectan diabetes e hipertensión, pero operan en paralelo, con registros separados y sin medir cuántas personas alcanzan el control. El objetivo fue diseñar un producto mínimo viable de Puente Salud, una herramienta digital que apoye la continuidad de la atención de las personas detectadas. La investigación, descriptiva y de diseño, tuvo tres etapas. Primero, una revisión multivocal seleccionó 13 de 53 fuentes sobre dónde se pierden las personas y qué seguimiento funciona. Después se integraron cinco fuentes públicas del INEGI, CONEVAL y CLUES para caracterizar ambas enfermedades y ubicar zonas de mayor rezago y menor acceso; con base en la NOM-015-SSA2-2010 y la NOM-030-SSA2-2009, se definieron los datos mínimos y las reglas de un semáforo de seguimiento. Finalmente, el prototipo se desarrolló de forma iterativa e incremental con diseño centrado en el usuario: definición de usuarios y requerimientos, diseño de pantallas en Figma e implementación con herramientas gratuitas y pacientes simulados; el riesgo de abandono se simuló con reglas, sin entrenar un modelo de IA. La revisión mostró que la pérdida ocurre después de la detección: solo 5.47% de los tamizados por MIDO se vinculó con su centro de salud, y el registro nominal y los promotores superan a los mensajes aislados. El prototipo conecta los registros de cada programa sin reemplazarlos, mediante HL7 FHIR; prioriza el seguimiento con un semáforo explicable que deja la decisión al personal y calcula cuatro indicadores de éxito por programa. Un hallazgo relevante fue la falta de datos públicos sobre el seguimiento en Tlaquepaque; por ello, Puente Salud puede contribuir a generar información para la toma de decisiones sobre cuántas personas logran un control adecuado.

## 1. Introducción

Este trabajo aborda la continuidad de la atención de las personas con diabetes tipo 2 e hipertensión arterial en San Pedro Tlaquepaque, Jalisco. Ahí, varios programas de detección operan en paralelo con registros que no se comunican entre sí, lo que impide saber si una persona detectada recibe seguimiento y cuántas alcanzan el control. Esta pérdida de información, sumada a la escasez de personal médico en la Región Sanitaria XII, motivó el diseño de Puente Salud, una herramienta digital centrada en la persona. Su principal limitación es que el prototipo se verifica con datos públicos y simulados, sin validación en campo.

El documento se organiza en seis secciones: planteamiento del problema, contexto teórico, metodología, resultados, discusión y conclusiones.

### 1.1 Problema

La diabetes y la hipertensión están entre las principales cargas de enfermedad prevenible en Jalisco. La mortalidad por diabetes alcanza 64.3 por cada 100 mil habitantes y, en el Área Metropolitana de Guadalajara (AMG), estas enfermedades afectan al 13.4% y 17.7% de la población, respectivamente (Coparmex Jalisco, 2026). En México, una de cada tres personas con diabetes desconoce su diagnóstico y solo 25.8% de quienes lo conocen la controla (Basto-Abreu et al., 2024). Quienes carecen de seguridad social suelen diagnosticarse tardíamente (Reyes-García et al., 2025).

En Tlaquepaque, el reto no es detectar, sino dar continuidad a la atención. Operan en paralelo las ferias de salud, Médicas y Médicos de Jalisco en tu Hogar —20,965 personas atendidas en el primer semestre de 2025 (Jalisco TV, 2025)—, las Caravanas municipales y Salud Casa por Casa, que lleva su propio expediente (N+, 2025). A esta fragmentación se suman las brechas tecnológicas entre niveles de atención (OPD SSJ, 2025) y las dificultades para acceder a la información pública (Jalisco Cómo Vamos et al., 2025). Por ello, una detección puede no traducirse en seguimiento.

Además, la Región Sanitaria XII tiene la menor tasa de médicos públicos de las regiones evaluadas (0.14 por cada mil habitantes) y los tiempos de espera son el aspecto peor calificado del servicio. Uno de cada cinco habitantes del AMG recurre a servicios privados (Jalisco Cómo Vamos et al., 2025), lo que se asocia con un menor uso de los públicos (Colchero et al., 2020). Por último, las bases de datos incompletas y la adscripción poco clara de 41 campañas preventivas realizadas en 2023 impiden evaluar sus resultados (Jalisco Cómo Vamos et al., 2025). Los reportes cuentan personas atendidas, no cuántas alcanzan el control.

### 1.2 Objetivos

#### 1.2.1 General

Diseñar un producto mínimo viable de Puente Salud, una herramienta digital para San Pedro Tlaquepaque, mediante el análisis de evidencia documental, datos públicos oficiales y criterios clínicos, con el fin de apoyar la continuidad de la atención de las personas con diabetes e hipertensión detectadas por los programas de salud.

#### 1.2.2 Específicos

1. Analizar, mediante una revisión de literatura multivocal, en qué etapas del proceso de atención se pierden las personas con diabetes e hipertensión y qué estrategias de seguimiento son efectivas.
2. Integrar cinco conjuntos de datos oficiales (defunciones del INEGI, Censo 2020 por AGEB, Marco Geoestadístico, rezago social de CONEVAL y CLUES) para caracterizar la diabetes y la hipertensión en Tlaquepaque e identificar las zonas con mayor rezago y menor acceso a unidades de salud.
3. Definir los datos mínimos del recorrido de la persona y las reglas del semáforo de seguimiento con base en la NOM-015-SSA2-2010 y la NOM-030-SSA2-2009.
4. Desarrollar un prototipo funcional con las tres piezas de Puente Salud (integración del recorrido, semáforo basado en reglas y tablero de impacto por programa) y la app de la persona, usando solo herramientas y datos gratuitos y públicos.

### 1.3 Supuesto metodológico

Al ser un trabajo descriptivo y de diseño que no mide el efecto de la herramienta en personas reales, se plantea un supuesto metodológico en lugar de una hipótesis. El supuesto es que integrar de forma gradual, con un conjunto mínimo de datos, los registros que hoy generan por separado los programas de detección permite reconstruir el recorrido de cada persona, priorizar su seguimiento con criterios explicables y medir el resultado de cada programa.

**Pregunta rectora.** ¿Cómo puede una herramienta digital de integración gradual entre programas de salud apoyar la continuidad de la atención de las personas con diabetes e hipertensión detectadas en Tlaquepaque, desde la detección hasta el control?

**Pregunta complementaria 1.** ¿En qué etapas del proceso de atención se pierden estas personas, qué factores se asocian y qué estrategias de seguimiento mejoran la continuidad y el control?

**Pregunta complementaria 2.** ¿Qué datos mínimos, reglas de priorización y principios éticos y técnicos necesita la herramienta para ordenar el seguimiento y medir el resultado de cada programa?

### 1.4 Justificación

Cada persona que se pierde entre la detección y el control enfrenta complicaciones evitables y mayores gastos. Los hogares con adultos mayores soportan los mayores gastos de bolsillo, sobre todo en medicamentos (Oliva et al., 2026). Los recordatorios aislados tienen poco efecto (Mokaya et al., 2022; Van Olmen et al., 2017), mientras que el seguimiento con registros nominales mejora el control de la diabetes en México (Lozano et al., 2021). El problema no es la falta de contacto, sino la ausencia de una visión integral del recorrido de cada paciente.

Integrar la información entre instituciones reduce procedimientos duplicados, costos y riesgos para los pacientes (Menachemi et al., 2018), pero en México la diversidad de sistemas lo ha impedido (Morales-Rocha et al., 2020). Uruguay demuestra que no se requiere un expediente único: con un modelo federado y una adopción gradual, incorporó documentos clínicos del 95% de su población a una plataforma compartida (Friedmann y Caredio, 2022). Sin información integrada no es posible saber qué programas funcionan ni dónde invertir. Ante la escasez de médicos, priorizar a quienes enfrentan más barreras es también una cuestión de equidad. La inteligencia artificial puede anticipar el abandono del tratamiento, siempre que sea explicable y opere bajo supervisión humana (OMS, 2021).

## 2. Contexto teórico

### 2.1 El proceso de atención en enfermedades crónicas

El proceso de atención describe las etapas que una persona debe recorrer para controlar su enfermedad: detección, diagnóstico, tratamiento y control. En cada etapa se pierde parte de la población. Además del bajo control de la diabetes descrito antes, en hipertensión 62.9% de los adultos afectados tiene diagnóstico, pero solo 60.1% de quienes reciben tratamiento la controla (Campos-Nonato et al., 2025). Este marco permite ubicar y medir dónde se rompe la atención.

### 2.2 Seguimiento y registro nominal de pacientes

Un registro nominal identifica a cada persona y su avance en el proceso, en lugar de contar atenciones. En México, el modelo CASALUD, que buscó pasar de registros en papel a sistemas nominales (Tapia-Conyer et al., 2017), se asoció con más control de la diabetes, aunque solo 5.47% de las personas tamizadas se vinculó con su centro de salud (Lozano et al., 2021). Los promotores de salud mejoraron la presión, la vinculación y la adherencia (Mbuthia et al., 2022), mientras que los mensajes de texto aislados muestran efectos pequeños o nulos (Mokaya et al., 2022; Van Olmen et al., 2017).

### 2.3 Interoperabilidad y modelos federados

La interoperabilidad es la capacidad de distintos sistemas para intercambiar información. En México, muchos expedientes cumplen la NOM-024-SSA3-2012 y aun así no interactúan entre sí (Morales-Rocha et al., 2020). Los modelos federados conectan a las instituciones sin centralizar sus datos y se adoptan por etapas, como en Uruguay (Friedmann y Caredio, 2022) y en Tanzania, cuya capa de interoperabilidad hoy opera el gobierno (Nsaghurwe et al., 2021).

### 2.4 Inteligencia artificial explicable y supervisión humana

Omitir la explicabilidad en las herramientas que apoyan decisiones de salud pone en riesgo valores éticos centrales de la atención (Amann et al., 2020). La OMS (2021) establece que la IA debe ser transparente y comprensible y que las personas deben conservar el control de las decisiones médicas. Por ello, el semáforo de Puente Salud orienta al personal, pero no decide.

## 3. Metodología

**Enfoque.** La investigación es descriptiva y de diseño. Combina una revisión documental, la integración de datos públicos y un prototipo con pacientes simulados, en tres etapas que corresponden a los objetivos.

**Áreas de conocimiento.**

1. **Salud pública:** el proceso de atención y los criterios clínicos del semáforo (NOM-015 y NOM-030).
2. **Ciencia de datos:** el cruce de fuentes oficiales, los pacientes simulados y los indicadores por programa.
3. **Ingeniería de software e interoperabilidad:** el prototipo y su capa federada con HL7 FHIR, que conecta los registros sin reemplazarlos.
4. **Ética y protección de datos:** el consentimiento, el acceso por rol, la equidad en la priorización y la supervisión humana de la IA.

**Revisión de literatura multivocal (objetivo 1).** Se siguieron las guías de Garousi et al. (2019), que incluyen literatura gris además de la académica. Se formularon cuatro preguntas de investigación y siete cadenas de búsqueda, cinco académicas y dos de literatura gris, complementadas con seis búsquedas en sitios institucionales. Tras eliminar duplicados, los 53 candidatos se filtraron en cuatro etapas con criterios de inclusión, exclusión y calidad, con un mínimo de 4 sobre 6. De cada una de las 13 fuentes seleccionadas se extrajo una cita textual, y los hallazgos se integraron mediante síntesis narrativa (Popay et al., 2006).

**Integración de datos y definición de reglas (objetivos 2 y 3).** Se integraron las defunciones registradas del INEGI, el Censo 2020 por AGEB, el Marco Geoestadístico, el rezago social de CONEVAL y el catálogo CLUES. El Censo, el Marco Geoestadístico y el rezago social se unieron por la clave geoestadística de la AGEB, y las defunciones se usaron a nivel municipal. Como el CLUES no incluye coordenadas, las unidades se ubicaron de forma aproximada y se rotularon así. Los pacientes simulados se parametrizaron con las prevalencias y tasas publicadas a partir de la Ensanut, representativa solo por región. Las reglas del semáforo se tomaron de los valores de control y de alarma de ambas NOM, junto con las definiciones operativas de abandono, pérdida en la confirmación y riesgo de abandono.

**Desarrollo del prototipo (objetivo 4).** Con los requisitos de la revisión y las reglas anteriores se construyó el prototipo con herramientas gratuitas y pacientes simulados, sin evaluarlo con usuarios ni en campo.

## 4. Resultados

**Revisión de literatura (objetivo 1).** La revisión seleccionó 13 de 53 fuentes y respondió las cuatro preguntas de investigación. Sobre dónde se pierden las personas (PI1), la pérdida ocurre después de la detección: solo 5.47% de las personas tamizadas por el programa MIDO se vinculó con su centro de salud (Lozano et al., 2021) y solo 25.8% de quienes conocen su diagnóstico de diabetes logra el control (Basto-Abreu et al., 2024). Sobre qué seguimiento funciona (PI2), el registro nominal se asoció con más control (Lozano et al., 2021) y los promotores mejoraron la adherencia (Mbuthia et al., 2022), mientras que los mensajes de texto no tuvieron efecto adicional (Van Olmen et al., 2017). Sobre las condiciones para la IA (PI3), las fuentes exigen que explique sus razones y que la decisión sea humana (Amann et al., 2020; OMS, 2021). Sobre Jalisco (PI4), el control glucémico regional es menor de 30% (Reyes-García et al., 2025) y falta personal médico (Jalisco Cómo Vamos et al., 2025); ninguna fuente reporta cuántas personas detectadas en Tlaquepaque llegan al control.

**Diseño de la solución.** Cada pieza de Puente Salud responde a un hallazgo. Como la pérdida ocurre entre la detección y el seguimiento (PI1), la integración del recorrido conecta lo que ya registra cada programa sin reemplazar sus sistemas, siguiendo el modelo federado y por etapas de Uruguay (Friedmann y Caredio, 2022). Como el registro nominal funciona y los recordatorios aislados no (PI2), y como la IA debe explicar y no decidir (PI3), el semáforo de seguimiento ordena a quién buscar primero, explica cada prioridad y deja la decisión al personal. Como no existe el dato de cuántas personas llegan al control (PI4), el tablero de impacto mide cuántas personas lleva cada programa al control.

Puente Salud incorpora la ética desde su diseño. En privacidad, cada programa conserva sus datos, solo se comparte un conjunto mínimo y cada usuario ve lo que necesita según su rol; la autoridad solo ve datos agregados. En consentimiento, la información se comparte solo con la autorización de la persona, y los datos sensibles, como vivir solo o tener una discapacidad, son opcionales. En equidad, el semáforo considera el rezago social de la zona para priorizar a quien enfrenta más barreras, y el modelo de IA se revisará para que no discrimine por sexo, edad o colonia. En responsabilidad, el OPD Servicios de Salud Jalisco es el responsable del tratamiento de los datos, la decisión es siempre del personal y cada sugerencia queda registrada para auditarla.

**Datos y reglas (objetivos 2 y 3).** El tablero de contexto integra las fuentes oficiales y muestra para Tlaquepaque la mortalidad municipal por diabetes e hipertensión (cifras y tendencia 2023–2025), la población de 18 años y más sin afiliación por AGEB, el grado de rezago social y la ubicación aproximada de las unidades de salud. Las reglas del semáforo combinan los valores de control y de alarma de ambas normas con tres definiciones operativas: abandono (sin consulta de control en 12 meses), pérdida en la confirmación y riesgo de abandono.

**Prototipo (objetivo 4).** El prototipo funcional incluye las tres piezas de Puente Salud y la app de la persona. Registra el recorrido de cada persona entre programas, le asigna un nivel de semáforo con la explicación de su prioridad y calcula por programa los cuatro indicadores de éxito: confirmación del diagnóstico, días a la primera consulta, retención a 6 y 12 meses y personas en control. Además, ofrece a la autoridad una numeralia informativa del surtido de medicamentos, contrastada con datos abiertos de recetas surtidas del ISSSTE. No se evaluó con personas ni con datos reales; su validación queda como trabajo futuro.

## 5. Discusiones

Los resultados confirman que el problema es de continuidad y no de detección, lo que justifica una solución centrada en el seguimiento. Sin embargo, la evidencia tiene límites: el dato de vinculación proviene de un solo programa, las dos fuentes sobre registro nominal comparten autores y su relación con el control es una asociación, no un efecto demostrado. Ninguna fuente evalúa un semáforo de priorización como el propuesto, y una lista ordenada no sustituye la falta de personal, solo ayuda a usarlo mejor; su utilidad debe probarse en un piloto.

La viabilidad de la propuesta depende principalmente de que las instituciones de salud acepten conectar sus registros con Puente Salud. Cada institución podría enlazar su plataforma, en caso de tenerla, sin cambiar su forma de trabajar: cada programa conservaría su información y compartiría solo los pocos datos necesarios para dar seguimiento a la persona, buscando apegarse a la norma oficial mexicana sobre intercambio de información en salud (NOM-024-SSA3-2012). Los programas que no cuenten con un sistema propio podrían registrar directamente en Puente Salud. Sumar a las instituciones poco a poco, empezando con un piloto en el municipio, podría reducir costos y riesgos, como ocurrió en Uruguay y Tanzania (Friedmann y Caredio, 2022; Nsaghurwe et al., 2021). Aun así, los principales retos no serían técnicos, sino los acuerdos entre instituciones, la brecha digital y la calidad de los registros.

## 6. Conclusión

El trabajo partió del supuesto de que, en Tlaquepaque, las personas con diabetes o hipertensión se pierden no por falta de detección, sino porque la información de cada detección no da continuidad a su atención. La evidencia respalda este supuesto a nivel nacional y regional, pero no pudo comprobarse en el municipio porque los datos necesarios no son públicos. Esa ausencia es en sí un hallazgo: sin un registro que siga a cada persona, nadie puede saber qué programa lleva a la gente al control. En respuesta a la pregunta rectora, una herramienta de integración gradual apoya la continuidad al conectar el recorrido de cada persona sin reemplazar sistemas, ordenar el seguimiento con criterios explicables y medir qué programa lleva a más personas al control.

La importancia del proyecto está en cambiar la pregunta de las instituciones: de cuántas personas se atendieron a cuántas llegaron al control. Puente Salud propone hacerlo sin crear instituciones ni reemplazar sistemas, con una IA que explica sus razones y deja la decisión al personal.

### 6.1 Trabajo a futuro

El primer paso es validar Puente Salud con un piloto en las Caravanas de Salud y en uno o dos centros de salud de la Región Sanitaria XII, acordando con la Secretaría de Salud Jalisco el conjunto mínimo de datos y los plazos de seguimiento. En ese piloto se medirían los cuatro indicadores propuestos: confirmación del diagnóstico, días a la primera consulta, retención a 6 y 12 meses y control por programa. Solo con datos reales se entrenaría el modelo de riesgo de abandono, verificando antes que no discrimine por sexo, edad o colonia.

Después, la solución puede escalar sin rediseñarse, porque cada nueva institución solo se conecta a la capa de integración. Podría extenderse a otros municipios de Jalisco, a programas federales y hospitales, y a otras enfermedades crónicas con el mismo proceso de atención, como la enfermedad renal crónica. A mayor escala, un registro único de seguimiento evitaría capturar dos veces los mismos datos y duplicar estudios (Menachemi et al., 2018). También permitiría que el historial acompañe a la persona aunque cambie de programa o de municipio, y le daría al estado una medición comparable de qué estrategias llevan a más personas al control.

## 7. Bibliografía

Amann, J., Blasimme, A., Vayena, E., Frey, D. y Madai, V. I. (2020). Explainability for artificial intelligence in healthcare: A multidisciplinary perspective. *BMC Medical Informatics and Decision Making, 20*, 310. https://doi.org/10.1186/s12911-020-01332-6

Basto-Abreu, A., Reyes-García, A., Stern, D., Torres-Ibarra, L., Rojas-Martínez, R., Aguilar-Salinas, C. A., Romero-Martínez, M., Campos-Nonato, I., López-Ridaura, R. y Barrientos-Gutiérrez, T. (2024). Cascadas de tamizaje y atención de la diabetes tipo 2 en México. *Salud Pública de México, 66*(4), 528-536. https://doi.org/10.21149/16209

Campos-Nonato, I., Monterrubio-Flores, E., Ramírez-Villalobos, D., Arias-Mendoza, M. A., Gómez-Álvarez, E., Alcocer-Díaz-Barreiro, L., Basto-Abreu, A., Reyes-García, A., Medina-García, C., Hernández-Barrera, L. y Barquera, S. (2025). Hipertensión arterial en adultos y brechas de atención a nivel nacional y estatal, Ensanut 2021-2024. *Salud Pública de México, 67*(6), 633-643. https://doi.org/10.21149/17102

Jalisco Cómo Vamos, Coparmex Jalisco y Tecnológico de Monterrey. (2025). *Monitoreo al Sistema de Salud Jalisco* (1.ª ed.). https://jaliscocomovamos.org/monitoreo-del-sistema-de-salud/

Lozano, R., Razo, C., Suárez-Idueta, L., Martinez-Juarez, L. A., Tapia-Conyer, R., Gallardo-Rincón, H., Montoya, A., Saucedo-Martínez, R. y Mújica-Rosales, R. (2021). Integrated Measurement for Early Detection (MIDO) as a digital strategy for timely assessment of non-communicable disease profiles and factors associated with unawareness and control. *BMJ Open, 11*(9), e049836. https://doi.org/10.1136/bmjopen-2021-049836
