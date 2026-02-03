import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// 计算单个评分的总分（直接求和，因为各维度满分已体现权重比例）
// dataScore: 最高20分 (20%)
// infoScore: 最高15分 (15%)
// knowScore: 最高15分 (15%)
// insightScore: 最高20分 (20%)
// approvalScore: 最高15分 (15%)
// awardScore: 最高15分 (15%)
// 总计满分100分
function calculateTotalScore(score: {
  dataScore: number
  infoScore: number
  knowScore: number
  insightScore: number
  approvalScore: number
  awardScore: number
}) {
  return (
    score.dataScore +
    score.infoScore +
    score.knowScore +
    score.insightScore +
    score.approvalScore +
    score.awardScore
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

    const scoreMap = new Map(userScores.map(s => [s.projectId, calculateTotalScore(s)]))

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
