import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// DIKI范式6维度评分权重
const DIMENSION_WEIGHTS = {
  dataScore: 0.20,     // Data（数据质量）20%
  infoScore: 0.15,     // Information（信息处理）15%
  knowScore: 0.15,     // Knowledge（知识构建）15%
  insightScore: 0.20,  // Insight（洞察智慧）20%
  approvalScore: 0.15, // Approval（决策影响力）15%
  awardScore: 0.15     // Award（所获荣誉）15%
}

// 计算单个评分的加权总分
function calculateWeightedScore(score: {
  dataScore: number
  infoScore: number
  knowScore: number
  insightScore: number
  approvalScore: number
  awardScore: number
}) {
  return (
    score.dataScore * DIMENSION_WEIGHTS.dataScore +
    score.infoScore * DIMENSION_WEIGHTS.infoScore +
    score.knowScore * DIMENSION_WEIGHTS.knowScore +
    score.insightScore * DIMENSION_WEIGHTS.insightScore +
    score.approvalScore * DIMENSION_WEIGHTS.approvalScore +
    score.awardScore * DIMENSION_WEIGHTS.awardScore
  )
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
