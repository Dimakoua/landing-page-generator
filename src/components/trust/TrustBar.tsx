import React from 'react';

export interface TrustBarItem {
  /** Icon rendered before the label; typically an <svg> or <span> element */
  icon: React.ReactNode;
  /** Text that accompanies the icon */
  text: string;
}

export interface TrustBarProps {
  /** List of badges to display in the bar */
  items: TrustBarItem[];
  /** Optional additional class names for the section */
  className?: string;
}

/**
 * Horizontal bar showing trust badges or other product assurances.
 *
 * The HTML structure is intentionally simple so authors can provide any
 * arbitrary icon (e.g. inline SVG from lucide, Material Icons, etc.).
 */
const TrustBar: React.FC<TrustBarProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 bg-muted/30 border-y border-border ${className}`.trim()}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm md:text-base">
              {item.icon}
              <span className="text-foreground font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
