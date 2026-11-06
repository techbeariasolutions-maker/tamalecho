import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';

// Notificaciones del navegador en Ajustes (HU-06.2-A). jsdom no trae `Notification`: se simula.
function stubNotification(permission, answer = 'granted') {
  const Notification = function Notification() {};
  Notification.permission = permission;
  Notification.requestPermission = vi.fn(async () => {
    Notification.permission = answer;
    return answer;
  });
  vi.stubGlobal('Notification', Notification);
  return Notification;
}

const section = () => screen.getByRole('region', { name: 'Notificaciones del navegador' });

describe('sección «Notificaciones del navegador» (HU-06.2-A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('T2-13: cargar la portada y Ajustes no pide el permiso', async () => {
    const Notification = stubNotification('default');
    // Se desmonta la portada antes de montar Ajustes para que solo haya un h1 a la vez.
    const home = await renderApp('/');
    home.unmount();
    await renderApp('/ajustes');
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('sin decidir, explica para qué sirven y ofrece «Activar notificaciones»', async () => {
    stubNotification('default');
    await renderApp('/ajustes');
    expect(within(section()).getByText(/te llega como notificación del sistema/)).toBeInTheDocument();
    expect(within(section()).getByText(/todavía no das permiso/)).toBeInTheDocument();
    expect(within(section()).getByRole('button', { name: 'Activar notificaciones' })).toBeInTheDocument();
  });

  it('el permiso se pide solo al pulsar el botón y el resultado se anuncia', async () => {
    const Notification = stubNotification('default', 'granted');
    const user = userEvent.setup();
    await renderApp('/ajustes');
    expect(Notification.requestPermission).not.toHaveBeenCalled();

    await user.click(within(section()).getByRole('button', { name: 'Activar notificaciones' }));
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
    expect(within(section()).getByRole('status')).toHaveTextContent('las notificaciones quedaron permitidas');
    expect(within(section()).queryByRole('button')).not.toBeInTheDocument();
    expect(within(section()).getByText(/Estado: permitidas\./)).toBeInTheDocument();
  });

  it('si el usuario cierra el diálogo sin elegir, el botón sigue disponible', async () => {
    stubNotification('default', 'default');
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(within(section()).getByRole('button', { name: 'Activar notificaciones' }));
    expect(within(section()).getByRole('status')).toHaveTextContent('No elegiste ninguna opción');
    expect(within(section()).getByRole('button', { name: 'Activar notificaciones' })).toBeInTheDocument();
  });

  // HU-06.2-B: alternativa sin permiso o sin soporte.
  it('con el permiso denegado lo explica, sin botón, y enlaza a Web Push', async () => {
    stubNotification('denied');
    await renderApp('/ajustes');
    expect(within(section()).getByText(/Bloqueaste las notificaciones de este sitio/)).toBeInTheDocument();
    expect(within(section()).getByText(/Los avisos dentro de la página siguen funcionando\./)).toBeInTheDocument();
    const link = within(section()).getByRole('link', { name: 'Ver «Avisos con la pestaña cerrada»' });
    expect(link).toHaveAttribute('href', '#avisos-pestana-cerrada');
    expect(document.getElementById('avisos-pestana-cerrada')).toHaveAccessibleName('Avisos con la pestaña cerrada');
    expect(within(section()).queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin soporte (jsdom no trae Notification) lo dice y no ofrece el botón', async () => {
    await renderApp('/ajustes');
    expect(within(section()).getByText('Tu navegador no permite notificaciones.')).toBeInTheDocument();
    expect(within(section()).getByText(/se necesita Web Push/)).toBeInTheDocument();
    expect(within(section()).queryByRole('button')).not.toBeInTheDocument();
  });

  it('si el usuario rechaza el permiso, la sección pasa a la explicación', async () => {
    stubNotification('default', 'denied');
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(within(section()).getByRole('button', { name: 'Activar notificaciones' }));
    expect(within(section()).getByRole('status')).toHaveTextContent('No diste permiso');
    expect(within(section()).getByText(/Bloqueaste las notificaciones de este sitio/)).toBeInTheDocument();
  });

  it('con el permiso ya concedido no muestra el botón', async () => {
    stubNotification('granted');
    await renderApp('/ajustes');
    expect(within(section()).getByText(/Estado: permitidas\./)).toBeInTheDocument();
    expect(within(section()).queryByRole('button')).not.toBeInTheDocument();
  });
});
