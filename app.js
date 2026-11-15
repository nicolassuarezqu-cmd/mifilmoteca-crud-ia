/* ============================================================
   MIFILMOTECA - Lógica de la aplicación (CRUD)
   Gestor de películas y series con localStorage
   ============================================================ */

// ============================================================
//  REFERENCIAS A ELEMENTOS DEL DOM
//  Se obtienen una sola vez al cargar el script para no tener
//  que hacer document.getElementById() repetidamente.
// ============================================================

const formulario = document.getElementById("formularioTitulo");
const campoId = document.getElementById("campoId");
const campoTitulo = document.getElementById("campoTitulo");
const campoTipo = document.getElementById("campoTipo");
const campoGenero = document.getElementById("campoGenero");
const campoAnio = document.getElementById("campoAnio");
const campoPlataforma = document.getElementById("campoPlataforma");
const campoEstado = document.getElementById("campoEstado");
const campoCalificacion = document.getElementById("campoCalificacion");
const campoNotas = document.getElementById("campoNotas");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const mensajeError = document.getElementById("mensajeError");

const listaTitulos = document.getElementById("listaTitulos");
const mensajeVacio = document.getElementById("mensajeVacio");

const campoBusqueda = document.getElementById("campoBusqueda");
const filtroTipo = document.getElementById("filtroTipo");
const filtroEstado = document.getElementById("filtroEstado");

const contadorTotal = document.getElementById("contadorTotal");
const contadorVistas = document.getElementById("contadorVistas");

const selectorEstrellas = document.getElementById("selectorEstrellas");

// ============================================================
//  CLAVE USADA PARA GUARDAR EN LOCALSTORAGE
// ============================================================
const CLAVE_STORAGE = "mifilmoteca_titulos";

// ============================================================
//  PERSISTENCIA: OBTENER Y GUARDAR EN LOCALSTORAGE
// ============================================================

/**
 * Obtiene el arreglo de títulos desde localStorage.
 * Si no hay datos guardados, devuelve un arreglo vacío.
 * @returns {Array} Arreglo de objetos título.
 */
function obtenerTitulos() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : [];
}

/**
 * Guarda el arreglo de títulos en localStorage.
 * @param {Array} titulos - Arreglo de objetos título a persistir.
 */
function guardarTitulos(titulos) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(titulos));
}

// ============================================================
//  GENERADOR DE ID ÚNICO
// ============================================================

/**
 * Genera un identificador único basado en la fecha actual y un número aleatorio.
 * Formato: timestamp + random (ej: 1700000000000-a3f9).
 * @returns {string} ID único.
 */
function generarId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 8);
}

// ============================================================
//  VALIDACIÓN DEL FORMULARIO
// ============================================================

/**
 * Valida los campos del formulario antes de guardar.
 * Comprueba: título obligatorio, año en rango (1888 - año actual),
 * y que no exista un duplicado (mismo título + mismo año).
 *
 * @param {boolean} esEdicion - Indica si estamos en modo edición.
 * @returns {boolean} true si el formulario es válido, false en caso contrario.
 */
function validarFormulario(esEdicion) {
    // Limpiar mensaje de error anterior
    mensajeError.classList.add("oculto");
    mensajeError.textContent = "";

    const titulo = campoTitulo.value.trim();
    const anio = parseInt(campoAnio.value, 10);
    const anioActual = new Date().getFullYear();

    // Validación 1: título obligatorio
    if (titulo === "") {
        mostrarError("El título es obligatorio. Por favor, ingresa un nombre.");
        return false;
    }

    // Validación 2: año entre 1888 (primera película conocida) y el año actual
    if (isNaN(anio) || anio < 1888 || anio > anioActual) {
        mostrarError("El año debe estar entre 1888 y " + anioActual + ".");
        return false;
    }

    // Validación 3: no permitir duplicados (mismo título + mismo año)
    // En modo edición, se excluye el propio registro que se está editando.
    const idActual = campoId.value;
    const titulos = obtenerTitulos();
    const duplicado = titulos.some(function (t) {
        const mismoTitulo = t.titulo.toLowerCase() === titulo.toLowerCase();
        const mismoAnio = t.anio === anio;
        const noEsElMismo = t.id !== idActual;
        return mismoTitulo && mismoAnio && noEsElMismo;
    });

    if (duplicado) {
        mostrarError("Ya existe un título llamado \"" + titulo + "\" del año " + anio + ". No se permiten duplicados.");
        return false;
    }

    return true;
}

