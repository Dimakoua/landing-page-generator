import o from"./Footer-C4Wp3vLk.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import"./useActionDispatch-DI3rZtA0.js";const c={title:"Components/Footer",component:o,parameters:{layout:"fullscreen"},argTypes:{logo:{control:"object"},newsletter:{control:"object"},links:{control:"object"},copyright:{control:"text"}}},r=[{label:"About",onClick:{type:"navigate",url:"/about"}},{label:"Contact",onClick:{type:"navigate",url:"/contact"}},{label:"Privacy Policy",onClick:{type:"navigate",url:"/privacy"}},{label:"Terms of Service",onClick:{type:"navigate",url:"/terms"}}],e={args:{logo:{text:"MyBrand"},newsletter:{title:"Stay Updated",description:"Subscribe to our newsletter for the latest updates and offers.",placeholder:"Enter your email",submitButton:{label:"Subscribe",onClick:{type:"analytics",event:"newsletter_signup"}}},links:r,copyright:"© 2024 MyBrand. All rights reserved."}},t={args:{logo:{image:"https://via.placeholder.com/150x50?text=Logo"},newsletter:{title:"Join Our Community",description:"Get exclusive content and early access to new features.",placeholder:"your@email.com",submitButton:{label:"Join Now",onClick:{type:"analytics",event:"newsletter_signup"}}},links:r,copyright:"© 2024 MyBrand. All rights reserved."}},n={args:{links:r,copyright:"© 2024 MyBrand. All rights reserved."}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    logo: {
      text: 'MyBrand'
    },
    newsletter: {
      title: 'Stay Updated',
      description: 'Subscribe to our newsletter for the latest updates and offers.',
      placeholder: 'Enter your email',
      submitButton: {
        label: 'Subscribe',
        onClick: {
          type: 'analytics',
          event: 'newsletter_signup'
        }
      }
    },
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    logo: {
      image: 'https://via.placeholder.com/150x50?text=Logo'
    },
    newsletter: {
      title: 'Join Our Community',
      description: 'Get exclusive content and early access to new features.',
      placeholder: 'your@email.com',
      submitButton: {
        label: 'Join Now',
        onClick: {
          type: 'analytics',
          event: 'newsletter_signup'
        }
      }
    },
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.'
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.'
  }
}`,...n.parameters?.docs?.source}}};const p=["Default","WithImageLogo","Minimal"];export{e as Default,n as Minimal,t as WithImageLogo,p as __namedExportsOrder,c as default};
