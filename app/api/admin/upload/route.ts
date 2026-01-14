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

    // Simple validation
    if (!users && !projects) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    const results = {
      usersCreated: 0,
      projectsCreated: 0,
    }

    // Transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      if (users && Array.isArray(users)) {
        for (const user of users) {
          // Check if user exists to avoid duplicates or update them
          // For simplicity in this seed endpoint, we'll upsert by name if possible,
          // but schema doesn't have unique constraint on name.
          // Let's just create new ones or check existence.
          // Better: Check existence by name.

          const existing = await tx.user.findFirst({ where: { name: user.name } })
          if (!existing) {
            await tx.user.create({
              data: {
                name: user.name,
                role: user.role,
                department: user.department,
                passcode: user.passcode,
              },
            })
            results.usersCreated++
          }
        }
      }

      if (projects && Array.isArray(projects)) {
        for (const project of projects) {
          // Check if project exists by name
          const existing = await tx.project.findFirst({ where: { name: project.name } })
          if (!existing) {
            await tx.project.create({
              data: {
                name: project.name,
                department: project.department,
                presenter: project.presenter,
                description: project.description,
              },
            })
            results.projectsCreated++
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Data uploaded successfully',
      details: results
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
