import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { DEFAULT_SETTINGS } from '../../services/schedule.js';

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

// Id del control que recibe el foco cuando su campo tiene un error, en el orden del formulario.
const FIELD_CONTROL = {
  intervalMinutes: 'cadencia-180',
  startTime: 'horario-inicio',
  activeDays: 'dia-1',
  lunchStart: 'comida-inicio',
  lunchEnd: 'comida-fin',
};
const FIELD_ORDER = Object.keys(FIELD_CONTROL);

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
  restored: 'Listo: el horario volvió a los valores recomendados.',
  invalid: 'No guardamos ningún cambio: revisa los campos marcados.',
  storageFailed: 'No se pudo guardar porque este navegador no permite guardar información del sitio.',
};

const errorId = (field) => `error-${field}`;

// Mensaje de error de un campo. Solo existe cuando hay error, y solo entonces el control
// lo enlaza con aria-describedby.
function FieldError({ field, message }) {
  if (!message) return null;
  return (
    <p className="field__error" id={errorId(field)}>
      {message}
    </p>
  );
}

// Campo de hora con etiqueta visible y su error.
function TimeField({ id, field, label, value, error, onChange }) {
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
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId(field) : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError field={field} message={error} />
    </div>
  );
}

// Panel de horario (HU-07.1-A) con guardado validado (HU-07.1-B).
// `onSave(patch)` es saveSettings de useSettings: valida con validateSettings y, si algún valor es
// inválido, no guarda nada y devuelve los errores por campo. Aquí solo se muestran.
export default function ScheduleForm({ settings, onSave }) {
  const [draft, setDraft] = useState(() => pickSchedule(settings));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  // Campo que recibe el foco después del render que muestra los errores.
  const focusField = useRef(null);

  useEffect(() => {
    if (!focusField.current) return;
    document.getElementById(FIELD_CONTROL[focusField.current])?.focus();
    focusField.current = null;
  });

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const toggleDay = (day) =>
    setDraft((current) => ({
      ...current,
      activeDays: current.activeDays.includes(day)
        ? current.activeDays.filter((item) => item !== day)
        : [...current.activeDays, day],
    }));

  const save = (patch, successStatus) => {
    const result = onSave(patch);
    if (result.errors.length > 0) {
      const byField = {};
      for (const { field, message } of result.errors) byField[field] ??= message;
      setErrors(byField);
      setStatus('invalid');
      focusField.current = FIELD_ORDER.find((field) => byField[field]) ?? null;
      return;
    }
    setErrors({});
    setStatus(result.saved ? successStatus : 'storageFailed');
  };

  const submit = (event) => {
    event.preventDefault();
    save(draft, 'saved');
  };

  const restoreDefaults = () => {
    const defaults = pickSchedule(DEFAULT_SETTINGS);
    setDraft(defaults);
    save(defaults, 'restored');
  };

  // Los grupos (radios y casillas) describen su error en el fieldset y en cada control.
  const groupDescribedBy = (field) => (errors[field] ? errorId(field) : undefined);

  return (
    <form className="schedule-form" onSubmit={submit} noValidate>
      <fieldset className="fieldset" aria-describedby={groupDescribedBy('intervalMinutes')}>
        <legend className="fieldset__legend">Cada cuánto quieres un consejo</legend>
        {[120, 180].map((minutes) => (
          <label key={minutes} className="choice">
            <input
              id={`cadencia-${minutes}`}
              type="radio"
              name="intervalMinutes"
              value={minutes}
              checked={draft.intervalMinutes === minutes}
              aria-describedby={groupDescribedBy('intervalMinutes')}
              onChange={() => update('intervalMinutes', minutes)}
            />
            {minutes === 120 ? 'Cada 2 horas' : 'Cada 3 horas'}
          </label>
        ))}
        <FieldError field="intervalMinutes" message={errors.intervalMinutes} />
      </fieldset>

      <TimeField
        id="horario-inicio"
        field="startTime"
        label="Hora del primer aviso"
        value={draft.startTime}
        error={errors.startTime}
        onChange={(value) => update('startTime', value)}
      />

      <fieldset className="fieldset" aria-describedby={groupDescribedBy('activeDays')}>
        <legend className="fieldset__legend">Días con avisos</legend>
        <div className="choice-grid">
          {DAYS.map(({ value, label }) => (
            <label key={value} className="choice">
              <input
                id={`dia-${value}`}
                type="checkbox"
                name="activeDays"
                value={value}
                checked={draft.activeDays.includes(value)}
                aria-invalid={errors.activeDays ? 'true' : undefined}
                aria-describedby={groupDescribedBy('activeDays')}
                onChange={() => toggleDay(value)}
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError field="activeDays" message={errors.activeDays} />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">Hora de la comida</legend>
        <p className="fieldset__hint">En esta franja el personaje tiene hambre.</p>
        <TimeField
          id="comida-inicio"
          field="lunchStart"
          label="Empieza a las"
          value={draft.lunchStart}
          error={errors.lunchStart}
          onChange={(value) => update('lunchStart', value)}
        />
        <TimeField
          id="comida-fin"
          field="lunchEnd"
          label="Termina a las"
          value={draft.lunchEnd}
          error={errors.lunchEnd}
          onChange={(value) => update('lunchEnd', value)}
        />
      </fieldset>

      <div className="button-row">
        <Button type="submit">Guardar horario</Button>
        <Button variant="secondary" onClick={restoreDefaults}>
          Restaurar valores recomendados
        </Button>
      </div>
      <p className="settings-status" role="status">
        {STATUS_TEXT[status] ?? ''}
      </p>
    </form>
  );
}