/**
 * Muestra un mensaje de error debajo del formulario.
 * @param {string} mensaje - Texto del error a mostrar.
 */
function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.classList.remove("oculto");
}

// ============================================================
//  CREAR (Create): AGREGAR UN NUEVO TÍTULO
// ============================================================

/**
 * Agrega un nuevo título a la lista y lo persiste en localStorage.
 * Crea un objeto con todos los campos del formulario, le asigna un ID único
 * y lo guarda al final del arreglo.
 */
function agregarTitulo() {
    // Validar antes de guardar
    if (!validarFormulario(false)) {
        return;
    }

    // Construir el objeto título con los valores del formulario
    const nuevoTitulo = {
        id: generarId(),
        titulo: campoTitulo.value.trim(),
        tipo: campoTipo.value,
        genero: campoGenero.value,
        anio: parseInt(campoAnio.value, 10),
        plataforma: campoPlataforma.value,
        estado: campoEstado.value,
        calificacion: parseInt(campoCalificacion.value, 10),
        notas: campoNotas.value.trim()
    };

    // Obtener, agregar y guardar
    const titulos = obtenerTitulos();
    titulos.push(nuevoTitulo);
    guardarTitulos(titulos);

    // Limpiar formulario y refrescar la vista
    limpiarFormulario();
    renderizarLista();
}

// ============================================================
//  ACTUALIZAR (Update): EDITAR UN TÍTULO EXISTENTE
// ============================================================

/**
 * Carga los datos de un título en el formulario para editarlo.
 * Cambia el modo del formulario: el botón "Guardar" pasa a decir "Actualizar"
 * y aparece un botón "Cancelar".
 *
 * @param {string} id - ID del título a editar.
 */
function cargarFormularioEdicion(id) {
    const titulos = obtenerTitulos();
    const titulo = titulos.find(function (t) {
        return t.id === id;
    });

    if (!titulo) return;

    // Llenar los campos del formulario con los datos del título
    campoId.value = titulo.id;
    campoTitulo.value = titulo.titulo;
    campoTipo.value = titulo.tipo;
    campoGenero.value = titulo.genero;
    campoAnio.value = titulo.anio;
    campoPlataforma.value = titulo.plataforma;
    campoEstado.value = titulo.estado;
    campoCalificacion.value = titulo.calificacion;
    campoNotas.value = titulo.notas;

    // Actualizar la vista de estrellas en el selector
    actualizarSelectorEstrellas(titulo.calificacion);

    // Cambiar la interfaz a modo edición
    tituloFormulario.textContent = "Editar título";
    btnGuardar.textContent = "Actualizar";
    btnCancelar.classList.remove("oculto");

    // Hacer scroll al formulario para que el usuario vea los cambios
    formulario.scrollIntoView({ behavior: "smooth" });
}

/**
 * Guarda los cambios de un título editado en localStorage.
 * Busca el título por su ID y reemplaza sus propiedades con los nuevos valores.
 */
function editarTitulo() {
    const id = campoId.value;

    if (!id) return;

    // Validar antes de guardar (true = estamos en modo edición)
    if (!validarFormulario(true)) {
        return;
    }

    const titulos = obtenerTitulos();
    const indice = titulos.findIndex(function (t) {
        return t.id === id;
    });

    if (indice === -1) return;

    // Reemplazar el título en el arreglo con los nuevos datos
    titulos[indice] = {
        id: id,
        titulo: campoTitulo.value.trim(),
        tipo: campoTipo.value,
        genero: campoGenero.value,
        anio: parseInt(campoAnio.value, 10),
        plataforma: campoPlataforma.value,
        estado: campoEstado.value,
        calificacion: parseInt(campoCalificacion.value, 10),
        notas: campoNotas.value.trim()
    };

    guardarTitulos(titulos);
    limpiarFormulario();
    renderizarLista();
}

// ============================================================
//  ELIMINAR (Delete): BORRAR UN TÍTULO CON CONFIRMACIÓN
// ============================================================

