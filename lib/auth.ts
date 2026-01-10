export async function getCurrentUser() {
  return { id: 'user_1', email: 'user@example.com', role: 'customer' }
}

type MaybeUser = { role?: string } | null | undefined

export function requireRole(role: string, user: MaybeUser) {
  return (user as MaybeUser)?.role === role
}
