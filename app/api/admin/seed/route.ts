import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { users, projects } = body

    if (!Array.isArray(users) || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Upsert Users
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id || '' }, // Assuming ID is provided, else we might rely on matching name?
        // If ID is not provided in seed, this might fail if we try to upsert with empty ID.
        // Let's assume seed data might have IDs or we generate them.
        // If no ID in seed, create. If ID, upsert.
        // But for upsert we need a unique constraint. ID is unique.
        // If the seed data doesn't have IDs, we should probably check by name or just create.
        // For simplicity, let's assume we try to match by ID if present, or create.
        // However, Prisma upsert requires a unique 'where'.
        // Let's assume the seed payload includes IDs.
        create: {
          id: user.id, // Optional: if undefined, Prisma generates UUID if configured (but we defined @default(uuid()))
          name: user.name,
          role: user.role,
          department: user.department,
          passcode: user.passcode,
        },
        update: {
          name: user.name,
          role: user.role,
          department: user.department,
          passcode: user.passcode,
        }
      })
    }

    // Upsert Projects
    for (const project of projects) {
      await prisma.project.upsert({
        where: { id: project.id || '' },
        create: {
          id: project.id,
          name: project.name,
          department: project.department,
          presenter: project.presenter,
          description: project.description,
        },
        update: {
          name: project.name,
          department: project.department,
          presenter: project.presenter,
          description: project.description,
        }
      })
    }

    return NextResponse.json({ success: true, message: `Processed ${users.length} users and ${projects.length} projects` })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
