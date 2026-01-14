import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, department, presenter, description } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        department,
        presenter,
        description,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // 1. Delete associated scores first
    await prisma.score.deleteMany({
      where: { projectId: id },
    })

    // 2. Check if this is the current project and reset if so
    const currentProjectConfig = await prisma.config.findUnique({
      where: { key: 'current_project' },
    })

    if (currentProjectConfig?.value === id) {
      await prisma.config.update({
        where: { key: 'current_project' },
        data: { value: '' },
      })
    }

    // 3. Delete the project
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
