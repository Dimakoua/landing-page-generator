import React, { useState } from 'react';
import type { ActionContext, Action } from '../../schemas/actions';

interface SpecField { label: string; value: string }

interface AccordionItem {
  id?: string;
  title: string;
  // content can be a plain string OR an array of spec fields (label/value)
  content?: string | SpecField[];
  icon?: string;
  action?: Action;
}

interface AccordionProps {
  items?: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string | string[];
  dispatcher?: ActionContext;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Accordion component - Collapsible accordion sections
 */
const Accordion: React.FC<AccordionProps> = ({
  items = [],
  allowMultiple = false,
  defaultOpen,
  dispatcher,
  actions,
  state,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (defaultOpen) {
      if (Array.isArray(defaultOpen)) {
        defaultOpen.forEach(id => initial.add(id));
      } else {
        initial.add(defaultOpen);
      }
    }
    return initial;
  });

  const toggleItem = (itemId: string, action?: Action) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });

    // Trigger action if provided
    if (action && dispatcher) {
      dispatcher.dispatch(action).catch(err =>
        console.error('Accordion action failed:', err)
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-2">
        {items.map((item, index) => {
          const itemId = item.id || `item-${index}`;
          const isOpen = openItems.has(itemId);

          return (
            <div key={itemId} className="border border-slate-200 rounded-lg overflow-hidden bg-background-light dark:bg-background-dark">
              {/* Header */}
              <button
                onClick={() => toggleItem(itemId, item.action)}
                className="w-full flex items-center justify-between p-5 text-left bg-background-light dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  {item.icon && <span className="text-xl">{item.icon}</span>}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>

                {/* material icon to match design */}
                <span className={`material-icons transition-transform ${isOpen ? 'text-primary rotate-180' : 'text-slate-400 group-hover:text-primary'}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {/* Content */}
              {isOpen && item.content && (
                <div className="p-5 pt-0 border-t border-slate-200 dark:border-slate-700/50">
                  {/* support string content or structured spec list */}
                  {typeof item.content === 'string' ? (
                    <p className="text-slate-700 dark:text-slate-300">{item.content}</p>
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
                      {item.content.map((field, i) => (
                        <div key={i}>
                          <dt className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{field.label}</dt>
                          <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accordion;
