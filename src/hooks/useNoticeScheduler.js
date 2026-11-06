import { useCallback, useEffect, useRef, useState } from 'react';
import { notify } from '../services/notificationService.js';
import { getCurrentWindow, getDayPart, getNextWindow, idempotencyKey, isQuietTime } from '../services/schedule.js';
import { getBrowserRepository } from '../services/storage.js';
import { pickTipForWindow } from '../services/tipPicker.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

// Decide si hay que mostrar un aviso ahora (HU-04.2-A). Devuelve el aviso o null.
// Reglas (CLAUDE.md §2):
// - solo la ventana vigente: al volver de una suspensión larga nunca salen las atrasadas;
// - una sola vez por ventana: la clave se guarda como servida antes de mostrarla;
// - nada en pausa ni en silencio; getCurrentWindow ya descarta los días inactivos.
export function computeNotice({ now, settings, repository, tips, recentIds = [], shownKeys }) {
  if (settings.paused || isQuietTime(now, settings)) return null;
  const current = getCurrentWindow(now, settings);
  if (!current) return null;
  const key = idempotencyKey(current);
  if (shownKeys.has(key) || repository.wasWindowServed(key)) return null;
  const tip = pickTipForWindow(key, recentIds, tips);
  if (!tip) return null;
  // Si el navegador no deja guardar, shownKeys evita repetirla mientras la página siga abierta.
  repository.markWindowServed(key);
  shownKeys.add(key);
  return { key, tip, dayPart: getDayPart(now, settings) };
}

// Programa los avisos dentro de la página. Recalcula desde el reloj real:
// - al montar;
// - al volver a la pestaña (visibilitychange a visible) y con focus;
// - con un solo setTimeout hasta la siguiente ventana, que se reprograma después de cada cálculo.
// Nunca usa setInterval. Lee los ajustes del repositorio en cada cálculo, así una pausa guardada
// en Ajustes aplica sin recargar.
// El aviso se emite con notificationService.notify (HT-06.1-A): notificación nativa si hay permiso
// y la pestaña está oculta; si no, el aviso de la página (`notice`).
// `tips` es la lista de consejos (catalog.getTips()); `openTip(id)` abre la ficha al pulsar la
// notificación nativa. `repository`, `clock` y `emit` se inyectan en las pruebas.
export function useNoticeScheduler({
  tips,
  openTip,
  repository = getBrowserRepository(),
  clock = systemClock,
  emit = notify,
}) {
  const [notice, setNotice] = useState(null);
  const shownKeys = useRef(new Set());
  // openTip cambia con cada navegación; se guarda en una ref para no reprogramar el temporizador.
  const openTipRef = useRef(openTip);
  useEffect(() => {
    openTipRef.current = openTip;
  }, [openTip]);

  useEffect(() => {
    let timer;

    function recalculate() {
      const now = clock();
      const settings = repository.getSettings();
      // HU-08.1-A: los consejos leídos (historial, máximo 50) se evitan mientras haya otros.
      const recentIds = repository.getHistory().map((entry) => entry.id);
      const next = computeNotice({ now, settings, repository, tips, recentIds, shownKeys: shownKeys.current });
      // Un solo aviso a la vez: uno nuevo reemplaza al anterior.
      if (next) {
        emit(next, { showInPage: () => setNotice(next), openTip: (id) => openTipRef.current?.(id) });
      }
      clearTimeout(timer);
      // La pausa no se considera aquí: si se reanuda, el siguiente cálculo ya la ve.
      const upcoming = getNextWindow(now, { ...settings, paused: false });
      if (upcoming) timer = setTimeout(recalculate, upcoming.getTime() - now.getTime());
    }

    function recalculateIfVisible() {
      if (document.visibilityState === 'visible') recalculate();
    }

    recalculate();
    document.addEventListener('visibilitychange', recalculateIfVisible);
    window.addEventListener('focus', recalculate);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', recalculateIfVisible);
      window.removeEventListener('focus', recalculate);
    };
  }, [tips, repository, clock, emit]);

  const dismiss = useCallback(() => setNotice(null), []);

  return { notice, dismiss };
}
