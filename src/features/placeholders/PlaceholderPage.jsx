import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function PlaceholderPage({ title, sprint }) {
  useDocumentTitle(title);
  return (
    <>
      <h1>{title}</h1>
      <p>Esta sección estará disponible en el Sprint {sprint}.</p>
      <p>
        <Link to="/biblioteca">Ir a la biblioteca de consejos</Link>
      </p>
    </>
  );
}
