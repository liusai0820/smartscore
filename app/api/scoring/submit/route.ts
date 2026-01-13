import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check system state
    const stateConfig = await prisma.config.findUnique({
      where: { key: 'scoring_state' }
    })

    if (stateConfig?.value !== 'SCORING') {
      return NextResponse.json(
        { error: 'Scoring is currently closed' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { projectId, value } = body

    if (!projectId || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    if (value < 0 || value > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check project existence
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Conflict of Interest Check
    if (user.department === project.department) {
      return NextResponse.json(
        { error: 'Conflict of interest: You cannot score your own department' },
        { status: 403 }
      )
    }

    // Upsert score
    const score = await prisma.score.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      },
      update: { value },
      create: {
        userId: user.id,
        projectId: projectId,
        value
      }
    })

    return NextResponse.json({ success: true, score })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
