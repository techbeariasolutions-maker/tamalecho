import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Button from '../../components/Button.jsx';
import Message from '../../components/Message.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useFavorites } from '../../hooks/useFavorites.js';
import { getHistoryList } from '../../services/progress.js';
import { getBrowserRepository } from '../../services/storage.js';

const DATE_TIME = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

// Historial y favoritos (HU-08.1-B, HU-08.2-A; diseño D-24): consejos abiertos en este dispositivo,
// del más reciente al más antiguo, con filtro por enfoque en la URL (?enfoque=) y opción de borrarlos;
// arriba, los favoritos guardados. Recibir un aviso no cuenta como abrir un consejo (HU-08.1-A).
export default function HistoryPage({ repository = getBrowserRepository() }) {
  useDocumentTitle('Historial');
  const { FRAMEWORK_LABELS, getTipById, isFramework } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('enfoque') ?? '';
  const framework = isFramework(requested) ? requested : '';
  const [history, setHistory] = useState(() => repository.getHistory());
  // Al borrar, el botón desaparece: el foco pasa al título de la sección para no perderse.
  const headingRef = useRef(null);
  const [cleared, setCleared] = useState(false);
  useEffect(() => {
    if (cleared) headingRef.current?.focus();
  }, [cleared]);
  const all = getHistoryList(history, getTipById);
  const list = getHistoryList(history, getTipById, framework || undefined);

  const select = (value) => setSearchParams(value ? { enfoque: value } : {});

  return (
    <>
      <h1>Historial</h1>
      <p className="lead">Tus favoritos y los consejos que abriste en este dispositivo.</p>

      <FavoritesSection repository={repository} labels={FRAMEWORK_LABELS} getTipById={getTipById} />

      <section className="home-section" aria-labelledby="abiertos-titulo">
        <h2 id="abiertos-titulo" ref={headingRef} tabIndex={-1}>
          Consejos abiertos
        </h2>
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
            <ClearHistory
              repository={repository}
              onCleared={() => {
                setHistory([]);
                setCleared(true);
              }}
            />
          </>
        )}
      </section>
    </>
  );
}

// Favoritos guardados (HU-08.2-A), en el orden en que se guardaron, con opción de quitarlos.
function FavoritesSection({ repository, labels, getTipById }) {
  const { favorites, toggle } = useFavorites(repository);
  const tips = favorites.map(getTipById).filter(Boolean);

  return (
    <section className="home-section" aria-labelledby="favoritos-titulo">
      <h2 id="favoritos-titulo">Favoritos</h2>
      {tips.length === 0 ? (
        <p>Todavía no guardas favoritos. En cada consejo puedes pulsar «Guardar en favoritos».</p>
      ) : (
        <ul className="history-list" aria-label="Favoritos">
          {tips.map((tip) => (
            <li key={tip.id} className="history-item">
              <p className="pill">{labels[tip.framework]}</p>
              <p className="history-item__title">{tip.title}</p>
              <div className="button-row">
                <Link to={`/tip/${tip.id}`} className="standalone-link">
                  Abrir {tip.title}
                </Link>
                <Button variant="secondary" onClick={() => toggle(tip.id)}>
                  Quitar {tip.title} de favoritos
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// «Borrar historial» (HU-08.1-B) con confirmación dentro de la página, sin window.confirm.
// Solo borra las lecturas: favoritos, misiones completadas y ajustes no cambian.
function ClearHistory({ repository, onCleared }) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef(null);
  const askRef = useRef(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (returnFocus.current) askRef.current?.focus();
  }, [confirming]);

  const confirm = () => {
    repository.clearHistory();
    onCleared();
  };

  const cancel = () => {
    returnFocus.current = true;
    setConfirming(false);
  };

  return confirming ? (
    <div className="confirm-box" role="group" aria-labelledby="borrar-historial-pregunta">
      <p id="borrar-historial-pregunta">
        ¿Borrar tu historial de lecturas en este dispositivo? Tus favoritos y tus misiones completadas no cambian. No
        se puede deshacer.
      </p>
      <div className="button-row">
        <Button onClick={confirm}>Sí, borrar historial</Button>
        <Button variant="secondary" onClick={cancel} ref={cancelRef}>
          Cancelar
        </Button>
      </div>
    </div>
  ) : (
    <p>
      <Button variant="secondary" onClick={() => setConfirming(true)} ref={askRef}>
        Borrar historial
      </Button>
    </p>
  );
}
