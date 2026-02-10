import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: number;
  // Action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const Features: React.FC<FeaturesProps> = ({
  title,
  subtitle,
  features,
  columns = 3
}) => {

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                <span dangerouslySetInnerHTML={{ __html: title }} />
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${gridCols[columns as keyof typeof gridCols] || gridCols[3]}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {feature.icon && (
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
              )}
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
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