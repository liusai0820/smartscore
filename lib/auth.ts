import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export const COOKIE_NAME = 'smartscore_user_id'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get(COOKIE_NAME)?.value

  if (!userId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    return null
  }
}

export async function loginUser(userId: string) {
  const cookieStore = await cookies()
  // Set cookie for 1 day
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