/**
 * Elimina un título de la lista después de pedir confirmación al usuario.
 * Usa confirm() porque es más amigable que un alert, y solo en este caso
 * es aceptable ya que es una acción destructiva que requiere confirmación explícita.
 *
 * @param {string} id - ID del título a eliminar.
 */
function eliminarTitulo(id) {
    const titulos = obtenerTitulos();
    const titulo = titulos.find(function (t) {
        return t.id === id;
    });

    if (!titulo) return;

    // Pedir confirmación antes de eliminar
    const confirmacion = confirm(
        "¿Estás seguro de que deseas eliminar \"" + titulo.titulo + "\" (" + titulo.anio + ")?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmacion) return;

    // Filtrar para quitar el título con el ID indicado
    const titulosFiltrados = titulos.filter(function (t) {
        return t.id !== id;
    });

    guardarTitulos(titulosFiltrados);

    // Si estábamos editando el título que se eliminó, cancelamos la edición
    if (campoId.value === id) {
        limpiarFormulario();
    }

    renderizarLista();
}

// ============================================================
//  FORMATEO: CONVERTIR CALIFICACIÓN NUMÉRICA A ESTRELLAS
// ============================================================

/**
 * Convierte una calificación numérica (0-5) en una cadena de estrellas.
 * Las estrellas llenas se muestran con ★ y las vacías con ☆.
 * Ejemplo: 3 → "★★★☆☆"
 *
 * @param {number} calificacion - Número del 0 al 5.
 * @returns {string} Representación visual con estrellas.
 */
function formatearEstrellas(calificacion) {
    if (calificacion === 0) {
        return '<span class="tarjeta__estrellas--vacia">Sin calificar</span>';
    }

    var estrellas = "";
    for (var i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            estrellas += "★";
        } else {
            estrellas += "☆";
        }
    }
    return '<span class="tarjeta__estrellas">' + estrellas + "</span>";
}

// ============================================================
//  FILTRADO Y BÚSQUEDA
// ============================================================

/**
 * Aplica los filtros activos (búsqueda por texto, tipo y estado) sobre
 * la lista completa de títulos y devuelve solo los que coinciden.
 *
 * @param {Array} titulos - Arreglo completo de títulos.
 * @returns {Array} Arreglo filtrado.
 */
function filtrarTitulos(titulos) {
    const textoBusqueda = campoBusqueda.value.toLowerCase().trim();
    const tipoSeleccionado = filtroTipo.value;
    const estadoSeleccionado = filtroEstado.value;

    return titulos.filter(function (titulo) {
        // Filtro por texto de búsqueda (busca en el título)
        const coincideTexto = textoBusqueda === "" || titulo.titulo.toLowerCase().includes(textoBusqueda);

        // Filtro por tipo (película / serie)
        const coincideTipo = tipoSeleccionado === "todos" || titulo.tipo === tipoSeleccionado;

        // Filtro por estado (pendiente / viendo / vista)
        const coincideEstado = estadoSeleccionado === "todos" || titulo.estado === estadoSeleccionado;

        return coincideTexto && coincideTipo && coincideEstado;
    });
}

// ============================================================
//  RENDERIZADO (Read): MOSTRAR LA LISTA DE TÍTULOS EN PANTALLA
// ============================================================

/**
 * Función principal de renderizado. Obtiene los títulos de localStorage,
 * aplica los filtros activos, y genera las tarjetas HTML para cada uno.
 * También actualiza el contador de total y vistas, y muestra u oculta
 * el mensaje de "lista vacía".
 */
function renderizarLista() {
    const titulos = obtenerTitulos();
    const titulosFiltrados = filtrarTitulos(titulos);

    // Si no hay títulos (ni siquiera en storage), mostrar mensaje vacío
    if (titulos.length === 0) {
        listaTitulos.innerHTML = "";
        mensajeVacio.classList.remove("oculto");
        listaTitulos.appendChild(mensajeVacio);
    } else if (titulosFiltrados.length === 0) {
        // Hay títulos pero los filtros no dejan ver ninguno
        listaTitulos.innerHTML = "<p class=\"lista__vacio-texto\" style=\"grid-column: 1/-1; text-align: center; padding: 2rem;\">No se encontraron títulos con los filtros actuales.</p>";
        if (mensajeVacio.parentNode) {
            mensajeVacio.classList.add("oculto");
        }
    } else {
        // Quitar mensaje vacío si estaba presente
        if (mensajeVacio.parentNode) {
            mensajeVacio.classList.add("oculto");
        }

        // Construir el HTML de cada tarjeta
        listaTitulos.innerHTML = titulosFiltrados.map(function (titulo) {
            return crearTarjetaHTML(titulo);
        }).join("");
    }

    // Actualizar contadores
    actualizarContador(titulos, titulosFiltrados);
}

