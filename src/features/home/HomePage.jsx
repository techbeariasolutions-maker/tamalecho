import { Link } from 'react-router';
import Message from '../../components/Message.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useDayPart } from '../../hooks/useDayPart.js';
import { useProgress } from '../../hooks/useProgress.js';
import { useSettings } from '../../hooks/useSettings.js';
import {
  getRoute,
  getStreak,
  getTipStatus,
  missionsText,
  readingMinutes,
  STATUS_LABELS,
  summarizeProgress,
} from '../../services/progress.js';
import Avatar from '../avatar/Avatar.jsx';
import NextTip from '../scheduler/NextTip.jsx';

const WEEKDAY = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric' });

function streakText(days) {
  if (days === 0) return 'Empieza tu racha hoy';
  return days === 1 ? 'Racha de 1 día' : `Racha de ${days} días`;
}

// Portada «Ruta diaria» (rediseño D-24, DISEÑO_UI_UX §4): la misión del día es lo principal y
// tiene la única llamada a la acción del héroe. Debajo, la ruta de 5 días y los accesos por enfoque.
export default function HomePage() {
  useDocumentTitle();
  const { getFeaturedTip, getTips, FRAMEWORK_LABELS } = useCatalog();
  const now = new Date();
  const mission = getFeaturedTip(now);
  // El personaje usa la franja de comida guardada en Ajustes (getDayPart en schedule.js).
  const { settings } = useSettings();
  const dayPart = useDayPart(settings);
  const { history, completed } = useProgress();
  const progress = summarizeProgress({ tips: getTips(), history, completed });
  const route = getRoute(getFeaturedTip, now);
  const missionStatus = mission ? getTipStatus(mission.id, progress.readIds, completed) : null;
  const missionAction = missionStatus === 'completado' ? 'Repasar misión' : 'Empezar misión';

  return (
    <>
      <section className="hero" aria-labelledby="ruta-titulo">
        <div className="hero__text">
          <p className="hero__eyebrow">
            ¡Hola! <span aria-hidden="true">·</span> {streakText(getStreak(history, now))}
          </p>
          <h1 id="ruta-titulo">Tu ruta diaria</h1>
          <p className="lead">Un concepto corto de Scrum o PMI/PMBOK al día, siempre con su fuente.</p>

          {mission ? (
            <article className="mission-card" aria-labelledby="mision-titulo">
              <p className="pill pill--accent">Misión de hoy</p>
              <h2 id="mision-titulo" className="mission-card__title">
                {mission.title}
              </h2>
              <p className="mission-card__meta">
                {FRAMEWORK_LABELS[mission.framework]} · {mission.category} · {readingMinutes(mission)} min de lectura
              </p>
              <p>{mission.summary}</p>
              {/* El nombre accesible empieza con el texto visible y agrega a dónde lleva (WCAG 2.5.3). */}
              <Link
                to={`/tip/${mission.id}`}
                className="button button--primary button--large"
                aria-label={`${missionAction}: ${mission.title}`}
              >
                {missionAction}
              </Link>
            </article>
          ) : (
            <Message variant="empty">Todavía no hay consejos publicados.</Message>
          )}
        </div>
        <Avatar dayPart={dayPart} size="hero" />
      </section>

      <NextTip settings={settings} />

      <section className="home-section" aria-labelledby="ruta-semanal">
        <h2 id="ruta-semanal">Tu ruta de la semana</h2>
        <p className="progress-summary">
          Llevas {progress.read} de {progress.total} conceptos leídos y {missionsText(progress.completed)}.
        </p>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Conceptos leídos"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.read}
        >
          <span className="progress-bar__fill" style={{ '--progress': `${(progress.read / progress.total) * 100}%` }} />
        </div>
        <ol className="route">
          {route.map(({ date, tip, isToday }) => {
            const status = getTipStatus(tip.id, progress.readIds, completed);
            return (
              <li key={tip.id} className="route__step" data-status={status} aria-current={isToday ? 'step' : undefined}>
                <Link to={`/tip/${tip.id}`} className="route__link">
                  <span className="route__day">{isToday ? 'Hoy' : WEEKDAY.format(date)}</span>
                  <span className="route__title">{tip.title}</span>
                  <span className="pill" data-status={status}>
                    {status === 'nuevo' ? STATUS_LABELS.nuevo : `✓ ${STATUS_LABELS[status]}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-section" aria-labelledby="explorar">
        <h2 id="explorar">Explora por enfoque</h2>
        <p>
          ¿Por dónde empezar? Si tu equipo trabaja en iteraciones cortas, empieza por Scrum; si necesitas planear todo
          el ciclo del proyecto, empieza por PMI/PMBOK. Son enfoques distintos, no equivalentes.
        </p>
        <ul className="home-access">
          <li>
            <Link to="/biblioteca/scrum" className="button button--secondary home-access__link">
              Explorar Scrum
            </Link>
          </li>
          <li>
            <Link to="/biblioteca/pmbok" className="button button--secondary home-access__link">
              Explorar PMI/PMBOK
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
