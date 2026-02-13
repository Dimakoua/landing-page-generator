import { z } from 'zod';
import { CustomHtmlActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

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

          // Emit HTML removed event
          globalEventBus.emit(EVENT_TYPES.HTML_REMOVED, {
            type: EVENT_TYPES.HTML_REMOVED,
            id: action.id,
            target: action.target,
            source: 'CustomHtmlAction',
          }).catch(err => logger.warn('[CustomHtml] Failed to emit removal event:', err));
        }
      }, action.removeAfter);
    }

    logger.info(`[CustomHtml] Rendered custom HTML to ${action.target} (${action.position})`);

    // Emit HTML rendered event
    await globalEventBus.emit(EVENT_TYPES.HTML_RENDERED, {
      type: EVENT_TYPES.HTML_RENDERED,
      id: action.id,
      target: action.target,
      position: action.position,
      removeAfter: action.removeAfter,
      source: 'CustomHtmlAction',
    });

    return { success: true };
  } catch (error) {
    logger.warn('[CustomHtml] Failed to render custom HTML:', error);

    // Emit HTML error event
    await globalEventBus.emit(EVENT_TYPES.HTML_ERROR, {
      type: EVENT_TYPES.HTML_ERROR,
      id: action.id,
      target: action.target,
      error: (error as Error).message,
      source: 'CustomHtmlAction',
    });

    // HTML rendering failures shouldn't break the user flow
    return { success: true };
  }
}