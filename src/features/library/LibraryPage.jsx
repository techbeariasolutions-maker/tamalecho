import { useParams, useSearchParams } from 'react-router';
import TipCard from '../../components/TipCard.jsx';
import Message from '../../components/Message.jsx';
import NotFoundPage from '../notfound/NotFoundPage.jsx';
import FrameworkSwitch from './FrameworkSwitch.jsx';
import CategoryFilter from './CategoryFilter.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

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
  const categories = getCategories(framework);
  const tips = getTips({ framework, category: selected || undefined });

  const selectCategory = (category) => setSearchParams(category ? { categoria: category } : {});

  return (
    <>
      <h1>{title}</h1>
      <FrameworkSwitch />
      <p className="lead">{DESCRIPTIONS[framework]}</p>
      <CategoryFilter categories={categories} selected={selected} onChange={selectCategory} />
      <p className="library__count" role="status">
        {tips.length} {tips.length === 1 ? 'consejo' : 'consejos'}
      </p>
      {tips.length > 0 ? (
        <ul className="tip-list" aria-label={`Consejos de ${label}`}>
          {tips.map((tip) => (
            <li key={tip.id}>
              <TipCard tip={tip} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <Message variant="empty" title={`No hay consejos en la categoría «${selected}».`}>
          <p>Elige otra categoría o «Todas».</p>
        </Message>
      )}
    </>
  );
}
