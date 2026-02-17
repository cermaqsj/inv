
// CONFIGURACIÓN DE COLUMNAS
const KOL = {
  ID: 0,          // Columna A: Nº ARTICULO
  NOMBRE: 1,      // Columna B: DESCRIPCION
  STOCK: 2        // Columna C: STOCK (Antes 3/D)
};

const HOJA_INVENTARIO = "2026"; // Asegúrate que tu hoja se llame así o cambia este nombre
const HOJA_LOGS = "MOVIMIENTOS";
// URL DE LA PLANILLA (Privada en el Backend)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1IRRlhN0hQa0ryJ2SNcyyRpkKbuZ8uaFmiw6w82EozCo/edit";

// ==========================================
// API DEL SISTEMA (No tocar)
// ==========================================

function doGet(e) {
  // 1. REDIRECCIÓN SEGURA A PLANILLA
  if (e.parameter.action === "openSheet") {
    return HtmlService.createHtmlOutput(
      '<script>window.top.location.href = "' + SHEET_URL + '";</script>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // 2. INVENTARIO NORMAL
  const data = obtenerInventario();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Esta función recibe las órdenes de INGRESO/SALIDA desde el Escáner
  try {
    const params = JSON.parse(e.postData.contents);
    const accion = params.action; // "IN", "OUT", "ADD"
    
    if (accion === "IN" || accion === "OUT") {
      return procesarMovimiento(params);
    } else if (accion === "ADD") {
      return agregarProducto(params);
    } else if (accion === "GET_HISTORY") {
      return obtenerHistorial(params);
    } else if (accion === "UPDATE_NAME") {
      return actualizarNombre(params);
    } else if (accion === "TOOL_CHECK_OUT" || accion === "TOOL_CHECK_IN") {
      return procesarHerramienta(params);
    } else if (accion === "GET_TOOLS") {
      return obtenerHerramientas();
    } else {
      return respuestaJSON({ error: "Acción no válida" });
    }
  } catch (error) {
    return respuestaJSON({ error: error.toString() });
  }
}

// ==========================================
// LÓGICA DE NEGOCIO
// ==========================================

function obtenerInventario() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_INVENTARIO);
  if (!sheet) return [];

  // Leemos toda la tabla
  const data = sheet.getDataRange().getValues();
  // Saltamos la fila 1 (encabezados)
  const rows = data.slice(1);

  // Mapeamos a un formato limpio para la App
  return rows.map(r => ({
    id: r[KOL.ID],
    nombre: r[KOL.NOMBRE],
    stock: r[KOL.STOCK]
  })).filter(item => item.id != ""); // Filtramos filas vacías
}

function procesarMovimiento(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_INVENTARIO);
  const logSheet = ss.getSheetByName(HOJA_LOGS);
  
  const idBusqueda = String(datos.id);
  const cantidad = parseInt(datos.quantity);
  const usuario = datos.user || "App";
  
  const data = sheet.getDataRange().getValues();
  let filaEncontrada = -1;
  
  // Buscamos el producto por su ID (Columna A)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][KOL.ID]) === idBusqueda) {
      filaEncontrada = i + 1; // +1 porque array es base 0, sheet es base 1
      break;
    }
  }

  if (filaEncontrada === -1) {
    return respuestaJSON({ status: "error", message: "Producto no encontrado. ID: " + idBusqueda });
  }

  // Obtenemos celda de stock actual
  // getRange(fila, columna) -> La columna es índice + 1
  const celdaStock = sheet.getRange(filaEncontrada, KOL.STOCK + 1);
  const stockActual = parseInt(celdaStock.getValue()) || 0;
  
  let nuevoStock = stockActual;
  
  if (datos.action === "IN") {
    nuevoStock += cantidad;
  } else {
    // Validación de stock negativo
    if (stockActual < cantidad) {
      return respuestaJSON({ status: "error", message: "Stock insuficiente. Tienes: " + stockActual });
    }
    nuevoStock -= cantidad;
  }
  
  // Guardamos el nuevo stock
  celdaStock.setValue(nuevoStock);

  // ACTUALIZAR NOMBRE (Si se envió y es diferente)
  if (datos.nombre) {
     const celdaNombre = sheet.getRange(filaEncontrada, KOL.NOMBRE + 1);
     celdaNombre.setValue(datos.nombre);
  }
  
  // Registramos en el Historial
  if (logSheet) {
    logSheet.appendRow([
      new Date(),           // Fecha
      datos.action,         // Acción (IN/OUT)
      idBusqueda,           // ID Producto
      data[filaEncontrada-1][KOL.NOMBRE], // Nombre Producto
      cantidad,             // Cantidad
      nuevoStock,           // Stock Resultante
      usuario,              // Quién lo hizo
      datos.comment || "",  // COMENTARIO (Nuevo)
      datos.price || ""     // PRECIO (Nuevo)
    ]);
  }
  
  return respuestaJSON({ 
    status: "success", 
    message: "Actualizado correctamente", 
    productName: data[filaEncontrada-1][KOL.NOMBRE],
    newStock: nuevoStock
  });
}

