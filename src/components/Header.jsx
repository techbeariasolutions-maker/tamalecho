import { Link } from 'react-router';
import NavMenu from './NavMenu.jsx';

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          TamalEcho Tips
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
