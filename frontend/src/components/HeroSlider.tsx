'use client';

import { useEffect, useState } from 'react';
import { HeroSlider as HeroSliderType } from '@/types/hero-slider';
import { getHeroSliders } from '@/services/api';
import { getMediaUrl } from '@/lib/mediaUrl';
import Link from 'next/link';

export default function HeroSlider() {
  const [sliders, setSliders] = useState<HeroSliderType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data = await getHeroSliders();
        setSliders(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch hero sliders:', err);
        setError('Failed to load hero sliders');
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000); // Auto-play every 5 seconds

    return () => clearInterval(interval);
  }, [sliders.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || sliders.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Selamat Datang di Website Desa
            </h1>
            <p className="text-xl md:text-2xl">
              Desa yang Maju, Sejahtera, dan Berbudaya
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlider = sliders[currentIndex];

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Slider Content */}
      <div className="relative w-full h-full">
        {sliders.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Media Layer */}
            {slider.media_type === 'video' ? (
              <video
                src={getMediaUrl(slider.media_url)}
                className="absolute top-0 left-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `url(${getMediaUrl(slider.media_url)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                role="img"
                aria-label={slider.title || 'Hero slider image'}
              />
            )}

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

            {/* Content Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight animate-fade-in-up">
                    {slider.title}
                  </h1>
                  {slider.subtitle && (
                    <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 leading-relaxed opacity-95 animate-fade-in-up animation-delay-200">
                      {slider.subtitle}
                    </p>
                  )}
                  {slider.link_url && slider.link_text && (
                    <Link
                      href={slider.link_url}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 animate-fade-in-up animation-delay-400"
                    >
                      {slider.link_text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 shadow-md ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-60 hover:bg-opacity-90 w-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
