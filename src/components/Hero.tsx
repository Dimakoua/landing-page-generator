import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  return (
    <div className="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white p-12 text-center">
      <h1 className="text-5xl font-bold mb-4">{title}</h1>
      <p className="text-xl opacity-90">{subtitle}</p>
    </div>
  );
};

export default Hero;