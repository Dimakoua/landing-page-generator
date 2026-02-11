interface TeamMember {
  name: string;
  role: string;
  image: string;
  social?: Array<{
    platform: string;
    url: string;
  }>;
}

interface TeamProps {
  title?: string;
  subtitle?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
}

export default function Team({
  title = 'Meet Our Team',
  subtitle,
  members,
  columns = 3,
  backgroundColor = ''
}: TeamProps) {
  const getGridCols = () => {
    const colMap = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };
    return colMap[columns];
  };

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              <span dangerouslySetInnerHTML={{ __html: subtitle }} />
            </p>
          )}
        </div>

        <div className={`grid ${getGridCols()} gap-8 md:gap-12`}>
          {members.map((member, index) => (
            <div key={index} className="group text-center">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors duration-300 p-1">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {/* Social Hover */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {member.social?.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs hover:bg-white hover:text-primary transition-colors"
                    >
                      {social.platform === 'linkedin' ? 'in' : social.platform === 'twitter' ? 'tw' : social.platform}
                    </a>
                  ))}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-primary uppercase tracking-wide mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}