import { NavLink } from 'react-router';
import { FRAMEWORK_LABELS } from '../../services/catalog.js';

// Dos enlaces con aspecto de control segmentado. NavLink pone aria-current="page" en el activo.
export default function FrameworkSwitch() {
  return (
    <nav className="framework-switch" aria-label="Enfoque">
      <ul className="framework-switch__list">
        {Object.entries(FRAMEWORK_LABELS).map(([framework, label]) => (
          <li key={framework}>
            <NavLink to={`/biblioteca/${framework}`} className="framework-switch__link">
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
