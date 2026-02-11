import { useState } from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface MenuItem {
  label: string;
  href?: string;
  actions?: {
    approve?: Action | Action[];
  };
}

interface Button {
  label: string;
  href?: string;
}

interface Logo {
  icon?: string;
  text?: string;
  src?: string;
}

interface NavigationProps {
  logo?: Logo | string;
  logoText?: string;
  menuItems?: MenuItem[];
  ctaButton?: Button;
  ctaLabel?: string;
  ctaAction?: Action | Action[];
  secondaryButton?: Button;
  secondaryLabel?: string;
  secondaryAction?: Action | Action[];
  sticky?: boolean;
  mobileMenu?: boolean;
  dispatcher?: ActionDispatcher;
  actions?: {
    cta?: Action | Action[];
    secondary?: Action | Action[];
  };
}

export default function Navigation({
  logo,
  logoText = 'Brand',
  menuItems = [],
  ctaButton,
  ctaLabel,
  ctaAction,
  secondaryButton,
  secondaryLabel,
  secondaryAction,
  sticky = true,
  mobileMenu = true,
  dispatcher,
  actions
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Support both old and new logo formats
  const logoObj = typeof logo === 'object' ? logo : { text: logoText };
  const finalLogoText = logoObj.text || logoText;
  const logoIcon = logoObj.icon;
  const logoSrc = logoObj.src || (typeof logo === 'string' ? logo : undefined);

  // Support both old and new button formats
  const ctaBtnLabel = ctaButton?.label || ctaLabel;
  const secondaryBtnLabel = secondaryButton?.label || secondaryLabel;
  const ctaActions = actions?.cta || ctaAction;
  const secondaryActions = actions?.secondary || secondaryAction;

  const handleMenuItemClick = async (item: MenuItem) => {
    if (item.actions?.approve && dispatcher) {
      const actionList = Array.isArray(item.actions.approve) ? item.actions.approve : [item.actions.approve];
      for (const action of actionList) {
        await dispatcher.dispatch(action);
      }
    }
    setMobileMenuOpen(false);
  };

  const handleCtaClick = async () => {
    if (ctaActions && dispatcher) {
      const actionList = Array.isArray(ctaActions) ? ctaActions : [ctaActions];
      for (const action of actionList) {
        await dispatcher.dispatch(action);
      }
    }
  };

  const handleSecondaryClick = async () => {
    if (secondaryActions && dispatcher) {
      const actionList = Array.isArray(secondaryActions) ? secondaryActions : [secondaryActions];
      for (const action of actionList) {
        await dispatcher.dispatch(action);
      }
    }
  };

  return (
    <nav className={`${sticky ? 'fixed top-0' : 'relative'} z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {logoSrc ? (
              <img src={logoSrc} alt={finalLogoText} className="h-8 w-auto" />
            ) : logoIcon ? (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <span className="material-icons-outlined text-white text-xl">{logoIcon}</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                {finalLogoText.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">{finalLogoText}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item)}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            {secondaryBtnLabel && (
              <button
                onClick={handleSecondaryClick}
                className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
              >
                {secondaryBtnLabel}
              </button>
            )}
            {ctaBtnLabel && (
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-[0_0_15px_rgba(19,91,236,0.3)] hover:shadow-[0_0_20px_rgba(19,91,236,0.5)]"
              >
                {ctaBtnLabel}
              </button>
            )}
            
            {/* Mobile Menu Button */}
            {mobileMenu && (
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenu && mobileMenuOpen && (
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
            {secondaryBtnLabel && (
              <button
                onClick={handleSecondaryClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {secondaryBtnLabel}
              </button>
            )}
            {ctaBtnLabel && (
              <button
                onClick={handleCtaClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-[var(--color-primary)] hover:opacity-90 transition-all"
              >
                {ctaBtnLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

