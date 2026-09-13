# Índice visual actualizado

Primera tanda revisada: siete PNG del usuario. Dimensiones son píxeles del archivo, no prueba del viewport CSS. Ninguno coincide exactamente con 375×800, 768×1024, 1280×900 o 1920×1080. No se redimensionaron originales para simular evidencia responsive.

| Archivo original | Dimensiones | Estado | Privacidad / uso |
|---|---|---|---|
| 2026-09-13_011634.png | 1920×919 | Login vacío | Sin PII visible; copia approved/login-original-1920x919.png |
| 2026-09-13_011800.png | 1884×984 | Dashboard con draft | Identidad visible; no entregar a workers |
| entrada profile.png | 1920×919 | Modal invitación SMS sobre perfil | Datos de cuenta visibles; no entregar |
| my profile.png | 1884×1179 | Perfil con éxito de activación SMS | Datos de cuenta visibles; no entregar |
| new order.png | 1884×2018 | Constructor Other restaurado, página larga | Sin PII visible; copia approved/new-order-original-1884x2018.png |
| notifications.png | 1920×919 | Notificaciones vacías sobre perfil | Datos de cuenta visibles; no entregar |
| order story.png | 1920×919 | Historial vacío | Sin PII visible; copia approved/history-original-1920x919.png |

Las cuatro imágenes privadas siguen intactas en screens/, excluidas por .gitignore; no se editaron ni publicaron. Workers leen únicamente screens/approved/ y references/screens/. No hay contraseñas visibles en los campos de las capturas revisadas. La activación SMS es estado mostrado por imágenes del usuario, no acción ejecutada ni verificación live de esta fase.

## Paquete sintético

[Catálogo navegable](references/index.html), [manifest de capturas](references/render-report.json). 34 estados × 4 tamaños = 136 PNG de viewport y 3 complementos de página completa. Tamaños verificados por render: mobile 375×800, tablet 768×1024, desktop 1280×900, wide 1920×1080. Cada archivo se llama references/screens/{estado}-{sufijo}.png. Todos están marcados MOCK DATA; admin además es INFERRED. El manifiesto registra cada ruta, viewport y origen.

Estados cliente: login, register-base, register-tax-exempt, verification-modal, forgot-password, dashboard-empty, dashboard-draft, new-order-empty, new-order-roller, new-order-zebra, new-order-ripple-fold, new-order-pinch-pleat, new-order-roman-shades, new-order-other, new-order-no-track, snaps-suggestion, order-multiple-models, order-review, history-empty, history-filters, profile, profile-sms-prompt, notifications, draft-conflict, form-error.

Admin target A: admin-orders, admin-detail, admin-customers, admin-customer, admin-audit, admin-notifications, admin-status, admin-quote, admin-conflict. Es una dirección completa para revisión: listado, detalle/modelos/archivos/notas/cotización/historial, clientes y revisión fiscal, notificaciones, transición y conflicto. Tabla de escritorio se transforma en tarjetas móviles. No es panel original observado.

Revisión realizada: todas las 136 capturas se generaron con tamaños canónicos, marcador sintético, sin desbordamiento horizontal de documento, sin excepciones JS y sin peticiones externas detectadas por el render. Inspección visual directa de seis capturas representativas: admin lista desktop/mobile, detalle completo, constructor Ripple completo, review mobile y registro exento mobile. No equivale a auditoría visual manual de cada archivo.

## Preservar / adaptar / ignorar

Preservar: crema, paneles claros, botones píldora negros/blancos, encabezado oscuro dashboard, jerarquía, etiquetas inglesas, constructor y campos del original. Referencia original aprobada manda para fidelidad; la matriz funcional manda para reglas.

Adaptar: composición móvil, foco/errores y admin inferido. Las referencias sintéticas son apoyo de composición y estados, no especificación exhaustiva de widgets. El constructor original conserva selectores de octavos, cantidad editable y upload real: deben implementarse según matriz aunque la maqueta simplifique esos controles. Campos deshabilitados deben limpiarse según reglas, aunque la maqueta conserve un ejemplo visual. No copiar valores demo ni botones simulados como lógica.

Ignorar: barras del navegador, tamaños no canónicos como prueba responsive, patches WordPress, identidad de cuenta, estado fiscal real y datos del certificado. Nunca copiar secretos, contactos reales ni URLs de sesión. Fixtures usan Demo y example.test.

## Lo que sigue faltando como evidencia ORIGINAL

- Las cuatro dimensiones canónicas del sitio original y especialmente móvil/tablet.
- Registro normal/exento, recuperación y modal de código originales.
- Cada producto, supply yes/no, Crazy Track, multi-modelos y revisión original en entorno de pruebas seguro.
- Admin original (la cuenta disponible redirigía al cliente).
- Archivo original de fotografía/logo de login para implementación fiel: captura completa solo documenta posición/apariencia.

Esos estados tienen referencias sintéticas salvo detalle exacto de Crazy Track/asset de foto; no se presentan como observados. No hay que alterar datos originales para completarlos. La ejecución debe mantener explícita esta limitación.
