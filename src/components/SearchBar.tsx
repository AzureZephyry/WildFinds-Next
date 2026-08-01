interface SearchBarProps {
  value: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ value, onSearchChange }: SearchBarProps) {
  return (
    <div className="search-box">
      <label htmlFor="searchInput" className="search-label">
        Search items
      </label>
      <div className="search-input-group">
        <input
          id="searchInput"
          type="search"
          placeholder="Search your item..."
          aria-label="Search lost and found items"
          value={value}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button type="button" onClick={() => onSearchChange(value)}>
          Search
        </button>
      </div>
    </div>
  );
}
