import type { DispatchResult, Action, ActionContext } from '../../schemas/actions';
import { logger } from '../../utils/logger';

type ApiAction = Extract<Action, { type: 'post' } | { type: 'get' } | { type: 'put' } | { type: 'patch' } | { type: 'delete' }>;

export async function handleApi(
  action: ApiAction,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>,
  abortControllers: Map<string, AbortController>
): Promise<DispatchResult> {
  const executeRequest = async (attempt: number): Promise<DispatchResult> => {
    const abortController = new AbortController();
    const requestId = `${action.type}-${action.url}-${Date.now()}`;
    abortControllers.set(requestId, abortController);

    try {
      const timeoutId = setTimeout(() => abortController.abort(), action.timeout);

      const options: RequestInit = {
        method: action.type.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...action.headers,
        },
        signal: abortController.signal,
      };

      // Add body for methods that support it
      if (['post', 'put', 'patch'].includes(action.type) && action.payload) {
        options.body = JSON.stringify(action.payload);
      }

      // Add query params for GET requests
      let url = action.url;
      if (action.type === 'get' && action.payload) {
        const params = new URLSearchParams(action.payload as Record<string, string>);
        url = `${url}?${params.toString()}`;
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      abortControllers.delete(requestId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json().catch(() => null);

      // Store response in state only if stateKey is provided
      if (action.stateKey && context.setState && data) {
        context.setState(action.stateKey, data, false);
      }

      // Execute success action if defined
      if (action.onSuccess) {
        await dispatch(action.onSuccess);
      }

      return { success: true, data };
    } catch (error) {
      abortControllers.delete(requestId);

      // Retry logic
      const maxRetries = action.retries ?? 0;
      if (attempt < maxRetries && error instanceof Error && error.name !== 'AbortError') {
        logger.warn(`[ActionDispatcher] API retry ${attempt + 1}/${maxRetries}`, action.url);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
        return executeRequest(attempt + 1);
      }

      // Store error in state only if errorStateKey is provided
      if (action.errorStateKey && context.setState) {
        context.setState(action.errorStateKey, { 
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }, false);
      }

      // Execute error action if defined
      if (action.onError) {
        await dispatch(action.onError);
      }

      return { success: false, error: error as Error };
    }
  };

  return executeRequest(0);
}