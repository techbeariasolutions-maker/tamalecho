import { Link } from 'react-router';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useProgress } from '../../hooks/useProgress.js';
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
  const { FRAMEWORK_LABELS, getFeaturedTip, getTips } = useCatalog();
  const now = new Date();
  const tips = getTips();
  const { history, completed } = useProgress();
  const summary = summarizeProgress({ tips, history, completed });
  const streak = getStreak(history, now);
  const recommendation = getRecommendation(getRoute(getFeaturedTip, now), tips, completed);
  const badges = getBadges(summary);

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
          </div>
        ))}
      </section>

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
    </>
  );
}
