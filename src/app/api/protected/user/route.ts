export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'

export async function GET() {
  const { session, error } = await getServerSession()

  if (!session || error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Return user data - this is now properly protected
  return NextResponse.json({
    user: session.user,
    message: 'This is protected data only authenticated users can see'
  })
}