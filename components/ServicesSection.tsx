import { Scissors, Truck, Shield, Clock, Heart, Star } from 'lucide-react';

const services = [
  {
    icon: Scissors,
    title: 'Custom Tailoring',
    description: 'Perfectly fitted outfits tailored to your exact measurements and style preferences.',
  },
  {
    icon: Clock,
    title: 'Quick Turnaround',
    description: 'Express services available with delivery times as fast as 48 hours.',
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'Premium fabrics and expert craftsmanship with a 100% satisfaction guarantee.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Free delivery within Lagos. Nationwide delivery available across Nigeria.',
  },
  {
    icon: Heart,
    title: 'Style Consultation',
    description: 'Free personal styling consultation to help you choose the perfect outfit.',
  },
  {
    icon: Star,
    title: 'After-Sales Service',
    description: 'Free adjustments and repairs within the first 3 months of purchase.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-6 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            What We Offer
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Premium tailoring services designed for the modern Nigerian man who values quality and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-blue-100 rounded-2xl mb-6">
                  <Icon className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-sm md:text-base text-gray-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Wardrobe?
          </h3>
          <p className="text-sm md:text-base text-blue-100 mb-6 max-w-2xl mx-auto">
            Book a free consultation with our master tailors today and experience premium craftsmanship.
          </p>
          <a
            href={`https://wa.me/2348032205341?text=${encodeURIComponent('Hello OmifemCuts, I would like to book a tailoring consultation.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 text-sm md:text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Book Consultation 
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}