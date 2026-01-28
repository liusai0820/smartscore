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

      // Calculate sub-dimension averages
      type ScoreKey = 'dataScore' | 'infoScore' | 'knowScore' | 'insightScore' | 'approvalScore' | 'awardScore'
      const calculateDimensionAvg = (key: ScoreKey) => {
        if (allScores.length === 0) return 0
        const sum = allScores.reduce((acc, s) => acc + s[key], 0)
        return sum / allScores.length
      }

      const avgDataScore = calculateDimensionAvg('dataScore')
      const avgInfoScore = calculateDimensionAvg('infoScore')
      const avgKnowScore = calculateDimensionAvg('knowScore')
      const avgInsightScore = calculateDimensionAvg('insightScore')
      const avgApprovalScore = calculateDimensionAvg('approvalScore')
      const avgAwardScore = calculateDimensionAvg('awardScore')

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
        avgDataScore: state === 'REVEALED' ? avgDataScore : null,
        avgInfoScore: state === 'REVEALED' ? avgInfoScore : null,
        avgKnowScore: state === 'REVEALED' ? avgKnowScore : null,
        avgInsightScore: state === 'REVEALED' ? avgInsightScore : null,
        avgApprovalScore: state === 'REVEALED' ? avgApprovalScore : null,
        avgAwardScore: state === 'REVEALED' ? avgAwardScore : null,
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
