# Guía anterior — arranque actualizado

Para iniciar workers usar [dispatch.md](dispatch.md), que reemplaza el orden y prompts anteriores. Terra High prepara la base; después Luna Max en dos worktrees. La guía siguiente queda como detalle de capturas y contexto.

# Guía para el líder: capturas y tareas

Esta guía organiza el trabajo. No constituye aprobación del stack ni inicia implementación.

## 1. Carpeta exacta de capturas

Guardar PNG finales, sin datos personales, directamente en:

`D:\Games\Work\quesadata\FULL Stack SISTEM\docs\evidence\screens\`

No guardar credenciales, cookies, códigos de verificación ni certificados reales. Ocultar datos con rectángulos opacos antes de colocar las imágenes aquí. Mantener etiquetas, estructura, espaciado y apariencia visibles. No guardar los originales privados dentro del proyecto o Git.

### Tamaños y nombres

| Sufijo | Ancho × alto del viewport |
|---|---|
| mobile | 375 × 800 |
| tablet | 768 × 1024 |
| desktop | 1280 × 900 |
| wide | 1920 × 1080 |

Ejemplo: `login-desktop.png`. Para página larga, añadir `-full` a una captura adicional completa: `profile-desktop-full.png`; no sustituir la captura de viewport con una imagen larga etiquetada como 1280×900.

En Chrome/Edge: F12 → Ctrl+Shift+M → modo Responsive → introducir ancho y alto → zoom de página 100%. Capturar solo contenido del sitio mediante la opción Screenshot de las herramientas de desarrollo; si no aparece, capturar manualmente el área exacta del viewport. Verificar dimensiones del PNG antes de nombrarlo. Para escritorio conservar emulación de dispositivo de tipo desktop si está disponible. No reducir una imagen de escritorio para llamarla móvil.

### Primera tanda: pantallas que ya existen

Empezar con desktop y mobile; completar tablet y wide después. Cada base de nombre recibe los cuatro sufijos.

| Base de nombre | Qué mostrar |
|---|---|
| login | Formulario vacío; usar ventana privada para no cerrar sesión cliente |
| register-base | Registro vacío |
| register-tax-exempt | Elegir Yes de exención para mostrar upload; no enviar registro |
| forgot-password | Formulario vacío; no enviar enlace |
| dashboard-draft | Dashboard tal como existe, con borrador previo; ocultar identidad |
| new-order-current | Orden tal como se abre, sin escribir ni seleccionar productos |
| history-empty | Historial sin pedidos |
| history-filters | Filtro desplegado; si selector nativo no sale en captura, conservar la lista en nota |
| profile | Formulario y secciones; ocultar todos los valores personales |
| notifications | Campana abierta; no marcar, borrar ni abrir notificaciones individuales |

El nombre new-order-current evita llamar "vacío" a un builder restaurado. El coordinador lo asociará al índice y registrará el estado exacto. No borrar un borrador para obtener dashboard-empty.

### Segunda tanda: solo entorno de pruebas aislado

El original tiene autoguardado: cambiar producto, medidas o modelos puede modificar un borrador real aunque no se pulse Submit. No hacer esos cambios solo para tomar capturas. Los siguientes estados los prepara el coordinador en un entorno aislado con datos artificiales; si existe una cuenta/entorno de pruebas autorizado, documentarlo primero.

- verification-modal (sin enviar SMS/email ni registrar cuentas reales).
- dashboard-empty y new-order-empty.
- new-order-roller, new-order-zebra, new-order-ripple-fold, new-order-pinch-pleat, new-order-roman-shades, new-order-other.
- new-order-disabled: supply track Yes/No y campos aplicables; añadir sufijos -yes / -no si hacen falta ambas variantes.
- snaps-suggestion: normal y Crazy Track, con valores sintéticos.
- order-multiple-models y order-review.

Marcar MOCK DATA en toda reconstrucción sintética y dejar claro que no prueba comportamiento del backend original. Admin: no intentar ampliar permisos; si la cuenta sigue redirigiendo, el coordinador presenta un target inferido desktop/mobile para aprobación y luego verifica sus otras anchuras.

Al terminar primera tanda, pegar en ESTA tarea:

> Ya guardé la primera tanda de capturas en docs/evidence/screens. Revísalas, comprueba privacidad y tamaños, actualiza el índice visual y dime los estados que faltan. Prepara las referencias sintéticas pendientes sin cambiar datos del sitio original. Presenta un target administrativo inferido completo para que lo seleccione. No implementes todavía los módulos de producción.

## 2. Organización de tareas y modelos

El líder puede mantener esta tarea como coordinador; no necesita crear otra para repetir la investigación.

| Tarea | Modelo propuesto | Razonamiento | Momento |
|---|---|---|---|
| Coordinador / integración / QA (esta tarea) | GPT-6 Astra | High; Xhigh para integración compleja | Ahora y durante todo el proyecto |
| Backend | GPT-5.6 Terra | High | Después de base compartida aprobada y comprobada |
| Portal cliente | GPT-5.6 Luna | Max | Mismo punto de partida que backend |
| Admin | GPT-5.6 Luna | Max | Mismo punto de partida que backend |

Astra resuelve arquitectura, ambigüedades, contratos, revisión e integración. Terra High implementa backend en paquetes pequeños, incluidas auth y persistencia, con decisiones de seguridad previamente definidas y revisión de Astra. Luna Max implementa cliente y admin en paquetes pequeños contra contratos y referencias cerrados. No se entrega un módulo entero en una sola ejecución. Los paquetes actuales son resúmenes de alcance y todavía deben desglosarse según docs/execution/packet-readiness.md. Esta asignación expresa la estrategia del usuario, no garantiza resultados sin verificación.

### Antes de los tres workers

Primero revisar y aprobar stack, alcance y targets. Este mensaje SOLO debe pegarse cuando el líder esté de acuerdo:

> Apruebo Next.js full-stack con PostgreSQL y el alcance documentado, con admin inferido según el target que seleccionamos. Ejecuta P-02 y P-03: inicializa Git sin perder docs ni capturas, prepara la aplicación base, fija dependencias, contratos, schemas, tokens y fixtures sintéticos. Verifica build y typecheck y crea un commit base. Registra las decisiones críticas pendientes de negocio sin inventar reglas definitivas. Dame el hash de ese commit y el punto de partida común de los tres workers. No inicies workers hasta que la base esté verificada. No despliegues ni actives email/SMS reales.

No abrir workers antes: actualmente no existen Git, app ni commit compartido. Cada tarea debe crearse dentro del proyecto FULL Stack SISTEM en su propio WORKTREE basado en el MISMO commit base confirmado. No elegir tres tareas en modo Local sobre la misma carpeta. No reutilizar una rama de otro worker. Si la interfaz no permite seleccionar el commit, pedir al coordinador que prepare las ramas/worktrees desde él y facilite la asociación exacta.

## 3. Prompts para los workers

No pegar el prompt maestro, credenciales o todo el historial. La documentación debe existir en el commit base; los prompts siguientes referencian rutas relativas al worktree. No cambiar el modelo del chat coordinador al abrir otro worker.

### Backend — GPT-5.6 Terra / High

```text
Eres el Worker 1 de LUX Blinds. Trabaja en este worktree aislado, creado desde el commit base verificado por el coordinador.

