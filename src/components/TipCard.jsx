import { Link, useLocation } from 'react-router';
import { STATUS_LABELS } from '../services/progress.js';

// Tarjeta compacta de un concepto (rediseño D-24, DISEÑO_UI_UX §5): categoría, título, resumen
// de una o dos líneas, estado y la acción. El área y la acción práctica viven en la ficha.
// Pasa en `state` la URL actual para que la ficha pueda volver a ella.
// - `status`: 'nuevo' | 'leido' | 'completado' (opcional). Se dice con texto, no solo con color.
export default function TipCard({ tip, headingLevel = 2, status }) {
  const location = useLocation();
  const Heading = `h${headingLevel}`;
  const titleId = `tip-${tip.id}-titulo`;

  return (
    <article className="tip-card" aria-labelledby={titleId} data-status={status}>
      <div className="tip-card__tags">
        <p className="pill">{tip.category}</p>
        {status && (
          <p className="pill" data-status={status}>
            {status === 'nuevo' ? STATUS_LABELS.nuevo : `✓ ${STATUS_LABELS[status]}`}
          </p>
        )}
      </div>
      <Heading id={titleId} className="tip-card__title">
        {tip.title}
      </Heading>
      <p className="tip-card__summary">{tip.summary}</p>
      <Link
        to={`/tip/${tip.id}`}
        state={{ from: `${location.pathname}${location.search}` }}
        className="tip-card__link"
      >
        Ver más sobre {tip.title}
      </Link>
    </article>
  );
}