function agregarProducto(datos) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_INVENTARIO);
  
  if (!sheet) return respuestaJSON({ status: "error", message: "No se encontró la hoja " + HOJA_INVENTARIO });

  const data = sheet.getDataRange().getValues();
  let idNuevo = String(datos.id);
  
  // LÓGICA AUTO-ID
  if (idNuevo === "AUTO" || idNuevo === "") {
     let maxId = 0;
     // Buscamos el ID más alto numérico
     for (let i = 1; i < data.length; i++) {
       let val = parseInt(data[i][KOL.ID]);
       if (!isNaN(val) && val > maxId) {
         maxId = val;
       }
     }
     idNuevo = String(maxId + 1);
  }
  
  // Validar duplicados (solo si no fue generado automáticamente, aunque igual sirve)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][KOL.ID]) === idNuevo) {
      return respuestaJSON({ status: "error", message: "El ID ya existe: " + idNuevo });
    }
  }
  
  // Agregar fila nueva
  // Estructura SIMPLIFICADA: [ID, NOMBRE, STOCK]
  sheet.appendRow([
    idNuevo,            // A
    datos.nombre,       // B
    datos.stock || 0    // C (Stock directo, sin columnas intermedias)
  ]);
  
  return respuestaJSON({ 
    status: "success", 
    message: "Producto creado correctamente. ID: " + idNuevo,
    newId: idNuevo 
  });
}


function guardarFotoDiaria() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetInv = ss.getSheetByName(HOJA_INVENTARIO);
  let sheetHist = ss.getSheetByName("HISTORIAL_STOCK");
  
  if (!sheetHist) {
    sheetHist = ss.insertSheet("HISTORIAL_STOCK");
    sheetHist.appendRow(["FECHA_FOTO", "ID", "NOMBRE", "STOCK"]);
    sheetHist.setTabColor("purple");
  }
  
  const data = sheetInv.getDataRange().getValues();
  // Asumimos fila 1 headers
  const timestamp = new Date();
  
  const filasNuevas = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Solo guardar si tiene ID válido
    if (row[KOL.ID]) {
      filasNuevas.push([
        timestamp,
        row[KOL.ID],
        row[KOL.NOMBRE],
        row[KOL.STOCK]
      ]);
    }
  }
  
  if (filasNuevas.length > 0) {
    // Escritura en lote para eficiencia
    sheetHist.getRange(sheetHist.getLastRow() + 1, 1, filasNuevas.length, 4).setValues(filasNuevas);
  }
}

// ==========================================
// UTILIDADES
// ==========================================

function respuestaJSON(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

function CONFIGURAR_SISTEMA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Verificar si existe hoja MOVIEMIENTOS, si no, crearla
  // 1. Verificar si existe hoja MOVIEMIENTOS, si no, crearla
  let sheetLogs = ss.getSheetByName(HOJA_LOGS);
  if (!sheetLogs) {
    sheetLogs = ss.insertSheet(HOJA_LOGS);
    sheetLogs.appendRow(["FECHA", "ACCION", "ID_ARTICULO", "NOMBRE", "CANTIDAD", "SALDO_STOCK", "USUARIO", "COMENTARIO", "PRECIO_UNITARIO"]);
    sheetLogs.setTabColor("orange");
  } else {
    // Si ya existe, verificar si tiene las nuevas columnas
    const headers = sheetLogs.getRange(1, 1, 1, sheetLogs.getLastColumn()).getValues()[0];
    if (headers.indexOf("COMENTARIO") === -1) {
       sheetLogs.getRange(1, headers.length + 1).setValue("COMENTARIO");
       sheetLogs.getRange(1, headers.length + 2).setValue("PRECIO_UNITARIO");
    }
  }

  // 3. Crear Trigger Diario para Snapshot
  const triggers = ScriptApp.getProjectTriggers();
  let triggerExiste = false;
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "guardarFotoDiaria") triggerExiste = true;
  });
  
  if (!triggerExiste) {
    ScriptApp.newTrigger("guardarFotoDiaria")
      .timeBased()
      .atHour(1) // 1:00 AM
      .everyDays(1)
      .create();
  }
  
  // 2. Verificar nombre hoja inventario
  const sheetInv = ss.getSheets()[0]; // Asumimos que la primera es el inventario
  if (sheetInv.getName() !== HOJA_INVENTARIO) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('Configuración', '¿Podemos renombrar la hoja "' + sheetInv.getName() + '" a "' + HOJA_INVENTARIO + '" para que funcione el sistema?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      sheetInv.setName(HOJA_INVENTARIO);
    } else {
      ui.alert('Importante: Asegúrate de cambiar manualmente el nombre de la hoja principal a "' + HOJA_INVENTARIO + '" o editar el código.');
    }
  }
  
  SpreadsheetApp.getUi().alert("¡Sistema Configurado! Ahora realiza la Implantación como Aplicación Web.");
}

