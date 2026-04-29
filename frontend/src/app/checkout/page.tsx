export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'

const CheckoutContent = dynamic(() => import('./CheckoutContent'), { ssr: false })

export default function CheckoutPage() {
  return <CheckoutContent />
}
