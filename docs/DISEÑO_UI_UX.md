# Diseño UI/UX de TamalEcho

**Estado:** propuesta de rediseño visual y de experiencia  
**Producto:** TamalEcho Tips  
**Fecha:** 13 de noviembre de 2026

---

## 1. Propósito

TamalEcho es una aplicación web educativa que enseña conceptos de Scrum y PMI/PMBOK mediante consejos breves y verificables. El rediseño busca que deje de percibirse únicamente como una biblioteca de textos y se convierta en una experiencia de aprendizaje diaria, guiada por una mascota virtual.

La aplicación mantiene sus principios actuales:

- Acceso público y sin cuenta obligatoria.
- Contenido en español de México.
- Scrum y PMI/PMBOK se presentan como enfoques distintos, no equivalentes.
- Cada consejo incluye una fuente verificable.
- La lectura y la accesibilidad tienen prioridad sobre los efectos visuales.

---

## 2. Concepto rector: Ruta diaria

La experiencia propuesta se llama **Ruta diaria**. Cada visita invita a completar una misión corta: aprender un concepto, comprender un ejemplo y elegir una acción aplicable al trabajo del usuario.

**TamalEcho** es el compañero de esa ruta. No reemplaza el contenido académico: lo presenta, reacciona al avance y ayuda a dar continuidad entre sesiones.

### Objetivos de experiencia

1. Dar al usuario una acción evidente al entrar: comenzar o continuar la misión del día.
2. Reducir la sensación de una lista extensa de tarjetas.
3. Dar visibilidad al progreso sin exigir registro ni convertir la aplicación en un videojuego.
4. Mantener una identidad cálida, limpia y colorida, inspirada en aplicaciones modernas de cuidado de mascotas como Dr. Woof, sin copiar su identidad visual.

### No objetivos

- No añadir mecánicas competitivas, compras, puntos canjeables ni presión por entrar todos los días.
- No ocultar las fuentes, explicaciones o diferencias entre Scrum y PMI/PMBOK.
- No usar animaciones largas, automáticas o que impidan leer.

---

## 3. Arquitectura de información

La navegación debe priorizar lo que el usuario puede hacer hoy y relegar las funciones secundarias.

| Sección | Propósito | Prioridad en navegación |
|---|---|---|
| Inicio | Iniciar o continuar la misión diaria. | Principal |
| Explorar | Navegar por Scrum, PMI/PMBOK, categorías y búsqueda. | Principal |
| Mi progreso | Ver lecturas, conceptos completados y racha personal. | Principal cuando esté implementado |
| Historial | Consultar consejos abiertos anteriormente. | Secundaria |
| Ajustes | Configurar avisos, silencio, pausa y datos locales. | Secundaria |
| Ayuda | Explicar la aplicación, fuentes, privacidad y compatibilidad. | Secundaria |

Mientras **Mi progreso**, **Historial** o **Ayuda** no estén terminados, no deben prometer funciones inexistentes. Se recomienda ocultarlos del menú principal o marcarlos claramente como “Próximamente”.

---

## 4. Pantalla de inicio

La pantalla de inicio debe funcionar como un tablero personal, no como una portada editorial genérica.

### Estructura

1. **Encabezado:** marca TamalEcho, enlaces principales y un resumen compacto de racha o progreso.
2. **Hero de misión diaria:** mensaje del personaje, estado visual y una sola llamada a la acción.
3. **Tarjeta de misión:** tema, duración estimada, enfoque y botón “Empezar misión”.
4. **Ruta semanal:** tres a cinco conceptos, con el concepto actual claramente destacado.
5. **Explorar por enfoque:** accesos secundarios para Scrum y PMI/PMBOK.

### Ejemplo de contenido

```text
Hola, Diego · Racha de 3 días

TamalEcho: “¡Hoy aprendemos a priorizar por valor!”

Misión de hoy
Product Backlog · Scrum · 2 minutos
[ Empezar misión ]

Tu ruta semanal
[ Product Backlog ✓ ] [ Objetivo del Sprint ] [ Daily Scrum ]
```

### Criterios visuales

- La misión diaria es el elemento dominante.
- Solo existe una llamada a la acción primaria en el hero.
- TamalEcho aparece grande en escritorio y acompaña el contenido sin desplazarlo en móvil.
- La ruta semanal es una vista rápida, no un calendario complejo.

---

## 5. Biblioteca y exploración

La biblioteca debe permitir explorar sin parecer un muro de tarjetas repetidas.

### Estructura

