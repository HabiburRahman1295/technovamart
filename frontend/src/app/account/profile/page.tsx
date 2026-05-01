'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  User,
  MapPin,
  Package,
  Trash2,
  Plus,
  Edit2,
  Save,
  X,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'

type ProfileForm = { username: string; phone: string }
type AddressForm = { name: string; phone: string; city: string; area: string; address_line: string }

export default function ProfilePage() {
  const { isAuthenticated, user: storeUser, logout } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile')

  const profileForm = useForm<ProfileForm>({ defaultValues: { username: '', phone: '' } })
  const addressForm = useForm<AddressForm>({
    defaultValues: { name: '', phone: '', city: '', area: '', address_line: '' },
  })

  // ✅ Redirect ONLY in useEffect (prevents location/window issues in build)
  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, router])

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.profile().then((r) => r.data),
    enabled: isAuthenticated,
  })

  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => authApi.getAddresses().then((r) => r.data),
    enabled: isAuthenticated,
  })

  const addresses = useMemo(() => {
    return Array.isArray(addressData) ? addressData : addressData?.results || []
  }, [addressData])

  // ✅ keep form in sync
  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        username: profileData.username || '',
        phone: profileData.phone || '',
      })
    }
  }, [profileData, profileForm])

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      // (Optional) if you want to update storeUser, do it here based on profile response
    },
    onError: (err: any) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        'Failed to update profile'
      toast.error(detail)
    },
  })

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressForm) => authApi.createAddress(data),
    onSuccess: () => {
      toast.success('Address added successfully!')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowAddressForm(false)
      addressForm.reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to add address'),
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressForm }) => authApi.updateAddress(id, data),
    onSuccess: () => {
      toast.success('Address updated!')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setEditingAddress(null)
    },
    onError: () => toast.error('Failed to update address'),
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => authApi.deleteAddress(id),
    onSuccess: () => {
      toast.success('Address deleted!')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
    onError: () => toast.error('Failed to delete address'),
  })

  // ✅ Important: during redirect phase, render nothing
  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="bg-gray-200 h-8 w-48 rounded" />
        <div className="bg-gray-200 h-40 rounded-xl" />
      </div>
    )
  }

  const startEditAddress = (addr: any) => {
    setEditingAddress(addr.id)
    setShowAddressForm(false)
    addressForm.reset({
      name: addr.name || '',
      phone: addr.phone || '',
      city: addr.city || '',
      area: addr.area || '',
      address_line: addr.address_line || '',
    })
  }

  const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
  ] as const

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {(profileData?.username || profileData?.email || 'U')[0]?.toUpperCase?.() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profileData?.username || storeUser?.username || '—'}</h2>
                <p className="text-gray-500 text-sm">{profileData?.email || storeUser?.email || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Member since{' '}
                  {profileData?.date_joined
                    ? new Date(profileData.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            <form
              onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input value={profileData?.email || ''} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    {...profileForm.register('username', { required: 'Username is required' })}
                    className="input"
                    placeholder="Your username"
                  />
                  {profileForm.formState.errors.username && (
                    <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input {...profileForm.register('phone')} className="input" placeholder="01700000000" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary flex items-center gap-2 disabled:opacity-70"
                >
                  <Save size={16} />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>

                <Link href="/account/orders" className="btn-secondary flex items-center gap-2">
                  <Package size={16} /> My Orders
                </Link>
              </div>
            </form>
          </div>

          <div className="card p-4 border-red-100">
            <button
              onClick={() => {
                logout()
                router.replace('/')
              }}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              type="button"
            >
              <LogOut size={15} /> Logout from account
            </button>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-3">
          {addressLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="card p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : addresses.length === 0 && !showAddressForm ? (
            <div className="card p-8 text-center text-gray-400">
              <MapPin className="mx-auto mb-3" size={40} />
              <p className="font-medium">No saved addresses yet</p>
              <p className="text-sm mt-1">Add an address to speed up checkout</p>
            </div>
          ) : null}

          {addresses.map((addr: any) => (
            <div key={addr.id} className="card p-4">
              {editingAddress === addr.id ? (
                <form
                  onSubmit={addressForm.handleSubmit((d) => updateAddressMutation.mutate({ id: addr.id, data: d }))}
                  className="grid grid-cols-2 gap-3"
                >
                  <input {...addressForm.register('name', { required: true })} placeholder="Full Name *" className="input" />
                  <input {...addressForm.register('phone', { required: true })} placeholder="Phone *" className="input" />
                  <input {...addressForm.register('city', { required: true })} placeholder="City *" className="input" />
                  <input {...addressForm.register('area', { required: true })} placeholder="Area *" className="input" />
                  <textarea {...addressForm.register('address_line', { required: true })} placeholder="Full Address *" className="input col-span-2 resize-none h-20" />
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" disabled={updateAddressMutation.isPending} className="btn-primary flex items-center gap-2">
                      <Save size={15} /> {updateAddressMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingAddress(null)} className="btn-secondary flex items-center gap-2">
                      <X size={15} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">{addr.name}</p>
                      <span className="text-sm text-gray-500">· {addr.phone}</span>
                      {addr.is_default && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.address_line}</p>
                    <p className="text-sm text-gray-500">
                      {addr.area}, {addr.city}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-4">
                    <button
                      onClick={() => startEditAddress(addr)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                      type="button"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      disabled={deleteAddressMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddressForm ? (
            <div className="card p-4">
              <h3 className="font-semibold mb-3">New Address</h3>
              <form onSubmit={addressForm.handleSubmit((d) => createAddressMutation.mutate(d))} className="grid grid-cols-2 gap-3">
                <input {...addressForm.register('name', { required: true })} placeholder="Full Name *" className="input" />
                <input {...addressForm.register('phone', { required: true })} placeholder="Phone *" className="input" />
                <input {...addressForm.register('city', { required: true })} placeholder="City *" className="input" />
                <input {...addressForm.register('area', { required: true })} placeholder="Area *" className="input" />
                <textarea {...addressForm.register('address_line', { required: true })} placeholder="Full Address *" className="input col-span-2 resize-none h-20" />
                <div className="col-span-2 flex gap-2">
                  <button type="submit" disabled={createAddressMutation.isPending} className="btn-primary flex items-center gap-2">
                    <Save size={15} /> {createAddressMutation.isPending ? 'Saving...' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false)
                      addressForm.reset()
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAddressForm(true)
                setEditingAddress(null)
                addressForm.reset()
              }}
              className="w-full card p-4 border-dashed border-2 border-gray-300 hover:border-red-400 hover:text-red-600 transition text-gray-400 flex items-center justify-center gap-2"
              type="button"
            >
              <Plus size={18} /> Add New Address
            </button>
          )}
        </div>
      )}
    </div>
  )
}
