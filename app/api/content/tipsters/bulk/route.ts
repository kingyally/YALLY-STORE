import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function PUT(request: Request) {
  try {
    const { items } = await request.json()
    for (const tipster of items) {
      await db.tipsters.upsert(tipster.id, tipster)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk updating tipsters:', error)
    return NextResponse.json({ error: 'Failed to save tipsters' }, { status: 500 })
  }
}
