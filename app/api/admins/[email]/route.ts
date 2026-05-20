import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    const admin = await db.admins.getByEmail(decodeURIComponent(email))
    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json({ admin: null })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    const body = await request.json()
    await db.admins.update(decodeURIComponent(email), body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    await db.admins.delete(decodeURIComponent(email))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}
