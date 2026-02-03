# Proyecto QR Cermaq - Bodega Mantención

Sistema de gestión de inventario con códigos QR para Cermaq.

## 📁 Estructura del Proyecto

### Aplicación Web (PWA)
- `index.html` - Aplicación principal de inventario
- `app.js` - Lógica de la aplicación
- `style.css` - Estilos
- `sw.js` - Service Worker para PWA
- `manifest.json` - Configuración PWA
- `Code.gs` - Google Apps Script (backend)

### Códigos QR (1000 total)

#### 500 Códigos YA IMPRESOS
- **Carpeta**: `qr_codes_impresos_500/`
- **Lista**: `codigos_ya_impresos.txt`
- **HTML de impresión**: `FICHAS_IMPRESION.html`
- Estos códigos ya están impresos y en uso

#### 500 Códigos POR IMPRIMIR
- **Carpeta**: `qr_codes_faltantes_500/`
- **Lista**: `codigos_faltantes_por_imprimir.txt`
- Códigos: 1016216 - 1016715
- Listos para imprimir cuando se necesiten

#### Base de Datos Completa
- **Lista completa**: `lista_ids_all_1000.txt`
- Contiene los 1000 códigos ordenados numéricamente

### Datos
- `base_datos_completa.csv` - Base de datos del inventario
- `sistema_inventario_importar.csv` - Plantilla de importación
- `INVENTARIO OFICIAL BODEGA MANTENCION CERMAQ.xlsx` - Inventario oficial

### Recursos
- `Q.png` - Logo principal
- `QQ.png` - Logo alternativo
- `Cermaq_logo2.png` - Logo Cermaq
- `api credencial/` - Credenciales de API

### Backups
- `Backup_2026_01_28.zip` - Backup comprimido
- `Backup_Final_20260128_2121/` - Backup completo

## 🎯 Uso

### Para agregar códigos a Google Sheets:

**Códigos ya impresos (500):**
```
1. Abrir: codigos_ya_impresos.txt
2. Copiar todo (Ctrl+A, Ctrl+C)
3. Pegar en Google Sheets
```

**Códigos por imprimir (500):**
```
1. Abrir: codigos_faltantes_por_imprimir.txt
2. Copiar todo (Ctrl+A, Ctrl+C)
3. Pegar en Google Sheets
```

**Todos los códigos (1000):**
```
1. Abrir: lista_ids_all_1000.txt
2. Copiar todo (Ctrl+A, Ctrl+C)
3. Pegar en Google Sheets
```

### Para imprimir QR codes:

**Códigos ya impresos:**
- Usar `FICHAS_IMPRESION.html` (ya impreso)

**Códigos faltantes:**
- Los QR están en `qr_codes_faltantes_500/`
- Crear HTML de impresión similar a `FICHAS_IMPRESION.html`

## ✅ Verificación

- Total códigos: 1000
- Códigos únicos: 1000
- Sin duplicados: ✓
- Impresos: 500
- Por imprimir: 500

## 📝 Notas

- Los códigos NO son consecutivos (es normal)
- Cada código es único
- Los códigos faltantes (1016216-1016715) son secuenciales
- Los códigos impresos son variados (de diferentes rangos)
