# 🚀 GUÍA RÁPIDA DE DESPLIEGUE
## Sistema de Inventario QR - Cermaq

---

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Google Sheets (2 min)
```
1. Ir a: https://sheets.google.com
2. Crear nueva hoja de cálculo
3. Nombrar: "Inventario Cermaq 2026"
4. Renombrar primera hoja a: "2026"
5. Importar: 02_BASE_DATOS/sistema_inventario_importar.csv
   (Archivo > Importar > Subir archivo)
```

### Paso 2: Google Apps Script (2 min)
```
1. En la hoja: Extensiones > Apps Script
2. Borrar todo el código por defecto
3. Copiar TODO el contenido de: 01_APLICACION_WEB/Code.gs
4. Pegar en el editor
5. Guardar (Ctrl+S)
6. Ejecutar: CONFIGURAR_SISTEMA (botón ▶️)
7. Autorizar permisos cuando aparezca el popup
```

### Paso 3: Desplegar API (1 min)
```
1. En Apps Script: Implementar > Nueva implementación
2. Tipo: Aplicación web
3. Descripción: "API Inventario Cermaq"
4. Ejecutar como: Yo (tu email)
5. Quién tiene acceso: Cualquier persona
6. Implementar
7. COPIAR LA URL que aparece (la necesitarás)
```

### Paso 4: Configurar App Web (30 seg)
```
1. Abrir: 01_APLICACION_WEB/app.js
2. Buscar línea 7 (Ctrl+G → 7)
3. Reemplazar la URL entre comillas con la URL que copiaste
4. Guardar (Ctrl+S)
```

### Paso 5: Probar Localmente (30 seg)
```
Opción A - Servidor Simple:
1. Abrir PowerShell en: 01_APLICACION_WEB/
2. Ejecutar: python -m http.server 8080
3. Abrir navegador: http://localhost:8080

Opción B - Abrir directamente:
1. Doble clic en: 01_APLICACION_WEB/index.html
```

---

## 🌐 Despliegue en Producción

### GitHub Pages (GRATIS - Recomendado)

```bash
# 1. Crear repositorio en GitHub
# 2. En terminal:
cd 01_APLICACION_WEB
git init
git add .
git commit -m "Deploy Cermaq QR System"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/cermaq-qr.git
git push -u origin main

# 3. En GitHub:
# Settings > Pages > Source: main branch > Save
# Tu app estará en: https://TU-USUARIO.github.io/cermaq-qr
```

### Netlify (GRATIS - Más fácil)

```
1. Ir a: https://app.netlify.com
2. Drag & Drop la carpeta: 01_APLICACION_WEB
3. Listo! Te dan una URL automática
```

---

## 🔧 Configuración Avanzada

### Cambiar Contraseña de Admin

**Archivo:** `01_APLICACION_WEB/app.js`  
**Línea:** 806

```javascript
// Cambiar de:
if (pass === 'mantencioncermaq') {

// A:
if (pass === 'TU_NUEVA_CONTRASEÑA') {
```

### Personalizar Nombre de la App

**Archivo:** `01_APLICACION_WEB/manifest.json`

```json
{
  "name": "Tu Nombre Personalizado",
  "short_name": "TuApp"
}
```

**Archivo:** `01_APLICACION_WEB/index.html` (línea 7)

```html
<title>Tu Título Personalizado</title>
```

---

## 📱 Instalación en Móviles

### Android
```
1. Abrir la app en Chrome
2. Menú (⋮) > Agregar a pantalla de inicio
3. Listo! Funciona como app nativa
```

### iOS (iPhone/iPad)
```
1. Abrir la app en Safari
2. Botón Compartir (□↑)
3. "Agregar a pantalla de inicio"
4. Listo!
```

---

## 🖨️ Imprimir Códigos QR

### Códigos Ya Impresos (500)
```
✅ Ya están impresos y en uso
📁 Ubicación: 03_CODIGOS_QR/qr_codes_impresos_500/
📄 HTML: 01_APLICACION_WEB/FICHAS_IMPRESION.html
```

### Códigos Pendientes (500)
```
⏳ Listos para imprimir
📁 Ubicación: 03_CODIGOS_QR/qr_codes_faltantes_500/
📋 IDs: 1016216 - 1016715

Para imprimir:
1. Abrir: FICHAS_IMPRESION_2.html
2. Ctrl+P (Imprimir)
3. Configurar:
   - Tamaño: A4
   - Márgenes: Mínimos
   - Escala: 100%
```

---

## 🆘 Solución de Problemas

### ❌ "Error de conexión"
```
Causa: URL de API incorrecta
Solución:
1. Verificar app.js línea 7
2. Verificar que la URL termine en /exec
3. Probar la URL en el navegador (debe mostrar JSON)
```

### ❌ "Producto no encontrado"
```
Causa: Base de datos vacía
Solución:
1. Verificar que Google Sheets tenga datos
2. Ejecutar CONFIGURAR_SISTEMA() en Apps Script
3. Refrescar la app (F5)
```

### ❌ "No se puede escanear QR"
```
Causa: Permisos de cámara
Solución:
1. Permitir acceso a cámara cuando lo pida
2. En Chrome: Configuración > Privacidad > Cámara
3. Agregar tu sitio a la lista de permitidos
```

### ❌ "Modo offline - Cola: X items"
```
Causa: Sin conexión a internet
Solución:
✅ Es normal! El sistema guarda las transacciones
✅ Se sincronizarán automáticamente al reconectar
```

---

## 📊 Verificar que Todo Funciona

### Checklist de Pruebas

- [ ] Abrir la app en el navegador
- [ ] Ver "Conectado (X productos)" en la parte superior
- [ ] Activar cámara y escanear un QR
- [ ] Ver información del producto
- [ ] Hacer una transacción de INGRESO
- [ ] Verificar que se actualice en Google Sheets
- [ ] Hacer una transacción de SALIDA
- [ ] Verificar validación de stock
- [ ] Abrir "Ver Historial"
- [ ] Ver las transacciones registradas
- [ ] Modo Admin: Ingresar contraseña
- [ ] Crear un producto nuevo
- [ ] Generar etiquetas QR

---

## 🎓 Capacitación de Usuarios

### Uso Básico (Operadores)
```
1. Abrir app en el celular
2. Tocar "ACTIVAR CÁMARA"
3. Apuntar a código QR
4. Seleccionar cantidad con + / -
5. Tocar INGRESO o SALIDA
6. Listo!
```

### Uso Avanzado (Administradores)
```
1. Tocar ícono de Admin (⚙️)
2. Ingresar contraseña
3. Ahora puedes:
   - Crear productos nuevos
   - Editar nombres
   - Generar etiquetas QR
   - Ver precios
```

---

## 📈 Mantenimiento

### Backup Semanal
```
1. Google Sheets: Archivo > Descargar > CSV
2. Guardar en: 02_BASE_DATOS/
3. Fecha en el nombre: inventario_2026_02_03.csv
```

### Actualizar la App
```
1. Modificar archivos en: 01_APLICACION_WEB/
2. Subir cambios a GitHub / Netlify
3. Los usuarios verán cambios al refrescar (F5)
```

---

## 🔗 URLs Importantes

```
Google Sheets: [TU_URL_AQUÍ]
Apps Script: [TU_URL_AQUÍ]
App Web: [TU_URL_AQUÍ]
GitHub Repo: [TU_URL_AQUÍ]
```

---

## 📞 Contacto y Soporte

**Desarrollado para:** Cermaq - Bodega Mantención  
**Fecha:** Febrero 2026  
**Versión:** 5.0 Final

---

**¡Listo para producción! 🚀**
