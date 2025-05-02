import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function useHash() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [hash, setHash] = useState(
    typeof window !== 'undefined' ? window.location.hash : ''
  )

  useEffect(() => {
    setHash(window.location.hash)
  }, [pathname, searchParams])

  return hash;
}
