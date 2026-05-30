import { useEffect, useState } from 'react';
import {
  PREVIEW_DASHBOARD_HEIGHT,
  PREVIEW_DASHBOARD_WIDTH,
  PREVIEW_MOBILE_PADDING,
  PREVIEW_MOBILE_PILL_RESERVE,
} from '../lib/previewConstants';

const DESKTOP_PADDING = 24;
const DESKTOP_PILL_RESERVE = 60;

/**
 * Computes the scale (0-100) that fits the dashboard into the container.
 * Works for both desktop and mobile variants.
 */
export function useMobilePreviewScale(
  containerRef: React.RefObject<HTMLElement | null>,
  isMobile: boolean,
): number {
  const [scale, setScale] = useState(isMobile ? 50 : 80);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const padding = isMobile ? PREVIEW_MOBILE_PADDING : DESKTOP_PADDING;
    const pillReserve = isMobile ? PREVIEW_MOBILE_PILL_RESERVE : DESKTOP_PILL_RESERVE;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const availableW = Math.max(0, width - padding * 2);
      const availableH = Math.max(0, height - padding * 2 - pillReserve);
      const scaleW = availableW / PREVIEW_DASHBOARD_WIDTH;
      const scaleH = availableH / PREVIEW_DASHBOARD_HEIGHT;
      const fit = Math.min(scaleW, scaleH, 1) * 100;
      const min = isMobile ? 20 : 25;
      setScale(Math.max(min, Math.min(100, Math.floor(fit))));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isMobile, containerRef]);

  return scale;
}
