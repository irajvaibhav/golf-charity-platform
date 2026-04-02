import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are GolfGive Assistant, a helpful chatbot for the GolfGive golf charity platform.
You help users with:
- Subscriptions: monthly and yearly plans, pricing, how to subscribe, cancellation
- Donations: how charity contributions work, changing chosen charity, percentage breakdown
- Scores: how to enter Stableford scores, the 5-score limit, how scores affect draw entries
- Monthly Draw: how the prize draw works, prize percentages (40% jackpot, 35% second, 25% third)
- Account: login, signup, profile settings

Be friendly, concise, and helpful. If asked something unrelated to the platform, politely let the user know you can only help with GolfGive topics.
Keep answers short and easy to read. Use bullet points where appropriate.`

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { messages, userId } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages payload' }, { status: 400 })
    }

    // groq api call - using llama 3.1 since its free and fast enough
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'

    // save to db only if logged in, skip for guests
    if (userId) {
      const lastUserMessage = messages[messages.length - 1]
      await supabase.from('chat_history').insert([
        { user_id: userId, role: 'user', content: lastUserMessage.content },
        { user_id: userId, role: 'assistant', content: assistantMessage },
      ])
    }

    return Response.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat API error:', error)

    // TODO: maybe add retry logic here later
    if (error?.status === 401) {
      return Response.json({ error: 'Invalid API key.' }, { status: 401 })
    }
    if (error?.status === 429) {
      return Response.json({ error: 'Too many requests, try again in a bit.' }, { status: 429 })
    }

    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
