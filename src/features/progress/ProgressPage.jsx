import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Button from '../../components/Button.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useProgress } from '../../hooks/useProgress.js';
import { summarizeQuiz } from '../../services/quiz.js';
import { getBadges, getRecommendation, getRoute, getStreak, summarizeProgress } from '../../services/progress.js';

function daysText(days) {
  return days === 1 ? '1 día' : `${days} días`;
}

// Barra de progreso con nombre propio y valores para lectores de pantalla.
function ProgressBar({ label, value, max }) {
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span className="progress-bar__fill" style={{ '--progress': `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

// Mi progreso (rediseño D-24, DISEÑO_UI_UX §7): conceptos vistos y completados por enfoque, racha,
// siguiente recomendación e insignias. Todo se calcula en el dispositivo; no hay cuenta.
export default function ProgressPage() {
  useDocumentTitle('Mi progreso');
  const { FRAMEWORK_LABELS, getFeaturedTip, getQuestions, getTips } = useCatalog();
  const now = new Date();
  const tips = getTips();
  const { history, completed, answers, resetProgress } = useProgress();
  const summary = summarizeProgress({ tips, history, completed });
  const streak = getStreak(history, now);
  const recommendation = getRecommendation(getRoute(getFeaturedTip, now), tips, completed);
  const badges = getBadges(summary);
  const quiz = summarizeQuiz({ questions: getQuestions(), answers, tips });

  return (
    <>
      <h1>Mi progreso</h1>
      <p className="lead">Tu avance se guarda solo en este dispositivo. No necesitas cuenta.</p>

      <ul className="stats" aria-label="Resumen">
        <li className="stat">
          <span className="stat__value">{summary.read}</span>
          <span className="stat__label">de {summary.total} conceptos leídos</span>
        </li>
        <li className="stat">
          <span className="stat__value">{summary.completed}</span>
          <span className="stat__label">{summary.completed === 1 ? 'misión completada' : 'misiones completadas'}</span>
        </li>
        <li className="stat">
          <span className="stat__value">{daysText(streak)}</span>
          <span className="stat__label">de racha</span>
        </li>
      </ul>

      <section className="home-section" aria-labelledby="por-enfoque">
        <h2 id="por-enfoque">Por enfoque</h2>
        <p>Scrum y PMI/PMBOK se avanzan por separado: son enfoques distintos.</p>
        {Object.entries(summary.byFramework).map(([framework, data]) => (
          <div key={framework} className="framework-progress">
            <h3>{FRAMEWORK_LABELS[framework]}</h3>
            <p>
              {data.read} de {data.total} leídos · {data.completed} completados
            </p>
            <ProgressBar
              label={`Conceptos de ${FRAMEWORK_LABELS[framework]} leídos`}
              value={data.read}
              max={data.total}
            />
            {quiz[framework]?.available > 0 && (
              <p>
                Preguntas de práctica: {quiz[framework].answered} de {quiz[framework].available} contestadas ·{' '}
                {quiz[framework].correct} correctas
              </p>
            )}
          </div>
        ))}
      </section>

      <p>
        Leer o contestar una pregunta no mide cuánto aprendiste: es solo una guía para que sigas tu propio avance.
      </p>

      <section className="home-section" aria-labelledby="siguiente">
        <h2 id="siguiente">Siguiente recomendación</h2>
        {recommendation ? (
          <p>
            <Link to={`/tip/${recommendation.id}`} className="standalone-link">
              Continuar con {recommendation.title}
            </Link>
          </p>
        ) : (
          <p>¡Completaste todas las misiones! Puedes repasar cualquier concepto desde la biblioteca.</p>
        )}
      </section>

      <section className="home-section" aria-labelledby="insignias">
        <h2 id="insignias">Insignias</h2>
        <ul className="badges">
          {badges.map((badge) => (
            <li key={badge.id} className="badge" data-earned={badge.earned}>
              <span className="badge__title">{badge.title}</span>
              <span className="badge__state">{badge.earned ? '✓ Obtenida' : 'Pendiente'}</span>
              <span className="badge__description">{badge.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <ResetProgress onReset={resetProgress} />
    </>
  );
}

// Reiniciar progreso (HU-10.2-B). Confirmación dentro de la página, sin window.confirm.
// Borra misiones completadas y respuestas de las preguntas; el historial de lecturas se borra aparte.
function ResetProgress({ onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const resetButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const focusAfter = useRef(null);

  // Los botones se reemplazan entre sí: el foco se mueve al que aparece para no perderse.
  useEffect(() => {
    if (confirming) cancelButtonRef.current?.focus();
    else if (focusAfter.current === 'reset') resetButtonRef.current?.focus();
    focusAfter.current = null;
  }, [confirming]);

  const confirm = () => {
    const saved = onReset();
    setDone(saved);
    setFailed(!saved);
    focusAfter.current = 'reset';
    setConfirming(false);
  };

  const cancel = () => {
    focusAfter.current = 'reset';
    setConfirming(false);
  };

  return (
    <section className="home-section" aria-labelledby="reiniciar">
      <h2 id="reiniciar">Reiniciar progreso</h2>
      {confirming ? (
        <div className="confirm-box" role="group" aria-labelledby="reiniciar-pregunta">
          <p id="reiniciar-pregunta">
            ¿Reiniciar tu progreso? Se borran tus misiones completadas y tus respuestas de práctica en este
            dispositivo. Tu historial de lecturas y tus favoritos no cambian. No se puede deshacer.
          </p>
          <div className="button-row">
            <Button onClick={confirm}>Sí, reiniciar</Button>
            <Button variant="secondary" onClick={cancel} ref={cancelButtonRef}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setDone(false);
            setFailed(false);
            setConfirming(true);
          }}
          ref={resetButtonRef}
        >
          Reiniciar progreso
        </Button>
      )}
      <p className="settings-status" role="status">
        {done && 'Listo: tu progreso se reinició.'}
        {failed && 'No se pudo reiniciar el progreso porque este navegador no permite guardar información del sitio.'}
      </p>
    </section>
  );
}
