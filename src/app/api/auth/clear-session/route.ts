import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Route Handler para limpiar cookies de sesión.
 * Los cookies solo se pueden modificar en Route Handlers o Server Actions.
 */
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('olevium_access_token');
  cookieStore.delete('olevium_refresh_token');
  redirect('/auth');
}
