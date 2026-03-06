import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
import Accordion from '../accordion/Accordion';

export interface PriceOption {
  id: string;
  title: string;
  subtitle?: string;
  priceLabel?: string;
  price?: string;
  badgeText?: string;
  note?: string;
  bestValue?: boolean;
  lowStock?: string;
}

export interface FeatureItem {
  icon?: React.ReactNode;
  text: string;
}

export interface ProductShowcaseProps {
  rating?: number;
  reviews?: number;
  ordersInfo?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  galleryImages?: Array<{ src: string; alt?: string }>; // first image will be main by default
  priceOptions?: PriceOption[];
  primaryAction?: { label: string; href?: string; action?: Action };
  shippingInfo?: string;
  paymentMethods?: string[]; // free-form identifiers, rendered as text badges
  features?: FeatureItem[];
  accordionItems?: Array<{ title: string; content: string | { label: string; value: string }[]; icon?: string; action?: Action }>;
  dispatcher?: ActionDispatcher;
  state?: Record<string, unknown>;
}

/**
 * ProductShowcase renders a promotional product section with gallery, rating,
 * pricing options, call-to-action and supplemental details. The look/markup
 * mirrors the example HTML but props drive content.
 */
const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  rating,
  reviews,
  ordersInfo,
  title,
  description,
  galleryImages = [],
  priceOptions = [],
  primaryAction,
  shippingInfo,
  paymentMethods = [],
  features = [],
  accordionItems = [],
  dispatcher,
}) => {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(
    priceOptions.length ? priceOptions[0].id : null
  );

  // carousel state for gallery
  const [selectedImage, setSelectedImage] = React.useState(0);
  const mainImage = galleryImages[selectedImage] || null;

  const handlePrimaryClick = () => {
    if (primaryAction?.action) {
      dispatchWithLoading('primary', primaryAction.action);
    }
  };

  const handleOptionSelect = (id: string) => {
    if (id === selectedOptionId) return;
    setSelectedOptionId(id);
  };

  // derive selected option and price
  const selectedOption = priceOptions.find(o => o.id === selectedOptionId);
  const selectedPrice = selectedOption?.price;

  // compute call-to-action label (only base text and price)
  const ctaLabel = React.useMemo(() => {
    let base = primaryAction?.label || 'Buy';
    base = base.replace(/\s*-\s*\$[\d.,]+$/, '').trim();
    if (selectedPrice) {
      return `${base} - ${selectedPrice}`;
    }
    return base;
  }, [primaryAction?.label, selectedPrice]);

  const renderStars = () => {
    if (rating === undefined) return null;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const total = 5;
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < total; i++) {
      if (i < full) {
        stars.push(<span key={i} className="material-icons fill-primary">star</span>);
      } else if (i === full && half) {
        stars.push(<span key={i} className="material-icons fill-primary">star_half</span>);
      } else {
        stars.push(<span key={i} className="material-icons text-primary">star_border</span>);
      }
    }
    return <div className="flex items-center gap-1 text-sm">{stars}</div>;
  };

  return (
    <section className="relative py-8 md:py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* mobile rating bar */}
        {ordersInfo && (
          <div className="lg:hidden mb-6">
            <div
              className="block text-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold animate-fade-in"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {ordersInfo}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* left column: gallery */}
          <div className="animate-fade-in lg:sticky lg:top-24 lg:self-start">
            {mainImage && (
              <div className="space-y-4">
                <div className="relative bg-muted/20 rounded-2xl overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl" />
                  <img
                    src={mainImage.src}
                    alt={mainImage.alt || title}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="relative object-contain transition-opacity duration-300 w-full h-auto opacity-100"
                  />
                </div>
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(i)}
                        className={`relative bg-muted/20 rounded-lg overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:scale-105 ring-1 ring-border ${i === selectedImage ? 'ring-primary' : ''}`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* right column: details */}
          <div className="animate-fade-in space-y-6">
            {/* desktop ordersInfo */}
            {ordersInfo && (
              <div className="hidden lg:inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold animate-fade-in" role="status" aria-live="polite" aria-atomic="true">
                {ordersInfo}
              </div>
            )}

            {title && <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">{title}</h1>}

            {(rating !== undefined || reviews !== undefined) && (
              <div className="flex items-center gap-2 mb-3">
                {renderStars()}
                {(reviews !== undefined || rating !== undefined) && (
                  <span className="text-sm text-muted-foreground">
                    {rating ? rating.toFixed(1) : ''}{' '}
                    {reviews ? `(${reviews} reviews)` : ''}
                  </span>
                )}
              </div>
            )}

            {/* show selected price option price */}
            {selectedOptionId && priceOptions.length > 0 && (
              <div className="mb-4">
                <span className="text-lg font-semibold text-foreground">
                  {priceOptions.find(o => o.id === selectedOptionId)?.price}
                </span>
              </div>
            )}

            {description && <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>}

            {/* pricing options */}
            {priceOptions.length > 0 && (
              <div id="pricing" className="space-y-6">
                {priceOptions.map(option => (
                  <div
                    key={option.id}
                    role="radio"
                    tabIndex={0}
                    aria-checked={selectedOptionId === option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOptionSelect(option.id);
                      }
                    }}
                    className={`relative flex items-start gap-3 p-4 cursor-pointer transition-all ${
                      selectedOptionId === option.id ? 'bg-primary/5 border-[3px] border-primary shadow-xl scale-[1.01] rounded-xl' : 'border-2 border-border bg-background hover:border-primary/50 rounded-xl'
                    }`}
                  >
                    <button
                      type="button"
                      value={option.id}
                      className="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      onClick={() => handleOptionSelect(option.id)}
                    ></button>
                    <div className="flex-1 flex justify-between items-start gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-lg">{option.title}</span>
                          {option.badgeText && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-accent bg-accent/10">{option.badgeText}</span>}
                        </div>
                        {option.subtitle && <div className="text-sm text-muted-foreground">{option.subtitle}</div>}
                        {option.note && <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert h-3.5 w-3.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg><span className="text-xs font-semibold">{option.note}</span></div>}
                      </div>
                      {option.price && <div className="flex flex-col items-end gap-0.5"><span className="font-bold text-foreground text-2xl">{option.price}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {primaryAction && (
              <button
                onClick={handlePrimaryClick}
                disabled={loading.primary}
                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl h-14 rounded-lg px-10 w-full text-lg font-semibold"
              >
                {ctaLabel}
              </button>
            )}

            {shippingInfo && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {shippingInfo}
              </div>
            )}

            {paymentMethods.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-xs text-muted-foreground">Secure payments via</span>
                <div className="flex items-center gap-2">
                  {paymentMethods.map((m, idx) => (
                    <div key={idx} className="bg-muted/50 rounded px-2 py-1 text-xs font-semibold">
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {features.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    {f.icon}
                    <span className="text-sm font-medium text-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
            )}

            {accordionItems.length > 0 && <Accordion items={accordionItems} dispatcher={dispatcher} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
