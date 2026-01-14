import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// Helper to ensure config exists
async function ensureConfig() {
  const state = await prisma.config.findUnique({ where: { key: 'scoring_state' } })
  if (!state) {
    await prisma.config.create({
      data: { key: 'scoring_state', value: 'CLOSED' }
    })
  }
}

export async function GET() {
  await ensureConfig()
  const [stateConfig, projectConfig] = await Promise.all([
    prisma.config.findUnique({ where: { key: 'scoring_state' } }),
    prisma.config.findUnique({ where: { key: 'current_project' } })
  ])

  return NextResponse.json({
    state: stateConfig?.value || 'CLOSED',
    currentProjectId: projectConfig?.value || null
  })
}

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { state, currentProjectId } = body

    // Update scoring state if provided
    if (state !== undefined) {
      if (!['SCORING', 'CLOSED', 'REVEALED'].includes(state)) {
        return NextResponse.json(
          { error: 'Invalid state' },
          { status: 400 }
        )
      }
      await prisma.config.upsert({
        where: { key: 'scoring_state' },
        update: { value: state },
        create: { key: 'scoring_state', value: state },
      })
    }

    // Update current project if provided
    if (currentProjectId !== undefined) {
      if (currentProjectId === null) {
        await prisma.config.delete({ where: { key: 'current_project' } }).catch(() => { })
      } else {
        await prisma.config.upsert({
          where: { key: 'current_project' },
          update: { value: currentProjectId },
          create: { key: 'current_project', value: currentProjectId },
        })
      }
    }

    const [stateConfig, projectConfig] = await Promise.all([
      prisma.config.findUnique({ where: { key: 'scoring_state' } }),
      prisma.config.findUnique({ where: { key: 'current_project' } })
    ])

    return NextResponse.json({
      state: stateConfig?.value || 'CLOSED',
      currentProjectId: projectConfig?.value || null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
