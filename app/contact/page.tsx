'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, Clock, MessageSquare, User, Send, ArrowDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
   const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
        question: "How long does it take to get a custom outfit?",
        answer: "Standard delivery time is 7-14 days depending on the complexity of the design. Rush orders (3-5 days) are available at an additional cost."
    },
    {
        question: "Do you offer international shipping?",
        answer: "Yes, we ship worldwide. International delivery typically takes 10-21 business days and shipping costs vary by location."
    },
    {
        question: "Can I request alterations after receiving my outfit?",
        answer: "We offer free alterations within the first 30 days of delivery. Minor adjustments can be done within 2-3 business days."
    },
    {
        question: "How do I provide my measurements?",
        answer: "You can provide measurements through our online form, visit our workshop for professional measuring, or schedule a virtual fitting session."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers, credit/debit cards, and payment through Flutterwave. A 50% deposit is required to start production."
    },
    {
        question: "Do you offer refunds or exchanges?",
        answer: "Due to the custom nature of our work, we don't offer refunds. However, we guarantee perfect fit and quality. We'll make any necessary adjustments at no extra cost."
    }
    ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, you would send this to your backend
      console.log('Contact form submitted:', data);
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Number',
      details: ['+234 803 220 5341', '+234 901 234 5678'],
      action: 'tel:+2348032205341',
    },
    {
      icon: Mail,
      title: 'Email Address',
      details: ['info@omifemcuts.com', 'support@omifemcuts.com'],
      action: 'mailto:info@omifemcuts.com',
    },
    {
      icon: MapPin,
      title: 'Our Location',
      details: ['123 Fashion Street, Victoria Island', 'Lagos, Nigeria'],
      action: 'https://maps.google.com/?q=Victoria+Island+Lagos+Nigeria',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 AM - 7:00 PM', 'Saturday: 10:00 AM - 5:00 PM', 'Sunday: 12:00 PM - 4:00 PM'],
    },
  ];

  const whatsappMessage = encodeURIComponent(
    'Hello OmifemCuts, I would like to make an inquiry about your tailoring services.'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-sm md:text-xl text-blue-100 max-w-3xl mx-auto">
            We're here to help you create the perfect outfit. Reach out to us for consultations, 
            inquiries, or custom design requests.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-sm md:text-base text-gray-600 mb-8">
                Have questions about our services? Need a custom design consultation? 
                We're just a message away. Our team is ready to assist you with all your tailoring needs.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="h-3 w-3 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-[10.5px] md:text-base text-gray-600 mb-1">{detail}</p>
                        ))}
                        {info.action && (
                          <a
                            href={info.action}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm mt-3 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {info.title.includes('Phone') ? 'Call Now' : 
                             info.title.includes('Email') ? 'Send Email' : 
                             info.title.includes('Location') ? 'Get Directions' : ''}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp Quick Contact */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-4 h-4 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm md:text-xl font-bold">Chat on WhatsApp</h3>
                  <p className="text-sm md:text-base text-green-100">Instant response, 24/7</p>
                </div>
              </div>
              <p className="mb-6 text-sm md:text-base">
                Get instant answers to your questions. Our WhatsApp line is open for quick inquiries, 
                style consultations, and order tracking.
              </p>
              <a
                href={`https://wa.me/2348032205341?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[11px] items-center gap-3 px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                <svg className="h-4 w-4 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                </svg>
                Chat Now on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Fill out the form below and we'll get back to you as soon as possible. 
                For urgent inquiries, please use our WhatsApp line above.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="name"
                      type="text"
                      {...register('name')}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    {...register('subject')}
                    className="w-full px-4 py-3 bg-blue-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="Style Consultation">Style Consultation</option>
                    <option value="Custom Design Request">Custom Design Request</option>
                    <option value="Price Inquiry">Price Inquiry</option>
                    <option value="Delivery Inquiry">Delivery Inquiry</option>
                    <option value="Size & Measurement Help">Size & Measurement Help</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register('message')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your tailoring needs, specific design requirements, or any questions you have..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Please include details like style preferences, occasion, and timeline
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  We typically respond within 2-4 hours during business days
                </p>
              </div>
            </form>
            
          </div>
        </div>

        {/* FAQ Section */}
        
        <div className="mt-16">
            <h2 className="text-xl md:text-3xl font-bold text-center text-gray-900 mb-12">
                Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <button
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={activeIndex === index}
                    aria-controls={`faq-answer-${index}`}
                    >
                    <h3 className="text-base  font-semibold text-gray-900 pr-4">
                        {faq.question}
                    </h3>
                    <span className="flex-shrink-0 text-gray-400">
                        {activeIndex === index ? (
                        <ArrowUp className="w-5 h-5" />
                        ) : (
                        <ArrowDown className="w-5 h-5" />
                        )}
                    </span>
                    </button>
                    
                    <div
                    id={`faq-answer-${index}`}
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                        activeIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                    }`}
                    role="region"
                    aria-hidden={activeIndex !== index}
                    >
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                    </p>
                    </div>
                </div>
                ))}
            </div>
        </div>
        {/* Map Section */}
        
      </div>
    </div>
  );
}

