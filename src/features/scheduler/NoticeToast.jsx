import { Link } from 'react-router';
import Button from '../../components/Button.jsx';
import Avatar from '../avatar/Avatar.jsx';

// Tarjeta del aviso (HU-06.1-A): personaje, título y resumen del consejo, «Ver consejo» y «Cerrar».
// Va dentro de la región role="status" de NoticeHost, que es la que se anuncia; la tarjeta no
// toma el foco. Los nombres accesibles amplían el texto visible sin contradecirlo (WCAG 2.5.3):
// «Ver consejo sobre Product Backlog» y «Cerrar aviso».
export default function NoticeToast({ notice, onClose }) {
  const { tip, dayPart } = notice;

  return (
    <div className="notice">
      <div className="notice__avatar">
        <Avatar dayPart={dayPart} size="small" />
      </div>
      <div className="notice__body">
        <p className="notice__eyebrow">Consejo de ahora</p>
        <p className="notice__title">{tip.title}</p>
        <p className="notice__summary">{tip.summary}</p>
        <div className="button-row">
          <Link
            to={`/tip/${tip.id}`}
            className="button button--primary"
            aria-label={`Ver consejo sobre ${tip.title}`}
            onClick={onClose}
          >
            Ver consejo
          </Link>
          <Button variant="secondary" aria-label="Cerrar aviso" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
