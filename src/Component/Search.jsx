import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  const suggestions = data.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
  }));

  const filteredSuggestions = query.trim() === ""
    ? []
    : suggestions.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item) => {
    setQuery("");
    setFocused(false);
    if (item.category === "Combo") {
      navigate(`/combos/${item.id}`);
    } else {
      navigate(`/shop/${item.id}`);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <input
        type="search"
        placeholder="Search dry fruits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        className="w-full px-4 py-2 pr-10 text-gray-700 border border-gray-300 rounded focus:outline-0"
      />
      <CiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl cursor-pointer" />

      {focused && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 bg-white border border-green-300 rounded shadow max-h-60 overflow-y-auto w-full">
          {filteredSuggestions.slice(0, 8).map((item) => (
            <li
              key={item.id}
              className="px-4 py-2 text-sm hover:bg-green-500 hover:text-white cursor-pointer transition-all"
              onMouseDown={() => handleSelect(item)}
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-gray-400 ml-2">({item.category})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
