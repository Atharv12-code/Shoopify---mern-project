import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { fetchProducts } from '../axiosCalls/productApi.js'
import { fetchWishlist } from '../axiosCalls/wishlistApi.js'
import WishlistNavLink from '../components/WishlistNavLink.jsx'
import CartNavLink from '../components/CartNavLink.jsx'

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [sort, setSort] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wishlistIds, setWishlistIds] = useState(() => new Set())

  useEffect(() => {
    let active = true
    fetchWishlist()
      .then(({ wishlist = [] }) => {
        if (active) setWishlistIds(new Set(wishlist.map((product) => product._id)))
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handleWishlistChange = (productId, saved) => {
    setWishlistIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (saved) nextIds.add(productId)
      else nextIds.delete(productId)
      return nextIds
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchProducts({ search: debouncedSearch, category, sort })
      setProducts(response.products || [])
    } catch {
      setError('Something went wrong while loading products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [debouncedSearch, category, sort])

  const resetFilters = () => {
    setSearch('')
    setCategory('All Categories')
    setSort('')
  }

  return (
    <main className="catalog-page min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Catalog navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link !text-[#2340E6]" to="/products">Catalogue</Link>
          <WishlistNavLink />
          <CartNavLink />
          <Link className="nav-link" to="/orders">Orders</Link>
          <Link className="nav-link" to="/profile">Account</Link>
        </div>
      </nav>

      {/* Main Catalogue Section */}
      <section className="catalog-content">
        <div className="home-heading flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1>
              All products
            </h1>
            <p className="text-[#56607A] text-base max-w-xl">
              Electronics, fashion, books, home and more, with live stock and clear prices.
            </p>
          </div>

          {!loading && !error && (
            <div className="tabular-nums text-xs text-[#56607A] bg-white border border-[#DDE1EA] px-4 py-2.5 rounded-xl self-start md:self-auto">
              <strong className="text-[#2340E6]">{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
            </div>
          )}
        </div>

        {/* Command Search and Filter Bar */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          onReset={resetFilters}
        />

        {/* Loading Skeletons */}
        {loading && (
          <div className="catalog-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="catalog-product-card p-4 animate-pulse">
                <div className="h-56 bg-[#E3E8F2] rounded-xl mb-4" />
                <div className="h-4 bg-[#E3E8F2] rounded w-1/3 mb-2" />
                <div className="h-6 bg-[#E3E8F2] rounded w-3/4 mb-3" />
                <div className="h-10 bg-[#E3E8F2] rounded mb-4" />
                <div className="h-10 bg-[#E3E8F2] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="catalog-state catalog-error">
            <span className="text-base font-bold">! {error}</span>
            <button type="button" className="catalog-retry mt-2" onClick={loadProducts}>
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="catalog-state">
            <span className="text-4xl text-[#56607A] mb-1">⌕</span>
            <span className="text-[#0F1B3D] font-display text-xl font-bold">No products match your criteria.</span>
            <p className="text-xs text-[#56607A]">Try adjusting your search query or removing category filters.</p>
            <button type="button" className="catalog-reset mt-2" onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Products