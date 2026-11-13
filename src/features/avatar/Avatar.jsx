import avatarCatalog from '../../data/avatarStates.json';

// Estado de respaldo si llega una franja desconocida: el personaje nunca desaparece.
const FALLBACK_DAY_PART = 'despierto';

// Bocas de cada expresión. Solo se ve la que coincide con data-expression de la figura;
// el cambio entre ellas es un fundido de opacidad definido en global.css.
const MOUTHS = [
  { expression: 'sonriente', element: <path className="avatar__line" d="M51 70 Q60 78 69 70" /> },
  { expression: 'antojado', element: <ellipse className="avatar__fill" cx="60" cy="72" rx="5.5" ry="6.5" /> },
  { expression: 'concentrado', element: <path className="avatar__line" d="M53 72 Q60 70 67 72" /> },
  { expression: 'somnoliento', element: <ellipse className="avatar__fill" cx="60" cy="73" rx="3.5" ry="4.5" /> },
  {
    expression: 'orgulloso',
    element: <path className="avatar__fill avatar__mouth-open" d="M49 68 Q60 84 71 68 Z" />,
  },
];

// Pose de brazos y objeto que acompaña cada expresión (DISEÑO_UI_UX §9): saluda, piensa,
// se frota las manos, se duerme o levanta una estrella. Igual que las bocas, todas existen
// en el SVG y solo se ve la del estado; así cambiar de estado no vuelve a crear nodos.
const POSES = [
  {
    expression: 'sonriente',
    element: (
      <>
        <path className="avatar__limb" d="M34 64 Q26 70 25 78" />
        <path className="avatar__limb" d="M86 62 Q97 54 96 41" />
        <circle className="avatar__hand" cx="96" cy="39" r="4" />
      </>
    ),
  },
  {
    expression: 'antojado',
    element: (
      <>
        <path className="avatar__limb" d="M34 66 Q42 78 54 80" />
        <path className="avatar__limb" d="M86 66 Q78 78 66 80" />
        {/* Burbuja con un elote. */}
        <circle className="avatar__bubble" cx="96" cy="26" r="12" />
        <ellipse className="avatar__hand" cx="96" cy="26" rx="4.5" ry="8" />
        <path className="avatar__husk" d="M96 34 Q88 32 89 24 Q93 30 96 34 Z" />
      </>
    ),
  },
  {
    expression: 'concentrado',
    element: (
      <>
        <path className="avatar__limb" d="M34 64 Q26 70 25 78" />
        <path className="avatar__limb" d="M86 66 Q82 76 72 79" />
        <circle className="avatar__hand" cx="71" cy="79" r="4" />
      </>
    ),
  },
  {
    expression: 'somnoliento',
    element: (
      <>
        <path className="avatar__limb" d="M34 66 Q29 76 31 84" />
        <path className="avatar__limb" d="M86 66 Q91 76 89 84" />
        <path className="avatar__line" d="M90 18 H100 L90 30 H100" />
        <path className="avatar__line" d="M103 8 H109 L103 16 H109" />
      </>
    ),
  },
  {
    expression: 'orgulloso',
    element: (
      <>
        <path className="avatar__limb" d="M34 64 Q26 70 25 78" />
        <path className="avatar__limb" d="M86 60 Q96 48 98 36" />
        <path
          className="avatar__star"
          d="M99 14 L102.5 22 L111 22.5 L104.5 28 L106.5 36.5 L99 32 L91.5 36.5 L93.5 28 L87 22.5 L95.5 22 Z"
        />
      </>
    ),
  },
];

