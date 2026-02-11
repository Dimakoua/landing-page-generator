import React from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface Button {
  label: string;
  href?: string;
  icon?: string;
}

interface Image {
  src: string;
  alt: string;
}

interface HeroProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  primaryButton?: Button;
  secondaryButton?: Button;
  image?: Image;
  backgroundImage?: string;
  backgroundElements?: boolean;
  titleSize?: string;
  backgroundColor?: string;
  state?: Record<string, unknown>;
  dispatcher?: ActionDispatcher;
  actions?: {
    primary?: Action | Action[];
    secondary?: Action | Action[];
  };
}

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  badge,
  primaryButton,
  secondaryButton,
  image,
  backgroundElements = false,
  titleSize = "text-5xl md:text-7xl",
  backgroundColor = '',
  state,
  dispatcher,
  actions
}) => {

  // Function to interpolate placeholders like {{key}} with state values
  const interpolate = (text: string | undefined): string => {
    if (!text) return '';
    if (!state) return text;
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const keys = path.split('.');
      let value: unknown = state;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key];
        } else {
          value = undefined;
          break;
        }
      }
      return typeof value === 'string' ? value : match; // Return original if not a string
    });
  };

  const handleButtonClick = async (actionType: 'primary' | 'secondary') => {
    if (dispatcher && actions?.[actionType]) {
      const actionList = Array.isArray(actions[actionType]) ? actions[actionType] as Action[] : [actions[actionType] as Action];
      for (const action of actionList) {
        await dispatcher.dispatch(action);
      }
    }
  };

  const interpolatedTitle = interpolate(title);
  const interpolatedSubtitle = interpolate(subtitle);
  
  return (
    <section className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden ${backgroundColor}`}>
      {/* Background decorative elements */}
      {backgroundElements && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[var(--color-primary)]/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{badge}</span>
            <span className="material-icons-outlined text-xs text-slate-400 ml-1">arrow_forward</span>
          </div>
        )}
        
        {interpolatedTitle && (
          <h1 className={`${titleSize} font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight`}>
            <span dangerouslySetInnerHTML={{ __html: interpolatedTitle }} />
          </h1>
        )}
        
        {interpolatedSubtitle && (
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-10">
            {interpolatedSubtitle}
          </p>
        )}
        
        {(primaryButton || secondaryButton) && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            {primaryButton && (
              <button
                onClick={() => handleButtonClick('primary')}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--color-primary)]/25"
              >
                {primaryButton.label}
              </button>
            )}
            {secondaryButton && (
              <button
                onClick={() => handleButtonClick('secondary')}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-slate-300 dark:border-slate-700 text-base font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all backdrop-blur-sm group"
              >
                {secondaryButton.icon && (
                  <span className="material-icons-outlined mr-2 group-hover:text-[var(--color-primary)] transition-colors">{secondaryButton.icon}</span>
                )}
                {secondaryButton.label}
              </button>
            )}
          </div>
        )}
        
        {/* Hero Image */}
        {image && (
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 shadow-2xl overflow-hidden aspect-[16/9] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <img 
                  alt={image.alt} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                  src={image.src}
                />
              </div>
              {/* Overlay UI Elements */}
              <div className="absolute top-4 left-4 right-4 h-8 bg-slate-800/80 backdrop-blur rounded-lg border border-white/5 flex items-center px-3 gap-2 z-20">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-xl blur opacity-20 -z-10"></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;