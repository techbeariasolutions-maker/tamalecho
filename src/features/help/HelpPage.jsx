import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Message from '../../components/Message.jsx';
import { getHelpItems, getLimitations, getSuggestions, isHelpDraft } from '../../services/help.js';

// Ayuda (HU-13.1-A), limitaciones (HU-13.1-B) y canal de sugerencias (HU-13.2-B).
// Los textos vienen de services/help.js.
export default function HelpPage() {
  useDocumentTitle('Ayuda');
  const items = getHelpItems();
  const suggestions = getSuggestions();

  return (
    <>
      <h1>Ayuda</h1>
      <p className="lead">Respuestas cortas sobre los avisos, los permisos y lo que puedes esperar de TamalEcho Tips.</p>

      {isHelpDraft() && (
        <Message title="Borrador">
          <p>Estos textos están pendientes de aprobación y pueden cambiar.</p>
        </Message>
      )}

      <section className="help-section" aria-labelledby="preguntas-titulo">
        <h2 id="preguntas-titulo">Preguntas frecuentes</h2>
        {items.map((item) => (
          <article key={item.id} className="help-item" aria-labelledby={`ayuda-${item.id}`}>
            <h3 id={`ayuda-${item.id}`}>{item.question}</h3>
            {item.answer.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {item.link && (
              <p>
                <Link to={item.link.to} className="standalone-link">
                  {item.link.label}
                </Link>
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="help-section" aria-labelledby="limitaciones-titulo">
        <h2 id="limitaciones-titulo">Limitaciones</h2>
        <ul>
          {getLimitations().map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </section>

      <section className="help-section" aria-labelledby="datos-titulo">
        <h2 id="datos-titulo">Tus datos</h2>
        <p>Qué guardamos, dónde y cómo borrarlo o cancelar tu suscripción a los avisos.</p>
        <p>
          <Link to="/privacidad" className="standalone-link">
            Leer el aviso de privacidad
          </Link>
        </p>
      </section>

      <section className="help-section" aria-labelledby="sugerencias-titulo">
        <h2 id="sugerencias-titulo">Sugerencias</h2>
        <p>{suggestions.text}</p>
        <p>
          <a href={suggestions.url} target="_blank" rel="noopener noreferrer" className="standalone-link">
            {suggestions.label} <span className="external-hint">(se abre en otra pestaña)</span>
          </a>
        </p>
      </section>
    </>
  );
}
