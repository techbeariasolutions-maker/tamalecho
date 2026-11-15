import CategoryFilter from './CategoryFilter.jsx';

// Selector único de conceptos (HU-09.2-A): búsqueda por texto y tema en un solo componente
// reutilizable. El enfoque lo da la página (FrameworkSwitch y la URL /biblioteca/:enfoque).
// No guarda estado: la página decide dónde viven los valores (en la biblioteca, en la URL).
// - `label`: enfoque actual, para nombrar el campo («Buscar en Scrum»).
// - `onQueryChange` / `onCategoryChange`: reciben el valor nuevo.
export default function ConceptFilter({ label, query, categories, selected, onQueryChange, onCategoryChange }) {
  return (
    <div className="concept-filter">
      <div className="library-search" role="search">
        <label htmlFor="buscar-conceptos" className="library-search__label">
          Buscar en {label}
        </label>
        <input
          id="buscar-conceptos"
          type="search"
          className="library-search__input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Por ejemplo: riesgo, backlog, alcance"
          autoComplete="off"
        />
      </div>
      <CategoryFilter categories={categories} selected={selected} onChange={onCategoryChange} />
    </div>
  );
}
