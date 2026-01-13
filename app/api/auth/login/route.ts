import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { loginUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, passcode } = body

    if (!name || !passcode) {
      return NextResponse.json(
        { error: 'Name and passcode are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        name: name,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In a real app, we would hash passwords. For this internal tool, we compare directly as per spec.
    if (user.passcode !== passcode) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await loginUser(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
