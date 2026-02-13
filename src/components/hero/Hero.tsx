import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { globalEventBus } from '../../engine/events/EventBus';
import { EVENT_TYPES } from '../../engine/events/types';

interface ImageItem { src: string; alt?: string }
interface ColorOption { id: string; label?: string; color?: string }

interface HeroProps {
  // generic hero props (backwards compatible)
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  primaryButton?: { label?: string; onClick?: Action };
  secondaryButton?: { label?: string; onClick?: Action };

  // e-commerce specific props
  badge?: string;
  price?: string | number;
  originalPrice?: string | number;
  rating?: number;
  reviewsCount?: number;
  images?: ImageItem[];
  colors?: ColorOption[];
  quantity?: number;

  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * Hero component - Supports both classic hero and product-hero layouts.
 * - If `images` is provided, render product gallery + details (e-commerce hero)
 * - Otherwise preserve the original full-bleed hero behavior
 */
const Hero: React.FC<HeroProps> = props => {
  const {
    title,
    subtitle,
    description,
    backgroundImage,
    backgroundVideo,
    primaryButton,
    secondaryButton,
    badge,
    price,
    originalPrice,
    rating,
    reviewsCount,
    images = [],
    colors = [],
    quantity: initialQuantity = 1,
    dispatcher,
  } = props;

  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState<number>(initialQuantity || 1);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    colors.length ? colors[0].id : null
  );

  React.useEffect(() => {
    setQuantity(initialQuantity || 1);
  }, [initialQuantity]);

  // Emit component lifecycle events
  React.useEffect(() => {
    globalEventBus.emit(EVENT_TYPES.COMPONENT_MOUNTED, {
      type: EVENT_TYPES.COMPONENT_MOUNTED,
      component: 'Hero',
      componentId: 'hero-main',
      props: { hasImages: !!images?.length, hasPrimaryButton: !!primaryButton }
    });

    return () => {
      globalEventBus.emit(EVENT_TYPES.COMPONENT_UNMOUNTED, {
        type: EVENT_TYPES.COMPONENT_UNMOUNTED,
        component: 'Hero',
        componentId: 'hero-main'
      });
    };
  }, []);

  const handleAddToCart = async () => {
    if (!primaryButton?.onClick || !dispatcher) return;

    // Emit user interaction event
    await globalEventBus.emit(EVENT_TYPES.USER_INTERACTION, {
      type: EVENT_TYPES.USER_INTERACTION,
      interactionType: 'button_click',
      component: 'Hero',
      buttonType: 'primary',
      actionType: primaryButton.onClick.type,
      label: primaryButton.label || 'Add to Cart'
    });

    // If this is a cart action, modify it to include selected color and quantity
    if (primaryButton.onClick.type === 'chain') {
      const modifiedActions = primaryButton.onClick.actions.map(action => {
        if (action.type === 'cart' && action.operation === 'add' && action.item) {
          return {
            ...action,
            item: {
              ...action.item,
              quantity,
              color: selectedColor || undefined,
            },
          };
        }
        return action;
      });

      const modifiedAction = {
        ...primaryButton.onClick,
        actions: modifiedActions,
      };

      dispatcher.dispatch(modifiedAction).catch(err =>
        console.error('Add to cart action failed:', err)
      );
    } else if (primaryButton.onClick.type === 'cart' && primaryButton.onClick.operation === 'add') {
      // Handle single cart action
      const modifiedAction = {
        ...primaryButton.onClick,
        item: {
          ...primaryButton.onClick.item,
          quantity,
          color: selectedColor || undefined,
        },
      };

      dispatcher.dispatch(modifiedAction).catch(err =>
        console.error('Add to cart action failed:', err)
      );
    } else {
      // Fallback to original action
      handleButtonClick(primaryButton.onClick);
    }
  };

