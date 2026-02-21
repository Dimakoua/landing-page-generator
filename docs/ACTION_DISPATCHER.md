# Action Dispatcher

Handle user interactions declaratively with JSON actions.

---

## Quick Start

```json
{
  "component": "Hero",
  "props": { "title": "Click Me" },
  "actions": {
    "primary": { "type": "navigate", "url": "/next" },
    "secondary": { "type": "redirect", "url": "https://example.com" }
  }
}
```

---

## Action Types Quick Reference

| Action | Purpose |
|--------|---------|
| **navigate** | Go to another step in your landing |
| **redirect** | Go to external URL |
| **post / get / put / patch / delete** | Call APIs |
| **analytics** | Track user events |
| **pixel** | Fire tracking pixels |
| **iframe** | Embed tracking iframes |
| **customHtml** | Render custom HTML (⚠️ security flag required) |
| **setState** | Update global state |
| **log** | Console logging |
| **chain** | Execute actions in sequence |
| **parallel** | Execute actions simultaneously |
| **conditional** | Execute if condition passes |
| **delay** | Wait before executing |
| **cart** | Manage shopping cart |
| **closePopup** | Close popup overlay |

---

## Core Concepts

### Array shorthand
Any place an `Action` object is expected you may optionally provide an **array of actions** instead. The engine will automatically convert the array to a `chain` action (sequential execution). This keeps JSON concise when you only need a simple linear flow:

```json
"actions": [
  { "type": "analytics", "event": "cta_clicked" },
  { "type": "post", "url": "/track" },
  { "type": "navigate", "url": "/next" }
]
```

Under the hood this becomes:

```json
{
  "type": "chain",
  "actions": [/* same three actions */]
}
```

Parallel execution still requires an explicit `parallel` wrapper; the shorthand only produces `chain` semantics.

### Lifecycle hooks
Sections may now declare a `lifetime` object containing lifecycle hooks which execute actions at mount/unmount time. Hooks accept the same action-or-array syntax and respect all normal action rules (conditions, chain/parallel, etc.):

```json
"lifetime": {
  "beforeMount": {
    "type": "log",
    "message": "About to render"
  },
  "onMount": [
    { "type": "analytics", "event": "component_mounted" },
    { "type": "post", "url": "/api/startup" }
  ],
  "onUnmount": { "type": "log", "message": "Goodbye" }
}
```

Lifecycle hooks run in these timing windows:

* **beforeMount** – in `useLayoutEffect` before browser paint
* **onMount** – in `useEffect` after paint
* **beforeUnmount** – as cleanup from beforeMount
* **onUnmount** – as cleanup from onMount

Hooks are skipped when the section’s `condition` evaluates to false. Errors in hooks emit a `lifecycleError` event but do not prevent rendering.
{
  "onUnmount": { "type": "log", "message": "Goodbye" }
}

### Named Actions vs Inline Actions

**Named Actions** — Reusable, defined upfront
```json
{
  "component": "Button",
  "actions": {
    "approve": { "type": "navigate", "url": "/next" }
  }
}
```
Use when: Multiple components need the same action, or component has different behaviors (approve, reject, etc.)

**Inline Actions** — Tied to specific events
```json
{
  "type": "post",
  "url": "https://api.example.com/submit",
  "onSuccess": { "type": "navigate", "url": "/thanks" },
  "onError": { "type": "log", "message": "Error" }
}
```
Use when: Action is tied to a specific event (success/error), not reused

| Aspect | Named | Inline |
|--------|-------|--------|
| **Definition** | In `actions` object | In callback properties |
| **Trigger** | Component decides | Automatic (on success/error) |
| **Reusability** | Multiple components | Single event |
| **Example** | `"approve": {...}` | `"onSuccess": {...}` |

---

## All Action Types

### Navigate — Go to another step
```json
{ "type": "navigate", "url": "/checkout", "replace": false }
```
- `url` — Step ID or relative path
- `replace` (optional) — Replace history instead of push

---

### Redirect — External URL
```json
{ "type": "redirect", "url": "https://example.com", "target": "_blank" }
```
- `url` — Full external URL (must include protocol)
- `target` (optional) — '_self' | '_blank' | '_parent' (default: '_self')

