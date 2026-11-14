import { Link, useParams, useSearchParams } from 'react-router';
import Button from '../../components/Button.jsx';
import TipCard from '../../components/TipCard.jsx';
import Message from '../../components/Message.jsx';
import NotFoundPage from '../notfound/NotFoundPage.jsx';
import FrameworkSwitch from './FrameworkSwitch.jsx';
import CategoryFilter from './CategoryFilter.jsx';
import CompareExample from './CompareExample.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useProgress } from '../../hooks/useProgress.js';
import { getTipStatus } from '../../services/progress.js';
import { searchTips } from '../../services/search.js';

// Cuántos conceptos muestra la ruta recomendada de cada enfoque.
const RECOMMENDED_COUNT = 3;

// Una línea por enfoque, sin compararlo con el otro.
const DESCRIPTIONS = {
  scrum: 'Scrum es un marco de trabajo ligero para crear valor con soluciones adaptativas a problemas complejos.',
  pmbok: 'La Guía del PMBOK reúne buenas prácticas para dirigir proyectos a lo largo de todo su ciclo de vida.',
};

export default function LibraryPage() {
  const { enfoque } = useParams();
  const { isFramework } = useCatalog();
  if (!isFramework(enfoque)) return <NotFoundPage />;
  return <FrameworkLibrary key={enfoque} framework={enfoque} />;
}

function FrameworkLibrary({ framework }) {
  const { FRAMEWORK_LABELS, getCategories, getTips } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const label = FRAMEWORK_LABELS[framework];
  const title = `Biblioteca de ${label}`;
  useDocumentTitle(title);

  const selected = searchParams.get('categoria') ?? '';
  const query = searchParams.get('q') ?? '';
  const categories = getCategories(framework);
  const tips = searchTips(getTips({ framework, category: selected || undefined }), query);

  // Estado de cada concepto para quien lee (D-24): nuevo, leído o completado, solo en este dispositivo.
  const { history, completed } = useProgress();
  const readIds = new Set(history.map((entry) => entry.id));
  // Ruta recomendada del enfoque (D-24 etapa 3): los siguientes conceptos sin completar.
  const recommended = getTips({ framework })
    .filter((tip) => !completed[tip.id])
    .slice(0, RECOMMENDED_COUNT);

  // Filtro y búsqueda viven juntos en la URL; cambiar uno conserva el otro.
  const updateParams = (changes, options) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, options);
  };
  const selectCategory = (category) => updateParams({ categoria: category });
  // Escribir no llena el historial del navegador: cada letra reemplaza la entrada actual.
  const search = (value) => updateParams({ q: value }, { replace: true });
  const otherFramework = Object.keys(FRAMEWORK_LABELS).find((key) => key !== framework);

  return (
    <>
      <h1>{title}</h1>
      <FrameworkSwitch />
      <p className="lead">{DESCRIPTIONS[framework]}</p>

      <section className="recommended" aria-labelledby="ruta-recomendada">
        <h2 id="ruta-recomendada">Ruta recomendada de {label}</h2>
        {recommended.length > 0 ? (
          <ol className="recommended__list">
            {recommended.map((tip) => (
              <li key={tip.id}>
                <Link to={`/tip/${tip.id}`} state={{ from: `/biblioteca/${framework}` }} className="standalone-link">
                  {tip.title}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p>¡Completaste todas las misiones de {label}! Puedes repasar cualquier concepto.</p>
        )}
      </section>

      <CompareExample />

      <div className="library-search" role="search">
        <label htmlFor="buscar-conceptos" className="library-search__label">
          Buscar en {label}
        </label>
        <input
          id="buscar-conceptos"
          type="search"
          className="library-search__input"
          value={query}
          onChange={(event) => search(event.target.value)}
          placeholder="Por ejemplo: riesgo, backlog, alcance"
          autoComplete="off"
        />
      </div>
      <CategoryFilter categories={categories} selected={selected} onChange={selectCategory} />
      <p className="library__count" role="status">
        {tips.length} {tips.length === 1 ? 'consejo' : 'consejos'}
        {query && ` para «${query.trim()}»`}
      </p>
      {tips.length > 0 ? (
        <ul className="tip-list" aria-label={`Consejos de ${label}`}>
          {tips.map((tip) => (
            <li key={tip.id}>
              <TipCard tip={tip} headingLevel={2} status={getTipStatus(tip.id, readIds, completed)} />
            </li>
          ))}
        </ul>
      ) : query ? (
        <Message variant="empty" title={`No encontramos «${query.trim()}» en ${label}.`}>
          <p>Prueba con otra palabra, quita el filtro de categoría o busca en el otro enfoque.</p>
          <div className="button-row">
            <Button variant="secondary" onClick={() => updateParams({ q: '', categoria: '' })}>
              Limpiar búsqueda y filtro
            </Button>
            <Link
              to={`/biblioteca/${otherFramework}?${new URLSearchParams({ q: query })}`}
              className="button button--secondary"
            >
              Buscar «{query.trim()}» en {FRAMEWORK_LABELS[otherFramework]}
            </Link>
          </div>
        </Message>
      ) : (
        <Message variant="empty" title={`No hay consejos en la categoría «${selected}».`}>
          <p>Elige otra categoría o «Todas».</p>
        </Message>
      )}
    </>
  );
}
