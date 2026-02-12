import React from 'react';
import type { ActionContext, Action } from '../../schemas/actions';

export interface RecProduct {
  id?: string;
  title: string;
  price?: string | number;
  image?: string;
  cta?: { label?: string; onClick?: Action };
}

interface RecommendedProductsProps {
  title?: string;
  products?: RecProduct[];
  dispatcher?: ActionContext;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  title = 'Complete Your Setup',
  products = [],
  dispatcher,
}) => {
  const handleClick = (action?: Action) => {
    if (action && dispatcher) dispatcher.dispatch(action).catch(console.error);
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {products.map((p, i) => (
            <article key={p.id || i} className="snap-start flex-shrink-0 w-64 bg-background-light dark:bg-background-dark rounded-xl border border-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group cursor-pointer p-4">
              <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{p.title}</h3>
              <p className="text-primary font-bold">{typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}</p>
              <button
                onClick={() => handleClick(p.cta?.onClick)}
                className="mt-3 w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-primary hover:text-white transition-colors"
              >
                {p.cta?.label || 'Add to Order'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
