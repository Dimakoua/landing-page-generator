import { useEffect, useRef, useState } from 'react';

interface Stat {
  number: string | number;
  label: string;
  icon?: string;
  suffix?: string;
  animated?: boolean;
}

interface StatsProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  title?: string;
  subtitle?: string;
}

export default function Stats({
  stats,
  columns = 4,
  title,
  subtitle
}: StatsProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const getGridCols = () => {
    const colMap = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4'
    };
    return colMap[columns];
  };

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
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div ref={statsRef} className={`grid ${getGridCols()} gap-8`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[var(--color-primary)] transition-all hover:shadow-lg"
            >
              {stat.icon && (
                <div className="text-4xl mb-4">{stat.icon}</div>
              )}
              <div className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-2">
                {stat.animated && hasAnimated ? (
                  <AnimatedNumber value={typeof stat.number === 'string' ? parseInt(stat.number) : stat.number} suffix={stat.suffix} />
                ) : (
                  <>{stat.number}{stat.suffix}</>
                )}
              </div>
              <div className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}{suffix}</>;
}
