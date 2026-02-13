import { describe, it, expect } from 'vitest';
import { handleCustomHtml } from '@/engine/actions/CustomHtmlAction';

describe('CustomHtmlAction sanitization', () => {
  it('removes <script> tags and inline event handlers from body HTML', async () => {
    document.body.innerHTML = '';

    const action = {
      type: 'customHtml' as const,
      html: '<div onclick="alert(1)"><script>window.hax=1</script><p>Safe</p></div>',
      target: 'body' as const,
      position: 'append' as const
    };

    await handleCustomHtml(action as any);

    const body = document.body.innerHTML;
    expect(body).toContain('<p>Safe</p>');
    // script and onclick should be removed by sanitizer
    expect(body).not.toContain('script');
    expect(body).not.toContain('onclick');
  });

  it('allows <meta> tags when injecting into <head>', async () => {
    document.head.innerHTML = '';

    const action = {
      type: 'customHtml' as const,
      html: '<meta name="x-test" content="1">',
      target: 'head' as const,
      position: 'append' as const
    };

    await handleCustomHtml(action as any);

    expect(document.head.innerHTML).toContain('<meta name="x-test" content="1">');
  });
});