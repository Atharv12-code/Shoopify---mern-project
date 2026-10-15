import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function CartNavLink() {
  const { cartCount } = useCart()

  return (
    <Link className="nav-link relative inline-flex items-center gap-1.5" to="/cart">
      <span>Cart</span>
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs tabular-nums font-bold rounded-full transition-all ${
        cartCount > 0 
          ? 'bg-[#2340E6] text-[#0F1B3D]' 
          : 'bg-[#ECEFF6] text-[#56607A]'
      }`}>
        {cartCount}
      </span>
    </Link>
  )
}

export default CartNavLink
