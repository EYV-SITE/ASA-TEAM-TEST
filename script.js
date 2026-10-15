// =========================================================================
// ARCHIVO: script.js - PORTAL ASA TEAM CHILE (VERSIÓN UNIFICADA 2026)
// Developed exclusively for ASA AUTOMATION SpA | Desarrollado por EyV Solutions
// =========================================================================

// --- 1. CONFIGURACIÓN DEL SISTEMA DE LOGIN ---
// URL que maneja la base de datos de usuarios y claves (NO MODIFICAR)
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
        mensajeError.style.display = "none";

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

// Enlace dinámico para la versión editable
const urlEditable = "https://docs.google.com/spreadsheets/d/1i_ZB-IuV3Pt1tiE4U8_9uEtLkNdRIZ3B2AXo_y5C6SM/edit?rm=minimal&gid=689203295";

// URL de la API del PDF Inventario para buscar el archivo por nombre
const URL_API_PDF = "https://script.google.com/macros/s/AKfycbwY5qzIVzXSzfa0-MXuJquOdU8LR8Z4EGT55ltRXx6-QxhiizzJ9nco09o41lhH3DI/exec";

// Variable global donde almacenaremos el ID dinámico obtenido desde Drive
let pdfIdDinamico = "";

// Función para ir a buscar el ID del archivo "PLAN.pdf" por su nombre a tu carpeta de Drive
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

// Ejecutamos la consulta inmediatamente al cargar la página para tener el ID listo
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
        // En caso de que la conexión sea lenta y la API del PDF no haya devuelto el ID aún
        if (!pdfIdDinamico) {
            alert("El sistema aún está localizando el archivo PLAN.pdf en tu Drive. Por favor, espera 2 segundos e intenta nuevamente.");
            cargarIdPdfDinamico(); // Volvemos a intentar la consulta
            return;
        }

        if (iframeInventario) {
            // Reconstrucción dinámica del visor apuntando al ID obtenido por nombre
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


// --- 3. LÓGICA PARA VISOR DEL PLAN ANUAL (ACTUALIZADA) ---
const btnPlan = document.getElementById('btnReportes');
const visorPlan = document.getElementById('contenedorPlan');
const iframePlan = document.getElementById('iframePlan');

// URL de la API del PDF Plan Anual recién creada
const URL_API_ANUAL_PDF = "https://script.google.com/macros/s/AKfycbzfbN73_IyRlxDRtALXREKWM9UTYMhTFERvGx-6OVewPkVYyeKjCfkywwP8BhYtVaQ/exec";

// Variable global para almacenar el ID dinámico del ANUAL.pdf
let pdfAnualIdDinamico = "";

// Función para ir a buscar el ID del archivo "ANUAL.pdf" por su nombre a la carpeta de Drive
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

// Ejecutamos la consulta inmediatamente al cargar la página para tener el ID listo
cargarIdPdfAnualDinamico();

if (btnPlan) {
    btnPlan.addEventListener('click', function() {
        // Si la conexión es lenta y la API aún no devuelve el ID
        if (!pdfAnualIdDinamico) {
            alert("El sistema aún está localizando el archivo ANUAL.pdf en tu Drive. Por favor, espera 2 segundos e intenta nuevamente.");
            cargarIdPdfAnualDinamico(); // Reintentamos la consulta
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
