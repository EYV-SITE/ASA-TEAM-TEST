// =========================================================================
// ARCHIVO: script.js - PORTAL ASA TEAM CHILE (VERSIÓN UNIFICADA 2026)
// Developed exclusively for ASA AUTOMATION SpA | Desarrollado por EyV Solutions
// =========================================================================

// --- 1. CONFIGURACIÓN DEL SISTEMA DE LOGIN ---
const URL_API_LOGIN = "https://script.google.com/macros/s/AKfycbzifh_OFapV6c7LAbHuN8_nhgXp04eg6PmnTzTeyQ3hfZ4d8sYhghDd69-R1DkDcnac/exec";

const seccionLogin = document.getElementById('seccion-login');
const seccionContenido = document.getElementById('contenido');
const btnIngresar = document.getElementById('btnIngresar');
const mensajeError = document.getElementById('mensajeError');

if (btnIngresar) {
    btnIngresar.addEventListener('click', function() {
        const usuarioIngresado = document.getElementById('inputUsuario').value.trim();
        const claveIngresada = document.getElementById('inputClave').value.trim();
        
        if (usuarioIngresado === "" || claveIngresada === "") {
            mostrarError("Por favor, completa todos los campos.");
            return;
        }
        
        btnIngresar.innerText = "Verificando...";
        btnIngresar.disabled = true;
        if (mensajeError) mensajeError.style.display = "none";

        fetch(URL_API_LOGIN)
            .then(response => response.json())
            .then(usuarios => {
                const usuarioValido = usuarios.find(u => 
                    u.usuario.toLowerCase() === usuarioIngresado.toLowerCase() && 
                    u.clave === claveIngresada && 
                    u.estado.toLowerCase() === "activo"
                );

                if (usuarioValido) {
                    seccionLogin.style.display = "none";
                    seccionContenido.style.display = "block";
                } else {
                    mostrarError("Usuario/Clave incorrectos o cuenta inactiva.");
                    reestablecerBoton();
                }
            })
            .catch(error => {
                console.error("Error conectando con la base de datos de usuarios:", error);
                mostrarError("Error de conexión. Inténtalo de nuevo.");
                reestablecerBoton();
            });
    });
}

function mostrarError(texto) {
    if (mensajeError) {
        mensajeError.innerText = texto;
        mensajeError.style.display = "block";
    }
}

function reestablecerBoton() {
    if (btnIngresar) {
        btnIngresar.innerText = "Ingresar";
        btnIngresar.disabled = false;
    }
}


// --- 2. LÓGICA PARA NUEVO MENÚ DE INVENTARIO (VISTA PREVIA / PDF EN VIVO) ---
const botonInventario = document.getElementById('btnInventario');
const modalInventario = document.getElementById('modalInventario');
const btnOptEditable = document.getElementById('btnOptEditable');
const btnOptPDF = document.getElementById('btnOptPDF');
const btnCancelarModal = document.getElementById('btnCancelarModal');

const visor = document.getElementById('contenedorPDF');
const iframeInventario = document.getElementById('iframeInventario');

const urlEditable = "https://docs.google.com/spreadsheets/d/1i_ZB-IuV3Pt1tiE4U8_9uEtLkNdRIZ3B2AXo_y5C6SM/edit?rm=minimal&gid=689203295";
const URL_API_PDF = "https://script.google.com/macros/s/AKfycbwY5qzIVzXSzfa0-MXuJquOdU8LR8Z4EGT55ltRXx6-QxhiizzJ9nco09o41lhH3DI/exec";

let pdfIdDinamico = "";

function cargarIdPdfDinamico() {
    const urlConsulta = URL_API_PDF + "?action=get_pdf";
    fetch(urlConsulta)
        .then(response => response.json())
        .then(data => {
            if (data && data.status === "success") {
                pdfIdDinamico = data.id;
            }
        })
        .catch(err => console.error("Error buscando PDF:", err));
}

cargarIdPdfDinamico();

if (botonInventario) {
    botonInventario.addEventListener('click', function() {
        if (modalInventario) modalInventario.style.display = "flex";
    });
}

if (btnOptEditable) {
    btnOptEditable.addEventListener('click', function() {
        window.open(urlEditable, '_blank');
        if (modalInventario) modalInventario.style.display = "none";
    });
}

