import { z } from 'zod';
import { RedirectActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';

export async function handleRedirect(
  action: z.infer<typeof RedirectActionSchema>
): Promise<DispatchResult> {
  try {
    if (action.target === '_blank') {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action.url;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}