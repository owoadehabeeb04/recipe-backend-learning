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
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
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
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </button>
    ))}
  </div>
);
