export const CategoryFilter = ({
  categories,
  selectedCategory,
  onChange
}: {
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
    <button
      onClick={() => onChange("all")}
      className={`px-3 py-1.5 text-sm rounded-full transition-all ${
        selectedCategory === "all"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      All
    </button>

    {categories.map((category) => (
      <button
        key={category}
        onClick={() => onChange(category)}
        className={`px-3 py-1.5 text-sm rounded-full transition-all ${
          selectedCategory === category
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </button>
    ))}
  </div>
);
