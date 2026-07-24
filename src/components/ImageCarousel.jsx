import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ImageCarousel = ({ images = [] }) => {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative group">
      {/* Main image */}
      <img
        src={images[current]}
        alt={`Post image ${current + 1}`}
        className="w-full h-96 object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Prev/Next buttons - only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
          >
            <FiChevronRight className="text-xl" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === current ? "bg-white w-5" : "bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {current + 1} / {images.length}
          </span>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 px-1 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`w-16 h-16 object-cover rounded-lg cursor-pointer shrink-0 border-2 transition ${
                index === current
                  ? "border-indigo-600"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;