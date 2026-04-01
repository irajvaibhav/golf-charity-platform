'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [drawRunning, setDrawRunning] = useState(false)
  const [newCharity, setNewCharity] = useState({ name: '', description: '', image_url: '' })
  const router = useRouter()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/dashboard'); return }

    const { data: users } = await supabase.from('profiles').select('*')
    const { data: charities } = await supabase.from('charities').select('*')
    const { data: draws } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    const { data: winners } = await supabase.from('winners').select('*')

    setUsers(users || [])
    setCharities(charities || [])
    setDraws(draws || [])
    setWinners(winners || [])
    setLoading(false)
  }

  const runDraw = async () => {
    setDrawRunning(true)
    const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1)
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

    const { data: draw } = await supabase.from('draws').insert({
      month,
      status: 'completed',
      winning_numbers: winningNumbers,
      jackpot_amount: users.filter(u => u.subscription_status === 'active').length * 4.99
    }).select().single()

    alert(`Draw completed!\nWinning numbers: ${winningNumbers.join(', ')}`)
    await loadData()
    setDrawRunning(false)
  }

  const addCharity = async (e) => {
    e.preventDefault()
    await supabase.from('charities').insert(newCharity)
    setNewCharity({ name: '', description: '', image_url: '' })
    await loadData()
  }

  const deleteCharity = async (id) => {
    await supabase.from('charities').delete().eq('id', id)
    await loadData()
  }

  const updateWinnerStatus = async (id, status) => {
    await supabase.from('winners').update({ status }).eq('id', id)
    await loadData()
  }

  const toggleUserSubscription = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', userId)
    await loadData()
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading admin...</div>
    </div>
  )

  const tabs = ['users', 'draws', 'charities', 'winners']

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGive <span className="text-sm text-gray-400 font-normal">Admin</span></Link>
        <button onClick={() => { supabase.auth.signOut(); router.push('/') }} className="text-gray-400 hover:text-white transition">Logout</button>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your platform</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Active Subscribers', value: users.filter(u => u.subscription_status === 'active').length },
            { label: 'Total Draws', value: draws.length },
            { label: 'Charities', value: charities.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-2xl font-bold text-green-400">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize font-semibold transition border-b-2 ${
                activeTab === tab ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Plan</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 capitalize">{u.subscription_plan || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserSubscription(u.id, u.subscription_status)}
                        className="text-sm border border-white/20 hover:border-white/50 px-3 py-1 rounded-lg transition"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Draws Tab */}
        {activeTab === 'draws' && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Run Monthly Draw</h2>
              <p className="text-gray-400 mb-6">This will generate 5 random winning numbers and record the draw result.</p>
              <button
                onClick={runDraw}
                disabled={drawRunning}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-10 py-4 rounded-xl text-lg transition"
              >
                {drawRunning ? 'Running Draw...' : '🎲 Run Draw Now'}
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Month</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Winning Numbers</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Jackpot</th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map((d) => (
                    <tr key={d.id} className="border-b border-white/5">
                      <td className="px-6 py-4">{d.month}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {d.winning_numbers?.map((n, i) => (
                            <span key={i} className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{n}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">{d.status}</span>
                      </td>
                      <td className="px-6 py-4">£{d.jackpot_amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {draws.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No draws yet. Run your first draw!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charities Tab */}
        {activeTab === 'charities' && (
          <div>
            <form onSubmit={addCharity} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Add New Charity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={newCharity.name}
                  onChange={(e) => setNewCharity({ ...newCharity, name: e.target.value })}
                  placeholder="Charity name"
                  required
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <input
                  value={newCharity.description}
                  onChange={(e) => setNewCharity({ ...newCharity, description: e.target.value })}
                  placeholder="Description"
                  required
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <input
                  value={newCharity.image_url}
                  onChange={(e) => setNewCharity({ ...newCharity, image_url: e.target.value })}
                  placeholder="Image URL"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <button type="submit" className="mt-4 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg transition">
                Add Charity
              </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charities.map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold mb-1">{c.name}</h3>
                    <p className="text-gray-400 text-sm">{c.description}</p>
                  </div>
                  <button onClick={() => deleteCharity(c.id)} className="text-red-400 hover:text-red-300 text-sm transition ml-4">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Match Type</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id} className="border-b border-white/5">
                    <td className="px-6 py-4">{w.match_type}</td>
                    <td className="px-6 py-4">£{w.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${w.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <button onClick={() => updateWinnerStatus(w.id, 'paid')} className="text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1 rounded-lg transition">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {winners.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No winners yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}