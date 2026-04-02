'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [charities, setCharities] = useState([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    console.log('user loaded:', user.email)

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) { router.push('/subscribe'); return }
    setProfile(profile)

    const { data: scores } = await supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setScores(scores || [])
    console.log('scores:', scores)

    const { data: charities } = await supabase.from('charities').select('*')
    setCharities(charities || [])

    setLoading(false)
  }

  const addScore = async (e) => {
    e.preventDefault()
    if (!newScore || !newDate) return
    const score = parseInt(newScore)
    if (score < 1 || score > 45) { alert('Score must be between 1 and 45'); return }
    setSaving(true)

    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }

    await supabase.from('scores').insert({ user_id: user.id, score, date: newDate })
    setNewScore('')
    setNewDate('')
    await loadData()
    setSaving(false)
  }

  const updateCharity = async (charityId) => {
    await supabase.from('profiles').update({ charity_id: charityId }).eq('id', user.id)
    setProfile({ ...profile, charity_id: charityId })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGive</Link>
        <div className="flex items-center gap-6">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-400 mb-10">Welcome back! Here's your overview.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Subscription</div>
            <div className={`text-2xl font-bold capitalize ${profile?.subscription_status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
              {profile?.subscription_status || 'Inactive'}
            </div>
            <div className="text-gray-400 text-sm mt-1 capitalize">{profile?.subscription_plan || '-'} plan</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Scores Entered</div>
            <div className="text-2xl font-bold">{scores.length} / 5</div>
            <div className="text-gray-400 text-sm mt-1">Last 5 scores tracked</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">Charity Contribution</div>
            <div className="text-2xl font-bold text-green-400">{profile?.charity_percentage || 10}%</div>
            <div className="text-gray-400 text-sm mt-1">Of your subscription</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Score Entry */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Golf Scores</h2>
            <form onSubmit={addScore} className="flex gap-3 mb-6">
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Score (1-45)"
                min="1" max="45"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition"
              >
                {saving ? '...' : 'Add'}
              </button>
            </form>
            <div className="space-y-3">
              {scores.length === 0 && <p className="text-gray-400 text-sm">No scores yet. Add your first score!</p>}
              {scores.map((s, i) => (
                <div key={s.id} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">#{i + 1}</span>
                    <span className="font-bold text-xl text-green-400">{s.score}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{new Date(s.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Charity Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">My Charity</h2>
            <div className="space-y-3">
              {charities.map((c) => (
                <div
                  key={c.id}
                  onClick={() => updateCharity(c.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition ${
                    profile?.charity_id === c.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${profile?.charity_id === c.id ? 'border-green-500 bg-green-500' : 'border-white/30'}`}/>
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-gray-400 text-sm">{c.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Draw Info */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Draw</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">Active</div>
              <div className="text-gray-400 text-sm">Draw Status</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">April 2026</div>
              <div className="text-gray-400 text-sm">Current Draw Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">₹0</div>
              <div className="text-gray-400 text-sm">Total Winnings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}