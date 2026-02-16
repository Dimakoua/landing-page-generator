import a from"./Accordion-EAN67bPc.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const m={title:"Components/Accordion",component:a,parameters:{layout:"padded"},argTypes:{items:{control:"object"},allowMultiple:{control:"boolean"},defaultOpen:{control:"object"}}},o=[{id:"item1",title:"What is this product?",content:"This is a high-quality product designed to meet your needs with premium features and excellent performance."},{id:"item2",title:"How does it work?",content:[{label:"Step 1",value:"Initialize the system"},{label:"Step 2",value:"Configure your settings"},{label:"Step 3",value:"Start using the product"}]},{id:"item3",title:"Pricing Information",content:"Contact our sales team for detailed pricing information tailored to your specific requirements."}],e={args:{items:o,allowMultiple:!1}},t={args:{items:o,allowMultiple:!0,defaultOpen:["item1","item2"]}},r={args:{items:[o[0]]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    items: sampleItems,
    allowMultiple: false
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    items: sampleItems,
    allowMultiple: true,
    defaultOpen: ['item1', 'item2']
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    items: [sampleItems[0]]
  }
}`,...r.parameters?.docs?.source}}};const p=["Default","MultipleOpen","SingleItem"];export{e as Default,t as MultipleOpen,r as SingleItem,p as __namedExportsOrder,m as default};
