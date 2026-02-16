import r from"./HeatmapRecorder-DdyNRJ6r.js";import"./index-Bi6L2ga8.js";const c={title:"Components/HeatmapRecorder",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"Invisible component that tracks user interactions for analytics. Use the controls to configure tracking behavior."}}},argTypes:{enabled:{control:"boolean"},trackClicks:{control:"boolean"},trackScroll:{control:"boolean"},trackAttention:{control:"boolean"},sampleRate:{control:{type:"number",min:0,max:1,step:.1}},autoSend:{control:"boolean"},sendInterval:{control:"number"},analyticsProvider:{control:"select",options:["google_analytics","custom"]}}},e={args:{enabled:!0,trackClicks:!0,trackScroll:!0,trackAttention:!0,sampleRate:1,autoSend:!0,sendInterval:3e4,analyticsProvider:"google_analytics"}},t={args:{enabled:!0,trackClicks:!0,trackScroll:!1,trackAttention:!1,sampleRate:.5,autoSend:!1}},a={args:{enabled:!0,trackClicks:!0,trackScroll:!0,trackAttention:!0,sampleRate:1,autoSend:!0,sendInterval:6e4,analyticsProvider:"custom",customEndpoint:"https://api.example.com/analytics"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: true,
    trackAttention: true,
    sampleRate: 1.0,
    autoSend: true,
    sendInterval: 30000,
    analyticsProvider: 'google_analytics'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: false,
    trackAttention: false,
    sampleRate: 0.5,
    autoSend: false
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: true,
    trackAttention: true,
    sampleRate: 1.0,
    autoSend: true,
    sendInterval: 60000,
    analyticsProvider: 'custom',
    customEndpoint: 'https://api.example.com/analytics'
  }
}`,...a.parameters?.docs?.source}}};const s=["Default","MinimalTracking","CustomEndpoint"];export{a as CustomEndpoint,e as Default,t as MinimalTracking,s as __namedExportsOrder,c as default};
