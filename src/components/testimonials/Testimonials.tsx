import React from 'react';
import type { ActionContext, Action } from '../../schemas/actions';

interface Testimonial {
  id?: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  image?: string;
  rating?: number;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  displayMode?: 'grid' | 'carousel' | 'single';
  itemsPerRow?: number;
  dispatcher?: ActionContext;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Testimonials component - Display customer testimonials
 */
const Testimonials: React.FC<TestimonialsProps> = ({
  title = 'What Our Customers Say',
  subtitle,
  testimonials = [],
  displayMode = 'grid',
  itemsPerRow = 3,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (rating?: number) => {
    if (!rating && rating !== 0) return null;
    const full = Math.floor(rating || 0);
    const half = (rating || 0) - full >= 0.5;
    return (
      <div className="flex items-center space-x-1 mb-4 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => {
          const icon = i < full ? 'star' : i === full && half ? 'star_half' : 'star_border';
          return (
            <span key={i} className="material-icons text-sm">
              {icon}
            </span>
          );
        })}
      </div>
    );
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const colClass = gridColsClass[itemsPerRow as keyof typeof gridColsClass] || gridColsClass[3];

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          {subtitle && <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {displayMode === 'grid' && (
          <div className={`grid ${colClass} gap-8`}>
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.id || index}
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700/50 flex flex-col"
              >
                <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-6 flex-grow italic">{testimonial.content}</p>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    {testimonial.image && <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role || testimonial.company || 'Verified Buyer'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* carousel/single variants unchanged (kept for completeness) */}
        {displayMode === 'carousel' && testimonials.length > 0 && (
          <div className="relative">
            <div className="bg-white rounded-lg shadow-lg p-8 min-h-80">
              <div className="max-w-2xl mx-auto">
                {renderStars(testimonials[currentIndex].rating)}
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 italic">{testimonials[currentIndex].content}</p>
                <div className="flex items-center">
                  {testimonials[currentIndex].image && (
                    <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">{testimonials[currentIndex].name}</p>
                    {(testimonials[currentIndex].role || testimonials[currentIndex].company) && (
                      <p className="text-slate-600">{testimonials[currentIndex].role}{testimonials[currentIndex].role && testimonials[currentIndex].company && ' at '}{testimonials[currentIndex].company}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <button onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10" aria-label="Previous testimonial">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10" aria-label="Next testimonial">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>

                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`} aria-label={`Go to testimonial ${index + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {displayMode === 'single' && testimonials.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            {renderStars(testimonials[0].rating)}
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 italic">{testimonials[0].content}</p>
            <div className="flex items-center">
              {testimonials[0].image && <img src={testimonials[0].image} alt={testimonials[0].name} className="w-16 h-16 rounded-full object-cover mr-4" />}
              <div>
                <p className="font-semibold text-slate-900 text-lg">{testimonials[0].name}</p>
                {(testimonials[0].role || testimonials[0].company) && (
                  <p className="text-slate-600">{testimonials[0].role}{testimonials[0].role && testimonials[0].company && ' at '}{testimonials[0].company}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default Testimonials;