function obtenerHistorial(params) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(HOJA_LOGS);

    if (!sheet) return respuestaJSON([]);

    // Obtener todos los datos
    const data = sheet.getDataRange().getValues();
    // Encabezados en fila 0

    const historial = [];
    const limit = 50; // Últimos 50 movimientos

    // Recorrer de ABAJO hacia ARRIBA (los más recientes al final)
    for (let i = data.length - 1; i >= 1; i--) {
        if (historial.length >= limit) break;

        const row = data[i];
        // Formato FECHA | ACCION | ID | NOMBRE | CANTIDAD | STOCK | USUARIO | COMENTARIO
        historial.push({
            fecha: row[0],
            accion: row[1],
            id: row[2],
            nombre: row[3],
            cantidad: row[4],
            usuario: row[6], // Col G
            comentario: row[7] || "" // Col H
        });
    }

    return respuestaJSON(historial);
}

function actualizarNombre(datos) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_INVENTARIO);
  const data = sheet.getDataRange().getValues();
  const idBusqueda = String(datos.id);
  
  let filaEncontrada = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][KOL.ID]) === idBusqueda) {
      filaEncontrada = i + 1;
      break;
    }
  }

  if (filaEncontrada === -1) {
    return respuestaJSON({ status: "error", message: "Producto no encontrado" });
  }

  // Update Name
  sheet.getRange(filaEncontrada, KOL.NOMBRE + 1).setValue(datos.nombre);
  
  return respuestaJSON({ status: "success", message: "Nombre actualizado" });
}

// ==========================================
// CONTROL DE HERRAMIENTAS
// ==========================================
const HOJA_HERRAMIENTAS = "CONTROL_HERRAMIENTAS";

function procesarHerramienta(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOJA_HERRAMIENTAS);
  
  // Crear hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_HERRAMIENTAS);
    sheet.appendRow(["ID_TRANSACCION", "FECHA_SALIDA", "WORKER_OBRA", "AREA", "HERRAMIENTA", "ESTADO", "FECHA_DEVOLUCION", "COMENTARIO"]);
    sheet.setTabColor("red");
  }
  
  const timestamp = new Date();
  
  if (datos.action === "TOOL_CHECK_OUT") {
    const idTransaccion = "TX-" + Math.floor(Math.random() * 1000000);
    
    sheet.appendRow([
      idTransaccion,
      timestamp,
      datos.worker,
      datos.area,
      datos.tool,
      "PENDING", // Estado: Pendiente de devolución
      "",        // Fecha devolución vacía
      datos.comment || ""
    ]);
    
    return respuestaJSON({ status: "success", message: "Préstamo registrado", id: idTransaccion });
  } 
  
  else if (datos.action === "TOOL_CHECK_IN") {
    const data = sheet.getDataRange().getValues();
    const idBusqueda = datos.id;
    let filaEncontrada = -1;
    
    // Buscar transacción
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === idBusqueda) {
        filaEncontrada = i + 1;
        break;
      }
    }
    
    if (filaEncontrada === -1) return respuestaJSON({ status: "error", message: "Transacción no encontrada" });
    
    // Actualizar Estado y Fecha Devolución
    sheet.getRange(filaEncontrada, 6).setValue("RETURNED");
    sheet.getRange(filaEncontrada, 7).setValue(timestamp);
    
    return respuestaJSON({ status: "success", message: "Herramienta devuelta" });
  }
  
  return respuestaJSON({ status: "error", message: "Acción no válida" });
}

function obtenerHerramientas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_HERRAMIENTAS);
  
  if (!sheet) return respuestaJSON([]);
  
  const data = sheet.getDataRange().getValues();
  const herramientas = [];
  
  // Devolver todo (o filtrar últimos 100 para optimizar)
  // Estructura: [ID, FECHA_OUT, WORKER, AREA, TOOL, ESTADO, FECHA_IN, COMMENT]
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    herramientas.push({
      id: row[0],
      fechaOut: row[1],
      worker: row[2],
      area: row[3],
      tool: row[4],
      estado: row[5],
      fechaIn: row[6],
      comment: row[7]
    });
  }
  
  // Ordenar: Pendientes primero, luego por fecha más reciente
  herramientas.sort((a, b) => {
    if (a.estado === "PENDING" && b.estado !== "PENDING") return -1;
    if (a.estado !== "PENDING" && b.estado === "PENDING") return 1;
    return new Date(b.fechaOut) - new Date(a.fechaOut);
  });
  
  return respuestaJSON(herramientas);
}

