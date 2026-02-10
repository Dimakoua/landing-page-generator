import { z } from 'zod';
import { LogActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';

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
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}