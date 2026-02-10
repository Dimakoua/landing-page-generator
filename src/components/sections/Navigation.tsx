import { useState } from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface MenuItem {
  label: string;
  actions?: {
    approve?: Action | Action[];
  };
}

interface NavigationProps {
  logo?: string;
  logoText?: string;
  menuItems?: MenuItem[];
  ctaLabel?: string;
  ctaAction?: Action | Action[];
  secondaryLabel?: string;
  secondaryAction?: Action | Action[];
  sticky?: boolean;
  dispatcher?: ActionDispatcher;
}

export default function Navigation({
  logo,
  logoText = 'Brand',
  menuItems = [],
  ctaLabel,
  ctaAction,
  secondaryLabel,
  secondaryAction,
  sticky = true,
  dispatcher
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuItemClick = async (item: MenuItem) => {
    if (item.actions?.approve && dispatcher) {
      const actions = Array.isArray(item.actions.approve) ? item.actions.approve : [item.actions.approve];
      for (const action of actions) {
        await dispatcher.dispatch(action);
      }
    }
    setMobileMenuOpen(false);
  };

  const handleCtaClick = async () => {
    if (ctaAction && dispatcher) {
      const actions = Array.isArray(ctaAction) ? ctaAction : [ctaAction];
      for (const action of actions) {
        await dispatcher.dispatch(action);
      }
    }
  };

  const handleSecondaryClick = async () => {
    if (secondaryAction && dispatcher) {
      const actions = Array.isArray(secondaryAction) ? secondaryAction : [secondaryAction];
      for (const action of actions) {
        await dispatcher.dispatch(action);
      }
    }
  };

  return (
    <nav className={`${sticky ? 'sticky top-0' : 'relative'} z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {logo && (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            )}
            {!logo && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                {logoText.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">{logoText}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item)}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {secondaryLabel && secondaryAction && (
              <button
                onClick={handleSecondaryClick}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {secondaryLabel}
              </button>
            )}
            {ctaLabel && ctaAction && (
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                {ctaLabel}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
            {secondaryLabel && secondaryAction && (
              <button
                onClick={handleSecondaryClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {secondaryLabel}
              </button>
            )}
            {ctaLabel && ctaAction && (
              <button
                onClick={handleCtaClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-[var(--color-primary)] hover:opacity-90 transition-all"
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
