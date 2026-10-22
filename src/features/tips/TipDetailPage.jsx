import { useParams } from 'react-router';
import NotFoundPage from '../notfound/NotFoundPage.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export function TipSource({ source }) {
  const pages = source.pages?.trim();
  return (
    <section className="tip-source" aria-label="Fuente">
      <p>
        <strong>Fuente:</strong> {source.authors} ({source.year}). <cite>{source.title}</cite>, {source.edition}.
        {pages && ` p. ${pages}.`}
      </p>
      <p>
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          Consultar «{source.title}» <span className="external-hint">(se abre en otra pestaña)</span>
        </a>
      </p>
    </section>
  );
}

export default function TipDetailPage() {
  const { id } = useParams();
  const { getTipById } = useCatalog();
  const tip = getTipById(id);
  return tip ? <TipDetail key={tip.id} tip={tip} /> : <NotFoundPage />;
}

function TipDetail({ tip }) {
  const { FRAMEWORK_LABELS } = useCatalog();
  useDocumentTitle(tip.title);

  return (
    <>
      <article className="tip-detail">
        <p className="tip-detail__context">
          {FRAMEWORK_LABELS[tip.framework]} · {tip.category}
        </p>
        <h1>{tip.title}</h1>
        <p className="lead">{tip.summary}</p>

        <h2>Explicación</h2>
        <p>{tip.explanation}</p>
        <h2>Error frecuente</h2>
        <p>{tip.commonMistake}</p>
        <h2>Ejemplo</h2>
        <p>{tip.example}</p>
        <h2>Acción para hoy</h2>
        <p>{tip.action}</p>

        <TipSource source={tip.source} />
        <p className="tip-detail__meta">
          {tip.id} · versión {tip.version}
        </p>
      </article>
    </>
  );
}
