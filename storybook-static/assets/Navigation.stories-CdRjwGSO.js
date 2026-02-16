import e from"./Navigation-DAMEDo2v.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const c={title:"Components/Navigation",component:e,parameters:{layout:"fullscreen"},argTypes:{logo:{control:"object"},menuItems:{control:"object"},cartIcon:{control:"object"}}},n={args:{logo:{text:"MyBrand",onClick:{type:"navigate",url:"/"}},menuItems:[{label:"Home",action:{type:"navigate",url:"/"}},{label:"Products",action:{type:"navigate",url:"/products"}},{label:"About",action:{type:"navigate",url:"/about"}},{label:"Contact",action:{type:"navigate",url:"/contact"}}],cartIcon:{itemCount:3,action:{type:"navigate",url:"/cart"}}}},t={args:{logo:{image:"https://via.placeholder.com/150x50?text=Logo",onClick:{type:"navigate",url:"/"}},menuItems:[{label:"Home",action:{type:"navigate",url:"/"}},{label:"Services",action:{type:"navigate",url:"/services"}},{label:"Portfolio",action:{type:"navigate",url:"/portfolio"}}]}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    logo: {
      text: 'MyBrand',
      onClick: {
        type: 'navigate',
        url: '/'
      }
    },
    menuItems: [{
      label: 'Home',
      action: {
        type: 'navigate',
        url: '/'
      }
    }, {
      label: 'Products',
      action: {
        type: 'navigate',
        url: '/products'
      }
    }, {
      label: 'About',
      action: {
        type: 'navigate',
        url: '/about'
      }
    }, {
      label: 'Contact',
      action: {
        type: 'navigate',
        url: '/contact'
      }
    }],
    cartIcon: {
      itemCount: 3,
      action: {
        type: 'navigate',
        url: '/cart'
      }
    }
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    logo: {
      image: 'https://via.placeholder.com/150x50?text=Logo',
      onClick: {
        type: 'navigate',
        url: '/'
      }
    },
    menuItems: [{
      label: 'Home',
      action: {
        type: 'navigate',
        url: '/'
      }
    }, {
      label: 'Services',
      action: {
        type: 'navigate',
        url: '/services'
      }
    }, {
      label: 'Portfolio',
      action: {
        type: 'navigate',
        url: '/portfolio'
      }
    }]
  }
}`,...t.parameters?.docs?.source}}};const i=["Default","WithImageLogo"];export{n as Default,t as WithImageLogo,i as __namedExportsOrder,c as default};
