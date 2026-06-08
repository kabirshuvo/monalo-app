import { ROLES, type RoleType } from '@/lib/auth/roles'

/** Roles users can request from their profile (not self-assignable). */
export const APPLIABLE_ROLES = [
  ROLES.GUARDIAN,
  ROLES.SPONSOR,
  ROLES.DONOR,
  ROLES.SELLER,
  ROLES.WRITER,
] as const

export type AppliableRole = (typeof APPLIABLE_ROLES)[number]

export type RoleApplicationOption = {
  role: AppliableRole
  heading: string
  subheading: string
  description: string
}

export const ROLE_APPLICATION_OPTIONS: RoleApplicationOption[] = [
  {
    role: ROLES.GUARDIAN,
    heading: 'Guardian',
    subheading: 'Guide a learner you care about',
    description:
      'Stay connected to a student’s progress, celebrate milestones, and support their learning journey on MonAlo.',
  },
  {
    role: ROLES.SPONSOR,
    heading: 'Sponsor',
    subheading: 'Fund opportunities for learners',
    description:
      'Help cover courses, materials, or programs so more children can learn through MonAlo School.',
  },
  {
    role: ROLES.DONOR,
    heading: 'Donor',
    subheading: 'Give back to the school community',
    description:
      'Support MonAlo’s mission with contributions that keep learning accessible and joyful.',
  },
  {
    role: ROLES.SELLER,
    heading: 'Seller',
    subheading: 'Share crafts in the MonAlo shop',
    description:
      'List handmade products, manage inventory, and fulfill orders from the seller dashboard.',
  },
  {
    role: ROLES.WRITER,
    heading: 'Writer',
    subheading: 'Create stories and learning content',
    description:
      'Publish articles, shape courses, and inspire learners through the writer studio.',
  },
]

/** Roles an admin may assign directly (excludes default visitor role). */
export const ADMIN_ASSIGNABLE_ROLES = [
  ROLES.ADMIN,
  ROLES.CUSTOMER,
  ROLES.LEARNER,
  ROLES.WRITER,
  ROLES.SELLER,
  ROLES.DONOR,
  ROLES.GUARDIAN,
  ROLES.SPONSOR,
] as const satisfies readonly RoleType[]

export function isAppliableRole(value: string): value is AppliableRole {
  return (APPLIABLE_ROLES as readonly string[]).includes(value)
}

export function getRoleApplicationOption(role: AppliableRole): RoleApplicationOption | undefined {
  return ROLE_APPLICATION_OPTIONS.find((option) => option.role === role)
}

export type AdminAssignableRole = (typeof ADMIN_ASSIGNABLE_ROLES)[number]

export function isAdminAssignableRole(value: string): value is AdminAssignableRole {
  return (ADMIN_ASSIGNABLE_ROLES as readonly string[]).includes(value)
}
