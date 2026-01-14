import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'smartscore_admin_token'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin888'

export async function setAdminSession() {
  const cookieStore = await cookies()
  // Set cookie for 1 day
  cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)
  const isAuthenticated = token?.value === 'authenticated'
  console.log(`[AdminAuth] Check: ${isAuthenticated ? 'PASS' : 'FAIL'} (Token: ${token?.value})`)
  return isAuthenticated
}
