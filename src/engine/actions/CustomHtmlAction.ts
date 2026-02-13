import { z } from 'zod';
import DOMPurify from 'dompurify';
import { CustomHtmlActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { logger } from '../../utils/logger';

export async function handleCustomHtml(
  action: z.infer<typeof CustomHtmlActionSchema>
): Promise<DispatchResult> {
  try {
    // Sanitize incoming HTML. Be conservative for `body` but allow head-specific tags
    const sanitizeOpts: DOMPurify.Config = {};

    if (action.target === 'head') {
      // Allow metadata and link tags when injecting into <head>
      sanitizeOpts.ADD_TAGS = ['meta', 'link', 'style'];
      sanitizeOpts.ADD_ATTR = ['name', 'content', 'rel', 'href', 'type'];
    }

    const safeHtml = DOMPurify.sanitize(action.html, sanitizeOpts);

    // If injecting into <head>, handle head-specific tags (meta, link, style) safely
    if (action.target === 'head') {
      const tmp = document.createElement('template');
      tmp.innerHTML = action.html;
      const allowedHeadTags = ['meta', 'link', 'style'];
      let appended = false;

      Array.from(tmp.content.children).forEach(node => {
        const tag = node.nodeName.toLowerCase();
        if (!allowedHeadTags.includes(tag)) return; // ignore unexpected head children

        if (tag === 'style') {
          // Sanitize CSS content to remove any <script> like injections (defensive)
          const safeCss = DOMPurify.sanitize(node.textContent || '', { FORBID_TAGS: ['script'] });
          const styleEl = document.createElement('style');
          if (action.id) styleEl.id = action.id;
          styleEl.textContent = safeCss;
          document.head.appendChild(styleEl);
          appended = true;
          return;
        }

        // meta / link handling — copy only safe attributes
        const safeEl = document.createElement(tag);
        for (const attr of node.getAttributeNames()) {
          const val = node.getAttribute(attr) || '';
          if (tag === 'meta' && ['name', 'content', 'charset', 'property'].includes(attr)) {
            safeEl.setAttribute(attr, val);
          }
          if (tag === 'link' && ['rel', 'href', 'type', 'as'].includes(attr)) {
            safeEl.setAttribute(attr, val);
          }
        }
        document.head.appendChild(safeEl);
        appended = true;
      });

      if (appended) {
        logger.info(`[CustomHtml] Rendered ${action.html.length} chars into head`);
        return { success: true };
      }

      // If nothing matched as head-safe tags, fall through to container injection below (sanitized)
    }

    // Create container element and insert sanitized HTML for body or fallback
    const container = document.createElement('div');
    container.innerHTML = safeHtml;

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