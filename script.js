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

        // Consulta al Google Sheet de USUARIOS en segundo plano
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
                console.log("ID de PDF cargado con éxito: " + pdfIdDinamico);
            } else {
                console.error("Error al buscar el PDF en Drive: ", data.message);
            }
        })
        .catch(err => {
            console.error("Error de conexión con la API de Google al buscar el PDF:", err);
        });
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
            alert("El sistema aún está localizando el archivo PLAN.pdf en tu Drive. Por favor, espera 2 segundos e intenta nuevamente.");
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
                console.log("ID de PDF Anual cargado con éxito: " + pdfAnualIdDinamico);
            } else {
                console.error("Error al buscar el ANUAL.pdf en Drive: ", data.message);
            }
        })
        .catch(err => {
            console.error("Error de conexión con la API de Google al buscar el PDF Anual:", err);
        });
}

cargarIdPdfAnualDinamico();

if (btnPlan) {
    btnPlan.addEventListener('click', function() {
        if (!pdfAnualIdDinamico) {
            alert("El sistema aún está localizando el archivo ANUAL.pdf en tu Drive. Por favor, espera 2 segundos e intenta nuevamente.");
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


// --- 4. LÓGICA DE FORMULARIOS BODEGA (INGRESO / AUTOCOMPLETADO / ENVÍO) ---
const urlWebApp = "https://script.google.com/macros/s/AKfycbwZQv7ZFhkx7PuoRdh7Vq2AjUK-cVAK8QYyM2lnjXrwlqJMQFR_h2inn7KIlWHi6sOj3A/exec";

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
    }
}

function cerrarFormEgreso() {
    const fEgr = document.getElementById("contenedorEgreso");
    if (fEgr) fEgr.style.display = "none";
}

// Envío de datos a la hoja INGRESO DE DATOS (Columnas A a K)
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

        alert("¡Ingreso registrado correctamente en la hoja 'INGRESO DE DATOS'!");
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

function enviarEgreso() {
    alert("Acción de envío de Egreso (Pendiente de integrar con base de datos/backend).");
}

// Carga de autocompletado y mapeo de Código de Producto desde la hoja PRODUCTOS
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
                if (columnas.length > 4 && columnas[4]) {
                    let codigo = columnas[3] ? columnas[3].trim() : "";
                    let prod = columnas[4].trim();
                    if (prod !== "" && prod.toUpperCase() !== "NOMBRE PRODUCTO") {
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
