import Button from '../../components/Button.jsx';

// selected === '' significa «Todas».
export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="category-filter" role="group" aria-label="Filtrar por categoría">
      <Button variant="secondary" aria-pressed={selected === ''} onClick={() => onChange('')}>
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant="secondary"
          aria-pressed={selected === category}
          onClick={() => onChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
