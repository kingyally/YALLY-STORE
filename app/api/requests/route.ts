import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const requests = await db.ticketRequests.getAll()
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const user = await db.users.getById(session.user_id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const ticketRequest = await db.ticketRequests.create({
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone || '',
      user_email: user.email,
      tipster_id: body.tipster_id,
      tipster_name: body.tipster_name,
      amount: body.amount,
      payment_number: body.payment_number,
      payment_method: body.payment_method,
      status: 'pending'
    })

    return NextResponse.json({ request: ticketRequest })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
