import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import StatusMessage from '../components/StatusMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import WishlistNavLink from '../components/WishlistNavLink.jsx'
import CartNavLink from '../components/CartNavLink.jsx'

const emptyAddress = { street: '', city: '', state: '', postalCode: '', country: '' }

function CustomerProfile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', ...emptyAddress })
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get('/customer/me')
        if (!mounted) return
        const customer = response.data.authenticatedCustomer
        setUser(customer)
        setForm({
          fullName: customer.fullName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          ...emptyAddress,
          ...(customer.shippingAddress || {}),
        })
      } catch (requestError) {
        if (mounted) setError(requestError.response?.data?.message || 'Unable to load your profile.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [setUser])

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
    setMessage('')
    setError('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedImage(file)
    setPreviewImage(URL.createObjectURL(file))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await axiosInstance.put('/customer/profile', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      })
      let updatedCustomer = response.data.customer

      if (selectedImage) {
        setUploading(true)
        const imageData = new FormData()
        imageData.append('profileImage', selectedImage)
        const imageResponse = await axiosInstance.post('/customer/profile/image', imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        updatedCustomer = imageResponse.data.customer
      }

      setUser(updatedCustomer)
      setSelectedImage(null)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center tabular-nums text-[#56607A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2340E6] border-t-transparent rounded-full animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="profile-page min-h-screen bg-[#F4F5F9] text-[#0F1B3D]">
      {/* Navigation */}
      <nav className="site-nav" aria-label="Account navigation">
        <Link className="brand" to="/home" aria-label="Back to Shoopify home">
          <span className="brand-mark">N</span>
          <span>Shoopify</span>
        </Link>
        <div className="nav-actions">
          <WishlistNavLink />
          <CartNavLink />
          <Link className="nav-link" to="/orders">Orders</Link>
          <Link className="nav-link" to="/home">← Back to Shopping</Link>
        </div>
      </nav>

      {/* Main Profile Content */}
      <section className="profile-content max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="home-heading mb-6">
          <h1>
            Your profile
          </h1>
          <p className="text-[#56607A] text-base">
            Keep your contact details and default delivery address up to date so checkout is quick.
          </p>
        </div>

        <StatusMessage message={error} />
        {message && (
          <div className="profile-success flex items-center gap-2 tabular-nums text-xs mb-6" role="status">
            <span>✓</span> {message}
          </div>
        )}

        <form className="profile-layout" onSubmit={handleSubmit}>
          {/* Left Column: Identity & Avatar Card */}
          <section className="profile-card profile-identity flex flex-col items-center text-center">
            <div className="card-label w-full flex items-center justify-between pb-4 border-b border-[#DDE1EA]">
              <span>Photo</span>
            </div>

            <div className="profile-avatar-large relative my-6">
              {previewImage || user?.profileImage ? (
                <img src={previewImage || user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)?.toUpperCase() || 'N'
              )}
            </div>

            <label className="image-picker">
              <span>Upload New Photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {selectedImage && (
              <p className="file-note mt-2 text-xs text-[#2340E6] tabular-nums">
                Selected: {selectedImage.name}
              </p>
            )}

            <p className="profile-email mt-6 text-xs tabular-nums text-[#56607A]">
              {user?.email}
            </p>
          </section>

          {/* Right Column: Personal & Address Form Card */}
          <section className="profile-card profile-form-card">
            <div className="card-label flex items-center justify-between pb-4 border-b border-[#DDE1EA]">
              <span>Personal details</span>
            </div>

            <div className="profile-fields">
              <label>
                Full Name
                <input name="fullName" value={form.fullName} onChange={handleChange} required />
              </label>

              <label>
                Email Address
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>

              <label className="field-wide">
                Phone Number
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
              </label>
            </div>

            <div className="card-label address-label flex items-center justify-between pt-6 mt-8 border-t border-[#DDE1EA]">
              <span>Default delivery address</span>
            </div>

            <div className="profile-fields address-fields">
              <label className="field-wide">
                Street Address / Apartment
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Apartment, building and street address"
                />
              </label>

              <label>
                City
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              </label>

              <label>
                State
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
              </label>

              <label>
                Postal Code
                <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="PIN Code" />
              </label>

              <label>
                Country
                <input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
              </label>
            </div>

            <button className="button button-accent profile-save !py-4 !text-base font-bold mt-8" type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {uploading ? 'Uploading Photo...' : 'Saving Changes...'}
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </section>
        </form>
      </section>
    </main>
  )
}

export default CustomerProfile