export type UserRole = 'admin' | 'user'
export type AgreementStatus = 'awaiting_signature' | 'signed'

export interface AppUser {
  id: string
  email: string
  firstname: string
  lastname: string
  address: string | null
  role: UserRole
  created_at: string
}

export interface Template {
  id: string
  title: string
  file: string
  created_at: string
}

export interface Agreement {
  id: string
  title: string
  status: AgreementStatus
  user_id: string
  template_id: string
  file: string | null
  created_user_id: string
  created_at: string
}

export interface AgreementWithRelations extends Agreement {
  signer: AppUser | null
  creator: AppUser | null
  template: Template | null
}

export const AGREEMENT_SELECT =
  '*, signer:users!agreements_user_id_fkey(*), creator:users!agreements_created_user_id_fkey(*), template:templates(*)'
