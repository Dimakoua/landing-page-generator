# Component Lifecycle Hooks

Sections in your layout may perform actions when they are mounted or unmounted. This allows you to run side effects, local API calls, analytics, or state changes tied to the lifetime of a piece of the layout.

Hooks are defined under a `lifetime` object inside a section. Each property accepts **either a single action or an array of actions** (array shorthand produces an implicit `chain` action).

```json
{
  "component": "Wrapper",
  "lifetime": {
    "beforeMount": { "type": "log", "message": "about to appear" },
    "onMount": [
      { "type": "analytics", "event": "mounted" },
      { "type": "post", "url": "/api/start" }
    ],
    "onUnmount": { "type": "log", "message": "removed" }
  },
  "sections": [ /* ... */ ]
}
```

### Available hooks

| Hook | When it fires | Notes |
|------|---------------|-------|
| `beforeMount` | Synchronously before the browser paints (React `useLayoutEffect`) | Use for measurements or DOM reads that must happen before render.
| `onMount` | After paint (`useEffect`) | Good for network requests, analytics, timers.
| `beforeUnmount` | Cleanup from `beforeMount` (returned function) | Allows tearing down what you started in `beforeMount`.
| `onUnmount` | Cleanup from `onMount` | Cancel pending requests, clear timers, etc.

### Context and state

- Hooks execute with the same `ActionContext` that regular event actions use. That means they have access to `state`, `getState`, `setState`, `dispatch`, and your custom helpers (e.g. `navigate`).
- A unique `componentId` is injected automatically so any async work spawned during the hook can be aborted if the component unmounts early.
- Abort controllers created by actions within hooks are automatically registered and cancelled when the component leaves the tree.

### Conditional execution

If the parent section has a `condition` that evaluates to `false`, **none of the lifecycle hooks fire**.

### Error handling

Errors thrown inside hooks are caught, logged, and emit a `lifecycleError` event via the global event bus. The containing section still renders normally.

### Best practices

- Prefer `onMount` for asynchronous side effects; use `beforeMount` only for synchronous DOM work.
- Use the array shorthand to sequence multiple actions without nesting `chain`.
- Always provide cleanup in `onUnmount` when performing network requests or timers.

### Example: fetch user on mount

```json
{
  "component": "Wrapper",
  "lifetime": {
    "onMount": {
      "type": "get",
      "url": "/api/user/profile",
      "onSuccess": { "type": "setState", "key": "user", "value": "{{data}}" }
    }
  },
  "sections": [
    { "component": "Hero", "props": { "title": "Welcome {{state.user.name}}" } }
  ]
}
```

This request will be aborted automatically if the wrapper unmounts (e.g. user navigates away) before the response arrives.
