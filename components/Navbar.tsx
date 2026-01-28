
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, UserCircle, LayoutDashboard } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Our Courses', path: '/courses' },
    { name: 'Free Resources', path: '/resources' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          
          {/* LEFT: Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="shrink-0">
                <img 
                  src="https://placehold.co/150x150/0284c7/ffffff?text=DC" 
                  alt="Dhriti Classes Logo" 
                  className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-full shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight leading-none group-hover:text-ocean-700 transition-colors">
                  Dhriti Classes
                </span>
                <span className="text-[10px] font-bold text-ocean-600 tracking-widest uppercase mt-1">
                  Determined for success...
                </span>
              </div>
            </NavLink>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative py-2 text-sm lg:text-base font-bold transition-all duration-300 transform hover:-translate-y-0.5 ${
                      isActive ? 'text-ocean-600' : 'text-slate-600 hover:text-ocean-600'
                    } group`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-ocean-600 transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* RIGHT: Login Button or Dashboard Button */}
          <div className="hidden md:flex items-center">
            {user ? (
               <Link to="/dashboard">
                <Button 
                  variant="primary" 
                  size="md"
                  className="bg-ocean-100 text-ocean-700 hover:bg-ocean-200 shadow-none border border-ocean-200 rounded-full px-6 flex items-center"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
               </Link>
            ) : (
              <Link to="/login">
                <Button 
                  variant="primary" 
                  size="md"
                  className="bg-gradient-to-r from-ocean-600 to-ocean-800 hover:from-ocean-700 hover:to-ocean-900 shadow-lg hover:shadow-xl hover:shadow-ocean-500/30 text-white border-none transform hover:scale-105 transition-all duration-200 rounded-full px-6"
                >
                  <UserCircle className="w-5 h-5 mr-2" />
                  Student Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-2 shadow-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-ocean-50 text-ocean-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <div className="pt-4 mt-2 border-t border-gray-100">
            {user ? (
               <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full">
                <Button className="w-full justify-center bg-ocean-100 text-ocean-700 rounded-full">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full">
                <Button className="w-full justify-center bg-ocean-600 rounded-full">
                  Student Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
