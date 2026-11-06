import { useState } from 'react';
import Button from '../../components/Button.jsx';

// Días en el orden de un calendario de México (lunes primero). El número es el de Date#getDay().
const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

// Campos del horario que edita este formulario. La pausa tiene su propio control.
function pickSchedule(settings) {
  return {
    intervalMinutes: settings.intervalMinutes,
    startTime: settings.startTime,
    activeDays: [...settings.activeDays],
    lunchStart: settings.lunchStart,
    lunchEnd: settings.lunchEnd,
  };
}

const STATUS_TEXT = {
  saved: 'Listo: guardamos tu horario.',
  storageFailed: 'No se pudo guardar porque este navegador no permite guardar información del sitio.',
};

// Campo de hora con etiqueta visible.
function TimeField({ id, label, value, onChange }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field__input"
        id={id}
        type="time"
        step="60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

// Panel de horario (HU-07.1-A): cadencia, hora de inicio, días activos y franja de comida.
// `onSave(patch)` es saveSettings de useSettings y devuelve { saved, settings, errors }.
export default function ScheduleForm({ settings, onSave }) {
  const [draft, setDraft] = useState(() => pickSchedule(settings));
  const [status, setStatus] = useState('');

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const toggleDay = (day) =>
    setDraft((current) => ({
      ...current,
      activeDays: current.activeDays.includes(day)
        ? current.activeDays.filter((item) => item !== day)
        : [...current.activeDays, day],
    }));

  const submit = (event) => {
    event.preventDefault();
    const result = onSave(draft);
    setStatus(result.saved ? 'saved' : 'storageFailed');
  };

  return (
    <form className="schedule-form" onSubmit={submit} noValidate>
      <fieldset className="fieldset">
        <legend className="fieldset__legend">Cada cuánto quieres un consejo</legend>
        {[120, 180].map((minutes) => (
          <label key={minutes} className="choice">
            <input
              type="radio"
              name="intervalMinutes"
              value={minutes}
              checked={draft.intervalMinutes === minutes}
              onChange={() => update('intervalMinutes', minutes)}
            />
            {minutes === 120 ? 'Cada 2 horas' : 'Cada 3 horas'}
          </label>
        ))}
      </fieldset>

      <TimeField
        id="horario-inicio"
        label="Hora del primer aviso"
        value={draft.startTime}
        onChange={(value) => update('startTime', value)}
      />

      <fieldset className="fieldset">
        <legend className="fieldset__legend">Días con avisos</legend>
        <div className="choice-grid">
          {DAYS.map(({ value, label }) => (
            <label key={value} className="choice">
              <input
                type="checkbox"
                name="activeDays"
                value={value}
                checked={draft.activeDays.includes(value)}
                onChange={() => toggleDay(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">Hora de la comida</legend>
        <p className="fieldset__hint">En esta franja el personaje tiene hambre.</p>
        <TimeField
          id="comida-inicio"
          label="Empieza a las"
          value={draft.lunchStart}
          onChange={(value) => update('lunchStart', value)}
        />
        <TimeField
          id="comida-fin"
          label="Termina a las"
          value={draft.lunchEnd}
          onChange={(value) => update('lunchEnd', value)}
        />
      </fieldset>

      <div className="button-row">
        <Button type="submit">Guardar horario</Button>
      </div>
      <p className="settings-status" role="status">
        {STATUS_TEXT[status] ?? ''}
      </p>
    </form>
  );
}
