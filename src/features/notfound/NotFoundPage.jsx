import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <>
      <h1>No encontramos esta página</h1>
      <p>Es posible que la dirección esté mal escrita o que la página ya no exista.</p>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </>
  );
}
