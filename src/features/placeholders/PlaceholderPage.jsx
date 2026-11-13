import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

// Marcador honesto (D-11): si se sabe en qué sprint llega la sección, lo dice;
// si no está comprometida en ningún sprint, no promete fecha.
export default function PlaceholderPage({ title, sprint }) {
  useDocumentTitle(title);
  return (
    <>
      <h1>{title}</h1>
      <p>
        {sprint
          ? `Esta sección estará disponible en el Sprint ${sprint}.`
          : 'Esta sección todavía no está disponible.'}
      </p>
      <p>
        <Link to="/biblioteca" className="standalone-link">
          Ir a la biblioteca de consejos
        </Link>
      </p>
    </>
  );
}
