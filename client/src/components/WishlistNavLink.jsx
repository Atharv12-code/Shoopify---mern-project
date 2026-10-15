import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchWishlistCount } from '../axiosCalls/wishlistApi.js'

function WishlistNavLink() {
  const [count, setCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    let active = true

    const loadCount = async () => {
      try {
        const nextCount = await fetchWishlistCount()
        if (active) setCount(nextCount)
      } catch {
        if (active) setCount(0)
      }
    }

    loadCount()
    window.addEventListener('wishlist-updated', loadCount)
    return () => {
      active = false
      window.removeEventListener('wishlist-updated', loadCount)
    }
  }, [location.pathname])

  return (
    <Link className="nav-link relative inline-flex items-center gap-1.5" to="/wishlist">
      <span>Wishlist</span>
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs tabular-nums font-bold rounded-full transition-all ${
        count > 0 
          ? 'bg-[#C2331F] text-[#0F1B3D]' 
          : 'bg-[#ECEFF6] text-[#56607A]'
      }`}>
        {count}
      </span>
    </Link>
  )
}

export default WishlistNavLink