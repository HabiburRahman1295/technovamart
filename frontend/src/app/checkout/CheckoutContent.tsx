'use client'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { orderApi, paymentApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { MapPin, CreditCard, CheckCircle } from 'lucide-react'

type AddressForm = {
  customer_name: string
  customer_phone: string
  city: string
  area: string
  thana: string
  district: string
  address_line: string
}

export default function CheckoutContent() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const [selectedPayment, setSelectedPayment] = useState('bkash')
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>()

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) return null

  const orderMutation = useMutation({
    mutationFn: (data: any) => orderApi.create(data),
    onSuccess: async (orderRes) => {
      const order = orderRes.data
      try {
        const payRes = await paymentApi.init({ order_id: order.id, provider: selectedPayment })
        if (selectedPayment === 'bkash' && payRes.data.bkash_url) {
          window.location.href = payRes.data.bkash_url
        } else {
          clearCart()
          router.push(`/payment/success?order=${order.id}`)
        }
      } catch {
        router.push(`/payment/success?order=${order.id}`)
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to place order')
    },
  })

  const subtotal = totalPrice()
  const shipping = 60
  const total = subtotal + shipping

  const onSubmit = (formData: AddressForm) => {
    orderMutation.mutate({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      address_line: formData.address_line,
      area: formData.area,
      thana: formData.thana,
      city: formData.city,
      district: formData.district,
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
    })
  }

  const PAYMENT_METHODS = [
    { id: 'bkash', label: 'bKash', emoji: '🔴', desc: 'Pay with bKash' },
    { id: 'nagad', label: 'Nagad', emoji: '🟠', desc: 'Pay with Nagad' },
    { id: 'card', label: 'Card', emoji: '💳', desc: 'Debit / Credit Card' },
    { id: 'cod', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay on delivery' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <MapPin className="text-red-600" size={20} /> Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input {...register('customer_name', { required: 'Name is required' })} placeholder="Full Name *" className="input col-span-2" />
                {errors.customer_name && <p className="text-red-500 text-xs col-span-2">{errors.customer_name.message}</p>}
                <input {...register('customer_phone', { required: 'Phone is required' })} placeholder="Phone Number *" className="input col-span-2" />
                {errors.customer_phone && <p className="text-red-500 text-xs col-span-2">{errors.customer_phone.message}</p>}
                <input {...register('city', { required: 'City is required' })} placeholder="City (e.g. Dhaka) *" className="input" />
                <input {...register('district')} placeholder="District" className="input" />
                <input {...register('area')} placeholder="Area" className="input" />
                <input {...register('thana')} placeholder="Thana" className="input" />
                <textarea {...register('address_line', { required: 'Address is required' })} placeholder="Full Address (House/Road/Block) *" className="input col-span-2 resize-none h-20" />
                {errors.address_line && <p className="text-red-500 text-xs col-span-2">{errors.address_line.message}</p>}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <CreditCard className="text-red-600" size={20} /> Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${selectedPayment === method.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="text-red-600" />
                    <div>
                      <div className="font-medium text-sm">{method.emoji} {method.label}</div>
                      <div className="text-xs text-gray-500">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map(item => (
                  <div key={item.product_id} className="flex justify-between gap-2">
                    <span className="text-gray-600 line-clamp-1">{item.product_name} ×{item.quantity}</span>
                    <span className="shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>৳{shipping}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-red-600">৳{total.toLocaleString()}</span></div>
              </div>
              <button type="submit" disabled={orderMutation.isPending} className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2 disabled:opacity-70">
                <CheckCircle size={18} />
                {orderMutation.isPending ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
