import { MapPin } from 'lucide-react'
import React from 'react'

const Maps = () => {
  return (
    <div className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Workshop</h2>
            <p className="text-gray-600 mb-6">
              Come visit our tailoring workshop in Victoria Island. We offer in-person consultations, 
              fittings, and style advice. Please schedule an appointment before visiting.
            </p>
          </div>
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 relative">
            {/* Map Placeholder - Replace with actual Google Maps iframe */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium">123 Fashion Street, Victoria Island</p>
                <p className="text-gray-600">Lagos, Nigeria</p>
                <a
                  href="https://maps.google.com/?q=Victoria+Island+Lagos+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
  )
}

export default Maps
