import { useState } from 'react';

interface VideoProps {
  src?: string;
  youtubeId?: string;
  vimeoId?: string;
  thumbnail?: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export default function Video({
  src,
  youtubeId,
  vimeoId,
  thumbnail,
  title,
  autoplay = false,
  loop = false,
  muted = true,
  controls = true,
  aspectRatio = '16:9'
}: VideoProps) {
  const [showThumbnail, setShowThumbnail] = useState(true);

  const getAspectRatioClass = () => {
    const ratios = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '1:1': 'aspect-square'
    };
    return ratios[aspectRatio];
  };

  const handlePlay = () => {
    setShowThumbnail(false);
  };

  const getEmbedUrl = () => {
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&rel=0`;
    }
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
    }
    return '';
  };

  return (
    <div className={`relative w-full ${getAspectRatioClass()} bg-slate-900 rounded-lg overflow-hidden`}>
      {youtubeId || vimeoId ? (
        // Embedded video
        <iframe
          src={getEmbedUrl()}
          title={title || 'Video'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : src ? (
        // Native video
        <>
          {showThumbnail && thumbnail && (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }}>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={handlePlay}
                  className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all hover:scale-110 shadow-lg"
                >
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          <video
            src={src}
            className="w-full h-full object-cover"
            controls={controls && !showThumbnail}
            autoPlay={autoplay && !showThumbnail}
            loop={loop}
            muted={muted}
          />
        </>
      ) : (
        // Placeholder
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <p>No video source provided</p>
          </div>
        </div>
      )}
    </div>
  );
}