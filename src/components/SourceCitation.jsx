// Cita de una fuente: «Fuente: {authors} ({year}). {title}, {edition}.» y la página si existe.
// APA 7: «p.» para una página; «pp.» para varias o un rango.
function pagesLabel(pages) {
  return /[,–-]/.test(pages) ? `pp. ${pages}` : `p. ${pages}`;
}

export default function SourceCitation({ source, label = 'Fuente' }) {
  const pages = source.pages?.trim();
  return (
    <section className="tip-source" aria-label={label}>
      <p>
        <strong>Fuente:</strong> {source.authors} ({source.year}). <cite>{source.title}</cite>, {source.edition}.
        {pages && ` ${pagesLabel(pages)}.`}
      </p>
      {source.url && (
        <p>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            Consultar «{source.title}» <span className="external-hint">(se abre en otra pestaña)</span>
          </a>
        </p>
      )}
    </section>
  );
}
