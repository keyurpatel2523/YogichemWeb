import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    name: 'Sale',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
    href: '/sale',
    color: 'bg-red-100',
  },
  {
    name: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    href: '/category/wellness',
    color: 'bg-green-100',
  },
  {
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
    href: '/category/beauty',
    color: 'bg-pink-100',
  },
  {
    name: 'Skincare',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    href: '/category/beauty/skincare',
    color: 'bg-purple-100',
  },
  {
    name: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
    href: '/category/health',
    color: 'bg-blue-100',
  },
  {
    name: 'Baby',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
    href: '/category/baby',
    color: 'bg-yellow-100',
  },
  {
    name: 'Electrical',
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=300&h=300&fit=crop',
    href: '/category/electrical',
    color: 'bg-gray-100',
  },
  {
    name: 'Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop',
    href: '/category/gifts',
    color: 'bg-orange-100',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar md:grid md:grid-cols-8 md:overflow-visible">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="flex-shrink-0 group"
            >
              <div className={`w-24 h-24 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-lg overflow-hidden ${category.color} relative`}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 96px, 150px"
                  draggable={false}
                />
              </div>
              <p className="text-center text-sm font-medium mt-2 group-hover:text-boots-blue transition-colors">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
