# Supuestos y decisiones

| ID | Necesidad / propuesta | Motivo y evidencia | Confirmación humana |
|---|---|---|---|
| A-001 | Admin operativo con clientes/pedidos/archivos/notas/auditoría | Cliente no puede acceder E-08; operación necesaria y términos E-09 | Aprobar admin inferido como objetivo visual/funcional |
| A-002 | Flujo secuencial y cancelación antes de entrega | Nombres E-06; transiciones no observadas | Aprobar grafo y excepciones |
| A-003 | Cotización manual versionada, moneda explícita | Términos permiten pricing E-09, no tarifas | Aprobar inclusión; impuestos, descuentos, cobro y fórmula fuera de alcance hasta definición |
| A-004 | Medidas en pulgadas y octavos | Parser de E-05 admite inches/in y octavos | Confirmar unidad y límites físicos; no fijar máximos inventados |
| A-005 | Roles cliente/operador/admin | Separación portal E-08, control fiscal E-07 | Aprobar matriz y responsables |
| A-006 | Completed computa Delivered | Métrica E-04 vs filtro E-06 | Confirmar correspondencia antes de KPI productivo |
| A-007 | Un cliente inicial por empresa; estructura permite membresías | Registro empresarial E-02 | Multiusuario de empresa fuera del primer alcance salvo confirmación |
| A-008 | Email transaccional real; SMS integrado pero desactivado por defecto | E-09/E-10, webhook REST Twilio E-13 | Elegir proveedores/cuentas y aprobar activación externa por separado |
| A-009 | Migración fuera del MVP inicial; fixture sintético | Sin acceso DB/export original | Confirmar si se necesita migración; no reutilizar contraseñas o sesiones originales |
| A-010 | Retención configurable, revisiones y archivos privados | Política E-10 sin duración concreta | Responsable define plazo legal/operativo antes de producción |
| A-011 | Mayor rigor servidor: cantidad entera positiva, medida positiva | JS original valida principalmente presencia | Aprobar mejora funcional; conservar fórmula de snaps con sus particularidades |
| A-012 | Réplica fiel visual del cliente, admin híbrido inferido | E-06 screenshot; E-08 inaccesible | Seleccionar targets completos antes de implementación |

No hay evidencia de tarifas, impuesto porcentual, métodos de pago, inventario, calendario de fábrica ni integración contable. No convertirlos en reglas o promesas del MVP.
