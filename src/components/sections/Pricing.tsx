import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface PricingButton {
  label: string;
  variant?: 'primary' | 'outline' | 'default';
}

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
  button?: PricingButton;
  action?: PricingPlanAction;
  buttonText?: string;
  buttonAction?: string;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  backgroundColor?: string;
  // Action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const Pricing: React.FC<PricingProps> = ({
  title = "Choose Your Plan",
  subtitle,
  plans,
  backgroundColor = '',
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

  const getButtonClasses = (variant?: string, isPopular?: boolean) => {
    const baseClasses = 'w-full block text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    
    if (variant === 'primary' || isPopular) {
      return `${baseClasses} border border-transparent text-white bg-[var(--color-primary)] hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/25`;
    } else if (variant === 'outline') {
      return `${baseClasses} border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800`;
    }
    
    return `${baseClasses} border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800`;
  };

  return (
    <section className={`py-24 border-t border-slate-200 dark:border-slate-800 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              <span dangerouslySetInnerHTML={{ __html: title }} />
            </h2>
            {subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-xl flex flex-col h-full ${
                plan.popular 
                  ? 'bg-white dark:bg-slate-900 border border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 dark:ring-[var(--color-primary)]/40 shadow-2xl transform md:-translate-y-4' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                  <span className="inline-flex rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold leading-5 text-white shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className={`text-lg font-medium ${plan.popular ? 'text-[var(--color-primary)]' : 'text-slate-900 dark:text-white'}`}>
                {plan.name}
              </h3>

              <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-4xl font-bold tracking-tight">
                  {typeof plan.price === 'number' ? `$${plan.price.toLocaleString()}` : plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-xl font-semibold text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className={`material-icons-outlined text-sm mr-2 mt-0.5 ${plan.popular ? 'text-[var(--color-primary)]' : 'text-green-500'}`}>
                      check
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleAction(plan)}
                className={getButtonClasses(plan.button?.variant, plan.popular)}
              >
                {plan.button?.label || plan.action?.label || plan.buttonText || 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;