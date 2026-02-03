var SCRIPT_PROP = PropertiesService.getScriptProperties();

function doGet(e) {
  var action = e.parameter.action;
  
  if (action == "getInventario") {
    return getInventario();
  }
  
  if (action == "ping") {
    return ContentService.createTextOutput("pong");
  }

  return ContentService.createTextOutput("Accion no valida");
}

function doPost(e) {
  // 1. Parse Body Once
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    return responseJSON({status: "error", message: "JSON Body invalido"});
  }

  // 2. Determine Action (Priority: URL Param > Body Param)
  var action = e.parameter.action || data.action;

  // 3. Routing
  if (action == "IN" || action == "OUT") {
    return registrarMovimiento(data);
  }
  
  if (action == "ADD") {
    return crearProducto(data);
  }
  
  if (action == "UPDATE_NAME") {
    return actualizarNombre(data);
  }

  if (action == "cambiarClave") {
    return cambiarClave(data);
  }
  
  return responseJSON({status: "error", message: "Accion desconocida: " + action});
}

// --- CORE FUNCTIONS ---

function getInventario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("2026");
  var data = sheet.getDataRange().getValues();
  var inventory = [];
  
  // Skip header
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Filter empty IDs
    if (!row[0]) continue;
    
    // SCHEMA: 0=ID, 1=Nombre, 2=Stock, 3=Categoria
    var item = {
      id: String(row[0]),
      nombre: String(row[1]),
      stock: parseInt(row[2]) || 0, // FIXED: Index 2
      categoria: String(row[3]) || "" // FIXED: Index 3
    };
    inventory.push(item);
  }
  
  return responseJSON(inventory);
}

function registrarMovimiento(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMov = ss.getSheetByName("MOVIMIENTOS");
  var sheetInv = ss.getSheetByName("2026");
  
  // Security Check
  if (!verificarClaveUser(data.clave)) {
    return responseJSON({status: "error", message: "Contraseña incorrecta"});
  }
  
  var idArticulo = String(data.id);
  var cantidad = parseInt(data.quantity);
  // Adjust sign based on action
  var cantidadFinal = (data.action === "OUT") ? -cantidad : cantidad;
  
  var usuario = data.user || "Anonimo";
  var comentario = data.comment || "";
  
  // Find Product
  var invData = sheetInv.getDataRange().getValues();
  var rowIndex = -1;
  var currentStock = 0;
  var nombreArticulo = "";
  
  for (var i = 1; i < invData.length; i++) {
    if (String(invData[i][0]) === idArticulo) {
      rowIndex = i + 1; 
      currentStock = parseInt(invData[i][2]) || 0; // FIXED: Index 2
      nombreArticulo = invData[i][1];
      break;
    }
  }
  
  if (rowIndex == -1) {
    return responseJSON({status: "error", message: "Producto no encontrado en Sheets"});
  }
  
  // Update Stock
  var nuevoStock = currentStock + cantidadFinal;
  
  // WRITING TO COLUMN 3 (Stock)
  sheetInv.getRange(rowIndex, 3).setValue(nuevoStock); // FIXED: Column 3
  
  // Log
  sheetMov.appendRow([
    new Date(),
    data.action,
    idArticulo,
    nombreArticulo,
    Math.abs(cantidadFinal),
    nuevoStock,
    usuario,
    comentario
  ]);
  
  return responseJSON({status: "success", nuevoStock: nuevoStock});
}

function crearProducto(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("2026");
  var sheetMov = ss.getSheetByName("MOVIMIENTOS");
  
  // Auto-ID if requested
  var id = data.id;
  if (id === "AUTO" || !id) {
    id = "GEN-" + Math.floor(Math.random() * 1000000);
  }
  
  // Check duplicates
  var invData = sheet.getDataRange().getValues();
  for (var i = 1; i < invData.length; i++) {
    if (String(invData[i][0]) === String(id)) {
        return responseJSON({status: "error", message: "ID ya existe"});
    }
  }
  
  // Append
  // Structure: ID, Nombre, Stock, Categoria
  sheet.appendRow([
    id,
    data.nombre,
    parseInt(data.stock) || 0,
    "GENERADO" // Categoria default at Col 4 logic
  ]);
  
  // Log Creation
  sheetMov.appendRow([new Date(), "CREACION", id, data.nombre, data.stock, data.stock, data.user, "Alta nueva"]);
  
  return responseJSON({status: "success", id: id, message: "Producto Creado"});
}

function actualizarNombre(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("2026");
  
  var invData = sheet.getDataRange().getValues();
  for (var i = 1; i < invData.length; i++) {
    if (String(invData[i][0]) === String(data.id)) {
        sheet.getRange(i + 1, 2).setValue(data.nombre);
        return responseJSON({status: "success", message: "Nombre actualizado"});
    }
  }
  
  return responseJSON({status: "error", message: "Producto no encontrado"});
}

function cambiarClave(data) {
  var adminPassIngresada = data.adminPass;
  var nuevaClaveUsuario = data.nuevaClave;
  var adminPassCorrecta = SCRIPT_PROP.getProperty("ADMIN_PASS");
  
  if (adminPassIngresada != adminPassCorrecta) {
    return responseJSON({status: "error", message: "Clave Admin incorrecta"});
  }
  
  SCRIPT_PROP.setProperty("USER_PASS", nuevaClaveUsuario);
  return responseJSON({status: "success", message: "Clave actualizada"});
}

// --- UTILS ---

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function verificarClaveUser(input) {
  // If no password set, assume default 1234
  var correct = SCRIPT_PROP.getProperty("USER_PASS") || "1234";
  return String(input) === String(correct);
}

function setup() {
  SCRIPT_PROP.setProperty("USER_PASS", "1234");
  SCRIPT_PROP.setProperty("ADMIN_PASS", "mantencioncermaq");
  Logger.log("Setup Completo");
}
