import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, tipsterId, userId } = body

    await db.ticketRequests.updateStatus(id, status)

    // If approved, unlock the ticket for the user
    if (status === 'approved' && tipsterId && userId) {
      await db.unlockedTickets.add(userId, tipsterId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
