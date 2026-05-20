import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'

export async function GET() {
  try {
    const admins = await db.admins.getAll()
    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ admins: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const admin = await db.admins.create({
      email: body.email,
      role: body.role || 'admin',
      permissions: body.permissions || ['requests'],
      added_by: body.added_by
    })
    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}
