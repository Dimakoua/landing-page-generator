import React from 'react';

interface SimpleCTAProps {
  text: string;
  action: 'approve' | 'decline';
  onAction?: (action: 'approve' | 'decline') => void;
}

const SimpleCTA: React.FC<SimpleCTAProps> = ({ text, action, onAction }) => {
  const handleClick = () => {
    onAction?.(action);
  };

  return (
    <div className="flex justify-center p-8">
      <button
        onClick={handleClick}
        className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          fontFamily: 'var(--font-body)',
          borderRadius: 'var(--radius-md, 8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        }}
      >
        {text}
      </button>
    </div>
  );
};

export default SimpleCTA;