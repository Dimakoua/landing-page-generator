interface SpecItem {
  label: string;
  value: string;
}

interface SpecGroup {
  title: string;
  items: SpecItem[];
}

interface SpecsSectionProps {
  title: string;
  groups: SpecGroup[];
}

export default function SpecsSection({ title, groups }: SpecsSectionProps) {
  return (
    <section className="section" style={{ background: 'var(--color-section-light, #fffaf4)' }}>
      <div className="container">
        <h2 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '2.25rem', marginTop: 0 }}>{title}</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {groups.map(group => (
            <article key={group.title} className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ marginTop: 0 }}>{group.title}</h3>
              <dl style={{ margin: 0, display: 'grid', gap: '0.85rem' }}>
                {group.items.map(item => (
                  <div key={item.label}>
                    <dt className="muted" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</dt>
                    <dd style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
