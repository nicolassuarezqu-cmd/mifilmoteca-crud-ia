## Prompts utilizados

### Prompt 1: Aplicación completa (base)
**Herramienta:** [escribe aquí cuál usaste: Claude Code / Cursor / Copilot...]

**Qué pedí:** Un CRUD completo de películas y series con HTML, CSS y JavaScript
puro, persistencia en localStorage, validaciones sin `alert()`, buscador,
filtros por tipo y estado, contador, calificación en estrellas, tema oscuro
estilo streaming (#141414 y #e50914) y código dividido en funciones pequeñas
y comentadas en español. Además pedí que la herramienta creara los archivos
directamente en mi carpeta y explicara el CRUD en consola.

**Para qué:** Generar la estructura inicial y la funcionalidad CRUD completa
de una sola vez, para después mejorarla con prompts de ajuste.

<details>
<summary>Ver prompt completo</summary>

```
Actúa como desarrollador web senior y mentor. Necesito una aplicación web CRUD
para gestionar una lista de películas y series. Es un trabajo académico, así
que el código debe ser claro, ordenado y fácil de explicar.

TECNOLOGÍAS
- Solo HTML5, CSS3 y JavaScript puro (sin frameworks, sin servidor).
- Persistencia con localStorage.
- Tres archivos separados: index.html, style.css y app.js.

CAMPOS DE CADA REGISTRO
- id (único, generado automáticamente)
- título (texto, obligatorio)
- tipo (película / serie)
- género (texto o lista desplegable)
- año (número)
- plataforma (Netflix, Max, Disney+, Prime Video, Otra)
- estado (pendiente / viendo / vista)
- calificación (1 a 5 estrellas)
- notas (texto largo, opcional)

FUNCIONALIDAD CRUD
- Create: formulario para agregar un título nuevo.
- Read: tabla o tarjetas que listen todos los registros al cargar la página.
- Update: botón "Editar" por registro; el formulario se llena con sus datos,
  el botón de guardar cambia a "Actualizar" y aparece un botón "Cancelar".
- Delete: botón "Eliminar" con confirmación antes de borrar.

VALIDACIONES
- Título obligatorio.
- Año entre 1888 y el año actual.
- No permitir duplicados (mismo título y mismo año).
- Mostrar mensajes de error claros debajo del formulario, no con alert().

FUNCIONES EXTRA
- Buscador por título.
- Filtros por tipo y por estado.
- Contador: total de títulos y cuántos están vistos.
- Calificación mostrada como estrellas (★★★☆☆).

DISEÑO
- Tema oscuro estilo plataforma de streaming, con paleta de negro #141414
  y rojo #e50914.
- Responsive: que se vea bien en celular.
- Botón Editar y botón Eliminar con colores distintos.
- Mensaje amigable cuando no hay registros.

CALIDAD DEL CÓDIGO
- Divide app.js en funciones pequeñas con nombres claros en español
  (obtenerTitulos, guardarTitulos, renderizarLista, validarFormulario,
  agregarTitulo, editarTitulo, eliminarTitulo, etc.).
- Sin código repetido.
- Comentarios útiles en español que expliquen qué hace cada función.
- Usa addEventListener, no onclick dentro del HTML.

ENTREGA
1. Crea y guarda directamente los archivos index.html, style.css y app.js
   en la carpeta actual de mi proyecto.
2. Primero, muéstrame la estructura de archivos creada.
3. Al final, dame una explicación breve en consola de cómo funciona cada
   parte del CRUD (dónde está Create, Read, Update y Delete) para que yo
   pueda explicarlo en mi entrega académica.
```

</details>
