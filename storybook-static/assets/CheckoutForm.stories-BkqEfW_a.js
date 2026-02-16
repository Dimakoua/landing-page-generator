import a from"./CheckoutForm-B8NdJyfT.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const i={title:"Components/CheckoutForm",component:a,parameters:{layout:"padded"},argTypes:{title:{control:"text"},form:{control:"object"}}},r={id:"checkout",fields:[{name:"firstName",label:"First Name",type:"text",required:!0,placeholder:"Enter your first name"},{name:"lastName",label:"Last Name",type:"text",required:!0,placeholder:"Enter your last name"},{name:"email",label:"Email",type:"email",required:!0,validator:"email",placeholder:"Enter your email"},{name:"phone",label:"Phone",type:"tel",mask:"phone",placeholder:"(555) 123-4567"},{name:"address",label:"Address",type:"text",required:!0,placeholder:"Enter your address"},{name:"city",label:"City",type:"text",required:!0,placeholder:"Enter your city"},{name:"zipCode",label:"ZIP Code",type:"text",required:!0,validator:"zipCode",placeholder:"12345"}],submitButton:{label:"Complete Purchase",onClick:{type:"navigate",url:"/confirmation"}}},e={args:{title:"Checkout",form:r}},t={args:{title:"Secure Checkout",form:r}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Checkout',
    form: sampleForm
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Secure Checkout',
    form: sampleForm
  }
}`,...t.parameters?.docs?.source}}};const n=["Default","WithValidation"];export{e as Default,t as WithValidation,n as __namedExportsOrder,i as default};
