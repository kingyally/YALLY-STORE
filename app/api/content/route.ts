import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const [tipsters, history, packages, settings, banners] = await Promise.all([
      db.tipsters.getAll(),
      db.history.getAll(),
      db.packages.getAll(),
      db.settings.get(),
      db.banners.getAll()
    ])

    return NextResponse.json({
      tipsters,
      history,
      packages,
      settings,
      banners
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
