import avatarCatalog from '../../data/avatarStates.json';

// Estado de respaldo si llega una franja desconocida: el personaje nunca desaparece.
const FALLBACK_DAY_PART = 'despierto';

// Bocas de cada expresión. Solo se ve la que coincide con data-expression de la figura;
// el cambio entre ellas es un fundido de opacidad definido en global.css.
const MOUTHS = [
  { expression: 'sonriente', element: <path className="avatar__line" d="M50 71 Q60 80 70 71" /> },
  { expression: 'antojado', element: <ellipse className="avatar__fill" cx="60" cy="74" rx="6" ry="7" /> },
  { expression: 'concentrado', element: <path className="avatar__line" d="M52 74 L68 74" /> },
  { expression: 'somnoliento', element: <ellipse className="avatar__fill" cx="60" cy="75" rx="3.5" ry="4.5" /> },
];

// Personaje según la franja del día (HT-05.1-B, HU-05.1-A).
// - `dayPart`: 'despierto' | 'hambre' | 'atento' | 'cansado' (lo calcula getDayPart en schedule.js).
// - `isStatic`: versión estática de respaldo, sin ningún movimiento. El texto no cambia.
//
// Las 4 expresiones viven en el mismo SVG: las cejas y los ojos son los mismos elementos y
// cambian de posición, giro o escala con CSS según data-expression; las bocas se funden.
// No hay JavaScript de animación: React solo cambia el atributo y CSS hace la transición.
// Con prefers-reduced-motion la duración vale 0 ms y el cambio es inmediato (HT-05.2-A).
//
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
      data-expression={state.expression}
      data-animation={isStatic ? 'ninguna' : state.animation}
      style={{ '--avatar-bg': `var(${state.colorToken})` }}
    >
      <svg className="avatar__image" viewBox="0 0 120 120" role="img" aria-label={state.alt} focusable="false">
        <circle className="avatar__bg" cx="60" cy="60" r="56" />
        <path className="avatar__husk" d="M60 8 C90 30 94 82 60 112 C26 82 30 30 60 8 Z" />
        <path className="avatar__body" d="M60 24 C84 40 86 80 60 100 C34 80 36 40 60 24 Z" />
        <g className="avatar__face">
          <path className="avatar__line avatar__brow avatar__brow--left" d="M44 50 Q50 46 56 50" />
          <path className="avatar__line avatar__brow avatar__brow--right" d="M64 50 Q70 46 76 50" />
          <circle className="avatar__fill avatar__eye avatar__eye--open" cx="50" cy="58" r="3.5" />
          <circle className="avatar__fill avatar__eye avatar__eye--open" cx="70" cy="58" r="3.5" />
          <path className="avatar__line avatar__eye avatar__eye--closed" d="M45 58 Q50 62 55 58" />
          <path className="avatar__line avatar__eye avatar__eye--closed" d="M65 58 Q70 62 75 58" />
          {MOUTHS.map(({ expression, element }) => (
            <g key={expression} className="avatar__mouth" data-mouth={expression}>
              {element}
            </g>
          ))}
        </g>
      </svg>
      <figcaption className="avatar__phrase">{state.phrase}</figcaption>
    </figure>
  );
}