Lee AGENTS.md si existe y docs/execution/shared-contract.md. Lee docs/execution/task-packets/backend.md y los documentos que ese packet referencia. El alcance general es B-01 a B-04. Ejecuta únicamente el subpaquete marcado READY que el coordinador adjunte a este mensaje; no ejecutes todo el módulo. Si no hay subpaquete READY, indica el faltante.

Respeta exclusivamente tus archivos autorizados. No modifiques contratos compartidos, configuración raíz, lockfile, documentación ni UI. Si falta una interfaz o dependencia, comunica una solicitud concreta al coordinador en vez de redefinirla. No repitas investigación ni accedas al sitio original. Usa datos sintéticos y proveedores simulados en pruebas; nunca actives email/SMS real.

Prueba auth, permisos e IDOR, snaps, validaciones, transacciones, idempotencia, borradores/versiones, storage privado y outbox. No conviertas supuestos fiscales o comerciales en reglas confirmadas. Haz commits de tu trabajo en tu rama; no integres otras ramas ni hagas push/deploy.

Al terminar informa: rama y commit, archivos modificados, decisiones, comandos y resultados de pruebas, problemas, pendientes y riesgos. No declares terminado si fallan checks o falta funcionalidad del packet.
```

### Portal cliente — GPT-5.6 Luna / Max

```text
Eres el Worker 2 de LUX Blinds. Trabaja en este worktree aislado, creado desde el commit base verificado por el coordinador.

