import type { DispatchResult, Action } from '../../schemas/actions';
import { logger } from '../../utils/logger';

type PixelAction = Extract<Action, { type: 'pixel' }>;

export async function handlePixel(
  action: PixelAction
): Promise<DispatchResult> {
  try {
    // Build pixel URL with parameters
    let pixelUrl = action.url;
    if (action.params) {
      const params = new URLSearchParams(action.params);
      pixelUrl += (pixelUrl.includes('?') ? '&' : '?') + params.toString();
    }

    if (action.async) {
      // Fire pixel asynchronously (fire-and-forget)
      const img = new Image();
      img.src = pixelUrl;
      img.style.display = 'none';

      // Add to DOM temporarily to ensure it loads
      document.body.appendChild(img);

      // Remove after a short delay to avoid cluttering DOM
      setTimeout(() => {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      }, 1000);

      logger.info(`[Pixel] Fired async pixel: ${pixelUrl}`);
    } else {
      // Fire pixel synchronously
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (img.parentNode) {
            img.parentNode.removeChild(img);
          }
          resolve();
        };
        img.onerror = () => {
          if (img.parentNode) {
            img.parentNode.removeChild(img);
          }
          reject(new Error('Pixel failed to load'));
        };
        img.src = pixelUrl;
        img.style.display = 'none';
        document.body.appendChild(img);
      });

      logger.info(`[Pixel] Fired sync pixel: ${pixelUrl}`);
    }

    return { success: true };
  } catch (error) {
    logger.warn('[Pixel] Failed to fire pixel:', error);
    // Pixel failures shouldn't break the user flow
    return { success: true };
  }
}