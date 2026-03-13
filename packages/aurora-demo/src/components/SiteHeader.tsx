interface MenuItem {
  label: string;
  href?: string;
}

interface SiteHeaderProps {
  brand?: string;
  menuItems?: MenuItem[];
}

export default function SiteHeader({ brand = 'Aurora', menuItems = [] }: SiteHeaderProps) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(247,242,235,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(31,41,51,0.08)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 }}>
        <a href="#overview" style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.4rem', textDecoration: 'none', fontWeight: 700 }}>
          {brand}
        </a>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {menuItems.map(item => (
            <a key={item.label} href={item.href || '#'} style={{ textDecoration: 'none', color: '#5b6770', fontSize: '0.95rem' }}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
