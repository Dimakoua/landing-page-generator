import { z } from 'zod';
import { CustomHtmlActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';

export async function handleCustomHtml(
  action: z.infer<typeof CustomHtmlActionSchema>
): Promise<DispatchResult> {
  try {
    // Create container element
    const container = document.createElement('div');
    container.innerHTML = action.html;

    // Set ID if provided
    if (action.id) {
      container.id = action.id;
    }

    // Determine target element
    const targetElement = action.target === 'head'
      ? document.head
      : document.body;

    // Insert at specified position
    if (action.position === 'prepend') {
      targetElement.insertBefore(container, targetElement.firstChild);
    } else {
      targetElement.appendChild(container);
    }

    // Handle auto-removal if specified
    if (action.removeAfter && action.removeAfter > 0) {
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
          logger.info(`[CustomHtml] Removed HTML after ${action.removeAfter}ms`);
        }
      }, action.removeAfter);
    }

    logger.info(`[CustomHtml] Rendered custom HTML to ${action.target} (${action.position})`);
    return { success: true };
  } catch (error) {
    logger.warn('[CustomHtml] Failed to render custom HTML:', error);
    // HTML rendering failures shouldn't break the user flow
    return { success: true };
  }
}