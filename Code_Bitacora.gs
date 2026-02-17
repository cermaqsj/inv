
// ==========================================
// BACKEND: BITÁCORA DE MANTENCIÓN
// Archivo: Code_Bitacora.gs
// ==========================================

// ID de la Hoja de Cálculo donde se guardarán los datos
// (Reemplaza esto con el ID real de tu hoja "MANTENCIÓN")
const SHEET_ID = "1KFCkva7EhMKEajaGaigPIeNWt4vJVs_1KbJxwErDe44";
const SHEET_NAME = "MANTENCIÓN";

function doPost(e) {
  try {
    // Safety check: ensure postData exists
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "No se recibieron datos (postData is empty)" });
    }

    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    if (action === "MAINTENANCE_LOG") {
      return saveMaintenanceLog(params);
    } else {
      return jsonResponse({ status: "error", message: "Acción desconocida" });
    }

  } catch (error) {
    return jsonResponse({ status: "error", message: "Error Interno: " + error.toString() });
  }
}

function saveMaintenanceLog(data) {
  // data = { worker: "Nombre", tasks: ["Tarea 1", "Tarea 2"] }
  
  try {
    // Abrir la hoja de cálculo por ID
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Si no encuentra la hoja por nombre, usa la primera
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    const timestamp = new Date();
    const workDate = new Date(); // Fecha del trabajo (hoy)
    
    // Variables de tiempo locales (Chile GMT-3 o config de la hoja)
    // Usamos Utilities.formatDate para asegurar consistencia
    const week = Utilities.formatDate(workDate, ss.getSpreadsheetTimeZone(), "w");
    const month = Utilities.formatDate(workDate, ss.getSpreadsheetTimeZone(), "MMMM");
    const year = Utilities.formatDate(workDate, ss.getSpreadsheetTimeZone(), "yyyy");

    const newRows = [];

    // Por cada tarea en la lista, creamos una fila
    data.tasks.forEach(task => {
      const uniqueId = "LOG-" + Math.floor(Math.random() * 1000000).toString();
      
      newRows.push([
        uniqueId,           // A: ID
        timestamp,          // B: FECHA_REGISTRO
        workDate,           // C: FECHA_TRABAJO
        data.worker,        // D: TECNICO
        task,               // E: TAREA
        week,               // F: SEMANA
        month,              // G: MES
        year                // H: AÑO
      ]);
    });

    // Guardar en bloque (más rápido)
    if (newRows.length > 0) {
      // getRange(fila, columna, numFilas, numColumnas)
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 8).setValues(newRows);
    }

    return jsonResponse({ status: "success", message: "Registros guardados: " + newRows.length });

  } catch (e) {
    return jsonResponse({ status: "error", message: "Error al guardar: " + e.toString() });
  }
}

// Utilitario para responder JSON
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función de prueba GET para verificar que el script está vivo
function doGet(e) {
  return ContentService.createTextOutput("Backend Bitácora de Mantención - ACTIVO");
}
