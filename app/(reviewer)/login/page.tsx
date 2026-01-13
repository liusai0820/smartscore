import { prisma } from '@/lib/db'
import LoginForm from './LoginForm'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      department: true
    },
    orderBy: {
      id: 'asc'
    }
  })

  return (
    <div className="min-h-screen ink-gradient cloud-pattern relative overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#c53d43]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#d4a853]/10 to-transparent blur-3xl" />
      </div>

      {/* 返回链接 */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[#6e7681] hover:text-[#a0a0a0] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">返回首页</span>
      </Link>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <LoginForm users={users} />
      </div>
    </div>
  )
}
