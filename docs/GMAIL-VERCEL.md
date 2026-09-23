# Gmail para pruebas con clientes

No requiere dominio propio. Es una opción temporal para un volumen bajo, sujeta
a límites y controles de seguridad de Google. No sustituye un proveedor de correo
transaccional para el lanzamiento público.

1. Crea una cuenta Gmail exclusiva para el proyecto.
2. Activa la verificación en dos pasos de esa cuenta.
3. Abre https://myaccount.google.com/apppasswords y crea una contraseña de
   aplicación llamada `LUX Blinds Vercel`. No uses la contraseña normal del Gmail.
   Si Google no ofrece esta opción, revisa las restricciones de la cuenta:
   https://support.google.com/mail/answer/185833?hl=es
4. En Vercel, proyecto → Settings → Environment Variables, configura para
   **Production** (y Preview solo si también quieres enviar desde previews):

   ```dotenv
   EMAIL_PROVIDER=gmail
   GMAIL_USER=el-correo-que-creaste@gmail.com
   GMAIL_APP_PASSWORD=la-contraseña-de-aplicacion
   ```

   Introduce los valores sin comillas en la interfaz de Vercel. Marca la contraseña
   como sensible. No la compartas por chat ni la guardes en Git.
5. Puedes dejar las variables `RESEND_*`: se ignoran mientras el proveedor sea
   `gmail`. Las demás variables de base de datos, autenticación y storage no cambian.
6. Despliega el último commit de `main` después de guardar las variables.
7. Registra una cuenta con un correo distinto al remitente, comprueba bandeja de
   entrada y spam, introduce el código y verifica que puedes iniciar sesión.
   Comprueba también la recuperación de contraseña. No compartas los códigos.

El envío usa `smtp.gmail.com:465` con TLS y el remitente es el propio `GMAIL_USER`.
Registro, recuperación y notificaciones usan el proveedor seleccionado. Un fallo
de envío no activa cuentas ni provoca un fallback a correos simulados.

Si cambias la contraseña de Google, puede revocar la contraseña de aplicación:
genera otra, actualiza Vercel y redespliega. Para volver a Resend, verifica tu
dominio allí y configura `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` y
`RESEND_EMAIL_FROM` con el remitente verificado.

La validación automática usa proveedores simulados: la entrega real requiere
las credenciales de tu cuenta y la prueba manual del paso 7.
