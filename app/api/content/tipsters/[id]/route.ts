import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.tipsters.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tipster:', error)
    return NextResponse.json({ error: 'Failed to delete tipster' }, { status: 500 })
  }
}
