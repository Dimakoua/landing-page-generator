import { z } from 'zod';
import { IframeActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';

export async function handleIframe(
  action: z.infer<typeof IframeActionSchema>
): Promise<DispatchResult> {
  try {
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.src = action.src;
    iframe.width = action.width;
    iframe.height = action.height;
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    // Apply additional styles if provided
    if (action.style) {
      iframe.style.cssText += action.style;
    }

    // Set ID if provided
    if (action.id) {
      iframe.id = action.id;
    }

    // Add to DOM
    document.body.appendChild(iframe);

    // Set up load/error handlers
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        reject(new Error('Iframe load timeout'));
      }, 10000); // 10 second timeout

      iframe.onload = () => {
        clearTimeout(timeout);
        logger.info(`[Iframe] Loaded iframe: ${action.src}`);
        resolve();
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        reject(new Error('Iframe failed to load'));
      };
    });

    // Keep iframe in DOM for tracking purposes, but hide it completely
    // Some tracking iframes need to remain loaded
    iframe.style.display = 'none';

    return { success: true };
  } catch (error) {
    logger.warn('[Iframe] Failed to load iframe:', error);
    // Iframe failures shouldn't break the user flow
    return { success: true };
  }
}