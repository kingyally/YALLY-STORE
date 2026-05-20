import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function PUT(request: Request) {
  try {
    const { items } = await request.json()
    for (const item of items) {
      await db.history.upsert(item.id, item)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk updating history:', error)
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 })
  }
}
