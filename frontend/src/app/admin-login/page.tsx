'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { LayoutDashboard, Lock, Mail, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type FormData = { email: string; password: string }

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // include cookies so Django session is set
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (res.ok && json.redirect) {
        // Django session is now set — go straight to admin
        window.location.href = 'http://localhost:8000/admin/'
      } else {
        setError(json.error || 'Login failed. Please try again.')
      }
    } catch {
      setError('Could not connect to the server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-red-100 text-sm mt-1">TechNova Mart Dashboard</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="admin@technovamart.com"
                    className="input pl-9"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    placeholder="••••••••"
                    className="input pl-9"
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base disabled:opacity-70"
              >
                <LayoutDashboard size={18} />
                {loading ? 'Signing in...' : 'Go to Admin Panel'}
              </button>
            </form>

            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <strong>Note:</strong> Only users with staff/superuser access can log in here.
              Create one via: <code className="bg-amber-100 px-1 rounded">python manage.py createsuperuser</code>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          ← <a href="/" className="hover:text-gray-600 transition">Back to website</a>
        </p>
      </div>
    </div>
  )
}
