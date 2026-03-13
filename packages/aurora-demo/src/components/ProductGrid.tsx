interface ProductCard {
  title: string;
  price: string;
  image: string;
}

interface ProductGridProps {
  title: string;
  items: ProductCard[];
}

export default function ProductGrid({ title, items }: ProductGridProps) {
  return (
    <section className="section" style={{ background: 'var(--color-section-light, #fffaf4)' }}>
      <div className="container">
        <h2 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '2.25rem', marginTop: 0 }}>{title}</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {items.map(item => (
            <article key={item.title} className="card" style={{ overflow: 'hidden' }}>
              <img src={item.image} alt={item.title} style={{ aspectRatio: '4 / 3', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <div className="muted" style={{ marginTop: '0.4rem' }}>{item.price}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
