interface ContentItem {
  type: 'text' | 'list';
  text?: string;
  title?: string;
  items?: string[];
}

interface ContentBlockProps {
  title?: string;
  subtitle?: string;
  content: string | ContentItem[];
  image?: string;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export default function ContentBlock({
  title,
  subtitle,
  content,
  image,
  imagePosition = 'right',
  backgroundColor,
  textAlign = 'left'
}: ContentBlockProps) {
  const getTextAlignClass = () => {
    const aligns = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return aligns[textAlign];
  };

  const formatContent = (content: string | ContentItem[]) => {
    if (typeof content === 'string') {
      // Simple markdown-like formatting
      return content
        .split('\n\n')
        .map(paragraph => {
          // Bold text
          let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          // Italic text
          formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
          // Lists
          if (formatted.trim().startsWith('- ')) {
            formatted = '<ul class="list-disc list-inside space-y-1">' +
              formatted.split('\n').map(item =>
                item.trim() ? `<li>${item.replace(/^- /, '')}</li>` : ''
              ).join('') +
              '</ul>';
          }
          return `<p class="mb-4 last:mb-0">${formatted}</p>`;
        })
        .join('');
    } else if (Array.isArray(content)) {
      return content.map(item => {
        if (item.type === 'text' && item.text) {
          return `<p class="mb-4 last:mb-0">${item.text}</p>`;
        } else if (item.type === 'list' && item.title && item.items) {
          const listItems = item.items.map(listItem => `<li>${listItem}</li>`).join('');
          return `<h3 class="font-semibold mb-2">${item.title}</h3><ul class="list-disc list-inside space-y-1 mb-4">${listItems}</ul>`;
        }
        return '';
      }).join('');
    } else {
      console.warn('[ContentBlock] content is neither string nor array:', content);
      return '<p>Invalid content</p>';
    }
  };

  const contentWithFormatting = (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${getTextAlignClass()}`}
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 ${image ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-16 items-center`}>
          {/* Text Content */}
          <div className={`${image && imagePosition === 'left' ? 'lg:order-2' : ''}`}>
            {(title || subtitle) && (
              <div className={`mb-8 ${getTextAlignClass()}`}>
                {title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    <span dangerouslySetInnerHTML={{ __html: title }} />
                  </h2>
                )}
                {subtitle && (
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    <span dangerouslySetInnerHTML={{ __html: subtitle }} />
                  </p>
                )}
              </div>
            )}

            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {contentWithFormatting}
            </div>
          </div>

          {/* Image */}
          {image && (
            <div className={`${imagePosition === 'left' ? 'lg:order-1' : ''}`}>
              <div className="relative">
                <img
                  src={image}
                  alt={title || 'Content image'}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}