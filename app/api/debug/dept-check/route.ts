
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // 1. Find the specific user (ID 12)
    const user = await prisma.user.findFirst({
      where: { name: { contains: '重大科技' } } // Try finding by name part if ID unconfirmed, or just list dept heads
    })

    // 2. Find the specific project
    const project = await prisma.project.findFirst({
      where: { department: { contains: '重大科技' } }
    })

    if (!user || !project) {
        return NextResponse.json({ 
            error: 'Target user or project not found',
            userFound: !!user,
            projectFound: !!project
        })
    }

    // 3. Compare details
    const userDept = user.department
    const projDept = project.department
    
    // char codes
    const userCodes = userDept.split('').map(c => c.charCodeAt(0))
    const projCodes = projDept.split('').map(c => c.charCodeAt(0))
    
    const isEqualStrict = userDept === projDept
    const isEqualTrim = userDept.trim() === projDept.trim()

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        department: userDept,
        charCodes: userCodes
      },
      project: {
        id: project.id,
        name: project.name,
        department: projDept,
        charCodes: projCodes
      },
      comparison: {
        strictEqual: isEqualStrict,
        trimEqual: isEqualTrim,
        lengthUser: userDept.length,
        lengthProj: projDept.length
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
