import{j as e}from"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import{u as A}from"./useActionDispatch-DI3rZtA0.js";const f=({title:p="Your Cart",items:l=[],emptyCartMessage:u="Your cart is empty.",summary:i,dispatcher:c,state:x})=>{const{loading:n,dispatchWithLoading:s}=A(c),d=x?.cart,o=l.length>0?l:d?.items||[],h=d?.totalPrice||o.reduce((t,a)=>t+a.price*a.quantity,0),y=()=>{s("checkout",i?.checkoutButton?.onClick)},m=(t,a)=>{if(c)if(a<=0){const r={type:"cart",operation:"remove",item:t};s(`remove-${t.id}`,r)}else{const r={type:"cart",operation:"update",item:{...t,quantity:a}};s(`update-${t.id}`,r)}},g=t=>{if(!c)return;const a={type:"cart",operation:"remove",item:t};s(`remove-${t.id}`,a)};return e.jsx("div",{className:"min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8",children:e.jsxs("div",{className:"max-w-4xl mx-auto",children:[e.jsx("div",{className:"mb-8",children:e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:p})}),o&&o.length>0?e.jsxs("div",{className:"bg-white rounded-lg shadow",children:[e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-200",children:[e.jsx("thead",{className:"bg-gray-50",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Product"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Price"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Quantity"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Total"}),e.jsx("th",{className:"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase",children:"Action"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-200",children:o.map(t=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsxs("div",{className:"flex items-center",children:[t.image&&e.jsx("img",{src:t.image,alt:t.name,className:"h-10 w-10 rounded object-cover mr-4"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-sm font-medium text-gray-900 block",children:t.name}),t.color&&e.jsxs("span",{className:"text-xs text-gray-500 block",children:["Color: ",t.color]}),t.description&&e.jsx("span",{className:"text-xs text-gray-500 block mt-1",children:t.description})]})]})}),e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-900",children:["$",t.price.toFixed(2)]}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx("button",{onClick:()=>m(t,t.quantity-1),disabled:n[`update-${t.id}`]||n[`remove-${t.id}`],className:`px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ${n[`update-${t.id}`]||n[`remove-${t.id}`]?"opacity-50 cursor-not-allowed":""}`,"aria-label":"Decrease quantity",children:n[`update-${t.id}`]||n[`remove-${t.id}`]?e.jsx("span",{className:"material-icons animate-spin text-xs",children:"refresh"}):"−"}),e.jsx("span",{className:"w-8 text-center",children:t.quantity}),e.jsx("button",{onClick:()=>m(t,t.quantity+1),disabled:n[`update-${t.id}`],className:`px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ${n[`update-${t.id}`]?"opacity-50 cursor-not-allowed":""}`,"aria-label":"Increase quantity",children:n[`update-${t.id}`]?e.jsx("span",{className:"material-icons animate-spin text-xs",children:"refresh"}):"+"})]})}),e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",children:["$",(t.price*t.quantity).toFixed(2)]}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-right",children:e.jsx("button",{onClick:()=>g(t),disabled:n[`remove-${t.id}`],className:`text-red-600 hover:text-red-900 text-sm font-medium ${n[`remove-${t.id}`]?"opacity-50 cursor-not-allowed":""}`,children:n[`remove-${t.id}`]?e.jsx("span",{className:"material-icons animate-spin text-xs",children:"refresh"}):"Remove"})})]},t.id))})]})}),i&&e.jsxs("div",{className:"bg-gray-50 px-6 py-4 border-t border-gray-200",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsxs("span",{className:"text-lg font-medium text-gray-900",children:[i.totalLabel||"Subtotal",":"]}),e.jsxs("span",{className:"text-lg font-bold text-gray-900",children:["$",h.toFixed(2)]})]}),i.checkoutButton&&e.jsx("button",{onClick:y,disabled:n.checkout,className:`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg ${n.checkout?"opacity-50 cursor-not-allowed":""}`,children:n.checkout?e.jsx("span",{className:"material-icons animate-spin",children:"refresh"}):i.checkoutButton.label||"Proceed to Checkout"})]})]}):e.jsx("div",{className:"bg-white rounded-lg shadow p-8 text-center",children:e.jsx("p",{className:"text-gray-500",children:u})})]})})};f.__docgenInfo={description:"Cart component - displays shopping cart items and checkout options",methods:[],displayName:"Cart",props:{title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Your Cart'",computed:!1}},items:{required:!1,tsType:{name:"Array",elements:[{name:"CartItem"}],raw:"CartItem[]"},description:"",defaultValue:{value:"[]",computed:!1}},emptyCartMessage:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Your cart is empty.'",computed:!1}},summary:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  totalLabel?: string;
  totalPrice?: number | string;
  checkoutButton?: {
    label?: string;
    onClick?: Action;
  };
}`,signature:{properties:[{key:"totalLabel",value:{name:"string",required:!1}},{key:"totalPrice",value:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}],required:!1}},{key:"checkoutButton",value:{name:"signature",type:"object",raw:`{
  label?: string;
  onClick?: Action;
}`,signature:{properties:[{key:"label",value:{name:"string",required:!1}},{key:"onClick",value:{name:"union",raw:`| NavigateAction
| ClosePopupAction
| RedirectAction
| ApiAction
| AnalyticsAction
| PixelAction
| IframeAction
| CustomHtmlAction
| SetStateAction
| ChainAction
| ParallelAction
| ConditionalAction
| DelayAction
| LogAction
| CartAction
| PluginAction`,elements:[{name:"NavigateAction"},{name:"ClosePopupAction"},{name:"RedirectAction"},{name:"ApiAction"},{name:"AnalyticsAction"},{name:"PixelAction"},{name:"IframeAction"},{name:"CustomHtmlAction"},{name:"SetStateAction"},{name:"ChainAction"},{name:"ParallelAction"},{name:"ConditionalAction"},{name:"DelayAction"},{name:"LogAction"},{name:"CartAction"},{name:"PluginAction"}],required:!1}}]},required:!1}}]}},description:""},dispatcher:{required:!1,tsType:{name:"ActionDispatcher"},description:""},actions:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"union",raw:`| NavigateAction
| ClosePopupAction
| RedirectAction
| ApiAction
| AnalyticsAction
| PixelAction
| IframeAction
| CustomHtmlAction
| SetStateAction
| ChainAction
| ParallelAction
| ConditionalAction
| DelayAction
| LogAction
| CartAction
| PluginAction`,elements:[{name:"NavigateAction"},{name:"ClosePopupAction"},{name:"RedirectAction"},{name:"ApiAction"},{name:"AnalyticsAction"},{name:"PixelAction"},{name:"IframeAction"},{name:"CustomHtmlAction"},{name:"SetStateAction"},{name:"ChainAction"},{name:"ParallelAction"},{name:"ConditionalAction"},{name:"DelayAction"},{name:"LogAction"},{name:"CartAction"},{name:"PluginAction"}]}],raw:"Record<string, Action>"},description:""},state:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},description:""}}};export{f as default};
