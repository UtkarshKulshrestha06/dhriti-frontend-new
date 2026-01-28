import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Oceanic Academy</h3>
            <p className="text-gray-400 text-sm">
              Empowering students to achieve their dreams in Engineering and Medical fields through expert guidance and personalized mentoring.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ocean-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-ocean-300">About Us</a></li>
              <li><a href="#" className="hover:text-ocean-300">Success Stories</a></li>
              <li><a href="#" className="hover:text-ocean-300">Scholarship Tests</a></li>
              <li><a href="#" className="hover:text-ocean-300">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ocean-300">Courses</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-ocean-300">JEE Main + Advanced</a></li>
              <li><a href="#" className="hover:text-ocean-300">NEET UG</a></li>
              <li><a href="#" className="hover:text-ocean-300">Foundation (Class 9-10)</a></li>
              <li><a href="#" className="hover:text-ocean-300">Distance Learning</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ocean-300">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 text-ocean-400" />
                <span>123 Knowledge Park, Edu City,<br />New Delhi, India 110001</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-ocean-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-ocean-400" />
                <span>admissions@oceanic.edu</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Oceanic Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;