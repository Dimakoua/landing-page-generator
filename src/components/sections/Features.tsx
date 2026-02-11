import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface Feature {
  icon?: string;
  title: string;
  description: string;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'green' | 'red' | 'indigo';
}

interface FeaturesProps {
  id?: string;
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: number;
  cardStyle?: 'default' | 'bordered' | 'shadow';
  backgroundColor?: string;
  // Action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const Features: React.FC<FeaturesProps> = ({
  id,
  title,
  subtitle,
  features,
  columns = 3,
  cardStyle = 'default',
  backgroundColor = ''
}) => {

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const getColorClasses = (color?: string) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  };

  const getCardClasses = () => {
    const baseClasses = 'group p-8 rounded-xl transition-all';
    switch (cardStyle) {
      case 'bordered':
        return `${baseClasses} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-primary)]/5`;
      case 'shadow':
        return `${baseClasses} bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1`;
      default:
        return `${baseClasses} bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1`;
    }
  };

  return (
    <section id={id} className={`py-24 relative overflow-hidden ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                <span dangerouslySetInnerHTML={{ __html: title }} />
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-6 ${gridCols[columns as keyof typeof gridCols] || gridCols[3]}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={getCardClasses()}
            >
              {feature.icon && (
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${getColorClasses(feature.color)}`}>
                  <span className="material-icons-outlined text-2xl">{feature.icon}</span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;