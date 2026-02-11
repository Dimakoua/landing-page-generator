interface Logo {
  src?: string;
  name?: string;
  alt?: string;
  icon?: string;
  url?: string;
}

interface LogoCloudProps {
  title?: string;
  subtitle?: string;
  logos: Logo[];
  grayscale?: boolean;
  backgroundColor?: string;
}

export default function LogoCloud({
  title,
  subtitle,
  logos,
  grayscale = true,
  backgroundColor = ''
}: LogoCloudProps) {
  return (
    <section className={`border-y border-slate-200 dark:border-slate-800 py-10 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            {title}
          </p>
        )}
        
        {subtitle && (
          <p className="text-base text-slate-600 dark:text-slate-400 mb-8">
            {subtitle}
          </p>
        )}

        <div className={`flex flex-wrap justify-center items-center gap-8 md:gap-16 ${grayscale ? 'opacity-70 grayscale' : ''}`}>
          {logos.map((logo, index) => {
            const content = logo.src ? (
              <img
                src={logo.src}
                alt={logo.alt || logo.name || 'Logo'}
                className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${
                  grayscale ? 'hover:grayscale-0 hover:opacity-100' : ''
                }`}
              />
            ) : logo.icon ? (
              <div className="text-xl font-bold text-slate-400 font-display flex items-center gap-2">
                <span className="material-icons-outlined">{logo.icon}</span>
                {logo.name && <span>{logo.name}</span>}
              </div>
            ) : (
              <div className="text-xl font-bold text-slate-400 font-display">
                {logo.name}
              </div>
            );

            return logo.url ? (
              <a
                key={index}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                {content}
              </a>
            ) : (
              <div key={index} className="flex items-center justify-center">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

