import AxeBuilder from '@axe-core/playwright';
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
  await section.getByLabel('Inicio de la comida').fill('13:00');
  await section.getByLabel('Fin de la comida').fill('15:00');
  await section.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(section.getByRole('status')).toHaveText('Listo: guardamos tu horario.');
  await expect(previewTimes(page)).toHaveText(['09:00', '12:00', '15:00', '18:00']);

  await page.reload();
  await expect(section.getByLabel('Hora del primer aviso')).toHaveValue('09:00');
  await expect(section.getByRole('checkbox', { name: 'Domingo' })).not.toBeChecked();
  await expect(section.getByLabel('Inicio de la comida')).toHaveValue('13:00');
  await expect(section.getByLabel('Fin de la comida')).toHaveValue('15:00');
});

// HU-07.1-B: un valor inválido no se guarda, el error se lee junto al campo y axe no reporta nada.
test('un horario inválido no se guarda y el error queda asociado al campo', async ({ page }) => {
  await page.clock.setFixedTime(at(9));
  await page.goto('/ajustes');
  const section = scheduleSection(page);
  await section.getByLabel('Inicio de la comida').fill('15:00');
  await section.getByLabel('Fin de la comida').fill('13:00');
  await section.getByRole('button', { name: 'Guardar horario' }).click();

  const end = section.getByLabel('Fin de la comida');
  await expect(end).toHaveAttribute('aria-invalid', 'true');
  await expect(end).toHaveAccessibleDescription('La comida debe terminar después de empezar.');
  await expect(end).toBeFocused();
  await expect(section.getByRole('status')).toHaveText(/No guardamos ningún cambio/);

  const { violations } = await new AxeBuilder({ page })
    .include('form.schedule-form')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations.map((violation) => violation.id)).toEqual([]);

  await page.reload();
  await expect(section.getByLabel('Inicio de la comida')).toHaveValue('12:00');
  await expect(section.getByLabel('Fin de la comida')).toHaveValue('16:00');
});

// HU-07.2-A (T2-15, parte local): la pausa se conserva al recargar y la lectura sigue funcionando.
test('la pausa persiste al recargar y la biblioteca y las fichas siguen disponibles', async ({ page }) => {
  await page.clock.setFixedTime(at(22));
  await page.goto('/ajustes');
  const pause = page.getByRole('region', { name: 'Pausa' }).getByRole('button', { name: 'Pausar avisos' });
  await expect(pause).toHaveAttribute('aria-pressed', 'false');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Los avisos están en pausa. Puedes seguir leyendo consejos cuando quieras.')).toBeVisible();

  // En pausa y en horario de silencio, leer consejos funciona igual.
  await page.goto('/biblioteca/scrum');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de Scrum');
  await page.getByRole('link', { name: /^Ver más sobre / }).first().click();
  await expect(page).toHaveURL(/\/tip\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('el silencio se guarda y se conserva al recargar', async ({ page }) => {
  await page.clock.setFixedTime(at(9));
  await page.goto('/ajustes');
  const section = scheduleSection(page);
  await section.getByLabel('Inicio del silencio').fill('20:00');
  await section.getByLabel('Fin del silencio').fill('07:00');
  await section.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(previewTimes(page)).toHaveText(['08:00', '11:00', '14:00', '17:00']);
  await page.reload();
  await expect(section.getByLabel('Inicio del silencio')).toHaveValue('20:00');
  await expect(section.getByLabel('Fin del silencio')).toHaveValue('07:00');
});
