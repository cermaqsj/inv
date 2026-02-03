var SCRIPT_PROP = PropertiesService.getScriptProperties();

function doGet(e) {
  var action = e.parameter.action;
  
  if (action == "getInventario") {
    return getInventario();
  }
  
  // Accion para verificar si el servicio esta activo
  if (action == "ping") {
    return ContentService.createTextOutput("pong");
  }

  return ContentService.createTextOutput("Accion no valida");
}

function doPost(e) {
  var action = e.parameter.action;
  
  if (action == "registrarMovimiento") {
    return registrarMovimiento(e);
  }
  
  if (action == "cambiarClave") {
    return cambiarClave(e);
  }
  
  return ContentService.createTextOutput("Accion no valida");
}

// --- SETUP INICIAL ---
// EJECUTAR ESTA FUNCION UNA SOLA VEZ DESDE EL EDITOR DE APPS SCRIPT
function setup() {
  SCRIPT_PROP.setProperty("USER_PASS", "1234");
  SCRIPT_PROP.setProperty("ADMIN_PASS", "mantencioncermaq");
  Logger.log("Contraseñas inicializadas. User: 1234, Admin: mantencioncermaq");
}

function getInventario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("2026");
  var data = sheet.getDataRange().getValues();
  var inventory = [];
  
  // Asumimos que la fila 1 (indice 0) son encabezados
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Mapeo Indices: 0:ID, 1:Nombre, 2:Uni, 3:Stock, 4:Cat, 5:Precio, 6:Total
    var item = {
      id: row[0],
      nombre: row[1],
      uni_medida: row[2],
      stock: row[3],
      categoria: row[4],
      precio: row[5],
      precio_total: row[6]
    };
    inventory.push(item);
  }
  
  return ContentService.createTextOutput(JSON.stringify(inventory)).setMimeType(ContentService.MimeType.JSON);
}

function registrarMovimiento(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMov = ss.getSheetByName("MOVIMIENTOS");
  var sheetInv = ss.getSheetByName("2026");
  
  // Parsear datos del body
  var data = JSON.parse(e.postData.contents);
  var passIngresada = data.clave;
  var passCorrecta = SCRIPT_PROP.getProperty("USER_PASS");
  
  // --- VALIDACION DE SEGURIDAD ---
  if (passIngresada != passCorrecta) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", 
      message: "Contraseña incorrecta"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var idArticulo = data.id;
  var cantidad = parseInt(data.cantidad); 
  var usuario = data.usuario;
  var comentario = data.comentario;
  var accion = cantidad >= 0 ? "ENTRADA" : "SALIDA";
  
  // 1. Buscar el articulo
  var invData = sheetInv.getDataRange().getValues();
  var rowIndex = -1;
  var currentStock = 0;
  var nombreArticulo = "";
  var precioUnitario = 0;
  
  for (var i = 1; i < invData.length; i++) {
    if (invData[i][0] == idArticulo) {
      rowIndex = i + 1; 
      currentStock = parseInt(invData[i][3]); 
      nombreArticulo = invData[i][1];
      precioUnitario = invData[i][5];
      break;
    }
  }
  
  if (rowIndex == -1) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Articulo no encontrado"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. Calcular nuevo stock
  var nuevoStock = currentStock + cantidad;
  
  // 3. Actualizar hoja '2026'
  sheetInv.getRange(rowIndex, 4).setValue(nuevoStock);
  
  // 4. Registrar en 'MOVIMIENTOS'
  var fecha = new Date();
  sheetMov.appendRow([
    fecha,
    accion,
    idArticulo,
    nombreArticulo,
    cantidad,
    nuevoStock,
    usuario,
    comentario,
    precioUnitario
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success", 
    nuevoStock: nuevoStock,
    timestamp: fecha
  })).setMimeType(ContentService.MimeType.JSON);
}

// Nueva funcion para cambiar la clave de usuario
function cambiarClave(e) {
  var data = JSON.parse(e.postData.contents);
  var adminPassIngresada = data.adminPass;
  var nuevaClaveUsuario = data.nuevaClave;
  var adminPassCorrecta = SCRIPT_PROP.getProperty("ADMIN_PASS");
  
  if (adminPassIngresada != adminPassCorrecta) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", 
      message: "Contraseña de Administrador incorrecta"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  SCRIPT_PROP.setProperty("USER_PASS", nuevaClaveUsuario);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success", 
    message: "Clave de usuario actualizada correctamente"
  })).setMimeType(ContentService.MimeType.JSON);
}

function generarSnapshot() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetInv = ss.getSheetByName("2026");
  var sheetHist = ss.getSheetByName("HISTORIAL_STOCK");
  
  var invData = sheetInv.getDataRange().getValues();
  var fechaFoto = new Date();
  
  for (var i = 1; i < invData.length; i++) {
    var row = invData[i];
    var id = row[0];
    var nombre = row[1];
    var stock = row[3];
    
    if (id != "") {
      sheetHist.appendRow([fechaFoto, id, nombre, stock]);
    }
  }
}