if (btnOptPDF) {
    btnOptPDF.addEventListener('click', function() {
        if (!pdfIdDinamico) {
            alert("El sistema aún está localizando el archivo PLAN.pdf en tu Drive. Espera un momento.");
            cargarIdPdfDinamico();
            return;
        }

        if (iframeInventario) {
            iframeInventario.src = "https://drive.google.com/file/d/" + pdfIdDinamico + "/preview?v=" + new Date().getTime();
            iframeInventario.style.width = "100%";
            iframeInventario.style.height = "600px"; 
        }
        if (visor) {
            visor.style.display = "block";
            visor.style.width = "100%";
            visor.style.maxWidth = "100%";
            visor.style.boxSizing = "border-box";
        }
        if (modalInventario) modalInventario.style.display = "none";
        if (visor) visor.scrollIntoView({ behavior: 'smooth' });
    });
}

if (btnCancelarModal) {
    btnCancelarModal.addEventListener('click', function(e) {
        e.preventDefault();
        if (modalInventario) modalInventario.style.display = "none";
    });
}

function cerrarVisor() {
    if (visor) visor.style.display = "none";
    if (iframeInventario) iframeInventario.src = ""; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- 3. LÓGICA PARA VISOR DEL PLAN ANUAL ---
const btnPlan = document.getElementById('btnReportes');
const visorPlan = document.getElementById('contenedorPlan');
const iframePlan = document.getElementById('iframePlan');
const URL_API_ANUAL_PDF = "https://script.google.com/macros/s/AKfycbzfbN73_IyRlxDRtALXREKWM9UTYMhTFERvGx-6OVewPkVYyeKjCfkywwP8BhYtVaQ/exec";

let pdfAnualIdDinamico = "";

function cargarIdPdfAnualDinamico() {
    const urlConsulta = URL_API_ANUAL_PDF + "?action=get_pdf";
    fetch(urlConsulta)
        .then(response => response.json())
        .then(data => {
            if (data && data.status === "success") {
                pdfAnualIdDinamico = data.id;
            }
        })
        .catch(err => console.error("Error buscando PDF Anual:", err));
}

cargarIdPdfAnualDinamico();

if (btnPlan) {
    btnPlan.addEventListener('click', function() {
        if (!pdfAnualIdDinamico) {
            alert("El sistema aún está localizando el archivo ANUAL.pdf en tu Drive. Espera un momento.");
            cargarIdPdfAnualDinamico();
            return;
        }

        if (visorPlan) {
            if (visorPlan.style.display === "none" || visorPlan.style.display === "") {
                if (iframePlan) {
                    iframePlan.src = "https://drive.google.com/file/d/" + pdfAnualIdDinamico + "/preview?v=" + new Date().getTime();
                    iframePlan.style.width = "100%";
                    iframePlan.style.height = "600px";
                }
                visorPlan.style.display = "block";
                visorPlan.style.width = "100%";
                visorPlan.style.maxWidth = "100%";
                visorPlan.style.boxSizing = "border-box";
                visorPlan.scrollIntoView({ behavior: 'smooth' });
            } else {
                visorPlan.style.display = "none";
                if (iframePlan) iframePlan.src = "";
            }
        }
    });
}

function cerrarPlan() {
    const vp = document.getElementById('contenedorPlan');
    const ip = document.getElementById('iframePlan');
    if (vp) vp.style.display = "none";
    if (ip) ip.src = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- 4. LÓGICA DE RESPONSABLES COMERCIALES (DIRECTORIO DE CLIENTES) ---
const urlCSVClientes = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnIZ946fJMi0Z43hNigGSDMtY_j3J5P4wXe7YwtPKu_3JT1ObCnKMAhPzlCBJcRrrB_u4YKp2WMQI8/pub?output=csv";
let datosClientes = [];

async function cargarDatos() {
    try {
        const respuesta = await fetch(urlCSVClientes);
        const texto = await respuesta.text();
        
        const filas = texto.split("\n").map(row => row.split(","));
        const encabezados = filas[0].map(h => h.trim());
        
        datosClientes = filas.slice(1).map(fila => {
            let cliente = {};
            encabezados.forEach((encabezado, index) => {
                cliente[encabezado] = fila[index] ? fila[index].trim() : "";
            });
            return cliente;
        }).filter(c => c["CLIENTE"]);

        generarBotones();
    } catch (error) {
        const contenedor = document.getElementById("contenedor-botones");
        if (contenedor) {
            contenedor.innerHTML = "Error al cargar los datos.";
        }
        console.error("Error cargando clientes:", error);
    }
}

function generarBotones() {
    const contenedor = document.getElementById("contenedor-botones");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    datosClientes.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-cliente";
        btn.innerText = item["CLIENTE"];
        btn.onclick = () => abrirModal(index);
        contenedor.appendChild(btn);
    });
}

