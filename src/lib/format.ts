import type { AgreementStatus, AppUser, UserRole } from './types'

/** YYYY年MM月DD日 */
export function formatJaDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}年${mm}月${dd}日`
}

export function fullName(user: Pick<AppUser, 'lastname' | 'firstname'> | null | undefined): string {
  return user ? `${user.lastname} ${user.firstname}` : '-'
}

export const statusLabel: Record<AgreementStatus, string> = {
  awaiting_signature: '署名待ち',
  signed: '署名済み',
}

export const roleLabel: Record<UserRole, string> = {
  admin: '管理者',
  user: '一般ユーザー',
}
