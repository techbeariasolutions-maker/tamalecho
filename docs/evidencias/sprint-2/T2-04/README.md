# Evidencia T2-04 · Restablecer datos (WP-S2-4)

- **Actividades:** HT-04.2-A, HT-04.2-B
- **Caso:** T2-04 (restablecer datos) de `docs/sprint-2/PRUEBAS.md`
- **PR integrado:** #48 (`fbe7997`)
- **Quién la tomó:** Alan Ochoa (QA)
- **Fecha:** 06/11/2026
- **Dónde:** vista previa de Vercel de la rama `feat/HT-04.2-repositorio-local`, ruta `/ajustes`, en Microsoft Edge de escritorio, usando solo el teclado.

| Archivo | Qué muestra |
|---|---|
| `1-estado-inicial.png` | `/ajustes` con el botón «Restablecer mis datos» enfocado. |
| `2-confirmacion-en-la-pagina.png` | La confirmación aparece dentro de la página (sin diálogo del navegador). El foco está en «Cancelar». |
| `3-resultado-tras-restablecer.png` | Mensaje «Listo: tus datos se restablecieron. Los ajustes volvieron a los valores recomendados.» El foco vuelve a «Restablecer mis datos». |

**Resultado:** reportado como correcto por QA.

**Límites de esta evidencia:**
- Es de la vista previa, no de producción.
- No muestra el conteo de lecturas antes y después de restablecer.
- No cubre la prueba con Narrador ni a 360 px.
- T2-03 queda parcial hasta WP-S2-6 y WP-S2-7.
