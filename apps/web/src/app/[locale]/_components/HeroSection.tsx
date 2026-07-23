import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  showLogo?: boolean;
}

export function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Client-side translation helper for default banners
  const translateBanner = (title: string, subtitle: string | null) => {
    if (locale === "ja") return { title, subtitle };

    // English translation mappings
    if (title === "鉄板・もんじゃ・居酒屋 三代目土信田商店") {
      return {
        title: "Teppan, Monja, Izakaya - Sandaime Toshida Shouten",
        subtitle:
          "Iidabashi Monja! Once you eat it, you'll be hooked! Enjoy traditional, authentic Monja without traveling to Tsukishima.",
      };
    }
    if (title === "昔ながらの本格派もんじゃ") {
      return {
        title: "Traditional & Authentic Monjayaki",
        subtitle:
          "We offer a wide variety of Izakaya menu items and beverages. Conveniently located near Iidabashi, Suidobashi, and Kudanshita stations!",
      };
    }
    if (title === "名物 泡アート超達人ビール") {
      return {
        title: "Famous Foam-Art Premium Draft Beer",
        subtitle:
          "Indulge in delicious Monjayaki paired with our signature sours and masterfully poured draft beers.",
      };
    }

    return { title, subtitle };
  };

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        const activeBanners = (data?.data || []).filter((b: any) => b.isActive);
        if (activeBanners.length > 0) {
          const formatted = activeBanners.map((b: any, index: number) => {
            const { title: translatedTitle, subtitle: translatedSubtitle } = translateBanner(
              b.title,
              b.subtitle
            );
            return {
              ...b,
              title: translatedTitle,
              subtitle: translatedSubtitle,
              showLogo:
                index === 0 &&
                (b.title.includes("三代目土信田商店") || b.title.includes("Toshida Shouten")),
            };
          });
          setBanners(formatted);
        } else {
          setBanners([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load banners:", err);
        setBanners([]);
      });
  }, [locale]);

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    // Basic fallback header if database banners are empty or deleted
    return (
      <section className="relative min-h-[80vh] flex items-center justify-center bg-wood-pattern">
        <div className="text-center px-4 z-20">
          <div className="mb-6 flex justify-center">
            <div className="bg-background-secondary/80 backdrop-blur-md p-3 rounded-full border border-border/40 shadow-xl max-w-[100px]">
              <img src="/images/logo.png" alt="Logo" className="w-full h-auto" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-jp font-bold text-gold-400 mb-6 drop-shadow-lg">
            {locale === "ja" ? "三代目土信田商店" : "Sandaime Toshida Shouten"}
          </h1>
          <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto drop-shadow-md font-medium">
            {locale === "ja" ? "鉄板・もんじゃ・居酒屋" : "Teppanyaki, Monja, Izakaya"}
          </p>
        </div>
        <div className="absolute inset-0 bg-black/60 z-10" />
      </section>
    );
  }

  return (
    <section
      className="relative min-h-[85vh] w-full overflow-hidden bg-black flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Image with Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10" />
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out"
                style={{
                  transform: isActive ? "scale(1)" : "scale(1.05)",
                }}
              />

              {/* Text Content Overlay */}
              <div className="absolute inset-0 z-25 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                {banner.showLogo && (
                  <div className="mb-6 flex justify-center animate-fade-in">
                    <div className="bg-background-secondary/80 backdrop-blur-md p-3 rounded-full border border-border/40 shadow-xl max-w-[100px] md:max-w-[120px]">
                      <img src="/images/logo.png" alt="Logo" className="w-full h-auto" />
                    </div>
                  </div>
                )}

                <h1 className="text-4xl md:text-6xl font-jp font-bold text-gold-400 mb-6 drop-shadow-lg tracking-wide leading-tight">
                  {banner.title}
                </h1>

                <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto drop-shadow-md leading-relaxed font-medium">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Desktop Only) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 z-30 p-3 rounded-full bg-black/40 hover:bg-gold-500 text-foreground hover:text-background border border-border/40 hover:border-gold-500 transition-all focus:outline-none items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 z-30 p-3 rounded-full bg-black/40 hover:bg-gold-500 text-foreground hover:text-background border border-border/40 hover:border-gold-500 transition-all focus:outline-none items-center justify-center"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Indicators / Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-gold-500"
                  : "w-2.5 bg-foreground-secondary/40 hover:bg-foreground-secondary/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
