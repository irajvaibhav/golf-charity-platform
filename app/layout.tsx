import { Geist } from 'next/font/google'
import './globals.css'
import ChatWidget from './components/ChatWidget'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'Golf Charity Platform',
  description: 'Play golf, win prizes, support charity',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}