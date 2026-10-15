const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home', 'Beauty', 'Grocery']

function SearchBar({ search, setSearch, category, setCategory, sort, setSort, onReset }) {
  const hasActiveFilters = search.trim() || category !== 'All Categories' || sort

  return (
    <div className="catalog-controls">
      <label className="catalog-search">
        <span aria-hidden="true" className="text-[#2340E6] text-base font-bold">⌕</span>
        <input 
          value={search} 
          onChange={(event) => setSearch(event.target.value)} 
          placeholder="Search products by name or keywords..." 
          aria-label="Search products" 
        />
        {search && (
          <button 
            type="button" 
            className="catalog-clear text-[#56607A] hover:text-[#2340E6] transition-colors" 
            onClick={() => setSearch('')} 
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </label>

      <label className="catalog-select">
        <span>Category</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item} className="bg-white text-[#0F1B3D]">
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="catalog-select">
        <span>Sort By</span>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="" className="bg-white text-[#0F1B3D]">Featured</option>
          <option value="price_asc" className="bg-white text-[#0F1B3D]">Price: Low to High</option>
          <option value="price_desc" className="bg-white text-[#0F1B3D]">Price: High to Low</option>
        </select>
      </label>

      {hasActiveFilters && (
        <button 
          type="button" 
          className="catalog-reset flex items-center gap-1.5" 
          onClick={onReset}
        >
          <span className="text-[#C2331F]">✕</span> Reset filters
        </button>
      )}
    </div>
  )
}

export default SearchBar