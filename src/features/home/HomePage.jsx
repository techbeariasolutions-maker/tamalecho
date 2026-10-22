import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

// Versión mínima. El consejo destacado y los accesos a cada enfoque llegan en el WP-6.
export default function HomePage() {
  useDocumentTitle();
  return (
    <>
      <h1>TamalEcho Tips</h1>
      <p>Consejos breves para aprender Scrum y PMI/PMBOK.</p>
    </>
  );
}
