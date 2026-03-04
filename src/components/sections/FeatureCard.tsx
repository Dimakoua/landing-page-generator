import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
  primaryButton?: { label?: string; onClick?: Action };
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  dispatcher?: ActionDispatcher;
}

/**
 * FeatureCard component - A compact card for highlighting features or examples.
 * Optimized for "small squares" layout.
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  image,
  primaryButton,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  descriptionClassName = '',
  buttonClassName = '',
  dispatcher,
}) => {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card-level click if any
    if (primaryButton?.onClick) {
      dispatchWithLoading('primaryButton', primaryButton.onClick);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all p-6 group shadow-sm hover:shadow-md overflow-hidden ${className}`}>
      {/* Image Header */}
      {image && (
        <div className="-mx-6 -mt-6 mb-6 overflow-hidden h-40">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}

      {/* Icon / Subtitle */}
      {(icon || subtitle) && (
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">{icon}</span>
            </div>
          )}
          {subtitle && (
            <span className={`text-xs uppercase tracking-widest font-bold opacity-50 ${subtitleClassName}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-grow">
        <h3 className={`text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-2 ${titleClassName}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${descriptionClassName}`}>
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {primaryButton && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={handleButtonClick}
            disabled={loading.primaryButton}
            className={`w-full py-2.5 px-4 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-blue-500/20 ${buttonClassName} ${loading.primaryButton ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.primaryButton ? (
              <span className="material-icons text-sm animate-spin">refresh</span>
            ) : (
              <>
                {primaryButton.label || 'View Details'}
                <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
