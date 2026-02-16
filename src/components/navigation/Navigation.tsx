import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

interface NavigationProps {
  logo?: {
    text?: string;
    image?: string;
    onClick?: Action;
  };
  menuItems?: Array<{
    label: string;
    action?: Action;
  }>;
  cartIcon?: {
    itemCount?: number | string;
    action?: Action;
  };
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Navigation component - renders header with logo, menu, and optional cart
 */
const Navigation: React.FC<NavigationProps> = ({
  logo,
  menuItems,
  cartIcon,
  dispatcher,
  actions,
}) => {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);
  const handleLogoClick = () => {
    dispatchWithLoading('logo', logo?.onClick);
  };

  /**
   * Handle menu item clicks by dispatching the associated action
   */
  const handleMenuClick = (idx: number, action?: Action) => {
    dispatchWithLoading(`menu-${idx}`, action);
  };

  const handleCartClick = () => {
    dispatchWithLoading('cart', cartIcon?.action);
  };

  const splitLogo = (text = '') => {
    // split on camelCase boundary (e.g. SonicFlow -> Sonic / Flow) or first space
    const spaceIndex = text.indexOf(' ');
    if (spaceIndex > -1) return [text.slice(0, spaceIndex), text.slice(spaceIndex + 1)];
    const match = text.match(/(.*?)([A-Z][a-z0-9].*)$/);
    if (match) return [match[1], match[2]];
    // fallback: split in half
    const mid = Math.ceil(text.length / 2);
    return [text.slice(0, mid), text.slice(mid)];
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div role={logo?.onClick ? 'button' : undefined} tabIndex={logo?.onClick ? 0 : undefined} onClick={handleLogoClick} className={`flex-shrink-0 flex items-center ${logo?.onClick ? `cursor-pointer hover:opacity-80 transition-opacity ${loading.logo ? 'pointer-events-none opacity-50' : ''}` : ''}`}>
            {logo?.image ? (
              <img src={logo.image} alt="Logo" className="h-8" />
            ) : (
              (() => {
                const [a, b] = splitLogo(logo?.text || 'Brand');
                return (
                  <span className="text-2xl font-bold text-primary tracking-tight">
                    {a}
                    <span className="ml-0 text-slate-900 dark:text-white">{b}</span>
                  </span>
                );
              })()
            )}
          </div>

          {/* Center Links (Desktop) */}
          {menuItems && (
            <div className="hidden md:flex space-x-8">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMenuClick(idx, item.action)}
                  disabled={loading[`menu-${idx}`]}
                  className={`text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center space-x-1 ${loading[`menu-${idx}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading[`menu-${idx}`] && <span className="material-icons animate-spin text-xs">refresh</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              aria-label="Search"
              onClick={() => dispatchWithLoading('search', actions?.search)}
              disabled={loading.search}
              className={`text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors ${loading.search ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading.search ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">search</span>}
            </button>

            {cartIcon && (
              <button
                onClick={handleCartClick}
                aria-label="Cart"
                disabled={loading.cart}
                className={`relative text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors ${loading.cart ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading.cart ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">shopping_bag</span>}
                {cartIcon.itemCount ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{cartIcon.itemCount}</span>
                ) : null}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