1. Título y selector Scrum / PMI-PMBOK.
2. Descripción breve del enfoque.
3. Filtros por categoría y campo de búsqueda cuando se implemente.
4. Conteo de resultados.
5. Lista de conceptos compactos.

### Tarjeta compacta de concepto

Cada tarjeta debe mostrar únicamente:

- Etiqueta de categoría.
- Título.
- Resumen de una o dos líneas.
- Estado: nuevo, leído o completado.
- Acción “Ver misión” o “Abrir concepto”.

La acción práctica, área de conocimiento y fuente completa pasan a la ficha. Esto reduce la altura de cada elemento y facilita recorrer el catálogo en celular.

### Comparación Scrum y PMI/PMBOK

El bloque “mismo problema, dos enfoques” se mantiene como una herramienta de aprendizaje. Debe mostrarse como una comparación desplegable o una tarjeta destacada, dejando visible que no son equivalentes.

---

## 6. Ficha de misión o concepto

La ficha transforma un consejo en una microlección.

### Orden de información

1. Enfoque y categoría.
2. Título y resumen.
3. Explicación.
4. Error frecuente.
5. Ejemplo aplicado.
6. Acción para hoy.
7. Fuente y etiquetas.
8. Navegación al siguiente concepto o regreso a explorar.

### Tratamiento visual

- El bloque **Acción para hoy** debe ser una tarjeta resaltada con un ícono de misión.
- El bloque **Error frecuente** usa un aviso suave, no un color alarmante.
- El ejemplo puede usar un recuadro de escenario: “En un equipo escolar…”
- La fuente conserva su jerarquía y legibilidad; nunca se esconde detrás de una animación o modal.

### Finalización

Al llegar al final, el usuario puede marcar la misión como comprendida o simplemente continuar. Marcarla actualiza el progreso local y activa una reacción breve de TamalEcho.

---

## 7. Mi progreso e historial

Estas pantallas deben implementarse antes de presentarse como opciones activas del menú.

### Mi progreso

- Conceptos vistos y completados por enfoque.
- Ruta actual y siguiente recomendación.
- Racha de días opcional, calculada localmente.
- Insignias discretas por hitos: primera misión, cinco conceptos, un enfoque completado.

### Historial

- Consejos abiertos, ordenados del más reciente al más antiguo.
- Filtros por Scrum y PMI/PMBOK.
- Acción para reabrir cada concepto.
- Estado vacío que invita a comenzar una misión, no un mensaje técnico.

Los datos siguen siendo locales al navegador mientras no exista un sistema de cuentas.

---

## 8. Ajustes y avisos

La pantalla de ajustes conserva su funcionalidad actual, pero se organiza por intención del usuario.

1. **Cuándo aprender:** horario, días y vista previa de avisos.
2. **Pausar temporalmente:** control visible y fácil de revertir.
3. **Avisos del navegador:** explicación clara de permisos y compatibilidad.
4. **Tus datos:** historial local, restablecimiento y privacidad.

Cada grupo debe tener una descripción breve que explique la consecuencia de activar o desactivar la opción.

---

## 9. Diseño de TamalEcho

### Personalidad

TamalEcho es curioso, amable y un poco expresivo. Su función es acompañar, no infantilizar el contenido ni distraer de la lectura.

### Forma propuesta

- Cuerpo vertical de tamal con esquinas redondeadas.
- Pliegues que sugieren una hoja de maíz, sin textura recargada.
- Contorno oscuro y grueso para que se reconozca a tamaños pequeños.
- Ojos grandes y expresivos, cejas y boca intercambiables.
- Brazos y piernas cortos para saludar, señalar, pensar y celebrar.
- Colores principales: maíz amarillo, dorado, hoja verde suave y contorno verde oscuro.

La referencia visual compartida por el equipo sirve para orientar el nivel de expresividad y silueta. El personaje final debe ser una ilustración original; no debe reutilizar imágenes con marca de agua, personajes existentes ni recursos sin licencia.

### Estados

| Estado | Situación | Expresión y acción |
|---|---|---|
| Curioso | Inicio o concepto nuevo | Saluda y señala la misión. |
| Concentrado | Lectura de explicación | Ceño suave, libreta o gesto de pensar. |
| Antojado | Horario de mediodía | Mira una burbuja de comida o se frota las manos. |
| Orgulloso | Misión completada | Sonríe, levanta una mano y muestra una estrella. |
| Somnoliento | Horario nocturno | Párpados bajos y burbuja de sueño. |

---

## 10. Animaciones

Las animaciones comunican estado y recompensa. Nunca deben ser decoración continua que robe atención.

