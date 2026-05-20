import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await db.sessions.validate(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const tipsterIds = await db.unlockedTickets.getByUser(session.user_id)
    return NextResponse.json({ tipsterIds })
  } catch (error) {
    console.error('Error fetching unlocked tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch unlocked tickets' }, { status: 500 })
  }
}
