'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Subscribe() {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('monthly')
  const router = useRouter()

  const plans = {
    monthly: { price: '£9.99', period: 'per month', charity: '£1.00', pool: '£4.99' },
    yearly: { price: '£89.99', period: 'per year', charity: '£12.00', pool: '£59.99' },
  }

  const handleSubscribe = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      subscription_status: 'active',
      subscription_plan: selected,
      role: 'user',
    })
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGive</Link>
          <h1 className="text-4xl font-bold mt-6 mb-3">Choose your plan</h1>
          <p className="text-gray-400">Every subscription supports your chosen charity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelected(key)}
              className={`border rounded-2xl p-8 cursor-pointer transition ${
                selected === key
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold capitalize">{key}</h2>
                  <p className="text-gray-400 text-sm mt-1">{key === 'yearly' ? 'Save 25%' : 'Flexible'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === key ? 'border-green-500 bg-green-500' : 'border-white/30'}`}>
                  {selected === key && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
              </div>
              <div className="text-4xl font-bold mb-1">{plan.price}</div>
              <div className="text-gray-400 text-sm mb-6">{plan.period}</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Charity contribution</span>
                  <span className="text-green-400 font-semibold">{plan.charity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prize pool contribution</span>
                  <span className="font-semibold">{plan.pool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly draw entries</span>
                  <span className="font-semibold">✓ Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Score tracking</span>
                  <span className="font-semibold">✓ Included</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-2">🔒 Demo Payment Mode</h3>
          <p className="text-gray-400 text-sm">This is a demonstration platform. No real payment will be taken. Click below to activate your subscription instantly.</p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl text-lg transition"
        >
          {loading ? 'Activating...' : `Activate ${selected} plan`}
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          Cancel anytime · No real charges in demo mode
        </p>
      </div>
    </div>
  )
}