---

### API — GET, POST, PUT, PATCH, DELETE

**POST example:**
```json
{
  "type": "post",
  "url": "https://api.example.com/leads",
  "payload": { "email": "user@example.com" },
  "headers": { "X-API-Key": "secret" },
  "timeout": 10000,
  "retries": 3,
  "stateKey": "leadSubmission",
  "errorStateKey": "leadError",
  "onSuccess": { "type": "navigate", "url": "/thanks" },
  "onError": { "type": "navigate", "url": "/error" }
}
```

**Properties:**
- `type` — 'get' | 'post' | 'put' | 'patch' | 'delete'
- `url` — API endpoint
- `payload` (optional) — Request body (POST/PUT/PATCH) or query params (GET)
- `headers` (optional) — Custom HTTP headers
- `timeout` (optional) — Request timeout in ms (default: 10000)
- `retries` (optional) — Number of retries (0-5, default: 0)
- `stateKey` (optional) — State key to store successful response data
- `errorStateKey` (optional) — State key to store error details (separate from stateKey)
- `onSuccess` (optional) — Action on success (2xx response)
- `onError` (optional) — Action on error

**Response Storage:**
- If `stateKey` is provided, successful response JSON is automatically stored in state before `onSuccess` executes
- If `errorStateKey` is provided, error details are stored as `{ error: string, timestamp: string }` before `onError` executes
- Omit both keys if you don't need automatic state storage
- Use different keys to track success and error states separately

**Examples:**

Store only success response:
```json
{
  "type": "get",
  "url": "/api/user/profile",
  "stateKey": "userProfile",
  "onSuccess": {
    "type": "log",
    "message": "Profile loaded to state.userProfile"
  }
}
```

Store only errors:
```json
{
  "type": "post",
  "url": "/api/submit",
  "errorStateKey": "submissionError",
  "onError": {
    "type": "log",
    "message": "Error details in state.submissionError"
  }
}
```

Store both separately:
```json
{
  "type": "post",
  "url": "/api/order",
  "stateKey": "orderConfirmation",
  "errorStateKey": "orderError",
  "onSuccess": {
    "type": "analytics",
    "event": "order_success"
  },
  "onError": {
    "type": "analytics",
    "event": "order_failed"
  }
}
```

---

### Analytics — Track events
```json
{
  "type": "analytics",
  "event": "button_clicked",
  "properties": { "button": "signup", "page": "home" },
  "provider": "gtag"
}
```
- `event` — Event name
- `properties` (optional) — Event metadata
- `provider` (optional) — 'gtag' | 'segment' | 'mixpanel' | 'custom' (default: gtag)

---

### Pixel — Fire tracking pixels
```json
{
  "type": "pixel",
  "url": "https://facebook.com/tr?id=123456",
  "params": { "value": "99.99", "currency": "USD" },
  "async": true
}
```
- `url` — Pixel URL
- `params` (optional) — Query parameters
- `async` (optional) — Load asynchronously (default: true)

---

### Iframe — Embed tracking iframe
```json
{
  "type": "iframe",
  "src": "https://tracking.example.com/pixel.html",
  "width": "1",
  "height": "1"
}
```
- `src` — Iframe source URL
- `width`, `height` (optional) — Dimensions (default: 1x1)
- `style` (optional) — CSS styles
- `id` (optional) — Element ID

---

### CustomHtml — Render custom HTML

⚠️ **Security flag required** — Add `"allowCustomHtml": true` to `theme.json`

```json
{
  "type": "customHtml",
  "html": "<img src='https://tracking.example.com/pixel.gif' /><script>console.log('tracked')</script>",
  "target": "body",
  "position": "append",
  "removeAfter": 5000
}
```
- `html` — HTML code to render
- `target` (optional) — 'body' | 'head' (default: body)
- `position` (optional) — 'append' | 'prepend' (default: append)
- `id` (optional) — Container element ID
- `removeAfter` (optional) — Auto-remove after N milliseconds

**⚠️ Only use with trusted HTML to prevent security issues.**

---

