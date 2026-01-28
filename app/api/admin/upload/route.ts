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
      projectsCleared: 0,
    }

    // Transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 处理评审员数据 - 增量添加
      if (users && Array.isArray(users)) {
        for (const user of users) {
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

      // 处理项目数据 - 先清空再导入
      if (projects && Array.isArray(projects) && projects.length > 0) {
        // 清空现有评分
        await tx.score.deleteMany()

        // 清空现有项目
        const deleted = await tx.project.deleteMany()
        results.projectsCleared = deleted.count

        // 重置评分状态
        await tx.config.upsert({
          where: { key: 'scoring_state' },
          update: { value: 'CLOSED' },
          create: { key: 'scoring_state', value: 'CLOSED' }
        })

        // 清除当前项目选择
        await tx.config.deleteMany({
          where: { key: 'current_project' }
        })

        // 创建新项目
        for (const project of projects) {
          await tx.project.create({
            data: {
              name: project.name,
              department: project.department,
              presenter: project.presenter,
              description: project.description || '',
            },
          })
          results.projectsCreated++
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '数据上传成功',
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
