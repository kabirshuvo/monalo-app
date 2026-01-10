export async function getCurrentUser() {
  return { id: 'user_1', email: 'user@example.com', role: 'customer' }
}

export function requireRole(role: string, user: any) {
  return user?.role === role
}
