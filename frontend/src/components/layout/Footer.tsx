import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 text-white font-bold text-lg px-1 py-1 rounded-lg">
                <Image src="/photo/tech-logo.jpg" alt="TechNova" width={40} height={40} />  
              </div>
              <span className="text-white font-bold text-xl">TechNova Mart</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Bangladesh&apos;s best online gadget & electronics shopping platform.
              Top quality products delivered to your doorstep.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-blue-400 transition" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-red-400 transition" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-white transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:text-white transition">
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-red-400" />
                <span>57/1,Road-7A,Dhanmondi, Dhaka-1209,Bangladesh </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-red-400" />
                <span>+880 1410-732067</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-red-400" />
                <span>support@technovamart.com</span>
              </li>
            </ul>

            <div className="mt-4">
              <p className="text-sm font-medium text-white mb-2">We Accept:</p>
              <div className="flex gap-2 flex-wrap">
                {['bKash', 'Nagad', 'Visa', 'MasterCard'].map((p) => (
                  <span key={p} className="bg-gray-700 text-xs px-2 py-1 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <span>© {year} TechNova Mart. All rights reserved.</span>
          <span>Powered by WinterX AI</span>
        </div>
      </div>
    </footer>
  )
}