import React from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface FooterLink {
  label: string;
  href?: string;
  action?: string;
}

interface Logo {
  icon?: string;
  text?: string;
  src?: string;
}

interface Newsletter {
  title: string;
  description: string;
  placeholder?: string;
}

interface FooterProps {
  logo?: Logo | string;
  brand?: {
    name: string;
    logo?: string;
    description?: string;
  };
  description?: string;
  links?: Record<string, FooterLink[]>;
  columns?: Array<{
    title: string;
    links: FooterLink[];
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  newsletter?: Newsletter;
  copyright?: string;
  legalLinks?: FooterLink[];
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  dispatcher?: ActionDispatcher;
  actions?: {
    newsletter?: Action | Action[];
  };
  backgroundColor?: string;
}

const Footer: React.FC<FooterProps> = ({
  logo,
  brand,
  description,
  links = {},
  columns = [],
  socialLinks = [],
  newsletter,
  copyright,
  legalLinks = [],
  showNewsletter = false,
  newsletterTitle = "Stay Updated",
  newsletterSubtitle = "Subscribe to our newsletter for the latest updates",
  dispatcher,
  actions,
  backgroundColor = ''
}) => {
  const currentYear = new Date().getFullYear();

  // Support both old and new logo formats
  const logoObj = typeof logo === 'object' ? logo : undefined;
  const logoText = logoObj?.text || brand?.name || 'Brand';
  const logoIcon = logoObj?.icon;
  const logoSrc = logoObj?.src || brand?.logo || (typeof logo === 'string' ? logo : undefined);
  const brandDescription = description || brand?.description;

  // Convert links object to columns array if needed
  const footerColumns = columns.length > 0 ? columns : Object.entries(links).map(([title, columnLinks]) => ({
    title,
    links: columnLinks
  }));

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatcher && actions?.newsletter) {
      const actionList = Array.isArray(actions.newsletter) ? actions.newsletter : [actions.newsletter];
      for (const action of actionList) {
        await dispatcher.dispatch(action);
      }
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      twitter: (
        <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      ),
      github: (
        <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
        </svg>
      )
    };
    return iconMap[platform.toLowerCase()] || <span>{platform}</span>;
  };

  return (
    <footer className={`border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 ${backgroundColor}`}>
      {showNewsletter && !newsletter && (
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{newsletterTitle}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{newsletterSubtitle}</p>
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-l-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button className="bg-[var(--color-primary)] hover:opacity-90 px-6 py-3 rounded-r-lg font-medium transition-colors text-white">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {logoSrc ? (
                <img src={logoSrc} alt={logoText} className="h-6 w-auto" />
              ) : logoIcon ? (
                <div className="w-6 h-6 rounded bg-[var(--color-primary)] flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-sm">{logoIcon}</span>
                </div>
              ) : null}
              <span className="font-bold text-lg text-slate-900 dark:text-white">{logoText}</span>
            </div>
            {brandDescription && (
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {brandDescription}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                  >
                    <span className="sr-only">{social.platform}</span>
                    {social.icon ? (
                      <span className="material-icons-outlined text-xl">{social.icon}</span>
                    ) : (
                      getSocialIcon(social.platform)
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {footerColumns.map((column, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] transition-colors text-left">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          {newsletter && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {newsletter.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {newsletter.description}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder={newsletter.placeholder || "Enter your email"}
                  type="email"
                />
                <button
                  className="px-3 py-2 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
                  type="submit"
                >
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {copyright || `© ${currentYear} ${logoText}. All rights reserved.`}
          </p>
          {legalLinks.length > 0 && (
            <div className="flex gap-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href || '#'}
                  className="text-sm text-slate-500 dark:text-slate-500 hover:text-[var(--color-primary)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;