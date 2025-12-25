import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpeg" 
          alt="Premium men's fashion design" 
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="-mt-20 md:-mt-0 text-2xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Elevate Your Style With 
              <span className="text-blue-400"> Premium Tailoring</span>
            </h1>
            
            <p className="text-md md:text-2xl text-gray-200 mb-8 max-w-2xl">
              Discover the finest men's fashion designs in Nigeria. Custom-tailored outfits that combine tradition with contemporary style.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/styles"
                className="inline-flex items-center justify-center py-2 px-8 lg:py-4 text-md lg:text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                Browse Styles
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link
                href="#services"
                className="inline-flex items-center justify-center py-2 lg:py-4 px-8 text-md lg:text-lg font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all"
              >
                Our Services
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl">
              <div className="text-white">
                <div className="text-lg lg:text-3xl md:text-4xl font-bold lg:mb-2">500+</div>
                <div className="text-sm lg:text-md text-gray-300">Styles Created</div>
              </div>
              
              <div className="text-white">
                <div className=" text-lg lg:text-3xl md:text-4xl font-bold mb-2">2K+</div>
                <div className="text-gray-300">Happy Clients</div>
              </div>
              
              <div className="text-white hidden md:block">
                <div className="text-3xl md:text-4xl font-bold mb-2">5+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}