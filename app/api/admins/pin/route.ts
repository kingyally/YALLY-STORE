import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const pin = await db.adminPin.get()
    return NextResponse.json({ pin })
  } catch (error) {
    console.error('Error fetching admin PIN:', error)
    return NextResponse.json({ pin: '1234' })
  }
}

export async function PUT(request: Request) {
  try {
    const { pin } = await request.json()
    await db.adminPin.update(pin)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating admin PIN:', error)
    return NextResponse.json({ error: 'Failed to update PIN' }, { status: 500 })
  }
}