/**
 * Construye el HTML de una tarjeta individual para un título.
 * Incluye todos los campos: título, tipo, género, año, plataforma,
 * estado, calificación (estrellas), notas y botones de acción.
 *
 * @param {Object} titulo - Objeto con los datos del título.
 * @returns {string} HTML de la tarjeta.
 */
function crearTarjetaHTML(titulo) {
    // Determinar clases CSS según tipo y estado
    var claseTipo = titulo.tipo === "película" ? "etiqueta--pelicula" : "etiqueta--serie";
    var claseEstado = "etiqueta--" + titulo.estado;

    // Formatear el texto del estado (primera letra mayúscula)
    var estadoTexto = titulo.estado.charAt(0).toUpperCase() + titulo.estado.slice(1);

    // Construir la información adicional (género, año, plataforma)
    var infoExtra = "";
    if (titulo.genero) {
        infoExtra += "<span class=\"tarjeta__info-item\">🎭 " + titulo.genero + "</span>";
    }
    infoExtra += "<span class=\"tarjeta__info-item\">📅 " + titulo.anio + "</span>";
    if (titulo.plataforma) {
        infoExtra += "<span class=\"tarjeta__info-item\">📡 " + titulo.plataforma + "</span>";
    }

    // Notas (solo si existen)
    var notasHTML = "";
    if (titulo.notas) {
        notasHTML = "<p class=\"tarjeta__notas\">" + escaparHTML(titulo.notas) + "</p>";
    }

    // Armar la tarjeta completa
    // Los data-atributos se usan para identificar el registro al hacer clic en los botones
    return (
        "<div class=\"tarjeta\" data-id=\"" + titulo.id + "\">" +
            "<h3 class=\"tarjeta__titulo\">" + escaparHTML(titulo.titulo) + "</h3>" +
            "<div class=\"tarjeta__meta\">" +
                "<span class=\"etiqueta " + claseTipo + "\">" + titulo.tipo + "</span>" +
                "<span class=\"etiqueta " + claseEstado + "\">" + estadoTexto + "</span>" +
            "</div>" +
            "<div class=\"tarjeta__info\">" + infoExtra + "</div>" +
            "<div>" + formatearEstrellas(titulo.calificacion) + "</div>" +
            notasHTML +
            "<div class=\"tarjeta__acciones\">" +
                "<button class=\"boton boton--editar\" data-accion=\"editar\" data-id=\"" + titulo.id + "\">✏️ Editar</button>" +
                "<button class=\"boton boton--eliminar\" data-accion=\"eliminar\" data-id=\"" + titulo.id + "\">🗑️ Eliminar</button>" +
            "</div>" +
        "</div>"
    );
}

/**
 * Escapa caracteres especiales HTML para prevenir inyección de código
 * y asegurar que el texto se muestre correctamente.
 *
 * @param {string} texto - Texto a escapar.
 * @returns {string} Texto escapado.
 */
function escaparHTML(texto) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
}

/**
 * Actualiza los contadores del panel superior: total de títulos en storage
 * y cuántos están marcados como "vista".
 *
 * @param {Array} titulos - Arreglo completo (sin filtrar) de títulos.
 * @param {Array} titulosFiltrados - Arreglo después de aplicar filtros (para el total mostrado).
 */
function actualizarContador(titulos, titulosFiltrados) {
    contadorTotal.textContent = titulosFiltrados.length;

    // Contar cuántos tienen estado "vista" en la lista SIN filtrar
    var totalVistas = titulos.filter(function (t) {
        return t.estado === "vista";
    }).length;
    contadorVistas.textContent = totalVistas;
}

// ============================================================
//  MANEJO DEL FORMULARIO: LIMPIAR Y CANCELAR
// ============================================================

