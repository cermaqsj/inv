# Guía de Despliegue del Script de Google Sheets (Con Seguridad)

1.  **Abrir el Editor**:
    -   Ve a tu Google Sheet.
    -   Click en **Extensiones** > **Apps Script**.

2.  **Pegar el Código**:
    -   Borra todo y pega el contenido del nuevo **`backend.gs`**.
    -   Guarda (Ctrl + S).

3.  **Configuración Inicial (IMPORTANTE)**:
    -   En el editor, busca la funcion `setup` en la lista desplegable de funciones (arriba en la barra de herramientas).
    -   Haz clic en **Ejecutar**.
    -   Esto establecerá la contraseña de usuario a `1234` y la de admin a `mantencioncermaq`.
    -   Deberías ver "Registro de ejecución: Completado" y en el log: "Contraseñas inicializadas..."

4.  **Configurar Trigger (Snapshot Diario)**:
    -   Menú izquierdo (Reloj) > **Activadores**.
    -   **+ Añadir activador**.
    -   *Función*: `generarSnapshot`.
    -   *Fuente del evento*: `Impulsado por tiempo` > `Temporizador por días` > `Media noche a 1 a.m.`
    -   Guarda.

5.  **Desplegar**:
    -   **Implementar** > **Nueva implementación**.
    -   ⚙️ Tipo: **Aplicación web**.
    -   *Descripción*: "Versión Seguridad 1.0"
    -   *Ejecutar como*: **Yo**.
    -   *Quién tiene acceso*: **Cualquiera** (Anyone).
    -   Clic en **Implementar**.

6.  **Copiar URL**:
    -   Obtén la URL que termina en `/exec`. Esta es la que usaremos en la PWA.
