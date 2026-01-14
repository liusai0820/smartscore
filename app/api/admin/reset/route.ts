import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function POST() {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Delete all scores
    await prisma.score.deleteMany()

    // 2. Reset scoring state to CLOSED
    await prisma.config.upsert({
      where: { key: 'scoring_state' },
      update: { value: 'CLOSED' },
      create: { key: 'scoring_state', value: 'CLOSED' }
    })

    // 3. Reset current project to empty string
    await prisma.config.upsert({
      where: { key: 'current_project' },
      update: { value: '' },
      create: { key: 'current_project', value: '' }
    })

    return NextResponse.json({ success: true, message: 'Data reset successfully' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
