interface FooterColumn {
  heading: string;
  items: string[];
}

interface SiteFooterProps {
  brand?: string;
  description?: string;
  columns?: FooterColumn[];
  note?: string;
}

export default function SiteFooter({ brand = 'Aurora', description, columns = [], note }: SiteFooterProps) {
  return (
    <footer style={{ background: '#172126', color: '#f7f2eb', padding: '3rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.5rem', fontWeight: 700 }}>{brand}</div>
          {description ? <p style={{ color: 'rgba(247,242,235,0.72)', lineHeight: 1.7 }}>{description}</p> : null}
        </div>
        {columns.map(column => (
          <div key={column.heading}>
            <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{column.heading}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem', color: 'rgba(247,242,235,0.72)' }}>
              {column.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      {note ? <div className="container" style={{ marginTop: '2rem', color: 'rgba(247,242,235,0.6)', fontSize: '0.92rem' }}>{note}</div> : null}
    </footer>
  );
}
