// loading y empty informan sin interrumpir (status); error interrumpe (alert).
const ROLES = { loading: 'status', empty: 'status', error: 'alert' };

export default function Message({ variant = 'empty', title, children }) {
  const role = ROLES[variant] ?? 'status';
  return (
    <div className={`message message--${variant}`} role={role}>
      {title && <p className="message__title">{title}</p>}
      {children}
    </div>
  );
}