### SetState — Update application state
```json
{
  "type": "setState",
  "key": "user_email",
  "value": "user@example.com",
  "merge": true
}
```
- `key` — State key
- `value` — State value
- `merge` (optional) — Merge with existing state (default: true)

---

### Log — Console logging
```json
{
  "type": "log",
  "message": "User clicked signup",
  "level": "info"
}
```
- `message` — Log message
- `level` (optional) — 'info' | 'warn' | 'error' (default: info)

---

### Chain — Execute actions sequentially
```json
{
  "type": "chain",
  "actions": [
    { "type": "analytics", "event": "signup" },
    { "type": "navigate", "url": "/thanks" }
  ]
}
```
- `actions` — Array of actions (executed in order)

---

### Parallel — Execute actions simultaneously
```json
{
  "type": "parallel",
  "actions": [
    { "type": "analytics", "event": "signup" },
    { "type": "pixel", "url": "https://facebook.com/tr?id=123" }
  ]
}
```
- `actions` — Array of actions (all start at once)

---

### Conditional — Execute action if condition passes
```json
{
  "type": "conditional",
  "condition": "stateExists",
  "key": "email",
  "ifTrue": { "type": "navigate", "url": "/success" },
  "ifFalse": { "type": "log", "message": "email missing" }
}
```
- `condition` — One of the supported condition types:
  - `stateExists` — checks that a state key is present (use `key`).
  - `stateEquals` — checks equality (`key` + `value`).
  - `stateMatches` — RegExp match against a state value (`key`, `pattern`, optional `flags`). Useful for complex value matching.
  - `userAgentMatches` — RegExp match against `navigator.userAgent` (falls back to `state.client.userAgent`); accepts `pattern` and optional `flags`.
  - `userAgentIncludes` — Simple substring check against the user agent (case-insensitive); provide `value`.
  - `custom` — Reserved in the schema but **not** executed at runtime (no arbitrary JS evaluation).
- `ifTrue` / `ifFalse` — Actions executed based on the condition outcome.

Examples — RegExp against state value (stateMatches)
```json
{
  "type": "conditional",
  "condition": "stateMatches",
  "key": "client.os",
  "pattern": "^i(os|phone|pad)$",
  "flags": "i",
  "ifTrue": { "type": "setState", "key": "isMobile", "value": true }
}
```

Examples — Match user agent directly (userAgentMatches / userAgentIncludes)
```json
{
  "type": "conditional",
  "condition": "userAgentMatches",
  "pattern": "iPhone|iPad",
  "flags": "i",
  "ifTrue": { "type": "setState", "key": "client.os", "value": "ios" }
}

{
  "type": "conditional",
  "condition": "userAgentIncludes",
  "value": "android",
  "ifTrue": { "type": "setState", "key": "client.os", "value": "android" }
}
```

Tip: the engine automatically injects `client.userAgent`, `client.platform` and `client.os` into the initial state (see `useEngineState`). You can directly reference `client.*` with `stateEquals`/`stateMatches` in your conditional actions.

---

### Delay — Wait before executing next action
```json
{
  "type": "delay",
  "duration": 2000,
  "action": { "type": "navigate", "url": "/next" }
}
```
- `duration` — Wait time in milliseconds
- `action` — Action to execute after delay

---

### Cart — Cart management
```json
{
  "type": "cart",
  "operation": "add",
  "item": { "id": "prod-1", "name": "Widget", "price": 29.99, "quantity": 1 }
}
```
- `operation` — 'add' | 'remove' | 'clear' | 'update'
- `item` (optional) — Item to add/remove/update

---

### ClosePopup — Close popup
```json
{ "type": "closePopup" }
```

---

## Using Actions in React Components

### Simple Example: Button with Named Action

```tsx
import React from 'react';
import { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface ButtonProps {
  label: string;
  actionName: string;
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

export default function Button({ label, actionName, dispatcher, actions }: ButtonProps) {
  const handleClick = async () => {
    if (dispatcher && actions) {
      await dispatcher.dispatchNamed(actionName, actions);
    }
  };

  return <button onClick={handleClick}>{label}</button>;
}
```

