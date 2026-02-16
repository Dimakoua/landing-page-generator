import{j as e}from"./jsx-runtime-u17CrQMm.js";import"./index-Bi6L2ga8.js";import{u as x}from"./useActionDispatch-DI3rZtA0.js";const p=({title:c="Success!",message:l="Your action has been completed successfully.",userInfo:t,orderItems:s=[],orderTotal:o,button:a,dispatcher:r})=>{const{loading:i,dispatchWithLoading:m}=x(r),d=()=>{m("button",a?.onClick)};return e.jsxs("div",{className:"max-w-4xl mx-auto p-8",children:[e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("div",{className:"w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",children:e.jsx("svg",{className:"w-8 h-8 text-green-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})})}),e.jsx("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:c}),e.jsx("p",{className:"text-lg text-gray-600",children:l})]}),t&&e.jsxs("div",{className:"bg-gray-50 rounded-lg p-6 mb-6",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-800 mb-4",children:"Customer Information"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Name:"}),e.jsxs("span",{className:"ml-2 text-gray-900",children:[t.firstName," ",t.lastName]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Email:"}),e.jsx("span",{className:"ml-2 text-gray-900",children:t.email})]})]})]}),s.length>0&&e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg p-6 mb-6",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-800 mb-4",children:"Order Details"}),e.jsx("div",{className:"space-y-4",children:s.map((n,u)=>e.jsxs("div",{className:"flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-medium text-gray-900",children:n.name}),n.color&&e.jsxs("p",{className:"text-sm text-gray-600",children:["Color: ",n.color]}),e.jsxs("p",{className:"text-sm text-gray-600",children:["Quantity: ",n.quantity]})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("p",{className:"font-semibold text-gray-900",children:["$",(n.price*n.quantity).toFixed(2)]}),e.jsxs("p",{className:"text-sm text-gray-600",children:["$",n.price.toFixed(2)," each"]})]})]},n.id||u))}),o&&e.jsx("div",{className:"mt-6 pt-4 border-t border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-semibold text-gray-900",children:"Total:"}),e.jsxs("span",{className:"text-lg font-bold text-gray-900",children:["$",o.toFixed(2)]})]})})]}),a&&e.jsx("div",{className:"text-center",children:e.jsx("button",{onClick:d,disabled:i.button,className:`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium ${i.button?"opacity-50 cursor-not-allowed":""}`,children:i.button?e.jsx("span",{className:"material-icons animate-spin",children:"refresh"}):a.label||"Continue"})})]})};p.__docgenInfo={description:"Confirmation component - displays success message and next action button",methods:[],displayName:"Confirmation",props:{title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Success!'",computed:!1}},message:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Your action has been completed successfully.'",computed:!1}},userInfo:{required:!1,tsType:{name:"UserInfo"},description:""},orderItems:{required:!1,tsType:{name:"Array",elements:[{name:"CartItem"}],raw:"CartItem[]"},description:"",defaultValue:{value:"[]",computed:!1}},orderTotal:{required:!1,tsType:{name:"number"},description:""},button:{required:!1,tsType:{name:"signature",type:"object",raw:`{
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
| PluginAction`,elements:[{name:"NavigateAction"},{name:"ClosePopupAction"},{name:"RedirectAction"},{name:"ApiAction"},{name:"AnalyticsAction"},{name:"PixelAction"},{name:"IframeAction"},{name:"CustomHtmlAction"},{name:"SetStateAction"},{name:"ChainAction"},{name:"ParallelAction"},{name:"ConditionalAction"},{name:"DelayAction"},{name:"LogAction"},{name:"CartAction"},{name:"PluginAction"}],required:!1}}]}},description:""},dispatcher:{required:!1,tsType:{name:"ActionDispatcher"},description:""},actions:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"union",raw:`| NavigateAction
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
| PluginAction`,elements:[{name:"NavigateAction"},{name:"ClosePopupAction"},{name:"RedirectAction"},{name:"ApiAction"},{name:"AnalyticsAction"},{name:"PixelAction"},{name:"IframeAction"},{name:"CustomHtmlAction"},{name:"SetStateAction"},{name:"ChainAction"},{name:"ParallelAction"},{name:"ConditionalAction"},{name:"DelayAction"},{name:"LogAction"},{name:"CartAction"},{name:"PluginAction"}]}],raw:"Record<string, Action>"},description:""},state:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},description:""}}};export{p as default};
