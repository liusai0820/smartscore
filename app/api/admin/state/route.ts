import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Helper to ensure config exists
async function ensureConfig() {
  const state = await prisma.config.findUnique({ where: { key: 'scoring_state' } })
  if (!state) {
    await prisma.config.create({
      data: { key: 'scoring_state', value: 'CLOSED' } // Default state
    })
  }
}

export async function GET() {
  await ensureConfig()
  const state = await prisma.config.findUnique({
    where: { key: 'scoring_state' }
  })

  return NextResponse.json({ state: state?.value || 'CLOSED' })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { state } = body

    if (!['SCORING', 'CLOSED', 'REVEALED'].includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state' },
        { status: 400 }
      )
    }

    const updated = await prisma.config.upsert({
      where: { key: 'scoring_state' },
      update: { value: state },
      create: { key: 'scoring_state', value: state },
    })

    return NextResponse.json({ state: updated.value })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
