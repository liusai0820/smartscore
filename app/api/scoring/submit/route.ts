import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { isSameDepartment } from '@/lib/utils'

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
    const { projectId, dataScore, infoScore, knowScore, insightScore, approvalScore, awardScore } = body

    // Validate input
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // DIKI范式6维度验证
    const scores = { dataScore, infoScore, knowScore, insightScore, approvalScore, awardScore }
    const maxScores: Record<string, number> = {
      dataScore: 20,
      infoScore: 15,
      knowScore: 15,
      insightScore: 20,
      approvalScore: 15,
      awardScore: 15
    }

    for (const [key, val] of Object.entries(scores)) {
      const max = maxScores[key]
      if (typeof val !== 'number' || val < 1 || val > max) {
        return NextResponse.json(
          { error: `${key} must be a number between 1 and ${max}` },
          { status: 400 }
        )
      }
    }

    // Check project existence
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Conflict of Interest Check
    if (isSameDepartment(user.department, project.department)) {
      return NextResponse.json(
        { error: '回避原则：您不能给本部门的项目打分' },
        { status: 403 }
      )
    }

    // Upsert score with DIKI 6 dimensions
    const score = await prisma.score.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      },
      update: {
        dataScore,
        infoScore,
        knowScore,
        insightScore,
        approvalScore,
        awardScore
      },
      create: {
        userId: user.id,
        projectId: projectId,
        dataScore,
        infoScore,
        knowScore,
        insightScore,
        approvalScore,
        awardScore
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
