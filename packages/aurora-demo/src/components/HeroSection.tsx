interface ColorOption {
  id: string;
  label: string;
  color: string;
}

interface HeroImage {
  src: string;
  alt?: string;
}

interface HeroSectionProps {
  title: string;
  eyebrow?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  cta?: {
    label: string;
    href: string;
  };
  colors?: ColorOption[];
  images?: HeroImage[];
}

export default function HeroSection({ title, eyebrow, description, price, originalPrice, cta, colors = [], images = [] }: HeroSectionProps) {
  const mainImage = images[0];

  return (
    <section className="section" style={{ paddingTop: '3rem' }}>
      <div className="container" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {mainImage ? (
            <img src={mainImage.src} alt={mainImage.alt || title} style={{ aspectRatio: '1 / 1', objectFit: 'cover' }} />
          ) : null}
        </div>
        <div>
          {eyebrow ? <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem' }}>{eyebrow}</div> : null}
          <h1 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: 'clamp(2.5rem, 5vw, 4.75rem)', lineHeight: 1.02, margin: 0 }}>{title}</h1>
          {description ? <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.7, marginTop: '1.25rem', maxWidth: '42rem' }}>{description}</p> : null}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.9rem', marginTop: '1.5rem' }}>
            {price ? <strong style={{ fontSize: '2rem' }}>{price}</strong> : null}
            {originalPrice ? <span className="muted" style={{ textDecoration: 'line-through' }}>{originalPrice}</span> : null}
          </div>
          {colors.length > 0 ? (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Finishes</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {colors.map(option => (
                  <div key={option.id} title={option.label} style={{ width: 24, height: 24, borderRadius: 999, background: option.color, border: '2px solid rgba(31,41,51,0.12)' }} />
                ))}
              </div>
            </div>
          ) : null}
          {cta ? (
            <a href={cta.href} style={{ display: 'inline-block', marginTop: '2rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', padding: '0.95rem 1.4rem', borderRadius: '999px', fontWeight: 600 }}>
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
