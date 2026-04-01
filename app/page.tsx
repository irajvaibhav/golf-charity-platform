'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <div className="text-2xl font-bold text-green-400">⛳ GolfGive</div>
        <div className="flex gap-6">
          <Link href="/charities" className="text-gray-400 hover:text-white transition">Charities</Link>
          <Link href="/auth/login" className="text-gray-400 hover:text-white transition">Login</Link>
          <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-full transition">Join Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-green-400 font-semibold mb-4 tracking-widest uppercase text-sm">Play. Win. Give.</p>
          <h1 className="text-6xl font-bold mb-6 leading-tight">Golf that <span className="text-green-400">changes</span><br />the world</h1>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl">Enter your scores, join monthly prize draws, and donate to the charity of your choice — all in one place.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-full text-lg transition">Start Playing</Link>
            <Link href="/charities" className="border border-white/20 hover:border-white/50 px-8 py-4 rounded-full text-lg transition">View Charities</Link>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion goes straight to your chosen charity.' },
            { step: '02', title: 'Enter Scores', desc: 'Log your last 5 Stableford scores. Your performance shapes your draw entries.' },
            { step: '03', title: 'Win & Give', desc: 'Match numbers in our monthly draw and win prizes while supporting great causes.' },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-green-500/50 transition">
              <div className="text-green-400 text-5xl font-bold mb-4">{item.step}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize Pool */}
      <section className="px-8 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Monthly Prize Pool</h2>
          <p className="text-gray-400 mb-12">Prizes distributed automatically every month</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { match: '5 Numbers', prize: '40%', label: 'Jackpot', color: 'text-yellow-400' },
              { match: '4 Numbers', prize: '35%', label: 'Second Prize', color: 'text-gray-300' },
              { match: '3 Numbers', prize: '25%', label: 'Third Prize', color: 'text-orange-400' },
            ].map((item) => (
              <div key={item.match} className="bg-black/50 border border-white/10 rounded-2xl p-6">
                <div className={`text-4xl font-bold ${item.color} mb-2`}>{item.prize}</div>
                <div className="font-semibold mb-1">{item.match}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-32 text-center">
        <h2 className="text-5xl font-bold mb-6">Ready to make a difference?</h2>
        <p className="text-gray-400 text-xl mb-10">Join thousands of golfers supporting charity through play.</p>
        <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-5 rounded-full text-xl transition">Get Started Today</Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 text-center text-gray-400">
        <p>© 2025 GolfGive. All rights reserved.</p>
      </footer>
    </main>
  )
}