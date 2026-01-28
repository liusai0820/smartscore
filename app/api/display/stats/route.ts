import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 4维度评分权重
const DIMENSION_WEIGHTS = {
  valueScore: 0.30,  // 研究价值 30%
  innovScore: 0.25,  // 创新性 25%
  feasiScore: 0.25,  // 可行性 25%
  outputScore: 0.20  // 预期成果 20%
}

// 计算单个评分的加权总分
function calculateWeightedScore(score: { valueScore: number; innovScore: number; feasiScore: number; outputScore: number }) {
  return (
    score.valueScore * DIMENSION_WEIGHTS.valueScore +
    score.innovScore * DIMENSION_WEIGHTS.innovScore +
    score.feasiScore * DIMENSION_WEIGHTS.feasiScore +
    score.outputScore * DIMENSION_WEIGHTS.outputScore
  ) * 10 // 转换为百分制
}

export async function GET() {
  try {
    const [stateConfig, projectConfig] = await Promise.all([
      prisma.config.findUnique({ where: { key: 'scoring_state' } }),
      prisma.config.findUnique({ where: { key: 'current_project' } })
    ])

    const state = stateConfig?.value || 'CLOSED'
    const currentProjectId = projectConfig?.value || null

    // Get all active reviewers (only show enabled users)
    const allReviewers = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ role: 'asc' }, { id: 'asc' }]
    })

    // Get current project details if exists
    let currentProject = null
    let reviewerStatuses: { id: string; name: string; role: string; department: string; hasVoted: boolean }[] = []

    if (currentProjectId) {
      currentProject = await prisma.project.findUnique({
        where: { id: currentProjectId },
        include: {
          scores: {
            select: { userId: true }
          }
        }
      })

      if (currentProject) {
        const votedUserIds = new Set(currentProject.scores.map(s => s.userId))
        reviewerStatuses = allReviewers.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          department: r.department,
          hasVoted: votedUserIds.has(r.id)
        }))
      }
    }

    // Get all projects with scores for ranking display
    const projects = await prisma.project.findMany({
      include: {
        scores: {
          include: { user: true }
        }
      }
    })

    const results = projects.map(project => {
      const leaderScores = project.scores.filter(s => s.user.role === 'LEADER')
      const deptHeadScores = project.scores.filter(s => s.user.role === 'DEPT_HEAD')
      const allScores = [...leaderScores, ...deptHeadScores]

      // Calculate sub-dimension averages (scaled to 100)
      const calculateDimensionAvg = (key: 'valueScore' | 'innovScore' | 'feasiScore' | 'outputScore') => {
        if (allScores.length === 0) return 0
        const sum = allScores.reduce((acc, s) => acc + s[key], 0)
        return (sum / allScores.length) * 10
      }

      const avgValueScore = calculateDimensionAvg('valueScore')
      const avgInnovScore = calculateDimensionAvg('innovScore')
      const avgFeasiScore = calculateDimensionAvg('feasiScore')
      const avgOutputScore = calculateDimensionAvg('outputScore')

      // Calculate Standard Deviation
      let standardDeviation = 0
      if (allScores.length > 0) {
        const weightedTotals = allScores.map(s => calculateWeightedScore(s))
        const mean = weightedTotals.reduce((a, b) => a + b, 0) / weightedTotals.length
        const variance = weightedTotals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / weightedTotals.length
        standardDeviation = Math.sqrt(variance)
      }

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
        leaderAvg: state === 'REVEALED' ? leaderAvg : null,
        deptHeadAvg: state === 'REVEALED' ? deptHeadAvg : null,
        finalScore: state === 'REVEALED' ? finalScore : null,
        avgValueScore: state === 'REVEALED' ? avgValueScore : null,
        avgInnovScore: state === 'REVEALED' ? avgInnovScore : null,
        avgFeasiScore: state === 'REVEALED' ? avgFeasiScore : null,
        avgOutputScore: state === 'REVEALED' ? avgOutputScore : null,
        standardDeviation: state === 'REVEALED' ? standardDeviation : null
      }
    })

    if (state === 'REVEALED') {
      results.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    }

    return NextResponse.json({
      state,
      currentProject: currentProject ? {
        id: currentProject.id,
        name: currentProject.name,
        department: currentProject.department,
        presenter: currentProject.presenter,
        description: currentProject.description
      } : null,
      reviewerStatuses,
      totalReviewers: allReviewers.length,
      votedCount: reviewerStatuses.filter(r => r.hasVoted).length,
      results
    })

  } catch (error) {
    console.error('Display stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
