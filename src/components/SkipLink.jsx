export default function SkipLink({ targetId = 'contenido' }) {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      Saltar al contenido
    </a>
  );
}
