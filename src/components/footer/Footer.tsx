import React from 'react';
import type { Action } from '../../schemas/actions';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../utils/hooks/useActionDispatch';

interface FooterProps {
  logo?: {
    text?: string;
    image?: string;
  };
  newsletter?: {
    title?: string;
    description?: string;
    placeholder?: string;
    submitButton?: {
      label?: string;
      onClick?: Action;
    };
  };
  links?: Array<{
    label: string;
    href?: string;
    onClick?: Action;
  }>;
  copyright?: string;
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Footer component - renders footer with logo, newsletter, and links
 */
const Footer: React.FC<FooterProps> = ({
  logo,
  newsletter,
  links,
  copyright,
  dispatcher,
}) => {
  const [email, setEmail] = React.useState('');
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchWithLoading('newsletter', newsletter?.submitButton?.onClick);
    setEmail('');
  };

  const handleLinkClick = (action?: Action, index?: number) => {
    dispatchWithLoading(`link-${index}`, action);
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo Section */}
          <div>
            {logo?.image ? (
              <img src={logo.image} alt="Logo" className="h-8 mb-4" />
            ) : (
              <span className="text-lg font-bold">{logo?.text || 'Company'}</span>
            )}
          </div>

          {/* Links Section */}
          {links && links.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.href ? (
                      <a href={link.href} className="text-gray-400 hover:text-white text-sm">
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link.onClick, index)}
                        disabled={loading[`link-${index}`]}
                        className={`text-gray-400 hover:text-white text-sm ${loading[`link-${index}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading[`link-${index}`] ? <span className="material-icons animate-spin text-xs">refresh</span> : link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter Section */}
          {newsletter && (
            <div>
              <h3 className="text-sm font-semibold mb-4">{newsletter.title || 'Newsletter'}</h3>
              <p className="text-gray-400 text-sm mb-4">{newsletter.description}</p>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input
                  type="email"
                  placeholder={newsletter.placeholder || 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading.newsletter}
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-md text-sm font-medium ${loading.newsletter ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading.newsletter ? <span className="material-icons animate-spin text-xs">refresh</span> : (newsletter.submitButton?.label || 'Subscribe')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            {copyright || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
