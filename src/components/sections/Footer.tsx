import React from 'react';

interface FooterLink {
  label: string;
  href?: string;
  action?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brand?: {
    name: string;
    logo?: string;
    description?: string;
  };
  columns?: FooterColumn[];
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  copyright?: string;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
}

const Footer: React.FC<FooterProps> = ({
  brand,
  columns = [],
  socialLinks = [],
  copyright,
  showNewsletter = false,
  newsletterTitle = "Stay Updated",
  newsletterSubtitle = "Subscribe to our newsletter for the latest updates"
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {showNewsletter && (
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{newsletterTitle}</h3>
              <p className="text-gray-400 mb-6">{newsletterSubtitle}</p>
              <div className="max-w-md mx-auto flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          {brand && (
            <div className="lg:col-span-2">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="h-8 mb-4" />
              ) : (
                <h3 className="text-xl font-bold mb-4">{brand.name}</h3>
              )}
              {brand.description && (
                <p className="text-gray-400 mb-4">{brand.description}</p>
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
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {social.icon ? (
                        <span className="text-xl">{social.icon}</span>
                      ) : (
                        <span className="capitalize">{social.platform}</span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button className="text-gray-400 hover:text-white transition-colors duration-200 text-left">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {copyright || `© ${currentYear} ${brand?.name || 'Company'}. All rights reserved.`}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;