import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get current user state
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Toggle isActive
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isActive: updatedUser.isActive
      }
    })
  } catch (error) {
    console.error('Toggle user error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    )
  }
}
