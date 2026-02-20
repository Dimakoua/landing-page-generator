import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import HeatmapRecorder from '@/components/heatmaprecorder/HeatmapRecorder';
import type { Action } from '@/schemas/actions';

// Mock IntersectionObserver
const MockIntersectionObserver = vi.fn().mockImplementation(function(this: any) {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
  this.unobserve = vi.fn();
  return this;
});

global.IntersectionObserver = MockIntersectionObserver;

// Mock MutationObserver
const MockMutationObserver = vi.fn().mockImplementation(function(this: any) {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
  return this;
});

global.MutationObserver = MockMutationObserver;

// Mock gtag
const mockGtag = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

describe('HeatmapRecorder Component', () => {
  const safeRender = (ui: React.ReactElement) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(ui);
    });
    return result!;
  }
  const mockDispatcher = {
    dispatch: vi.fn().mockResolvedValue({ success: true }),
  } as any;

  const defaultProps = {
    dispatcher: mockDispatcher,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random to always return 0.5 (within sample rate)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    // Mock navigator.doNotTrack
    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders nothing visible', () => {
    const { container } = safeRender(<HeatmapRecorder {...defaultProps} />) as any;
    expect(container.firstChild).toBeNull();
  });

  it('respects enabled prop', () => {
    safeRender(<HeatmapRecorder {...defaultProps} enabled={false} />);
    // Should not set up any event listeners when disabled
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('respects Do Not Track setting', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      writable: true,
    });

    safeRender(<HeatmapRecorder {...defaultProps} respectDNT={true} />);
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('ignores Do Not Track when respectDNT is false', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      writable: true,
    });

    safeRender(<HeatmapRecorder {...defaultProps} respectDNT={false} />);
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it('respects sample rate', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Above sample rate of 0.1

    safeRender(<HeatmapRecorder {...defaultProps} sampleRate={0.1} />);
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  describe('Click Tracking', () => {
    it('tracks clicks on interactive elements', async () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          trackClicks={true}
          onDataCollected={onDataCollected}
          autoSend={false}
        />
      );

      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);

      fireEvent.click(button, { clientX: 100, clientY: 200 });

      // Wait a microtask so React state updates from the click are applied
      await Promise.resolve();

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      // Handler runs synchronously on beforeunload; assert directly
      expect(onDataCollected).toHaveBeenCalled();
      const data = onDataCollected.mock.calls[0][0];
      expect(data.clicks).toHaveLength(1);
      expect(data.clicks[0]).toMatchObject({
        x: 100,
        y: 200,
        element: expect.stringContaining('button'),
      });

      document.body.removeChild(button);
    });

    it('excludes elements matching excludeSelectors', () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          trackClicks={true}
          onDataCollected={onDataCollected}
          excludeSelectors={['.exclude-me']}
          autoSend={false}
        />
      );

      const button = document.createElement('button');
      button.className = 'exclude-me';
      document.body.appendChild(button);

      fireEvent.click(button);

      // Should not track excluded elements
      expect(onDataCollected).not.toHaveBeenCalled();

      document.body.removeChild(button);
    });

    it('only includes elements matching includeSelectors when specified', async () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          trackClicks={true}
          onDataCollected={onDataCollected}
          includeSelectors={['.include-me']}
          autoSend={false}
        />
      );

      const includedButton = document.createElement('button');
      includedButton.className = 'include-me';
      const excludedButton = document.createElement('button');
      excludedButton.className = 'exclude-me';

      document.body.appendChild(includedButton);
      document.body.appendChild(excludedButton);

      fireEvent.click(includedButton);
      fireEvent.click(excludedButton);

      // Wait for state update from clicks
      await Promise.resolve();

      // Should only track included elements
      fireEvent(window, new Event('beforeunload'));

      expect(onDataCollected).toHaveBeenCalled();
      const dataIncluded = onDataCollected.mock.calls[0][0];
      expect(dataIncluded.clicks).toHaveLength(1);

      document.body.removeChild(includedButton);
      document.body.removeChild(excludedButton);
    });
  });

  describe('Scroll Tracking', () => {
    it('tracks scroll depth milestones', async () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          trackScroll={true}
          onDataCollected={onDataCollected}
          autoSend={false}
        />
      );

      // Mock document dimensions
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000 });
      Object.defineProperty(document.documentElement, 'clientHeight', { value: 1000 });
      Object.defineProperty(window, 'innerHeight', { value: 1000 });

      // Simulate scrolling to 50%
      Object.defineProperty(window, 'pageYOffset', { value: 500 });
      fireEvent.scroll(window);

      // Wait for scroll handler state update
      await Promise.resolve();

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(onDataCollected).toHaveBeenCalled();
      const scrollData = onDataCollected.mock.calls[0][0];
      expect(scrollData.scrollDepth.maxDepth).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Attention Tracking', () => {
    it('tracks element visibility with IntersectionObserver', () => {
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          trackAttention={true}
        />
      );

      expect(global.IntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Data Collection', () => {
    it('calls onDataCollected callback', async () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          onDataCollected={onDataCollected}
          autoSend={false}
        />
      );

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(onDataCollected).toHaveBeenCalled();
      const combined = onDataCollected.mock.calls[0][0];
      expect(combined).toHaveProperty('clicks');
      expect(combined).toHaveProperty('scrollDepth');
      expect(combined).toHaveProperty('attention');
    });

    it('sends data to Google Analytics when configured', async () => {
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          analyticsProvider="google_analytics"
          autoSend={false}
        />
      );

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(mockGtag).toHaveBeenCalledWith('event', 'heatmap_data', expect.any(Object));
    });

    it('sends data to custom endpoint', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);

      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          customEndpoint="/api/heatmap"
          autoSend={false}
        />
      );

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(mockFetch).toHaveBeenCalledWith('/api/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
    });

    it('dispatches collect action when configured', async () => {
      const collectAction: Action = { type: 'analytics', event: 'heatmap_data' };

      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          collectAction={collectAction}
          autoSend={false}
        />
      );

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(collectAction);
    });
  });

  describe('Privacy Features', () => {
    it('anonymizes element information when enabled', async () => {
      const onDataCollected = vi.fn();
      safeRender(
        <HeatmapRecorder
          {...defaultProps}
          anonymize={true}
          onDataCollected={onDataCollected}
          autoSend={false}
        />
      );

      const button = document.createElement('button');
      button.id = 'my-button';
      button.className = 'btn primary';
      button.textContent = 'Click me';
      document.body.appendChild(button);

      fireEvent.click(button);

      // Wait for click state update
      await Promise.resolve();

      // Trigger data collection
      fireEvent(window, new Event('beforeunload'));

      expect(onDataCollected).toHaveBeenCalled();
      const anonymized = onDataCollected.mock.calls[0][0];
      expect(anonymized.clicks[0].element).toBe('button'); // Should be anonymized

      document.body.removeChild(button);
    });

    describe('Auto-send Functionality', () => {
      it('sends data at configured intervals', () => {
        const onDataCollected = vi.fn();
        vi.useFakeTimers();
safeRender(
          <HeatmapRecorder
            dispatcher={mockDispatcher}
            onDataCollected={onDataCollected}
            autoSend={true}
            sendInterval={1000}
          />
        );

        // Fast-forward time
        vi.advanceTimersByTime(1000);

        expect(onDataCollected).toHaveBeenCalled();
        vi.useRealTimers();
      });
    });
  });

});
