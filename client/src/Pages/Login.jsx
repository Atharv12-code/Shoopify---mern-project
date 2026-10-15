import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import StatusMessage from '../components/StatusMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loader, setLoader] = useState(false)
  const [err, setErr] = useState(location.state?.message || '')

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    setErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoader(true)
    try {
      const response = await axiosInstance.post('/customer/login', form)
      setUser(response.data.customer)
      setLoader(false)
      navigate('/home', { replace: true })
    } catch (error) {
      setLoader(false)
      if (error.response?.status === 404) {
        navigate('/signup', {
          state: { message: 'You are not registered yet. Please sign up first.' },
        })
        return
      }
      setErr(error.response?.data?.message || 'Unable to login. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#0F1B3D] flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background radial atmosphere */}

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Brand panel */}
        <div className="lg:col-span-5 auth-side">
          <div>
            <Link className="brand" to="/" aria-label="Shoopify home">
              <span className="brand-mark">N</span>
              <span>NexorShoopifya</span>
            </Link>
            <div className="mt-14">
              <h2>Welcome back</h2>
              <p>Log in to see your cart, wishlist and orders.</p>
            </div>
          </div>
          <ul>
            <li>Wishlist and cart saved to your account</li>
            <li>Every order in one place</li>
            <li>Secure payments with Razorpay</li>
          </ul>
        </div>

        {/* Right Form Card Panel */}
        <div className="lg:col-span-7 max-w-md w-full mx-auto">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden inline-flex items-center justify-center mb-4">
              <Link className="brand" to="/">
                <span className="brand-mark">N</span>
                <span>Shoopify</span>
              </Link>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#0F1B3D]">Log in to your account</h1>
            <p className="text-[#56607A] text-sm mt-2">
              Enter your registered email and password to resume shopping.
            </p>
          </div>

          <div className="auth-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <StatusMessage message={err} />

              <div>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="!mb-0">Password</label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loader}
                  className="button button-accent auth-submit w-full"
                >
                  {loader ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
            </form>

            <p className="auth-terms mt-6 text-center text-xs text-[#7C869C]">
              By logging in, you agree to Shoopify's{' '}
              <a href="#terms" className="text-[#56607A] hover:text-[#2340E6] underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#privacy" className="text-[#56607A] hover:text-[#2340E6] underline">Privacy Policy</a>.
            </p>
          </div>

          <p className="auth-switch text-center text-sm text-[#56607A] mt-6">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-[#2340E6] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
