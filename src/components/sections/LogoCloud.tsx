interface Logo {
  src: string;
  alt: string;
  url?: string;
}

interface LogoCloudProps {
  title?: string;
  subtitle?: string;
  logos: Logo[];
  columns?: 2 | 3 | 4 | 5 | 6;
  grayscale?: boolean;
}

export default function LogoCloud({
  title,
  subtitle,
  logos,
  columns = 4,
  grayscale = true
}: LogoCloudProps) {
  const getGridCols = () => {
    const colMap = {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    };
    return colMap[columns];
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${getGridCols()} gap-8 items-center justify-items-center`}>
          {logos.map((logo, index) => {
            const LogoImage = (
              <img
                src={logo.src}
                alt={logo.alt}
                className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${
                  grayscale ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''
                }`}
              />
            );

            return logo.url ? (
              <a
                key={index}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                {LogoImage}
              </a>
            ) : (
              <div key={index} className="flex items-center justify-center">
                {LogoImage}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
