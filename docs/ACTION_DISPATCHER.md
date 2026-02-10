# Action Dispatcher System

## Overview

The Action Dispatcher is a comprehensive system for handling user interactions, API calls, navigation, analytics, and complex workflows in landing page configurations. It provides a declarative JSON-based way to define actions without writing code.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Component (e.g., SimpleCTA)           │
│  ┌──────────────────────────────────────────┐  │
│  │  User Click → Trigger Action by Name    │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│             ActionDispatcher                    │
│  ┌──────────────────────────────────────────┐  │
│  │  1. Validate action schema (Zod)        │  │
│  │  2. Route to specific handler           │  │
│  │  3. Execute with error handling         │  │
│  │  4. Return DispatchResult               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
  Navigate     API Call   Analytics
```

## Action Types

### 1. Navigate (Internal Navigation)

Navigate to another step in the funnel or a relative URL.

```json
{
  "type": "navigate",
  "url": "/order",
  "replace": false
}
```

**Properties:**
- `url` (string, required): Step ID or relative path (e.g., "/order", "/success")
- `replace` (boolean, optional): Replace history instead of push (default: false)

**Use Cases:**
- Move to next funnel step
- Redirect to confirmation page
- Navigate to error page

---

### 2. Redirect (External URLs)

Redirect to an external URL or open in new tab.

```json
{
  "type": "redirect",
  "url": "https://partner.example.com",
  "target": "_blank"
}
```

**Properties:**
- `url` (string, required): Full external URL (must include protocol)
- `target` (enum, optional): '_self' | '_blank' | '_parent' | '_top' (default: '_self')

**Use Cases:**
- Link to external partner sites
- Open social media profiles
- Redirect to payment gateways

---

### 3. API Actions (GET, POST, PUT, PATCH, DELETE)

Make HTTP requests to APIs with retry logic and timeout handling.

```json
{
  "type": "post",
  "url": "https://api.example.com/v1/leads",
  "payload": {
    "email": "user@example.com",
    "source": "alpha-landing"
  },
  "headers": {
    "X-API-Key": "your-api-key"
  },
  "timeout": 10000,
  "retries": 3,
  "onSuccess": {
    "type": "navigate",
    "url": "/success"
  },
  "onError": {
    "type": "navigate",
    "url": "/error"
  }
}
```

**Properties:**
- `type` (enum, required): 'get' | 'post' | 'put' | 'patch' | 'delete'
- `url` (string, required): Full API endpoint URL
- `payload` (object, optional): Request body (POST/PUT/PATCH) or query params (GET)
- `headers` (object, optional): Custom HTTP headers
- `timeout` (number, optional): Request timeout in milliseconds (default: 10000)
- `retries` (number, optional): Number of retry attempts on failure (0-5, default: 0)
- `onSuccess` (action, optional): Action to execute on successful response (2xx)
- `onError` (action, optional): Action to execute on error response

**Features:**
- ✅ Automatic retry with exponential backoff
- ✅ Request timeout handling
- ✅ Abort controller support
- ✅ JSON body encoding
- ✅ Query parameter serialization for GET

**Use Cases:**
- Submit lead forms
- Check product availability
- Fetch dynamic content
- Track conversions

---

### 4. Analytics (Event Tracking)

Track user events with various analytics providers.

```json
{
  "type": "analytics",
  "event": "cta_clicked",
  "properties": {
    "button": "pre-order",
    "page": "landing-main",
    "campaign": "alpha-launch"
  },
  "provider": "gtag"
}
```

**Properties:**
- `event` (string, required): Event name (e.g., "cta_clicked", "form_submitted")
- `properties` (object, optional): Event metadata/properties
- `provider` (enum, optional): 'gtag' | 'segment' | 'mixpanel' | 'custom' (default: 'gtag')

**Supported Providers:**
- **gtag**: Google Analytics (window.gtag)
- **segment**: Segment.io (window.analytics)
- **mixpanel**: Mixpanel (window.mixpanel)
- **custom**: Context-provided tracker

**Features:**
- ✅ Non-blocking (failures don't stop user flow)
- ✅ Console logging in dev mode
- ✅ Multiple provider support

**Use Cases:**
- Track button clicks
- Monitor form submissions
- Measure conversion events
- A/B test tracking

---

### 5. SetState (State Management)

Update application or funnel state.

```json
{
  "type": "setState",
  "key": "user_preference",
  "value": "premium",
  "merge": true
}
```

**Properties:**
- `key` (string, required): State key to update
- `value` (any, required): Value to set
- `merge` (boolean, optional): Merge with existing object or replace (default: true)

**Use Cases:**
- Store user selections
- Track funnel progress
- Save form data
- Persist preferences

---

### 6. Chain (Sequential Actions)

Execute multiple actions in sequence, one after another.

```json
{
  "type": "chain",
  "stopOnError": true,
  "actions": [
    {
      "type": "analytics",
      "event": "checkout_started"
    },
    {
      "type": "post",
      "url": "https://api.example.com/v1/orders",
      "payload": {}
    },
    {
      "type": "navigate",
      "url": "/success"
    }
  ]
}
```

**Properties:**
- `actions` (array, required): Array of actions to execute in order
- `stopOnError` (boolean, optional): Stop execution if an action fails (default: true)

**Features:**
- ✅ Sequential execution (waits for each to complete)
- ✅ Error propagation control
- ✅ Result aggregation

**Use Cases:**
- Multi-step workflows
- Track → API → Navigate flows
- Conditional sequences
- Complex business logic

---

### 7. Parallel (Concurrent Actions)

Execute multiple actions simultaneously.

```json
{
  "type": "parallel",
  "waitForAll": false,
  "actions": [
    {
      "type": "analytics",
      "event": "page_interaction"
    },
    {
      "type": "post",
      "url": "https://api.example.com/v1/clicks",
      "payload": {}
    }
  ]
}
```

**Properties:**
- `actions` (array, required): Array of actions to execute simultaneously
- `waitForAll` (boolean, optional): Wait for all actions or just first completion (default: false)

**Features:**
- ✅ Concurrent execution (Promise.all or Promise.race)
- ✅ Independent failure handling
- ✅ Performance optimization

**Use Cases:**
- Fire-and-forget analytics
- Multiple API calls
- Parallel data fetching
- Non-blocking operations

---

### 8. Conditional (Logic Branching)

Execute actions based on conditions.

```json
{
  "type": "conditional",
  "condition": "stateEquals",
  "key": "inventory_available",
  "value": true,
  "ifTrue": {
    "type": "navigate",
    "url": "/checkout"
  },
  "ifFalse": {
    "type": "navigate",
    "url": "/waitlist"
  }
}
```

**Properties:**
- `condition` (enum, required): 'stateEquals' | 'stateExists' | 'custom'
- `key` (string, optional): State key to evaluate (required for stateEquals/stateExists)
- `value` (any, optional): Expected value for comparison (required for stateEquals)
- `ifTrue` (action, required): Action to execute if condition passes
- `ifFalse` (action, optional): Action to execute if condition fails

**Condition Types:**
- **stateEquals**: Check if state[key] === value
- **stateExists**: Check if state[key] !== undefined
- **custom**: Extensible for custom logic

**Use Cases:**
- Product availability checks
- User permission gates
- Feature flags
- A/B test routing

---

### 9. Delay (Timed Actions)

Pause execution for a specified duration.

```json
{
  "type": "delay",
  "duration": 2000,
  "then": {
    "type": "redirect",
    "url": "https://example.com"
  }
}
```

**Properties:**
- `duration` (number, required): Delay in milliseconds (0-30000)
- `then` (action, optional): Action to execute after delay

**Use Cases:**
- Smooth transitions
- User feedback delays
- Rate limiting
- Animation timing

---

### 10. Log (Debug/Monitoring)

Log messages to console for debugging.

```json
{
  "type": "log",
  "message": "User clicked pre-order button",
  "level": "info",
  "data": {
    "userId": "12345",
    "timestamp": "2026-02-10"
  }
}
```

**Properties:**
- `message` (string, required): Log message
- `level` (enum, optional): 'info' | 'warn' | 'error' | 'debug' (default: 'info')
- `data` (any, optional): Additional data to log

**Use Cases:**
- Development debugging
- Production monitoring
- Error tracking
- Usage analytics

---

## Usage in Components

### JSON Configuration

Define actions in your layout JSON files:

```json
{
  "sections": [
    {
      "component": "SimpleCTA",
      "props": {
        "text": "Pre-Order Now",
        "action": "approve"
      },
      "actions": {
        "approve": {
          "type": "chain",
          "actions": [
            {
              "type": "analytics",
              "event": "cta_clicked",
              "properties": { "button": "pre-order" }
            },
            {
              "type": "post",
              "url": "https://api.example.com/v1/leads",
              "payload": { "source": "landing" }
            },
            {
              "type": "navigate",
              "url": "/order"
            }
          ]
        },
        "reject": {
          "type": "navigate",
          "url": "/learn-more"
        },
        "default": {
          "type": "navigate",
          "url": "/"
        },
        "onClick": {
          "type": "analytics",
          "event": "button_interaction"
        }
      }
    }
  ]
}
```

### Component Integration

Components automatically receive `dispatcher` and `actions` props:

```tsx
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface MyComponentProps {
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const MyComponent: React.FC<MyComponentProps> = ({ dispatcher, actions }) => {
  const handleClick = async () => {
    if (dispatcher && actions?.approve) {
      const result = await dispatcher.dispatchNamed('approve', actions);
      if (!result.success) {
        console.error('Action failed:', result.error);
      }
    }
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

---

## Error Handling

### Automatic Retry (API Actions)

API actions support automatic retry with exponential backoff:

```json
{
  "type": "post",
  "url": "https://api.example.com/submit",
  "retries": 3,
  "timeout": 5000
}
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: +2 seconds
- Attempt 3: +4 seconds
- Attempt 4: +8 seconds

### Error Actions

Handle failures gracefully with `onError`:

```json
{
  "type": "get",
  "url": "https://api.example.com/data",
  "onSuccess": {
    "type": "navigate",
    "url": "/success"
  },
  "onError": {
    "type": "chain",
    "actions": [
      {
        "type": "log",
        "message": "API call failed",
        "level": "error"
      },
      {
        "type": "navigate",
        "url": "/error"
      }
    ]
  }
}
```

### Result Structure

All actions return a `DispatchResult`:

```typescript
interface DispatchResult {
  success: boolean;   // Whether action succeeded
  data?: unknown;     // Response data (if applicable)
  error?: Error;      // Error object (if failed)
}
```

---

## Best Practices

### 1. Always Track User Actions

```json
{
  "type": "chain",
  "actions": [
    { "type": "analytics", "event": "cta_clicked" },
    { "type": "navigate", "url": "/next" }
  ]
}
```

### 2. Handle API Failures

```json
{
  "type": "post",
  "url": "https://api.example.com/submit",
  "retries": 2,
  "onError": {
    "type": "navigate",
    "url": "/error"
  }
}
```

### 3. Use Parallel for Non-Critical Actions

```json
{
  "type": "parallel",
  "waitForAll": false,
  "actions": [
    { "type": "analytics", "event": "click" },
    { "type": "post", "url": "https://api.example.com/track" }
  ]
}
```

### 4. Provide Fallback Actions

```json
{
  "actions": {
    "approve": { "type": "navigate", "url": "/order" },
    "reject": { "type": "navigate", "url": "/cancel" },
    "default": { "type": "navigate", "url": "/" }
  }
}
```

### 5. Log Important Events

```json
{
  "type": "chain",
  "actions": [
    {
      "type": "log",
      "message": "Critical action started",
      "level": "info"
    },
    { "type": "post", "url": "..." }
  ]
}
```

---

## Advanced Patterns

### Pattern 1: Optimistic UI with Rollback

```json
{
  "type": "chain",
  "stopOnError": false,
  "actions": [
    { "type": "setState", "key": "submitting", "value": true },
    {
      "type": "post",
      "url": "https://api.example.com/submit",
      "onSuccess": {
        "type": "navigate",
        "url": "/success"
      },
      "onError": {
        "type": "setState",
        "key": "submitting",
        "value": false
      }
    }
  ]
}
```

### Pattern 2: Conditional Routing

```json
{
  "type": "chain",
  "actions": [
    {
      "type": "get",
      "url": "https://api.example.com/check-eligibility",
      "onSuccess": {
        "type": "conditional",
        "condition": "stateEquals",
        "key": "eligible",
        "value": true,
        "ifTrue": { "type": "navigate", "url": "/premium" },
        "ifFalse": { "type": "navigate", "url": "/standard" }
      }
    }
  ]
}
```

### Pattern 3: Multi-Provider Analytics

```json
{
  "type": "parallel",
  "actions": [
    {
      "type": "analytics",
      "event": "conversion",
      "provider": "gtag"
    },
    {
      "type": "analytics",
      "event": "conversion",
      "provider": "segment"
    },
    {
      "type": "post",
      "url": "https://api.example.com/track"
    }
  ]
}
```

### Pattern 4: Delayed Redirect with Feedback

```json
{
  "type": "chain",
  "actions": [
    {
      "type": "log",
      "message": "Redirecting in 3 seconds...",
      "level": "info"
    },
    {
      "type": "delay",
      "duration": 3000,
      "then": {
        "type": "redirect",
        "url": "https://partner.com",
        "target": "_blank"
      }
    }
  ]
}
```

---

## Edge Cases & Limitations

### Network Failures
- API actions will retry based on `retries` configuration
- Use `onError` to handle permanent failures
- Analytics failures are non-blocking by design

### Timeouts
- Default API timeout: 10 seconds
- Maximum delay duration: 30 seconds
- Requests can be canceled via AbortController

### Circular Actions
- ⚠️ Avoid circular references in actions (e.g., chain → conditional → chain...)
- The system does not detect cycles automatically
- Maximum recommended chain depth: 5 levels

### Security
- ⚠️ Never include API keys directly in JSON (use environment variables)
- Validate user inputs before including in payloads
- Sanitize URLs to prevent XSS

### Performance
- Parallel actions improve performance but may consume more resources
- Limit concurrent API calls to avoid rate limiting
- Use delays sparingly to avoid perceived slowness

---

## Migration from Legacy System

### Old System (Callback-based)

```tsx
<SimpleCTA
  text="Click Me"
  action="approve"
  onAction={(action) => goToNext(action)}
/>
```

### New System (Action-based)

```json
{
  "component": "SimpleCTA",
  "props": {
    "text": "Click Me",
    "action": "approve"
  },
  "actions": {
    "approve": {
      "type": "navigate",
      "url": "/next"
    }
  }
}
```

### Backward Compatibility

SimpleCTA and other components maintain backward compatibility:
- If `actions` are provided → use new action dispatcher
- If only `onAction` callback → use legacy system
- Both can coexist during migration

---

## Testing

### Unit Testing Actions

```typescript
import { ActionDispatcher, type ActionContext } from './ActionDispatcher';

const mockContext: ActionContext = {
  navigate: jest.fn(),
  getState: jest.fn(),
  setState: jest.fn(),
  formData: {},
};

const dispatcher = new ActionDispatcher(mockContext);

test('navigate action', async () => {
  const result = await dispatcher.dispatch({
    type: 'navigate',
    url: '/test',
  });

  expect(result.success).toBe(true);
  expect(mockContext.navigate).toHaveBeenCalledWith('/test', undefined);
});
```

### Integration Testing

```typescript
test('chain action with API call', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });

  const result = await dispatcher.dispatch({
    type: 'chain',
    actions: [
      { type: 'post', url: 'https://api.test.com' },
      { type: 'navigate', url: '/success' },
    ],
  });

  expect(result.success).toBe(true);
});
```

---

## Troubleshooting

### Action Not Executing

1. **Check validation**: Ensure action matches schema
2. **Check component props**: Verify `dispatcher` and `actions` are passed
3. **Check console**: Look for validation errors in browser console

### API Calls Failing

1. **Check CORS**: Ensure API allows cross-origin requests
2. **Check timeout**: Increase timeout for slow endpoints
3. **Check retries**: Enable retries for flaky connections
4. **Check onError**: Add error handler to catch issues

### Analytics Not Tracking

1. **Check provider**: Ensure analytics library is loaded (e.g., gtag.js)
2. **Check console**: Analytics failures log warnings
3. **Check network**: Open DevTools Network tab to see requests
4. **Check provider config**: Verify analytics account setup

---

## Future Enhancements

Planned features:
- 🔮 Custom condition functions
- 🔮 Action middleware/interceptors
- 🔮 Action history/undo
- 🔮 Dev tools debugger
- 🔮 Action templates/presets
- 🔮 Schema validation UI

---

## Support

For questions or issues:
1. Check this documentation
2. Review example files in `/landings/_template/`
3. Check browser console for error messages
4. Review `src/engine/ActionDispatcher.ts` source code

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0
