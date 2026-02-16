import o from"./Testimonials-BSY5Ufzx.js";import"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";const c={title:"Components/Testimonials",component:o,parameters:{layout:"padded"},argTypes:{title:{control:"text"},subtitle:{control:"text"},testimonials:{control:"object"},displayMode:{control:"select",options:["grid","carousel","single"]},itemsPerRow:{control:"number",min:1,max:4}}},a=[{id:"1",name:"Sarah Johnson",role:"Marketing Director",company:"TechCorp",content:"This platform transformed our landing pages. The conversion rate increased by 40% in just two weeks!",image:"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",rating:5},{id:"2",name:"Michael Chen",role:"Founder",company:"StartupXYZ",content:"Incredible ease of use and powerful features. Our team was able to launch multiple campaigns quickly.",image:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",rating:5},{id:"3",name:"Emily Davis",role:"Product Manager",company:"InnovateCo",content:"The analytics and insights provided are top-notch. We can now make data-driven decisions with confidence.",image:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",rating:4}],e={args:{title:"What Our Customers Say",subtitle:"Hear from businesses that have transformed their online presence",testimonials:a,displayMode:"grid",itemsPerRow:3}},s={args:{title:"Customer Success Stories",testimonials:a,displayMode:"carousel"}},t={args:{testimonials:[a[0]],displayMode:"single"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'What Our Customers Say',
    subtitle: 'Hear from businesses that have transformed their online presence',
    testimonials: sampleTestimonials,
    displayMode: 'grid',
    itemsPerRow: 3
  }
}`,...e.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Customer Success Stories',
    testimonials: sampleTestimonials,
    displayMode: 'carousel'
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    testimonials: [sampleTestimonials[0]],
    displayMode: 'single'
  }
}`,...t.parameters?.docs?.source}}};const l=["Grid","Carousel","Single"];export{s as Carousel,e as Grid,t as Single,l as __namedExportsOrder,c as default};
