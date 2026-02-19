# Troubleshooting

Quick solutions for common issues.

---

## JSON Validation Errors

**Symptom:** Red squiggles in JSON files in VS Code

**Solutions:**
- Check for typos in property names
- Ensure component names are registered (check `ComponentMap.ts`)
- Use VS Code autocomplete (Ctrl+Space) for suggestions
- Verify JSON syntax (extra/missing commas, brackets)

---

## Component Not Rendering

**Symptom:** Section appears blank or error in console

**Solutions:**
- Verify component name is exact (case-sensitive): `Hero` not `hero`
- Check `props` are correct and valid
- Open browser DevTools (F12) and check console for errors
- Ensure component file exports `default`
- Check component is in `src/components/` folder

---

## Action Not Firing

**Symptom:** Button click does nothing

**Solutions:**
- Verify `actions` object is present in section
- Confirm action `type` is supported (see [Action Dispatcher](ACTION_DISPATCHER.md))
- Check browser console for errors
- Verify action name matches where it's called

**Example:**
```json
{
  "actions": {
    "primary": {
      "type": "navigate",
      "url": "/next"
    }
  }
}
```

---

## Theme Not Applying

**Symptom:** Colors and fonts don't update

**Solutions:**
- Check `theme.json` for correct color/font keys
- Verify values are valid CSS (`#ff0000`, `Arial`, etc.)
- Refresh browser after changes
- Check component uses theme variables (check component code)

---

## API Calls Failing

**Symptom:** API action returns error

**Solutions:**
- Check URL is correct and reachable
- Verify `payload` format matches API expectations
- Check `headers` if API requires authentication
- Review console for error details
- Increase `timeout` if request is slow

**Example:**
```json
{
  "type": "post",
  "url": "https://api.example.com/leads",
  "headers": { "Content-Type": "application/json" },
  "payload": { "email": "test@example.com" },
  "timeout": 10000,
  "retries": 2
}
```

---

## Build or Lint Errors

**Symptom:** `npm run build` or `npm run lint` fails

**Solutions:**
- Run `npm install` to ensure dependencies
- Check TypeScript errors: `npm run build`
- Fix ESLint issues: `npm run lint`

---

## Conditional Sections Not Showing/Hiding

**Symptom:** Section with `condition` always or never renders

**Solutions:**
- Verify condition `key` matches state property name (case-sensitive)
- Check `value` type matches state value (string, number, boolean)
- For regex patterns, test pattern separately: `new RegExp(pattern).test(value)`
- Check browser console for `[DEBUG] [renderSection]` logs (condition evaluation debug info)
- Ensure state is initialized in layout's `state` property or set via action

**Example Debugging:**
```json
{
  "state": { "showFeature": true },
  "sections": [
    {
      "component": "Feature",
      "condition": {
        "condition": "stateEquals",
        "key": "showFeature",
        "value": true
      }
    }
  ]
}
```

**Common Mistakes:**
- Using string `"123"` vs number `123` in values
- Forgetting to initialize state before referencing
- Case sensitivity: `stateEquals` not `StateEquals`
- Using deprecated condition types

---

## User Agent Conditions Not Working

**Symptom:** `userAgentMatches` or `userAgentIncludes` conditions always fail

**Solutions:**
- Fallback to `state.client.userAgent` — requires `getClientInfo` hook to populate
- Test pattern in browser console: `navigator.userAgent`
- For case-insensitive matching, add `"flags": "i"`
- Remember `userAgentIncludes` is already case-insensitive

**Example:**
```json
{
  "condition": "userAgentMatches",
  "pattern": "android|iphone",
  "flags": "i"
}
```
- Review error messages in terminal

---

## Tests Failing

**Symptom:** `npm run test:run` shows failures

**Solutions:**
- Review test output for specific errors
- Check for recent code changes
- Run tests in watch mode: `npm run test`
- Check coverage: `npm run test:coverage`

---

## Dev Server Issues

**Symptom:** `npm run dev` won't start

**Solutions:**
- Check port 5173 is available
- Kill any existing process: `npx kill-port 5173`
- Clear `.vite` cache: `rm -rf node_modules/.vite`
- Reinstall: `npm install`

---

## Page Not Loading

**Symptom:** Landing page shows error or blank

**Solutions:**
- Verify landing page folder exists: `src/landings/my-page/`
- Check `flow.json` exists and is valid JSON
- Verify first step ID matches: `steps/[id]/`
- Check browser console for errors
- Verify steps have `desktop.json` and `mobile.json`

---

## Still Stuck?

- Check [Getting Started](GETTING_STARTED.md) for basics
- Review [Layouts](LAYOUTS.md) for composition
- See [Action Dispatcher](ACTION_DISPATCHER.md) for actions
- Check [Components](COMPONENTS.md) for available components
- Review [design docs](../doc/design.md) for architecture