  // If images are provided, render the product-style hero
  if (images && images.length > 0) {
    const main = images[selectedImage];

    return (
      <section className="relative py-12 lg:py-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group">
                <img
                  src={main.src}
                  alt={main.alt || title}
                  className="w-full h-full object-cover object-center transform transition duration-500 group-hover:scale-105"
                />
                {badge && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                      {badge}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${idx === selectedImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors'}`}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <span className="material-icons text-slate-400">play_circle</span>
                </div>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="flex flex-col h-full justify-center">
              {title && <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{title}</h1>}

              <div className="flex items-center space-x-4 mb-6">
                {rating ? (
                  <div className="flex items-center text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`material-icons text-base`}>{i < Math.floor(rating) ? 'star' : (i < rating ? 'star_half' : 'star_border')}</span>
                    ))}
                  </div>
                ) : null}
                {typeof reviewsCount !== 'undefined' && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-4">{reviewsCount} Reviews</span>
                )}
              </div>

              <div className="flex items-baseline space-x-3 mb-6">
                {price !== undefined && <span className="text-4xl font-bold text-slate-900 dark:text-white">{typeof price === 'number' ? `$${price.toFixed(2)}` : price}</span>}
                {originalPrice && <span className="text-lg text-slate-500 dark:text-slate-400 line-through">{originalPrice}</span>}
              </div>

              {description && <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{description}</p>}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Color: <span className="text-slate-500 dark:text-slate-400 font-normal">{colors.find(c => c.id === selectedColor)?.label}</span></h3>
                  <div className="flex space-x-3">
                    {colors.map(c => (
                      <button
                        key={c.id}
                        aria-label={c.label || c.id}
                        onClick={() => setSelectedColor(c.id)}
                        aria-pressed={c.id === selectedColor}
                        className={`w-10 h-10 rounded-full ${c.color ? '' : 'bg-slate-200 dark:bg-slate-800'} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-background-dark ${c.id === selectedColor ? 'ring-primary' : 'ring-transparent hover:ring-slate-400 transition-all'}`}
                        style={c.color ? { backgroundColor: c.color } : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative w-full sm:w-32">
                  <div role="group" aria-label="quantity selector" className="w-full h-12 flex items-center justify-between px-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors">
                    <span className="font-medium">{quantity}</span>
                    <div className="flex items-center space-x-1">
                      <button aria-label="decrease" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-400 px-2">-</button>
                      <button aria-label="increase" onClick={() => setQuantity(q => q + 1)} className="text-slate-400 px-2">+</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span className="material-icons">shopping_cart</span>
                  <span>{primaryButton?.label || 'Add to Cart'}</span>
                </button>

                <button className="w-12 h-12 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <span className="material-icons">favorite_border</span>
                </button>
              </div>

              {/* Features List (kept minimal - can be populated from props/state) */}
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-lg">check_circle</span>
                  <span>Free shipping on orders over $100</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-lg">check_circle</span>
                  <span>30-day money-back guarantee</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-lg">check_circle</span>
                  <span>2-year warranty included</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback: original hero implementation
  const bgStyle = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {};

  const handleButtonClick = async (action?: Action) => {
    if (action && dispatcher) {
      // Emit user interaction event
      await globalEventBus.emit(EVENT_TYPES.USER_INTERACTION, {
        type: EVENT_TYPES.USER_INTERACTION,
        interactionType: 'button_click',
        component: 'Hero',
        buttonType: 'secondary',
        actionType: action.type,
        label: secondaryButton?.label || 'Secondary Button'
      });

      dispatcher.dispatch(action).catch(err => console.error('Hero button action failed:', err));
    }
  };

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
      style={bgStyle}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Background video (if provided) */}
      {backgroundVideo && (
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        {subtitle && (
          <p className="text-lg md:text-xl font-semibold text-gray-200 mb-4">
            {subtitle}
          </p>
        )}

        {title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>
        )}

        {description && (
          <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton && (
            <button
              onClick={() => handleButtonClick(primaryButton.onClick)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              {primaryButton.label || 'Get Started'}
            </button>
          )}

          {secondaryButton && (
            <button
              onClick={() => handleButtonClick(secondaryButton.onClick)}
              className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold rounded-lg transition"
            >
              {secondaryButton.label || 'Learn More'}
            </button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;
