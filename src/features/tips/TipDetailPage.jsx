import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import Message from '../../components/Message.jsx';
import SourceCitation from '../../components/SourceCitation.jsx';
import FrameworkSwitch from '../library/FrameworkSwitch.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useReadingLog } from '../../hooks/useReadingLog.js';
import { useDayPart } from '../../hooks/useDayPart.js';
import { useProgress } from '../../hooks/useProgress.js';
import { useSettings } from '../../hooks/useSettings.js';
import { readingMinutes } from '../../services/progress.js';
import Button from '../../components/Button.jsx';
import Avatar from '../avatar/Avatar.jsx';

// Solo se acepta volver a una URL de la biblioteca; cualquier otra cosa usa la categoría del tip.
function libraryUrlFor(tip, from) {
  if (typeof from === 'string' && from.startsWith('/biblioteca/')) return from;
  return `/biblioteca/${tip.framework}?${new URLSearchParams({ categoria: tip.category })}`;
}

export default function TipDetailPage() {
  const { id } = useParams();
  const { getTipById } = useCatalog();
  const tip = getTipById(id);
  return tip ? <TipDetail key={tip.id} tip={tip} /> : <TipNotFound />;
}

function TipDetail({ tip }) {
  const location = useLocation();
  const { FRAMEWORK_LABELS, getNextTip } = useCatalog();
  useDocumentTitle(tip.title);
  // Abrir la ficha cuenta como lectura (HU-08.1-A).
  useReadingLog(tip.id);

  // Al pasar al siguiente consejo, la lectura empieza arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tip.id]);

  const backTo = libraryUrlFor(tip, location.state?.from);
  const next = getNextTip(tip.id);

  return (
    <>
      <FrameworkSwitch current={tip.framework} />
      <article className="tip-detail">
        <p className="tip-detail__context">
          {FRAMEWORK_LABELS[tip.framework]} · {tip.category}
        </p>
        <h1>{tip.title}</h1>
        <p className="tip-detail__time">{readingMinutes(tip)} min de lectura</p>
        <p className="lead">{tip.summary}</p>

        <section className="lesson-block" aria-labelledby="explicacion">
          <h2 id="explicacion">Explicación</h2>
          <p>{tip.explanation}</p>
        </section>
        {/* Aviso suave, no alarmante (DISEÑO_UI_UX §6). */}
        <section className="lesson-block lesson-block--mistake" aria-labelledby="error-frecuente">
          <h2 id="error-frecuente">Error frecuente</h2>
          <p>{tip.commonMistake}</p>
        </section>
        <section className="lesson-block lesson-block--example" aria-labelledby="ejemplo">
          <h2 id="ejemplo">Ejemplo</h2>
          <p>{tip.example}</p>
        </section>
        <section className="lesson-block lesson-block--action" aria-labelledby="accion">
          <h2 id="accion">
            <MissionIcon /> Acción para hoy
          </h2>
          <p>{tip.action}</p>
        </section>

        <SourceCitation source={tip.source} />
        <p className="tip-detail__tags">
          <strong>Etiquetas:</strong> {tip.tags.join(', ')}
        </p>
        <p className="tip-detail__meta">
          {tip.id} · versión {tip.version}
        </p>
      </article>

      <MissionComplete tipId={tip.id} />

      <nav className="tip-nav" aria-label="Navegación entre consejos">
        <Link to={backTo}>Volver a la biblioteca</Link>
        {next && (
          <Link to={`/tip/${next.id}`} state={{ from: backTo }}>
            Siguiente consejo: {next.title}
          </Link>
        )}
      </nav>
    </>
  );
}

// Ícono de misión: decorativo, el texto «Acción para hoy» ya lo dice.
function MissionIcon() {
  return (
    <svg className="lesson-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

// Final de la microlección (DISEÑO_UI_UX §6): marcar como comprendida es opcional; guarda el
// progreso en el dispositivo y el personaje reacciona una sola vez, solo tras el clic.
function MissionComplete({ tipId }) {
  const { completed, markCompleted } = useProgress();
  const { settings } = useSettings();
  const dayPart = useDayPart(settings);
  const [justCompleted, setJustCompleted] = useState(false);
  const statusRef = useRef(null);
  const isCompleted = Boolean(completed[tipId]);

  const complete = () => {
    markCompleted(tipId);
    setJustCompleted(true);
  };

  // El botón desaparece al marcar: el foco pasa al mensaje para no perderse.
  useEffect(() => {
    if (justCompleted) statusRef.current?.focus();
  }, [justCompleted]);

  return (
    <section className="mission-complete" aria-labelledby="terminar-titulo">
      <h2 id="terminar-titulo">¿Terminaste la misión?</h2>
      {isCompleted ? (
        <div className="mission-complete__done">
          {justCompleted && <Avatar dayPart={dayPart} reaction="orgulloso" size="small" />}
          <p ref={statusRef} tabIndex={-1} className="mission-complete__status">
            {justCompleted
              ? '¡Misión completada! Ya cuenta en tu progreso.'
              : 'Ya marcaste esta misión como comprendida.'}
          </p>
        </div>
      ) : (
        <>
          <p>Si ya entendiste el concepto, márcalo. Si prefieres, simplemente continúa.</p>
          <Button onClick={complete}>Marcar como comprendida</Button>
        </>
      )}
    </section>
  );
}

function TipNotFound() {
  useDocumentTitle('Consejo no encontrado');
  return (
    <>
      <h1>Consejo no encontrado</h1>
      <Message variant="empty" title="Este consejo no existe o fue retirado.">
        <p>
          <Link to="/biblioteca" className="standalone-link">
            Ir a la biblioteca de consejos
          </Link>
        </p>
      </Message>
    </>
  );
}
