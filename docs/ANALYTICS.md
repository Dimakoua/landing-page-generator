# Analytics Setup Guide

This document explains how to set up and customize analytics for your landing pages. Our engine supports flexible Google Analytics configurations, including global tags, per-lander tags, and multi-tagging.

## 1. Google Analytics (gtag)

We support three primary ways to configure Google Analytics:

### Option A: Global Tag (One tag for all landers)
If all your landing pages should report to the same Google Analytics property, the simplest way is to add the tag directly to `index.html`.

**`index.html`**
```html
<head>
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GLOBAL_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-GLOBAL_ID');
  </script>
</head>
```

### Option B: Per-Lander Tag (Unique tag per landing page)
To track each landing page in a separate property, use the `analytics` configuration in your `flow.json`. The engine will dynamically load and configure the correct tag for each project.

**`src/landings/my-lander/flow.json`**
```json
{
  "analytics": {
    "googleAnalytics": {
      "measurementId": "G-LANDER_SPECIFIC_ID"
    }
  },
  "steps": [...]
}
```

### Option C: Multi-Tagging (Multiple tags for one lander)
You can report events to multiple Google Analytics properties simultaneously (e.g., one for the marketing agency and one for the client).

**`src/landings/my-lander/flow.json`**
```json
{
  "analytics": {
    "googleAnalytics": {
      "measurementId": "G-CLIENT_ID",
      "additionalIds": ["G-AGENCY_ID", "G-INTERNAL_TRACKER_ID"]
    }
  },
  "steps": [...]
}
```

---

## 2. Technical Implementation Details

### Automatic Event Tracking
When a `measurementId` is provided in `flow.json`, the engine automatically:
1. Loads the `gtag.js` library.
2. Initializes `gtag` with the provided ID(s).
3. Becomes ready to receive events from components.

### Manual Event Tracking (Actions)
You can trigger custom events anywhere in your layout using the `analytics` action type. These events will automatically be sent to **all** configured gtag properties.

```json
{
  "type": "analytics",
  "event": "conversion_achieved",
  "properties": {
    "value": 49.99,
    "currency": "USD"
  }
}
```

### Heatmap Tracking
The `HeatmapRecorder` component also integrates with the configured analytics provider.

```json
{
  "component": "HeatmapRecorder",
  "props": {
    "analyticsProvider": "google_analytics",
    "sampleRate": 0.5
  }
}
```

---

## 3. Best Practices

1. **Don't Double-Tag**: If you use Option B (Per-Lander), avoid having a conflicting GA tag in `index.html` unless you intentionally want data to go to both places.
2. **Use Clear ID Names**: Keep a record of which `G-XXXX` IDs correspond to which environments (Production vs. Staging).
3. **Validate in Console**: In development, GA events are also logged to the browser console for easy debugging.
