import type { DispatchResult, Action } from '../../schemas/actions';
import { logger } from '../../utils/logger';

type LogAction = Extract<Action, { type: 'log' }>;

export async function handleLog(
  action: LogAction
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