import React from 'react';
import type { Action } from '../../schemas/actions';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

interface CartProps {
  title?: string;
  items?: CartItem[];
  emptyCartMessage?: string;
  summary?: {
    totalLabel?: string;
    totalPrice?: number | string;
    checkoutButton?: {
      label?: string;
      onClick?: Action;
    };
  };
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Cart component - displays shopping cart items and checkout options
 */
const Cart: React.FC<CartProps> = ({
  title = 'Your Cart',
  items = [],
  emptyCartMessage = 'Your cart is empty.',
  summary,
  dispatcher,
  state,
}) => {
  // Get items from props or fallback to state
  // Get items from props (populated by layout) or fallback to state
  const cartState = state?.cart as { items?: CartItem[]; totalPrice?: number } | undefined;
  const displayItems = items.length > 0 ? items : (cartState?.items || []);

  // Get total price from state or calculate from items
  const totalPrice = cartState?.totalPrice || displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!summary?.checkoutButton?.onClick || !dispatcher) return;

    dispatcher.dispatch(summary.checkoutButton.onClick).catch((err: unknown) =>
      console.error('Checkout action failed:', err)
    );
  };

  const updateQuantity = (item: CartItem, quantity: number) => {
    if (!dispatcher) return;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const removeAction: Action = {
        type: 'cart',
        operation: 'remove',
        item,
      };
      dispatcher.dispatch(removeAction).catch((err: unknown) =>
        console.error('Remove item failed:', err)
      );
    } else {
      // Update quantity
      const updateAction: Action = {
        type: 'cart',
        operation: 'update',
        item: { ...item, quantity },
      };
      dispatcher.dispatch(updateAction).catch((err: unknown) =>
        console.error('Update item failed:', err)
      );
    }
  };

  const removeItem = (item: CartItem) => {
    if (!dispatcher) return;

    const removeAction: Action = {
      type: 'cart',
      operation: 'remove',
      item,
    };
    dispatcher.dispatch(removeAction).catch((err: unknown) =>
      console.error('Remove item failed:', err)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Cart Items */}
        {displayItems && displayItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover mr-4"
                            />
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">
                              {item.name}
                            </span>
                            {item.color && (
                              <span className="text-xs text-gray-500 block">
                                Color: {item.color}
                              </span>
                            )}
                            {item.description && (
                              <span className="text-xs text-gray-500 block mt-1">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => removeItem(item)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {summary && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-900">
                    {summary.totalLabel || 'Subtotal'}:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                {summary.checkoutButton && (
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                  >
                    {summary.checkoutButton.label || 'Proceed to Checkout'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">{emptyCartMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
