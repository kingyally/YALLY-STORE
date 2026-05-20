import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const tipsters = await db.tipsters.getAll()
    return NextResponse.json(tipsters)
  } catch (error) {
    console.error('Error fetching tipsters:', error)
    return NextResponse.json({ error: 'Failed to fetch tipsters' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tipster = await db.tipsters.upsert(body.id, body)
    return NextResponse.json(tipster)
  } catch (error) {
    console.error('Error creating tipster:', error)
    return NextResponse.json({ error: 'Failed to create tipster' }, { status: 500 })
  }
}
