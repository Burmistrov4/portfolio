import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Next.js cachea las peticiones GET que se hacen con fetch dentro del servidor
 * (Data Cache). Sin esto, el portafolio puede seguir mostrando datos viejos
 * despues de editarlos en el panel de administracion.
 *
 * `cache: 'no-store'` obliga a leer Supabase en cada peticion.
 */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' })

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  global: {
    fetch: noStoreFetch,
  },
})

export default supabase
