import React from 'react';
import type { ActionContext, Action } from '../../schemas/actions';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ConfirmationProps {
  title?: string;
  message?: string;
  userInfo?: UserInfo;
  orderItems?: CartItem[];
  orderTotal?: number;
  button?: {
    label?: string;
    onClick?: Action;
  };
  dispatcher?: ActionContext;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Confirmation component - displays success message and next action button
 */
const Confirmation: React.FC<ConfirmationProps> = ({
  title = 'Success!',
  message = 'Your action has been completed successfully.',
  userInfo,
  orderItems = [],
  orderTotal,
  button,
  dispatcher,
  actions,
  state,
}) => {
  const handleButtonClick = () => {
    if (!button?.onClick || !dispatcher) return;

    dispatcher.dispatch(button.onClick).catch(err =>
      console.error('Confirmation button action failed:', err)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-lg text-gray-600">{message}</p>
      </div>

      {/* User Information */}
      {userInfo && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">
                {userInfo.firstName} {userInfo.lastName}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{userInfo.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      {orderItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.color && (
                    <p className="text-sm text-gray-600">Color: {item.color}</p>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
          {orderTotal && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {button && (
        <div className="text-center">
          <button
            onClick={handleButtonClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {button.label || 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Confirmation;