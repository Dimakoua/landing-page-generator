import React from 'react';

interface OrderSummaryProps {
  title?: string;
  showSelectedPlan?: boolean;
  showUpsells?: boolean;
  state?: Record<string, unknown>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  title = "Order Summary",
  showSelectedPlan = true,
  showUpsells = true,
  state
}) => {
  const selectedPlan = state?.selectedPlan as any;
  const upsells = state?.upsells as any;

  const calculateTotal = () => {
    let total = 0;

    if (selectedPlan?.price) {
      // Extract number from price string (e.g., "$1,997" -> 1997)
      const planPrice = parseInt(selectedPlan.price.replace(/[$,]/g, ''));
      total += planPrice;
    }

    if (upsells) {
      if (upsells.priority_support) total += 197;
      if (upsells.analytics_setup) total += 147;
      if (upsells.cro_audit) total += 297;
    }

    return total;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-4">
        {showSelectedPlan && selectedPlan && (
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">{selectedPlan.name}</h4>
              <p className="text-sm text-gray-600">{selectedPlan.description}</p>
            </div>
            <span className="font-semibold text-gray-900">{selectedPlan.price}</span>
          </div>
        )}

        {showUpsells && upsells && (
          <div className="space-y-2">
            {upsells.priority_support && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700">Priority Support & Fast Delivery</span>
                <span className="text-sm font-medium text-gray-900">$197</span>
              </div>
            )}
            {upsells.analytics_setup && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700">Analytics & A/B Testing Setup</span>
                <span className="text-sm font-medium text-gray-900">$147</span>
              </div>
            )}
            {upsells.cro_audit && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700">Conversion Rate Optimization Audit</span>
                <span className="text-sm font-medium text-gray-900">$297</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">${calculateTotal().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;