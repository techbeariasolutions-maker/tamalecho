import { Link, NavLink } from 'react-router';
import { FRAMEWORK_LABELS } from '../../services/catalog.js';

// Dos enlaces con aspecto de control segmentado.
// En la biblioteca, NavLink pone aria-current="page" en el activo. Fuera de ella (la ficha),
// `current` indica el enfoque del contenido y se marca con aria-current="true".
export default function FrameworkSwitch({ current }) {
  return (
    <nav className="framework-switch" aria-label="Enfoque">
      <ul className="framework-switch__list">
        {Object.entries(FRAMEWORK_LABELS).map(([framework, label]) => (
          <li key={framework}>
            {current ? (
              <Link
                to={`/biblioteca/${framework}`}
                className="framework-switch__link"
                aria-current={framework === current ? 'true' : undefined}
              >
                {label}
              </Link>
            ) : (
              <NavLink to={`/biblioteca/${framework}`} className="framework-switch__link">
                {label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
