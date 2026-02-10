import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  state?: Record<string, unknown>;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, backgroundImage, state }) => {

  // Function to interpolate placeholders like {{key}} with state values
  const interpolate = (text: string): string => {
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

  const interpolatedTitle = interpolate(title);
  const interpolatedSubtitle = interpolate(subtitle);
  return (
    <div
      className="hero text-white py-24 md:py-32 px-6 text-center min-h-[500px] flex flex-col justify-center relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`
          : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'var(--font-heading)',
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-xl">
          {interpolatedTitle}
        </h1>
        <p className="text-lg md:text-2xl text-gray-100/95 drop-shadow-lg" style={{ fontFamily: 'var(--font-body)' }}>
          {interpolatedSubtitle}
        </p>
      </div>
    </div>
  );
};

export default Hero;