import { Link } from 'react-router';
import TipCard from '../../components/TipCard.jsx';
import Message from '../../components/Message.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function HomePage() {
  useDocumentTitle();
  const { getFeaturedTip } = useCatalog();
  const featured = getFeaturedTip(new Date());

  return (
    <>
      <h1>TamalEcho Tips</h1>
      <p className="lead">Consejos breves para aprender Scrum y PMI/PMBOK, cada uno con su fuente.</p>

      <section className="home-section" aria-labelledby="consejo-del-dia">
        <h2 id="consejo-del-dia">Consejo del día</h2>
        {featured ? (
          <TipCard tip={featured} headingLevel={3} />
        ) : (
          <Message variant="empty">Todavía no hay consejos publicados.</Message>
        )}
      </section>

      <section className="home-section" aria-labelledby="explorar">
        <h2 id="explorar">Explora por enfoque</h2>
        <ul className="home-access">
          <li>
            <Link to="/biblioteca/scrum" className="button button--primary home-access__link">
              Explorar Scrum
            </Link>
          </li>
          <li>
            <Link to="/biblioteca/pmbok" className="button button--primary home-access__link">
              Explorar PMI/PMBOK
            </Link>
          </li>
        </ul>
      </section>

      <nav className="home-section" aria-label="Más secciones">
        <ul className="inline-links">
          <li>
            <Link to="/biblioteca">Biblioteca</Link>
          </li>
          <li>
            <Link to="/ajustes">Ajustes</Link>
          </li>
          <li>
            <Link to="/ayuda">Ayuda</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
