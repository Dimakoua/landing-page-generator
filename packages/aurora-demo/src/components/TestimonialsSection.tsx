interface Testimonial {
  quote: string;
  name: string;
  role?: string;
}

interface TestimonialsSectionProps {
  title: string;
  items: Testimonial[];
}

export default function TestimonialsSection({ title, items }: TestimonialsSectionProps) {
  return (
    <section className="section">
      <div className="container">
        <h2 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '2.25rem', marginTop: 0 }}>{title}</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {items.map(item => (
            <article key={item.name} className="card" style={{ padding: '1.5rem' }}>
              <p style={{ marginTop: 0, lineHeight: 1.7 }}>“{item.quote}”</p>
              <div style={{ marginTop: '1rem', fontWeight: 700 }}>{item.name}</div>
              {item.role ? <div className="muted" style={{ fontSize: '0.92rem' }}>{item.role}</div> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
