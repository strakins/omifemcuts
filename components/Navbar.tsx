'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Menu, X, User, LogOut, LayoutDashboard, MessageSquare, Scissors, Home, Heart, Phone, Star } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items with icons and paths
  const navItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      exactMatch: true 
    },
    { 
      name: 'Styles', 
      href: '/styles', 
      icon: Heart 
    },
    { 
      name: 'Contact Us', 
      href: '/contact', 
      icon: Phone 
    },
  ];

  // Check if a nav item is active
  const isActive = (href, exactMatch = false) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Active link styles
  const activeLinkClass = "text-blue-600 font-semibold relative";
  const inactiveLinkClass = "text-gray-700 hover:text-blue-600 font-medium transition-colors";

  // Active indicator animation styles
  const activeIndicatorClass = "absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full";
  const activeIndicatorAnimation = "animate-slideIn";

  // Prevent rendering during SSR
  if (!mounted) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3">
                <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Omifem<span className="text-blue-600">Cuts</span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative w-10 h-10 mr-3">
                  <div className={`w-full h-full bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 ${isActive('/', true) ? 'scale-110 animate-pulse-glow' : 'group-hover:scale-105'}`}>
                    <Scissors className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  {isActive('/', true) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  )}
                </div>
                <span className="text-xl lg:text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                  Omifem<span className="text-blue-600">Cuts</span>
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exactMatch);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative py-2 px-1 ${active ? activeLinkClass : inactiveLinkClass} transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 transition-transform ${active ? 'scale-110' : ''}`} />
                      {item.name}
                    </div>
                    {active && (
                      <div className={`${activeIndicatorClass} ${activeIndicatorAnimation}`}></div>
                    )}
                  </Link>
                );
              })}

              {user ? (
                <div className="flex items-center space-x-6">
                  {/* Admin Dashboard Link (only for admins) */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-2 px-8 py-2 rounded-lg transition-all duration-300 ${isActive('/admin') ? 'bg-purple-700 scale-105 shadow-lg' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                    >
                      <LayoutDashboard className={`w-4 h-4 transition-transform ${isActive('/admin') ? 'rotate-12' : ''}`} />
                      Admin
                    </Link>
                  )}

                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 ${isActive('/profile') ? 'scale-105' : ''} transition-all duration-300`}>
                      {user.photoURL ? (
                        <div className="relative">
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${isActive('/profile') ? 'border-blue-500 scale-110' : 'border-transparent group-hover:border-blue-300'}`}
                          />
                          {isActive('/profile') && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 transition-all duration-300 ${isActive('/profile') ? 'border-white shadow-lg scale-105' : 'border-white shadow group-hover:shadow-lg'}`}>
                          <User className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <span className={`font-medium transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                        {user.name.split(' ')[0]}
                      </span>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-200 animate-slideIn origin-top">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded-full transition-colors ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className={`relative py-2 px-1 ${isActive('/login') ? activeLinkClass : inactiveLinkClass} transition-all duration-300`}
                  >
                    Login
                    {isActive('/login') && (
                      <div className={`${activeIndicatorClass} ${activeIndicatorAnimation}`}></div>
                    )}
                  </Link>
                  
                  <Link
                    href="/register"
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${isActive('/register') ? 'bg-blue-700 scale-105 shadow-lg' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'} text-white`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
              >
                {isOpen ? (
                  <X className="w-6 h-6 animate-rotateIn" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-slideIn">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exactMatch);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                      {item.name}
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}

                {user ? (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {/* User Info */}
                    <div className={`px-4 py-3 rounded-lg ${isActive('/profile') ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className={`w-12 h-12 rounded-full border-2 ${isActive('/profile') ? 'border-blue-500' : 'border-gray-200'}`}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs mt-1">
                            <span className={`px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                              {user.role}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Dashboard Link */}
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className={`flex items-center justify-between gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin') ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600 font-semibold' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-5 h-5" />
                          Admin Dashboard
                        </div>
                        {isActive('/admin') && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    )}
                    
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Link
                      href="/login"
                      className={`block px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/login') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        Login
                        {isActive('/login') && (
                          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Link>
                    
                    <Link
                      href="/register"
                      className={`block px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/register') ? 'bg-blue-600 text-white border-l-4 border-blue-700 font-semibold' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5" />
                        Register
                        {isActive('/register') && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}