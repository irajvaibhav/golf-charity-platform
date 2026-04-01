'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Charities() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCharities()
  }, [])

  const loadCharities = async () => {
    const { data } = await supabase.from('charities').select('*')
    setCharities(data || [])
    setLoading(false)
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGive</Link>
        <div className="flex gap-6">
          <Link href="/auth/login" className="text-gray-400 hover:text-white transition">Login</Link>
          <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-full transition">Join Now</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Our Charities</h1>
          <p className="text-gray-400 text-xl mb-8">Choose a cause that matters to you</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities..."
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        {loading ? (
          <div className="text-center text-green-400">Loading charities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/50 transition">
                <img src={c.image_url} alt={c.name} className="w-full h-48 object-cover"/>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                  <p className="text-gray-400 mb-4">{c.description}</p>
                  <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-full text-sm transition">
                    Support this charity
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 px-8 py-8 text-center text-gray-400">
        <p>© 2025 GolfGive. All rights reserved.</p>
      </footer>
    </div>
  )
}