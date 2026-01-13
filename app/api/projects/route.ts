import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 4维度评分权重
const DIMENSION_WEIGHTS = {
  valueScore: 0.30,
  innovScore: 0.25,
  feasiScore: 0.25,
  outputScore: 0.20
}

// 计算单个评分的加权总分
function calculateWeightedScore(score: { valueScore: number; innovScore: number; feasiScore: number; outputScore: number }) {
  return (
    score.valueScore * DIMENSION_WEIGHTS.valueScore +
    score.innovScore * DIMENSION_WEIGHTS.innovScore +
    score.feasiScore * DIMENSION_WEIGHTS.feasiScore +
    score.outputScore * DIMENSION_WEIGHTS.outputScore
  ) * 10
}

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

    const scoreMap = new Map(userScores.map(s => [s.projectId, calculateWeightedScore(s)]))

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
