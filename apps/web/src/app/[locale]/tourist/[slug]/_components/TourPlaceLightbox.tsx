"use client";

interface TourPlaceLightboxProps {
  selectedImage: string | null;
  name: string;
  onClose: () => void;
}

export function TourPlaceLightbox({ selectedImage, name, onClose }: TourPlaceLightboxProps) {
  if (!selectedImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gold-400 text-2xl"
        >
          &times;
        </button>
        <img
          src={selectedImage}
          alt={name}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
