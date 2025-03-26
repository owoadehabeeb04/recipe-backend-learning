export const RecipeFilter = ({
  activeFilter,
  onFilterChange
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) => {
  const filters = ["all", "published", "drafts"];

  return (
    <div className="flex space-x-2 mb-8">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 text-sm rounded-full transition-all ${
            activeFilter === filter
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
};
