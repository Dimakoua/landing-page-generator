import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface HeatmapData {
  clicks: Array<{
    x: number;
    y: number;
    element: string;
    timestamp: number;
    page: string;
  }>;
  scrollDepth: {
    maxDepth: number;
    timeToDepth: Record<number, number>;
    totalScrollTime: number;
  };
  attention: Array<{
    element: string;
    timeSpent: number;
    visibleTime: number;
    interactions: number;
  }>;
}

interface HeatmapRecorderProps {
  // Configuration
  enabled?: boolean;
  trackClicks?: boolean;
  trackScroll?: boolean;
  trackAttention?: boolean;
  sampleRate?: number; // 0-1, percentage of users to track

  // Data handling
  onDataCollected?: (data: HeatmapData) => void;
  autoSend?: boolean;
  sendInterval?: number; // milliseconds

  // Analytics integration
  analyticsProvider?: 'google_analytics' | 'custom';
  customEndpoint?: string;

  // Action dispatching
  dispatcher?: ActionDispatcher;
  collectAction?: Action; // Action to dispatch when collecting data

  // Filtering
  excludeSelectors?: string[]; // CSS selectors to exclude from tracking
  includeSelectors?: string[]; // CSS selectors to include (if specified, only these are tracked)

  // Privacy
  anonymize?: boolean;
  respectDNT?: boolean; // Respect Do Not Track
}

