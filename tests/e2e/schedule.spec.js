import { expect, test } from '@playwright/test';

// Ajustes del horario (WP-S2-6). La hora se fija con page.clock: lunes 9/11/2026.
const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);

const scheduleSection = (page) => page.getByRole('region', { name: 'Horario de los avisos' });
const previewTimes = (page) => page.getByRole('region', { name: 'Avisos de hoy' }).getByRole('listitem');

function trackErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('T2-14: cambiar a 2 h → la vista previa coincide con el motor → recargar → se conserva', async ({ page }) => {
  const errors = trackErrors(page);
  await page.clock.setFixedTime(at(9));
  await page.goto('/ajustes');
  await expect(previewTimes(page)).toHaveText(['08:00', '11:00', '14:00', '17:00', '20:00']);

  await scheduleSection(page).getByRole('radio', { name: 'Cada 2 horas' }).check();
  await scheduleSection(page).getByRole('button', { name: 'Guardar horario' }).click();
  await expect(scheduleSection(page).getByRole('status')).toHaveText('Listo: guardamos tu horario.');
  const expected = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  await expect(previewTimes(page)).toHaveText(expected);

  await page.reload();
  await expect(scheduleSection(page).getByRole('radio', { name: 'Cada 2 horas' })).toBeChecked();
  await expect(previewTimes(page)).toHaveText(expected);
  expect(errors).toEqual([]);
});

test('la hora de inicio, los días y la comida se guardan y se conservan al recargar', async ({ page }) => {
  await page.clock.setFixedTime(at(9));
  await page.goto('/ajustes');
  const section = scheduleSection(page);
  await section.getByLabel('Hora del primer aviso').fill('09:00');
  await section.getByRole('checkbox', { name: 'Domingo' }).uncheck();
  await section.getByLabel('Empieza a las').fill('13:00');
  await section.getByLabel('Termina a las').fill('15:00');
  await section.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(section.getByRole('status')).toHaveText('Listo: guardamos tu horario.');
  await expect(previewTimes(page)).toHaveText(['09:00', '12:00', '15:00', '18:00']);

  await page.reload();
  await expect(section.getByLabel('Hora del primer aviso')).toHaveValue('09:00');
  await expect(section.getByRole('checkbox', { name: 'Domingo' })).not.toBeChecked();
  await expect(section.getByLabel('Empieza a las')).toHaveValue('13:00');
  await expect(section.getByLabel('Termina a las')).toHaveValue('15:00');
});
