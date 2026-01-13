import { prisma } from '@/lib/db'
import LoginForm from './LoginForm'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

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
      name: 'asc'
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm users={users} />
    </div>
  )
}
