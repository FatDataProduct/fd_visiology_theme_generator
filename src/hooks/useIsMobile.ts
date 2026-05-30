import { useEffect, useState } from 'react';
import { getIsMobileViewport, MOBILE_BREAKPOINT } from '../lib/breakpoints';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobileViewport);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