| Momento | Animación | Duración aproximada |
|---|---|---|
| Carga de la portada | Entrada suave del personaje y aparición de la burbuja. | 300–500 ms |
| Espera | Respiración ligera y parpadeo ocasional. | Pausada y discreta |
| Cambio de franja horaria | Cambio de expresión, color de fondo y frase. | 200–300 ms |
| Abrir misión | TamalEcho señala la tarjeta o mira el contenido. | 200 ms |
| Completar misión | Salto breve, estrella o confeti muy reducido. | 400–600 ms |
| Progreso | Barra o punto de ruta que cambia de estado. | 200 ms |

### Reglas de movimiento

- Respetar `prefers-reduced-motion`.
- Con movimiento reducido, conservar solo cambios de color, opacidad o expresión sin desplazamiento.
- No reproducir audio automático.
- No repetir bucles rápidos ni usar parallax obligatorio.
- La animación de éxito debe ocurrir una sola vez por acción del usuario.

---

## 11. Sistema visual

### Paleta propuesta

| Uso | Color sugerido | Función |
|---|---|---|
| Tinta principal | Verde oscuro | Títulos, navegación y botones principales. |
| Fondo base | Crema cálido | Lectura prolongada y relación con el maíz. |
| Acento primario | Turquesa | Progreso, selección y palabras destacadas. |
| Acento cálido | Naranja coral | Llamados secundarios y celebraciones. |
| Acento suave | Amarillo maíz | Estados del personaje y notas. |
| Superficie | Blanco cálido | Tarjetas y controles. |

Los colores definitivos deben comprobarse con contraste WCAG AA antes de implementarse.

### Tipografía

- Sans serif geométrica y legible para toda la interfaz.
- Títulos grandes, compactos y con peso alto.
- Texto de lectura con tamaño mínimo de 16 px y altura de línea amplia.
- No usar más de dos familias tipográficas.

### Componentes base

- Botón primario oscuro y redondeado.
- Botón secundario de fondo claro y borde suave.
- Etiquetas tipo píldora para categorías y estados.
- Tarjetas con radio amplio, sombra discreta y espacios generosos.
- Iconografía simple y consistente; no mezclar estilos de íconos.

---

## 12. Responsive y accesibilidad

### Móvil

- Navegación compacta mediante menú.
- Hero en una sola columna: contenido primero, personaje después o integrado lateralmente.
- Botones de ancho completo solo en acciones principales.
- Tarjetas de biblioteca compactas y sin columnas estrechas.

### Escritorio

- Hero en dos columnas: mensaje y misión a la izquierda, personaje a la derecha.
- Ruta semanal en fila horizontal.
- Biblioteca con dos o tres columnas solo si no sacrifica la longitud del texto.

### Accesibilidad

- Todo flujo disponible con teclado.
- Foco visible y contraste suficiente.
- TamalEcho tiene texto alternativo descriptivo cuando comunique estado; es decorativo cuando no agregue información.
- Los estados no se comunican solo por color o animación.
- Los mensajes de progreso se anuncian de forma moderada a lectores de pantalla.
- No bloquear zoom ni reducir la legibilidad del texto para acomodar elementos visuales.

---

## 13. Prioridad de implementación

### Primera etapa: identidad y portada

1. Nuevo sistema visual de colores, espaciado, bordes y tipografía.
2. Personaje TamalEcho original con estados básicos.
3. Portada Ruta diaria con misión y progreso compacto.
4. Animaciones accesibles del personaje y progreso.

### Segunda etapa: aprendizaje

1. Tarjetas compactas en biblioteca.
2. Ficha de concepto como microlección.
3. Marcado local de misión completada.
4. Historial y progreso funcionales.

### Tercera etapa: refinamiento

1. Búsqueda de conceptos.
2. Rutas recomendadas por nivel o interés.
3. Estados vacíos, ayudas y mensajes de compatibilidad.
4. Revisión con usuarios y ajuste de densidad de información.

---

## 14. Criterios de aceptación del rediseño

El rediseño se considera listo cuando:

- La primera acción visible es comenzar o continuar una misión.
- TamalEcho tiene una presencia clara y comunica estados útiles.
- La biblioteca es más rápida de recorrer en celular que la lista actual.
- El usuario puede identificar su progreso sin crear una cuenta.
- Las fuentes y la separación conceptual entre Scrum y PMI/PMBOK siguen visibles.
- Las animaciones se desactivan o simplifican al solicitar reducción de movimiento.
- La interfaz conserva contraste, navegación por teclado y diseño responsive.

