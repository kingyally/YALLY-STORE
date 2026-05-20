import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const banners = await db.banners.getAll()
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