Lee AGENTS.md si existe, docs/execution/shared-contract.md y docs/execution/task-packets/client.md. Lee sus documentos referenciados y las capturas de tu módulo indicadas en docs/evidence/visual-reference-index.md. El alcance general es C-01 a C-03. Ejecuta únicamente el subpaquete marcado READY que el coordinador adjunte; no ejecutes todo el portal. Si no hay subpaquete READY, indica el faltante.

Implementa el portal según targets aprobados: auth, dashboard, constructor completo, borradores, fotos, revisión, historial, perfil y notificaciones. Respeta reglas y DTO compartidos; no inventes API ni reimplementes cálculos de dominio. Mientras backend se integra, usa adaptadores/fixtures explícitos de test; nada de éxito simulado en producción.

Modifica solo archivos de tu packet. No cambies server/API/admin/contratos/raíz/lock/docs. Solicita al coordinador cualquier cambio compartido. No accedas al sitio original. Conserva fidelidad visual y prueba 375, 768, 1280 y 1920, teclado, foco, reduced motion y success/error/loading. Haz commits en tu rama; no merges/push/deploy.

Entrega rama y commit, archivos, decisiones, pruebas con resultados, capturas comparativas, problemas, pendientes y riesgos. No declares completo un flujo conectado únicamente a mocks.
```

### Panel admin — GPT-5.6 Luna / Max

```text
Eres el Worker 3 de LUX Blinds. Trabaja en este worktree aislado, creado desde el commit base verificado por el coordinador.

Lee AGENTS.md si existe, docs/execution/shared-contract.md y docs/execution/task-packets/admin.md. Lee los documentos referenciados, especialmente roles, estados y supuestos, y el target admin aprobado del índice visual. El alcance general es A-01 a A-03. Ejecuta únicamente el subpaquete marcado READY que el coordinador adjunte; no ejecutes todo el admin. Si no hay subpaquete READY, indica el faltante.

Implementa clientes, búsqueda/filtros/pedidos, detalle y medidas, archivos, notas internas, correcciones, estados, cotización manual y auditoría. El admin es inferido: no presentes decisiones nuevas como funciones observadas. No inventes precios automáticos, impuestos, cobros ni reglas de producción.

Modifica solo archivos de tu packet. No cambies backend/cliente/contratos/raíz/lock/docs. Usa la API/DTO compartida y solicita cambios al coordinador. Trata permisos en UI como presentación, nunca sustituto de autorización servidor. Prueba conflictos 409, errores, loading, teclado y cuatro anchuras. No accedas al sitio original. Haz commits propios; no merges/push/deploy.

Entrega rama y commit, archivos, decisiones, pruebas con resultados, capturas comparativas, problemas, pendientes y riesgos. No declares completo lo que solo funciona con mocks.
```

## 4. Cómo liderar mientras trabajan

Abrir como máximo los tres workers. Si uno necesita modificar un contrato compartido, traer esa solicitud al coordinador; no pedir a los tres editarlo. El coordinador cambia contrato una sola vez, publica commit y coordina su incorporación. Las tareas separadas no reciben automáticamente decisiones de esta conversación: transmitir referencias/commit o pedir al coordinador que lea sus resultados con sus IDs.

Cuando terminen, volver a ESTA tarea y pegar:

```text
Los workers terminaron. Aquí están sus tareas y ramas/commits:
Backend: [pegar ID o enlace de tarea, rama y commit]
Cliente: [pegar ID o enlace de tarea, rama y commit]
Admin: [pegar ID o enlace de tarea, rama y commit]

Lee sus resultados y verifica sus cambios reales. Integra según docs/execution/implementation-plan.md: backend y contratos, cliente, admin, integraciones y fixtures. Ejecuta build/typecheck y pruebas relevantes después de cada integración. Resuelve conflictos mecánicos y documenta cualquier cambio semántico antes de aplicarlo. Ejecuta docs/qa/test-matrix.md con API y datos locales reales, compara contra capturas aprobadas y actualiza docs/qa/final-report.md con evidencia y limitaciones. No despliegues ni actives servicios externos.
```

El líder revisa el resultado visual y decisiones comerciales. El coordinador se encarga de integración, consistencia técnica y evidencia de QA. No hay que crear un quinto chat solo para QA.


