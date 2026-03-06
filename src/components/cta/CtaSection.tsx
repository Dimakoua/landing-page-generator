import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

export interface CtaSectionProps {
  heading: string;
  subheading?: string;
  buttonLabel?: string;
  buttonAction?: Action;
  guaranteeText?: string;
  dispatcher?: ActionDispatcher;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  heading,
  subheading,
  buttonLabel = 'Get Started',
  buttonAction,
  guaranteeText = '30-Day Money-Back Guarantee',
  dispatcher,
}) => {
  const { dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleClick = () => {
    if (buttonAction) {
      dispatchWithLoading('cta', buttonAction);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
      {/* light overlay for contrast */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            {heading}
          </h2>
          {subheading && (
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
              {subheading}
            </p>
          )}
          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-lg h-14 rounded-lg px-10 text-lg bg-background text-foreground hover:bg-background/90 mb-6 shadow-xl"
          >
            {buttonLabel} →
          </button>
          {guaranteeText && (
            <div className="flex items-center justify-center gap-2 text-primary-foreground/80">
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
                className="lucide lucide-shield-check h-5 w-5"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-sm md:text-base font-medium">
                {guaranteeText}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
