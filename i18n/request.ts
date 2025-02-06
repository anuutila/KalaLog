import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';
 
export default getRequestConfig(async () => {
  const localeCookie = (await cookies()).get('KALALOG_LOCALE')?.value || 'fi';
  const locale = localeCookie;
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});