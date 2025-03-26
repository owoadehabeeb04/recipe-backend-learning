export const SortOptions = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-400">Sort by:</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm py-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500"
    >
      <option value="newest">Newest</option>
      <option value="rating">Highest Rated</option>
      <option value="time">Cooking Time</option>
      <option value="az">A-Z</option>
    </select>
  </div>
);
