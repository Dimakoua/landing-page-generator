import type { DispatchResult, Action } from '../../schemas/actions';
import { logger } from '../../utils/logger';

type IframeAction = Extract<Action, { type: 'iframe' }>;

export async function handleIframe(
  action: IframeAction
): Promise<DispatchResult> {
  try {
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.src = action.src;
    if (action.width !== undefined) iframe.width = String(action.width);
    if (action.height !== undefined) iframe.height = String(action.height);

    // Security: sandbox iframe by default to limit capabilities (no access to parent/origin)
    // - preserves tracking for many providers while preventing DOM access/exfiltration
    // - tests remain compatible since they don't rely on sandbox behavior
    try {
      // Prefer setting attribute for broad compatibility in test envs
      iframe.setAttribute('sandbox', 'allow-scripts');
    } catch {
      // ignore if sandbox isn't supported in environment
    }

    // Reduce referrer leakage
    iframe.referrerPolicy = 'no-referrer';
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