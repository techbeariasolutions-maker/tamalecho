import { Link, useLocation } from 'react-router';

// Tarjeta de un consejo. Pasa en `state` la URL actual para que la ficha pueda volver a ella.
export default function TipCard({ tip, headingLevel = 2 }) {
  const location = useLocation();
  const Heading = `h${headingLevel}`;
  const titleId = `tip-${tip.id}-titulo`;

  return (
    <article className="tip-card" aria-labelledby={titleId}>
      <Heading id={titleId} className="tip-card__title">
        {tip.title}
      </Heading>
      <p className="tip-card__summary">{tip.summary}</p>
      <dl className="tip-card__meta">
        <div>
          <dt>Área</dt>
          <dd>{tip.knowledgeArea}</dd>
        </div>
        <div>
          <dt>Acción para hoy</dt>
          <dd>{tip.action}</dd>
        </div>
      </dl>
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
