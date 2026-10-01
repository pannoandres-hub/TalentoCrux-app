import { Video } from 'lucide-react';
import type { Ad } from '@/types';

interface AdCardProps {
  ad: Ad;
  onClick?: (ad: Ad) => void;
}

function getYouTubeEmbed(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
}

export function AdCard({ ad, onClick }: AdCardProps) {
  const hasVideo = Boolean(ad.linkVideo);
  const hasImage = Boolean(ad.imagenUrl);
  const ytEmbed = ad.linkVideo ? getYouTubeEmbed(ad.linkVideo) : null;

  if (!hasImage && !hasVideo) return null;

  return (
    <div
      onClick={() => onClick?.(ad)}
      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {hasVideo && ytEmbed ? (
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }} onClick={(e) => e.stopPropagation()}>
          <iframe
            src={ytEmbed}
            title={ad.titulo}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : hasVideo ? (
        <video
          src={ad.linkVideo}
          controls
          className="w-full object-cover bg-black"
          style={{ maxHeight: '220px' }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : hasImage ? (
        <img
          src={ad.imagenUrl}
          alt={ad.titulo}
          loading="lazy"
          className="w-full h-auto object-cover"
        />
      ) : null}
    </div>
  );
}
