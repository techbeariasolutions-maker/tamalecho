// Fixtures del catálogo para pruebas. Datos ficticios: no son consejos reales.

export function makeTip(overrides = {}) {
  const { source, ...rest } = overrides;
  return {
    id: 'SCR-01',
    framework: 'scrum',
    category: 'Categoría A',
    title: 'Título de prueba SCR-01',
    summary: 'Resumen de prueba SCR-01.',
    knowledgeArea: 'Área de prueba',
    action: 'Acción de prueba.',
    explanation: 'Explicación de prueba.',
    commonMistake: 'Error de prueba.',
    example: 'Ejemplo de prueba.',
    source: {
      title: 'Fuente de prueba',
      authors: 'Autor, A.',
      edition: 'Primera edición',
      year: 2020,
      url: 'https://example.org/fuente',
      pages: '',
      ...source,
    },
    tags: ['prueba'],
    reviewedBy: '',
    reviewedAt: '',
    version: 1,
    ...rest,
  };
}

// count consejos por enfoque, con títulos y resúmenes únicos.
export function makeCatalog({ perFramework = 2, approved = false, catalogVersion = '0.9.0' } = {}) {
  const tips = [];
  for (const [framework, prefix] of [['scrum', 'SCR'], ['pmbok', 'PMI']]) {
    for (let n = 1; n <= perFramework; n += 1) {
      const id = `${prefix}-${String(n).padStart(2, '0')}`;
      tips.push(
        makeTip({
          id,
          framework,
          title: `Título de prueba ${id}`,
          summary: `Resumen de prueba ${id}.`,
          reviewedBy: approved ? 'Equipo de prueba' : '',
          reviewedAt: approved ? '2026-10-22' : '',
        }),
      );
    }
  }
  return { catalogVersion, updatedAt: '2026-10-22', tips };
}
