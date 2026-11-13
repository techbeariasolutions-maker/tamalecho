// Textos de Ayuda y limitaciones (HU-13.1-A, HU-13.1-B). Único punto de lectura de help.json:
// las páginas no importan el JSON directamente, igual que con el catálogo (CLAUDE.md §6).
// `approved` lo cambia el Product Owner al aprobar el texto; mientras sea false, la página
// muestra la marca de borrador.
import helpData from '../data/help.json' with { type: 'json' };

// Crea las consultas sobre unos datos de ayuda. Las pruebas la usan con datos propios.
export function createHelp(data) {
  function getHelpItems() {
    return data.help.items;
  }

  function getLimitations() {
    return data.limitations.items;
  }

  // Es borrador si cualquiera de los dos textos de la página no está aprobado.
  function isHelpDraft() {
    return data.help.approved !== true || data.limitations.approved !== true;
  }

  return { getHelpItems, getLimitations, isHelpDraft };
}

export const { getHelpItems, getLimitations, isHelpDraft } = createHelp(helpData);
