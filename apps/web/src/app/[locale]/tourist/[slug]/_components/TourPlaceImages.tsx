"use client";

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
            className="w-full h-64 md:h-96 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
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
              className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img src={img} alt={`${name} ${idx + 2}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
