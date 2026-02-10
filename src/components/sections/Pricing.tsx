import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface PricingPlanAction {
  label: string;
  action: Action;
}

interface PricingPlan {
  name: string;
  price: string | number;
  currency?: string;
  interval?: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  action?: PricingPlanAction;
  buttonText?: string;
  buttonAction?: string;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  // Action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const Pricing: React.FC<PricingProps> = ({
  title = "Choose Your Plan",
  subtitle,
  plans,
  dispatcher,
  actions
}) => {
  const handleAction = async (plan: PricingPlan) => {
    if (dispatcher) {
      // Store the selected plan in state
      await dispatcher.dispatch({
        type: 'setState',
        key: 'selectedPlan',
        value: plan,
        merge: false
      });

      // Handle action if defined on the plan
      if (plan.action) {
        await dispatcher.dispatch(plan.action.action);
      } else if (plan.buttonAction && actions?.[plan.buttonAction]) {
        await dispatcher.dispatchNamed(plan.buttonAction, actions);
      }
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span dangerouslySetInnerHTML={{ __html: title }} />
            </h2>
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {typeof plan.price === 'number' ? `$${plan.price.toLocaleString()}` : plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">
                      /{plan.period}
                    </span>
                  )}
                  {plan.interval && plan.interval !== 'one-time' && (
                    <span className="text-gray-600 ml-1">
                      /{plan.interval}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                <ul className="mb-8 space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAction(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.action?.label || plan.buttonText || 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;