const HeatmapRecorder: React.FC<HeatmapRecorderProps> = ({
  enabled = true,
  trackClicks = true,
  trackScroll = true,
  trackAttention = true,
  sampleRate = 1.0,
  onDataCollected,
  autoSend = true,
  sendInterval = 30000, // 30 seconds
  analyticsProvider,
  customEndpoint,
  dispatcher,
  collectAction,
  excludeSelectors = [],
  includeSelectors = [],
  anonymize = false,
  respectDNT = true,
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({
    clicks: [],
    scrollDepth: {
      maxDepth: 0,
      timeToDepth: {},
      totalScrollTime: 0,
    },
    attention: [],
  });

  // Keep a ref to the latest heatmap data so event handlers (which may
  // be called outside React's render cycle) can read the most recent
  // values. Use a wrapper to update both state and ref together.
  const heatmapDataRef = useRef<HeatmapData>(heatmapData);
  const setHeatmapDataRef = (updater: React.SetStateAction<HeatmapData>) => {
    setHeatmapData(prev => {
      const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
      heatmapDataRef.current = next;
      return next;
    });
  };

  const sessionStartTime = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);
  const scrollDepths = useRef<Set<number>>(new Set());
  const attentionElements = useRef<Map<Element, { startTime: number; totalTime: number; interactions: number }>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Check if tracking should be enabled (stable decision for component lifecycle)
  const [shouldTrack] = useState(() => 
    enabled &&
    (!respectDNT || !navigator.doNotTrack || navigator.doNotTrack !== '1') &&
    Math.random() < sampleRate
  );

  // Initialize timestamps once mounted
  useEffect(() => {
    const now = Date.now();
    sessionStartTime.current = now;
    lastScrollTime.current = now;
  }, []);

  // Utility functions
  const shouldTrackElement = useCallback((element: Element): boolean => {
    if (!element) return false;

    // Check include selectors (if specified, only these elements)
    if (includeSelectors.length > 0) {
      return includeSelectors.some(selector => element.matches(selector));
    }

    // Check exclude selectors
    if (excludeSelectors.some(selector => element.matches(selector))) {
      return false;
    }

    // Default: track interactive elements
    return ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'VIDEO', 'AUDIO'].includes(element.tagName) ||
           element.hasAttribute('onclick') ||
           element.getAttribute('role') === 'button';
  }, [includeSelectors, excludeSelectors]);

  const getElementInfo = useCallback((element: Element): string => {
    if (anonymize) {
      return element.tagName.toLowerCase();
    }

    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const text = element.textContent?.slice(0, 50).trim() || '';
    return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ''}`;
  }, [anonymize]);

  // Click tracking
  useEffect(() => {
    if (!shouldTrack || !trackClicks) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!shouldTrackElement(target)) return;

      const clickData = {
        x: event.clientX,
        y: event.clientY,
        element: getElementInfo(target),
        timestamp: Date.now(),
        page: window.location.pathname,
      };

      setHeatmapDataRef(prev => ({
        ...prev,
        clicks: [...prev.clicks, clickData],
      }));

      // Track attention for clicked elements
      if (trackAttention) {
        const existing = attentionElements.current.get(target);
        if (existing) {
          existing.interactions++;
        } else {
          attentionElements.current.set(target, {
            startTime: Date.now(),
            totalTime: 0,
            interactions: 1,
          });
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [shouldTrack, trackClicks, trackAttention, getElementInfo, shouldTrackElement]);

  // Scroll tracking
  useEffect(() => {
    if (!shouldTrack || !trackScroll) return;

    const handleScroll = () => {
      const now = Date.now();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const windowHeight = window.innerHeight;
      const maxScroll = documentHeight - windowHeight;
      const scrollPercentage = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 0;

      // Track scroll depth milestones
      for (let i = 10; i <= 100; i += 10) {
        if (scrollPercentage >= i && !scrollDepths.current.has(i)) {
          scrollDepths.current.add(i);
          setHeatmapDataRef(prev => ({
            ...prev,
            scrollDepth: {
              ...prev.scrollDepth,
              timeToDepth: {
                ...prev.scrollDepth.timeToDepth,
                [i]: now - sessionStartTime.current,
              },
            },
          }));
        }
      }

      // Update max depth
      if (scrollPercentage > heatmapDataRef.current.scrollDepth.maxDepth) {
        setHeatmapDataRef(prev => ({
          ...prev,
          scrollDepth: {
            ...prev.scrollDepth,
            maxDepth: scrollPercentage,
          },
        }));
      }

      // Track scroll time
      setHeatmapDataRef(prev => ({
        ...prev,
        scrollDepth: {
          ...prev.scrollDepth,
          totalScrollTime: prev.scrollDepth.totalScrollTime + (now - lastScrollTime.current),
        },
      }));

      lastScrollTime.current = now;
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [shouldTrack, trackScroll]);

  // Attention tracking with Intersection Observer
  useEffect(() => {
    if (!shouldTrack || !trackAttention) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const now = Date.now();

          if (entry.isIntersecting) {
            // Element became visible
            if (!attentionElements.current.has(element)) {
              attentionElements.current.set(element, {
                startTime: now,
                totalTime: 0,
                interactions: 0,
              });
            }
          } else {
            // Element became hidden
            const data = attentionElements.current.get(element);
            if (data) {
              data.totalTime += now - data.startTime;
            }
          }
        });
      },
      {
        threshold: 0.5, // Consider visible when 50% in viewport
        rootMargin: '0px',
      }
    );

    // Observe trackable elements
    const observeElements = () => {
      document.querySelectorAll('*').forEach((element) => {
        if (shouldTrackElement(element)) {
          intersectionObserver.current?.observe(element);
        }
      });
    };

    // Initial observation
    observeElements();

    // Re-observe on DOM changes (for dynamic content)
    const observer = new MutationObserver(observeElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver.current?.disconnect();
      observer.disconnect();
    };
  }, [shouldTrack, trackAttention, shouldTrackElement]);

  // Data collection and sending
  const collectData = useCallback(() => {
    // Finalize attention data
    const attentionData: HeatmapData['attention'] = [];
    attentionElements.current.forEach((data, element) => {
      const now = Date.now();
      const finalTime = data.totalTime + (now - data.startTime);

      attentionData.push({
        element: getElementInfo(element),
        timeSpent: finalTime,
        visibleTime: finalTime,
        interactions: data.interactions,
      });
    });

    const finalData: HeatmapData = {
      ...heatmapDataRef.current,
      attention: attentionData,
    };

    // Call custom handler
    if (onDataCollected) {
      onDataCollected(finalData);
    }

    // Send to analytics provider
    if (analyticsProvider === 'google_analytics' && window.gtag) {
      window.gtag('event', 'heatmap_data', {
        custom_map: {
          clicks: finalData.clicks.length,
          max_scroll_depth: finalData.scrollDepth.maxDepth,
          attention_elements: finalData.attention.length,
        },
      });
    } else if (customEndpoint) {
      fetch(customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      }).catch(err => console.warn('Failed to send heatmap data:', err));
    }

    // Dispatch action if configured
    if (dispatcher && collectAction) {
      dispatcher.dispatch(collectAction).catch(err =>
        console.warn('Failed to dispatch collect action:', err)
      );
    }

    return finalData;
  }, [getElementInfo, onDataCollected, analyticsProvider, customEndpoint, dispatcher, collectAction]);

  // Auto-send data at intervals
  useEffect(() => {
    if (!shouldTrack || !autoSend) return;

    const interval = setInterval(collectData, sendInterval);
    return () => clearInterval(interval);
  }, [shouldTrack, autoSend, sendInterval, collectData]);

  // Send data on page unload
  useEffect(() => {
    if (!shouldTrack) return;

    const handleUnload = () => {
      collectData();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [shouldTrack, collectData]);

  // This component doesn't render anything visible
  return null;
};

/**
 * Utility function for throttling
 */
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

// Type declaration for gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default HeatmapRecorder;