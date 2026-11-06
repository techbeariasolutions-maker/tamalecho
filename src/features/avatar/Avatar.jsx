import avatarCatalog from '../../data/avatarStates.json';

// Estado de respaldo si llega una franja desconocida: el personaje nunca desaparece.
const FALLBACK_DAY_PART = 'despierto';

// Rasgos de cada expresión dentro del viewBox de 120 × 120. Los trazos usan la clase
// avatar__line (solo contorno) y los rellenos avatar__fill; los colores salen de tokens.css.
function Face({ expression }) {
  switch (expression) {
    case 'antojado':
      return (
        <g className="avatar__face" data-expression="antojado">
          <path className="avatar__line" d="M44 48 Q50 43 56 47" />
          <path className="avatar__line" d="M64 47 Q70 43 76 48" />
          <circle className="avatar__fill" cx="50" cy="57" r="3.5" />
          <circle className="avatar__fill" cx="70" cy="57" r="3.5" />
          <ellipse className="avatar__fill" cx="60" cy="74" rx="6" ry="7" />
        </g>
      );
    case 'concentrado':
      return (
        <g className="avatar__face" data-expression="concentrado">
          <path className="avatar__line" d="M44 50 L56 52" />
          <path className="avatar__line" d="M64 52 L76 50" />
          <circle className="avatar__fill" cx="50" cy="58" r="3" />
          <circle className="avatar__fill" cx="70" cy="58" r="3" />
          <path className="avatar__line" d="M52 74 L68 74" />
        </g>
      );
    case 'somnoliento':
      return (
        <g className="avatar__face" data-expression="somnoliento">
          <path className="avatar__line" d="M44 51 Q50 50 56 53" />
          <path className="avatar__line" d="M64 53 Q70 50 76 51" />
          <path className="avatar__line" d="M45 58 Q50 62 55 58" />
          <path className="avatar__line" d="M65 58 Q70 62 75 58" />
          <ellipse className="avatar__fill" cx="60" cy="75" rx="3.5" ry="4.5" />
        </g>
      );
    case 'sonriente':
    default:
      return (
        <g className="avatar__face" data-expression="sonriente">
          <path className="avatar__line" d="M44 50 Q50 46 56 50" />
          <path className="avatar__line" d="M64 50 Q70 46 76 50" />
          <circle className="avatar__fill" cx="50" cy="58" r="3.5" />
          <circle className="avatar__fill" cx="70" cy="58" r="3.5" />
          <path className="avatar__line" d="M50 71 Q60 80 70 71" />
        </g>
      );
  }
}

// Personaje según la franja del día (HT-05.1-B).
// - `dayPart`: 'despierto' | 'hambre' | 'atento' | 'cansado' (lo calcula getDayPart en schedule.js).
// - `isStatic`: versión estática de respaldo, sin ningún movimiento. El texto no cambia.
// El SVG es una imagen con nombre propio (role="img" + aria-label con el estado) y la frase va
// como texto visible en el figcaption, fuera del SVG, para que se lea y se pueda ampliar.
export default function Avatar({ dayPart, isStatic = false }) {
  const key = Object.hasOwn(avatarCatalog.states, dayPart) ? dayPart : FALLBACK_DAY_PART;
  const state = avatarCatalog.states[key];
  const className = isStatic ? 'avatar avatar--static' : 'avatar';

  return (
    <figure
      className={className}
      data-day-part={key}
      data-animation={isStatic ? 'ninguna' : state.animation}
      style={{ '--avatar-bg': `var(${state.colorToken})` }}
    >
      <svg className="avatar__image" viewBox="0 0 120 120" role="img" aria-label={state.alt} focusable="false">
        <circle className="avatar__bg" cx="60" cy="60" r="56" />
        <path className="avatar__husk" d="M60 8 C90 30 94 82 60 112 C26 82 30 30 60 8 Z" />
        <path className="avatar__body" d="M60 24 C84 40 86 80 60 100 C34 80 36 40 60 24 Z" />
        <Face expression={state.expression} />
      </svg>
      <figcaption className="avatar__phrase">{state.phrase}</figcaption>
    </figure>
  );
}
