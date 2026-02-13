import { z } from 'zod';
import { ApiActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';
import { logger } from '../../utils/logger';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleApi(
  action: z.infer<typeof ApiActionSchema>,
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

      // Emit API success event
      await globalEventBus.emit(EVENT_TYPES.API_SUCCESS, {
        type: EVENT_TYPES.API_SUCCESS,
        url: action.url,
        method: action.type.toUpperCase(),
        status: response.status,
        data,
        source: 'ApiAction',
      });

      // Execute success action if defined
      if (action.onSuccess) {
        await dispatch(action.onSuccess);
      }

      return { success: true, data };
    } catch (error) {
      abortControllers.delete(requestId);

      // Emit API error event
      await globalEventBus.emit(EVENT_TYPES.API_ERROR, {
        type: EVENT_TYPES.API_ERROR,
        url: action.url,
        method: action.type.toUpperCase(),
        error: (error as Error).message,
        attempt,
        maxRetries: action.retries ?? 0,
        source: 'ApiAction',
      });

      // Retry logic
      const maxRetries = action.retries ?? 0;
      if (attempt < maxRetries && error instanceof Error && error.name !== 'AbortError') {
        logger.warn(`[ActionDispatcher] API retry ${attempt + 1}/${maxRetries}`, action.url);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
        return executeRequest(attempt + 1);
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