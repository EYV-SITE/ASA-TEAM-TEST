// =========================================================================
// catalogos.js - Botón "Catalogos/Manuales" (PORTAL ASA TEAM CHILE)
// Archivo independiente: todo va dentro de una función para no chocar con script.js
// =========================================================================
(function () {
    "use strict";

    // Apps Script "API CATALOGOS ASA" (lee la carpeta de Drive)
    var API = "https://script.google.com/macros/s/AKfycbwnqx7A6rQ4I-YkNgkI6Z9JdQfWpUZW0pQ8uI8sBXBkHoTUaKDahXJNDg71lc1oG3yQ/exec";

    var boton = document.getElementById("btnConfig");
    var panel = document.getElementById("contenedorCatalogos");
    if (!boton || !panel) return;

    var lista = document.getElementById("catLista");
    var ruta = document.getElementById("catRuta");
    var buscar = document.getElementById("catBuscar");
    var visor = document.getElementById("catVisor");
    var visorFrame = document.getElementById("catVisorFrame");
    var visorTitulo = document.getElementById("catVisorTitulo");
    var visorDescargar = document.getElementById("catVisorDescargar");
    var visorNueva = document.getElementById("catVisorNueva");
    var visorCerrar = document.getElementById("catVisorCerrar");

    var memoria = {};     // carpetas ya leídas (para volver sin esperar)
    var actual = null;    // carpeta que se está mostrando
    var focoPrevio = null;

    function el(etiqueta, clase, texto) {
        var e = document.createElement(etiqueta);
        if (clase) e.className = clase;
        if (texto !== undefined) e.textContent = texto;
        return e;
    }

    // ---------- Iconos ----------
    var TIPOS = {
        pdf: ["PDF", "#d93025"],
        doc: ["DOC", "#2b579a"], docx: ["DOC", "#2b579a"],
        xls: ["XLS", "#1e7e45"], xlsx: ["XLS", "#1e7e45"], csv: ["CSV", "#1e7e45"],
        ppt: ["PPT", "#c4472a"], pptx: ["PPT", "#c4472a"],
        zip: ["ZIP", "#7a5c1e"], rar: ["RAR", "#7a5c1e"], "7z": ["7Z", "#7a5c1e"],
        jpg: ["IMG", "#7b3fa0"], jpeg: ["IMG", "#7b3fa0"], png: ["IMG", "#7b3fa0"], gif: ["IMG", "#7b3fa0"],
        dwg: ["DWG", "#455a64"], txt: ["TXT", "#5f6b7a"]
    };

    function tipoDe(a) {
        if (a.esPdf) return TIPOS.pdf;
        if (a.tipo === "application/vnd.google-apps.document") return TIPOS.doc;
        if (a.tipo === "application/vnd.google-apps.spreadsheet") return TIPOS.xls;
        if (a.tipo === "application/vnd.google-apps.presentation") return TIPOS.ppt;
        var punto = a.nombre.lastIndexOf(".");
        var ext = punto >= 0 ? a.nombre.slice(punto + 1).toLowerCase() : "";
        return TIPOS[ext] || ["ARCH", "#5f6b7a"];
    }

    function iconoArchivo(tipo) {
        var d = el("div", "cat-icono");
        d.innerHTML = '<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">' +
            '<path d="M2 2h20l10 10v28H2z" fill="#fff" stroke="#c5ced9" stroke-width="2"/>' +
            '<path d="M22 2v10h10" fill="#e8edf3" stroke="#c5ced9" stroke-width="2"/>' +
            '<rect x="2" y="22" width="30" height="14" rx="2" fill="' + tipo[1] + '"/>' +
            '<text x="17" y="33" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#fff">' + tipo[0] + '</text></svg>';
        return d;
    }

    function iconoCarpeta() {
        var d = el("div", "cat-icono");
        d.innerHTML = '<svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">' +
            '<path d="M2 5a3 3 0 0 1 3-3h8l3 4h13a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#0070f3"/></svg>';
        return d;
    }

    // ---------- Formatos ----------
    function tamano(b) {
        if (!b) return "";
        if (b < 1024) return b + " B";
        if (b < 1048576) return Math.round(b / 1024) + " KB";
        return (b / 1048576).toFixed(1).replace(".", ",") + " MB";
    }

    function fechaCorta(iso) {
        var d = new Date(iso);
        return isNaN(d) ? "" : d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    // ---------- Carga ----------
    function cargar(id, forzar) {
        id = id || "";
        if (!forzar && memoria[id]) { mostrar(memoria[id]); return; }

        lista.replaceChildren(el("p", "cat-msg", "Cargando..."));
        var url = API + "?action=list" + (id ? "&id=" + encodeURIComponent(id) : "") + (forzar ? "&refresh=1" : "") + "&t=" + Date.now();

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d.status !== "success") throw new Error(d.message || "No se pudo leer la carpeta.");
                memoria[id] = d;
                memoria[d.id] = d;
                mostrar(d);
            })
            .catch(function (e) {
                console.error("Error cargando catálogos:", e);
                var msg = el("div", "cat-msg");
                msg.appendChild(el("p", "", "No se pudo cargar la carpeta. Revisa tu conexión e inténtalo de nuevo."));
                var reintentar = el("button", "cat-btn cat-btn-primario", "Reintentar");
                reintentar.type = "button";
                reintentar.addEventListener("click", function () { cargar(id, true); });
                msg.appendChild(reintentar);
                lista.replaceChildren(msg);
            });
    }

    function mostrar(d) {
        actual = d;
        buscar.value = "";
        pintarRuta(d.ruta);
        pintarLista();
    }

    function pintarRuta(segmentos) {
        ruta.replaceChildren();
        segmentos.forEach(function (s, i) {
            if (i > 0) ruta.appendChild(el("span", "cat-sep", "›"));
            if (i === segmentos.length - 1) {
                ruta.appendChild(el("span", "cat-actual", s.nombre));
            } else {
                var b = el("button", "cat-enlace", s.nombre);
                b.type = "button";
                b.addEventListener("click", function () { cargar(s.id); });
                ruta.appendChild(b);
            }
        });
    }

    function pintarLista() {
        if (!actual) return;
        var q = buscar.value.trim().toLowerCase();
        var coincide = function (x) { return x.nombre.toLowerCase().indexOf(q) !== -1; };
        var carpetas = actual.carpetas.filter(coincide);
        var archivos = actual.archivos.filter(coincide);

        lista.replaceChildren();
        if (!actual.carpetas.length && !actual.archivos.length) {
            lista.appendChild(el("p", "cat-msg", "Esta carpeta está vacía."));
            return;
        }
        if (!carpetas.length && !archivos.length) {
            lista.appendChild(el("p", "cat-msg", "No hay resultados para «" + buscar.value.trim() + "» en esta carpeta."));
            return;
        }

        carpetas.forEach(function (c) {
            var fila = el("button", "cat-fila cat-carpeta");
            fila.type = "button";
            fila.appendChild(iconoCarpeta());
            var info = el("div", "cat-info");
            info.appendChild(el("span", "cat-nombre", c.nombre));
            info.appendChild(el("span", "cat-meta", "Carpeta"));
            fila.appendChild(info);
            fila.appendChild(el("span", "cat-flecha", "›"));
            fila.addEventListener("click", function () { cargar(c.id); });
            lista.appendChild(fila);
        });

        archivos.forEach(function (a) {
            var tipo = tipoDe(a);
            var fila = el("div", "cat-fila");
            fila.appendChild(iconoArchivo(tipo));

            var info = el("div", "cat-info");
            info.appendChild(el("span", "cat-nombre", a.nombre));
            var meta = [tipo[0], tamano(a.tamano), fechaCorta(a.fecha)].filter(Boolean).join(" · ");
            if (!a.esPdf) meta += " · Solo descarga";
            info.appendChild(el("span", "cat-meta", meta));
            fila.appendChild(info);

            var acciones = el("div", "cat-fila-acciones");
            if (a.esPdf) {
                var ver = el("button", "cat-btn cat-btn-primario", "Ver");
                ver.type = "button";
                ver.addEventListener("click", function () { abrirVisor(a); });
                acciones.appendChild(ver);
            }
            if (a.descarga) {
                var desc = el("a", "cat-btn cat-btn-claro", "Descargar");
                desc.href = a.descarga;
                desc.target = "_blank";
                desc.rel = "noopener";
                acciones.appendChild(desc);
            } else {
                acciones.appendChild(el("span", "cat-meta", "Sin descarga"));
            }
            fila.appendChild(acciones);
            lista.appendChild(fila);
        });
    }

    // ---------- Visor de PDF ----------
    function abrirVisor(a) {
        focoPrevio = document.activeElement;
        visorTitulo.textContent = a.nombre;
        visorDescargar.href = a.descarga || "#";
        visorNueva.href = "https://drive.google.com/file/d/" + a.id + "/view";
        visorFrame.src = a.vista;
        visor.style.display = "flex";
        document.body.style.overflow = "hidden";
        visorCerrar.focus();
    }

    function cerrarVisorCat() {
        visor.style.display = "none";
        visorFrame.src = "";
        document.body.style.overflow = "";
        if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
    }

    visorCerrar.addEventListener("click", cerrarVisorCat);
    visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisorCat(); });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && visor.style.display === "flex") cerrarVisorCat();
    });

    // ---------- Botones del panel ----------
    boton.addEventListener("click", function () {
        if (panel.style.display === "block") { panel.style.display = "none"; return; }
        panel.style.display = "block";
        if (!actual) cargar("");
        setTimeout(function () { panel.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    });

    document.getElementById("catCerrar").addEventListener("click", function () { panel.style.display = "none"; });
    document.getElementById("catActualizar").addEventListener("click", function () {
        var id = actual ? actual.id : "";
        memoria = {};
        cargar(id, true);
    });
    buscar.addEventListener("input", pintarLista);
})();
