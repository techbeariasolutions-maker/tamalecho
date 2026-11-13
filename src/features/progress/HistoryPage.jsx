import { Link, useSearchParams } from 'react-router';
import Button from '../../components/Button.jsx';
import Message from '../../components/Message.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useProgress } from '../../hooks/useProgress.js';
import { getHistoryList } from '../../services/progress.js';

const DATE_TIME = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

// Historial (rediseño D-24, DISEÑO_UI_UX §7; equivale a HU-08.1-B): consejos abiertos en este
// dispositivo, del más reciente al más antiguo, con filtro por enfoque en la URL (?enfoque=).
export default function HistoryPage() {
  useDocumentTitle('Historial');
  const { FRAMEWORK_LABELS, getTipById, isFramework } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('enfoque') ?? '';
  const framework = isFramework(requested) ? requested : '';
  const { history } = useProgress();
  const all = getHistoryList(history, getTipById);
  const list = getHistoryList(history, getTipById, framework || undefined);

  const select = (value) => setSearchParams(value ? { enfoque: value } : {});

  return (
    <>
      <h1>Historial</h1>
      <p className="lead">Los consejos que abriste en este dispositivo, del más reciente al más antiguo.</p>

      {all.length === 0 ? (
        <Message variant="empty" title="Todavía no abres ningún consejo.">
          <p>Tu historial empieza con tu primera misión.</p>
          <p>
            <Link to="/" className="standalone-link">
              Empezar la misión de hoy
            </Link>
          </p>
        </Message>
      ) : (
        <>
          <div className="category-filter" role="group" aria-label="Filtrar por enfoque">
            <Button variant="secondary" aria-pressed={framework === ''} onClick={() => select('')}>
              Todos
            </Button>
            {Object.entries(FRAMEWORK_LABELS).map(([value, label]) => (
              <Button key={value} variant="secondary" aria-pressed={framework === value} onClick={() => select(value)}>
                {label}
              </Button>
            ))}
          </div>
          <p className="library__count" role="status">
            {list.length} {list.length === 1 ? 'consejo' : 'consejos'}
          </p>
          {list.length > 0 ? (
            <ol className="history-list" aria-label="Consejos abiertos">
              {list.map(({ tip, at }) => (
                <li key={tip.id} className="history-item">
                  <p className="pill">{FRAMEWORK_LABELS[tip.framework]}</p>
                  <p className="history-item__title">{tip.title}</p>
                  <p className="history-item__date">
                    Abierto el <time dateTime={at.toISOString()}>{DATE_TIME.format(at)}</time>
                  </p>
                  <Link to={`/tip/${tip.id}`} className="standalone-link">
                    Abrir de nuevo {tip.title}
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <Message variant="empty" title={`No has abierto consejos de ${FRAMEWORK_LABELS[framework]}.`}>
              <p>
                <Link to={`/biblioteca/${framework}`} className="standalone-link">
                  Explorar {FRAMEWORK_LABELS[framework]}
                </Link>
              </p>
            </Message>
          )}
        </>
      )}
    </>
  );
}
