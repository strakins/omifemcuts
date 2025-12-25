import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Omifem<span className="text-blue-400">Cuts</span>
            </h3>
            <p className="text-sm md:text-base text-gray-400 mb-6">
              Premium men's fashion design and tailoring services in Nigeria. 
              Creating custom outfits that reflect your personality and style.
            </p>
            
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/styles"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  All Styles
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-400">Custom Suits</li>
              <li className="text-gray-400">Traditional Wear</li>
              <li className="text-gray-400">Office Wear</li>
              <li className="text-gray-400">Casual Wear</li>
              <li className="text-gray-400">Wedding Attire</li>
              <li className="text-gray-400">Clothing Alterations</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div id="contact">
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  123 Fashion Street, Victoria Island<br />
                  Lagos, Nigeria
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <a
                  href="tel:+2348032205341"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +234 803 220 5341
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a
                  href="mailto:info@omifemcuts.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@omifemcuts.com
                </a>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/2348032205341?text=${encodeURIComponent('Hello OmifemCuts, I need information about your tailoring services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            © {currentYear} OmifemCuts. All rights reserved.
          </p>
          <p className="text-blue-500 italic text-[12px] mt-2">
           <a href="https://strakins-portfolio.vercel.app/" target='_blank'> Designed & Developed by Strakins</a> 
          </p>
        </div>
      </div>
    </footer>
  );
}