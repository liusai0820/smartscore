import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
        const weightedTotals = allScores.map(s => calculateTotalScore(s))
        const mean = weightedTotals.reduce((a, b) => a + b, 0) / weightedTotals.length
        const variance = weightedTotals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / weightedTotals.length
        standardDeviation = Math.sqrt(variance)
      }

      // Calculate weighted average for each group
      const avgWeightedScore = (scores: typeof leaderScores) => {
        if (scores.length === 0) return 0
        const total = scores.reduce((sum, s) => sum + calculateTotalScore(s), 0)
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
