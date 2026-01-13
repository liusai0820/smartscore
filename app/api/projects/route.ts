import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' }
    })

    const userScores = await prisma.score.findMany({
      where: { userId: user.id }
    })

    const scoreMap = new Map(userScores.map(s => [s.projectId, s.value]))

    const projectsWithScores = projects.map(project => ({
      ...project,
      myScore: scoreMap.get(project.id) || null,
      hasConflict: project.department === user.department
    }))

    return NextResponse.json({ projects: projectsWithScores })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