**In your layout:**
```json
{
  "component": "Button",
  "props": { "label": "Continue", "actionName": "approve" },
  "actions": {
    "approve": { "type": "navigate", "url": "/next" }
  }
}
```

---

### Form with API Call

```tsx
import React, { useState } from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';

export default function ContactForm({ dispatcher }: { dispatcher?: ActionDispatcher }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!dispatcher) return;

    const result = await dispatcher.dispatch({
      type: 'post',
      url: 'https://api.example.com/subscribe',
      payload: { email },
      timeout: 10000,
      retries: 2
    });

    setLoading(false);

    if (result.success) {
      await dispatcher.dispatch({ type: 'navigate', "url": '/thank-you' });
    } else {
      setError(result.error?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

### Using dispatchNamed Helper

The `ActionDispatcher` has a built-in `dispatchNamed` method for safe action dispatch:

```typescript
// Method signature
async dispatchNamed(actionName: string, actionsMap: Record<string, Action>): Promise<DispatchResult>
```

**Benefits:**
- ✅ Automatic error handling
- ✅ Cleaner than manual `if (dispatcher && actions?.name)` checks
- ✅ Warns if action not found
- ✅ Type-safe

**Component example:**
```tsx
const handleClick = async () => {
  const result = await dispatcher.dispatchNamed('approve', actions);
  if (!result.success) {
    console.error('Action failed:', result.error);
  }
};
```

---

### Accessing Global State

```tsx
// Get single value
const userEmail = dispatcher.getState('user_email');

// Get entire state
const allState = dispatcher.getState();

// Use in conditionals
const isLoggedIn = !!dispatcher.getState('user_id');
```

---

### Advanced: Chained Actions with State

```tsx
const handleCheckout = async () => {
  if (!dispatcher || !actions) return;

  // Update state, track analytics, call API, navigate
  await dispatcher.dispatch({
    type: 'chain',
    actions: [
      { type: 'setState', key: 'checkout_started', value: true },
      { type: 'analytics', event: 'checkout_initiated' },
      {
        type: 'post',
        url: 'https://api.example.com/orders',
        payload: { email, items: cart },
        onSuccess: {
          type: 'chain',
          actions: [
            { type: 'pixel', url: 'https://facebook.com/tr?id=123' },
            { type: 'navigate', url: '/thank-you' }
          ]
        }
      }
    ]
  });
};
```

---

## Common Patterns

### Form Submission with Validation
```json
{
  "type": "chain",
  "actions": [
    { "type": "conditional", "condition": "state.email", "action": { "type": "analytics", "event": "form_valid" } },
    { "type": "post", "url": "https://api.example.com/leads", "payload": { "email": "@state.email" } }
  ]
}
```

### Multi-Step Funnel
```json
{
  "type": "chain",
  "actions": [
    { "type": "analytics", "event": "step_1_complete" },
    { "type": "navigate", "url": "/step-2" }
  ]
}
```

### Track and Redirect
```json
{
  "type": "chain",
  "actions": [
    { "type": "pixel", "url": "https://facebook.com/tr?id=123" },
    { "type": "delay", "duration": 500 },
    { "type": "redirect", "url": "https://partner.com" }
  ]
}
```

### Parallel API Calls
```json
{
  "type": "parallel",
  "actions": [
    { "type": "post", "url": "https://api.example.com/order" },
    { "type": "pixel", "url": "https://tracking.com/pixel" },
    { "type": "analytics", "event": "conversion" }
  ]
}
```

---

## Security & Policies

### CustomHtml Security
Enable custom HTML in `theme.json` (disabled by default):
```json
{
  "allowCustomHtml": true
}
```

**⚠️ Only use with trusted HTML sources. Never render user input as HTML.**

### API Key Security
Never store API keys in layouts:
```json
{
  "type": "post",
  "url": "https://api.example.com/data",
  "headers": { "X-API-Key": "{{ process.env.API_KEY }}" }
}
```

---

## See Also

- [Layouts](LAYOUTS.md) — Using actions in layouts
- [Getting Started](GETTING_STARTED.md) — Building pages step-by-step
- [Themes](THEMES.md) — Setting allowCustomHtml flag
