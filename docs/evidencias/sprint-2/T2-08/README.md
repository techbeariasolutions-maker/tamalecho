# T2-08 · Personaje en las 4 franjas (HT-05.1, HU-05.1-B)

Capturas generadas por la prueba E2E `tests/e2e/avatar.spec.js` (proyecto `mobile-360`, 360 × 740 px) con la hora simulada por `page.clock`, el lunes 9/11/2026, con los ajustes recomendados (comida de 12:00 a 16:00).

| Captura | Hora simulada | Estado esperado | Frase |
|---|---|---|---|
| `0900-despierto.png` | 09:00 | despierto | «Buen día…» |
| `1400-hambre.png` | 14:00 | hambre | «Hora de comer…» |
| `1700-atento.png` | 17:00 | atento | «Una pausa…» |
| `2000-cansado.png` | 20:00 | cansado | «Es hora de dormir…» |

## Cómo se regeneran
```powershell
$env:npm_lifecycle_event = 'evidence'
node node_modules\@playwright\test\cli.js test avatar.spec --project=mobile-360 --grep "T2-08"
Remove-Item Env:npm_lifecycle_event
```
`npm run evidence` también las genera, junto con las capturas de 360 px y el resumen de axe.

## Límites
- Las tomó un agente de código en un build local (`vite preview`), no en la vista previa de Vercel ni en producción.
- Las frases son el borrador del backlog: **están pendientes de aprobación del Product Owner** (`phrasesApproved: false` en `src/data/avatarStates.json`).
- No incluyen el aviso emergente: `NoticeToast` llega con WP-S2-7.
- La revisión con Narrador es T2-10 (WP-S2-10, manual de Alan).
