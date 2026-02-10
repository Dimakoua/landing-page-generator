import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, backgroundImage }) => {
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
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{title}</h1>
        <p className="text-xl opacity-90 drop-shadow-md" style={{ fontFamily: 'var(--font-body)' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default Hero;