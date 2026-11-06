import { describe, expect, it, vi } from 'vitest';
import {
  NOTIFICATION_TAG,
  getPermission,
  isNotificationSupported,
  notify,
  requestPermission,
} from '../../src/services/notificationService.js';
import { getTipById } from '../../src/services/catalog.js';

// HT-06.1-A con `Notification` simulado: estados default, granted y denied, y sin soporte.
const TIP = getTipById('SCR-01');
const NOTICE = { key: '2026-11-09@14:00', tip: TIP, dayPart: 'hambre' };

function fakeNotification(permission = 'default', answer = 'granted') {
  const created = [];
  function Notification(title, options) {
    this.title = title;
    this.options = options;
    this.close = vi.fn();
    created.push(this);
  }
  Notification.permission = permission;
  Notification.requestPermission = vi.fn(async () => {
    Notification.permission = answer;
    return answer;
  });
  return { Notification, created };
}

const env = (Notification, visibilityState = 'visible', extra = {}) => ({
  Notification,
  document: { visibilityState },
  focusWindow: vi.fn(),
  ...extra,
});

describe('getPermission y soporte', () => {
  it.each(['default', 'granted', 'denied'])('refleja el permiso «%s» sin pedir nada', (permission) => {
    const { Notification } = fakeNotification(permission);
    expect(getPermission(env(Notification))).toBe(permission);
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('sin la API dice «unsupported»', () => {
    expect(isNotificationSupported(env(undefined))).toBe(false);
    expect(getPermission(env(undefined))).toBe('unsupported');
  });
});

describe('requestPermission (HU-06.2-A)', () => {
  it('pide el permiso y devuelve la respuesta', async () => {
    const { Notification } = fakeNotification('default', 'denied');
    await expect(requestPermission(env(Notification))).resolves.toBe('denied');
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('funciona con la versión antigua que usa callback', async () => {
    const Notification = {
      permission: 'default',
      requestPermission: (callback) => {
        Notification.permission = 'granted';
        callback('granted');
      },
    };
    await expect(requestPermission(env(Notification))).resolves.toBe('granted');
  });

  it('sin soporte no lanza errores', async () => {
    await expect(requestPermission(env(undefined))).resolves.toBe('unsupported');
  });
});

describe('notify (HT-06.1-A)', () => {
  it('con permiso y la pestaña oculta muestra una notificación nativa que abre la ficha', () => {
    const { Notification, created } = fakeNotification('granted');
    const showInPage = vi.fn();
    const openTip = vi.fn();
    const environment = env(Notification, 'hidden');

    expect(notify(NOTICE, { showInPage, openTip }, environment)).toBe('native');
    expect(showInPage).not.toHaveBeenCalled();
    expect(created).toHaveLength(1);
    expect(created[0].title).toBe(TIP.title);
    expect(created[0].options).toEqual({ body: TIP.summary, tag: NOTIFICATION_TAG, data: { url: `/tip/${TIP.id}` } });

    created[0].onclick();
    expect(environment.focusWindow).toHaveBeenCalled();
    expect(openTip).toHaveBeenCalledWith(TIP.id);
    expect(created[0].close).toHaveBeenCalled();
  });

  it.each([
    ['la pestaña está visible', 'granted', 'visible'],
    ['el permiso no se ha decidido', 'default', 'hidden'],
    ['el permiso está denegado', 'denied', 'hidden'],
  ])('usa el aviso de la página si %s', (_case, permission, visibility) => {
    const { Notification, created } = fakeNotification(permission);
    const showInPage = vi.fn();
    expect(notify(NOTICE, { showInPage }, env(Notification, visibility))).toBe('page');
    expect(showInPage).toHaveBeenCalledTimes(1);
    expect(created).toHaveLength(0);
  });

  it('sin soporte usa el aviso de la página', () => {
    const showInPage = vi.fn();
    expect(notify(NOTICE, { showInPage }, env(undefined, 'hidden'))).toBe('page');
    expect(showInPage).toHaveBeenCalled();
  });

  it('si el navegador no deja crear la notificación (Chrome en Android), usa el aviso de la página', () => {
    function Notification() {
      throw new TypeError('Illegal constructor');
    }
    Notification.permission = 'granted';
    const showInPage = vi.fn();
    expect(notify(NOTICE, { showInPage }, env(Notification, 'hidden'))).toBe('page');
    expect(showInPage).toHaveBeenCalled();
  });
});