/**
 * Limpia todos los campos del formulario y restaura el modo "Agregar".
 * Se llama después de guardar, después de cancelar una edición,
 * o al cambiar entre modos.
 */
function limpiarFormulario() {
    formulario.reset();
    campoId.value = "";
    campoCalificacion.value = "0";
    actualizarSelectorEstrellas(0);

    // Restaurar el aspecto de "modo agregar"
    tituloFormulario.textContent = "Agregar nuevo título";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("oculto");
    mensajeError.classList.add("oculto");
    mensajeError.textContent = "";
}

/**
 * Cancela el modo edición y vuelve al modo de agregar nuevo título.
 */
function cancelarEdicion() {
    limpiarFormulario();
}

// ============================================================
//  SELECTOR DE ESTRELLAS INTERACTIVO
// ============================================================

/**
 * Actualiza la vista del selector de estrellas según un valor numérico.
 * Las estrellas hasta el valor dado se muestran llenas (★),
 * las demás vacías (☆).
 *
 * @param {number} valor - Cantidad de estrellas (0-5).
 */
function actualizarSelectorEstrellas(valor) {
    var estrellas = selectorEstrellas.querySelectorAll(".formulario__estrella");
    estrellas.forEach(function (estrella) {
        var valorEstrella = parseInt(estrella.getAttribute("data-valor"), 10);
        if (valorEstrella <= valor) {
            estrella.textContent = "★";
            estrella.classList.add("formulario__estrella--activa");
        } else {
            estrella.textContent = "☆";
            estrella.classList.remove("formulario__estrella--activa");
        }
    });
}

// ============================================================
//  DELEGACIÓN DE EVENTOS EN LA LISTA DE TÍTULOS
// ============================================================

/**
 * Maneja los clics en los botones de cada tarjeta usando delegación de eventos.
 * En lugar de asignar un listener a cada botón (que se recrean en cada renderizado),
 * se asigna un solo listener al contenedor de la lista y se detecta qué botón
 * fue presionado mediante el atributo data-accion.
 *
 * @param {Event} evento - El evento click capturado.
 */
function manejarClicEnLista(evento) {
    var boton = evento.target.closest("button");

    // Si el clic no fue en un botón, ignorar
    if (!boton) return;

    var accion = boton.getAttribute("data-accion");
    var id = boton.getAttribute("data-id");

    if (accion === "editar") {
        cargarFormularioEdicion(id);
    } else if (accion === "eliminar") {
        eliminarTitulo(id);
    }
}

// ============================================================
//  INICIALIZACIÓN: CONFIGURAR EVENTOS AL CARGAR LA PÁGINA
// ============================================================

/**
 * Punto de entrada de la aplicación. Se ejecuta cuando el DOM está listo.
 * Configura todos los event listeners y hace el primer renderizado.
 */
function inicializarApp() {

    // --- Evento: envío del formulario (submit) ---
    // Si campoId tiene valor, estamos editando; si no, estamos creando.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault(); // Evitar que la página se recargue

        if (campoId.value) {
            editarTitulo();
        } else {
            agregarTitulo();
        }
    });

    // --- Evento: botón Cancelar ---
    btnCancelar.addEventListener("click", cancelarEdicion);

    // --- Evento: selector de estrellas (clic en cada estrella) ---
    selectorEstrellas.addEventListener("click", function (evento) {
        var estrella = evento.target.closest(".formulario__estrella");
        if (!estrella) return;

        var valor = parseInt(estrella.getAttribute("data-valor"), 10);
        campoCalificacion.value = valor;
        actualizarSelectorEstrellas(valor);
    });

    // --- Evento: delegación de clics en la lista de tarjetas ---
    // Un solo listener para todos los botones "Editar" y "Eliminar"
    listaTitulos.addEventListener("click", manejarClicEnLista);

    // --- Eventos: filtros y búsqueda ---
    // Se re-renderiza la lista cada vez que el usuario escribe o cambia un filtro
    campoBusqueda.addEventListener("input", renderizarLista);
    filtroTipo.addEventListener("change", renderizarLista);
    filtroEstado.addEventListener("change", renderizarLista);

    // --- Primer renderizado: mostrar títulos guardados al cargar la página ---
    renderizarLista();
}

// Arrancar la aplicación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", inicializarApp);