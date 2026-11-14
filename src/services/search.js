// Búsqueda de conceptos (rediseño D-24 etapa 3; equivale a HU-09.1-A). Función pura sobre una
// lista de consejos: no lee el catálogo por su cuenta (eso lo hace catalog.js).

// Texto comparable: sin acentos, en minúsculas y con espacios simples.
// «Planificación» y «planificacion» coinciden; la ñ se conserva para no confundir «año» con «ano».
export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/(?!̃)[̀-ͯ]/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('es-MX')
    .replace(/\s+/g, ' ')
    .trim();
}

// Campos donde se busca, en orden de importancia.
const FIELDS = ['title', 'summary', 'category', 'knowledgeArea'];

// Devuelve los consejos que contienen TODAS las palabras de la búsqueda en su título, resumen,
// categoría, área o etiquetas. Una búsqueda vacía devuelve la lista tal cual.
// Los que coinciden en el título van primero; el resto conserva el orden del catálogo.
export function searchTips(tips, query) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return tips;
  const matches = tips.filter((tip) => {
    const haystack = normalize([...FIELDS.map((field) => tip[field]), ...(tip.tags ?? [])].join(' '));
    return words.every((word) => haystack.includes(word));
  });
  const inTitle = (tip) => words.every((word) => normalize(tip.title).includes(word));
  return [...matches.filter(inTitle), ...matches.filter((tip) => !inTitle(tip))];
}
