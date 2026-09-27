import { AGREEMENT_BUCKET, supabase } from './supabase'

/**
 * DB の file 列を実際に取得できる URL に変換する。
 * - http(s):// ... → そのまま
 * - /files/...     → アプリの public 配下
 * - それ以外       → Supabase Storage (agreements バケット) の公開 URL
 */
export function resolveFileUrl(file: string): string {
  if (/^https?:\/\//.test(file)) return file
  if (file.startsWith('/')) return new URL(file, window.location.origin).toString()
  return supabase.storage.from(AGREEMENT_BUCKET).getPublicUrl(file).data.publicUrl
}
