
// ... (previous code remains similar, adding helper function)

function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const accion = params.action;

        if (accion === "IN" || accion === "OUT") {
            return procesarMovimiento(params);
        } else if (accion === "ADD") {
            return agregarProducto(params); // <--- NUEVO
        } else {
            return respuestaJSON({ error: "Acción no válida" });
        }
    } catch (error) {
        return respuestaJSON({ error: error.toString() });
    }
}

function agregarProducto(datos) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_INVENTARIO);

    // Validar si ya existe
    const data = sheet.getDataRange().getValues();
    const idNuevo = String(datos.id);

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][KOL.ID]) === idNuevo) {
            return respuestaJSON({ status: "error", message: "El ID ya existe: " + idNuevo });
        }
    }

    // Preparar fila nueva. 
    // Estructura: [ID, NOMBRE, UNIDAD, STOCK, CATEGORIA, PRECIO]
    // Asumimos columnas estándar basada en el archivo CERMAQ
    // Col A(0): ID
    // Col B(1): Nombre
    // Col C(2): Unidad (Default: UNIDAD)
    // Col D(3): Stock
    // Col E(4): Categoria (Opcional)
    // Col F(5): Precio (Opcional)

    const fecha = new Date();

    sheet.appendRow([
        datos.id,           // A
        datos.nombre,       // B
        "UNIDAD",           // C (Por defecto)
        datos.stock || 0,   // D
        "GENERAL",          // E (Categoría default)
        datos.precio || 0,  // F
        ""                  // G (Total, suele ser fórmula)
    ]);

    return respuestaJSON({ status: "success", message: "Producto creado correctamente" });
}
