import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const items = await db.tipsters.getAll()
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching tipsters:', error)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await db.tipsters.upsert(body.id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error upserting tipster:', error)
    return NextResponse.json({ error: 'Failed to save tipster' }, { status: 500 })
  }
}
