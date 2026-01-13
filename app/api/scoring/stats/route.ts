import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    // In a real app we'd check if user is admin, but for now we rely on state check
    // or if the user is requesting it.
    // Actually, the requirements say: "Only return full data if state is REVEALED or user is Admin."
    // We haven't implemented an explicit "isAdmin" flag on User properly yet besides checking role?
    // Let's assume anyone can hit this, but we filter data based on state.

    const stateConfig = await prisma.config.findUnique({
      where: { key: 'scoring_state' }
    })
    const isRevealed = stateConfig?.value === 'REVEALED'

    // We allow fetching stats if revealed OR if user is a LEADER (acting as admin for now?)
    // or maybe we just check if the user requesting is 'LEADER' role?
    // Let's stick to the requirement: REVEALED or Admin.
    // Since we don't have a specific Admin role in the schema (just LEADER/DEPT_HEAD),
    // let's assume LEADER is effectively admin-privileged or we'll just check if the user is authenticated
    // and maybe add an isAdmin check later.
    // For now, if NOT revealed, we might just return progress counts, not actual scores.

    // Actually, let's fetch all data and calculate, but mask the results if not revealed.

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
      // Separate scores by role
      const leaderScores = project.scores.filter(s => s.user.role === 'LEADER')
      const deptHeadScores = project.scores.filter(s => s.user.role === 'DEPT_HEAD')

      const avg = (scores: typeof leaderScores) =>
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s.value, 0) / scores.length
          : 0

      const leaderAvg = avg(leaderScores)
      const deptHeadAvg = avg(deptHeadScores)

      // Weights: Leader 60%, DeptHead 40% (Hardcoded for now as per brainstorming, or fetch from Config)
      // Let's use 0.6 and 0.4
      const LEADER_WEIGHT = 0.6
      const DEPT_WEIGHT = 0.4

      // If one group hasn't scored, what do we do?
      // For now, simple calculation.
      // Note: If no leaders scored, score is 0? Or just DeptHead avg?
      // Let's assume standard weighted average.

      let finalScore = 0
      if (leaderScores.length > 0 && deptHeadScores.length > 0) {
        finalScore = (leaderAvg * LEADER_WEIGHT) + (deptHeadAvg * DEPT_WEIGHT)
      } else if (leaderScores.length > 0) {
        finalScore = leaderAvg // Fallback if only leaders scored
      } else if (deptHeadScores.length > 0) {
        finalScore = deptHeadAvg // Fallback if only dept heads scored
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
        // Helper for progress bar
        progress: project.scores.length // We might need total potential reviewers to calculate %
      }
    })

    // Sort by final score if revealed
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
