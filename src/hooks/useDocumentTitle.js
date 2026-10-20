import { useEffect } from 'react';

const APP_NAME = 'TamalEcho Tips';

// Define el título de la pestaña. Sin argumento queda solo el nombre del producto.
export function useDocumentTitle(pageTitle) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
  }, [pageTitle]);
}