// Personaje según la franja del día (HT-05.1-B, HU-05.1-A; rediseño D-24).
// - `dayPart`: 'despierto' | 'hambre' | 'atento' | 'cansado' (lo calcula getDayPart en schedule.js).
// - `reaction`: 'orgulloso' al completar una misión. Tiene prioridad sobre la franja del día.
// - `isStatic`: versión estática de respaldo, sin ningún movimiento. El texto no cambia.
// - `size`: 'normal' (portada), 'hero' (héroe de la portada) o 'small' (dentro del aviso, HU-06.1-A).
//
// Todas las expresiones viven en el mismo SVG: cejas y ojos son los mismos elementos y cambian
// con CSS según data-expression; bocas y poses se funden. No hay JavaScript de animación.
// Con prefers-reduced-motion la duración vale 0 ms y no hay entrada ni parpadeo (HT-05.2-A).
//
// El SVG es una imagen con nombre propio (role="img" + aria-label con el estado) y la frase va
// como texto visible en el figcaption, fuera del SVG, para que se lea y se pueda ampliar.
export default function Avatar({ dayPart, reaction, isStatic = false, size = 'normal' }) {
  const reactionState = reaction ? avatarCatalog.reactions?.[reaction] : null;
  const key = Object.hasOwn(avatarCatalog.states, dayPart) ? dayPart : FALLBACK_DAY_PART;
  const state = reactionState ?? avatarCatalog.states[key];
  const className = [
    'avatar',
    isStatic && 'avatar--static',
    size === 'small' && 'avatar--small',
    size === 'hero' && 'avatar--hero',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure
      className={className}
      data-day-part={key}
      data-reaction={reactionState ? reaction : undefined}
      data-expression={state.expression}
      data-animation={isStatic ? 'ninguna' : state.animation}
      style={{ '--avatar-bg': `var(${state.colorToken})` }}
    >
      <svg className="avatar__image" viewBox="0 0 120 120" role="img" aria-label={state.alt} focusable="false">
        <circle className="avatar__bg" cx="60" cy="60" r="56" />
        <g className="avatar__figure">
          {/* Piernas cortas. */}
          <path className="avatar__limb" d="M50 96 L48 110" />
          <path className="avatar__limb" d="M70 96 L72 110" />
          <ellipse className="avatar__hand" cx="45" cy="111" rx="5" ry="3" />
          <ellipse className="avatar__hand" cx="75" cy="111" rx="5" ry="3" />
          {/* Hoja de maíz detrás del cuerpo, con su punta arriba. */}
          <path className="avatar__husk" d="M60 6 C90 22 98 76 60 104 C22 76 30 22 60 6 Z" />
          {/* Cuerpo vertical de tamal con esquinas redondeadas y dos pliegues. */}
          <path
            className="avatar__body"
            d="M60 20 C80 20 86 38 86 60 C86 84 76 98 60 98 C44 98 34 84 34 60 C34 38 40 20 60 20 Z"
          />
          <path className="avatar__fold" d="M42 34 Q60 42 78 34" />
          <path className="avatar__fold" d="M40 86 Q60 94 80 86" />
          {POSES.map(({ expression, element }) => (
            <g key={expression} className="avatar__pose" data-pose={expression}>
              {element}
            </g>
          ))}
          <g className="avatar__face">
            <ellipse className="avatar__cheek" cx="44" cy="66" rx="5" ry="3" />
            <ellipse className="avatar__cheek" cx="76" cy="66" rx="5" ry="3" />
            <path className="avatar__line avatar__brow avatar__brow--left" d="M43 46 Q49 42 55 46" />
            <path className="avatar__line avatar__brow avatar__brow--right" d="M65 46 Q71 42 77 46" />
            <circle className="avatar__fill avatar__eye avatar__eye--open" cx="49" cy="56" r="5" />
            <circle className="avatar__fill avatar__eye avatar__eye--open" cx="71" cy="56" r="5" />
            <path className="avatar__line avatar__eye avatar__eye--closed" d="M44 56 Q49 60 54 56" />
            <path className="avatar__line avatar__eye avatar__eye--closed" d="M66 56 Q71 60 76 56" />
            {MOUTHS.map(({ expression, element }) => (
              <g key={expression} className="avatar__mouth" data-mouth={expression}>
                {element}
              </g>
            ))}
          </g>
        </g>
      </svg>
      <figcaption className="avatar__phrase">{state.phrase}</figcaption>
    </figure>
  );
}
