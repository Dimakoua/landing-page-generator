import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface Plan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: Array<{
    name: string;
    included: boolean;
    value?: string;
  }>;
  highlighted?: boolean;
  ctaLabel?: string;
  ctaAction?: Action | Action[];
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  plans: Plan[];
  dispatcher?: ActionDispatcher;
}

export default function ComparisonTable({
  title,
  subtitle,
  plans,
  dispatcher
}: ComparisonTableProps) {
  const handleCtaClick = async (plan: Plan) => {
    if (plan.ctaAction && dispatcher) {
      const actions = Array.isArray(plan.ctaAction) ? plan.ctaAction : [plan.ctaAction];
      for (const action of actions) {
        await dispatcher.dispatch(action);
      }
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Mobile: Stacked cards */}
        <div className="block lg:hidden space-y-6">
          {plans.map((plan, planIndex) => (
            <div
              key={planIndex}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 transition-all ${
                plan.highlighted
                  ? 'border-[var(--color-primary)] shadow-[var(--color-primary)]/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-[var(--color-primary)]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-500 dark:text-slate-400">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {feature.name}
                        {feature.value && (
                          <span className="font-medium text-[var(--color-primary)] ml-1">
                            {feature.value}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.ctaLabel && plan.ctaAction && (
                  <button
                    onClick={() => handleCtaClick(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-6 font-semibold text-slate-900 dark:text-white">
                  Features
                </th>
                {plans.map((plan, index) => (
                  <th
                    key={index}
                    className={`text-center p-6 ${
                      plan.highlighted ? 'bg-[var(--color-primary)]/5' : ''
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold text-[var(--color-primary)]">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-slate-500 dark:text-slate-400">
                            /{plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                    {plan.ctaLabel && plan.ctaAction && (
                      <button
                        onClick={() => handleCtaClick(plan)}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                          plan.highlighted
                            ? 'bg-[var(--color-primary)] text-white hover:opacity-90'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {plan.ctaLabel}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans[0]?.features.map((_, featureIndex) => (
                <tr key={featureIndex} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="p-6 font-medium text-slate-900 dark:text-white">
                    {plans[0].features[featureIndex].name}
                  </td>
                  {plans.map((plan, planIndex) => {
                    const feature = plan.features[featureIndex];
                    return (
                      <td
                        key={planIndex}
                        className={`p-6 text-center ${
                          plan.highlighted ? 'bg-[var(--color-primary)]/5' : ''
                        }`}
                      >
                        {feature.included ? (
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature.value && (
                              <span className="ml-2 font-medium text-[var(--color-primary)]">
                                {feature.value}
                              </span>
                            )}
                          </div>
                        ) : (
                          <svg className="w-5 h-5 text-slate-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}