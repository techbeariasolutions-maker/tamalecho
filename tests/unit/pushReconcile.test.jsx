import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { reconcilePush, SUBSCRIBE_URL } from '../../src/services/pushClient.js';
import PushSection from '../../src/features/scheduler/PushSection.jsx';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { createPushEnv, FAKE_ENDPOINT } from './fixtures/fakePush.js';

// Baja y compatibilidad (HU-15.1-B, WP-P1): si el navegador perdió la suscripción o el permiso,
// se da de baja en el servidor y se explica por qué.
describe('reconcilePush', () => {
  const withLocalOn = (fake) => {
    fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
    return fake;
  };

  it('si se revocó el permiso: baja en el servidor con el endpoint guardado, estado off y motivo «denied»', async () => {
    const fake = withLocalOn(createPushEnv({ permission: 'denied' }));
    const result = await reconcilePush(fake.env);
    expect(result).toEqual({ status: 'denied', lost: 'denied' });
    const [url, request] = fake.fetch.mock.calls[0];
    expect(url).toBe(SUBSCRIBE_URL);
    expect(request.method).toBe('DELETE');
    expect(JSON.parse(request.body)).toEqual({ endpoint: FAKE_ENDPOINT });
    expect(fake.env.repository.getPushState()).toEqual({ status: 'off' });
  });

  it('si la suscripción caducó o se borró (permiso concedido, sin suscripción): motivo «expired»', async () => {
    const fake = withLocalOn(createPushEnv({ permission: 'granted', registered: true }));
    expect(await reconcilePush(fake.env)).toEqual({ status: 'off', lost: 'expired' });
    expect(fake.fetch).toHaveBeenCalledTimes(1);
  });

  it('sin red marca off igual y no lanza errores', async () => {
    const fake = withLocalOn(createPushEnv({ permission: 'denied' }));
    fake.fetch.mockRejectedValueOnce(new Error('sin red'));
    expect(await reconcilePush(fake.env)).toEqual({ status: 'denied', lost: 'denied' });
    expect(fake.env.repository.getPushState()).toEqual({ status: 'off' });
  });

  it('con la suscripción viva no hace nada', async () => {
    const fake = withLocalOn(createPushEnv({ permission: 'granted', subscribed: true }));
    expect(await reconcilePush(fake.env)).toEqual({ status: 'on', lost: null });
    expect(fake.fetch).not.toHaveBeenCalled();
  });

  it('si nunca se activó en este navegador no hace nada ni llama al servidor', async () => {
    const fake = createPushEnv({ permission: 'denied' });
    expect(await reconcilePush(fake.env)).toEqual({ status: 'denied', lost: null });
    expect(fake.fetch).not.toHaveBeenCalled();
  });
});

describe('PushSection explica por qué se desactivó', () => {
  const settings = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] };

  it.each([
    ['denied', /ya no tiene permiso de notificaciones/],
    ['expired', /la suscripción de este navegador ya no es válida/],
  ])('motivo «%s»', (lost, text) => {
    render(<PushSection status="off" settings={settings} onStatusChange={() => {}} lost={lost} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('sin motivo no muestra el mensaje', () => {
    render(<PushSection status="off" settings={settings} onStatusChange={() => {}} />);
    expect(screen.queryByText(/se desactivaron|Desactivamos los avisos/)).not.toBeInTheDocument();
  });
});
