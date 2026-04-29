export const dynamic = 'force-dynamic'

import NextDynamic from 'next/dynamic'

const CheckoutContent = NextDynamic(() => import('./CheckoutContent'), { ssr: false })

export default function CheckoutPage() {
  return <CheckoutContent />
}
