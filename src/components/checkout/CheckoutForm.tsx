import React from 'react';
import type { Action } from '../../schemas/actions';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import { validators } from '../../utils/validators';
import { masks } from '../../utils/masks';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validator?: string;
  mask?: string;
  placeholder?: string;
}

interface FormConfig {
  id: string;
  fields: FormField[];
  submitButton: {
    label: string;
    onClick?: Action;
  };
}

interface CheckoutFormProps {
  title?: string;
  form: FormConfig;
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * CheckoutForm component - handles customer information and payment form
 */
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  title = 'Checkout',
  form,
  dispatcher,
  state,
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);
  React.useEffect(() => {
    if (state && state[form.id]) {
      const initialData = state[form.id] as Record<string, string>;
      console.log(`[CheckoutForm] Initializing from state[${form.id}]:`, initialData);
      setFormData(initialData);
    }
  }, [state, form.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Find the field to check for mask
    const field = form.fields.find(f => f.name === name);
    const maskedValue = field?.mask && masks[field.mask] ? masks[field.mask](value) : value;
    
    const newFormData = {
      ...formData,
      [name]: maskedValue,
    };
    setFormData(newFormData);
    
    // Store form data in global state so actions can access it
    if (dispatcher) {
      const setStateAction = {
        type: 'setState' as const,
        key: form.id,
        value: newFormData,
        merge: true
      };
      dispatcher.dispatch(setStateAction).catch(err =>
        console.error('Failed to store form data:', err)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dispatcher || !form.submitButton.onClick) return;

    // Validate fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    for (const field of form.fields) {
      if (field.validator && validators[field.validator]) {
        const error = validators[field.validator](formData[field.name] || '');
        if (error) {
          newErrors[field.name] = error;
          hasErrors = true;
        }
      }
    }
    setErrors(newErrors);
    if (hasErrors) return;

    // Dispatch the submit action
    dispatchWithLoading('submit', form.submitButton.onClick);
  };

  // classify payment vs shipping fields by name
  const isPaymentField = (name: string) => /card|cvv|expiry|exp|payment|cc-number/i.test(name);
  const shippingFields = form.fields.filter(f => !isPaymentField(f.name));
  const paymentFields = form.fields.filter(f => isPaymentField(f.name));

  // pull a simple cart summary from provided state (optional)
  const rawCart = (state && (state as any).cart) || null;
  const cartItems = rawCart && Array.isArray(rawCart.items) ? rawCart.items : [];

  // derive subtotal from available keys (subtotal | totalPrice | calculate from items)
  const derivedSubtotal = typeof rawCart?.subtotal === 'number'
    ? rawCart.subtotal
    : typeof rawCart?.totalPrice === 'number'
      ? rawCart.totalPrice
      : cartItems.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

  // support shipping or shippingCost (fallback to 0)
  const shippingCost = typeof rawCart?.shipping === 'number'
    ? rawCart.shipping
    : typeof rawCart?.shippingCost === 'number'
      ? rawCart.shippingCost
      : 0;

  // derive total (total | totalPrice | subtotal + shipping)
  const derivedTotal = typeof rawCart?.total === 'number'
    ? rawCart.total
    : typeof rawCart?.totalPrice === 'number'
      ? rawCart.totalPrice
      : derivedSubtotal + shippingCost;

  const cart = {
    items: cartItems,
    subtotal: derivedSubtotal,
    shipping: shippingCost,
    total: derivedTotal,
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="sr-only">{title}</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Left column: form sections */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shippingFields.map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors[field.name] && (
                    <span className="text-red-500 text-sm mt-1">{errors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentFields.map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors[field.name] && (
                    <span className="text-red-500 text-sm mt-1">{errors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: order summary + action card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            {cart && Array.isArray(cart.items) ? (
              <div>
                {cart.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 rounded-md object-cover" />}
                      <div>
                        <div className="font-medium text-sm">{it.name}</div>
                        <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-medium">${(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <div className="border-t pt-3 mt-3 text-sm text-gray-700">
                  <div className="flex justify-between mb-2"><span>Subtotal</span><span>${(cart.subtotal || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between mb-2"><span>Shipping</span><span>{cart.shipping ? `$${cart.shipping.toFixed(2)}` : 'Free'}</span></div>
                  <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${(cart.total || cart.subtotal || 0).toFixed(2)}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No cart data — summary will appear here.</div>
            )}
          </div>

          <div className="p-6 bg-pink-600 text-white rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2">Complete Your Order</h4>
            <p className="text-sm mb-4 opacity-90">Secure checkout with SSL encryption</p>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading.submit}
                className={`flex-1 bg-white text-pink-600 py-3 rounded-md font-semibold hover:opacity-95 transition-colors ${loading.submit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading.submit ? <span className="material-icons animate-spin">refresh</span> : form.submitButton.label}
              </button>

              <button type="button" className="px-4 py-3 border border-white/60 rounded-md bg-transparent text-white font-medium">
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;