"use client";

import Image from "next/image";

interface TourPlaceImagesProps {
  name: string;
  imageUrl: string | null;
  images: string[];
  onSelectImage: (img: string) => void;
}

export function TourPlaceImages({ name, imageUrl, images, onSelectImage }: TourPlaceImagesProps) {
  return (
    <>
      {/* Main Image */}
      {imageUrl && (
        <div className="mb-6">
          <button
            onClick={() => onSelectImage(imageUrl)}
            className="relative block w-full h-64 md:h-96 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              priority
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
            />
          </button>
        </div>
      )}

      {/* Additional Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelectImage(img)}
              className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <Image
                src={img}
                alt={`${name} ${idx + 2}`}
                fill
                sizes="(min-width: 896px) 224px, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
