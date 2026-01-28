import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PromotionBannerProps {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bgImage?: string;
  bgColor?: string;
  badge?: string;
  endDate?: string;
}

export function PromotionBanner({
  title,
  subtitle,
  cta,
  href,
  bgImage,
  bgColor = 'bg-boots-blue',
  badge,
  endDate,
}: PromotionBannerProps) {
  return (
    <Link href={href} className="block group">
      <div
        className={`relative overflow-hidden rounded-lg ${bgColor} text-white`}
        style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' } : {}}
      >
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              {badge && (
                <Badge variant="sale" className="mb-2">{badge}</Badge>
              )}
              <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
              <p className="text-sm md:text-base opacity-90 mb-4">{subtitle}</p>
              <span className="inline-block bg-white text-boots-blue px-4 py-2 rounded font-semibold text-sm group-hover:bg-gray-100 transition-colors">
                {cta}
              </span>
            </div>
            {endDate && (
              <div className="text-right">
                <p className="text-xs opacity-75">ENDS</p>
                <p className="font-bold">{endDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
