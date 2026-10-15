import supabase from '@/lib/supabase'

/**
 * Utilidades para los archivos del bucket `profile` (foto de perfil y CV).
 *
 * Contexto: en la base han circulado tres formatos distintos para el mismo
 * campo, y la ruta /api/profile/get confundia la URL completa con un nombre de
 * archivo, generando URLs duplicadas del tipo
 *   https://<proyecto>.supabase.co/storage/v1/object/public/profile/https://...
 * que dejaban la foto rota y, al guardar el perfil, corrompian el valor
 * almacenado. Estas funciones normalizan cualquier variante a una sola URL.
 */

const BUCKET = 'profile'

/**
 * Extrae el nombre real del archivo de cualquier variante del valor.
 *
 * - nombre suelto:        "abc.png"
 * - URL completa:         "https://…/object/public/profile/abc.png"
 * - URL duplicada (bug):  "https://…/public/profile/https://…/public/profile/abc.png"
 *
 * En las tres formas el ultimo segmento de la ruta es el nombre del archivo.
 */
export function profileFileName(value?: string | null): string | null {
  if (!value) return null
  const clean = value.trim().split('?')[0]
  if (!clean) return null
  const parts = clean.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last || last === BUCKET || /^https?:$/i.test(last)) return null
  return decodeURIComponent(last)
}

/**
 * Devuelve siempre una URL publica canonica del bucket de perfil.
 * Si el valor es una URL externa (no alojada en Supabase) se respeta tal cual.
 */
export function resolveProfileUrl(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) && !trimmed.includes('supabase')) return trimmed
  const name = profileFileName(trimmed)
  if (!name) return null
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
}

/**
 * Construye la URL publica a partir del nombre de archivo devuelto por
 * `supabase.storage.from('profile').upload(...)`.
 */
export function profilePublicUrl(fileName: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl
}
