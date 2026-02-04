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
      if (users && Array.isArray(users) && users.length > 0) {
        // 获取现有用户名称，避免在循环中查询
        const existingUsers = await tx.user.findMany({
          where: {
            name: { in: users.map((u: any) => u.name) }
          },
          select: { name: true }
        })
        const existingNames = new Set(existingUsers.map(u => u.name))
        
        const newUsers = users.filter((u: any) => !existingNames.has(u.name))
        
        if (newUsers.length > 0) {
          await tx.user.createMany({
            data: newUsers.map((user: any) => ({
              name: user.name,
              role: user.role,
              department: user.department,
              passcode: user.passcode,
            }))
          })
          results.usersCreated = newUsers.length
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

        // 批量创建新项目
        await tx.project.createMany({
          data: projects.map((project: any) => ({
            name: project.name,
            department: project.department,
            presenter: project.presenter,
            description: project.description || '',
          }))
        })
        results.projectsCreated = projects.length
      }
    }, {
      timeout: 20000 // Increase timeout to 20s
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
