# Troubleshooting: Landing Page Factory

This guide helps you quickly resolve common issues when building or editing landing pages.

---

## 1. JSON Validation Errors in VS Code
- **Symptom:** Red squiggles or error messages when editing JSON files
- **Solution:**
  - Check for typos in property names or values
  - Ensure component names match `ComponentMap.ts`
  - Use VS Code autocomplete (Ctrl+Space) for suggestions
  - Refer to `schemas/` for valid structure

---

## 2. Component Not Rendering
- **Symptom:** Section/component does not appear on the page
- **Solution:**
  - Confirm the `component` name matches exactly (case-sensitive)
  - Check for missing or invalid `props`
  - Review browser console for errors
  - Ensure the component is registered in `ComponentMap.ts`

---

## 3. Action Not Working
- **Symptom:** Button or event does nothing
- **Solution:**
  - Verify the `actions` object is present and correctly structured
  - Check that the `type` field matches a supported action (see `schemas/layout.schema.json`)
  - Look for errors in the browser console
  - Review `ACTION_DISPATCHER.md` for action requirements

---

## 4. Theme Not Applying
- **Symptom:** Colors or fonts do not update as expected
- **Solution:**
  - Check `theme.json` for correct color/font keys
  - Ensure values are valid CSS (e.g., `#ff0000`, `Arial`)
  - Refresh the browser after changes

---

## 5. Build or Lint Errors
- **Symptom:** `npm run build` or `npm run lint` fails
- **Solution:**
  - Run `npm install` to ensure all dependencies are present
  - Check for TypeScript or ESLint errors in the terminal
  - Fix any reported issues in your code or JSON configs

---

## 6. Test Failures
- **Symptom:** `npm run test:run` reports failing tests
- **Solution:**
  - Review the test output for details
  - Check recent changes to actions, engine, or components
  - Fix the underlying issue and re-run tests

---

## 7. Still Stuck?
- Review the documentation in `/docs/`
- Ask your team for help
- Check the latest architectural recommendations in `recomendations.md`
