export const Capabilities = {
  READ_POSTS: 'read:posts',
  WRITE_POSTS: 'write:posts',
  MANAGE_USERS: 'manage:users'
} as const

export type Capability = typeof Capabilities[keyof typeof Capabilities]
