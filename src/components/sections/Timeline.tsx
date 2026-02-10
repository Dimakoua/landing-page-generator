import { useEffect, useRef, useState } from 'react';

interface Step {
  number?: number;
  icon?: string;
  title: string;
  description: string;
}

interface TimelineProps {
  title?: string;
  subtitle?: string;
  steps: Step[];
  orientation?: 'vertical' | 'horizontal';
  animated?: boolean;
}

export default function Timeline({
  title,
  subtitle,
  steps,
  orientation = 'vertical',
  animated = true
}: TimelineProps) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>(() => {
    if (!animated) {
      return steps.map((_, i) => i);
    }
    return [];
  });
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0');
              setVisibleSteps(prev => [...new Set([...prev, stepIndex])]);
            }
          });
        },
        { threshold: 0.3 }
      );

      const stepElements = timelineRef.current?.querySelectorAll('[data-step]');
      stepElements?.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [animated, steps.length]);

  if (orientation === 'horizontal') {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-[var(--color-primary)] opacity-30"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  data-step={index}
                  className={`relative text-center transition-all duration-700 ${
                    visibleSteps.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {step.icon ? (
                        <span className="text-2xl">{step.icon}</span>
                      ) : (
                        step.number || index + 1
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Vertical timeline (default)
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div ref={timelineRef} className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--color-primary)] opacity-30"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                data-step={index}
                className={`relative flex items-start transition-all duration-700 ${
                  visibleSteps.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                {/* Step circle */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.icon ? (
                    <span className="text-2xl">{step.icon}</span>
                  ) : (
                    step.number || index + 1
                  )}
                </div>

                {/* Content */}
                <div className="ml-8 flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}