'use client'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await authApi.register(data)
      setUser(res.data.user, res.data.access, res.data.refresh)
      toast.success('Account created successfully!')
      router.push('/')
    } catch (err: any) {
      const errs = err.response?.data
      if (errs) {
        Object.values(errs).flat().forEach((e: any) => toast.error(e))
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="bg-red-600 text-white font-bold text-2xl px-4 py-2 rounded-xl inline-block mb-3">TN</div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join TechNova Mart today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Username</label>
                <input {...register('username', { required: 'Username is required' })} className="input" placeholder="username123" />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input {...register('email', { required: 'Email is required' })} type="email" className="input" placeholder="your@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <input {...register('phone')} className="input" placeholder="01700000000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} type="password" className="input" placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <input {...register('password2', {
                  required: 'Please confirm password',
                  validate: (v) => v === watch('password') || 'Passwords do not match'
                })} type="password" className="input" placeholder="••••••••" />
                {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2.message as string}</p>}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-70">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-red-600 font-medium hover:text-red-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
