import a from"./RecommendedProducts-DLR9R8LU.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const i={title:"Components/RecommendedProducts",component:a,parameters:{layout:"padded"},argTypes:{title:{control:"text"},products:{control:"object"}}},r=[{id:"1",title:"Wireless Charging Pad",price:"$29.99",image:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop",cta:{label:"Add to Cart",onClick:{type:"cart",operation:"add",productId:"charger-1"}}},{id:"2",title:"Protective Case",price:"$19.99",image:"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&h=300&fit=crop",cta:{label:"Add to Cart",onClick:{type:"cart",operation:"add",productId:"case-1"}}},{id:"3",title:"Extra Battery Pack",price:"$49.99",image:"https://images.unsplash.com/photo-1609592806580-d4b3c6e1c7b5?w=300&h=300&fit=crop",cta:{label:"Add to Cart",onClick:{type:"cart",operation:"add",productId:"battery-1"}}},{id:"4",title:"Screen Protector",price:"$14.99",image:"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",cta:{label:"Add to Cart",onClick:{type:"cart",operation:"add",productId:"protector-1"}}}],t={args:{title:"Complete Your Setup",products:r}},e={args:{title:"You Might Also Like",products:r.slice(0,3)}},o={args:{title:"Recommended for You",products:[r[0]]}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Complete Your Setup',
    products: sampleProducts
  }
}`,...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'You Might Also Like',
    products: sampleProducts.slice(0, 3)
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Recommended for You',
    products: [sampleProducts[0]]
  }
}`,...o.parameters?.docs?.source}}};const l=["Default","CustomTitle","SingleProduct"];export{e as CustomTitle,t as Default,o as SingleProduct,l as __namedExportsOrder,i as default};
