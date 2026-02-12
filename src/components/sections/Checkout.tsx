import React, { useState } from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  width?: 'full' | 'half';
}

interface CheckoutProps {
  title?: string;
  backgroundColor?: string;
  shippingFields?: FormField[];
  paymentFields?: FormField[];
  dispatcher?: ActionDispatcher;
  state?: Record<string, unknown>;
  onsuccess?: Action;
  onfail?: Action;
}

const Checkout: React.FC<CheckoutProps> = ({
  title = "Checkout",
  backgroundColor = '',
  shippingFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John', width: 'half' },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe', width: 'half' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@example.com', width: 'full' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+1 (555) 123-4567', width: 'full' },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: '123 Main St', width: 'full' },
    { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'New York', width: 'half' },
    { name: 'zipCode', label: 'ZIP Code', type: 'text', required: true, placeholder: '10001', width: 'half' }
  ],
  paymentFields = [
    { name: 'cardNumber', label: 'Card Number', type: 'text', required: true, placeholder: '1234 5678 9012 3456', width: 'full' },
    { name: 'expiryDate', label: 'Expiry Date', type: 'text', required: true, placeholder: 'MM/YY', width: 'half' },
    { name: 'cvv', label: 'CVV', type: 'text', required: true, placeholder: '123', width: 'half' },
    { name: 'nameOnCard', label: 'Name on Card', type: 'text', required: true, placeholder: 'John Doe', width: 'full' }
  ],
  dispatcher,
  state,
  onsuccess,
  onfail
}) => {
  const cartItems = (state?.cart as CartItem[]) || [];
  // Initialize form data based on all fields
  const allFields = [...shippingFields, ...paymentFields];
  const getInitialFormData = () => {
    const initialData: Record<string, string | boolean> = {};
    allFields.forEach(field => {
      initialData[field.name] = field.type === 'checkbox' ? false : '';
    });
    return initialData;
  };
  const [formData, setFormData] = useState<Record<string, string | boolean>>(getInitialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatcher) {
      const orderData = {
        customer: Object.fromEntries(
          shippingFields.map(field => [field.name, formData[field.name]])
        ),
        payment: Object.fromEntries(
          paymentFields.map(field => [field.name, formData[field.name]])
        ),
        items: cartItems,
        total: calculateTotal()
      };

      try {
        // Attempt to send order to API
        await dispatcher.dispatch({
          type: 'post',
          url: 'https://api.example.com/orders',
          payload: orderData,
          timeout: 10000,
          retries: 0
        });

        // API call succeeded
        if (onsuccess) {
          await dispatcher.dispatch(onsuccess);
        } else {
          // Default: navigate to success page
          await dispatcher.dispatch({
            type: 'navigate',
            url: 'success'
          });
        }

        // Reset state after successful submission
        await dispatcher.dispatch({
          type: 'cart',
          operation: 'clear'
        });
        setFormData(getInitialFormData());
      } catch (error) {
        // API call failed
        console.warn('API call failed:', error);
        if (onfail) {
          await dispatcher.dispatch(onfail);
        } else {
          // Default: still navigate to success page for demo purposes
          await dispatcher.dispatch({
            type: 'navigate',
            url: 'success'
          });
        }
      }
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping: number = subtotal > 0 ? 0 : 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const calculateTotal = () => total;

  return (
    <div className={`max-w-6xl mx-auto ${backgroundColor}`}>
      <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping & Payment Forms */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="space-y-4">
                {(() => {
                  const rows: FormField[][] = [];
                  let currentRow: FormField[] = [];
                  
                  shippingFields.forEach((field) => {
                    if (field.width === 'half') {
                      currentRow.push(field);
                      if (currentRow.length === 2) {
                        rows.push([...currentRow]);
                        currentRow = [];
                      }
                    } else {
                      if (currentRow.length > 0) {
                        rows.push([...currentRow]);
                        currentRow = [];
                      }
                      rows.push([field]);
                    }
                  });
                  
                  if (currentRow.length > 0) {
                    rows.push(currentRow);
                  }
                  
                  return rows.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className={row.length === 2 ? 'grid grid-cols-2 gap-4' : ''}>
                      {row.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={field.type === 'checkbox' ? undefined : (formData[field.name] as string) || ''}
                            checked={field.type === 'checkbox' ? !!formData[field.name] : undefined}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="space-y-4">
                {(() => {
                  const rows: FormField[][] = [];
                  let currentRow: FormField[] = [];
                  
                  paymentFields.forEach((field) => {
                    if (field.width === 'half') {
                      currentRow.push(field);
                      if (currentRow.length === 2) {
                        rows.push([...currentRow]);
                        currentRow = [];
                      }
                    } else {
                      if (currentRow.length > 0) {
                        rows.push([...currentRow]);
                        currentRow = [];
                      }
                      rows.push([field]);
                    }
                  });
                  
                  if (currentRow.length > 0) {
                    rows.push(currentRow);
                  }
                  
                  return rows.map((row, rowIndex) => (
                    <div key={`payment-row-${rowIndex}`} className={row.length === 2 ? 'grid grid-cols-2 gap-4' : ''}>
                      {row.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={field.type === 'checkbox' ? undefined : (formData[field.name] as string) || ''}
                            checked={field.type === 'checkbox' ? !!formData[field.name] : undefined}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="bg-primary text-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Complete Your Order</h3>
            <p className="text-sm mb-4 opacity-90">Secure checkout with SSL encryption</p>
            <div className="flex space-x-4">
              <button
                type="submit"
                form="checkout-form"
                className="flex-1 bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors"
              >
                Place Order
              </button>
              <button
                type="button"
                onClick={() => {
                  if (dispatcher) {
                    dispatcher.dispatch({
                      type: 'navigate',
                      url: 'cart'
                    });
                  }
                }}
                className="px-6 py-3 border border-white text-white rounded-md font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;