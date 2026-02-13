import { describe, it, expect } from 'vitest';
import {
  EventSchema,
  StateUpdatedEventSchema,
  NavigateEventSchema,
  ApiSuccessEventSchema,
  CartUpdatedEventSchema,
} from '../../schemas/events';
import { EVENT_TYPES } from '../../engine/events/types';

describe('Event Schemas', () => {
  describe('StateUpdatedEvent', () => {
    it('should validate a valid state updated event', () => {
      const event = {
        type: EVENT_TYPES.STATE_UPDATED,
        key: 'user.name',
        value: 'John Doe',
        previousValue: 'Jane Doe',
        source: 'UserProfile',
      };

      const result = StateUpdatedEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.key).toBe('user.name');
        expect(result.data.value).toBe('John Doe');
      }
    });

    it('should require type and key', () => {
      const invalidEvent = {
        value: 'test',
      };

      const result = StateUpdatedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('NavigateEvent', () => {
    it('should validate a valid navigation event', () => {
      const event = {
        type: EVENT_TYPES.NAVIGATE,
        url: '/checkout',
        replace: false,
        source: 'HeroCTA',
      };

      const result = NavigateEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe('/checkout');
        expect(result.data.replace).toBe(false);
      }
    });
  });

  describe('ApiSuccessEvent', () => {
    it('should validate a valid API success event', () => {
      const event = {
        type: EVENT_TYPES.API_SUCCESS,
        url: '/api/submit',
        method: 'POST',
        response: { success: true, orderId: '123' },
        duration: 250,
      };

      const result = ApiSuccessEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.method).toBe('POST');
        expect(result.data.duration).toBe(250);
      }
    });
  });

  describe('CartUpdatedEvent', () => {
    it('should validate a valid cart updated event', () => {
      const event = {
        type: EVENT_TYPES.CART_UPDATED,
        items: [
          { id: '1', name: 'Product A', quantity: 2 },
          { id: '2', name: 'Product B', quantity: 1 },
        ],
        total: 99.99,
        source: 'AddToCart',
      };

      const result = CartUpdatedEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.total).toBe(99.99);
      }
    });
  });

  describe('EventSchema discriminated union', () => {
    it('should validate different event types through the union', () => {
      const events = [
        {
          type: EVENT_TYPES.STATE_UPDATED,
          key: 'test',
          value: 'value',
        },
        {
          type: EVENT_TYPES.NAVIGATE,
          url: '/test',
        },
        {
          type: EVENT_TYPES.API_SUCCESS,
          url: '/api/test',
          method: 'GET',
        },
        {
          type: EVENT_TYPES.CART_UPDATED,
          items: [],
        },
      ];

      events.forEach(event => {
        const result = EventSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid event types', () => {
      const invalidEvent = {
        type: 'INVALID_TYPE',
        key: 'test',
      };

      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject events missing required fields', () => {
      const invalidEvent = {
        type: EVENT_TYPES.STATE_UPDATED,
        // missing key and value
      };

      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('EVENT_TYPES constants', () => {
    it('should have all expected event type constants', () => {
      expect(EVENT_TYPES.STATE_UPDATED).toBe('STATE_UPDATED');
      expect(EVENT_TYPES.NAVIGATE).toBe('NAVIGATE');
      expect(EVENT_TYPES.API_SUCCESS).toBe('API_SUCCESS');
      expect(EVENT_TYPES.CART_UPDATED).toBe('CART_UPDATED');
      expect(EVENT_TYPES.ERROR).toBe('ERROR');
    });

    it('should have the correct number of event types', () => {
      // Count the properties in EVENT_TYPES
      const eventTypeCount = Object.keys(EVENT_TYPES).length;
      expect(eventTypeCount).toBeGreaterThan(20); // We added many event types
    });
  });
});