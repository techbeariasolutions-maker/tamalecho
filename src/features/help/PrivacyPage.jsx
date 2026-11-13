import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Message from '../../components/Message.jsx';
import { getPrivacy, isPrivacyDraft } from '../../services/help.js';

// Aviso de privacidad (HU-13.2-A). Describe solo lo que guardan storage.js (navegador) y
// server/subscriptions.js (servidor); si el código cambia, este texto se revisa con él.
export default function PrivacyPage() {
  useDocumentTitle('Privacidad');
  const { intro, sections } = getPrivacy();

  return (
    <>
      <h1>Privacidad</h1>
      <p className="lead">{intro}</p>

      {isPrivacyDraft() && (
        <Message title="Borrador">
          <p>Este aviso está pendiente de aprobación y puede cambiar.</p>
        </Message>
      )}

      {sections.map((section) => (
        <section key={section.id} className="help-section" aria-labelledby={`privacidad-${section.id}`}>
          <h2 id={`privacidad-${section.id}`}>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <ul>
            {section.items.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          {section.link && (
            <p>
              <Link to={section.link.to} className="standalone-link">
                {section.link.label}
              </Link>
            </p>
          )}
        </section>
      ))}
    </>
  );
}
