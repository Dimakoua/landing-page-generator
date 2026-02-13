import { z } from 'zod';
import { LogActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleLog(
  action: z.infer<typeof LogActionSchema>
): Promise<DispatchResult> {
  try {
    switch (action.level) {
      case 'info':
        logger.info(action.message, action.data);
        break;
      case 'warn':
        logger.warn(action.message, action.data);
        break;
      case 'error':
        logger.error(action.message, action.data);
        break;
      case 'debug':
        logger.debug(action.message, action.data);
        break;
    }

    // Emit log event
    await globalEventBus.emit(EVENT_TYPES.LOG_EVENT, {
      type: EVENT_TYPES.LOG_EVENT,
      level: action.level,
      message: action.message,
      data: action.data,
      source: 'LogAction',
    });

    return { success: true };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'log',
      error: (error as Error).message,
      component: 'LogAction',
    });

    return { success: false, error: error as Error };
  }
}