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
      className="hero text-white p-12 text-center min-h-[400px] flex flex-col justify-center relative"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'var(--font-heading)',
      }}
    >
      {/* Overlay for better text readability */}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      )}
      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{interpolatedTitle}</h1>
        <p className="text-xl opacity-90 drop-shadow-md" style={{ fontFamily: 'var(--font-body)' }}>
          {interpolatedSubtitle}
        </p>
      </div>
    </div>
  );
};

export default Hero;