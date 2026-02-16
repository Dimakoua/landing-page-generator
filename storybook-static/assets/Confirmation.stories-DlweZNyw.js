import r from"./Confirmation-B-NA24tR.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const l={title:"Components/Confirmation",component:r,parameters:{layout:"padded"},argTypes:{title:{control:"text"},message:{control:"text"},userInfo:{control:"object"},orderItems:{control:"object"},orderTotal:{control:"number"},button:{control:"object"}}},n=[{id:"1",name:"Premium Wireless Headphones",price:299.99,quantity:1,color:"Black"},{id:"2",name:"Charging Cable",price:19.99,quantity:2}],e={args:{title:"Order Confirmed!",message:"Thank you for your purchase. Your order has been successfully placed.",userInfo:{firstName:"John",lastName:"Doe",email:"john.doe@example.com"},orderItems:n,orderTotal:339.97,button:{label:"Continue Shopping",onClick:{type:"navigate",url:"/products"}}}},o={args:{title:"Success!",message:"Your action has been completed successfully.",button:{label:"Go Home",onClick:{type:"navigate",url:"/"}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Order Confirmed!',
    message: 'Thank you for your purchase. Your order has been successfully placed.',
    userInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    orderItems: sampleOrderItems,
    orderTotal: 339.97,
    button: {
      label: 'Continue Shopping',
      onClick: {
        type: 'navigate',
        url: '/products'
      }
    }
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Success!',
    message: 'Your action has been completed successfully.',
    button: {
      label: 'Go Home',
      onClick: {
        type: 'navigate',
        url: '/'
      }
    }
  }
}`,...o.parameters?.docs?.source}}};const m=["Success","Simple"];export{o as Simple,e as Success,m as __namedExportsOrder,l as default};
