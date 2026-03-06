import React from 'react';

export interface TestimonialItem {
  rating?: number; // out of 5, can show stars
  quote: string;
  name: string;
  location?: string;
  delay?: number; // seconds
}

export interface SocialProofProps {
  heading?: string;
  subheading?: string;
  badgeText?: string;
  testimonials: TestimonialItem[];
  disclaimer?: string;
}

const SocialProof: React.FC<SocialProofProps> = ({
  heading,
  subheading,
  badgeText,
  testimonials,
  disclaimer,
}) => {
  const renderStars = (count: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      if (i < count) {
        stars.push(
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-star h-5 w-5 fill-primary text-primary flex-shrink-0"
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-star h-5 w-5 text-border flex-shrink-0"
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        );
      }
    }
    return <div className="flex gap-1 mb-4">{stars}</div>;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {(heading || subheading) && (
          <div className="text-center mb-12 md:mb-16">
            {heading && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                {subheading}
              </p>
            )}
            {badgeText && (
              <div className="inline-block px-6 py-3 bg-primary/10 rounded-full">
                <p className="text-primary font-bold text-lg">{badgeText}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8 hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${t.delay ?? idx * 0.1}s` }}
            >
              {t.rating !== undefined && renderStars(t.rating)}
              <p className="text-foreground text-lg leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-bold text-foreground">{t.name}</p>
                {t.location && (
                  <p className="text-sm text-muted-foreground">{t.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {disclaimer && (
          <p className="text-center text-sm text-muted-foreground mt-8 italic">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
};

export default SocialProof;
