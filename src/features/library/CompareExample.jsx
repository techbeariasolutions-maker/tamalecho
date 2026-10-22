import SourceCitation from '../../components/SourceCitation.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';

// Mismo problema explicado desde cada enfoque. Se abre y cierra con <details>,
// que funciona con teclado sin código extra.
export default function CompareExample() {
  const { getComparison } = useCatalog();
  const comparison = getComparison();

  return (
    <details className="compare">
      <summary className="compare__summary">Ver ejemplo: mismo problema, dos enfoques</summary>
      <section className="compare__body" aria-labelledby="comparacion-titulo">
        <h2 id="comparacion-titulo">Mismo problema, dos enfoques</h2>
        <p className="compare__situation">
          <strong>Situación:</strong> {comparison.situation}.
        </p>
        <p className="compare__note">{comparison.notEquivalent}</p>
        <div className="compare__columns">
          {comparison.perspectives.map((perspective) => (
            <article key={perspective.framework} className="compare__column" aria-labelledby={`comparacion-${perspective.framework}`}>
              <h3 id={`comparacion-${perspective.framework}`}>{perspective.title}</h3>
              <p>{perspective.text}</p>
              <SourceCitation source={perspective.source} label={`Fuente: ${perspective.title}`} />
            </article>
          ))}
        </div>
      </section>
    </details>
  );
}
