# Validaciones y reglas dinámicas

Fuente C: funciones validateCurrent, collectCurrent, productUsesSnaps, fullnessIsApplicable, updateTrackRequirements, suggestedSnaps de E-05. Estas reglas proceden del JavaScript servido; no de pruebas del backend.

Todos los productos requieren Product Type, Fabric Name, Width y Height. Room / Area y notas opcionales. Sidemark se exige al revisar pedido. Other requiere texto libre. Track Other requiere texto cuando se suministra track. Dimensiones usan parte entera + fracción vacía o 1/8,1/4,3/8,1/2,5/8,3/4,7/8. El parser admite sufijos pulgadas; confirmar unidad de fabricación.

| Producto | Visible / obligatorio adicional | Deshabilitado / oculto | Regla |
|---|---|---|---|
| Roller | Apertura, track, fullness, instalación, control, operación | Snaps; selector suministro oculto | Suministro forzado yes |
| Zebra | Igual Roller | Igual Roller | Igual Roller |
| Ripple Fold + yes | Apertura, suministro, track, fullness, instalación, operación | Control side | Snaps opcional/automático |
| Ripple Fold + no | Apertura, suministro | Track, fullness, instalación, control, operación | Snaps habilitado pero sin fullness no hay sugerencia |
| Pinch Pleat + yes | Apertura, suministro, track, instalación, operación | Fullness, snaps, control | Snaps no aplicable |
| Pinch Pleat + no | Apertura, suministro | Track, fullness, instalación, control, operación, snaps | Detalles track no aplican |
| Roman Shades | Instalación, control, operación | Apertura, track, fullness, snaps; suministro oculto | Suministro forzado yes |
| Other + yes | Texto tipo, apertura, suministro, track, fullness, instalación, control, operación | Ninguno salvo campos Other no elegidos | Snaps aplicable si texto final no coincide con productos excluidos |
| Other + no | Texto tipo, apertura, suministro, fullness | Track, instalación, control, operación | Fullness sigue aplicable salvo texto final Ripple Fold/Pinch Pleat/Roman Shades |

Los campos deshabilitados de track se atenúan (opacidad .45 y grayscale). Algunas diferencias de visibilidad de snaps solo confirmadas por código; falta captura por producto. El constructor actual validaba presencia, no un rango físico exhaustivo. Propuesta I: números finitos positivos en octavos, cantidades enteras >=1; límites máximos configurables y confirmados por fabricante, nunca inventados como regla original.

## Snaps exactos observados

factor: 80%=0.48, 100%=0.52, 120%=0.58. base = ancho decimal × factor. Sin ancho no nulo, dirección o factor válido devuelve vacío.

roundHalfUp(n) = floor(n + 0.5).
forceOdd(n): truncar entero, limitar inferior a 0; si positivo par sumar 1.
forceEven(n): truncar entero, limitar inferior a 0; si positivo par sumar 2, si positivo impar sumar 1. Cero queda cero.

Dirección normal: O/W usa forceOdd(roundHalfUp(base)); C/O aplica a base/2 y devuelve 'lado / lado'. Crazy Track usa forceEven. Dirección se normaliza a mayúsculas; detecta CRAZY y C/O, CENTER OPEN o CENTER-OPEN.

Snaps solo disponible cuando tipo final NO es roller, zebra, pinch pleat, roman shades. Valor manual prevalece; persistir manual/auto y sugerencia original. La política de texto manual válido está P. No sustituir el ajuste Crazy por redondeo al par más cercano.

Ejemplos derivados, no pedidos reales: ancho 100, fullness 100% → normal O/W 53, normal C/O 27 / 27, Crazy O/W 54, Crazy C/O 28 / 28. Ancho 70.5, fullness 80% → normal O/W 35, C/O 17 / 17, Crazy O/W 36, C/O 18 / 18.

Qty: colector inicializa 1; al cambiar JS parseInt y si no positivo reemplaza por 1. Réplica propuesta rechaza fracciones en servidor en vez de truncarlas silenciosamente.

Registro: empresa/contacto/email/teléfono/password/confirmación/método/exención/términos requeridos; Tax ID opcional. Exención Yes hace tax_certificate requerido, formatos PDF/JPG/JPEG/PNG. Perfil acepta además WebP y anuncia máximo 10 MB. No extrapolar ese límite al upload de pedidos sin confirmación.