function abrirModal(index) {
    const cliente = datosClientes[index];
    
    document.getElementById("modal-titulo").innerText = cliente["CLIENTE"] || "Sin datos";
    document.getElementById("modal-jefe").innerText = cliente["JEFE DE CUENTAS"] || "-";
    document.getElementById("modal-email").innerText = cliente["FANUC"] || "-";
    document.getElementById("modal-contacto").innerText = cliente["EQUIPO ASA"] || "-";
    document.getElementById("modal-industria").innerText = cliente["TIPO DE INDUSTRIA"] || "-";
    
    document.getElementById("modal-cliente").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-cliente").style.display = "none";
}

function toggleResponsables() {
    const cont = document.getElementById("contenedorResponsables");
    if (cont.style.display === "none" || cont.style.display === "") {
        cont.style.display = "block";
        if (datosClientes.length === 0) {
            cargarDatos();
        }
        setTimeout(() => {
            cont.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        cont.style.display = "none";
    }
}


// --- 5. LÓGICA DE FORMULARIOS BODEGA (INGRESO / AUTOCOMPLETADO / ENVÍO) ---
const urlWebApp = "https://script.google.com/macros/s/AKfycbwZtyPyWHXhNPcYclX7kpozPzQcNj8-mvtjG97HZn5rBOdWZ7l9EbMZf2JASIUUsXeikw/exec";

function toggleMenuBodega() {
    const menu = document.getElementById("menuBodegaOpciones");
    const fIng = document.getElementById("contenedorIngreso");
    const fEgr = document.getElementById("contenedorEgreso");
    
    if (fIng) fIng.style.display = "none";
    if (fEgr) fEgr.style.display = "none";

    if (menu) {
        if (menu.style.display === "block") {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
            menu.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function mostrarFormIngreso() {
    const menu = document.getElementById("menuBodegaOpciones");
    const fEgr = document.getElementById("contenedorEgreso");
    const fIng = document.getElementById("contenedorIngreso");

    if (menu) menu.style.display = "none";
    if (fEgr) fEgr.style.display = "none";

    if (fIng) {
        fIng.style.display = "block";
        fIng.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cargarProductosInventario();
    }
}

function cerrarFormIngreso() {
    const fIng = document.getElementById("contenedorIngreso");
    if (fIng) fIng.style.display = "none";
}

function mostrarFormEgreso() {
    const menu = document.getElementById("menuBodegaOpciones");
    const fIng = document.getElementById("contenedorIngreso");
    const fEgr = document.getElementById("contenedorEgreso");

    if (menu) menu.style.display = "none";
    if (fIng) fIng.style.display = "none";

    if (fEgr) {
        fEgr.style.display = "block";
        fEgr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cargarProductosEgreso();
    }
}

function cerrarFormEgreso() {
    const fEgr = document.getElementById("contenedorEgreso");
    if (fEgr) fEgr.style.display = "none";
    reiniciarFormEgreso();
}

async function enviarIngreso() {
    const productoNombre = document.getElementById("ing_Producto").value.trim();
    const cantidad = document.getElementById("ing_cantidad").value.trim();
    const rack = document.getElementById("ing_rack").value.trim();
    const nivel = document.getElementById("ing_nivel").value.trim();
    const comentario = document.getElementById("ing_comentario").value.trim();
    const valorGuia = document.getElementById("ing_valor").value.trim();
    const monedaEl = document.querySelector('input[name="ing_moneda"]:checked');
    const moneda = monedaEl ? monedaEl.value : "CLP";
    const usuarioEl = document.getElementById("inputUsuario");
    const usuario = (usuarioEl && usuarioEl.value.trim() !== "") ? usuarioEl.value.trim() : "Sistema";

    if (!productoNombre || !cantidad) {
        alert("Por favor completa al menos el Producto y la Cantidad.");
        return;
    }

    let codigoProducto = "";
    const itemEncontrado = mapaProductosCodigos.get(productoNombre.toLowerCase());
    if (itemEncontrado) {
        codigoProducto = itemEncontrado;
    }

    const datosEnvio = {
        tipoOperacion: "Ingreso",
        usuario: usuario,
        codigoProducto: codigoProducto,
        producto: productoNombre,
        cantidad: cantidad,
        rack: rack,
        nivel: nivel,
        comentario: comentario,
        valorGuia: valorGuia,
        moneda: moneda
    };

    try {
        const botonEnviar = event ? event.target : null;
        if (botonEnviar) {
            botonEnviar.disabled = true;
            botonEnviar.innerText = "Enviando...";
        }

        await fetch(urlWebApp, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosEnvio)
        });

        alert("¡Ingreso registrado correctamente en la hoja 'INGRESO DATOS'!");
        cerrarFormIngreso();
        
        document.getElementById("ing_Producto").value = "";
        document.getElementById("ing_cantidad").value = "";
        document.getElementById("ing_rack").value = "";
        document.getElementById("ing_nivel").value = "";
        document.getElementById("ing_comentario").value = "";
        document.getElementById("ing_valor").value = "";

        if (botonEnviar) {
            botonEnviar.disabled = false;
            botonEnviar.innerText = "Enviar";
        }
    } catch (error) {
        console.error("Error al enviar los datos:", error);
        alert("Hubo un error al registrar el ingreso. Inténtalo nuevamente.");
        const botonEnviar = event ? event.target : null;
        if (botonEnviar) {
            botonEnviar.disabled = false;
            botonEnviar.innerText = "Enviar";
        }
    }
}

const urlCSVProductos = "https://docs.google.com/spreadsheets/d/1i_ZB-IuV3Pt1tiE4U8_9uEtLkNdRIZ3B2AXo_y5C6SM/export?format=csv&gid=379760357";
let listaProductosInventario = [];
let mapaProductosCodigos = new Map();

function parsearLineaCSV(linea) {
    const resultado = [];
    let inicio = 0;
    let enComillas = false;
    for (let i = 0; i < linea.length; i++) {
        if (linea[i] === '"') {
            enComillas = !enComillas;
        } else if (linea[i] === ',' && !enComillas) {
            let campo = linea.substring(inicio, i).trim();
            campo = campo.replace(/^"|"$/g, '').trim();
            resultado.push(campo);
            inicio = i + 1;
        }
    }
    let ultimoCampo = linea.substring(inicio).trim().replace(/^"|"$/g, '').trim();
    resultado.push(ultimoCampo);
    return resultado;
}

async function cargarProductosInventario() {
    if (listaProductosInventario.length > 0) return;
    try {
        const respuesta = await fetch(urlCSVProductos);
        const texto = await respuesta.text();
        const lineas = texto.split("\n");
        
        let productosSet = new Set();
        lineas.forEach((linea, idx) => {
            if (idx > 0 && linea.trim() !== "") {
                const columnas = parsearLineaCSV(linea);
                if (columnas.length >= 4) {
                    let codigo = columnas[3] ? columnas[3].trim() : (columnas[4] ? columnas[4].trim() : "");
                    let prod = "";
                    
                    for (let i = 3; i < columnas.length; i++) {
                        let val = columnas[i] ? columnas[i].trim() : "";
                        if (val !== "" && isNaN(val) && !val.toUpperCase().includes("CODIGO")) {
                            prod = val;
                        }
                    }
                    
                    if (prod && prod.toUpperCase() !== "NOMBRE PRODUCTO" && prod.toUpperCase() !== "CODIGO") {
                        productosSet.add(prod);
                        mapaProductosCodigos.set(prod.toLowerCase(), codigo);
                    }
                }
            }
        });
        listaProductosInventario = Array.from(productosSet);
    } catch (e) {
        console.error("Error cargando productos de la hoja PRODUCTOS:", e);
    }
}

const inputProductoIng = document.getElementById('ing_Producto');
const listaSugerencias = document.getElementById('listaAutocompletado');
const inputComentarioIng = document.getElementById('ing_comentario');

if (inputProductoIng) {
    inputProductoIng.addEventListener('input', function() {
        const valor = this.value.trim();
        if (listaSugerencias) listaSugerencias.innerHTML = "";
        
        if (valor.length < 3) return;

        const valorLower = valor.toLowerCase();
        const coincidencias = listaProductosInventario.filter(prod => prod.toLowerCase().includes(valorLower));

        coincidencias.forEach(prod => {
            const itemDiv = document.createElement("div");
            itemDiv.innerHTML = prod;
            itemDiv.addEventListener("click", function() {
                inputProductoIng.value = prod;
                if (listaSugerencias) listaSugerencias.innerHTML = "";
            });
            if (listaSugerencias) listaSugerencias.appendChild(itemDiv);
        });

        const otroDiv = document.createElement("div");
        otroDiv.innerHTML = "<strong>OTRO</strong>";
        otroDiv.style.color = "#0070f3";
        otroDiv.addEventListener("click", function() {
            inputProductoIng.value = "OTRO";
            if (inputComentarioIng) inputComentarioIng.value = "Ingresa aquí el nombre del producto para su creación";
            if (listaSugerencias) listaSugerencias.innerHTML = "";
        });
        if (listaSugerencias) listaSugerencias.appendChild(otroDiv);
    });

    document.addEventListener("click", function (e) {
        if (e.target !== inputProductoIng && listaSugerencias) {
            listaSugerencias.innerHTML = "";
        }
    });
}


// --- 6. LÓGICA DE EGRESO BODEGA (CONSULTA DE STOCK + RETIRO) ---
// Hoja PRODUCTOS (CSV): 0 ITEM, 3 CODIGO, 4 NOMBRE PRODUCTO, 5 INGRESO, 6 EGRESO, 7 TOTAL (disponible)
let productosEgreso = [];
let productoEgresoSel = null;

const egInput = document.getElementById('eg_Producto');
const egLista = document.getElementById('eg_listaAutocompletado');

function etiquetaEgreso(p) {
    return p.nombre;
}

// Interpreta un número entero positivo. Acepta 1000 y 1.000 (punto de miles).
// Rechaza 1,000 / 1,5 / 1.5 / 0.001 / letras / negativos / 0. Devuelve null si no es válido.
function parsearEnteroChileno(texto) {
    const t = String(texto).trim();
    let n = null;
    if (/^[1-9]\d{0,8}$/.test(t)) {
        n = Number(t);
    } else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(t)) {
        n = Number(t.replace(/\./g, ""));
    }
    return (n !== null && n <= 1000000000) ? n : null;
}

// Muestra un entero con punto de miles: 1000 -> 1.000
function formatearEntero(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Mensaje bajo la guía de despacho (tipo "ok" = verde, otro = rojo)
function mensajeEgresoResultado(texto, tipo) {
    const el = document.getElementById("eg_resultado");
    if (!el) return;
    el.innerText = texto;
    el.style.color = (tipo === "ok") ? "#1e7e34" : "#c82333";
}

function mensajeBusquedaEgreso(texto) {
    const el = document.getElementById("eg_mensajeBusqueda");
    if (el) el.innerText = texto;
}

async function cargarProductosEgreso() {
    if (productosEgreso.length > 0) return;
    try {
        const respuesta = await fetch(urlCSVProductos);
        const texto = await respuesta.text();
        texto.split("\n").forEach((linea, idx) => {
            if (idx === 0 || linea.trim() === "") return;
            const c = parsearLineaCSV(linea);
            const item = c[0], codigo = (c[3] || "").toUpperCase(), nombre = c[4];
            // Solo filas con ITEM numérico, nombre y un código válido (letras + 4 números)
            if (!/^\d+$/.test(item) || !nombre || !/^[A-Z]{1,2}\d{4}$/.test(codigo)) return;
            productosEgreso.push({ item: item, codigo: codigo, nombre: nombre, consultado: false });
        });
    } catch (e) {
        console.error("Error cargando productos para egreso:", e);
        mensajeBusquedaEgreso("No se pudo cargar la lista de productos. Inténtalo de nuevo.");
    }
}

function limpiarResultadoEgreso() {
    ["eg_lbl_codigo", "eg_lbl_rack", "eg_lbl_nivel", "eg_lbl_disponible", "eg_lbl_modificacion", "eg_lbl_comentario"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "-";
    });
    const resumen = document.getElementById("eg_resumen");
    if (resumen) resumen.innerText = "Busca y selecciona un producto en el cuadro 1.";
    const hint = document.getElementById("eg_hint");
    if (hint) hint.innerText = "Máximo disponible: -";
}

function reiniciarFormEgreso() {
    productoEgresoSel = null;
    if (egInput) egInput.value = "";
    if (egLista) egLista.innerHTML = "";
    const cant = document.getElementById("eg_cantidad");
    if (cant) cant.value = "";
    const guia = document.getElementById("eg_guia");
    if (guia) guia.value = "";
    const msg = document.getElementById("eg_mensaje");
    if (msg) msg.innerText = "";
    mensajeEgresoResultado("", "error");
    mensajeBusquedaEgreso("");
    limpiarResultadoEgreso();
}

function mostrarResultadoEgreso(p, d) {
    // d = respuesta del servidor (Apps Script): codigo, disponible, rack, nivel, comentario, fecha
    p.disponible = Number(d.disponible) || 0;
    p.consultado = true;
    document.getElementById("eg_lbl_codigo").value = d.codigo || p.codigo || "-";
    document.getElementById("eg_lbl_disponible").value = formatearEntero(p.disponible);
    document.getElementById("eg_lbl_rack").value = d.rack || "-";
    document.getElementById("eg_lbl_nivel").value = d.nivel || "-";
    document.getElementById("eg_lbl_comentario").value = d.comentario || "-";
    document.getElementById("eg_lbl_modificacion").value = d.fecha || "-";
    const resumen = document.getElementById("eg_resumen");
    resumen.innerHTML = "<span style='color:#555'>Retirarás:</span> <strong></strong>";
    resumen.querySelector("strong").innerText = etiquetaEgreso(p);
    document.getElementById("eg_hint").innerText = "Máximo disponible: " + formatearEntero(Math.max(0, p.disponible));
    validarCantidadEgreso();
}

async function buscarStockEgreso() {
    mensajeBusquedaEgreso("");
    await cargarProductosEgreso();
    if (!productoEgresoSel) {
        const texto = egInput.value.trim().toLowerCase();
        const exactos = productosEgreso.filter(p => p.nombre.toLowerCase() === texto);
        if (exactos.length === 1) {
            productoEgresoSel = exactos[0];
        } else {
            mensajeBusquedaEgreso(exactos.length > 1
                ? "Hay varios productos con ese nombre. Elige uno de la lista de sugerencias."
                : "Selecciona un producto de la lista de sugerencias.");
            return;
        }
    }

    const boton = document.getElementById("btnBuscarEgreso");
    if (boton) { boton.disabled = true; boton.innerText = "Buscando..."; }
    try {
        // Consulta al Apps Script de Bodega (stock, ubicación, comentario y fecha)
        const url = urlWebApp + "?action=stock&codigo=" + encodeURIComponent(productoEgresoSel.codigo) + "&t=" + Date.now();
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        if (datos.status !== "success") {
            productoEgresoSel.consultado = false;
            mensajeBusquedaEgreso(datos.message || "No se pudo consultar el stock.");
            return;
        }
        mostrarResultadoEgreso(productoEgresoSel, datos);
    } catch (e) {
        console.error("Error consultando stock:", e);
        if (productoEgresoSel) productoEgresoSel.consultado = false;
        mensajeBusquedaEgreso("Error de conexión al consultar el stock. Inténtalo de nuevo.");
    } finally {
        if (boton) { boton.disabled = false; boton.innerText = "Buscar"; }
    }
}

// Valida la cantidad a retirar y muestra el mensaje correspondiente
function validarCantidadEgreso() {
    const valor = document.getElementById("eg_cantidad").value.trim();
    const msg = document.getElementById("eg_mensaje");
    msg.style.color = "#c82333";
    if (valor === "") {
        msg.innerText = "";
        return false;
    }
    const n = parsearEnteroChileno(valor);
    if (n === null) {
        msg.innerText = "Caracteres no válidos. Ingresa solo números enteros positivos (ej: 1000 o 1.000).";
        return false;
    }
    if (productoEgresoSel && productoEgresoSel.consultado && n > productoEgresoSel.disponible) {
        msg.innerText = "No existe stock suficiente. Disponible: " + formatearEntero(Math.max(0, productoEgresoSel.disponible)) + ".";
        return false;
    }
    msg.style.color = "#555";
    msg.innerText = "Se registrará: " + formatearEntero(n);
    return true;
}

let enviandoEgreso = false;

async function enviarEgreso() {
    if (enviandoEgreso) return;
    mensajeEgresoResultado("", "error");

    if (!productoEgresoSel) {
        mensajeBusquedaEgreso("Primero busca y selecciona un producto.");
        return;
    }
    if (!productoEgresoSel.consultado) {
        mensajeBusquedaEgreso("Presiona Buscar para consultar el stock antes de enviar.");
        return;
    }
    const cantidadTxt = document.getElementById("eg_cantidad").value.trim();
    if (cantidadTxt === "") {
        document.getElementById("eg_mensaje").innerText = "Ingresa la cantidad a retirar.";
        return;
    }
    if (!validarCantidadEgreso()) return;
    const cantidad = parsearEnteroChileno(cantidadTxt);

    const guia = document.getElementById("eg_guia").value.trim();
    if (guia === "") {
        mensajeEgresoResultado("Ingresa el N° de Guía de Despacho.", "error");
        return;
    }

    const usuarioEl = document.getElementById("inputUsuario");
    const usuario = (usuarioEl && usuarioEl.value.trim() !== "") ? usuarioEl.value.trim() : "Sistema";

    const datosEnvio = {
        tipoOperacion: "Egreso",
        usuario: usuario,
        codigoProducto: productoEgresoSel.codigo,
        cantidad: cantidad,
        guiaDespacho: guia
    };

    const boton = document.getElementById("btnEnviarEgreso");
    enviandoEgreso = true;
    if (boton) { boton.disabled = true; boton.innerText = "Enviando..."; }

    try {
        // text/plain evita el "preflight" de CORS y permite leer la respuesta real del servidor
        const respuesta = await fetch(urlWebApp, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(datosEnvio)
        });
        const resultado = await respuesta.json();

        if (resultado.status === "success") {
            document.getElementById("eg_cantidad").value = "";
            document.getElementById("eg_guia").value = "";
            document.getElementById("eg_mensaje").innerText = "";
            await buscarStockEgreso();   // refresca stock y fecha de última modificación
            mensajeEgresoResultado("Egreso registrado correctamente. Stock disponible: " + formatearEntero(resultado.disponible) + ".", "ok");
        } else {
            mensajeEgresoResultado(resultado.message || "El servidor no pudo registrar el egreso.", "error");
        }
    } catch (e) {
        console.error("Error al enviar el egreso:", e);
        mensajeEgresoResultado("No se pudo confirmar el envío. Presiona Buscar para ver el stock actual antes de reintentar.", "error");
    } finally {
        enviandoEgreso = false;
        if (boton) { boton.disabled = false; boton.innerText = "Enviar"; }
    }
}

if (egInput) {
    egInput.addEventListener('input', function() {
        productoEgresoSel = null;
        limpiarResultadoEgreso();
        mensajeBusquedaEgreso("");
        if (egLista) egLista.innerHTML = "";

        const valor = this.value.trim().toLowerCase();
        if (valor.length < 3) return;

        productosEgreso.filter(p => p.nombre.toLowerCase().includes(valor)).slice(0, 30).forEach(p => {
            const itemDiv = document.createElement("div");
            itemDiv.innerText = etiquetaEgreso(p);
            itemDiv.addEventListener("click", function() {
                egInput.value = etiquetaEgreso(p);
                productoEgresoSel = p;
                egLista.innerHTML = "";
            });
            egLista.appendChild(itemDiv);
        });
    });

    document.addEventListener("click", function(e) {
        if (e.target !== egInput && egLista) egLista.innerHTML = "";
    });
}

["eg_cantidad", "eg_guia", "eg_Producto"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => mensajeEgresoResultado("", "error"));
});
