import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

export interface NavbarProps {
  /**
   * Logo configuration: either image or text. href/action optional.
   */
  logo?: {
    text?: string;
    image?: string;
    alt?: string;
    href?: string;
    onClick?: Action;
  };
  /**
   * Primary menu entries. Each item can either be a plain anchor (href) or
   * trigger an action via the dispatcher. href takes precedence if provided.
   */
  menuItems?: Array<{
    label: string;
    href?: string;
    action?: Action;
  }>;
  /**
   * Optional call‑to‑action button rendered alongside the menu on desktop.
   */
  cta?: {
    label: string;
    href?: string;
    action?: Action;
  };
  /**
   * Mobile toggle no longer accepts callbacks to keep props serializable.
   * Consumers should use `actions.toggleMenu` and/or inspect the `loading` state.
   */
  // removed onToggleMenu per new directive
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * A lightweight, configurable navigation bar suitable for landing pages.
 *
 * This is intentionally a separate component from `Navigation` so that we can
 * offer alternate visual styles while keeping the registry key `Navbar`.
 * The implementation mirrors the HTML snippet supplied by the user but exposes
 * props for every bit of static content.
 */
const Navbar: React.FC<NavbarProps> = ({
  logo,
  menuItems,
  cta,
  dispatcher,
  actions,
}) => {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleLogoClick = () => {
    if (logo?.onClick) dispatchWithLoading('logo', logo.onClick);
  };

  const handleMenuClick = (idx: number, item: NavbarProps['menuItems'][0]) => {
    if (item.action) dispatchWithLoading(`menu-${idx}`, item.action);
  };

  const handleCtaClick = () => {
    if (cta?.action) dispatchWithLoading('cta', cta.action);
  };

  const handleToggle = () => {
    if (actions?.toggleMenu) dispatchWithLoading('toggleMenu', actions.toggleMenu);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* logo/link */}
          {logo ? (
            logo.href ? (
              <a
                href={logo.href}
                onClick={handleLogoClick}
                className="shrink-0"
              >
                {logo.image ? (
                  <img
                    src={logo.image}
                    alt={logo.alt || 'Logo'}
                    className="h-10 md:h-12 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold">{logo.text}</span>
                )}
              </a>
            ) : (
              <div
                role={logo.onClick ? 'button' : undefined}
                tabIndex={logo.onClick ? 0 : undefined}
                onClick={handleLogoClick}
                className="flex-shrink-0 cursor-pointer"
              >
                {logo.image ? (
                  <img
                    src={logo.image}
                    alt={logo.alt || 'Logo'}
                    className="h-10 md:h-12 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold">{logo.text}</span>
                )}
              </div>
            )
          ) : null}

          {/* desktop links + cta */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems?.map((item, idx) => {
              const content = (
                <span>{item.label}</span>
              );

              if (item.href) {
                return (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleMenuClick(idx, item)}
                  disabled={loading[`menu-${idx}`]}
                  className={`text-foreground hover:text-primary transition-colors ${
                    loading[`menu-${idx}`] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {content}
                </button>
              );
            })}

            {cta && (
              cta.href ? (
                <a
                  href={cta.href}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl font-bold text-base h-10 px-4 py-2"
                >
                  {cta.label}
                </a>
              ) : (
                <button
                  onClick={handleCtaClick}
                  disabled={loading.cta}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl font-bold text-base h-10 px-4 py-2"
                >
                  {cta.label}
                </button>
              )
            )}
          </div>

          {/* mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
            onClick={handleToggle}
            disabled={loading.toggleMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
