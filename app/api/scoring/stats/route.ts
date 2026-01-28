import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
    const stateConfig = await prisma.config.findUnique({
      where: { key: 'scoring_state' }
    })
    const isRevealed = stateConfig?.value === 'REVEALED'

    const projects = await prisma.project.findMany({
      include: {
        scores: {
          include: {
            user: true
          }
        }
      }
    })

    const results = projects.map(project => {
      const leaderScores = project.scores.filter(s => s.user.role === 'LEADER')
      const deptHeadScores = project.scores.filter(s => s.user.role === 'DEPT_HEAD')

      // Calculate weighted average for each group
      const avgWeightedScore = (scores: typeof leaderScores) => {
        if (scores.length === 0) return 0
        const total = scores.reduce((sum, s) => sum + calculateWeightedScore(s), 0)
        return total / scores.length
      }

      const leaderAvg = avgWeightedScore(leaderScores)
      const deptHeadAvg = avgWeightedScore(deptHeadScores)

      // Role weights: Leader 60%, DeptHead 40%
      const LEADER_WEIGHT = 0.6
      const DEPT_WEIGHT = 0.4

      let finalScore = 0
      if (leaderScores.length > 0 && deptHeadScores.length > 0) {
        finalScore = (leaderAvg * LEADER_WEIGHT) + (deptHeadAvg * DEPT_WEIGHT)
      } else if (leaderScores.length > 0) {
        finalScore = leaderAvg
      } else if (deptHeadScores.length > 0) {
        finalScore = deptHeadAvg
      }

      return {
        id: project.id,
        name: project.name,
        department: project.department,
        presenter: project.presenter,
        scoreCount: project.scores.length,
        leaderAvg: isRevealed ? leaderAvg : null,
        deptHeadAvg: isRevealed ? deptHeadAvg : null,
        finalScore: isRevealed ? finalScore : null,
        progress: project.scores.length
      }
    })

    if (isRevealed) {
      results.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    }

    return NextResponse.json({
      state: stateConfig?.value || 'CLOSED',
      results
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
